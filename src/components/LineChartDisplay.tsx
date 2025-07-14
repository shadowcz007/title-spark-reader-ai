import React from 'react';
import { useTranslation } from 'react-i18next';

interface LineChartDisplayProps {
  data: {
    engagement: number;
    clarity: number;
    relevance: number;
    interest: number;
    understanding: number;
  };
}

const LineChartDisplay: React.FC<LineChartDisplayProps> = ({ data }) => {
  const { t } = useTranslation();
  // For simplicity, we'll use fixed points for the SVG path, but scale them based on input data
  // Max score is 100 for percentage
  const points = [
    data.engagement,
    data.clarity,
    data.relevance,
    data.interest,
    data.understanding,
  ];

  // Normalize points to SVG viewBox (max height 148, min 1)
  const scaleY = (value: number) => 149 - (value / 100) * 148; // Scale 0-100 to 149-1 (inverted Y axis in SVG)

  const getPathD = () => {
    const totalPoints = points.length;
    const segmentWidth = 472 / (totalPoints - 1);
    
    let d = `M0 ${scaleY(points[0])}`;
    for (let i = 1; i < totalPoints; i++) {
      d += `L${i * segmentWidth} ${scaleY(points[i])}`;
    }
    return d;
  };

  // Calculate fill path for the area under the line
  const getFillPathD = () => {
    const totalPoints = points.length;
    const segmentWidth = 472 / (totalPoints - 1);
    
    let d = `M0 ${scaleY(points[0])}`;
    for (let i = 1; i < totalPoints; i++) {
      d += `L${i * segmentWidth} ${scaleY(points[i])}`;
    }
    d += `L472 149 L0 149Z`; // Close the path at the bottom
    return d;
  };

  return (
    <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
      <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path
          d={getFillPathD()}
          fill="url(#paint0_linear_1131_5935)"
        ></path>
        <path
          d={getPathD()}
          stroke="#6a7681"
          strokeWidth="3"
          strokeLinecap="round"
        ></path>
        <defs>
          <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f1f2f4"></stop>
            <stop offset="1" stopColor="#f1f2f4" stopOpacity="0"></stop>
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-around">
        <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{t('engagement')}</p>
        <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{t('clarity')}</p>
        <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{t('relevance')}</p>
        <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{t('interest')}</p>
        <p className="text-[#6a7681] text-[13px] font-bold leading-normal tracking-[0.015em]">{t('understanding')}</p>
      </div>
    </div>
  );
};

export default LineChartDisplay; 