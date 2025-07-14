import React, { useState } from 'react';
import { Card, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui';
import { Settings as SettingsIcon, Save, Eye, EyeOff, TestTube, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLLMConfig } from '@/hooks/use-llm-config';
import {enrichInformationWithMCPBase} from '@/lib/utils'
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { t } = useTranslation();
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
      title: t('configSaved'),
      description: t('llmApiConfigSaved'),
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
              content: t('testConnection')
            }
          ]
        })
      });

      if (response.ok) {
        toast({
          title: t('connectionSuccessful'),
          description: t('apiConnectionTestSuccessful'),
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: t('connectionFailed'),
        description: t('apiConnectionTestFailed', { error: error instanceof Error ? error.message : t('unknownError') }),
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
          title: t('mcpConnectSuccess'),
          description: t('mcpConnectSuccessDesc'),
        });
      } else {
        toast({
          title: t('mcpConnectFail'),
          description: t('mcpConnectFailDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('mcpConnectError'),
        description: t('mcpConnectErrorDesc', { error: error instanceof Error ? error.message : t('unknownError') }),
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
      title: t('resetComplete'),
      description: t('configReset'),
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
              <span>{t('llmApiConfigTitle')}<span className="font-bold text-[#121416]">{t('secureAndLocal')}</span></span>
            </div>
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>{t('powered_by', { model: config.model })}</span>
            </div>
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-sm font-medium text-[#6a7681] mb-2">{t('settings')}</h2>
            <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
              {t('llmApiConfigTitle')}
            </h3>

            <div className="space-y-6">
              {/* API URL Settings */}
              <div className="space-y-2">
                <Label htmlFor="apiUrl" className="text-sm font-medium text-[#121416]">
                  {t('apiRequestUrl')}
                </Label>
                <Input
                  id="apiUrl"
                  type="url"
                  placeholder={t('apiUrlPlaceholder')}
                  value={localConfig.apiUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
                  className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416] placeholder-[#6a7681]"
                />
              </div>

              {/* API Key Settings */}
              <div className="space-y-2">
                <Label htmlFor="apiKey" className="text-sm font-medium text-[#121416]">
                  {t('apiKey')}
                </Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder={t('apiKeyPlaceholder')}
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
                  {t('modelSelection')}
                </Label>
                <Select
                  value={localConfig.model}
                  onValueChange={(value) => setLocalConfig({ ...localConfig, model: value })}
                >
                  <SelectTrigger className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416]">
                    <SelectValue placeholder={t('selectModel')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THUDM/GLM-4-9B-0414">{t('modelTHUDMGLM49B0414')}</SelectItem>
                    <SelectItem value="Qwen/Qwen3-8B">{t('modelQwenQwen38B')}</SelectItem>
                    <SelectItem value="THUDM/GLM-4.1V-9B-Thinking">{t('modelTHUDMGLM41V9BThinking')}</SelectItem>
                    <SelectItem value="custom">{t('customModel')}</SelectItem>
                  </SelectContent>
                </Select>
                {localConfig.model === 'custom' && (
                  <Input
                    placeholder={t('enterCustomModelName')}
                    value={localConfig.model}
                    onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
                    className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl mt-2 text-[#121416] placeholder-[#6a7681]"
                  />
                )}
              </div>

              {/* MCP URL Settings */}
              <div className="space-y-2">
                <Label htmlFor="mcpUrl" className="text-sm font-medium text-[#121416]">
                  {t('mcpBrowserUseServiceUrl')}
                </Label>
                <Input
                  id="mcpUrl"
                  type="url"
                  placeholder={t('mcpUrlPlaceholder')}
                  value={localConfig.mcpUrl}
                  onChange={(e) => setLocalConfig({ ...localConfig, mcpUrl: e.target.value })}
                  className="border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-[#121416] placeholder-[#6a7681]"
                />
                <p className="text-xs text-[#6a7681]">
                  {t('mcpServiceAddressDesc')}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={saveConfig}
                  className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {t('saveConfiguration')}
                </Button>
                
                <Button
                  onClick={testAPI}
                  disabled={isTesting}
                  variant="outline"
                  className="border-[#dde1e3] text-[#121416] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? t('testing') : t('testAPIConnection')}
                </Button>

                <Button
                  onClick={testMCP}
                  disabled={isTesting}
                  variant="outline"
                  className="border-[#dde1e3] text-[#121416] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {isTesting ? t('testing') : t('testMCPService')}
                </Button>
                
                <Button
                  onClick={resetToDefault}
                  variant="outline"
                  className="border-[#dde1e3] text-[#6a7681] hover:bg-[#f8f9fa] px-4 py-2 rounded-lg transition-colors"
                >
                  {t('resetToDefault')}
                </Button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                <p className="text-sm text-[#6a7681]">
                  <strong className="text-[#121416]">{t('note')}:</strong> {t('configSavedDesc')}
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