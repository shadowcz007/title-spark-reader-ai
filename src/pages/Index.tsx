
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, User, BookOpen, Briefcase, Code, Lightbulb, Heart } from 'lucide-react';
import { ReaderPersonas } from '@/components/ReaderPersonas';
import { ReviewGenerator } from '@/components/ReviewGenerator';
import { TitlePreview } from '@/components/TitlePreview';

// LLM API 配置
const LLM_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const LLM_API_KEY = 'sk-pfoybguqznavgchjhsmmxtiantbkvabehiwxvsidfmqflzvl';
const LLM_MODEL = 'THUDM/GLM-4-9B-0414';

// LLM API 调用函数
const callLLMAPI = async (systemPrompt: string, userPrompt: string) => {
  try {
    const response = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
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

const Index = () => {
  const [title, setTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [review, setReview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReview = async () => {
    if (!title.trim() || !selectedPersona) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // 生成评论
      const commentSystemPrompt = `你是一个${selectedPersona.name}，${selectedPersona.description}。你的特点是：${selectedPersona.characteristics.join('、')}。请用中文回答，控制在100字以内。`;
      const commentUserPrompt = `请对以下文章标题进行点评，给出具体的建议和改进方向。标题：${title}`;
      const comment = await callLLMAPI(commentSystemPrompt, commentUserPrompt);
      
      // 生成标签
      const tagsSystemPrompt = `你是一个${selectedPersona.name}，${selectedPersona.description}。你的特点是：${selectedPersona.characteristics.join('、')}。请只返回标签，用逗号分隔，不要其他内容。`;
      const tagsUserPrompt = `为以下文章标题生成3个标签，体现你的特点。标题：${title}`;
      const tagsResponse = await callLLMAPI(tagsSystemPrompt, tagsUserPrompt);
      const tags = tagsResponse.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // 生成建议
      const suggestionsSystemPrompt = `你是一个${selectedPersona.name}，${selectedPersona.description}。你的特点是：${selectedPersona.characteristics.join('、')}。请只返回建议，用逗号分隔，不要其他内容。`;
      const suggestionsUserPrompt = `请为以下文章标题提供3个具体的改进建议。标题：${title}`;
      const suggestionsResponse = await callLLMAPI(suggestionsSystemPrompt, suggestionsUserPrompt);
      const suggestions = suggestionsResponse.split(',').map(suggestion => suggestion.trim()).filter(suggestion => suggestion);
      
      // 生成评分
      const scoreSystemPrompt = `你是一个${selectedPersona.name}，${selectedPersona.description}。你的特点是：${selectedPersona.characteristics.join('、')}。请只返回数字，不要其他内容。`;
      const scoreUserPrompt = `请为以下文章标题打分（1-10分）。标题：${title}`;
      const scoreResponse = await callLLMAPI(scoreSystemPrompt, scoreUserPrompt);
      const score = parseInt(scoreResponse) || Math.floor(Math.random() * 3) + 7;
      
      const generatedReview = {
        score: Math.max(1, Math.min(10, score)), // 确保评分在1-10范围内
        comment: comment,
        tags: tags.length > 0 ? tags : ['实用性强', '可执行'],
        suggestions: suggestions.length > 0 ? suggestions : ['优化表达', '增强吸引力']
      };
      
      setReview(generatedReview);
    } catch (error) {
      console.error('生成点评失败:', error);
      setError('生成点评失败，请稍后重试');
      
      // 如果API调用失败，使用备用模拟数据
      const fallbackReview = {
        score: Math.floor(Math.random() * 3) + 7,
        comment: `作为${selectedPersona.name}，我认为这个标题${title}有一定的吸引力，但还有改进空间。`,
        tags: ['实用性强', '可执行'],
        suggestions: ['优化表达', '增强吸引力']
      };
      setReview(fallbackReview);
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
        </div>

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
                  {title && <TitlePreview title={title} />}
                </div>
              </Card>

              {/* 读者画像选择 */}
              <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold">选择读者画像</h2>
                </div>
                <ReaderPersonas 
                  selectedPersona={selectedPersona}
                  onSelectPersona={setSelectedPersona}
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
                  </div>
                  <Button
                    onClick={handleGenerateReview}
                    disabled={!title.trim() || !selectedPersona || isGenerating}
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

                {!title.trim() || !selectedPersona ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <BookOpen className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">请输入标题并选择读者画像</p>
                    <p className="text-sm">我们将为你生成专业的点评建议</p>
                  </div>
                ) : review ? (
                  <ReviewGenerator review={review} persona={selectedPersona} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Lightbulb className="h-16 w-16 mb-4 opacity-50" />
                    <p className="text-lg">点击生成点评按钮</p>
                    <p className="text-sm">查看 {selectedPersona?.name} 对你标题的看法</p>
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
