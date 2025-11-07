import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';
import { Toaster } from 'sonner';

// Pages imports organized by role
import { LoginPage, RegisterPage } from './pages/auth';
import { AdminPage, AllProposalsPage } from './pages/admin';
import { HomePage, SubmitPage, SchedulePage, MentorResourcesPage } from './pages/mentor';
import { ProposalHistoryPage } from './pages/shared';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
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
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/resources" element={<MentorResourcesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
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
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
