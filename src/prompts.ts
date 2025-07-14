// src/prompts.ts - Unified Prompt Management

import { Persona } from './types'; // Assuming types are in src/types

export type Language = 'en' | 'zh';

export interface PromptTemplates {
  titleGeneration: {
    system: (lang: Language) => string;
    user: (title: string, additionalContext: string, lang: Language) => string;
  };
  informationEnrichment: {
    system: (lang: Language) => string;
    user: (title: string, lang: Language) => string;
  };
  reviewGeneration: {
    comment: {
      system: (persona: Persona, lang: Language) => string;
      user: (title: string, lang: Language) => string;
    };
    tags: {
      system: (persona: Persona, lang: Language) => string;
      user: (title: string, lang: Language) => string;
    };
    suggestions: {
      system: (persona: Persona, lang: Language) => string;
      user: (title: string, lang: Language) => string;
    };
    score: {
      system: (persona: Persona, lang: Language) => string;
      user: (title: string, lang: Language) => string;
    };
  };
  informationSufficiency: {
    system: (lang: Language) => string;
    user: (title: string, lang: Language) => string;
  };
  // Add other prompt categories as needed
}

export const prompts: PromptTemplates = {
  titleGeneration: {
    system: (lang) => lang === 'zh' 
      ? '您是一位专业的标题优化专家，擅长从不同角度和焦点生成多样化的标题。您的输出必须仅为JSON数组，不要包含任何额外文本或Markdown代码块。'
      : 'You are a professional title optimization expert, skilled at generating diverse titles from different angles and focuses. Your only output must be a JSON array, do not include any additional text or Markdown code blocks.',
    user: (title, additionalContext, lang) => lang === 'zh'
      ? `基于以下标题，生成5个不同角度和焦点的标题变体，确保多样性：\n\n原标题：${title}${additionalContext}\n\n请考虑以下角度：\n1. 情感角度 - 唤起读者情感共鸣\n2. 实用角度 - 强调实用价值和可操作性\n3. 好奇角度 - 激发读者好奇心\n4. 权威角度 - 体现专业性和权威感\n5. 故事角度 - 使用故事讲述吸引读者\n\n您的输出必须是以下格式的JSON数组：\n[\n  {\n    "title": "生成的标题",\n    "angle": "角度描述",\n    "focus": "焦点描述"\n  }\n]`
      : `Based on the following title, generate 5 title variants with different angles and focuses, ensuring diversity:\n\nOriginal title: ${title}${additionalContext}\n\nPlease consider the following angles:\n1. Emotional angle - Evoke reader emotional resonance\n2. Practical angle - Emphasize practical value and operability\n3. Curiosity angle - Spark reader curiosity\n4. Authority angle - Reflect professionalism and authority\n5. Story angle - Use storytelling to attract readers\n\nYour output must be a JSON array in the following format:\n[\n  {\n    "title": "Generated title",\n    "angle": "Angle description",\n    "focus": "Focus description"\n  }\n]`
  },
  informationEnrichment: {
    system: (lang) => lang === 'zh'
      ? '您是一位信息丰富专家，擅长分析标题并补充相关背景信息、上下文和细节，使标题更丰富和具体。'
      : 'You are an information enrichment expert, skilled at analyzing titles and supplementing related background information, context, and details to make titles more rich and specific.',
    user: (title, lang) => lang === 'zh'
      ? `请分析以下标题并补充相关背景信息、上下文和细节，使标题更丰富和具体：\n\n标题：${title}\n\n请从以下方面补充信息：\n1. 相关背景知识和上下文\n2. 目标受众的具体特征\n3. 相关行业趋势或热点话题\n4. 具体价值主张或核心观点\n5. 相关数据、案例或示例\n\n请返回简洁但信息丰富的补充内容，不超过200字。`
      : `Please analyze the following title and supplement related background information, context, and details to make the title more rich and specific:\n\nTitle: ${title}\n\nPlease supplement information from the following aspects:\n1. Related background knowledge and context\n2. Specific characteristics of target audience\n3. Related industry trends or hot topics\n4. Specific value propositions or core viewpoints\n5. Related data, cases, or examples\n\nPlease return concise but information-rich supplementary content, not exceeding 200 words.`
  },
  reviewGeneration: {
    comment: {
      system: (persona, lang) => lang === 'zh'
        ? `您是一位${persona.name}，${persona.description}。您的特征是：${persona.characteristics.join(', ')}。请用中文回答，控制在100字以内。`
        : `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please answer in English, keep it within 100 words.`,
      user: (title, lang) => lang === 'zh'
        ? `请为以下文章标题提供反馈，给出具体建议和改进方向。标题：${title}`
        : `Please provide feedback on the following article title, giving specific suggestions and improvement directions. Title: ${title}`
    },
    tags: {
      system: (persona, lang) => lang === 'zh'
        ? `您是一位${persona.name}，${persona.description}。您的特征是：${persona.characteristics.join(', ')}。请仅返回标签，用逗号分隔，无其他内容。`
        : `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return tags, separated by commas, no other content.`,
      user: (title, lang) => lang === 'zh'
        ? `为以下文章标题生成3个反映您特征的标签。标题：${title}`
        : `Generate 3 tags for the following article title that reflect your characteristics. Title: ${title}`
    },
    suggestions: {
      system: (persona, lang) => lang === 'zh'
        ? `您是一位${persona.name}，${persona.description}。您的特征是：${persona.characteristics.join(', ')}。请仅返回建议，用逗号分隔，无其他内容。`
        : `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return suggestions, separated by commas, no other content.`,
      user: (title, lang) => lang === 'zh'
        ? `请为以下文章标题提供3个具体的改进建议。标题：${title}`
        : `Please provide 3 specific improvement suggestions for the following article title. Title: ${title}`
    },
    score: {
      system: (persona, lang) => lang === 'zh'
        ? `您是一位${persona.name}，${persona.description}。您的特征是：${persona.characteristics.join(', ')}。请仅返回一个数字，无其他内容。`
        : `You are a ${persona.name}, ${persona.description}. Your characteristics are: ${persona.characteristics.join(', ')}. Please only return a number, no other content.`,
      user: (title, lang) => lang === 'zh'
        ? `请为以下文章标题打分（1-10分）。标题：${title}`
        : `Please rate the following article title (1-10 points). Title: ${title}`
    }
  },
  informationSufficiency: {
    system: (lang: Language) => lang === 'zh'
      ? '您是一位信息分析专家。请判断用户提供的信息是否足以生成文章标题，并给出理由。如果信息不足，请提出需要补充的具体内容。您的输出格式为JSON：{"isSufficient": true/false, "reason": "理由"}。'
      : 'You are an information analysis expert. Please judge whether the information provided by the user is sufficient for generating article titles, and give reasons. If the information is insufficient, please propose specific content that needs to be supplemented. Your output format is JSON: {"isSufficient": true/false, "reason": "reason"}.',
    user: (title: string, lang: Language) => lang === 'zh'
      ? `用户提供的标题是：${title}`
      : `The title provided by the user is: ${title}`
  }
};

// Add other prompts as needed, e.g., for information sufficiency check if exists 