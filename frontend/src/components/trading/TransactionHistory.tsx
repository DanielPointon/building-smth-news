import React from 'react';
import { ChevronRight, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Transaction, TransactionHistoryProps } from 'types/trades';

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
  return (
    <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-800 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-purple-400">Transaction History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="space-y-3">
          {SAMPLE_TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {tx.type === 'buy' ? (
                  <ArrowUpCircle size={16} className="text-green-400" />
                ) : (
                  <ArrowDownCircle size={16} className="text-red-400" />
                )}
                <span className="text-sm font-medium text-gray-300">
                  {tx.type === 'buy' ? 'Bought' : 'Sold'} at {tx.price}%
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">{tx.question}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{tx.amount} shares</span>
                <span>{tx.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
