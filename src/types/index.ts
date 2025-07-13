export enum ProgressStage {
  IDLE = 'idle',
  CHECKING_INFO = 'checking_info',
  ENRICHING_INFO = 'enriching_info',
  GENERATING_TITLES = 'generating_titles',
  GENERATING_REVIEWS = 'generating_reviews',
  COMPLETED = 'completed'
}

export interface ProgressState {
  stage: ProgressStage;
  currentStep: number;
  totalSteps: number;
  currentTitle: string;
  currentPersona: string;
  stageDescription: string;
}

export interface Persona {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  characteristics: string[];
  color: string;
}

export interface Review {
  title: string;
  persona: Persona;
  score: number;
  comment: string;
  tags: string[];
  suggestions: string[];
} 