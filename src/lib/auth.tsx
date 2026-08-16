import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { request } from './api';

/**
 * The session: the JWT and who it belongs to.
 *
 * Signup and login both return the same `TokenResponse`, and signup logs you
 * straight in — there is no email verification step (backlog item 21).
 */
export type User = {
  id: string;
  loginId: string;
  email: string;
  nickname: string;
  birthYear: number;
};

type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
};

export type SignUpRequest = {
  loginId: string;
  email: string;
  password: string;
  nickname: string;
  birthYear: number;
  diagnosis: Record<string, unknown>;
  /** Keyed by the server's enum constants — see `AGREEMENT_KEYS`. */
  agreements: Record<string, boolean>;
};

const TOKEN_KEY = 'lifedna.accessToken';

type AuthContextValue = {
  /** `undefined` until the stored token has been read back. */
  user: User | null | undefined;
  token: string | null;
  signIn: (loginId: string, password: string) => Promise<void>;
  signUp: (body: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // Restore the session once on launch. A stored token that the server no
  // longer accepts is discarded rather than left to fail every later call.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null);
      if (!stored) {
        if (!cancelled) setUser(null);
        return;
      }
      try {
        const me = await request<User>('/api/auth/me', { token: stored });
        if (cancelled) return;
        setToken(stored);
        setUser(me);
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        if (!cancelled) setUser(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(async (response: TokenResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const signIn = useCallback(
    async (loginId: string, password: string) => {
      await accept(
        await request<TokenResponse>('/api/auth/login', {
          method: 'POST',
          body: { loginId, password },
        }),
      );
    },
    [accept],
  );

  const signUp = useCallback(
    async (body: SignUpRequest) => {
      await accept(await request<TokenResponse>('/api/auth/signup', { method: 'POST', body }));
    },
    [accept],
  );

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, signIn, signUp, signOut }),
    [user, token, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
