import React, { useState } from 'react';
import { Card, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui';
import { Settings as SettingsIcon, Save, Eye, EyeOff, TestTube, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLLMConfig } from '@/hooks/use-llm-config';
import {enrichInformationWithMCPBase} from '@/lib/utils'

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig } = useLLMConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // Sync localConfig when config updates
  React.useEffect(() => {
    setLocalConfig(config);
    console.log(config);
  }, [config]);

  // Save configuration
  const saveConfig = () => {
    updateConfig(localConfig);
    toast({
      title: "Configuration Saved",
      description: "LLM API configuration has been successfully saved to local storage",
    });
  };

  // Test API connection
  const testAPI = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(localConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: localConfig.model,
          messages: [
            {
              role: 'user',
              content: 'Test connection'
            }
          ]
        })
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "API connection test successful!",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: `API connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Test MCP connection
  const testMCP = async () => {
    console.log(localConfig);
    setIsTesting(true);
    try {
      const mcpResult = await enrichInformationWithMCPBase(
        'test',
        localConfig.apiKey,
        localConfig.apiUrl,
        localConfig.model,
        localConfig.mcpUrl
      );
      if (mcpResult) {
        toast({
          title: 'MCP 服务连接成功',
          description: 'MCP Browser Use Service URL 测试通过！',
        });
      } else {
        toast({
          title: 'MCP 服务连接失败',
          description: 'MCP 服务未响应或返回错误',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'MCP 服务连接异常',
        description: `MCP 服务测试异常: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Reset to default configuration
  const resetToDefault = () => {
    resetConfig();
    toast({
      title: "Reset Complete",
      description: "Configuration has been reset to default values",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* 主卡片容器 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          {/* 顶部信息栏 */}
          <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
            <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
              <SettingsIcon className="h-4 w-4 text-green-600 mr-2" />
              <span>LLM API Configuration <span className="font-bold text-[#121416]">Secure & Local</span></span>
            </div>
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>Powered by {config.model}</span>
            </div>
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-sm font-medium text-[#6a7681] mb-2">Settings</h2>
            <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
              LLM API Configuration
            </h3>

            <div className="space-y-6">
              {/* API URL Settings */}
              <div className="space-y-2">
                <Label htmlFor="apiUrl" className="text-sm font-medium text-[#121416]">
                  API Request URL
                </Label>
                <Input
                  id="apiUrl"
                  type="url"
                  placeholder="https://api.siliconflow.cn/v1/chat/completions"
                  value={localConfig.apiUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
                  className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416] placeholder-[#6a7681]"
                />
              </div>

              {/* API Key Settings */}
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium text-[#121416]">
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="sk-..."
                    value={localConfig.apiKey}
                    onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                    className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl pr-10 text-[#121416] placeholder-[#6a7681]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-[#6a7681]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#6a7681]" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium text-[#121416]">
                  Model Selection
                </Label>
                <Select
                  value={localConfig.model}
                  onValueChange={(value) => setLocalConfig({ ...localConfig, model: value })}
                >
                  <SelectTrigger className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THUDM/GLM-4-9B-0414">THUDM/GLM-4-9B-0414</SelectItem>
                    <SelectItem value="Qwen/Qwen3-8B">Qwen/Qwen3-8B</SelectItem>
                    <SelectItem value="THUDM/GLM-4.1V-9B-Thinking">THUDM/GLM-4.1V-9B-Thinking</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
                {localConfig.model === 'custom' && (
                  <Input
                    placeholder="Enter custom model name"
                    value={localConfig.model}
                    onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                    className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl mt-2 text-[#121416] placeholder-[#6a7681]"
                  />
                )}
              </div>

              {/* MCP URL Settings */}
              <div className="space-y-2">
                <Label htmlFor="mcpUrl" className="text-sm font-medium text-[#121416]">
                  MCP Browser Use Service URL
                </Label>
                <Input
                  id="mcpUrl"
                  type="url"
                  placeholder="http://localhost:2035"
                  value={localConfig.mcpUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, mcpUrl: e.target.value })}
                  className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416] placeholder-[#6a7681]"
                />
                <p className="text-xs text-[#6a7681]">
                  MCP service address for Bing search and information enrichment (browser_search), visit mixlab for matching mcp services
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={saveConfig}
                  className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                
                <Button
                  onClick={testMCP}
                  disabled={isTesting}
                  variant="outline"
                  className="border-[#dde1e3] text-[#121416] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
                {/* <Button
                  onClick={testMCP}
                  disabled={isTesting}
                  variant="outline"
                  className="border-[#dde1e3] text-[#121416] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? 'Testing...' : '测试 MCP 服务'}
                </Button> */}
                
                <Button
                  onClick={resetToDefault}
                  variant="outline"
                  className="border-[#dde1e3] text-[#6a7681] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg transition-colors"
                >
                  Reset to Default
                </Button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <p className="text-sm text-[#6a7681]">
                  <strong className="text-[#121416]">Note:</strong> Configuration will be saved in browser local storage and will not be uploaded to the server. Please ensure the security of your API key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 