import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const AllProposalsPage = lazy(() => import('./pages/admin/AllProposalsPage'));
const AdminSchedulePage = lazy(() => import('./pages/admin/AdminSchedulePage'));
const CouncilsPage = lazy(() => import('./pages/admin/CouncilsPage'));
const DefenseSchedulePage = lazy(() => import('./pages/admin/DefenseSchedulePage'));
const SchedulePage = lazy(() => import('./pages/mentor/SchedulePage'));
const MentorResourcesPage = lazy(() => import('./pages/mentor/MentorResourcesPage'));
const ReviewBoardPage = lazy(() => import('./pages/mentor/ReviewBoardPage'));
const DefenseGradingPage = lazy(() => import('./pages/mentor/DefenseGradingPage'));
const ProposalHistoryPage = lazy(() => import('./pages/shared/ProposalHistoryPage'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          
          {/* Shared Routes - All authenticated users */}
          <Route
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN', 'MENTOR', 'LECTURER']}>
                  <Layout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/proposal-history/:id" element={<ProposalHistoryPage />} />
          </Route>

          {/* Mentor/Lecturer Routes */}
          <Route
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['MENTOR', 'LECTURER']}>
                  <Layout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/schedule" replace />} />
            <Route path="/resources" element={<MentorResourcesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/review-board" element={<ReviewBoardPage />} />
            <Route path="/defense-grading" element={<DefenseGradingPage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={['ADMIN']}>
                  <Layout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/proposals" element={<AllProposalsPage />} />
            <Route path="/admin/review-management" element={<DefenseSchedulePage />} />
            <Route path="/admin/schedule" element={<AdminSchedulePage />} />
            <Route path="/admin/councils" element={<CouncilsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
