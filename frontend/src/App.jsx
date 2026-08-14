import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/user/Home';
import ListingDetail from './pages/user/ListingDetail';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HostListingsPage from './pages/host/HostListingsPage';
import HostListingFormPage from './pages/host/HostListingFormPage';
import HostBookingsPage from './pages/host/HostBookingsPage';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminListingsPage from './pages/admin/AdminListingsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import MyBookingsPage from './pages/user/MyBookingsPage';
import PaymentPage from './pages/user/PaymentPage';
import GuestBookingPage from './pages/user/GuestBookingPage';
import HostCalendarPage from './pages/host/HostCalendarPage';
import HostPricingPage from './pages/host/HostPricingPage';
import HostStatsPage from './pages/host/HostStatsPage';
import HostLayout from './pages/host/HostLayout';
import ProfilePage from './pages/user/ProfilePage';

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster position="bottom-center" />
      <Routes>
        {/* Auth — không có Header/Footer */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Guest booking (no auth) */}
        <Route path="/bookings/guest/:token" element={<GuestBookingPage />} />

        {/* Profile */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><ProfilePage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Bookings */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <MainLayout><MyBookingsPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/bookings/:bookingId/payment" element={
          <ProtectedRoute>
            <MainLayout><PaymentPage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin — standalone layout, không dùng MainLayout */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><AdminStatsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/listings" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><AdminListingsPage /></AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout><AdminUsersPage /></AdminLayout>
          </ProtectedRoute>
        } />

        {/* Host — dùng HostLayout (có tab nav riêng) */}
        <Route path="/host/stats" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostStatsPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/listings" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostListingsPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/bookings" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostBookingsPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/calendar" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostCalendarPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/pricing" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostPricingPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/listings/new" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostListingFormPage /></HostLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/listings/:id/edit" element={
          <ProtectedRoute roles={['host']}>
            <HostLayout><HostListingFormPage /></HostLayout>
          </ProtectedRoute>
        } />

        {/* Public */}
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </div>
  );
}
