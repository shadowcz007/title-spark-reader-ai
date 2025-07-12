
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, GraduationCap, Lightbulb, Code, Palette, User, Scissors, Monitor, Building2, PenTool, Camera, Globe, Zap } from 'lucide-react';

const personas = [
  {
    id: 'professional',
    name: '职场精英',
    icon: Briefcase,
    description: '在快节奏的职场环境中，你注重效率、成长和实用技能。你经常需要快速学习和应用新知识，时间对你来说非常宝贵。你追求能够直接提升工作效率的解决方案，喜欢结构化的信息和可执行的建议。你关注个人职业发展，希望在工作中展现专业能力和价值。',
    characteristics: ['追求效率', '注重实用性', '时间宝贵', '职业发展导向'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'student',
    name: '在校学生',
    icon: GraduationCap,
    description: '作为在校学生，你充满好奇心和求知欲，喜欢探索新鲜事物。你正处于知识积累的关键阶段，对学习新技能和了解前沿趋势充满热情。你社交活跃，经常与同学分享和交流想法。你希望找到既有趣又有价值的学习内容，为未来的职业发展做准备。',
    characteristics: ['好奇心强', '喜欢新鲜事物', '社交活跃', '学习热情高'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'entrepreneur',
    name: '创业者',
    icon: Lightbulb,
    description: '你是一位充满激情的创业者，具备敏锐的商业嗅觉和创新思维。你善于发现市场机会，敢于承担风险，行动力强。你经常需要快速验证想法，寻找能够帮助业务增长的解决方案。你关注行业趋势，希望找到能够提升竞争力的创新方法。',
    characteristics: ['商业敏感', '创新思维', '行动力强', '风险承担'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'techie',
    name: '技术爱好者',
    icon: Code,
    description: '你对技术有着深厚的兴趣和专业知识，追求技术深度和前沿趋势。你习惯用理性的思维分析问题，注重逻辑性和系统性。你经常关注最新的技术发展，希望了解技术如何改变行业和生活方式。你重视技术解决方案的可行性和实用性。',
    characteristics: ['技术驱动', '追求深度', '理性分析', '前沿关注'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'creative',
    name: '创意工作者',
    icon: Palette,
    description: '你是一位富有创造力的设计师或艺术家，注重创意表达和视觉体验。你有着敏锐的审美感知，善于从艺术和设计的角度思考问题。你重视作品的独特性和原创性，希望创造能够打动人心的内容。你经常需要平衡创意表达和商业需求。',
    characteristics: ['感性思维', '视觉导向', '创意优先', '审美敏锐'],
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'fashion_designer',
    name: '服装设计师',
    icon: Scissors,
    description: '你是一位专业的服装设计师，具备深厚的艺术功底和时尚敏感度。你擅长数字建模和快速原型验证，能够将创意想法快速转化为可执行的方案。你关注时尚趋势和消费者需求，希望创造既美观又实用的设计作品。你经常需要与供应链和客户沟通，平衡创意与商业需求。',
    characteristics: ['时尚敏感', '数字建模', '快速原型', '艺术功底'],
    color: 'from-rose-500 to-rose-600'
  },
  {
    id: 'data_analyst',
    name: '数据分析师',
    icon: Monitor,
    description: '你是一位专业的数据分析师，具备扎实的统计学和编程基础。你善于从海量数据中发现有价值的洞察，为业务决策提供数据支持。你注重分析的准确性和可解释性，希望找到能够提升工作效率的数据驱动解决方案。你经常需要与业务部门沟通，将复杂的数据分析结果转化为可理解的建议。',
    characteristics: ['数据驱动', '逻辑思维', '业务理解', '技术专业'],
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'visual_designer',
    name: '视觉设计师',
    icon: PenTool,
    description: '你是一位经验丰富的视觉传达设计师，专注于品牌策划和包装设计。你具备深厚的视觉设计功底，善于通过视觉元素传达品牌理念。你关注用户体验和品牌一致性，希望创造能够提升品牌价值的视觉作品。你经常需要与客户和开发团队协作，平衡创意表达和项目需求。',
    characteristics: ['品牌策划', '视觉设计', '用户体验', '协作沟通'],
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'ai_designer',
    name: 'AI设计师',
    icon: Zap,
    description: '你是一位转型中的设计师，正在从传统设计向AI辅助设计转变。你具备一定的设计基础，正在学习如何更好地利用AI工具提升设计效率。你希望从更深层的角度理解AI在设计中的应用，找到人机协作的最佳方式。你经常需要与开发团队合作，但希望提升协作效率。',
    characteristics: ['AI应用', '设计转型', '效率提升', '人机协作'],
    color: 'from-violet-500 to-violet-600'
  },
  {
    id: 'media_editor',
    name: '科技媒体编辑',
    icon: Camera,
    description: '你是一位专业的科技媒体编辑，专注于报道创业者和创新项目。你具备敏锐的新闻嗅觉和深度分析能力，善于发现和传播有价值的科技资讯。你关注行业动态和趋势变化，希望为读者提供准确、及时、有深度的科技报道。你经常需要与创业者、投资人和技术专家交流。',
    characteristics: ['新闻敏感', '深度分析', '趋势洞察', '专业报道'],
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'art_curator',
    name: '公共艺术策展人',
    icon: Globe,
    description: '你是一位资深的公共艺术设计师和策展人，具备深厚的艺术史和策展理论背景。你善于策划具有社会影响力的艺术项目，关注艺术与公共空间的互动关系。你希望创造能够引发公众思考和参与的艺术体验，推动艺术的社会价值。你经常需要与艺术家、政府机构和公众沟通。',
    characteristics: ['艺术策展', '公共空间', '社会价值', '文化传播'],
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 'fintech_professional',
    name: '金融科技从业者',
    icon: Building2,
    description: '你是一位在金融科技领域工作的专业人士，专注于为一级市场创业者提供金融服务。你具备深厚的金融知识和科技理解，善于将传统金融服务与创新技术相结合。你关注创业者的融资需求和发展挑战，希望提供能够提升工作效率的金融科技解决方案。你经常需要与创业者、投资机构和监管机构沟通。',
    characteristics: ['金融专业', '科技理解', '创业服务', '效率提升'],
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
  selectedPersona: Persona | null;
  onSelectPersona: (persona: Persona) => void;
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
