import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_HOST_USER = {
  id: 'demo-host-id',
  fullName: 'Chủ nhà Stayhub',
  email: 'host@stayhub.vn',
  role: 'host',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(MOCK_HOST_USER);
  const [token, setToken] = useState('demo-jwt-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        // Default to mock host user for instant preview without login
        setUser(MOCK_HOST_USER);
        setToken('demo-jwt-token');
      }
    } catch (e) {
      console.error('Failed to parse saved user credentials', e);
      setUser(MOCK_HOST_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    setUser(MOCK_HOST_USER);
    setToken('demo-jwt-token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
