import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout/Layout';
import { LoginForm } from './components/Auth/LoginForm';
import { RegisterForm } from './components/Auth/RegisterForm';
import { HomePage } from './pages/HomePage';
import { ReportsPage } from './pages/ReportsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyAlertsPage } from './pages/MyAlertsPage';
import { EditReportPage } from './pages/EditReportPage';
import { ReportForm } from './components/Reports/ReportForm';
import { ReportDetail } from './components/Reports/ReportDetail';
import { MissingPersonsMap } from './components/Map/MissingPersonsMap';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/connexion" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/rapports" />;
};

function App() {
  // Initialiser l'authentification avec le hook personnalisé
  useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/connexion" element={<PublicRoute><LoginForm /></PublicRoute>} />
        <Route path="/inscription" element={<PublicRoute><RegisterForm /></PublicRoute>} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        
        <Route path="/rapports" element={
          <ProtectedRoute>
            <Layout>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/rapports/:id" element={
          <ProtectedRoute>
            <Layout>
              <ReportDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/signalement" element={
          <ProtectedRoute>
            <Layout>
              <ReportForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/carte" element={
          <ProtectedRoute>
            <Layout>
              <MissingPersonsMap />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profil" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/mes-alertes" element={
          <ProtectedRoute>
            <MyAlertsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/rapports/nouveau" element={
          <ProtectedRoute>
            <Layout>
              <ReportForm />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/rapports/:id/modifier" element={
          <ProtectedRoute>
            <EditReportPage />
          </ProtectedRoute>
        } />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;