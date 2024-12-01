import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { TradingModal } from './TradingModal';
import { TradeConfirmation } from './TradeConfirmation';
import { TradingButtonsProps } from 'types/trades';
import PrismIcon from 'components/prism';

export const TradingButtons: React.FC<TradingButtonsProps> = ({ question, setQuestionData }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell' | null>(null);

  const handleTradeComplete = (type: 'buy' | 'sell', amount: number) => {
    setTradeType(type);
    setShowConfirm(true);

    setQuestionData(question);
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setShowModal(true)}
          className="flex-1 py-3 px-4 bg-[rgb(13,118,128)] hover:bg-[rgb(11,98,108)] text-white transition-colors flex items-center justify-center gap-2 font-georgia rounded-xl"
        >
          <PrismIcon />
          Trade
        </button>
      </div>
      <TradingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        probability={question.probability ?? 50}
        marketId={question.id}
        onTrade={handleTradeComplete}
      />
      {showConfirm && tradeType && (
        <TradeConfirmation type={tradeType} probability={question.probability ?? 50} />
      )}
    </>
  );
};
