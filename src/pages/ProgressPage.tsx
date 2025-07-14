import React from 'react';
import { Progress, Card, Badge } from '@/ui';
import { ProgressStage, ProgressState } from '@/types';
import { 
  Search, 
  Plus, 
  Sparkles, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  MessageSquare,
  Star
} from 'lucide-react';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { useTranslation } from 'react-i18next';

interface ProgressPageProps {
  progressState: ProgressState;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ progressState }) => {
  const { config } = useLLMConfig();
  const { t } = useTranslation();
  
  const stageIcons = {
    [ProgressStage.CHECKING_INFO]: Search,
    [ProgressStage.ENRICHING_INFO]: Plus,
    [ProgressStage.GENERATING_TITLES]: Sparkles,
    [ProgressStage.GENERATING_REVIEWS]: Users,
    [ProgressStage.COMPLETED]: CheckCircle,
    [ProgressStage.IDLE]: Clock,
  };

  const flowStages = [
    { id: ProgressStage.CHECKING_INFO, title: t('stageCheckingInfo'), description: t('stageCheckingInfoDesc') },
    { id: ProgressStage.ENRICHING_INFO, title: t('stageEnrichingInfo'), description: t('stageEnrichingInfoDesc') },
    { id: ProgressStage.GENERATING_TITLES, title: t('stageGeneratingTitles'), description: t('stageGeneratingTitlesDesc') },
    { id: ProgressStage.GENERATING_REVIEWS, title: t('stageGeneratingReviews'), description: t('stageGeneratingReviewsDesc') },
    { id: ProgressStage.COMPLETED, title: t('stageCompleted'), description: t('stageCompletedDesc') },
  ];

  const currentStageIndex = flowStages.findIndex(s => s.id === progressState.stage);

  // Get stage status
  const getStageStatus = (index: number) => {
    if (progressState.stage === ProgressStage.COMPLETED) return 'completed';
    if (index < currentStageIndex) return 'completed';
    if (index === currentStageIndex) return 'active';
    return 'pending';
  };

  const getOverallProgress = () => {
    if (progressState.stage === ProgressStage.IDLE) return 0;
    if (progressState.stage === ProgressStage.COMPLETED) return 100;
    
    const baseProgress = (currentStageIndex / (flowStages.length - 1)) * 100;
    
    let subProgress = 0;
    if (progressState.totalSteps > 0) {
      subProgress = (progressState.currentStep / progressState.totalSteps) * (100 / (flowStages.length - 1));
    }
    
    return Math.min(100, Math.floor(baseProgress + subProgress));
  };
  
  const currentStageInfo = flowStages.find(s => s.id === progressState.stage);
  const IconForCurrentStage = stageIcons[progressState.stage] || Clock;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
            <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
              <Clock className="h-4 w-4 text-green-600 mr-2" />
              <span>{t('realTimeProgressTracking')}</span>
            </div>
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>{t('poweredBy', { model: config.model })}</span>
            </div>
          </div>
          
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
            <div className="text-center mb-8">
              <h1 className="text-[#121416] text-[32px] font-bold leading-tight tracking-[-0.015em] mb-2">
                {t('readerSimulationInProgress')}
              </h1>
              <p className="text-[#6a7681] text-lg">
                {progressState.stageDescription || t('analyzingYourTitle')}
              </p>
            </div>

            <div className="w-full bg-[#f1f2f4] rounded-full h-2.5 mb-4">
              <div className="bg-[#121416] h-2.5 rounded-full" style={{ width: `${getOverallProgress()}%` }}></div>
            </div>
            <p className="text-center text-sm text-[#6a7681]">{getOverallProgress()}% {t('complete')}</p>
          </div>
          
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
              {t('processingFlow')}
            </h3>
            <div className="space-y-4">
              {flowStages.map((stage, index) => {
                const status = getStageStatus(index);
                const IconComponent = stageIcons[stage.id] || Clock;
                
                return (
                  <div 
                    key={stage.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                      status === 'active' ? 'bg-blue-50 border-blue-200' : 'bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status === 'completed' ? 'bg-green-500' : status === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <IconComponent className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${status !== 'pending' ? 'text-[#121416]' : 'text-gray-500'}`}>{stage.title}</h4>
                      <p className={`text-sm ${status !== 'pending' ? 'text-[#6a7681]' : 'text-gray-400'}`}>{stage.description}</p>
                      {status === 'active' && progressState.currentPersona && (
                        <p className="text-sm text-blue-600 mt-1">{t('analyzingWith', { persona: progressState.currentPersona })}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage; 