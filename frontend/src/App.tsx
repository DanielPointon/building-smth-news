import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { TransactionHistory } from './components/trading/TransactionHistory';
import { BrowsePage } from './pages/BrowsePage';
import { MyQuestionsPage } from './pages/MyQuestionsPage';
import { FollowingPage } from './pages/Following';
import { NavigationTabs } from './components/layout/NavigationTabs';

const MainContent: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname.slice(1);
    return path || 'browse';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar onHistoryClick={() => setShowHistory(true)} />
      <TransactionHistory 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
      
      <div className="max-w-4xl mx-auto p-6 pt-20">
        <NavigationTabs activeTab={getActiveTab()} />
        
        <Routes>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/my-questions" element={<MyQuestionsPage />} />
          <Route path="/following" element={<FollowingPage />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};
