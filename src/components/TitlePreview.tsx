
import React, { useState, useEffect } from 'react';
import { Card, Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui';
import { Eye, Sparkles, RefreshCw, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';
import MCPService from '@/services/mcpService';

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

  // Check information sufficiency
  const checkInformationSufficiency = async (title: string): Promise<{ isSufficient: boolean; reason: string }> => {
    try {
      const systemPrompt = `You are an information sufficiency assessment expert. Please analyze whether the given title contains sufficient information to generate diverse title variants.`;
      
      const userPrompt = `Please evaluate the information sufficiency of the following title:

Title: ${title}

Evaluation criteria:
1. Whether it contains specific topic or domain information
2. Whether it contains clear target audience
3. Whether it contains specific value proposition or core viewpoint
4. Whether it contains sufficient contextual information

Please return in JSON format:
{
  "isSufficient": true/false,
  "reason": "Detailed explanation"
}`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      
      try {
        const result = JSON.parse(response);
        return {
          isSufficient: result.isSufficient || false,
          reason: result.reason || 'Unable to parse evaluation result'
        };
      } catch (parseError) {
        // If JSON parsing fails, use simple keyword judgment
        const hasKeywords = title.length > 10 && 
          (title.includes('how') || title.includes('why') || title.includes('what') || 
           title.includes('tips') || title.includes('methods') || title.includes('guide'));
        
        return {
          isSufficient: hasKeywords,
          reason: hasKeywords ? 'Title contains sufficient key information' : 'Title information insufficient, need to supplement more context'
        };
      }
    } catch (error) {
      console.error('Information sufficiency assessment failed:', error);
      return {
        isSufficient: false,
        reason: 'Assessment failed, recommend supplementing information'
      };
    }
  };

 
  // Use MCP service for Bing search, fallback to LLM for information enrichment
  const enrichInformationWithMCP = async (title: string): Promise<string> => {
    try {
      setIsEnriching(true);
      
      // First try using MCP service
      const mcpService = new MCPService({ mcpUrl: config.mcpUrl });
      const isInitialized = await mcpService.initialize();
      
      if (isInitialized) {
        const mcpResult = await mcpService.enrichInformation(title);
        if (mcpResult && mcpResult.trim()) {
          return mcpResult;
        }
      }
      
      // MCP service failed or returned empty result, use LLM to enrich information
      console.log('MCP service failed, using LLM to enrich information...');
      return await enrichInformationWithLLM(title);
      
    } catch (error) {
      console.error('MCP search failed:', error);
      // MCP service failed, use LLM to enrich information
      console.log('MCP service exception, using LLM to enrich information...');
      return await enrichInformationWithLLM(title);
    } finally {
      setIsEnriching(false);
    }
  };

  // Use LLM to enrich information
  const enrichInformationWithLLM = async (title: string): Promise<string> => {
    try {
      const systemPrompt = `You are an information enrichment expert, skilled at analyzing titles and supplementing related background information, context, and details to make titles more rich and specific.`;

      const userPrompt = `Please analyze the following title and supplement related background information, context, and details to make the title more rich and specific:

Title: ${title}

Please supplement information from the following aspects:
1. Related background knowledge and context
2. Specific characteristics of target audience
3. Related industry trends or hot topics
4. Specific value propositions or core viewpoints
5. Related data, cases, or examples

Please return concise but information-rich supplementary content, not exceeding 200 words.`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      return response.trim();
    } catch (error) {
      console.error('LLM information enrichment failed:', error);
      return '';
    }
  };

  // New: Tolerant parsing function for LLM returned content
  function safeParseTitles(response: string, originalTitle: string, generateFallbackTitles: (title: string) => GeneratedTitle[]): GeneratedTitle[] {
    // Try direct parsing
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* Ignore parsing exceptions */ }

    // Try to extract JSON array with regex
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) return parsed;
      } catch { /* Ignore parsing exceptions */ }
    }

    // Try to extract each title group with regex
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

    // Final fallback
    return generateFallbackTitles(originalTitle);
  }

  const generateMultipleTitles = async () => {
    if (!title.trim()) return;
    
    setIsGenerating(true);
    setError('');
    
    try {
      // Step 1: Check information sufficiency
      const sufficiencyCheck = await checkInformationSufficiency(title);
      
      const finalTitle = title;
      let additionalContext = '';
      
      // If information is insufficient, try to supplement information
      if (!sufficiencyCheck.isSufficient) {
        console.log('Information insufficient, supplementing information...');
        // Can choose to use MCP service or LLM simulation
        const enrichedInfo = await enrichInformationWithMCP(title);
        if (enrichedInfo) {
          additionalContext = `\nAdditional context: ${enrichedInfo}`;
          setEnrichedInfo(enrichedInfo);
        }
      }

      const systemPrompt = `You are a professional title optimization expert, skilled at generating diverse titles from different angles and focuses. Please return results strictly in JSON format, do not include other content.`;

      const userPrompt = `Based on the following title, generate 5 title variants with different angles and focuses, ensuring diversity:
\nOriginal title: ${finalTitle}${additionalContext}
\nPlease consider the following angles:
1. Emotional angle - Evoke reader emotional resonance
2. Practical angle - Emphasize practical value and operability
3. Curiosity angle - Spark reader curiosity
4. Authority angle - Reflect professionalism and authority
5. Story angle - Use storytelling to attract readers
\nPlease return in JSON format:
[
  {
    "title": "Generated title",
    "angle": "Angle description",
    "focus": "Focus description"
  }
]`;

      const response = await callLLMAPI(systemPrompt, userPrompt);
      console.log('LLM original return:', response); // Add log

      // Use tolerant parsing
      const parsedTitles = safeParseTitles(response, title, generateFallbackTitles);
      setGeneratedTitles(parsedTitles);
    } catch (error) {
      console.error('Failed to generate titles:', error);
      setError('Failed to generate titles, please try again later');
      
      // Use fallback titles
      const fallbackTitles = generateFallbackTitles(title);
      setGeneratedTitles(fallbackTitles);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTitles = (originalTitle: string): GeneratedTitle[] => {
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
