import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

const STORAGE_KEY = 'phonebook-user';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        apiService.setToken(parsed.token);

        // Validate token by calling /me
        await apiService.getMe();
        setUser(parsed);
      } catch (_error) {
        // Token expired or invalid
        window.localStorage.removeItem(STORAGE_KEY);
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    const response = await apiService.login({ username, password });
    const userData = response.data;

    apiService.setToken(userData.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (username, password) => {
    const response = await apiService.register({ username, password });
    const userData = response.data;

    apiService.setToken(userData.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    apiService.clearToken();
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    await apiService.deleteAccount();
    apiService.clearToken();
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, deleteAccount };
};

export default useAuth;
