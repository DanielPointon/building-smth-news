// /frontend/src/components/layout/Navbar.tsx

import React from 'react';
import { History, Coins, DollarSign, Globe, Map } from 'lucide-react';
import { NavbarBalance } from './NavbarBalance';
import { NavbarProps } from '../../types/navbar';
import { Balance } from '../../types/balance';
import { COLORS } from '../../constants/color';

const BALANCES: Balance[] = [
  { currency: 'PRC', amount: '1,234', icon: Coins },
  { currency: 'USD', amount: '5,678', icon: DollarSign }
];

export const Navbar: React.FC<NavbarProps> = ({ onHistoryClick, onGlobalClick, onExplorerClick, className = '' }) => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[rgb(38,42,51)] text-white border-b border-gray-700">
      <div className="flex items-center space-x-6">
        <span className="text-2xl font-bold font-georgia text-white">Prediction Market</span>
        <button
          className="flex items-center space-x-3 hover:text-[rgb(13,118,128)] transition-colors"
          onClick={onHistoryClick}
        >
          <History className="w-6 h-6" />
          <span className="text-lg">History</span>
        </button>
        <button
          className="flex items-center space-x-3 hover:text-[rgb(13,118,128)] transition-colors"
          onClick={onGlobalClick}
        >
          <Globe className="w-6 h-6" />
          <span className="text-lg">Global</span>
        </button>
        <button
          className="flex items-center space-x-3 hover:text-[rgb(13,118,128)] transition-colors"
          onClick={onExplorerClick}
        >
          <Map className="w-6 h-6" />
          <span className="text-lg">Explorer</span>
        </button>
      </div>
      <div className="flex items-center space-x-6">
        {BALANCES.map((balance, idx) => (
          <NavbarBalance
            key={idx}
            currency={balance.currency}
            amount={balance.amount}
            icon={balance.icon}
          />
        ))}
      </div>
    </nav>
  );
};