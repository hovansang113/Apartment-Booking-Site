import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/user/Home';
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Dashboard, creation wizard and Braintree are not needed for browsing the
// public catalogue. Loading them on demand makes the first page substantially
// lighter while preserving the same routes.
const ListingDetail = lazy(() => import('./pages/user/ListingDetail'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const BecomeHostPage = lazy(() => import('./pages/host/BecomeHostPage'));
const HostTodayPage = lazy(() => import('./pages/host/HostTodayPage'));
const HostListingsPage = lazy(() => import('./pages/host/HostListingsPage'));
const HostCalendarPage = lazy(() => import('./pages/host/HostCalendarPage'));
const HostSettingsPage = lazy(() => import('./pages/host/HostSettingsPage'));
const HostTaxSettingsPage = lazy(() => import('./pages/host/HostTaxSettingsPage'));
const HostPayoutSettingsPage = lazy(() => import('./pages/host/HostPayoutSettingsPage'));
const HostSetupChoicePage = lazy(() => import('./pages/host/HostSetupChoicePage'));
const CreateListingPage = lazy(() => import('./pages/host/CreateListingPage'));
const EditListingPage = lazy(() => import('./pages/host/EditListingPage'));
const AdminListingsPage = lazy(() => import('./pages/admin/AdminListingsPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminTaxVerificationPage = lazy(() => import('./pages/admin/AdminTaxVerificationPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const CheckoutPage = lazy(() => import('./pages/booking/CheckoutPage'));
const PaymentPage = lazy(() => import('./pages/booking/PaymentPage'));
const GuestTripsPage = lazy(() => import('./pages/user/GuestTripsPage'));

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
        <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-neutral-500">Loading…</div>}>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/listings/:id/checkout" element={<CheckoutPage />} />

          {/* Booking / Payment Routes */}
          <Route path="/booking/:bookingId/payment" element={<PaymentPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <GuestTripsPage />
              </ProtectedRoute>
            }
          />

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
            path="/host/listings/:id/edit"
            element={
              <ProtectedRoute roles={['host', 'admin']}>
                <EditListingPage />
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
                <AdminDashboardPage />
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
        </Suspense>
      </div>
      {!isStandalonePage && <Footer />}
    </div>
  );
}
