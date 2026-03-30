
import React from 'react';

interface PlaceholderViewProps {
  title: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">{title}</h2>
      <p className="text-gray-500">Placeholder per implementazione futura.</p>
      <div className="mt-8 w-24 h-24 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
};

export default PlaceholderView;
