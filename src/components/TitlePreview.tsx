
import React from 'react';
import { Card } from '@/components/ui/card';
import { Eye } from 'lucide-react';

interface TitlePreviewProps {
  title: string;
}

export const TitlePreview: React.FC<TitlePreviewProps> = ({ title }) => {
  return (
    <Card className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-600">标题预览</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 leading-tight">
        {title}
      </h3>
      <p className="text-xs text-gray-500 mt-2">
        字数: {title.length} 字
      </p>
    </Card>
  );
};
