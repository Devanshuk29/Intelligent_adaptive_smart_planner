import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateGoalPage from './pages/CreateGoalPage';
import GoalRoadmapPage from './pages/GoalRoadmapPage';
import TasksPage from './pages/TasksPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResourcesPage from './pages/ResourcesPage';
import ViewGoalsPage from './pages/ViewGoalsPage';
import LogStudySessionPage from './pages/LogStudySessionPage';
import ConfidencePage from './pages/ConfidencePage';
import InterviewReadinessPage from './pages/InterviewReadinessPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

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
        path="/goal/:goalId"
        element={
          <ProtectedRoute>
            <GoalRoadmapPage />
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
      <Route
        path="/analytics/:goalId"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
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
        path="/resources/:goalId"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
    </Routes>
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
