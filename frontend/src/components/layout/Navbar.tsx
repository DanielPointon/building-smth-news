import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Coins, DollarSign, Globe, Map } from 'lucide-react';
import { NavbarBalance } from './NavbarBalance';
import { NavbarProps } from '../../types/navbar';
import { Balance } from '../../types/balance';
import PrismIcon from 'components/prism';

const BALANCES: Balance[] = [
  { currency: 'Prisms', amount: '1,234', icon: PrismIcon },
];

export const Navbar: React.FC<NavbarProps> = ({ onHistoryClick, onGlobalClick, onExplorerClick, className = '' }) => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-6 bg-gradient-to-r from-[rgb(38,42,51)] to-[rgb(48,52,61)] text-gray-200 shadow-md border-b border-gray-700">
      <div className="flex items-center space-x-6">
        {/* Brand Logo */}
        <button 
          onClick={() => navigate('/')}
          className="text-2xl font-bold font-georgia text-gray-100 hover:text-[#FFD700] transition-colors"
        >
          Delphi
        </button>
        {/* Navigation Links */}
        <button
          className="flex items-center space-x-3 text-gray-300 hover:text-[#FFD700] transition-colors"
          onClick={() => navigate('/global')}
        >
          <Globe className="w-6 h-6" />
          <span className="text-lg">Global</span>
        </button>
        <button
          className="flex items-center space-x-3 text-gray-300 hover:text-[#FFD700] transition-colors"
          onClick={onExplorerClick}
        >
          <Map className="w-6 h-6" />
          <span className="text-lg">Explorer</span>
        </button>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Balances */}
        {BALANCES.map((balance, idx) => (
          <NavbarBalance
            key={idx}
            currency={balance.currency}
            amount={balance.amount}
            icon={balance.icon}
          />
        ))}
        {/* History Button */}
        <button
          className="flex items-center space-x-3 text-gray-300 hover:text-[#FFD700] transition-colors"
          onClick={onHistoryClick}
        >
          <History className="w-6 h-6" />
          <span className="text-lg">History</span>
        </button>
      </div>
    </nav>
  );
};
