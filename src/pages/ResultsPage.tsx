import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitCompare, Download, RefreshCw, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import ResultsGlobalSummary from '@/components/ResultsGlobalSummary';
import ResultsTableView from '@/components/ResultsTableView';
import ResultsComparison from '@/components/ResultsComparison';
import { Review } from '@/types';

interface ResultsPageProps {
  results: Review[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ results }) => {
  const { t } = useTranslation();
  
  // 状态管理
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // 将results按标题分组
  const groupedReviews: Record<string, Review[]> = results.reduce((acc, review) => {
    if (!acc[review.title]) {
      acc[review.title] = [];
    }
    acc[review.title].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  // 处理标题选择
  const handleTitleSelect = (title: string, selected: boolean) => {
    if (selected) {
      setSelectedTitles(prev => [...prev, title]);
    } else {
      setSelectedTitles(prev => prev.filter(t => t !== title));
    }
  };

  // 处理对比
  const handleShowComparison = () => {
    if (selectedTitles.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleRemoveTitleFromComparison = (title: string) => {
    setSelectedTitles(prev => prev.filter(t => t !== title));
  };

  // 导出报告
  const handleExportReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      totalTitles: Object.keys(groupedReviews).length,
      totalReviews: results.length,
      averageScore: results.reduce((sum, r) => sum + r.score, 0) / results.length,
      results: groupedReviews
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reader-simulator-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 重新分析
  const handleRegenerateAnalysis = () => {
    // 这里应该触发重新分析的逻辑
    console.log('Regenerating analysis...');
  };

  const handleViewDetails = (title: string) => {
    // 可以在这里添加详细查看逻辑
    console.log('Viewing details for:', title);
  };

  // 如果没有结果，显示空状态
  if (results.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">{t('noData')}</h3>
            <p className="text-gray-500">{t('noResultsToDisplay')}</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white p-4">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div className="flex flex-col gap-3">
              <h1 className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">
                {t('readerSimulatorResults')}
              </h1>
              <p className="text-[#6a7681] text-sm font-normal leading-normal">
                {t('exploreDetailedFeedback')}
              </p>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex items-center gap-3">
              {selectedTitles.length >= 2 && (
                <Button 
                  onClick={handleShowComparison}
                  className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  {t('compareSelected')} ({selectedTitles.length})
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleExportReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('exportReport')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRegenerateAnalysis}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {t('regenerateAnalysis')}
              </Button>
            </div>
          </div>

          {/* 全局汇总 */}
          <ResultsGlobalSummary 
            groupedReviews={groupedReviews}
            onExportReport={handleExportReport}
            onRegenerateAnalysis={handleRegenerateAnalysis}
          />
        </div>

        {/* 主要内容：表格视图 */}
        <ResultsTableView
          groupedReviews={groupedReviews}
          selectedTitles={selectedTitles}
          onTitleSelect={handleTitleSelect}
          onViewDetails={handleViewDetails}
        />

        {/* 对比弹窗 */}
        <ResultsComparison
          selectedTitles={selectedTitles}
          groupedReviews={groupedReviews}
          onRemoveTitle={handleRemoveTitleFromComparison}
          onClose={() => setShowComparison(false)}
          isOpen={showComparison}
        />
      </div>
    </div>
  );
};

export default ResultsPage; 