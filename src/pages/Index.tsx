
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, User, BookOpen, Briefcase, Code, Lightbulb, Heart } from 'lucide-react';
import { ReaderPersonas } from '@/components/ReaderPersonas';
import { ReviewGenerator } from '@/components/ReviewGenerator';
import { TitlePreview } from '@/components/TitlePreview';

const Index = () => {
  const [title, setTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [review, setReview] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReview = async () => {
    if (!title.trim() || !selectedPersona) return;
    
    setIsGenerating(true);
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockReview = {
      score: Math.floor(Math.random() * 3) + 7, // 7-9分
      comment: generateMockComment(selectedPersona, title),
      tags: generateTags(selectedPersona),
      suggestions: generateSuggestions(selectedPersona)
    };
    
    setReview(mockReview);
    setIsGenerating(false);
  };

  const generateMockComment = (persona, title) => {
    const comments = {
      professional: [
        `这个标题很有职场针对性，能抓住工作痛点。建议加上具体的数字或时间范围会更有说服力。`,
        `从职场角度看很实用，不过可以更直接地点出解决方案或收益。`,
        `标题切中了职场人士的需求，但可以更突出紧迫感和实用性。`
      ],
      student: [
        `作为学生觉得这个标题挺有趣的！不过可以更生动一些，加点网络用语或表情。`,
        `标题看起来有点严肃，如果能更贴近学生生活会更吸引人。`,
        `这个话题很棒！建议用更轻松的语气，比如加个问号或感叹号。`
      ],
      entrepreneur: [
        `从创业角度来说，这个标题需要更强的冲击力和商业价值感。`,
        `标题不够突出创新性和机会感，建议加入更多商业关键词。`,
        `作为创业者，我希望看到更明确的价值主张和行动指引。`
      ],
      techie: [
        `标题还可以，但缺少技术深度的体现，可以加些专业术语。`,
        `从技术角度看，这个标题需要更精确的描述和技术细节暗示。`,
        `建议加入更多技术栈相关的关键词，会更吸引技术人员。`
      ],
      creative: [
        `这个标题缺乏创意火花！可以用更有想象力的表达方式。`,
        `建议加入更多情感色彩和视觉感，让人一看就有画面感。`,
        `标题太直白了，用一些比喻或故事化的表达会更有吸引力。`
      ]
    };
    const personaComments = comments[persona.id] || comments.professional;
    return personaComments[Math.floor(Math.random() * personaComments.length)];
  };

  const generateTags = (persona) => {
    const tagMap = {
      professional: ['实用性强', '职场相关', '可执行'],
      student: ['轻松有趣', '贴近生活', '易理解'],
      entrepreneur: ['商业价值', '创新思维', '机会导向'],
      techie: ['技术含量', '专业性', '实操性'],
      creative: ['创意十足', '情感丰富', '视觉化']
    };
    return tagMap[persona.id] || tagMap.professional;
  };

  const generateSuggestions = (persona) => {
    const suggestionMap = {
      professional: ['加入具体数字', '突出解决方案', '强调ROI'],
      student: ['使用轻松语气', '加入网络热词', '增加互动性'],
      entrepreneur: ['突出商业价值', '加入紧迫感', '明确行动指引'],
      techie: ['添加技术细节', '使用专业术语', '突出创新性'],
      creative: ['增加情感色彩', '使用比喻手法', '创造画面感']
    };
    return suggestionMap[persona.id] || suggestionMap.professional;
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
                    <h2 className="text-xl font-semibold">模拟点评</h2>
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
                    {isGenerating ? '生成中...' : '生成点评'}
                  </Button>
                </div>

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
