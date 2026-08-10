import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/user/Home';
import ListingDetail from './pages/user/ListingDetail';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BecomeHostPage from './pages/host/BecomeHostPage';
import HostTodayPage from './pages/host/HostTodayPage';
import HostListingsPage from './pages/host/HostListingsPage';
import HostCalendarPage from './pages/host/HostCalendarPage';
import HostSetupChoicePage from './pages/host/HostSetupChoicePage';
import CreateListingPage from './pages/host/CreateListingPage';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

function HostHomeRoute() {
  const { user } = useAuth();
  if (user && (user.role === 'host' || user.role === 'admin')) {
    return <HostTodayPage />;
  }
  return <BecomeHostPage />;
}

export default function App() {
  const location = useLocation();
  const isStandalonePage = location.pathname === '/host/listings/new' || location.pathname === '/host/listings/setup';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Toaster position="bottom-center" />
      {!isStandalonePage && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Host Routes */}
          <Route path="/host" element={<HostHomeRoute />} />
          <Route
            path="/host/today"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostTodayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listings"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listings/setup"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostSetupChoicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listings/new"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <CreateListingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/calendar"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostCalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isStandalonePage && <Footer />}
    </div>
  );
}
