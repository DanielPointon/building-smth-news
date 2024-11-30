import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { TradingModal } from './TradingModal';
import { TradeConfirmation } from './TradeConfirmation';
import { TradingButtonsProps } from 'types/trades';

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
          className="flex-1 py-3 px-4 bg-[rgb(13,118,128)] hover:bg-[rgb(11,98,108)] text-white transition-colors flex items-center justify-center gap-2 font-georgia rounded-xl"
        >
          <DollarSign size={16} />
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