
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Lightbulb, Code, Palette, User } from 'lucide-react';

const personas = [
  {
    id: 'professional',
    name: '职场精英',
    icon: Briefcase,
    description: '关注效率、成长和实用技能',
    characteristics: ['追求效率', '注重实用性', '时间宝贵'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'student',
    name: '在校学生',
    icon: GraduationCap,
    description: '喜欢轻松有趣的内容',
    characteristics: ['好奇心强', '喜欢新鲜事物', '社交活跃'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'entrepreneur',
    name: '创业者',
    icon: Lightbulb,
    description: '寻找商机和创新思维',
    characteristics: ['商业敏感', '创新思维', '行动力强'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'techie',
    name: '技术爱好者',
    icon: Code,
    description: '追求技术深度和前沿趋势',
    characteristics: ['技术驱动', '追求深度', '理性分析'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'creative',
    name: '创意工作者',
    icon: Palette,
    description: '注重创意表达和视觉体验',
    characteristics: ['感性思维', '视觉导向', '创意优先'],
    color: 'from-pink-500 to-pink-600'
  }
];

interface ReaderPersonasProps {
  selectedPersona: any;
  onSelectPersona: (persona: any) => void;
}

export const ReaderPersonas: React.FC<ReaderPersonasProps> = ({
  selectedPersona,
  onSelectPersona
}) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {personas.map((persona) => {
        const IconComponent = persona.icon;
        const isSelected = selectedPersona?.id === persona.id;
        
        return (
          <Card
            key={persona.id}
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md border-2 ${
              isSelected 
                ? 'border-purple-500 bg-purple-50 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
            onClick={() => onSelectPersona(persona)}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${persona.color} flex items-center justify-center flex-shrink-0`}>
                <IconComponent className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{persona.name}</h3>
                  {isSelected && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      已选择
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{persona.description}</p>
                <div className="flex flex-wrap gap-1">
                  {persona.characteristics.map((char, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-xs py-0 px-2 bg-gray-50"
                    >
                      {char}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
