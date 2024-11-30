import { useState } from 'react';

interface UseTrading {
  processing: boolean;
  handleTrade: (type: 'buy' | 'sell', amount: string) => Promise<void>;
}

export const useTrading = (onComplete: (type: 'buy' | 'sell', amount: string) => void): UseTrading => {
  const [processing, setProcessing] = useState(false);

  const handleTrade = async (type: 'buy' | 'sell', amount: string) => {
    setProcessing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete(type, amount);
    setProcessing(false);
  };

  return { processing, handleTrade };
};
