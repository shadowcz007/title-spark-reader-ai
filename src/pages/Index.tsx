
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, User, BookOpen, Briefcase, Code, Lightbulb, Heart, Settings as SettingsIcon } from 'lucide-react';
import { ReaderPersonas } from '@/components/ReaderPersonas';
import { MultiReviewResults } from '@/components/MultiReviewResults';
import { TitlePreview } from '@/components/TitlePreview';
import Settings from '@/components/Settings';
import { useLLMConfig } from '@/hooks/use-llm-config';

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

const Index = () => {
  const { config } = useLLMConfig();
  const [showSettings, setShowSettings] = useState(false);
  const [title, setTitle] = useState('');
  const [titlePool, setTitlePool] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>(personas);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

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
      // 生成评论
      const commentSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请用中文回答，控制在100字以内。`;
      const commentUserPrompt = `请对以下文章标题进行点评，给出具体的建议和改进方向。标题：${title}`;
      const comment = await callLLMAPI(commentSystemPrompt, commentUserPrompt);
      
      // 生成标签
      const tagsSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请只返回标签，用逗号分隔，不要其他内容。`;
      const tagsUserPrompt = `为以下文章标题生成3个标签，体现你的特点。标题：${title}`;
      const tagsResponse = await callLLMAPI(tagsSystemPrompt, tagsUserPrompt);
      const tags = tagsResponse.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // 生成建议
      const suggestionsSystemPrompt = `你是一个${persona.name}，${persona.description}。你的特点是：${persona.characteristics.join('、')}。请只返回建议，用逗号分隔，不要其他内容。`;
      const suggestionsUserPrompt = `请为以下文章标题提供3个具体的改进建议。标题：${title}`;
      const suggestionsResponse = await callLLMAPI(suggestionsSystemPrompt, suggestionsUserPrompt);
      const suggestions = suggestionsResponse.split(',').map(suggestion => suggestion.trim()).filter(suggestion => suggestion);
      
      // 生成评分
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

  // 批量生成点评
  const handleGenerateReviews = async () => {
    if (!titlePool.length || !selectedPersonas.length) return;
    
    setIsGenerating(true);
    setError('');
    setReviews([]);
    
    try {
      const allReviews: Review[] = [];
      
      // 遍历每个标题和读者画像组合
      for (const title of titlePool) {
        for (const persona of selectedPersonas) {
          const review = await generateReviewForTitleAndPersona(title, persona);
          allReviews.push(review);
        }
      }
      
      // 对点评结果进行排序（按评分降序）
      const sortedReviews = allReviews.sort((a, b) => b.score - a.score);
      setReviews(sortedReviews);
    } catch (error) {
      console.error('批量生成点评失败:', error);
      setError('生成点评失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 头部 */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              读者模拟器
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            基于不同读者画像，智能点评你的文章标题吸引力
          </p>
          
          {/* 设置按钮 */}
          <div className="mt-4">
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-xl flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              设置
            </Button>
          </div>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="max-w-2xl mx-auto mb-8">
            <Settings />
          </div>
        )}

        {/* 主体内容 */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：标题输入 */}
            <div className="lg:col-span-1">
              <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold">输入标题</h2>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="请输入你的文章标题..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg p-4 border-2 border-purple-200 focus:border-purple-500 rounded-xl"
                  />
                  {title && <TitlePreview title={title} onTitlePoolChange={setTitlePool} />}
                </div>
              </Card>

              {/* 读者画像选择 */}
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
            </div>

            {/* 右侧：点评结果 */}
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <h2 className="text-xl font-semibold">AI点评</h2>
                    {reviews.length > 0 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {reviews.length} 个点评
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={handleGenerateReviews}
                    disabled={!titlePool.length || !selectedPersonas.length || isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGenerating ? 'AI生成中...' : '生成点评'}
                  </Button>
                </div>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {!titlePool.length || !selectedPersonas.length ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">请输入标题并选择读者画像</p>
                    <p className="text-sm">我们将为你生成专业的点评建议</p>
                    {titlePool.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          标题池子：{titlePool.length} 个标题
                        </p>
                      </div>
                    )}
                    {selectedPersonas.length > 0 && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          已选择：{selectedPersonas.length} 个读者画像
                        </p>
                      </div>
                    )}
                  </div>
                ) : reviews.length > 0 ? (
                  <MultiReviewResults 
                    reviews={reviews} 
                    onRegenerate={handleGenerateReviews}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Lightbulb className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">点击生成点评按钮</p>
                    <p className="text-sm">
                      将为 {titlePool.length} 个标题 × {selectedPersonas.length} 个读者画像生成点评
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
