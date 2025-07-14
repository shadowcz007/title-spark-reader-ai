import React from 'react';
import { Button, Input, Card, Badge } from '@/ui';
import { 
  Star, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Zap,
  Calculator,
  CheckCircle
} from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { useTranslation } from 'react-i18next';

interface InputPageProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  forceSupplement: boolean;
  onForceSupplementChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputPage: React.FC<InputPageProps> = ({ title, onTitleChange, onGenerate, forceSupplement, onForceSupplementChange }) => {
  const { t } = useTranslation();
  const { config } = useLLMConfig();
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* 用户信任度展示 */}
        <div className="flex items-center justify-center mb-6 text-sm text-[#6a7681]">
          <div className="flex items-center">
            <div className="flex -space-x-2 mr-3">
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-gradient-to-r from-orange-500 to-red-500"></div>
            </div>
            <span className="font-medium text-[#121416]">15K+</span>
            <span>{t('trustedBy')}</span>
          </div>
          <span className="mx-3 text-[#dbe0e6]">|</span>
          <div className="flex items-center">
            <span>⭐⭐⭐⭐⭐</span>
            <span className="ml-1 font-semibold text-[#121416]">4.95/5</span>
          </div>
          <div className="flex items-center gap-2 bg-green-100/80 rounded-full px-3 py-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-[#121416]">+156%</span>
            <span>{t('engagementBoost')}</span>
          </div>
        </div>

        {/* 主卡片容器 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          {/* 顶部信息栏 */}
          <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>Powered by {config.model}</span>
            </div>
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-sm font-medium text-[#6a7681] mb-2">{t('readerSimulator')}</h2>
            <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
              {t('enterYourArticleTitle')}
            </h3>
            
            {/* 输入区域 */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder={t('enterYourArticleTitle')}
                className="w-full text-2xl placeholder-[#dbe0e6] border-none focus:ring-0 p-0 bg-transparent text-[#121416] font-medium pl-2"
                value={title}
                onChange={onTitleChange}
              />
              <Button
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-400 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                onClick={onGenerate}
                disabled={!title.trim()}
              >
                <Calculator className="h-5 w-5 mr-2" />
                <span>{t('simulate')}</span>
              </Button>
            </div>

            {/* 新增：强制信息补充勾选框 */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#6a7681] cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 accent-green-400"
                  checked={forceSupplement}
                  onChange={onForceSupplementChange}
                />
                {t('forceSupplementLabel')}
              </label>
              <p className="text-[#6a7681]">{t('titlesWithClearThemes')}</p>
            </div>
          </div>
        </div>

        {/* 功能特性展示 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#dde1e3]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[#121416] text-sm font-medium leading-normal">{t('multiPersonaAnalysis')}</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              {t('getFeedbackFrom11Personas')}
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#dde1e3]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[#121416] text-sm font-medium leading-normal">{t('smartTitleGeneration')}</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              {t('aiPoweredTitleVariants')}
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#dde1e3]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[#121416] text-sm font-medium leading-normal">{t('instantReaderFeedback')}</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              {t('realTimeAnalysis')}
            </p>
          </div>
        </div>

        {/* 使用统计 */}
        <div className="text-center text-sm text-[#6a7681] mt-12 flex justify-center items-center gap-6">
          <span>● {t('titlesSimulatedToday')}</span>
          <span>● {t('readerSatisfaction')}</span>
          <span>● {t('avgSimulationTime')}</span>
        </div>
      </div>
    </div>
  );
};

export default InputPage; 