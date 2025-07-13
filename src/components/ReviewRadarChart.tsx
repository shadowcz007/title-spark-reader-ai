import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Persona, Review } from '@/types';
import { personas } from '@/components/ReaderPersonas'; // Assuming personas data is available here

interface ReviewRadarChartProps {
  reviewsForTitle: Review[];
}

const ReviewRadarChart: React.FC<ReviewRadarChartProps> = ({ reviewsForTitle }) => {
  // For simplicity, we'll use all available personas for the chart axes
  // In a real application, you might filter this to only personas with reviews
  const allPersonas = personas.map(p => p.name); 

  const radarData = allPersonas.map(personaName => {
    const foundReview = reviewsForTitle.find(r => r.persona.name === personaName);
    return {
      persona: personaName,
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
          <Radar name="评分" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewRadarChart; 