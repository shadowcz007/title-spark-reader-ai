
import React from 'react';
import { Card } from '@/ui';
import { Briefcase, GraduationCap, Lightbulb, Code, Palette, User, Scissors, Monitor, Building2, PenTool, Camera, Globe, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Define personas without t() calls directly in the object
export const personaData = [
  {
    id: 'professional',
    icon: Briefcase,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'student',
    icon: GraduationCap,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'entrepreneur',
    icon: Lightbulb,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'techie',
    icon: Code,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'creative',
    icon: Palette,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'fashion_designer',
    icon: Scissors,
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'data_analyst',
    icon: Monitor,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'visual_designer',
    icon: PenTool,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'ai_designer',
    icon: Zap,
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'media_editor',
    icon: Camera,
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'art_curator',
    icon: Globe,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'fintech_professional',
    icon: Building2,
    color: 'from-slate-500 to-slate-600'
  }
];

// This is the function that should be used to get the translated personas
export const getTranslatedPersonas = (t: (key: string) => string) => {
  return personaData.map(p => ({
    ...p,
    name: t(`persona.${p.id}.name`),
    description: t(`persona.${p.id}.description`),
    characteristics: [
      t(`persona.${p.id}.char1`),
      t(`persona.${p.id}.char2`),
      t(`persona.${p.id}.char3`),
      t(`persona.${p.id}.char4`),
    ]
  }));
};


interface Persona {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  characteristics: string[];
  color: string;
}

interface ReaderPersonasProps {
  selectedPersonas: Persona[];
  onSelectPersona: (persona: Persona) => void;
}

export const ReaderPersonas: React.FC<ReaderPersonasProps> = ({
  selectedPersonas,
  onSelectPersona
}) => {
  const { t } = useTranslation();
  const personas = getTranslatedPersonas(t);

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {personas.map((persona) => {
        const IconComponent = persona.icon;
        const isSelected = selectedPersonas.some(p => p.id === persona.id);
        return (
          <Card
            key={persona.id}
            className={`w-32 h-40 flex flex-col items-center justify-center rounded-2xl border-2 p-2 shadow transition-all duration-300 cursor-pointer bg-white/90
              ${isSelected
                ? 'border-green-400 bg-green-50 shadow-xl'
                : 'border-[#dde1e3] hover:border-green-400 hover:shadow-lg'}
            `}
            onClick={() => onSelectPersona(persona)}
          >
            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center mb-2`}>
              <IconComponent className="h-7 w-7 text-white" />
            </div>
            <div className="font-bold text-[#121416] text-base text-center mt-1">{persona.name}</div>
          </Card>
        );
      })}
    </div>
  );
};
