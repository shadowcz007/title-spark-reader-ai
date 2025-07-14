import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import ReviewRadarChart from '@/components/ReviewRadarChart';
import { Review } from '@/types';
import { useTranslation } from 'react-i18next';

interface ResultsComparisonProps {
  selectedTitles: string[];
  groupedReviews: Record<string, Review[]>;
  onRemoveTitle: (title: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const ResultsComparison: React.FC<ResultsComparisonProps> = ({
  selectedTitles,
  groupedReviews,
  onRemoveTitle,
  onClose,
  isOpen
}) => {
  const { t } = useTranslation();

  const getAvgScore = (reviews: Review[]) => {
    return (reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('titleComparison')}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {selectedTitles.length < 2 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('selectAtLeastTwoTitles')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 对比概览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedTitles.map((title) => {
                const reviews = groupedReviews[title] || [];
                const avgScore = getAvgScore(reviews);
                const change = (Math.random() * 20 - 10); // 示例变化率
                
                return (
                  <Card key={title} className="p-4 relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => onRemoveTitle(title)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm line-clamp-2 pr-6">
                        {title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getScoreColor(avgScore)}>
                          {(avgScore * 10).toFixed(0)}%
                        </Badge>
                        <div className="flex items-center gap-1 text-xs">
                          {getChangeIcon(change)}
                          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-32">
                        <ReviewRadarChart reviewsForTitle={reviews} />
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('reviews')}:</span>
                          <span>{reviews.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">{t('highScore')}:</span>
                          <span>{reviews.filter(r => r.score >= 8).length}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {/* 详细对比表格 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">{t('metrics')}</th>
                    {selectedTitles.map((title) => (
                      <th key={title} className="text-left p-3 min-w-[120px]">
                        <div className="line-clamp-2" title={title}>
                          {title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">{t('averageScore')}</td>
                    {selectedTitles.map((title) => {
                      const reviews = groupedReviews[title] || [];
                      const avgScore = getAvgScore(reviews);
                      return (
                        <td key={title} className="p-3">
                          <Badge className={getScoreColor(avgScore)}>
                            {(avgScore * 10).toFixed(1)}%
                          </Badge>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">{t('highScoreCount')}</td>
                    {selectedTitles.map((title) => {
                      const reviews = groupedReviews[title] || [];
                      return (
                        <td key={title} className="p-3">
                          {reviews.filter(r => r.score >= 8).length}/{reviews.length}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium">{t('tags')}</td>
                    {selectedTitles.map((title) => {
                      const reviews = groupedReviews[title] || [];
                      const allTags = reviews.flatMap(r => r.tags);
                      const uniqueTags = [...new Set(allTags)];
                      return (
                        <td key={title} className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {uniqueTags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {uniqueTags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{uniqueTags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* 关键洞察 */}
            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold mb-2">{t('keyFindings')}</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {selectedTitles.length > 0 && (
                  <>
                    <p>• 最高评分标题: {
                      selectedTitles.reduce((best, title) => {
                        const bestScore = getAvgScore(groupedReviews[best] || []);
                        const currentScore = getAvgScore(groupedReviews[title] || []);
                        return currentScore > bestScore ? title : best;
                      })
                    }</p>
                    <p>• 平均分差距: {
                      (() => {
                        const scores = selectedTitles.map(title => getAvgScore(groupedReviews[title] || []));
                        const max = Math.max(...scores);
                        const min = Math.min(...scores);
                        return ((max - min) * 10).toFixed(1);
                      })()
                    }%</p>
                  </>
                )}
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResultsComparison; 