import React from 'react';
import { ReferenceLine } from 'recharts';
import { EventLabelProps } from '../../types/graph';

export const EventLabel: React.FC<EventLabelProps> = ({ event, color }) => (
  <ReferenceLine
    x={event.date}
    stroke={color}
    strokeDasharray="3 3"
    label={{
      value: event.title,
      position: 'top',
      fill: color,
      fontSize: 10,
      textAnchor: 'middle',
      angle: -45,
      offset: 10,
    }}
  />
);
