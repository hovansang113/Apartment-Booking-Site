import { createContext, useContext, useState, useEffect, useRef } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionVersion = useRef(0);

  // Cookie httpOnly khong doc duoc tu JS, nen phai hoi server "toi la ai" luc
  // load trang thay vi doc localStorage nhu truoc.
  useEffect(() => {
    const version = ++sessionVersion.current;
    authService
      .getMe()
      .then((data) => {
        if (sessionVersion.current === version) setUser(data.user);
      })
      .catch(() => {
        if (sessionVersion.current === version) setUser(null);
      })
      .finally(() => {
        if (sessionVersion.current === version) setLoading(false);
      });
  }, []);

  function login(userData) {
    sessionVersion.current += 1;
    setUser(userData);
    setLoading(false);
  }

  async function logout() {
    sessionVersion.current += 1;
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
