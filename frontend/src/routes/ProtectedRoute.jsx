import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Truoc day luon render children bat ke role (che do preview UI) - gio kiem
// tra that vi khu vuc admin can duoc bao ve dung o ca frontend, khong chi
// dua vao backend tra 401/403. Khong pha vo hanh vi preview cua host: khi
// chua dang nhap that, AuthContext van fallback ve MOCK_HOST_USER (role:
// host) nen cac route host van vao duoc binh thuong - chi rieng route
// roles={['admin']} moi thuc su chan mock user nay ra.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
