import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Input } from '@/ui';
import { Sparkles, Users, ArrowLeft, Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import { getTranslatedPersonas } from '@/components/ReaderPersonas';
import { useLLMConfig } from '@/hooks/use-llm-config';
import { useTranslation } from 'react-i18next';

const ReadersPage: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useLLMConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { t } = useTranslation();

  // 获取翻译后的personas数据
  const personas = getTranslatedPersonas(t);

  const handleBackClick = () => {
    navigate('/');
  };

  // 过滤读者画像
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         persona.characteristics.some(char => char.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // 根据特征分类
    const categories = {
      'professional': ['Professional', 'Data Analyst', 'FinTech Professional'],
      'creative': ['Creative Professional', 'Fashion Designer', 'Visual Designer', 'AI Designer'],
      'tech': ['Tech Enthusiast', 'AI Designer'],
      'media': ['Tech Media Editor', 'Public Art Curator']
    };
    
    return matchesSearch && categories[selectedCategory as keyof typeof categories]?.includes(persona.name);
  });

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: 'Newsreader, "Noto Sans", sans-serif' }}>
      <Header currentPage="readers" onSettingsClick={() => navigate('/settings')} />
      <div className="layout-container flex h-full grow flex-col">
        <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white p-4">
          <div className="w-full max-w-7xl mx-auto">
          
            {/* 主标题 */}
            <div className="text-center mb-8">
              <h1 className="text-[#121416] text-[32px] font-bold leading-tight tracking-[-0.015em] mb-2">
                {t('readerPersonasLibrary')}
              </h1>
              <p className="text-[#6a7681] text-lg">
                {t('theseReaderPersonasRepresentDifferentUserGroups')}
                {t('inTitleAnalysisProcess')}
                {t('theSystemWillSimulateThePerspectiveOfTheseReaders')}
                {t('toProvideMultiDimensionalFeedbackAndSuggestionsForYourTitles')}
                {t('youCanChooseOneOrMorePersonasForAnalysis')}
                {t('toObtainMoreComprehensiveOptimizationSuggestions')}
           
              </p>
            </div>

            {/* 搜索和过滤 */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6a7681]" />
                  <Input
                    type="text"
                    placeholder={t('searchReaderPersonas')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80 backdrop-blur-sm border-[#dde1e3] focus:border-[#0c7ff2]"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: t('all') },
                    { key: 'professional', label: t('professional') },
                    { key: 'creative', label: t('creative') },
                    { key: 'tech', label: t('tech') },
                    { key: 'media', label: t('media') }
                  ].map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-[#0c7ff2] text-white'
                          : 'bg-white/80 text-[#6a7681] hover:bg-[#0c7ff2] hover:text-white'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 统计信息 */}
              <div className="text-center mt-4">
                <p className="text-[#6a7681] text-sm">
                  {t('display')} <span className="font-semibold text-[#0c7ff2]">{filteredPersonas.length}</span> {t('readerPersonas')}
                  {searchTerm && (
                    <span className="ml-2">
                      ({t('search')}: "{searchTerm}")
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* 读者画像网格 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPersonas.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-8 max-w-md mx-auto">
                    <Search className="h-12 w-12 text-[#6a7681] mx-auto mb-4" />
                    <h3 className="text-[#121416] text-lg font-semibold mb-2">{t('noMatchingReaderPersonasFound')}</h3>
                    <p className="text-[#6a7681]">{t('pleaseAdjustSearchConditionsOrCategoryFilters')}</p>
                  </div>
                </div>
              ) : (
                                filteredPersonas.map((persona) => {
                  const IconComponent = persona.icon;
                  return (
                    <Card
                      key={persona.id}
                      className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 hover:shadow-2xl transition-all duration-300"
                    >
                      {/* 头像和基本信息 */}
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${persona.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#121416] text-xl font-bold mb-2">{persona.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {persona.characteristics.map((characteristic, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                              >
                                {characteristic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 详细描述 */}
                      <div className="mb-6">
                        <h4 className="text-[#121416] font-semibold mb-3 text-sm uppercase tracking-wide text-[#6a7681]">
                          {t('detailedDescription')}
                        </h4>
                        <p className="text-[#6a7681] leading-relaxed">
                          {persona.description}
                        </p>
                      </div>

                      {/* 特征标签 */}
                      <div>
                        <h4 className="text-[#121416] font-semibold mb-3 text-sm uppercase tracking-wide text-[#6a7681]">
                          {t('coreCharacteristics')}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {persona.characteristics.map((characteristic, index) => (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-[#121416] font-medium"
                            >
                              {characteristic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadersPage; 