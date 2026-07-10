import { useCallback, useEffect, useState } from 'react';
import apiService from '../services/api';

const STORAGE_KEY = 'phonebook-user';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    // Ignore stale responses if the component unmounts mid-request
    let ignore = false;

    const checkAuth = async () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        if (!parsed?.token) {
          throw new Error('Stored user is missing a token');
        }

        apiService.setToken(parsed.token);

        // Validate token by calling /me
        const response = await apiService.getMe();
        if (ignore) return;

        const userData = { ...response.data, token: parsed.token };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        setUser(userData);
      } catch (_error) {
        if (!ignore) {
          // Token expired or invalid
          window.localStorage.removeItem(STORAGE_KEY);
          apiService.clearToken();
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      ignore = true;
    };
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
