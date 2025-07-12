import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Save, Eye, EyeOff, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLLMConfig } from '@/hooks/use-llm-config';

const Settings: React.FC = () => {
  const { config, updateConfig, resetConfig } = useLLMConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  // 当config更新时，同步localConfig
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  // 保存配置
  const saveConfig = () => {
    updateConfig(localConfig);
    toast({
      title: "配置已保存",
      description: "LLM API配置已成功保存到本地存储",
    });
  };

  // 测试API连接
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
              content: '测试连接'
            }
          ]
        })
      });

      if (response.ok) {
        toast({
          title: "连接成功",
          description: "API连接测试成功！",
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "连接失败",
        description: `API连接测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 重置为默认配置
  const resetToDefault = () => {
    resetConfig();
    toast({
      title: "已重置",
      description: "配置已重置为默认值",
    });
  };

  return (
    <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-5 w-5 text-purple-600" />
        <h2 className="text-xl font-semibold">LLM API 设置</h2>
      </div>

      <div className="space-y-6">
        {/* API URL 设置 */}
        <div className="space-y-2">
          <Label htmlFor="apiUrl" className="text-sm font-medium">
            API 请求地址
          </Label>
          <Input
            id="apiUrl"
            type="url"
            placeholder="https://api.siliconflow.cn/v1/chat/completions"
            value={localConfig.apiUrl}
            onChange={(e) => setLocalConfig({ ...localConfig, apiUrl: e.target.value })}
            className="border-2 border-purple-200 focus:border-purple-500 rounded-xl"
          />
        </div>

        {/* API Key 设置 */}
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-sm font-medium">
            API 密钥
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              placeholder="sk-..."
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="border-2 border-purple-200 focus:border-purple-500 rounded-xl pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>

        {/* 模型选择 */}
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-medium">
            模型选择
          </Label>
          <Select
            value={localConfig.model}
            onValueChange={(value) => setLocalConfig({ ...localConfig, model: value })}
          >
            <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 rounded-xl">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THUDM/GLM-4-9B-0414">THUDM/GLM-4-9B-0414</SelectItem>
              <SelectItem value="Qwen/Qwen3-8B">Qwen/Qwen3-8B</SelectItem>
              <SelectItem value="THUDM/GLM-4.1V-9B-Thinking">THUDM/GLM-4.1V-9B-Thinking</SelectItem>
              <SelectItem value="custom">自定义模型</SelectItem>
            </SelectContent>
          </Select>
          {localConfig.model === 'custom' && (
            <Input
              placeholder="输入自定义模型名称"
              value={localConfig.model}
              onChange={(e) => setLocalConfig({ ...localConfig, model: e.target.value })}
              className="border-2 border-purple-200 focus:border-purple-500 rounded-xl mt-2"
            />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            onClick={saveConfig}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            保存配置
          </Button>
          
          <Button
            onClick={testAPI}
            disabled={isTesting}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-2 rounded-xl flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isTesting ? '测试中...' : '测试连接'}
          </Button>
          
          <Button
            onClick={resetToDefault}
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-2 rounded-xl"
          >
            重置默认
          </Button>
        </div>

        {/* 提示信息 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>提示：</strong>配置将保存在浏览器本地存储中，不会上传到服务器。请确保API密钥的安全性。
          </p>
        </div>
      </div>
    </Card>
  );
};

export default Settings; 