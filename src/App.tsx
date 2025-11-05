import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import SubmitPage from './pages/SubmitPage';
import ReviewPage from './pages/ReviewPage';
import SchedulePage from './pages/SchedulePage';
import MentorResourcesPage from './pages/MentorResourcesPage';
import ProposalHistoryPage from './pages/ProposalHistoryPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/submit" element={<SubmitPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/resources" element={<MentorResourcesPage />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/proposal-history/:id" element={<ProposalHistoryPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
