import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Kiem tra dang nhap that + role o ca frontend, khong chi dua vao backend
// tra 401/403 (UX tot hon: redirect thang ve login thay vi hien trang loi).
// AuthContext khong con fallback ve user gia nua (da bo 21/8) - chua dang
// nhap that se luon bi day ve /auth/login o day.
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
