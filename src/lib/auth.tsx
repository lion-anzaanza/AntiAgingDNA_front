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

import { ApiError, request } from './api';

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
  /** Consecutive days with a diary entry — the server counts it (backlog 28). */
  streakDays: number;
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
/**
 * The last `User` the server confirmed, so a launch that cannot reach
 * `/api/auth/me` still opens signed in. Its nickname and `streakDays` may be a
 * day stale until the next successful launch.
 */
const USER_KEY = 'lifedna.user';

/**
 * Only these mean the token itself is bad. Anything else — offline, a timeout,
 * a 5xx — says nothing about the token, and discarding it there signed people
 * out for opening the app on a train.
 */
function rejectsToken(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

async function readCachedUser(): Promise<User | null> {
  try {
    const text = await SecureStore.getItemAsync(USER_KEY);
    return text ? (JSON.parse(text) as User) : null;
  } catch {
    return null;
  }
}

async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  await SecureStore.deleteItemAsync(USER_KEY).catch(() => {});
}

type AuthContextValue = {
  /** `undefined` until the stored token has been read back. */
  user: User | null | undefined;
  token: string | null;
  signIn: (loginId: string, password: string) => Promise<void>;
  signUp: (body: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  /** Irreversible — the server hard-deletes the account and everything under it. */
  deleteAccount: () => Promise<void>;
  /**
   * `request` with the session's token. A 401/403 here signs the user out: a
   * launch that could not reach the server restores the session from cache
   * *without* checking the token, so this is where an expired one is caught —
   * otherwise every screen would sit on `—` until the next online cold start.
   */
  authedRequest: <T>(path: string, options?: Omit<Parameters<typeof request>[1], 'token'>) => Promise<T>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // Restore the session once on launch. A stored token the server *rejects*
  // (401/403) is discarded rather than left to fail every later call; when the
  // server simply cannot be asked, the last confirmed user is used instead.
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
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(me)).catch(() => {});
        if (cancelled) return;
        setToken(stored);
        setUser(me);
      } catch (error) {
        if (rejectsToken(error)) {
          await clearSession();
          if (!cancelled) setUser(null);
          return;
        }
        // Could not ask. Keep the token either way, so the next launch that
        // reaches the server restores the session; open signed in only if we
        // know who the token belongs to (installs from before the cache do not).
        const cached = await readCachedUser();
        if (cancelled) return;
        if (cached) setToken(stored);
        setUser(cached);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const accept = useCallback(async (response: TokenResponse) => {
    await SecureStore.setItemAsync(TOKEN_KEY, response.accessToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user)).catch(() => {});
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
    await clearSession();
    setToken(null);
    setUser(null);
  }, []);

  /*
   * `DELETE /api/auth/me` removes the account, agreements, diagnosis, diaries
   * and scores for real — not a soft delete (backlog item 24). The local session
   * is cleared either way: if the row is already gone, staying signed in to it
   * helps nobody.
   */
  const deleteAccount = useCallback(async () => {
    try {
      await request<void>('/api/auth/me', { method: 'DELETE', token });
    } finally {
      await clearSession();
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const authedRequest = useCallback(
    async <T,>(path: string, options: Omit<Parameters<typeof request>[1], 'token'> = {}) => {
      try {
        return await request<T>(path, { ...options, token });
      } catch (error) {
        if (token && rejectsToken(error)) await signOut();
        throw error;
      }
    },
    [token, signOut],
  );

  const value = useMemo(
    () => ({ user, token, signIn, signUp, signOut, deleteAccount, authedRequest }),
    [user, token, signIn, signUp, signOut, deleteAccount, authedRequest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
