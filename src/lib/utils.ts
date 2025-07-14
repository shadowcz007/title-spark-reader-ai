import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import MCPService from '@/services/mcpService';

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
  model: string
): Promise<string> => {
  const systemPrompt = `You are an information enrichment expert, skilled at analyzing titles and supplementing related background information, context, and details to make titles more rich and specific.`;
  const userPrompt = `Please analyze the following title and supplement related background information, context, and details to make the title more rich and specific:\n\nTitle: ${title}\n\nPlease supplement information from the following aspects:\n1. Related background knowledge and context\n2. Specific characteristics of target audience\n3. Related industry trends or hot topics\n4. Specific value propositions or core viewpoints\n5. Related data, cases, or examples\n\nPlease return concise but information-rich supplementary content, not exceeding 200 words.`;
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
    return await enrichInformationWithLLM(title, apiKey, apiUrl, model);
  } catch (error) {
    return await enrichInformationWithLLM(title, apiKey, apiUrl, model);
  }
};

// 判断信息充足性
export const checkInformationSufficiency = async (
  title: string,
  apiKey: string,
  apiUrl: string,
  model: string
): Promise<{ isSufficient: boolean; reason: string }> => {
  const systemPrompt = `You are an information analysis expert. Please judge whether the information provided by the user is sufficient for generating article titles, and give reasons. If the information is insufficient, please propose specific content that needs to be supplemented. Your output format is JSON: {"isSufficient": true/false, "reason": "reason"}.`;
  const userPrompt = `The title provided by the user is: ${title}`;
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
  setEnrichedInfo?: (info: string) => void
): Promise<VariantTitle[]> => {
  let additionalContext = '';
  // 1. 信息充足性判断
  const sufficiencyCheck = await checkInformationSufficiency(title, apiKey, apiUrl, model);
  if (!sufficiencyCheck.isSufficient) {
    const enrichedInfo = await enrichInformationWithMCP(title, apiKey, apiUrl, model, mcpUrl);
    if (enrichedInfo) {
      additionalContext = `\nAdditional context: ${enrichedInfo}`;
      setEnrichedInfo?.(enrichedInfo);
    }
  }
  // 2. 多角度标题生成
  const systemPrompt = `You are a professional title optimization expert, skilled at generating diverse titles from different angles and focuses. Your only output must be a JSON array, do not include any additional text or Markdown code blocks.`;
  const userPrompt = `Based on the following title, generate 5 title variants with different angles and focuses, ensuring diversity:\n\nOriginal title: ${title}${additionalContext}\n\nPlease consider the following angles:\n1. Emotional angle - Evoke reader emotional resonance\n2. Practical angle - Emphasize practical value and operability\n3. Curiosity angle - Spark reader curiosity\n4. Authority angle - Reflect professionalism and authority\n5. Story angle - Use storytelling to attract readers\n\nYour output must be a JSON array in the following format:\n[\n  {\n    "title": "Generated title",\n    "angle": "Angle description",\n    "focus": "Focus description"\n  }\n]`;
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
