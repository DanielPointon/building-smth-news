import React, { useContext, useState } from 'react';
import { DollarSign } from 'lucide-react';
import { TradingModalProps } from 'types/trades';
import { MarketsClient } from 'utils/MarketsClient';
import { ApiContentContext, UserContext } from 'App';

export const TradingModal: React.FC<TradingModalProps> = ({
  isOpen,
  onClose,
  probability,
  marketId,
  onTrade
}) => {
  const [amount, setAmount] = useState<number>(1);
  const [processing, setProcessing] = useState(false);
  const [_reloadKey, setReloadKey] = useContext(ApiContentContext);

  const userId = useContext(UserContext);

  if (!isOpen) return null;

  const handleTrade = (type: 'buy' | 'sell') => {
    setProcessing(true);

    // market order
    let price;
    if (type == "buy") {
      price = 100;
    } else {
      price = 0;
    }

    const client = new MarketsClient();
    client.createOrder(marketId, {
      user_id: userId,
      side: type == "buy" ? "bid" : "ask",
      price: price,
      quantity: amount
    }).then(() => {
      setReloadKey(k => k + 1);

      onTrade(type, amount);
      setProcessing(false);
      onClose();
      console.log("refreshed")
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[rgb(255,241,229)] p-6 w-96 shadow-lg">
        <h3 className="text-xl font-georgia mb-6 text-[rgb(38,42,51)]">Confirm Trade</h3>
        <div className="space-y-4">
          <div className="bg-[rgb(242,223,206)] p-3">
            <label className="text-sm text-[rgb(38,42,51)] font-georgia">Amount of shares</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              className="w-full bg-transparent border-none text-lg text-[rgb(38,42,51)] focus:outline-none font-georgia placeholder-gray-500"
              placeholder="0"
              min="0"
            />
          </div>
          <div className="text-sm text-[rgb(38,42,51)] font-georgia">
            Current probability: <span className="text-[rgb(13,118,128)]">{probability}%</span>
          </div>
          {processing ? (
            <div className="flex items-center justify-center h-12 bg-[rgb(242,223,206)]">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(13,118,128)]"></div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => handleTrade('buy')}
                className="flex-1 py-3 px-4 bg-[rgb(13,118,128)] hover:bg-[rgb(11,98,108)] text-white transition-colors font-georgia rounded-xl"
              >
                Higher
              </button>
              <button
                onClick={() => handleTrade('sell')}
                className="flex-1 py-3 px-4 bg-[rgb(13,118,128)] hover:bg-[rgb(11,98,108)] text-white transition-colors font-georgia rounded-xl"
              >
                Lower
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full text-[rgb(38,42,51)] hover:text-[rgb(13,118,128)] text-sm mt-4 font-georgia transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
