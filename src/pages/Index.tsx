
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, User, BookOpen, Briefcase, Code, Lightbulb, Heart, Settings as SettingsIcon, Search } from 'lucide-react';
import { ReaderPersonas } from '@/components/ReaderPersonas';
import { MultiReviewResults } from '@/components/MultiReviewResults';
import { TitlePreview } from '@/components/TitlePreview';
import Settings from '@/components/Settings';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { Progress } from '@/components/ui/progress';

// 导入所有读者画像数据
import { personas } from '@/components/ReaderPersonas';

interface Persona {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  characteristics: string[];
  color: string;
}

interface Review {
  title: string;
  persona: Persona;
  score: number;
  comment: string;
  tags: string[];
  suggestions: string[];
}

interface VariantTitle {
  title: string;
  angle: string;
  focus: string;
}

// 进度状态枚举
enum ProgressStage {
  IDLE = 'idle',
  CHECKING_INFO = 'checking_info',
  ENRICHING_INFO = 'enriching_info',
  GENERATING_TITLES = 'generating_titles',
  GENERATING_REVIEWS = 'generating_reviews',
  COMPLETED = 'completed'
}

interface ProgressState {
  stage: ProgressStage;
  currentStep: number;
  totalSteps: number;
  currentTitle: string;
  currentPersona: string;
  stageDescription: string;
}

