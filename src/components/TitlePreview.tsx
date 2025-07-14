
import React, { useState, useEffect } from 'react';
import { Card, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui';
import { Eye, Sparkles, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { checkInformationSufficiency, generateMultipleTitlesWithProgress, VariantTitle } from '@/lib/utils';


interface TitlePreviewProps {
  title: string;
  onTitlePoolChange?: (titlePool: string[]) => void;
}

export const TitlePreview: React.FC<TitlePreviewProps> = ({ title, onTitlePoolChange }) => {
  const { config } = useLLMConfig();
  const [generatedTitles, setGeneratedTitles] = useState<VariantTitle[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [error, setError] = useState('');
  const [enrichedInfo, setEnrichedInfo] = useState<string>('');
  const [isEnrichedInfoOpen, setIsEnrichedInfoOpen] = useState(false);

  // Update title pool when title or generatedTitles changes
  useEffect(() => {
    const titlePool = [title, ...generatedTitles.map(t => t.title)].filter(t => t.trim());
    onTitlePoolChange?.(titlePool);
  }, [title, generatedTitles, onTitlePoolChange]);

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

  // 删除本地 checkInformationSufficiency、safeParseTitles、generateMultipleTitles 等实现，直接调用 generateMultipleTitlesWithProgress。

  const generateMultipleTitles = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    setError('');
    try {
      const parsedTitles = await generateMultipleTitlesWithProgress(
        title,
        config.apiKey,
        config.apiUrl,
        config.model,
        config.mcpUrl,
        generateFallbackTitles,
        setEnrichedInfo
      );
      setGeneratedTitles(parsedTitles);
    } catch (error) {
      setError('Failed to generate titles, please try again later');
      setGeneratedTitles(generateFallbackTitles(title));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTitles = (originalTitle: string): VariantTitle[] => {
    const angles = [
      { angle: 'Emotional angle', focus: 'Evoke reader emotional resonance' },
      { angle: 'Practical angle', focus: 'Emphasize practical value and operability' },
      { angle: 'Curiosity angle', focus: 'Spark reader curiosity' },
      { angle: 'Authority angle', focus: 'Reflect professionalism and authority' },
      { angle: 'Story angle', focus: 'Use storytelling to attract readers' }
    ];

    return angles.map(({ angle, focus }, index) => ({
      title: `${originalTitle} - ${angle} Version ${index + 1}`,
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
            <span className="text-sm font-medium text-gray-600">Multi-Angle Title Generation</span>
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
                Enriching information...
              </>
            ) : isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Multi-Angle Titles
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
                    <span className="text-sm font-medium text-blue-700">Additional Information</span>
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
            Please enter a title to start generating
          </div>
        ) : (
          <div className="text-gray-600 text-sm">
            <p>💡 Tip: The system will automatically judge whether the title information is sufficient</p>
            <p>📝 When information is insufficient, it will automatically supplement related background information</p>
          </div>
        )}

        {generatedTitles.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Generated title variants:</h4>
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
