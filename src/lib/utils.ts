import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import MCPService from '@/services/mcpService';
import { prompts, Language } from '../prompts';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const enrichInformationWithMCPBase = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string,
  mcpUrl: string
): Promise<string> => {
  const mcpService = MCPService.getInstance();
  await mcpService.initialize(mcpUrl);
  const mcpResult = await mcpService.searchAndEnrich(title, apiKey, apiUrl, model, mcpUrl);
  await mcpService.disconnect();
  return mcpResult;
};

export const enrichInformationWithLLM = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string,
  lang: Language
): Promise<string> => {
  const systemPrompt = prompts.informationEnrichment.system(lang);
  const userPrompt = prompts.informationEnrichment.user(title, lang);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
};

export const enrichInformationWithMCP = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string,
  mcpUrl: string
): Promise<string> => {
  try {
    const mcpResult = await enrichInformationWithMCPBase(title, apiKey, apiUrl, model, mcpUrl);
    if (mcpResult && mcpResult.trim()) {
      return mcpResult;
    }
    // MCP 失败则用 LLM
    return await enrichInformationWithLLM(title, apiKey, apiUrl, model, 'zh'); // Default to 'zh' for fallback
  } catch (error) {
    return await enrichInformationWithLLM(title, apiKey, apiUrl, model, 'zh'); // Default to 'zh' for fallback
  }
};

// 判断信息充足性
export const checkInformationSufficiency = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string,
  lang: Language
): Promise<{ isSufficient: boolean; reason: string }> => {
  const systemPrompt = prompts.informationSufficiency.system(lang);
  const userPrompt = prompts.informationSufficiency.user(title, lang);
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]);
    } else {
      return { isSufficient: true, reason: "Unable to parse, default to sufficient" };
    }
  } catch (error) {
    return { isSufficient: true, reason: 'Check failed, default to sufficient' };
  }
};

// 定义类型
export interface VariantTitle {
  title: string;
  angle: string;
  focus: string;
}

// 健壮解析 LLM 返回的多标题 JSON
export function safeParseTitles<T = VariantTitle>(response: string, originalTitle: string, generateFallbackTitles: (title: string) => T[]): T[] {
  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* Ignore */ }
  const jsonMatch = response.match(/\[.*\]/s);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* Ignore */ }
  }
  const itemRegex = /"title"\s*:\s*"([^"]+)"\s*,\s*"angle"\s*:\s*"([^"]+)"\s*,\s*"focus"\s*:\s*"([^"]+)"/g;
  const results: T[] = [];
  let match;
  while ((match = itemRegex.exec(response)) !== null) {
    results.push({
      title: match[1],
      angle: match[2],
      focus: match[3]
    } as T);
  }
  if (results.length > 0) return results;
  return generateFallbackTitles(originalTitle);
}

// 通用多角度标题生成（带信息补全）
export const generateMultipleTitlesWithProgress = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string,
  mcpUrl: string,
  generateFallbackTitles: (title: string) => VariantTitle[],
  lang: Language,
  setEnrichedInfo?: (info: string) => void
): Promise<VariantTitle[]> => {
  let additionalContext = '';
  // 1. 信息充足性判断
  const sufficiencyCheck = await checkInformationSufficiency(title, apiKey, apiUrl, model, lang);
  if (!sufficiencyCheck.isSufficient) {
    const enrichedInfo = await enrichInformationWithMCP(title, apiKey, apiUrl, model, mcpUrl);
    if (enrichedInfo) {
      additionalContext = lang === 'zh' ? `\n额外上下文：${enrichedInfo}` : `\nAdditional context: ${enrichedInfo}`;
      setEnrichedInfo?.(enrichedInfo);
    }
  }
  // 2. 多角度标题生成
  const systemPrompt = prompts.titleGeneration.system(lang);
  const userPrompt = prompts.titleGeneration.user(title, additionalContext, lang);
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  const text = data.choices[0]?.message?.content || '';
  return safeParseTitles<VariantTitle>(text, title, generateFallbackTitles);
};