const Index = () => {
  const { config } = useLLMConfig();
  const [showSettings, setShowSettings] = useState(false);
  const [title, setTitle] = useState('');
  const [titlePool, setTitlePool] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>(personas);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedVariants, setGeneratedVariants] = useState<VariantTitle[]>([]);
  
  // 新的进度状态
  const [progressState, setProgressState] = useState<ProgressState>({
    stage: ProgressStage.IDLE,
    currentStep: 0,
    totalSteps: 0,
    currentTitle: '',
    currentPersona: '',
    stageDescription: ''
  });

  // LLM API 调用函数
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
        throw new Error(`API请求失败: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('LLM API调用失败:', error);
      throw error;
    }
  };

  // 处理读者画像选择
  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersonas(prev => {
      if (prev.some(p => p.id === persona.id)) {
        return prev.filter(p => p.id !== persona.id);
      } else {
        return [...prev, persona];
      }
    });
  };

  // 为单个标题和读者画像生成点评
  const generateReviewForTitleAndPersona = async (title: string, persona: Persona): Promise<Review> => {
    try {
      // 更新进度状态
      setProgressState(prev => ({
        ...prev,
        currentTitle: title,
        currentPersona: persona.name,
        stageDescription: `正在为 ${persona.name} 生成点评...`
      }));

      // 生成评论
      const commentSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请用中文回答，控制在100字以内。`;
      const commentUserPrompt = `请对以下文章标题进行点评，给出具体的建议和改进方向。标题：${title}`;
      const comment = await callLLMAPI(commentSystemPrompt, commentUserPrompt);
      
      // 生成标签
      setProgressState(prev => ({
        ...prev,
        stageDescription: `正在为 ${persona.name} 生成标签...`
      }));
      const tagsSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请只返回标签，用逗号分隔，不要其他内容。`;
      const tagsUserPrompt = `为以下文章标题生成3个标签，体现你的特点。标题：${title}`;
      const tagsResponse = await callLLMAPI(tagsSystemPrompt, tagsUserPrompt);
      const tags = tagsResponse.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // 生成建议
      setProgressState(prev => ({
        ...prev,
        stageDescription: `正在为 ${persona.name} 生成建议...`
      }));
      const suggestionsSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请只返回建议，用逗号分隔，不要其他内容。`;
      const suggestionsUserPrompt = `请为以下文章标题提供3个具体的改进建议。标题：${title}`;
      const suggestionsResponse = await callLLMAPI(suggestionsSystemPrompt, suggestionsUserPrompt);
      const suggestions = suggestionsResponse.split(',').map(suggestion => suggestion.trim()).filter(suggestion => suggestion);
      
      // 生成评分
      setProgressState(prev => ({
        ...prev,
        stageDescription: `正在为 ${persona.name} 生成评分...`
      }));
      const scoreSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请只返回数字，不要其他内容。`;
      const scoreUserPrompt = `请为以下文章标题打分（1-10分）。标题：${title}`;
      const scoreResponse = await callLLMAPI(scoreSystemPrompt, scoreUserPrompt);
      const score = parseInt(scoreResponse) || Math.floor(Math.random() * 3) + 7;
      
      return {
        title,
        persona,
        score: Math.max(1, Math.min(10, score)),
        comment: comment,
        tags: tags.length > 0 ? tags : ['实用性强', '可执行'],
        suggestions: suggestions.length > 0 ? suggestions : ['优化表达', '增强吸引力']
      };
    } catch (error) {
      console.error(`为标题"${title}"和读者画像"${persona.name}"生成点评失败:`, error);
      
      // 返回备用点评
      return {
        title,
        persona,
        score: Math.floor(Math.random() * 3) + 7,
        comment: `作为${persona.name}，我认为这个标题${title}有一定的吸引力，但还有改进空间。`,
        tags: ['实用性强', '可执行'],
        suggestions: ['优化表达', '增强吸引力']
      };
    }
  };

  // 重写生成多角度标题的函数，带详细进度
  const generateMultipleTitlesWithProgress = async (): Promise<VariantTitle[]> => {
    if (!title.trim()) return [];
    
    try {
      // 阶段1: 检查信息充足性
      setProgressState({
        stage: ProgressStage.CHECKING_INFO,
        currentStep: 1,
        totalSteps: 5,
        currentTitle: '',
        currentPersona: '',
        stageDescription: '正在检查标题信息充足性...'
      });

      const sufficiencyCheck = await checkInformationSufficiency(title);
      
      // 阶段2: 如果信息不足，进行信息扩充
      let additionalContext = '';
      if (!sufficiencyCheck.isSufficient) {
        setProgressState(prev => ({
          ...prev,
          stage: ProgressStage.ENRICHING_INFO,
          currentStep: 2,
          stageDescription: '正在扩充标题信息...'
        }));
        
        const enrichedInfo = await enrichInformationWithLLM(title);
        if (enrichedInfo) {
          additionalContext = `\n补充信息：${enrichedInfo}`;
        }
      } else {
        setProgressState(prev => ({
          ...prev,
          currentStep: 2
        }));
      }

      // 阶段3: 生成多角度标题
      setProgressState(prev => ({
        ...prev,
        stage: ProgressStage.GENERATING_TITLES,
        currentStep: 3,
        stageDescription: '正在生成多角度标题变体...'
      }));

      const systemPrompt = `你是一个专业的标题优化专家，擅长从不同角度和侧重点生成多样化的标题。你的唯一输出必须是JSON数组，不要包含任何额外的文本或Markdown代码块。`;
      const userPrompt = `基于以下标题，生成5个不同角度和侧重点的标题变体，确保多样性：\n\n原标题：${title}${additionalContext}\n\n请从以下角度考虑：\n1. 情感角度 - 激发读者情感共鸣\n2. 实用角度 - 强调实用价值和可操作性\n3. 好奇角度 - 引发读者好奇心\n4. 权威角度 - 体现专业性和权威性\n5. 故事角度 - 用故事化表达吸引读者\n\n你的输出必须是一个JSON数组，格式如下：\n[\n  {\n    "title": "生成的标题",\n    "angle": "角度描述",\n    "focus": "侧重点描述"\n  }\n]`;
      const response = await callLLMAPI(systemPrompt, userPrompt);
      
      let jsonString = response;
      // 尝试从Markdown代码块中提取JSON
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      try {
        const parsedTitles = JSON.parse(jsonString);
        if (Array.isArray(parsedTitles)) {
          // 进一步验证每个对象是否符合 VariantTitle 接口
          const validatedTitles: VariantTitle[] = parsedTitles.filter((item: VariantTitle) => 
            typeof item === 'object' && item !== null &&
            typeof item.title === 'string' &&
            typeof item.angle === 'string' &&
            typeof item.focus === 'string'
          );
          
          if (validatedTitles.length === 0 && parsedTitles.length > 0) {
            // 如果解析出内容但都不符合结构，则视为解析失败
            throw new Error('解析的JSON对象结构不符合预期');
          }

          // 步进式进度显示
          for (let i = 0; i < validatedTitles.length; i++) {
            setProgressState(prev => ({
              ...prev,
              currentStep: 3 + (i + 1) / validatedTitles.length,
              stageDescription: `正在生成第 ${i + 1} 个标题变体...`
            }));
            setGeneratedVariants(validatedTitles.slice(0, i + 1));
            await new Promise(r => setTimeout(r, 300)); // 模拟进度
          }
          return validatedTitles;
        } else {
          throw new Error('返回格式不正确或不是数组');
        }
      } catch (parseError) {
        console.error('JSON解析或验证失败:', parseError);
        // JSON解析失败，使用备用标题
        const fallback = generateFallbackTitles(title).map((t, i) => ({ title: t, angle: '', focus: '' }));
        for (let i = 0; i < fallback.length; i++) {
          setProgressState(prev => ({
            ...prev,
            currentStep: 3 + (i + 1) / fallback.length,
            stageDescription: `正在生成备用标题 ${i + 1}...`
          }));
          setGeneratedVariants(fallback.slice(0, i + 1));
          await new Promise(r => setTimeout(r, 200));
        }
        return fallback;
      }
    } catch (error) {
      const fallback = generateFallbackTitles(title).map((t, i) => ({ title: t, angle: '', focus: '' }));
      for (let i = 0; i < fallback.length; i++) {
        setProgressState(prev => ({
          ...prev,
          currentStep: 3 + (i + 1) / fallback.length,
          stageDescription: `正在生成备用标题 ${i + 1}...`
        }));
        setGeneratedVariants(fallback.slice(0, i + 1));
        await new Promise(r => setTimeout(r, 200));
      }
      return fallback;
    }
  };

  // 检查信息充足性
  const checkInformationSufficiency = async (title: string): Promise<{ isSufficient: boolean; reason: string }> => {
    try {
      const systemPrompt = `你是一个信息充足性评估专家。请分析给定的标题是否包含足够的信息来生成多样化的标题变体。`;
      
      const userPrompt = `请评估以下标题的信息充足性：

标题：${title}

评估标准：
1. 是否包含具体的主题或领域信息
2. 是否包含明确的目标受众
3. 是否包含具体的价值主张或核心观点
4. 是否包含足够的上下文信息

请返回JSON格式：
{
  "isSufficient": true/false,
  "reason": "详细说明原因"
}`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      
      try {
        const result = JSON.parse(response);
        return {
          isSufficient: result.isSufficient || false,
          reason: result.reason || '无法解析评估结果'
        };
      } catch (parseError) {
        // 如果JSON解析失败，使用简单的关键词判断
        const hasKeywords = title.length > 10 && 
          (title.includes('如何') || title.includes('为什么') || title.includes('什么') || 
           title.includes('技巧') || title.includes('方法') || title.includes('指南'));
        
        return {
          isSufficient: hasKeywords,
          reason: hasKeywords ? '标题包含足够的关键信息' : '标题信息不足，需要补充更多上下文'
        };
      }
    } catch (error) {
      console.error('信息充足性评估失败:', error);
      return {
        isSufficient: false,
        reason: '评估失败，建议补充信息'
      };
    }
  };

  // 使用LLM扩充信息
  const enrichInformationWithLLM = async (title: string): Promise<string> => {
    try {
      const systemPrompt = `你是一个信息扩充专家，擅长分析标题并补充相关的背景信息、上下文和细节，使标题更加丰富和具体。`;

      const userPrompt = `请分析以下标题，并补充相关的背景信息、上下文和细节，使标题更加丰富和具体：

标题：${title}

请从以下方面补充信息：
1. 相关的背景知识和上下文
2. 目标受众的具体特征
3. 相关的行业趋势或热点
4. 具体的价值主张或核心观点
5. 相关的数据、案例或示例

请返回简洁但信息丰富的补充内容，不要超过200字。`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      return response.trim();
    } catch (error) {
      console.error('LLM信息扩充失败:', error);
      return '';
    }
  };

  // 生成备用标题
  const generateFallbackTitles = (originalTitle: string): string[] => {
    const angles = [
      '情感角度版本',
      '实用角度版本', 
      '好奇角度版本',
      '权威角度版本',
      '故事角度版本'
    ];

    return angles.map((angle, index) => `${originalTitle} - ${angle}${index + 1}`);
  };

  // 获取进度百分比
  const getProgressPercentage = (): number => {
    if (progressState.totalSteps === 0) return 0;
    return (progressState.currentStep / progressState.totalSteps) * 100;
  };

  // 获取阶段描述
  const getStageDescription = (): string => {
    switch (progressState.stage) {
      case ProgressStage.CHECKING_INFO:
        return '检查信息充足性';
      case ProgressStage.ENRICHING_INFO:
        return '扩充标题信息';
      case ProgressStage.GENERATING_TITLES:
        return '生成多角度标题';
      case ProgressStage.GENERATING_REVIEWS:
        return '生成AI点评';
      case ProgressStage.COMPLETED:
        return '生成完成';
      default:
        return '';
    }
  };

  // 合并的生成函数：先生成多角度标题，再生成点评
  const handleGenerateTitlesAndReviews = async () => {
    if (!title.trim() || !selectedPersonas.length) return;
    setIsGenerating(true);
    setError('');
    setReviews([]);
    setGeneratedVariants([]);
    
    try {
      // 计算总步骤数
      const totalSteps = 5 + (selectedPersonas.length * 4); // 标题生成5步 + 每个画像4步点评
      
      // 生成多角度标题（带进度）
      const generatedTitles = await generateMultipleTitlesWithProgress();
      setTitlePool([title, ...generatedTitles.map((item: VariantTitle) => item.title)].filter(t => t.trim()));
      
      // 阶段4: 生成点评
      setProgressState(prev => ({
        ...prev,
        stage: ProgressStage.GENERATING_REVIEWS,
        currentStep: 5,
        totalSteps,
        stageDescription: '正在生成AI点评...'
      }));

      const allTitles = [title, ...generatedTitles.map((item: VariantTitle) => item.title)].filter(t => t.trim());
      const allReviews: Review[] = [];
      
      let reviewStep = 5;
      for (const titleItem of allTitles) {
        for (const persona of selectedPersonas) {
          const review = await generateReviewForTitleAndPersona(titleItem, persona);
          allReviews.push(review);
          reviewStep++;
          setProgressState(prev => ({
            ...prev,
            currentStep: reviewStep,
            stageDescription: `正在生成点评 (${allReviews.length}/${allTitles.length * selectedPersonas.length})`
          }));
        }
      }
      
      const sortedReviews = allReviews.sort((a, b) => b.score - a.score);
      setReviews(sortedReviews);
      
      // 完成
      setProgressState(prev => ({
        ...prev,
        stage: ProgressStage.COMPLETED,
        currentStep: totalSteps,
        stageDescription: '生成完成！'
      }));
      
    } catch (error) {
      setError('生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
      // 延迟重置进度状态
      setTimeout(() => {
        setProgressState({
          stage: ProgressStage.IDLE,
          currentStep: 0,
          totalSteps: 0,
          currentTitle: '',
          currentPersona: '',
          stageDescription: ''
        });
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <Card className="w-full max-w-xl p-8 rounded-3xl shadow-2xl bg-white/80 backdrop-blur">
        {/* 顶部标题 */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-7 w-7 text-purple-600" />
          <h2 className="text-2xl font-bold">标题生成器</h2>
        </div>
        {/* 搜索输入+按钮 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="请输入你的文章标题..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full text-lg px-4 py-3 rounded-full border-2 border-gray-200 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button
            onClick={handleGenerateTitlesAndReviews}
            disabled={!title.trim() || isGenerating}
            className="rounded-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex items-center gap-2"
          >
            {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? '生成中...' : '生成'}
          </Button>
        </div>
        
        {/* 详细进度显示 */}
        {isGenerating && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                {getStageDescription()}
              </span>
              <span className="text-xs text-blue-600">
                {Math.round(getProgressPercentage())}%
              </span>
            </div>
            <Progress 
              value={getProgressPercentage()} 
              className="h-2 mb-2"
            />
            <div className="text-xs text-blue-600 space-y-1">
              <p>{progressState.stageDescription}</p>
              {progressState.currentTitle && (
                <p>当前标题: {progressState.currentTitle}</p>
              )}
              {progressState.currentPersona && (
                <p>当前画像: {progressState.currentPersona}</p>
              )}
              <p>步骤: {Math.round(progressState.currentStep)} / {progressState.totalSteps}</p>
            </div>
          </div>
        )}
        
        {/* 变体标题展示 */}
        {generatedVariants.length > 0 && (
          <div className="mt-6 space-y-3">
            {generatedVariants.map((item, idx) => (
              <Card key={idx} className="p-4 rounded-xl bg-gray-50 flex flex-col gap-1">
                <span className="font-semibold">{item.title}</span>
                {(item.angle || item.focus) && (
                  <span className="text-xs text-gray-500">{item.angle} {item.focus && `· ${item.focus}`}</span>
                )}
              </Card>
            ))}
          </div>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* 读者画像选择和AI点评（可选，保留原有功能） */}
        <div className="mt-8">
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">选择读者画像</h2>
              {selectedPersonas.length > 0 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {selectedPersonas.length} 个已选择
                </Badge>
              )}
            </div>
            <ReaderPersonas 
              selectedPersonas={selectedPersonas}
              onSelectPersona={handleSelectPersona}
            />
          </Card>
          {/* 点评结果 */}
          {reviews.length > 0 && (
            <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-red-500" />
                <h2 className="text-xl font-semibold">AI点评</h2>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {reviews.length} 个点评
                </Badge>
              </div>
              <MultiReviewResults 
                reviews={reviews} 
                onRegenerate={handleGenerateTitlesAndReviews}
              />
            </Card>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Index;
