import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const t = localStorage.getItem('admin_token');
    if (!t) return false;
    try {
      const { data } = await axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      setUser(data);
      setToken(t);
      return true;
    } catch {
      localStorage.removeItem('admin_token');
      setToken(null);
      setUser(null);
      return false;
    }
  }, []);

  const getAuthHeaders = useCallback(() => {
    const t = localStorage.getItem('admin_token');
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  const value = useMemo(() => ({
    user, token, login, logout, checkAuth, getAuthHeaders
  }), [user, token, login, logout, checkAuth, getAuthHeaders]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
