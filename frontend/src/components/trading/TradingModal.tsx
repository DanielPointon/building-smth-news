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
      <div className="bg-white p-6 w-96 border border-gray-200">
        <h3 className="text-xl font-georgia mb-6 text-gray-800">Confirm Trade</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 p-3">
            <label className="text-sm text-gray-500 font-georgia">Amount of shares</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent border-none text-lg text-gray-800 focus:outline-none font-georgia"
              placeholder="0"
              min="0"
            />
          </div>
          <div className="text-sm text-gray-500 font-georgia">
            Current probability: <span className="text-[rgb(13,118,128)]">{probability}%</span>
          </div>
          {processing ? (
            <div className="flex items-center justify-center h-12 bg-gray-50">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(13,118,128)]"></div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleTrade('buy')}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white transition-colors font-georgia"
              >
                Buy
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white transition-colors font-georgia"
              >
                Sell
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full text-gray-500 hover:text-gray-700 text-sm mt-4 font-georgia"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
