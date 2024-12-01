import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EventLabel } from './EventLabel';
import { GraphTooltip } from './GraphTooltip';
import { ProbabilityGraphProps } from '../../types/graph';

export const EVENT_COLORS = [
  "#0D7680", // Primary teal
  "#4F46E5", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899"  // Pink
];

export const ProbabilityGraph: React.FC<ProbabilityGraphProps> = ({ data, events }) => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 30, right: 20, bottom: 20, left: 20 }}
        >
          <rect 
            width="100%" 
            height="100%" 
            fill="#F2DFce" 
            fillOpacity={0.3} 
          />
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB" 
            opacity={0.5} 
          />
          
          <XAxis 
            dataKey="date" 
            stroke="#262A33"
            tick={{ fill: '#262A33', fontSize: 12 }}
            tickLine={{ stroke: '#262A33' }}
          />
          
          <YAxis 
            domain={[0, 100]} 
            stroke="#262A33"
            tick={{ fill: '#262A33', fontSize: 12 }}
            tickLine={{ stroke: '#262A33' }}
            tickFormatter={(value) => `${value}%`}
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
            type="monotoneX" 
            dataKey="probability" 
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ 
              r: 8,
              fill: "#8B5CF6",
              stroke: "#fff",
              strokeWidth: 2
            }}
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProbabilityGraph;