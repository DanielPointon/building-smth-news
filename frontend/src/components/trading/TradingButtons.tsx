import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { TradingModal } from './TradingModal';
import { TradeConfirmation } from './TradeConfirmation';
import { TradingButtonsProps } from 'types/trades';
import { COLORS } from '../../constants/color';

export const TradingButtons: React.FC<TradingButtonsProps> = ({ probability }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null);

  const handleTradeComplete = (type: 'buy' | 'sell', amount: string) => {
    setTradeType(type);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center gap-2"
        >
          <DollarSign size={16} className="text-white" />
          Trade
        </button>
      </div>
      <TradingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        probability={probability}
        onTrade={handleTradeComplete}
      />
      {showConfirm && tradeType && (
        <TradeConfirmation type={tradeType} probability={probability} />
      )}
    </>
  );
};