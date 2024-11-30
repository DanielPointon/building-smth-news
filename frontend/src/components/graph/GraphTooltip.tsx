import React from 'react';
import { GraphTooltipProps } from '../../types/graph';

export const GraphTooltip: React.FC<GraphTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg backdrop-blur-sm bg-opacity-90">
      <p className="text-gray-200">{label}</p>
      <p className="text-blue-400 font-bold">{`${payload[0].value}%`}</p>
    </div>
  );
};