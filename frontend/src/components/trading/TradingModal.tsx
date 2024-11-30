import React, { useState } from 'react';
import { TradingModalProps, TradingButtonsProps } from '../../types/trades';

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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] font-serif">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold">Place Your Prediction</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2">Amount of shares</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-b border-gray-200 text-xl py-2 focus:outline-none focus:border-gray-400"
              placeholder="0"
              min="0"
            />
          </div>

          <div className="text-sm text-gray-500">
            Current probability: <span className="font-bold text-gray-900">{probability}%</span>
          </div>

          {processing ? (
            <div className="h-12 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTrade('buy')}
                className="bg-green-800 text-white py-3 hover:bg-green-900 transition-colors"
              >
                Buy
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="bg-red-800 text-white py-3 hover:bg-red-900 transition-colors"
              >
                Sell
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
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

export const TradingButtons: React.FC<TradingButtonsProps> = ({ probability }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-gray-900 text-white py-3 hover:bg-gray-800 transition-colors font-serif"
      >
        Trade Now
      </button>
      <TradingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        probability={probability}
        onTrade={() => {}}
      />
    </>
  );
};