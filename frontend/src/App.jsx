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
import AdminListingsPage from './pages/admin/AdminListingsPage';
import MyBookingsPage from './pages/user/MyBookingsPage';

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

        {/* Bookings */}
        <Route path="/bookings" element={
          <ProtectedRoute>
            <MainLayout><MyBookingsPage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <MainLayout><AdminListingsPage /></MainLayout>
          </ProtectedRoute>
        } />

        {/* Host */}
        <Route path="/host/listings" element={
          <ProtectedRoute roles={['host']}>
            <MainLayout><HostListingsPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/bookings" element={
          <ProtectedRoute roles={['host']}>
            <MainLayout><HostBookingsPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/listings/new" element={
          <ProtectedRoute roles={['host']}>
            <MainLayout><HostListingFormPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/host/listings/:id/edit" element={
          <ProtectedRoute roles={['host']}>
            <MainLayout><HostListingFormPage /></MainLayout>
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
