import React, { createContext, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { TransactionHistory } from "./components/trading/TransactionHistory";
import { BrowsePage } from "./pages/BrowsePage";
import { MyQuestionsPage } from "./pages/MyQuestionsPage";
import { FollowingPage } from "./pages/Following";
import { NavigationTabs } from "./components/layout/NavigationTabs";
import GlobalPage from "pages/GlobalPage";
import { ArticlePage } from "pages/ArticlePage";
import QuestionPage from "pages/QuestionPage";
import ArticlesPage from "./pages/ArticlesPage";

export const UserContext = createContext("");

const MainContent: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname.slice(1);
    return path || "browse";
  };

  return (
    <div className="min-h-screen bg-[rgb(255,241,229)]">
      <Navbar
        onHistoryClick={() => setShowHistory(true)}
        className="shadow-xl"
      />
      <TransactionHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      <div className="max-w-6xl mx-auto px-6 pt-8">
        <Routes>
          <Route path="/" element={<Navigate to="/browse" replace />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/my-questions" element={<MyQuestionsPage />} />
          <Route path="/following" element={<FollowingPage />} />
          <Route path="/global" element={<GlobalPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/question/:id" element={<QuestionPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <UserContext.Provider value="foo">
        <MainContent />
      </UserContext.Provider>
    </Router>
  );
};
