import React from 'react';
import { TradeConfirmationProps } from 'types/trades';

export const TradeConfirmation: React.FC<TradeConfirmationProps> = ({ type, probability }) => (
  <div className="mt-2 text-center py-2 bg-gray-800 rounded-lg text-gray-300 animate-fade-in">
    {type === 'buy' ? 'Purchase' : 'Sale'} confirmed at {probability}%
  </div>
);