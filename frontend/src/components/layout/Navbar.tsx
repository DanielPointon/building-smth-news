import React from 'react';
import { History, Globe, Map } from 'lucide-react';
import { NavbarBalance } from './NavbarBalance';
import { NavbarProps } from '../../types/navbar';
import { Balance } from '../../types/balance';

const BALANCES: Balance[] = [
  { currency: 'PRC', amount: '1,234', icon: History },
  { currency: 'USD', amount: '5,678', icon: Globe }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  onHistoryClick, 
  onGlobalClick, 
  onExplorerClick, 
  className = '' 
}) => {
  return (
    <header className="border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-black text-white py-2 px-4 text-center text-sm">
        <span>PREDICTION MARKETS LIVE</span>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-8">
            <h1 className="font-serif text-2xl font-bold">THE </h1>
            <nav className="hidden md:flex space-x-6">
              <button onClick={onHistoryClick} className="text-gray-600 hover:text-black">History</button>
              <button onClick={onGlobalClick} className="text-gray-600 hover:text-black">Global</button>
              <button onClick={onExplorerClick} className="text-gray-600 hover:text-black">Explorer</button>
            </nav>
          </div>

          {/* Right Section */}
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
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-6 py-3 text-sm">
            <a href="#" className="text-gray-900 font-medium">Markets</a>
            <a href="#" className="text-gray-500 hover:text-black">Technology</a>
            <a href="#" className="text-gray-500 hover:text-black">Politics</a>
            <a href="#" className="text-gray-500 hover:text-black">Science</a>
            <a href="#" className="text-gray-500 hover:text-black">Climate</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;