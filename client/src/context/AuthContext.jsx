import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('team-task-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('team-task-token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      localStorage.setItem('team-task-token', token);
    }
    if (user) {
      localStorage.setItem('team-task-user', JSON.stringify(user));
    }
  }, [token, user]);

  const login = async (credentials) => {
    setLoading(true);
    const response = await api.post('/auth/login', credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    setLoading(false);
  };

  const signup = async (values) => {
    setLoading(true);
    const response = await api.post('/auth/signup', values);
    setToken(response.data.token);
    setUser(response.data.user);
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('team-task-token');
    localStorage.removeItem('team-task-user');
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
