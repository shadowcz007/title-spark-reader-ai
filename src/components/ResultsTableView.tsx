import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Copy, 
  TrendingUp, 
  TrendingDown,
  Filter,
  ArrowUpDown,
  Star,
  Award,
  AlertTriangle
} from 'lucide-react';
import ReviewRadarChart from '@/components/ReviewRadarChart';
import { Review } from '@/types';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

interface ResultsTableViewProps {
  groupedReviews: Record<string, Review[]>;
  selectedTitles: string[];
  onTitleSelect: (title: string, selected: boolean) => void;
  onViewDetails: (title: string) => void;
}

type SortField = 'title' | 'avgScore' | 'changeRate' | 'reviewCount' | 'highScoreCount' | 'recommendation';
type SortOrder = 'asc' | 'desc';

const ResultsTableView: React.FC<ResultsTableViewProps> = ({
  groupedReviews,
  selectedTitles,
  onTitleSelect,
  onViewDetails
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [sortField, setSortField] = useState<SortField>('recommendation');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(false);

  // 计算表格数据
  const tableData = useMemo(() => {
    const titles = Object.keys(groupedReviews);
    
    return titles.map(title => {
      const reviews = groupedReviews[title];
      const avgScore = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
      const changeRate = (Math.random() * 20 - 10); // 示例数据，实际应从数据计算
      const highScoreCount = reviews.filter(r => r.score >= 8).length;
      const allTags = reviews.flatMap(r => r.tags);
      const uniqueTags = [...new Set(allTags)];
      
      // 计算推荐度（综合指标）
      const recommendationScore = (avgScore * 0.6) + (highScoreCount / reviews.length * 0.4);
      const isRecommended = avgScore >= 8;
      const isHighPotential = avgScore >= 7 && highScoreCount >= reviews.length * 0.5;
      const needsImprovement = avgScore < 6;
      
      return {
        title,
        avgScore,
        changeRate,
        reviewCount: reviews.length,
        highScoreCount,
        tags: uniqueTags,
        reviews,
        firstComment: reviews[0]?.comment || '',
        recommendationScore,
        isRecommended,
        isHighPotential,
        needsImprovement
      };
    });
  }, [groupedReviews]);

  // 过滤和排序数据
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData;
    
    // 应用分数过滤
    if (filterScore !== 'all') {
      filtered = filtered.filter(item => {
        if (filterScore === 'high') return item.avgScore >= 8;
        if (filterScore === 'medium') return item.avgScore >= 6 && item.avgScore < 8;
        if (filterScore === 'low') return item.avgScore < 6;
        return true;
      });
    }
    
    // 只显示推荐的
    if (showOnlyRecommended) {
      filtered = filtered.filter(item => item.isRecommended);
    }
    
    // 应用排序
    filtered.sort((a, b) => {
      let aValue: number | string, bValue: number | string;
      
      switch (sortField) {
        case 'title':
          aValue = a.title;
          bValue = b.title;
          break;
        case 'avgScore':
          aValue = a.avgScore;
          bValue = b.avgScore;
          break;
        case 'changeRate':
          aValue = a.changeRate;
          bValue = b.changeRate;
          break;
        case 'reviewCount':
          aValue = a.reviewCount;
          bValue = b.reviewCount;
          break;
        case 'highScoreCount':
          aValue = a.highScoreCount;
          bValue = b.highScoreCount;
          break;
        case 'recommendation':
          aValue = a.recommendationScore;
          bValue = b.recommendationScore;
          break;
        default:
          aValue = a.recommendationScore;
          bValue = b.recommendationScore;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? 
          aValue.localeCompare(bValue) : 
          bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? 
        (aValue as number) - (bValue as number) : 
        (bValue as number) - (aValue as number);
    });
    
    return filtered;
  }, [tableData, filterScore, sortField, sortOrder, showOnlyRecommended]);

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

  const getStatusIcon = (item: { isRecommended: boolean; isHighPotential: boolean; needsImprovement: boolean }) => {
    if (item.isRecommended) {
      return <Award className="h-4 w-4 text-green-600" />;
    } else if (item.isHighPotential) {
      return <Star className="h-4 w-4 text-yellow-600" />;
    } else if (item.needsImprovement) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getStatusText = (item: { isRecommended: boolean; isHighPotential: boolean; needsImprovement: boolean }) => {
    if (item.isRecommended) {
      return t('recommended');
    } else if (item.isHighPotential) {
      return t('highPotential');
    } else if (item.needsImprovement) {
      return t('needsImprovement');
    }
    return t('average');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const copyTitle = async (title: string) => {
    try {
      await navigator.clipboard.writeText(title);
      toast({
        title: t('titleCopied'),
        description: title,
      });
    } catch (err) {
      console.error('Failed to copy title:', err);
    }
  };

  const SortButton: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-medium"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-4">
      {/* 增强的过滤和排序控件 */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{t('filterByScore')}:</span>
            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allScores')}</SelectItem>
                <SelectItem value="high">{t('highScore')}</SelectItem>
                <SelectItem value="medium">{t('mediumScore')}</SelectItem>
                <SelectItem value="low">{t('lowScore')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="recommended-only"
              checked={showOnlyRecommended}
              onCheckedChange={(checked) => setShowOnlyRecommended(!!checked)}
            />
            <label htmlFor="recommended-only" className="text-sm font-medium cursor-pointer">
              {t('showOnlyRecommended')}
            </label>
          </div>
          
          <div className="text-sm text-gray-500">
            {t('display')} {filteredAndSortedData.length} / {tableData.length} {t('titles')}
          </div>

          {/* 快速排序按钮 */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">{t('quickSort')}:</span>
            <Button
              variant={sortField === 'recommendation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSortField('recommendation');
                setSortOrder('desc');
              }}
            >
              {t('bestFirst')}
            </Button>
            <Button
              variant={sortField === 'avgScore' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSortField('avgScore');
                setSortOrder('desc');
              }}
            >
              {t('highestScore')}
            </Button>
          </div>
        </div>
      </Card>

      {/* 结果表格 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTitles.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        filteredAndSortedData.forEach(item => {
                          if (!selectedTitles.includes(item.title)) {
                            onTitleSelect(item.title, true);
                          }
                        });
                      } else {
                        filteredAndSortedData.forEach(item => {
                          if (selectedTitles.includes(item.title)) {
                            onTitleSelect(item.title, false);
                          }
                        });
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="w-12">{t('status')}</TableHead>
                <TableHead className="min-w-[250px]">
                  <SortButton field="title">{t('title')}</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="avgScore">{t('avgScore')}</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="changeRate">{t('changeRate')}</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="highScoreCount">{t('highScoreRatio')}</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="recommendation">{t('recommendationScore')}</SortButton>
                </TableHead>
                <TableHead className="min-w-[200px]">{t('tags')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.map((item) => (
                <React.Fragment key={item.title}>
                  <TableRow 
                    className={`${selectedTitles.includes(item.title) ? 'bg-blue-50' : ''} ${
                      item.isRecommended ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedTitles.includes(item.title)}
                        onCheckedChange={(checked) => onTitleSelect(item.title, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getStatusIcon(item)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium line-clamp-2" title={item.title}>
                          {item.title}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {getStatusText(item)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(item.avgScore)}>
                        {(item.avgScore * 10).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getChangeIcon(item.changeRate)}
                        <span className={item.changeRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {item.changeRate >= 0 ? '+' : ''}{item.changeRate.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <span className="text-green-600 font-medium">
                          {item.highScoreCount}
                        </span>
                        <span className="text-gray-400">/{item.reviewCount}</span>
                        <div className="text-xs text-gray-500">
                          {((item.highScoreCount / item.reviewCount) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 h-2 rounded-full"
                            style={{ width: `${(item.recommendationScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {(item.recommendationScore * 10).toFixed(0)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{item.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedRow(expandedRow === item.title ? null : item.title)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyTitle(item.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* 展开的详细信息行 */}
                  {expandedRow === item.title && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-gray-50">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                          <div>
                            <h4 className="font-medium mb-2">{t('radarChart')}</h4>
                            <div className="h-64">
                              <ReviewRadarChart reviewsForTitle={item.reviews} />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">{t('detailAnalysis')}</h4>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium">{t('comment')}:</span>
                                <p className="text-gray-600 mt-1">{item.firstComment}</p>
                              </div>
                              <div>
                                <span className="font-medium">{t('allTags')}:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium">{t('scoreDistribution')}:</span>
                                  <div className="mt-1 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span>{t('highScore')}:</span>
                                      <span>{item.reviews.filter(r => r.score >= 8).length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>{t('mediumScore')}:</span>
                                      <span>{item.reviews.filter(r => r.score >= 6 && r.score < 8).length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>{t('lowScore')}:</span>
                                      <span>{item.reviews.filter(r => r.score < 6).length}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="font-medium">{t('decisionHelp')}:</span>
                                  <div className="mt-1 space-y-1 text-xs">
                                    {item.isRecommended && (
                                      <div className="flex items-center gap-1 text-green-600">
                                        <Award className="h-3 w-3" />
                                        <span>{t('topChoice')}</span>
                                      </div>
                                    )}
                                    {item.isHighPotential && !item.isRecommended && (
                                      <div className="flex items-center gap-1 text-yellow-600">
                                        <Star className="h-3 w-3" />
                                        <span>{t('goodOption')}</span>
                                      </div>
                                    )}
                                    {item.needsImprovement && (
                                      <div className="flex items-center gap-1 text-red-600">
                                        <AlertTriangle className="h-3 w-3" />
                                        <span>{t('considerRevision')}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {filteredAndSortedData.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{t('noMatchingResults')}</p>
            <p className="text-sm">{t('adjustFiltersToSeeResults')}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResultsTableView; 