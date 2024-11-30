import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, User, Star, Clock } from 'lucide-react';
import { TabRoute, NavigationTab } from '../../types/navigation';

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
    <div className="flex space-x-1 bg-[rgb(28,32,41)] border-b border-gray-700">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`
              flex-1 py-4 px-6 transition-all duration-200
              flex items-center justify-center gap-2 font-georgia
              ${isActive 
                ? 'text-[rgb(13,118,128)] border-b-2 border-[rgb(13,118,128)] bg-[rgb(38,42,51)]' 
                : 'text-gray-400 hover:text-[rgb(13,118,128)] hover:bg-[rgb(38,42,51)]'
              }
            `}
          >
            <Icon size={18} />
            <span className="text-sm">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};