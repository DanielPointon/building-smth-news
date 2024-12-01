import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Coins, DollarSign, Globe, Map } from 'lucide-react';
import { NavbarBalance } from './NavbarBalance';
import { NavbarProps } from '../../types/navbar';
import { Balance } from '../../types/balance';
import { COLORS } from '../../constants/color';

const BALANCES: Balance[] = [
  { currency: 'Prisms', amount: '1,234', icon: Coins },
];

export const Navbar: React.FC<NavbarProps> = ({ onHistoryClick, onGlobalClick, onExplorerClick, className = '' }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[rgb(38,42,51)] text-white border-b border-gray-700">
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => navigate('/')}
          className="text-2xl font-bold font-georgia text-white hover:text-[rgb(13,118,128)] transition-colors"
        >
          Delphi
        </button>
        <button
          className="flex items-center space-x-3 hover:text-[rgb(13,118,128)] transition-colors"
          onClick={onHistoryClick}
        >
          <History className="w-6 h-6" />
          <span className="text-lg">History</span>
        </button>
        <button
          className="flex items-center space-x-3 hover:text-[rgb(13,118,128)] transition-colors"
          onClick={() => navigate('/global')}
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