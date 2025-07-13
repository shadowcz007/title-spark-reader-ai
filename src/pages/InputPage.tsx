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

interface InputPageProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
}

const InputPage: React.FC<InputPageProps> = ({ title, onTitleChange, onGenerate }) => {
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
            <span className="font-bold text-[#121416]">15K+</span>
          </div>
          <span className="mx-3 text-[#dbe0e6]">|</span>
          <div className="flex items-center">
            <span>Trusted by 42,580+ content creators</span>
            <div className="flex items-center ml-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-yellow-400'}`} 
                />
              ))}
            </div>
            <span className="ml-1 font-semibold text-[#121416]">4.95/5</span>
          </div>
        </div>

        {/* 主卡片容器 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          {/* 顶部信息栏 */}
          <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
            <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <span>Average engagement boost of <span className="font-bold text-[#121416]">+156%</span> in reader retention</span>
            </div>
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>Powered by {config.model}</span>
            </div>
          </div>

          {/* 主要内容卡片 */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-sm font-medium text-[#6a7681] mb-2">Reader Simulator</h2>
            
            {/* 输入区域 */}
            <div className="flex items-start">
              <div className="border-l-4 border-green-400 h-10 mr-4"></div>
              <div className="flex-grow">
                <Input
                  placeholder="Enter your article title or theme..."
                  className="w-full text-2xl placeholder-[#dbe0e6] border-none focus:ring-0 p-0 bg-transparent text-[#121416] font-medium"
                  value={title}
                  onChange={onTitleChange}
                />
              </div>
              <Button
                className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
                onClick={onGenerate}
                disabled={!title.trim()}
              >
                <Calculator className="h-5 w-5 mr-2" />
                <span>Simulate</span>
              </Button>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 flex items-center text-xs text-[#6a7681]">
              <div className="w-3 h-3 bg-[#dbe0e6] rounded-sm mr-2"></div>
              <span>Titles with clear themes and target audiences get better reader engagement scores.</span>
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
              <h3 className="text-[#121416] text-sm font-medium leading-normal">Multi-Persona Analysis</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              Get feedback from 11 different reader personas
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#dde1e3]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[#121416] text-sm font-medium leading-normal">Smart Title Generation</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              AI-powered title variants with 5 different angles
            </p>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-[#dde1e3]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[#121416] text-sm font-medium leading-normal">Instant Reader Feedback</h3>
            </div>
            <p className="text-[#6a7681] text-xs leading-normal">
              Real-time analysis with detailed scoring and insights
            </p>
          </div>
        </div>

        {/* 使用统计 */}
        <div className="mt-6 text-center">
          <div className="flex justify-center items-center gap-6 text-sm text-[#6a7681]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>1,847 titles simulated today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>96.8% reader satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Avg. 2.8s simulation time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPage; 