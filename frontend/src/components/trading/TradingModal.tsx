import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { TradingModalProps } from 'types/trades';

export const TradingModal: React.FC<TradingModalProps> = ({ 
  isOpen, 
  onClose, 
  probability, 
  onTrade 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);

  if (!isOpen) return null;

  const handleTrade = (type: 'buy' | 'sell') => {
    setProcessing(true);
    setTimeout(() => {
      onTrade(type, amount);
      setProcessing(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 border border-gray-200">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Confirm Trade</h3>
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <label className="text-sm text-gray-500">Amount of shares</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-none text-lg text-gray-800 focus:outline-none"
              placeholder="0"
              min="0"
            />
          </div>
          <div className="text-sm text-gray-500">
            Current probability: <span className="text-purple-500">{probability}%</span>
          </div>
          {processing ? (
            <div className="flex items-center justify-center h-10 bg-gray-100 rounded-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleTrade('buy')}
                className="flex-1 py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Buy
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="flex-1 py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                Sell
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};