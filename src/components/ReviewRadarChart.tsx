import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Persona, Review } from '@/types';
import { personaData } from '@/components/ReaderPersonas'; // 正确导入 personas 数据
import { useTranslation } from 'react-i18next';

interface ReviewRadarChartProps {
  reviewsForTitle: Review[];
}

const ReviewRadarChart: React.FC<ReviewRadarChartProps> = ({ reviewsForTitle }) => {
  const { t } = useTranslation();
  // For simplicity, we'll use all available personas for the chart axes
  // In a real application, you might filter this to only personas with reviews
  const allPersonas = personaData.map(p => p.id); // 使用 id 作为唯一标识

  const radarData = allPersonas.map(personaId => {
    const foundReview = reviewsForTitle.find(r => r.persona.id === personaId);
    // 这里用 id 匹配，保证唯一性
    return {
      persona: personaId,
      score: foundReview ? foundReview.score : 0, // Default to 0 if no review for this persona
    };
  });

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={radarData} outerRadius="80%">
          <PolarGrid />
          <PolarAngleAxis dataKey="persona" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          <Radar name={t('score')} dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewRadarChart; 