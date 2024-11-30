import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EventLabel } from './EventLabel';
import { GraphTooltip } from './GraphTooltip';
import { ProbabilityGraphProps } from '../../types/graph';

export const EVENT_COLORS = [
  "#8B5CF6", // Purple
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444"  // Red
];

export const ProbabilityGraph: React.FC<ProbabilityGraphProps> = ({ data, events }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 30, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="chartBackground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.05)" />
            </linearGradient>
            <linearGradient id="probabilityLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#chartBackground)" />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip content={<GraphTooltip />} />
          
          {events?.map((event, index) => (
            <EventLabel 
              key={index} 
              event={event} 
              color={EVENT_COLORS[index % EVENT_COLORS.length]} 
            />
          ))}
          
          <Line 
            type="monotone" 
            dataKey="probability" 
            stroke="url(#probabilityLine)"
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 8,
              fill: "#8B5CF6",
              stroke: "#fff",
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
