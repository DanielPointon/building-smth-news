import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, User, Star, Clock } from 'lucide-react';
import { TabRoute, NavigationTab } from '../../types/navigation';
import { COLORS } from '../../constants/color';

const TABS: NavigationTab[] = [
  {
    id: 'browse',
    label: 'Browse',
    path: '/browse',
    icon: Compass
  },
  {
    id: 'my-questions',
    label: 'My Questions',
    path: '/my-questions',
    icon: User
  },
  {
    id: 'following',
    label: 'Following',
    path: '/following',
    icon: Star
  },
  {
    id: 'history',
    label: 'History',
    path: '/history',
    icon: Clock
  }
];

interface NavigationTabsProps {
  activeTab: TabRoute;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <div className="flex space-x-1 bg-white border border-gray-200 p-1 rounded-lg mb-6">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`
              flex-1 py-2 px-4 rounded-md transition-all duration-200
              flex items-center justify-center gap-2
              ${isActive 
                ? 'bg-gray-100 text-purple-500' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }
            `}
          >
            <Icon size={18} />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};