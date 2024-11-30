import React from 'react';
import { ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction, TransactionHistoryProps } from 'types/trades';
import { useTransactions } from 'hooks/useTransactions';

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'buy',
    question: "Will AI surpass human intelligence by 2030?",
    amount: 100,
    price: 58,
    date: "2024-04-01"
  },
  {
    id: '2',
    type: 'sell',
    question: "Will SpaceX successfully land on Mars by 2026?",
    amount: 50,
    price: 64,
    date: "2024-03-28"
  }
];

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ isOpen, onClose }) => {
  const { transactions } = useTransactions();

  return (
    <div 
      className={`
        fixed right-0 top-0 h-full w-96 
        bg-[rgb(255,241,229)] border-l border-[rgb(242,223,206)] 
        transform transition-transform 
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} 
        z-50 shadow-xl
      `}
    >
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-georgia text-[rgb(38,42,51)]">Transaction History</h2>
          <button 
            onClick={onClose} 
            className="text-[rgb(38,42,51)] hover:text-[rgb(13,118,128)] transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 bg-[rgb(242,223,206)] rounded-lg shadow-md">
              <div className="flex items-center gap-2 mb-2">
                {tx.type === 'buy' ? (
                  <ArrowUpCircle size={18} className="text-[rgb(13,118,128)]" />
                ) : (
                  <ArrowDownCircle size={18} className="text-red-500" />
                )}
                <span className="text-sm font-georgia text-[rgb(38,42,51)]">
                  {tx.type === 'buy' ? 'Bought' : 'Sold'} at {tx.price}%
                </span>
              </div>
              <p className="text-sm text-[rgb(38,42,51)] mb-2 font-georgia">{tx.question}</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-georgia">{tx.amount} shares</span>
                <span className="font-georgia">{tx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;