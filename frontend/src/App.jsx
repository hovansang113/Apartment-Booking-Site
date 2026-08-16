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
import HostSettingsPage from './pages/host/HostSettingsPage';
import HostTaxSettingsPage from './pages/host/HostTaxSettingsPage';
import HostPayoutSettingsPage from './pages/host/HostPayoutSettingsPage';
import HostSetupChoicePage from './pages/host/HostSetupChoicePage';
import CreateListingPage from './pages/host/CreateListingPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTaxVerificationPage from './pages/admin/AdminTaxVerificationPage';
import CheckoutPage from './pages/booking/CheckoutPage';
import PaymentPage from './pages/booking/PaymentPage';
import VnpayReturnPage from './pages/booking/VnpayReturnPage';
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
  const isStandalonePage =
    location.pathname === '/host/listings/new' ||
    location.pathname === '/host/listings/setup' ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/booking/') ||
    location.pathname.endsWith('/checkout');

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Toaster position="bottom-center" />
      {!isStandalonePage && <Header />}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/listings/:id/checkout" element={<CheckoutPage />} />

          {/* Booking / Payment Routes (Phase 4) */}
          <Route path="/booking/:bookingId/payment" element={<PaymentPage />} />
          <Route path="/booking/vnpay-return" element={<VnpayReturnPage />} />

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
          <Route
            path="/host/settings"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/settings/tax"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostTaxSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/settings/payout"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <HostPayoutSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <Navigate to="/admin/listings" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tax-verifications"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminTaxVerificationPage />
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
