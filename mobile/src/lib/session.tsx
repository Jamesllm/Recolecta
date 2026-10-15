import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { api, ApiError, setAuthToken, type User } from './api';

const TOKEN_KEY = 'recolecta.token';

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      } catch {
        return null;
      }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
      } catch {}
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined') window.localStorage.removeItem(key);
      } catch {}
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

interface SessionValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: Parameters<typeof api.register>[0]) => Promise<string>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recupera la sesión guardada y la valida con el servidor
  useEffect(() => {
    (async () => {
      try {
        const token = await storage.getItem(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const res = await api.me();
          setUser(res.data);
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await storage.deleteItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const start = useCallback(async (token: string, u: User) => {
    await storage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(u);
  }, []);

  const value = useMemo<SessionValue>(() => ({
    user,
    isLoading,
    signIn: async (email, password) => {
      const res = await api.login(email, password);
      await start(res.data.token, res.data.user);
    },
    signUp: async (data) => {
      const res = await api.register(data);
      await start(res.data.token, res.data.user);
      return res.message;
    },
    signOut: async () => {
      await storage.deleteItem(TOKEN_KEY);
      setAuthToken(null);
      setUser(null);
    },
  }), [user, isLoading, start]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
