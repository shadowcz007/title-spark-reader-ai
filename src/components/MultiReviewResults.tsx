import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, ThumbsUp, Lightbulb, Filter, SortAsc, SortDesc } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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

  // 按标题分组
  const groupedByTitle = reviews.reduce((acc, review) => {
    if (!acc[review.title]) acc[review.title] = [];
    acc[review.title].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  // 统计所有画像
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
              <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-gray-600">总点评数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(reviews.reduce((sum, r) => sum + r.score, 0) / (reviews.length || 1)).toFixed(1)}</div>
              <div className="text-sm text-gray-600">平均评分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reviews.filter(r => r.score >= 8).length}</div>
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

      {/* 多角度标题分组展示 */}
      <div className="space-y-8">
        {Object.entries(groupedByTitle).map(([title, reviewsForTitle]) => {
          // 计算各画像分数
          const radarData = allPersonas.map(persona => {
            const found = reviewsForTitle.find(r => r.persona.name === persona);
            return {
              persona,
              score: found ? found.score : 0,
            };
          });
          const totalScore = reviewsForTitle.reduce((sum, r) => sum + r.score, 0);
          const avgScore = (totalScore / reviewsForTitle.length).toFixed(1);
          return (
            <Card key={title} className="p-6 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <div>
                    <span className="text-green-600 font-bold mr-4">总分: {totalScore}</span>
                    <span className="text-blue-600 font-bold">均分: {avgScore}</span>
                  </div>
                </div>
                <div className="w-full md:w-96 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="80%">
                      <PolarGrid />
                      <PolarAngleAxis dataKey="persona" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar name="吸引力" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* 画像分数表格 */}
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {allPersonas.map(persona => (
                        <th key={persona} className="px-2 py-1">{persona}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {allPersonas.map(persona => {
                        const found = reviewsForTitle.find(r => r.persona.name === persona);
                        return (
                          <td key={persona} className="px-2 py-1 text-center">{found ? found.score : '-'}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && (
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