
import React from 'react';
import { Card } from '@/ui';
import { Briefcase, GraduationCap, Lightbulb, Code, Palette, User, Scissors, Monitor, Building2, PenTool, Camera, Globe, Zap } from 'lucide-react';

export const personas = [
  {
    id: 'professional',
    name: 'Professional',
    icon: Briefcase,
    description: 'In a fast-paced workplace environment, you focus on efficiency, growth, and practical skills. You often need to quickly learn and apply new knowledge, and time is very precious to you. You pursue solutions that can directly improve work efficiency, prefer structured information and actionable advice. You focus on personal career development and hope to demonstrate professional capabilities and value at work.',
    characteristics: ['Efficiency-driven', 'Practical-oriented', 'Time-conscious', 'Career-focused'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'student',
    name: 'Student',
    icon: GraduationCap,
    description: 'As a student, you are full of curiosity and thirst for knowledge, and enjoy exploring new things. You are in a critical stage of knowledge accumulation and are enthusiastic about learning new skills and understanding cutting-edge trends. You are socially active and often share and exchange ideas with classmates. You hope to find content that is both interesting and valuable for future career development.',
    characteristics: ['Curious', 'Open to new things', 'Socially active', 'High learning enthusiasm'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: Lightbulb,
    description: 'You are a passionate entrepreneur with keen business acumen and innovative thinking. You are good at discovering market opportunities, dare to take risks, and have strong execution power. You often need to quickly validate ideas and find solutions that can help business growth. You focus on industry trends and hope to find innovative methods that can enhance competitiveness.',
    characteristics: ['Business-savvy', 'Innovative thinking', 'Strong execution', 'Risk-taking'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'techie',
    name: 'Tech Enthusiast',
    icon: Code,
    description: 'You have deep interest and professional knowledge in technology, pursuing technical depth and cutting-edge trends. You are accustomed to analyzing problems with rational thinking and focus on logic and systematic approaches. You often follow the latest technological developments and hope to understand how technology changes industries and lifestyles. You value the feasibility and practicality of technical solutions.',
    characteristics: ['Technology-driven', 'Depth-seeking', 'Rational analysis', 'Frontier-focused'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'creative',
    name: 'Creative Professional',
    icon: Palette,
    description: 'You are a creative designer or artist who focuses on creative expression and visual experience. You have keen aesthetic perception and are good at thinking from artistic and design perspectives. You value the uniqueness and originality of your work and hope to create content that can move people. You often need to balance creative expression with business needs.',
    characteristics: ['Emotional thinking', 'Visual-oriented', 'Creativity-first', 'Aesthetically sensitive'],
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'fashion_designer',
    name: 'Fashion Designer',
    icon: Scissors,
    description: 'You are a professional fashion designer with solid artistic foundation and fashion sensitivity. You are skilled in digital modeling and rapid prototyping, able to quickly transform creative ideas into executable solutions. You focus on fashion trends and consumer needs, hoping to create designs that are both beautiful and practical. You often need to communicate with supply chains and clients, balancing creativity with business needs.',
    characteristics: ['Fashion-sensitive', 'Digital modeling', 'Rapid prototyping', 'Artistic foundation'],
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'data_analyst',
    name: 'Data Analyst',
    icon: Monitor,
    description: 'You are a professional data analyst with solid statistics and programming foundation. You are good at discovering valuable insights from massive data and providing data support for business decisions. You focus on the accuracy and interpretability of analysis, hoping to find data-driven solutions that can improve work efficiency. You often need to communicate with business departments, transforming complex data analysis results into understandable recommendations.',
    characteristics: ['Data-driven', 'Logical thinking', 'Business understanding', 'Technical expertise'],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'visual_designer',
    name: 'Visual Designer',
    icon: PenTool,
    description: 'You are an experienced visual communication designer, focusing on brand planning and packaging design. You have solid visual design foundation and are good at conveying brand concepts through visual elements. You focus on user experience and brand consistency, hoping to create visual works that can enhance brand value. You often need to collaborate with clients and development teams, balancing creative expression with project needs.',
    characteristics: ['Brand planning', 'Visual design', 'User experience', 'Collaborative communication'],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'ai_designer',
    name: 'AI Designer',
    icon: Zap,
    description: 'You are a designer in transition, moving from traditional design to AI-assisted design. You have certain design foundation and are learning how to better utilize AI tools to improve design efficiency. You hope to understand AI applications in design from a deeper perspective and find the best way for human-machine collaboration. You often need to collaborate with development teams but hope to improve collaboration efficiency.',
    characteristics: ['AI application', 'Design transition', 'Efficiency improvement', 'Human-machine collaboration'],
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'media_editor',
    name: 'Tech Media Editor',
    icon: Camera,
    description: 'You are a professional tech media editor, focusing on reporting entrepreneurs and innovative projects. You have keen news sense and deep analysis capabilities, good at discovering and spreading valuable tech information. You focus on industry dynamics and trend changes, hoping to provide accurate, timely, and in-depth tech reports for readers. You often need to communicate with entrepreneurs, investors, and technical experts.',
    characteristics: ['News-sensitive', 'Deep analysis', 'Trend insight', 'Professional reporting'],
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'art_curator',
    name: 'Public Art Curator',
    icon: Globe,
    description: 'You are a senior public art designer and curator with deep background in art history and curatorial theory. You are good at planning art projects with social impact, focusing on the interactive relationship between art and public space. You hope to create art experiences that can trigger public thinking and participation, promoting the social value of art. You often need to communicate with artists, government agencies, and the public.',
    characteristics: ['Art curation', 'Public space', 'Social value', 'Cultural communication'],
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'fintech_professional',
    name: 'FinTech Professional',
    icon: Building2,
    description: 'You are a professional working in the fintech field, focusing on providing financial services for primary market entrepreneurs. You have deep financial knowledge and technology understanding, good at combining traditional financial services with innovative technology. You focus on entrepreneurs\' financing needs and development challenges, hoping to provide fintech solutions that can improve work efficiency. You often need to communicate with entrepreneurs, investment institutions, and regulatory agencies.',
    characteristics: ['Financial expertise', 'Technology understanding', 'Entrepreneurial services', 'Efficiency improvement'],
    color: 'from-slate-500 to-slate-600'
  }
];

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
                ? 'border-[#0c7ff2] bg-blue-50 shadow-xl'
                : 'border-[#dde1e3] hover:border-[#0c7ff2] hover:shadow-lg'}
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
