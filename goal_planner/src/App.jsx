import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

// Selector Pages
import AnalyticsSelectorPage from './pages/AnalyticsSelectorPage';
import ConfidenceSelectorPage from './pages/ConfidenceSelectorPage';
import ResourcesSelectorPage from './pages/ResourcesSelectorPage';
import ProgressCheckSelectorPage from './pages/ProgressCheckSelectorPage';
import SuggestionsSelectorPage from './pages/SuggestionsSelectorPage';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateGoalPage from './pages/CreateGoalPage';
import GoalRoadmapPage from './pages/GoalRoadmapPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
//import ResourcesPage from './pages/ResourcesPage';
import ViewGoalsPage from './pages/ViewGoalsPage';
import LogStudySessionPage from './pages/LogStudySessionPage';
import ConfidencePage from './pages/ConfidencePage';
import InterviewReadinessPage from './pages/InterviewReadinessPage';
import SearchResourcesPage from './pages/SearchResourcesPage';
import SavedResourcesPage from './pages/SavedResourcesPage';
import SmartRecommendationsPage from './pages/SmartRecommendationsPage';
import ExportPage from './pages/ExportPage';
import ProgressCheckPage from './pages/ProgressCheckPage';
import SuggestionsPage from './pages/SuggestionsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Check if current page is login or signup
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <>
      {/* Only show Header and Sidebar if logged in AND not on auth pages */}
      {isAuthenticated && !isAuthPage && (
        <>
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </>
      )}

      <main
        style={{
          marginTop: isAuthenticated && !isAuthPage ? '60px' : '0',
          marginLeft: isAuthenticated && !isAuthPage ? (isSidebarOpen ? '280px' : '70px') : '0',
          transition: 'margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes - Specific Routes First */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-goal"
            element={
              <ProtectedRoute>
                <CreateGoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <ViewGoalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/log-study-session"
            element={
              <ProtectedRoute>
                <LogStudySessionPage />
              </ProtectedRoute>
            }
          />

          {/* SELECTOR PAGES */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsSelectorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confidence"
            element={
              <ProtectedRoute>
                <ConfidenceSelectorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-resources"
            element={
              <ProtectedRoute>
                <ResourcesSelectorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-check"
            element={
              <ProtectedRoute>
                <ProgressCheckSelectorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggestions"
            element={
              <ProtectedRoute>
                <SuggestionsSelectorPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Dynamic Routes After */}
          <Route
            path="/goal/:goalId"
            element={
              <ProtectedRoute>
                <GoalRoadmapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/:goalId"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/export/:goalId"
            element={
              <ProtectedRoute>
                <ExportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confidence/:goalId"
            element={
              <ProtectedRoute>
                <ConfidencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-readiness/:goalId"
            element={
              <ProtectedRoute>
                <InterviewReadinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search-resources/:goalId"
            element={
              <ProtectedRoute>
                <SearchResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-resources/:goalId"
            element={
              <ProtectedRoute>
                <SavedResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations/:goalId"
            element={
              <ProtectedRoute>
                <SmartRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress-check/:goalId"
            element={
              <ProtectedRoute>
                <ProgressCheckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/suggestions/:goalId"
            element={
              <ProtectedRoute>
                <SuggestionsPage />
              </ProtectedRoute>
            }
          />
          
          
          {/* Default Route */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;