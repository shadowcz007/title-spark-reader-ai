import React, { useState } from 'react';
import { Card, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, ChartContainer } from '@/ui';
import { Star, ThumbsUp, Lightbulb, Filter, SortAsc, SortDesc } from 'lucide-react';
import ReviewRadarChart from '@/components/ReviewRadarChart'; // Import the new component
import { Review, Persona } from '@/types'; // Import Review and Persona types
import { personas } from '@/components/ReaderPersonas'; // Import personas data

interface MultiReviewResultsProps {
  reviews: Review[];
  onRegenerate?: () => void;
}

export const MultiReviewResults: React.FC<MultiReviewResultsProps> = ({
  reviews,
  onRegenerate
}) => {
  const [sortBy, setSortBy] = useState<'score' | 'title' | 'persona'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterPersona, setFilterPersona] = useState<string>('all');
  const [filterScore, setFilterScore] = useState<string>('all');

  // Group by title
  const groupedByTitle = reviews.reduce((acc, review) => {
    if (!acc[review.title]) acc[review.title] = [];
    acc[review.title].push(review);
    return acc;
  }, {} as Record<string, Review[]>);

  // Statistics for all personas (used by ReviewRadarChart)
  const allPersonas = personas.map(p => p.name);

  // Sorting and filtering logic
  const sortedAndFilteredReviews = reviews
    .filter(review => {
      if (filterPersona !== 'all' && review.persona.name !== filterPersona) return false;
      if (filterScore !== 'all') {
        const score = parseInt(filterScore);
        if (score === 8 && review.score < 8) return false;
        if (score === 6 && (review.score < 6 || review.score >= 8)) return false;
        if (score === 4 && review.score >= 6) return false;
      }
      return true;
    })
          .sort((a, b) => {
        let aValue: number | string, bValue: number | string;
        
        switch (sortBy) {
          case 'score':
            aValue = a.score;
            bValue = b.score;
            break;
          case 'title':
            aValue = a.title;
            bValue = b.title;
            break;
          case 'persona':
            aValue = a.persona.name;
            bValue = b.persona.name;
            break;
          default:
            aValue = a.score;
            bValue = b.score;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreText = (score: number) => {
    if (score >= 8) return 'Highly Attractive';
    if (score >= 6) return 'Moderately Attractive';
    return 'Low Attraction';
  };

  const getAverageScore = () => {
    if (sortedAndFilteredReviews.length === 0) return 0;
    const total = sortedAndFilteredReviews.reduce((sum, review) => sum + review.score, 0);
    return (total / sortedAndFilteredReviews.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(reviews.reduce((sum, r) => sum + r.score, 0) / (reviews.length || 1)).toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reviews.filter(r => r.score >= 8).length}</div>
              <div className="text-sm text-gray-600">High Score Reviews</div>
            </div>
          </div>
          {onRegenerate && ( 
            <Button onClick={onRegenerate} variant="outline" size="sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          )}
        </div>
      </Card>

      {/* Multi-angle title grouping display */}
      <div className="space-y-8">
        {Object.entries(groupedByTitle).map(([title, reviewsForTitle]) => {
          // Calculate scores for each persona
          // Replaced direct RadarChart with ReviewRadarChart component
          const totalScore = reviewsForTitle.reduce((sum, r) => sum + r.score, 0);
          const avgScore = (totalScore / reviewsForTitle.length).toFixed(1);
          return (
            <Card key={title} className="p-6 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{title}</h3>
                  <div>
                    <span className="text-green-600 font-bold mr-4">Total Score: {totalScore}</span>
                    <span className="text-blue-600 font-bold">Average Score: {avgScore}</span>
                  </div>
                </div>
                <div className="w-full md:w-96 h-64">
                  <ReviewRadarChart reviewsForTitle={reviewsForTitle} />
                </div>
              </div>
              {/* Persona score table */}
              <div className="overflow-x-auto mt-2">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {allPersonas.map(persona => (
                        <th key={persona} className="px-2 py-1">{persona}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {allPersonas.map(persona => {
                        const found = reviewsForTitle.find(r => r.persona.name === persona);
                        return (
                          <td key={persona} className="px-2 py-1 text-center">{found ? found.score : '-'}</td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>

      {reviews.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No matching review results</p>
            <p className="text-sm">Please adjust filter conditions or regenerate reviews</p>
          </div>
        </Card>
      )}
    </div>
  );
}; 