import React from 'react';
import { Card } from '@/ui';
import ReviewRadarChart from '@/components/ReviewRadarChart';
import { Persona, Review } from '@/types';
import { personas } from '@/components/ReaderPersonas';

interface ResultsPageProps {
  results: Review[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ results }) => {
  // 将results按标题分组
  const groupedReviews: Record<string, Review[]> = results.reduce((acc, review) => {
    if (!acc[review.title]) {
      acc[review.title] = [];
    }
    acc[review.title].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* 主卡片容器 */}
        <div className="bg-white/70 backdrop-blur-sm shadow-lg rounded-xl p-6">
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight">Reader Simulator Results</p>
              <p className="text-[#6a7681] text-sm font-normal leading-normal">Explore detailed feedback and insights from your reader simulations.</p>
            </div>
          </div>

          {Object.entries(groupedReviews).map(([title, reviewsForTitle]) => {
            const overallScore = (reviewsForTitle.reduce((sum, r) => sum + r.score, 0) / reviewsForTitle.length * 10).toFixed(0);
            // Dummy overallChange for now, ideally derived from a baseline
            const overallChange = (Math.random() * 20 - 10).toFixed(0); // -10 to +10
            const firstReview = reviewsForTitle[0];
            
            return (
              <React.Fragment key={title}>
                <div className="bg-white shadow-xl rounded-2xl p-6 mb-6">
                  <h2 className="text-[#121416] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">{title}</h2>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[#dde1e3] p-6">
                      <p className="text-[#121416] text-base font-medium leading-normal">Reader Engagement Metrics</p>
                      <p className="text-[#121416] tracking-light text-[32px] font-bold leading-tight truncate">{overallScore}%</p>
                      <div className="flex gap-1">
                        <p className="text-[#6a7681] text-base font-normal leading-normal">Overall</p>
                        <p className={`text-base font-medium leading-normal ${parseFloat(overallChange) >= 0 ? 'text-[#078838]' : 'text-red-500'}`}>{parseFloat(overallChange) > 0 ? '+' : ''}{overallChange}%</p>
                      </div>
                      <ReviewRadarChart reviewsForTitle={reviewsForTitle} />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {firstReview.tags.map((tag, tagIndex) => (
                      <div key={tagIndex} className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl bg-[#f1f2f4] pl-4 pr-4">
                        <p className="text-[#121416] text-sm font-medium leading-normal">{tag}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[#121416] text-base font-normal leading-normal mt-4">
                    {firstReview.comment}
                  </p>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 