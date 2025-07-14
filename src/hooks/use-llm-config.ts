import { useState, useEffect } from 'react';

export interface FeatureStatus {
  browserSearch: boolean;
  databaseQuery: boolean;
}

interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  mcpUrl: string;
  featureStatus?: FeatureStatus;
}

const defaultConfig: LLMConfig = {
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiKey: '',
  model: 'THUDM/GLM-4-9B-0414',
  mcpUrl: 'http://localhost:2035',
  featureStatus: {
    browserSearch: false,
    databaseQuery: false
  }
};

export const useLLMConfig = () => {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig);

  // Load configuration from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('llm-config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsedConfig });
      }
    } catch (error) {
      console.error('Failed to load LLM configuration:', error);
      // If parsing fails, use default configuration
      setConfig(defaultConfig);
    }
  }, []);

  // Update configuration
  const updateConfig = (newConfig: LLMConfig) => {
    setConfig(newConfig);
    // Save to localStorage
    try {
      localStorage.setItem('llm-config', JSON.stringify(newConfig));
    } catch (error) {
      console.error('Failed to save LLM configuration:', error);
    }
  };

  // Reset to default configuration
  const resetConfig = () => {
    setConfig(defaultConfig);
    try {
      localStorage.removeItem('llm-config');
    } catch (error) {
      console.error('Failed to reset LLM configuration:', error);
    }
  };

  return { config, updateConfig, resetConfig };
}; 