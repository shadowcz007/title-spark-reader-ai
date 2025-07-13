import { useState, useEffect } from 'react';

interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  mcpUrl: string;
}

const defaultConfig: LLMConfig = {
  apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
  apiKey: 'sk-pfoybguqznavgchjhsmmxtiantbkvabehiwxvsidfmqflzvl',
  model: 'THUDM/GLM-4-9B-0414',
  mcpUrl: 'http://localhost:2035'
};

export const useLLMConfig = () => {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从localStorage加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('llm-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('加载LLM配置失败:', error);
        // 如果解析失败，使用默认配置
        setConfig(defaultConfig);
      }
    }
    setIsLoaded(true);
  }, []);

  // 更新配置
  const updateConfig = (newConfig: Partial<LLMConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // 保存到localStorage
    try {
      localStorage.setItem('llm-config', JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('保存LLM配置失败:', error);
    }
  };

  // 重置为默认配置
  const resetConfig = () => {
    setConfig(defaultConfig);
    try {
      localStorage.removeItem('llm-config');
    } catch (error) {
      console.error('重置LLM配置失败:', error);
    }
  };

  return {
    config,
    isLoaded,
    updateConfig,
    resetConfig
  };
}; 