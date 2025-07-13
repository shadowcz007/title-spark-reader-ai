
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Sparkles, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { MCPService } from '@/services/mcpService';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState('');
  const [enrichedInfo, setEnrichedInfo] = useState<string>('');
  const [isEnrichedInfoOpen, setIsEnrichedInfoOpen] = useState(false);

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

  // 判断信息是否充足
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

 
  // 使用MCP服务进行bing搜索，失败时使用LLM扩充信息
  const enrichInformationWithMCP = async (title: string): Promise<string> => {
    try {
      setIsEnriching(true);
      
      // 首先尝试使用MCP服务
      const mcpService = MCPService.getInstance();
      const mcpResult = await mcpService.searchAndEnrich(
        title, 
        config.apiKey,
        config.apiUrl,
        config.model,
        config.mcpUrl
      );
      
      if (mcpResult && mcpResult.trim()) {
        return mcpResult;
      }
      
      // MCP服务失败或返回空结果，使用LLM扩充信息
      console.log('MCP服务失败，使用LLM扩充信息...');
      return await enrichInformationWithLLM(title);
      
    } catch (error) {
      console.error('MCP搜索失败:', error);
      // MCP服务失败，使用LLM扩充信息
      console.log('MCP服务异常，使用LLM扩充信息...');
      return await enrichInformationWithLLM(title);
    } finally {
      setIsEnriching(false);
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

  // 新增：宽容解析 LLM 返回内容的函数
  function safeParseTitles(response: string, originalTitle: string, generateFallbackTitles: (title: string) => GeneratedTitle[]): GeneratedTitle[] {
    // 尝试直接解析
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* 忽略解析异常 */ }

    // 尝试用正则提取 JSON 数组
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* 忽略解析异常 */ }
    }

    // 尝试用正则提取每组标题
    const itemRegex = /"title"\s*:\s*"([^"]+)"\s*,\s*"angle"\s*:\s*"([^"]+)"\s*,\s*"focus"\s*:\s*"([^"]+)"/g;
    const results: GeneratedTitle[] = [];
    let match;
    while ((match = itemRegex.exec(response)) !== null) {
      results.push({
        title: match[1],
        angle: match[2],
        focus: match[3]
      });
    }
    if (results.length > 0) return results;

    // 最后 fallback
    return generateFallbackTitles(originalTitle);
  }

  const generateMultipleTitles = async () => {
    if (!title.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // 第一步：检查信息充足性
      const sufficiencyCheck = await checkInformationSufficiency(title);
      
      const finalTitle = title;
      let additionalContext = '';
      
      // 如果信息不足，尝试补充信息
      if (!sufficiencyCheck.isSufficient) {
        console.log('信息不足，正在补充信息...');
        // 可以选择使用MCP服务或LLM模拟
        const enrichedInfo = await enrichInformationWithMCP(title);
        if (enrichedInfo) {
          additionalContext = `\n补充信息：${enrichedInfo}`;
          setEnrichedInfo(enrichedInfo);
        }
      }

      const systemPrompt = `你是一个专业的标题优化专家，擅长从不同角度和侧重点生成多样化的标题。请严格按照JSON格式返回结果，不要包含其他内容。`;

      const userPrompt = `基于以下标题，生成5个不同角度和侧重点的标题变体，确保多样性：
\n原标题：${finalTitle}${additionalContext}
\n请从以下角度考虑：
1. 情感角度 - 激发读者情感共鸣
2. 实用角度 - 强调实用价值和可操作性
3. 好奇角度 - 引发读者好奇心
4. 权威角度 - 体现专业性和权威性
5. 故事角度 - 用故事化表达吸引读者
\n请返回JSON格式：
[
  {
    "title": "生成的标题",
    "angle": "角度描述",
    "focus": "侧重点描述"
  }
]`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      console.log('LLM原始返回:', response); // 增加日志

      // 使用宽容解析
      const parsedTitles = safeParseTitles(response, title, generateFallbackTitles);
      setGeneratedTitles(parsedTitles);
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
            disabled={isGenerating || isEnriching || !title.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isEnriching ? (
              <>
                <Search className="h-4 w-4 mr-2 animate-spin" />
                补充信息中...
              </>
            ) : isGenerating ? (
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

        {enrichedInfo && (
          <div className="mb-4 bg-blue-50 rounded-lg border border-blue-200">
            <Collapsible open={isEnrichedInfoOpen} onOpenChange={setIsEnrichedInfoOpen}>
              <CollapsibleTrigger asChild>
                <button className="w-full p-3 flex items-center justify-between hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">补充信息</span>
                  </div>
                  {isEnrichedInfoOpen ? (
                    <ChevronUp className="h-4 w-4 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3">
                  <p className="text-sm text-blue-600">{enrichedInfo}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {!title.trim() ? (
          <div className="text-gray-500 text-sm text-center py-4">
            请输入标题开始生成
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            <p>💡 提示：系统会自动判断标题信息是否充足</p>
            <p>📝 信息不足时会自动补充相关背景信息</p>
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
