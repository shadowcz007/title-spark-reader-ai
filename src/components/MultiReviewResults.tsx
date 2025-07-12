import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ThumbsUp, Lightbulb, Filter, SortAsc, SortDesc } from 'lucide-react';

interface Review {
  title: string;
  persona: {
    id: string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    characteristics: string[];
    color: string;
  };
  score: number;
  comment: string;
  tags: string[];
  suggestions: string[];
}

interface MultiReviewResultsProps {
  reviews: Review[];
  onRegenerate?: () => void;
}

export const MultiReviewResults: React.FC<MultiReviewResultsProps> = ({
  reviews,
  onRegenerate
}) => {
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'persona'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');

  // 获取所有读者画像
  const allPersonas = Array.from(new Set(reviews.map(r => r.persona.name)));

  // 排序和筛选逻辑
  const sortedAndFilteredReviews = reviews
    .filter(review => {
      if (filterPersona !== 'all' && review.persona.name !== filterPersona) return false;
      if (filterScore !== 'all') {
        const score = parseInt(filterScore);
        if (score === 8 && review.score < 8) return false;
        if (score === 6 && (review.score < 6 || review.score >= 8)) return false;
        if (score === 4 && review.score >= 6) return false;
      }
      return true;
    })
          .sort((a, b) => {
        let aValue: number | string, bValue: number | string;
        
        switch (sortBy) {
          case 'score':
            aValue = a.score;
            bValue = b.score;
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'persona':
            aValue = a.persona.name;
            bValue = b.persona.name;
            break;
          default:
            aValue = a.score;
            bValue = b.score;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

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

  const getAverageScore = () => {
    if (sortedAndFilteredReviews.length === 0) return 0;
    const total = sortedAndFilteredReviews.reduce((sum, review) => sum + review.score, 0);
    return (total / sortedAndFilteredReviews.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* 统计信息 */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{sortedAndFilteredReviews.length}</div>
              <div className="text-sm text-gray-600">总点评数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getAverageScore()}</div>
              <div className="text-sm text-gray-600">平均评分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {sortedAndFilteredReviews.filter(r => r.score >= 8).length}
              </div>
              <div className="text-sm text-gray-600">高分点评</div>
            </div>
          </div>
          {onRegenerate && (
            <Button onClick={onRegenerate} variant="outline" size="sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              重新生成
            </Button>
          )}
        </div>
      </Card>

      {/* 筛选和排序 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">筛选：</span>
          </div>
          
          <Select value={filterPersona} onValueChange={setFilterPersona}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择读者画像" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有读者画像</SelectItem>
              {allPersonas.map(persona => (
                <SelectItem key={persona} value={persona}>{persona}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterScore} onValueChange={setFilterScore}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择评分" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有评分</SelectItem>
              <SelectItem value="8">8分以上</SelectItem>
              <SelectItem value="6">6-7分</SelectItem>
              <SelectItem value="4">6分以下</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">排序：</span>
            <Select value={sortBy} onValueChange={(value: 'score' | 'title' | 'persona') => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">按评分</SelectItem>
                <SelectItem value="title">按标题</SelectItem>
                <SelectItem value="persona">按读者画像</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* 点评结果列表 */}
      <div className="space-y-4">
        {sortedAndFilteredReviews.map((review, index) => {
          const PersonaIcon = review.persona.icon;
          
          return (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${review.persona.color} flex items-center justify-center flex-shrink-0`}>
                    <PersonaIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{review.persona.name}</h3>
                      <Badge className={`${getScoreColor(review.score)} border-0`}>
                        {getScoreText(review.score)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{review.persona.description}</p>
                    <h4 className="font-medium text-gray-900 text-sm bg-gray-50 p-2 rounded">
                      {review.title}
                    </h4>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    <span className="text-2xl font-bold text-gray-900">{review.score}</span>
                    <span className="text-gray-500">/10</span>
                  </div>
                </div>
              </div>

              {/* 详细点评 */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">详细点评</span>
                </div>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg text-sm">
                  {review.comment}
                </p>
              </div>

              {/* 标签和建议 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">标题特征</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {review.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200 px-2 py-1 text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">优化建议</span>
                  </div>
                  <ul className="space-y-1">
                    {review.suggestions.map((suggestion, suggestionIndex) => (
                      <li key={suggestionIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className="text-xs text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {sortedAndFilteredReviews.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无符合条件的点评结果</p>
            <p className="text-sm">请调整筛选条件或重新生成点评</p>
          </div>
        </Card>
      )}
    </div>
  );
}; 