
import React from 'react';
import { Card, Badge, Button } from '@/ui';
import { Star, ThumbsUp, Lightbulb, RefreshCw } from 'lucide-react';

interface ReviewGeneratorProps {
  review: {
    score: number;
    comment: string;
    tags: string[];
    suggestions: string[];
  };
  persona: {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}

export const ReviewGenerator: React.FC<ReviewGeneratorProps> = ({
  review,
  persona
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return '很有吸引力';
    if (score >= 6) return '一般吸引力';
    return '吸引力较低';
  };

  return (
    <div className="space-y-6">
      {/* 评分卡片 */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <persona.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{persona.name} 的评价</h3>
              <p className="text-sm text-gray-600">{persona.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <span className="text-2xl font-bold text-gray-900">{review.score}</span>
              <span className="text-gray-500">/10</span>
            </div>
            <Badge className={`${getScoreColor(review.score)} border-0`}>
              {getScoreText(review.score)}
            </Badge>
          </div>
        </div>
      </Card>

      {/* 详细点评 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ThumbsUp className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-lg">详细点评</h4>
        </div>
        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
          {review.comment}
        </p>
      </Card>

      {/* 标签和建议 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 标签特征 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-purple-600" />
            <h4 className="font-semibold">标题特征</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </Card>

        {/* 优化建议 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold">优化建议</h4>
          </div>
          <ul className="space-y-2">
            {review.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* 重新生成按钮 */}
      <div className="text-center">
        <Button
          className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white font-semibold py-2 px-4 rounded-lg flex items-center transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          重新生成点评
        </Button>
      </div>
    </div>
  );
};
