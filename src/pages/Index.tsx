
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

// Import all reader persona data
import { personas } from '@/components/ReaderPersonas';

const Index = () => {
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
      // Update progress state
      setProgressState(prev => ({
        ...prev,
        currentTitle: title,
        currentPersona: persona.name,
        stageDescription: `Generating review for ${persona.name}...`
      }));

      // Generate comment
      const commentSystemPrompt = `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please answer in English, keep it within 100 words.`;
      const commentUserPrompt = `Please provide feedback on the following article title, giving specific suggestions and improvement directions. Title: ${title}`;
      const comment = await callLLMAPI(commentSystemPrompt, commentUserPrompt);
      
      // Generate tags
      setProgressState(prev => ({
        ...prev,
        stageDescription: `Generating tags for ${persona.name}...`
      }));
      const tagsSystemPrompt = `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return tags, separated by commas, no other content.`;
      const tagsUserPrompt = `Generate 3 tags for the following article title that reflect your characteristics. Title: ${title}`;
      const tagsResponse = await callLLMAPI(tagsSystemPrompt, tagsUserPrompt);
      const tags = tagsResponse.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Generate suggestions
      setProgressState(prev => ({
        ...prev,
        stageDescription: `Generating suggestions for ${persona.name}...`
      }));
      const suggestionsSystemPrompt = `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return suggestions, separated by commas, no other content.`;
      const suggestionsUserPrompt = `Please provide 3 specific improvement suggestions for the following article title. Title: ${title}`;
      const suggestionsResponse = await callLLMAPI(suggestionsSystemPrompt, suggestionsUserPrompt);
      const suggestions = suggestionsResponse.split(',').map(suggestion => suggestion.trim()).filter(suggestion => suggestion);
      
      // Generate score
      setProgressState(prev => ({
        ...prev,
        stageDescription: `Generating score for ${persona.name}...`
      }));
      const scoreSystemPrompt = `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return a number, no other content.`;
      const scoreUserPrompt = `Please rate the following article title (1-10 points). Title: ${title}`;
      const scoreResponse = await callLLMAPI(scoreSystemPrompt, scoreUserPrompt);
      const score = parseInt(scoreResponse) || Math.floor(Math.random() * 3) + 7;
      
      return {
        title,
        persona,
        score: Math.max(1, Math.min(10, score)),
        comment: comment,
        tags: tags.length > 0 ? tags : ['Practical', 'Actionable'],
        suggestions: suggestions.length > 0 ? suggestions : ['Optimize expression', 'Enhance appeal']
      };
    } catch (error) {
      console.error(`Failed to generate review for title "${title}" and persona "${persona.name}":`, error);
      
      // Return fallback review
      return {
        title,
        persona,
        score: Math.floor(Math.random() * 3) + 7,
        comment: `As a ${persona.name}, I think this title "${title}" has some appeal but room for improvement.`,
        tags: ['Practical', 'Actionable'],
        suggestions: ['Optimize expression', 'Enhance appeal']
      };
    }
  };

  // 移除本地 generateMultipleTitlesWithProgress，直接用 utils.ts 的

  // Check information sufficiency function
  const checkInformationSufficiency = async (title: string): Promise<{ isSufficient: boolean; reason: string }> => {
    const systemPrompt = `You are an information analysis expert. Please judge whether the information provided by the user is sufficient for generating article titles, and give reasons. If the information is insufficient, please propose specific content that needs to be supplemented. Your output format is JSON: {"isSufficient": true/false, "reason": "reason"}.`;
    const userPrompt = `The title provided by the user is: ${title}`;
    try {
      const response = await callLLMAPI(systemPrompt, userPrompt);
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      } else {
        return { isSufficient: true, reason: "Unable to parse, default to sufficient" };
      }
    } catch (error) {
      console.error('Failed to check information sufficiency:', error);
      return { isSufficient: true, reason: 'Check failed, default to sufficient' };
    }
  };

  // Fallback title generation function
  const generateFallbackTitles = (originalTitle: string): VariantTitle[] => {
    return [
      { title: originalTitle, angle: 'Original', focus: '' },
      { title: `${originalTitle}: Deep Analysis`, angle: 'Practical angle', focus: 'Depth' },
      { title: `Exploring ${originalTitle}`, angle: 'Curiosity angle', focus: 'Exploration' },
      { title: `${originalTitle}: Future Trends`, angle: 'Emotional angle', focus: 'Trends' },
      { title: `The Story of ${originalTitle}`, angle: 'Story angle', focus: 'Story' },
    ];
  };

  // Page state management
  const [currentPage, setCurrentPage] = useState('input'); // 'input', 'personas', 'progress', 'results'
  const [title, setTitle] = useState('');
  const [titlePool, setTitlePool] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>(personas);
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
      setError('Please enter a title or theme.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setCurrentPage('personas'); // First jump to reader persona selection page
  };

  const handlePersonasContinue = async () => {
    if (selectedPersonas.length === 0) {
      setError('Please select at least one reader persona.');
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
        stageDescription: 'Checking title information sufficiency...'
      });

      const variants = await generateMultipleTitlesWithProgress(
        title,
        config.apiKey,
        config.apiUrl,
        config.model,
        config.mcpUrl,
        generateFallbackTitles
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
        stageDescription: `Generating review for ${variants[0]?.title || title} (0%)...`
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
            stageDescription: `Generating review for ${variant.title} (${Math.floor((completedReviews / totalReviews) * 100)}%)`
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
        stageDescription: 'Analysis completed! All title variants have been scored by multiple personas'
      }));
      
      // Delay jumping to results page to let users see completion status
      setTimeout(() => {
        setCurrentPage('results');
      }, 2000);
      
    } catch (err) {
      console.error("Error occurred during generation:", err);
      setError("An error occurred during generation, please try again.");
      setIsGenerating(false);
      setCurrentPage('input'); // Return to input page when error occurs
    }
  };

  // Regeneration logic
  const handleRegenerate = () => {
    setTitle('');
    setTitlePool([]);
    setSelectedPersonas(personas); // Reset to all personas or default selection
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
                    <span>Select reader personas for precise analysis <span className="font-bold text-[#121416]">11 personas</span></span>
                  </div>
                  <div className="flex items-center text-[#6a7681]">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span>Powered by {config.model}</span>
                  </div>
                </div>

                {/* Main content card */}
                <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
                  <h2 className="text-sm font-medium text-[#6a7681] mb-2">Reader Simulator</h2>
                  <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
                    Select Reader Personas
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
                    <span>Continue Analysis</span>
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
