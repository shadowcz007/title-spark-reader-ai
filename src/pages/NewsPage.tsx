import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Badge, Textarea } from '@/ui';
import { Sparkles, Newspaper, Clock, Search, Calendar, Database, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import { useLLMConfig, FeatureStatus } from '@/hooks/use-llm-config';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import MCPService from '@/services/mcpService';

interface NewsItem {
  id: string;
  title: string;
  text: string;
  url: string;
  tags?: string[];
  type?: string;
  date?: string;
}

interface DatabaseContent {
  id: string;
  title: string;
  text: string;
  url: string;
  createtime: number;
  tags?: string | string[];
  type?: string;
  workspace?: string;
}

interface DatabaseResult {
  dbName: string;
  contents: DatabaseContent[];
}

interface DatabaseQueryResult {
  success: boolean;
  data: NewsItem[];
  message?: string;
}

interface MCPTool {
  name: string;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

const NewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useLLMConfig();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<'1day' | '7days' | '14days'>('7days');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [databases, setDatabases] = useState<string[]>([]);
  const [customSQL, setCustomSQL] = useState('');
  const [customSQLMode, setCustomSQLMode] = useState(false);
  const featureStatus: FeatureStatus | undefined = config.featureStatus;

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  // 直接用featureStatus判断
  const isDatabaseAvailable = featureStatus?.databaseQuery === true;

  // 加载数据库列表
  const loadDatabases = async () => {
    try {
      const mcpService = MCPService.getInstance();
      await mcpService.initialize(config.mcpUrl);
      const tools = mcpService.getTools();
      
      const getDatabasesTool = tools.find((tool: MCPTool) => tool.name === 'get_database_names');
      if (getDatabasesTool) {
        const result = await getDatabasesTool.execute({ random_string: 'dummy' });
        if (result && Array.isArray(result)&&result[0]) {
          // console.log('result', result);
          try {
            const databases = JSON.parse(result[0].text);
            setDatabases(databases.database_names);
          } catch (error) {
            console.error('Failed to parse databases:', error);
          }
          
        }
      }
      
      await mcpService.disconnect();
    } catch (error) {
      console.error('Failed to load databases:', error);
    }
  };

  // 查询新闻数据时也只用featureStatus判断
  const queryNewsData = async () => {
    if (!isDatabaseAvailable) {
      toast({
        title: t('databaseNotAvailable'),
        description: t('databaseNotAvailableDesc'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const mcpService = MCPService.getInstance();
      await mcpService.initialize(config.mcpUrl);
      const tools = mcpService.getTools();
      
      const queryTool = tools.find((tool: MCPTool) => tool.name === 'query_databases');
      if (!queryTool) {
        throw new Error('Query tool not found');
      }

      // 计算日期范围 - 使用createtime字段和毫秒时间戳
      const now = new Date();
      const daysAgo = selectedTimePeriod === '1day' ? 1 : selectedTimePeriod === '7days' ? 7 : 14;
      const startTime = now.getTime() - daysAgo * 24 * 60 * 60 * 1000;

      // 构建查询SQL - 参考DatabaseSummaryPanel的查询方式
      let whereClause = `createtime >= ${startTime} AND isDelete == 0`;
      if (searchTerm.trim()) {
        whereClause += ` AND (title LIKE '%${searchTerm}%' OR text LIKE '%${searchTerm}%')`;
      }
      
      const sql = `SELECT id, title, text, url, createtime, tags, type, workspace FROM contents WHERE ${whereClause} ORDER BY createtime DESC LIMIT 100`;

      const result = await queryTool.execute({
        database_names: databases.length > 0 ? databases : [],
        sql: sql
      });

      if (result && Array.isArray(result) && result.length > 0 && result[0]?.text) {
        const newsData: NewsItem[] = [];
        
        try {
          // 参考DatabaseSummaryPanel的数据处理方式
          const responseData = JSON.parse(result[0].text);
          
          if (Array.isArray(responseData)) {
            responseData.forEach((dbResult: DatabaseResult) => {
              if (dbResult.contents && Array.isArray(dbResult.contents)) {
                dbResult.contents.forEach((item: DatabaseContent) => {
                  newsData.push({
                    id: String(item.id || `${Date.now()}-${Math.random()}`),
                    title: String(item.title || 'Untitled'),
                    text: String(item.text || ''),
                    url: String(item.url || ''),
                    tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
                    type: String(item.type || 'news'),
                    date: item.createtime ? new Date(item.createtime).toISOString() : new Date().toISOString()
                  });
                });
              }
            });
          }
        } catch (parseError) {
          console.error('Failed to parse database response:', parseError);
          throw new Error('Invalid database response format');
        }

        setNewsItems(newsData);
        
        toast({
          title: t('querySuccess'),
          description: t('querySuccessDesc', { count: newsData.length }),
        });
      }
      
      await mcpService.disconnect();
    } catch (error) {
      console.error('Failed to query news data:', error);
      toast({
        title: t('queryFailed'),
        description: t('queryFailedDesc', { error: error instanceof Error ? error.message : t('unknownError') }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 高级自定义SQL查询
  const handleCustomQuery = async () => {
    if (!isDatabaseAvailable) {
      toast({
        title: t('databaseNotAvailable'),
        description: t('databaseNotAvailableDesc'),
        variant: 'destructive',
      });
      return;
    }
    if (!customSQL.trim()) {
      toast({
        title: t('queryFailed'),
        description: t('请输入自定义SQL语句'),
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      const mcpService = MCPService.getInstance();
      await mcpService.initialize(config.mcpUrl);
      const tools = mcpService.getTools();
      const queryTool = tools.find((tool: MCPTool) => tool.name === 'query_databases');
      if (!queryTool) throw new Error('Query tool not found');
      const result = await queryTool.execute({
        database_names: databases.length > 0 ? databases : [],
        sql: customSQL
      });
      if (result && Array.isArray(result) && result.length > 0 && result[0]?.text) {
        const newsData: NewsItem[] = [];
        try {
          const responseData = JSON.parse(result[0].text);
          if (Array.isArray(responseData)) {
            responseData.forEach((dbResult: DatabaseResult) => {
              if (dbResult.contents && Array.isArray(dbResult.contents)) {
                dbResult.contents.forEach((item: DatabaseContent) => {
                  newsData.push({
                    id: String(item.id || `${Date.now()}-${Math.random()}`),
                    title: String(item.title || 'Untitled'),
                    text: String(item.text || ''),
                    url: String(item.url || ''),
                    tags: item.tags ? (typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags) : [],
                    type: String(item.type || 'news'),
                    date: item.createtime ? new Date(item.createtime).toISOString() : new Date().toISOString()
                  });
                });
              }
            });
          }
        } catch (parseError) {
          console.error('Failed to parse database response:', parseError);
          throw new Error('Invalid database response format');
        }
        setNewsItems(newsData);
        toast({
          title: t('querySuccess'),
          description: t('querySuccessDesc', { count: newsData.length }),
        });
      }
      await mcpService.disconnect();
    } catch (error) {
      console.error('Failed to query news data:', error);
      toast({
        title: t('queryFailed'),
        description: t('queryFailedDesc', { error: error instanceof Error ? error.message : t('unknownError') }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 页面渲染时如果featureStatus为空，提示用户去设置页面测试
  // 组件加载时不再主动检测数据库功能
  // useEffect(() => { checkDatabaseAvailability(); }, [config.mcpUrl]);

  // 自动查询数据
  useEffect(() => {
    if (isDatabaseAvailable && databases.length > 0) {
      queryNewsData();
    }
  }, [selectedTimePeriod, isDatabaseAvailable, databases]);

  // 页面加载或config变化时自动获取数据库列表
  useEffect(() => {
    if (config.mcpUrl && config.featureStatus?.databaseQuery) {
      loadDatabases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mcpUrl, config.featureStatus?.databaseQuery]);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // 截断文本
  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gradient-to-b from-green-50 via-emerald-50 to-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <Header currentPage="news" onSettingsClick={handleSettingsClick} />
      
      <div className="layout-container flex h-full grow flex-col">
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white p-4">
          <div className="w-full max-w-6xl mx-auto">
            {/* 主卡片容器 */}
            <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
              {/* 顶部信息栏 */}
              <div className="flex justify-between items-center text-sm text-[#6a7681] mb-6">
                <div className="flex items-center bg-green-100/80 rounded-full px-3 py-1">
                  <Newspaper className="h-4 w-4 text-green-600 mr-2" />
                  <span>{t('newsDatabase')}<span className="font-bold text-[#121416]">{t('realtimeData')}</span></span>
                </div>
                <div className="flex items-center text-[#6a7681]">
                  <Database className="h-4 w-4 mr-1" />
                  <span>{t('powered_by_database', { count: databases.length })}</span>
                </div>
              </div>

              {/* 主要内容卡片 */}
              <div className="bg-white shadow-xl rounded-2xl p-6">
                <h2 className="text-sm font-medium text-[#6a7681] mb-2">{t('newsCenter')}</h2>
                <h3 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-6">
                  {t('latestNewsAndInformation')}
                </h3>

                {/* 控制面板 */}
                <div className="mb-6 space-y-4">
                  {/* 时间段选择 */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedTimePeriod === '1day' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimePeriod('1day')}
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      {t('last1Day')}
                    </Button>
                    <Button
                      variant={selectedTimePeriod === '7days' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimePeriod('7days')}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      {t('last7Days')}
                    </Button>
                    <Button
                      variant={selectedTimePeriod === '14days' ? 'default' : 'outline'}
                      onClick={() => setSelectedTimePeriod('14days')}
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4" />
                      {t('last14Days')}
                    </Button>
                  </div>

                  {/* 搜索框和刷新按钮 + 高级SQL */}
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6a7681]" />
                      <Input
                        placeholder={t('searchNews')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl"
                        onKeyDown={(e) => e.key === 'Enter' && (customSQLMode ? handleCustomQuery() : queryNewsData())}
                        disabled={customSQLMode}
                      />
                    </div>
                    <Button
                      onClick={customSQLMode ? handleCustomQuery : queryNewsData}
                      disabled={loading || !isDatabaseAvailable}
                      className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white px-4"
                    >
                      {loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      {loading ? t('searching') : (customSQLMode ? t('search') + ' SQL' : t('search'))}
                    </Button>
                    {/* 高级SQL切换按钮 */}
                    <Button
                      variant={customSQLMode ? 'default' : 'outline'}
                      onClick={() => setCustomSQLMode((v) => !v)}
                      className="ml-2"
                    >
                      {customSQLMode ? t('关闭高级查询') : t('高级查询')}
                    </Button>
                  </div>
                  {/* 高级SQL输入区 */}
                  {customSQLMode && (
                    <div className="w-full flex gap-2 items-start mt-2">
                      <Textarea
                        placeholder="SELECT id, title, text, url, createtime, tags, type, workspace FROM contents WHERE ..."
                        value={customSQL}
                        onChange={(e) => setCustomSQL(e.target.value)}
                        className="min-h-[80px] border-2 border-[#dde1e3] focus:border-[#0c7ff2] focus:ring-0 rounded-xl text-sm"
                        rows={4}
                        spellCheck={false}
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={handleCustomQuery}
                          disabled={loading || !isDatabaseAvailable || !customSQL.trim()}
                          className="bg-[#0c7ff2] hover:bg-[#0a6fd8] text-white"
                        >
                          {loading ? t('searching') : t('执行SQL')}
                        </Button>
                        <div className="text-xs text-[#6a7681] max-w-[180px] mt-1">
                          {t('请谨慎输入SQL，结果将直接展示。')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 数据库状态 */}
                {!featureStatus || featureStatus.databaseQuery === undefined ? (
                  <div className="mb-6 p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                    <p className="text-sm text-[#6a7681]">
                      <strong className="text-[#121416]">{t('warning')}:</strong> {t('databaseFeatureNotAvailable')}<br />{t('pleaseTestMCPInSettings')}
                    </p>
                  </div>
                ) : !isDatabaseAvailable && (
                  <div className="mb-6 p-4 bg-yellow-50/50 border border-yellow-200/50 rounded-lg">
                    <p className="text-sm text-[#6a7681]">
                      <strong className="text-[#121416]">{t('warning')}:</strong> {t('databaseFeatureNotAvailable')}
                    </p>
                  </div>
                )}

                {/* 新闻列表 */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-[#0c7ff2]" />
                      <p className="text-[#6a7681]">{t('loadingNews')}</p>
                    </div>
                  ) : newsItems.length > 0 ? (
                    newsItems.map((item) => (
                      <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-[#121416] line-clamp-2">
                            {item.title}
                          </h4>
                          {item.date && (
                            <span className="text-xs text-[#6a7681] whitespace-nowrap ml-2">
                              {formatDate(item.date)}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[#6a7681] text-sm mb-3 line-clamp-3">
                          {truncateText(item.text)}
                        </p>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-wrap gap-1">
                            {item.tags && item.tags.length > 0 && item.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {item.type && (
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            )}
                          </div>
                          
                          {item.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="text-[#0c7ff2] hover:text-[#0a6fd8]"
                            >
                              {t('readMore')}
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Newspaper className="h-12 w-12 mx-auto mb-4 text-[#6a7681]" />
                      <p className="text-[#6a7681]">
                        {isDatabaseAvailable ? t('noNewsFound') : t('databaseNotConnected')}
                      </p>
                    </div>
                  )}
                </div>

                {/* 统计信息 */}
                {newsItems.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
                    <p className="text-sm text-[#6a7681]">
                      <strong className="text-[#121416]">{t('summary')}:</strong> 
                      {t('newsSearchSummary', { 
                        count: newsItems.length, 
                        period: t(selectedTimePeriod === '1day' ? 'last1Day' : selectedTimePeriod === '7days' ? 'last7Days' : 'last14Days')
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPage; 