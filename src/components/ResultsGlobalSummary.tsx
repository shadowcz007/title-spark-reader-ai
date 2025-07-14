import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Trophy, Target, BarChart3, Lightbulb, Download } from 'lucide-react';
import { Review } from '@/types';
import { useTranslation } from 'react-i18next';

interface ResultsGlobalSummaryProps {
  groupedReviews: Record<string, Review[]>;
  onExportReport?: () => void;
  onRegenerateAnalysis?: () => void;
}

const ResultsGlobalSummary: React.FC<ResultsGlobalSummaryProps> = ({
  groupedReviews,
  onExportReport,
  onRegenerateAnalysis
}) => {
  const { t } = useTranslation();

  // 计算全局统计
  const titles = Object.keys(groupedReviews);
  const allReviews = Object.values(groupedReviews).flat();
  
  const totalTitles = titles.length;
  const totalReviews = allReviews.length;
  const globalAvgScore = allReviews.length > 0 
    ? allReviews.reduce((sum, r) => sum + r.score, 0) / allReviews.length 
    : 0;
  
  // 计算每个标题的平均分
  const titleScores = titles.map(title => ({
    title,
    avgScore: groupedReviews[title].reduce((sum, r) => sum + r.score, 0) / groupedReviews[title].length,
    reviewCount: groupedReviews[title].length
  }));
  
  const bestTitle = titleScores.reduce((best, current) => 
    current.avgScore > best.avgScore ? current : best, titleScores[0] || { title: '', avgScore: 0, reviewCount: 0 });
  
  const worstTitle = titleScores.reduce((worst, current) => 
    current.avgScore < worst.avgScore ? current : worst, titleScores[0] || { title: '', avgScore: 0, reviewCount: 0 });
  
  const highScoreTitles = titleScores.filter(t => t.avgScore >= 8);
  const mediumScoreTitles = titleScores.filter(t => t.avgScore >= 6 && t.avgScore < 8);
  const lowScoreTitles = titleScores.filter(t => t.avgScore < 6);
  
  // 计算所有标签的频次
  const allTags = allReviews.flatMap(r => r.tags);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 8) return t('highlyAttractive');
    if (score >= 6) return t('moderatelyAttractive');
    return t('lowAttraction');
  };

  if (totalTitles === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('noData')}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 主要统计指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('totalTitles')}</p>
              <p className="text-2xl font-bold text-blue-900">{totalTitles}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('averageScore')}</p>
              <p className="text-2xl font-bold text-green-900">{(globalAvgScore * 10).toFixed(1)}%</p>
              <p className="text-xs text-green-600">{getPerformanceLevel(globalAvgScore)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">{t('highScoreCount')}</p>
              <p className="text-2xl font-bold text-yellow-900">{highScoreTitles.length}</p>
              <p className="text-xs text-yellow-600">{((highScoreTitles.length / totalTitles) * 100).toFixed(0)}% {t('of')} {totalTitles}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('totalReviews')}</p>
              <p className="text-2xl font-bold text-purple-900">{totalReviews}</p>
              <p className="text-xs text-purple-600">{(totalReviews / totalTitles).toFixed(1)} {t('per')} {t('title')}</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* 详细洞察 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 表现分析 */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {t('overallInsights')}
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-900">{t('recommendedTitle')}</p>
                <p className="text-sm text-green-700 line-clamp-1" title={bestTitle.title}>
                  {bestTitle.title}
                </p>
              </div>
              <Badge className={getScoreColor(bestTitle.avgScore)}>
                {(bestTitle.avgScore * 10).toFixed(1)}%
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">{t('highScore')}</p>
                <p className="text-lg font-bold text-green-900">{highScoreTitles.length}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">{t('mediumScore')}</p>
                <p className="text-lg font-bold text-yellow-900">{mediumScoreTitles.length}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{t('lowScore')}</p>
                <p className="text-lg font-bold text-red-900">{lowScoreTitles.length}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 热门标签 */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            {t('keyFindings')}
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">{t('mostCommonTags')}</p>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag} ({count})
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <p>• {t('scoreRange')}: {(worstTitle.avgScore * 10).toFixed(1)}% - {(bestTitle.avgScore * 10).toFixed(1)}%</p>
              <p>• {t('averageVariation')}: {((bestTitle.avgScore - worstTitle.avgScore) * 10).toFixed(1)}% {t('difference')}</p>
              <p>• {t('consistencyRate')}: {((highScoreTitles.length / totalTitles) * 100).toFixed(0)}% {t('above8Points')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3 justify-center">
        {onExportReport && (
          <Button variant="outline" onClick={onExportReport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            {t('exportReport')}
          </Button>
        )}
        {onRegenerateAnalysis && (
          <Button onClick={onRegenerateAnalysis} className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {t('regenerateAnalysis')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsGlobalSummary; 