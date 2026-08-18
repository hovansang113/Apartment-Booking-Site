import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

const MOCK_HOST_USER = {
  id: 'demo-host-id',
  fullName: 'Stayhub Host',
  email: 'host@stayhub.co.uk',
  role: 'host',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cookie httpOnly khong doc duoc tu JS, nen phai hoi server "toi la ai" luc
  // load trang thay vi doc localStorage nhu truoc.
  useEffect(() => {
    authService
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        // Chua dang nhap that - fallback ve user gia de xem truoc giao dien
        // host ma khong can dang nhap (giu nguyen hanh vi cu).
        setUser(MOCK_HOST_USER);
      })
      .finally(() => setLoading(false));
  }, []);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
