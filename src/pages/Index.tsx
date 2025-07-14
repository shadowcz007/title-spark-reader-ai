
import React, { useState } from 'react';
import { Card, Button, Input, Badge, Progress } from '@/ui';
import { Sparkles, RefreshCw, User, BookOpen, Briefcase, Code, Lightbulb, Heart, Settings as SettingsIcon, Search, XCircle, Users } from 'lucide-react'; // Import XCircle for close button
import { ReaderPersonas } from '@/components/ReaderPersonas';
import { MultiReviewResults } from '@/components/MultiReviewResults';
import { TitlePreview } from '@/components/TitlePreview';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { ProgressStage, ProgressState, Persona, Review } from '@/types';
import InputPage from '../pages/InputPage';
import ProgressPage from '../pages/ProgressPage';
import ResultsPage from '../pages/ResultsPage';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { enrichInformationWithMCP } from '@/lib/utils';
import { checkInformationSufficiency, generateMultipleTitlesWithProgress, VariantTitle } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { prompts, Language } from '../prompts';

// Import all reader persona data

const Index = () => {
  const { t } = useTranslation();
  const { config } = useLLMConfig();
  const navigate = useNavigate();
  
  // New progress state
  const [progressState, setProgressState] = useState<ProgressState>({
    stage: ProgressStage.IDLE,
    currentStep: 0,
    totalSteps: 0,
    currentTitle: '',
    currentPersona: '',
    stageDescription: ''
  });

  // Handle settings navigation
  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // LLM API call function
  const callLLMAPI = async (systemPrompt: string, userPrompt: string) => {
    try {
      const response = await fetch(config.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM API call failed:', error);
      throw error;
    }
  };

  // Handle reader persona selection
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonas(prev => {
      if (prev.some(p => p.id === persona.id)) {
        return prev.filter(p => p.id !== persona.id);
      } else {
        return [...prev, persona];
      }
    });
  };

  // Generate review for single title and reader persona
  const generateReviewForTitleAndPersona = async (title: string, persona: Persona): Promise<Review> => {
    try {
      const lang = i18n.language as Language;

      // Update progress state
      setProgressState(prev => ({
        ...prev,
        currentTitle: title,
        currentPersona: persona.name,
        stageDescription: t('generatingReviewFor', { name: persona.name })
      }));

      // Generate comment
      const commentSystemPrompt = prompts.reviewGeneration.comment.system(persona, lang);
      const commentUserPrompt = prompts.reviewGeneration.comment.user(title, lang);
      const comment = await callLLMAPI(commentSystemPrompt, commentUserPrompt);
      
      // Generate tags
      setProgressState(prev => ({
        ...prev,
        stageDescription: t('generatingTagsFor', { name: persona.name })
      }));
      const tagsSystemPrompt = prompts.reviewGeneration.tags.system(persona, lang);
      const tagsUserPrompt = prompts.reviewGeneration.tags.user(title, lang);
      const tagsResponse = await callLLMAPI(tagsSystemPrompt, tagsUserPrompt);
      const tags = tagsResponse.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Generate suggestions
      setProgressState(prev => ({
        ...prev,
        stageDescription: t('generatingSuggestionsFor', { name: persona.name })
      }));
      const suggestionsSystemPrompt = prompts.reviewGeneration.suggestions.system(persona, lang);
      const suggestionsUserPrompt = prompts.reviewGeneration.suggestions.user(title, lang);
      const suggestionsResponse = await callLLMAPI(suggestionsSystemPrompt, suggestionsUserPrompt);
      const suggestions = suggestionsResponse.split(',').map(suggestion => suggestion.trim()).filter(suggestion => suggestion);
      
      // Generate score
      setProgressState(prev => ({
        ...prev,
        stageDescription: t('generatingScoreFor', { name: persona.name })
      }));
      const scoreSystemPrompt = prompts.reviewGeneration.score.system(persona, lang);
      const scoreUserPrompt = prompts.reviewGeneration.score.user(title, lang);
      const scoreResponse = await callLLMAPI(scoreSystemPrompt, scoreUserPrompt);
      const score = parseInt(scoreResponse) || Math.floor(Math.random() * 3) + 7;
      
      return {
        title,
        persona,
        score: Math.max(1, Math.min(10, score)),
        comment: comment,
        tags: tags.length > 0 ? tags : [t('practical'), t('actionable')],
        suggestions: suggestions.length > 0 ? suggestions : [t('optimizeExpression'), t('enhanceAppeal')]
      };
    } catch (error) {
      console.error(`Failed to generate review for title "${title}" and persona "${persona.name}":`, error);
      
      // Return fallback review
      return {
        title,
        persona,
        score: Math.floor(Math.random() * 3) + 7,
        comment: t('fallbackReviewComment', { name: persona.name, title: title }),
        tags: [t('practical'), t('actionable')],
        suggestions: [t('optimizeExpression'), t('enhanceAppeal')]
      };
    }
  };

  // 移除本地 generateMultipleTitlesWithProgress，直接用 utils.ts 的

  // Removed local checkInformationSufficiency, using unified version from utils.ts

  // Fallback title generation function
  const generateFallbackTitles = (originalTitle: string): VariantTitle[] => {
    return [
      { title: originalTitle, angle: t('angleOriginal'), focus: '' },
      { title: `${originalTitle}: ${t('deepAnalysis')}`, angle: t('anglePractical'), focus: t('focusDepth') },
      { title: `${t('exploring')} ${originalTitle}`, angle: t('angleCuriosity'), focus: t('focusExploration') },
      { title: `${originalTitle}: ${t('futureTrends')}`, angle: t('angleEmotional'), focus: t('focusTrends') },
      { title: `${t('theStoryOf')} ${originalTitle}`, angle: t('angleStory'), focus: t('focusStory') },
    ];
  };

  // Page state management
  const [currentPage, setCurrentPage] = useState('input'); // 'input', 'personas', 'progress', 'results'
  const [title, setTitle] = useState('');
  const [titlePool, setTitlePool] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedVariants, setGeneratedVariants] = useState<VariantTitle[]>([]);
  const [forceSupplement, setForceSupplement] = useState(false);
  

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleForceSupplementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForceSupplement(e.target.checked);
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      setError(t('pleaseEnterTitleOrTheme'));
      return;
    }
    setError('');
    setIsGenerating(true);
    setCurrentPage('personas'); // First jump to reader persona selection page
  };

  const handlePersonasContinue = async () => {
    if (selectedPersonas.length === 0) {
      setError(t('pleaseSelectAtLeastOneReaderPersona'));
      return;
    }
    setError('');
    setCurrentPage('progress'); // Jump to progress page
    
    // Asynchronously execute generation logic
    try {
      // Start generating title variants
      setProgressState({
        stage: ProgressStage.CHECKING_INFO,
        currentStep: 1,
        totalSteps: 5,
        currentTitle: title,
        currentPersona: '',
        stageDescription: t('checkingInfoSufficiency')
      });

      const variants = await generateMultipleTitlesWithProgress(
        title,
        config.apiKey,
        config.apiUrl,
        config.model,
        config.mcpUrl,
        generateFallbackTitles,
        i18n.language as Language
      );
      const allReviews: Review[] = [];
      const totalReviews = variants.length * selectedPersonas.length;
      let completedReviews = 0;

      // Start generating reviews
      setProgressState(prev => ({
        ...prev,
        stage: ProgressStage.GENERATING_REVIEWS,
        currentStep: completedReviews,
        totalSteps: totalReviews,
        currentTitle: variants[0]?.title || title,
        currentPersona: selectedPersonas[0]?.name || '',
        stageDescription: t('generatingReviewForPercent', { title: variants[0]?.title || title, percent: 0 })
      }));

      for (const variant of variants) {
        for (const persona of selectedPersonas) {
          const review = await generateReviewForTitleAndPersona(variant.title, persona);
          allReviews.push(review);
          completedReviews++;
          setProgressState(prev => ({
            ...prev,
            currentStep: completedReviews,
            currentTitle: variant.title,
            currentPersona: persona.name,
            stageDescription: t('generatingReviewForPercent', { title: variant.title, percent: Math.floor((completedReviews / totalReviews) * 100) })
          }));
        }
      }
      setReviews(allReviews);

      // Group reviews by title for ResultsPage
      const groupedByTitle = allReviews.reduce((acc, review) => {
        if (!acc[review.title]) {
          acc[review.title] = [];
        }
        acc[review.title].push(review);
        return acc;
      }, {} as Record<string, Review[]>);

      setProgressState(prev => ({
        ...prev,
        stage: ProgressStage.COMPLETED,
        currentStep: totalReviews,
        totalSteps: totalReviews,
        currentTitle: '',
        currentPersona: '',
        stageDescription: t('analysisCompleted')
      }));
      
      // Delay jumping to results page to let users see completion status
      setTimeout(() => {
        setCurrentPage('results');
      }, 2000);
      
    } catch (err) {
      console.error("Error occurred during generation:", err);
      setError(t('errorDuringGeneration'));
      setIsGenerating(false);
      setCurrentPage('input'); // Return to input page when error occurs
    }
  };

  // Regeneration logic
  const handleRegenerate = () => {
    setTitle('');
    setTitlePool([]);
    setSelectedPersonas([]); // Reset to all personas or default selection
    setReviews([]);
    setIsGenerating(false);
    setError('');
    setGeneratedVariants([]);
    setProgressState({
      stage: ProgressStage.IDLE,
      currentStep: 0,
      totalSteps: 0,
      currentTitle: '',
      currentPersona: '',
      stageDescription: ''
    });
    setCurrentPage('input');
  };


  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-b from-green-50 via-emerald-50 to-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <Header currentPage="simulate" onSettingsClick={handleSettingsClick} />
      <div className="layout-container flex h-full grow flex-col">
        {/* Only render content part, popup settings managed by App.tsx */}
        {currentPage === 'input' && (
          <InputPage
            title={title}
            onTitleChange={handleTitleChange}
            onGenerate={handleGenerate}
            forceSupplement={forceSupplement}
            onForceSupplementChange={handleForceSupplementChange}
          />
        )}
        {currentPage === 'personas' && (
          <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
              {/* Main card container */}
              <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
                {/* Top info bar */}
                <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
                  <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
                    <Users className="h-4 w-4 text-green-600 mr-2" />
                    <span>{t('select_reader_personas_info')}</span>
                  </div>
                  <div className="flex items-center text-[#6a7681]">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>{t('powered_by', { model: config.model })}</span>
                  </div>
                </div>

                {/* Main content card */}
                <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
                  <h2 className="text-sm font-medium text-[#6a7681] mb-2">{t('readerSimulator')}</h2>
                  <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
                    {t('select_reader_personas')}
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3">
                    <ReaderPersonas 
                      selectedPersonas={selectedPersonas}
                      onSelectPersona={handleSelectPersona}
                    />
                  </div>
                </div>

                {/* Continue button */}
                <div className="flex justify-center">
                  <Button
                    className="bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                    onClick={handlePersonasContinue}
                  >
                    <span>{t('continue_analysis')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'progress' && (
          <div className="relative">
            <ProgressPage progressState={progressState} />
           
          </div>
        )}
        {currentPage === 'results' && (
          <ResultsPage 
            results={reviews}
          />
        )}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Index;
