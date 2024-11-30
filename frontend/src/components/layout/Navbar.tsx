import React from 'react';
import { History, Coins, DollarSign } from 'lucide-react';
import { NavbarBalance } from './NavbarBalance';
import { NavbarProps } from '../../types/navbar';
import { Balance } from '../../types/balance';
import { COLORS } from '../../constants/color';

const BALANCES: Balance[] = [
  { currency: 'PRC', amount: '1,234', icon: Coins },
  { currency: 'USD', amount: '5,678', icon: DollarSign }
];

export const Navbar: React.FC<NavbarProps> = ({ onHistoryClick, className = '' }) => {
  return (
    <nav className={`fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm ${className}`}>
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-500">Prediction Market</h1>
        
        <div className="flex items-center gap-6">
          {BALANCES.map((balance, idx) => (
            <NavbarBalance 
              key={idx}
              currency={balance.currency}
              amount={balance.amount}
              icon={balance.icon}
            />
          ))}

          <button
            onClick={onHistoryClick}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="View transaction history"
          >
            <History size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};