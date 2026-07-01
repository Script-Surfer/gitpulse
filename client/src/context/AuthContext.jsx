import { createContext, useContext, useState, useEffect } from 'react';
import { getMe as fetchMe } from '../api/api.js';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if we have a stored token and load user
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('gitpulse_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await fetchMe();
        setUser(data);
      } catch (error) {
        // Token expired or invalid — clear it
        localStorage.removeItem('gitpulse_token');
        setUser(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('gitpulse_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('gitpulse_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
