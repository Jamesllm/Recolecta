// Sesión del vecino: token JWT guardado en el almacenamiento seguro del teléfono
import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, setAuthToken, type User } from './api';

const TOKEN_KEY = 'recolecta.token';

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
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const res = await api.me();
          setUser(res.data);
        }
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) await SecureStore.deleteItemAsync(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const start = useCallback(async (token: string, u: User) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
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
      await SecureStore.deleteItemAsync(TOKEN_KEY);
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
