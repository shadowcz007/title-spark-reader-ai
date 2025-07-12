
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, RefreshCw } from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';

interface TitlePreviewProps {
  title: string;
  onTitlePoolChange?: (titlePool: string[]) => void;
}

interface GeneratedTitle {
  title: string;
  angle: string;
  focus: string;
}

export const TitlePreview: React.FC<TitlePreviewProps> = ({ title, onTitlePoolChange }) => {
  const { config } = useLLMConfig();
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // 当title或generatedTitles变化时，更新标题池子
  useEffect(() => {
    const titlePool = [title, ...generatedTitles.map(t => t.title)].filter(t => t.trim());
    onTitlePoolChange?.(titlePool);
  }, [title, generatedTitles, onTitlePoolChange]);

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

  const generateMultipleTitles = async () => {
    if (!title.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      const systemPrompt = `你是一个专业的标题优化专家，擅长从不同角度和侧重点生成多样化的标题。请严格按照JSON格式返回结果，不要包含其他内容。`;

      const userPrompt = `基于以下标题，生成5个不同角度和侧重点的标题变体，确保多样性：

原标题：${title}

请从以下角度考虑：
1. 情感角度 - 激发读者情感共鸣
2. 实用角度 - 强调实用价值和可操作性
3. 好奇角度 - 引发读者好奇心
4. 权威角度 - 体现专业性和权威性
5. 故事角度 - 用故事化表达吸引读者

请返回JSON格式：
[
  {
    "title": "生成的标题",
    "angle": "角度描述",
    "focus": "侧重点描述"
  }
]`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      
      try {
        const parsedTitles = JSON.parse(response);
        if (Array.isArray(parsedTitles)) {
          setGeneratedTitles(parsedTitles);
        } else {
          throw new Error('返回格式不正确');
        }
      } catch (parseError) {
        // 如果JSON解析失败，尝试从文本中提取标题
        const fallbackTitles = generateFallbackTitles(title);
        setGeneratedTitles(fallbackTitles);
      }
    } catch (error) {
      console.error('生成标题失败:', error);
      setError('生成标题失败，请稍后重试');
      
      // 使用备用标题
      const fallbackTitles = generateFallbackTitles(title);
      setGeneratedTitles(fallbackTitles);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTitles = (originalTitle: string): GeneratedTitle[] => {
    const angles = [
      { angle: '情感角度', focus: '激发读者情感共鸣' },
      { angle: '实用角度', focus: '强调实用价值和可操作性' },
      { angle: '好奇角度', focus: '引发读者好奇心' },
      { angle: '权威角度', focus: '体现专业性和权威性' },
      { angle: '故事角度', focus: '用故事化表达吸引读者' }
    ];

    return angles.map(({ angle, focus }, index) => ({
      title: `${originalTitle} - ${angle}版本${index + 1}`,
      angle,
      focus
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">多角度标题生成</span>
          </div>
          <Button
            onClick={generateMultipleTitles}
            disabled={isGenerating || !title.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                生成多角度标题
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        {generatedTitles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">生成的标题变体：</h4>
            {generatedTitles.map((item, index) => (
              <div key={index} className="p-3 bg-white rounded-lg border border-purple-100">
                <h5 className="font-medium text-gray-900 mb-1">
                  {item.title}
                </h5>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {item.angle}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {item.focus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
