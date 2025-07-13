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

interface ProgressPageProps {
  progressState: ProgressState;
}

const ProgressPage: React.FC<ProgressPageProps> = ({ progressState }) => {
  const { config } = useLLMConfig();
  // Define flow stages
  const flowStages = [
    {
      id: 'input',
      name: 'Input Title or Theme',
      description: 'Check if user input title information is sufficient',
      icon: FileText,
      stage: ProgressStage.CHECKING_INFO,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      id: 'enrich',
      name: 'Enrich Information',
      description: 'If information is insufficient, automatically expand related background information',
      icon: Plus,
      stage: ProgressStage.ENRICHING_INFO,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      id: 'generate',
      name: 'Generate Title Variants',
      description: 'Generate 5 title variants based on different angles',
      icon: Sparkles,
      stage: ProgressStage.GENERATING_TITLES,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      id: 'review',
      name: 'Multi-Persona Scoring',
      description: 'Score from 11 reader persona perspectives',
      icon: Users,
      stage: ProgressStage.GENERATING_REVIEWS,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      id: 'complete',
      name: 'Complete Analysis',
      description: 'Generate final analysis report and recommendations',
      icon: CheckCircle,
      stage: ProgressStage.COMPLETED,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    }
  ];

  // Get current stage information
  const getCurrentStage = () => {
    return flowStages.find(stage => stage.stage === progressState.stage) || flowStages[0];
  };

  // Get stage status
  const getStageStatus = (stage: typeof flowStages[0]) => {
    const currentIndex = flowStages.findIndex(s => s.stage === progressState.stage);
    const stageIndex = flowStages.findIndex(s => s.stage === stage.stage);
    
    if (progressState.stage === ProgressStage.COMPLETED) {
      return 'completed';
    }
    
    if (stageIndex < currentIndex) {
      return 'completed';
    } else if (stageIndex === currentIndex) {
      return 'active';
    } else {
      return 'pending';
    }
  };

  // Get progress percentage
  const getOverallProgress = () => {
    if (progressState.stage === ProgressStage.IDLE) return 0;
    if (progressState.stage === ProgressStage.COMPLETED) return 100;
    
    const currentIndex = flowStages.findIndex(s => s.stage === progressState.stage);
    const baseProgress = (currentIndex / (flowStages.length - 1)) * 100;
    
    // Calculate sub-progress based on current step
    let subProgress = 0;
    if (progressState.totalSteps > 0) {
      subProgress = (progressState.currentStep / progressState.totalSteps) * (100 / (flowStages.length - 1));
    }
    
    return Math.min(100, Math.floor(baseProgress + subProgress));
  };

  // Get current stage details
  const getCurrentStageDetails = () => {
    switch (progressState.stage) {
      case ProgressStage.CHECKING_INFO:
        return {
          title: 'Checking title information sufficiency',
          details: 'Analyzing whether user input title contains sufficient information for generating variants',
          tips: 'System is evaluating title completeness and expandability'
        };
      case ProgressStage.ENRICHING_INFO:
        return {
          title: 'Enriching title information',
          details: 'Based on AI analysis, adding background information, target audience, etc. to the title',
          tips: 'Enriched information will help generate more precise title variants'
        };
      case ProgressStage.GENERATING_TITLES:
        return {
          title: 'Generating multi-angle title variants',
          details: 'Generating titles from emotional, practical, curiosity, authority, and story angles',
          tips: 'Each angle will produce different title styles and appeal'
        };
      case ProgressStage.GENERATING_REVIEWS:
        return {
          title: `Generating reader persona scoring for "${progressState.currentTitle}"`,
          details: `Current persona: ${progressState.currentPersona}`,
          tips: `Completed ${progressState.currentStep}/${progressState.totalSteps} persona scorings`
        };
      case ProgressStage.COMPLETED:
        return {
          title: 'Analysis completed!',
          details: 'All title variants have completed multi-persona scoring',
          tips: 'You can view detailed analysis reports and improvement suggestions'
        };
      default:
        return {
          title: 'Waiting to start...',
          details: 'Preparing to start title analysis process',
          tips: 'Please wait, system is initializing'
        };
    }
  };

  const currentDetails = getCurrentStageDetails();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {/* Main card container */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          {/* Top info bar */}
          <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
            <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
              <Clock className="h-4 w-4 text-green-600 mr-2" />
              <span>Real-time progress tracking, average processing time <span className="font-bold text-[#121416]">2.8s</span></span>
            </div>
            <div className="flex items-center text-[#6a7681]">
              <Sparkles className="h-4 w-4 mr-1" />
              <span>Powered by {config.model}</span>
            </div>
          </div>

          {/* Main content card */}
          <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
            <h2 className="text-sm font-medium text-[#6a7681] mb-2">Reader Simulator</h2>
            
            {/* Overall progress bar */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#121416] text-base font-medium leading-normal">
                Overall Progress
              </span>
              <span className="text-[#6a7681] text-sm font-normal leading-normal">
                {getOverallProgress()}%
              </span>
            </div>
            <div className="rounded bg-[#dbe0e6] mb-6">
              <Progress value={getOverallProgress()} className="h-2 rounded bg-[#121416]" />
            </div>

            {/* Current stage details */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-full ${getCurrentStage().color} flex items-center justify-center`}>
                {React.createElement(getCurrentStage().icon, { className: "h-4 w-4 text-white" })}
              </div>
              <div className="flex-1">
                <p className="text-[#121416] text-base font-medium leading-normal">
                  {currentDetails.title}
                </p>
                {progressState.stage === ProgressStage.GENERATING_REVIEWS && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 mt-1">
                    {progressState.currentStep}/{progressState.totalSteps}
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-[#121416] text-base font-normal leading-normal mb-2">
              {currentDetails.details}
            </p>
            <div className="flex items-center gap-2 text-[#6a7681] text-sm">
              <Clock className="h-4 w-4" />
              <span>{currentDetails.tips}</span>
            </div>
          </div>

          {/* Process stages display */}
          <div className="bg-white shadow-xl rounded-2xl p-6">
            <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
              Processing Flow
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flowStages.map((stage, index) => {
                const status = getStageStatus(stage);
                const IconComponent = stage.icon;
                
                return (
                  <div 
                    key={stage.id}
                    className={`flex flex-col gap-2 rounded-xl border p-4 transition-all duration-300 ${
                      status === 'completed' 
                        ? 'border-[#dde1e3] bg-white' 
                        : status === 'active'
                        ? 'border-[#0c7ff2] bg-blue-50'
                        : 'border-[#dde1e3] bg-[#f1f2f4]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        status === 'completed' 
                          ? 'bg-[#078838]' 
                          : status === 'active'
                          ? stage.color
                          : 'bg-[#6a7681]'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-white" />
                        ) : (
                          <IconComponent className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${status === 'completed' ? 'text-[#078838]' : status === 'active' ? stage.textColor : 'text-[#6a7681]'}`}>
                          {stage.name}
                        </h4>
                        <p className="text-xs text-[#6a7681] mt-1">
                          {stage.description}
                        </p>
                      </div>
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