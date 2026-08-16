/**
 * The HTTP layer for `https://antiaging-dna.anzaanza.cloud`.
 *
 * Everything except `GET /health`, `POST /api/auth/signup` and
 * `POST /api/auth/login` needs `Authorization: Bearer <JWT>` (backlog item 3),
 * so `request` takes the token rather than reading it from storage — that keeps
 * this file free of React and of the session's lifetime.
 *
 * Errors come back as RFC 9457 `application/problem+json` (backlog item 4).
 */
export const API_BASE_URL = 'https://antiaging-dna.anzaanza.cloud';

/** RFC 9457. `errors` is present on validation failures, keyed by field name. */
export type ProblemDetail = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string>;
};

/**
 * Any non-2xx, plus transport failures. `problem` is absent when the server
 * could not be reached or answered with something that was not problem+json.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ProblemDetail;

  constructor(status: number, message: string, problem?: ProblemDetail) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }

  /** The field-level messages a form can show, if the server sent any. */
  get fieldErrors(): Record<string, string> | undefined {
    return this.problem?.errors;
  }
}

/** Transport failures use 0 — there is no HTTP status to report. */
export const NETWORK_ERROR_STATUS = 0;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, signal } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (cause) {
    throw new ApiError(
      NETWORK_ERROR_STATUS,
      cause instanceof Error ? cause.message : '네트워크 오류',
    );
  }

  if (!response.ok) {
    const problem = await readProblem(response);
    throw new ApiError(response.status, problem?.title ?? `HTTP ${response.status}`, problem);
  }

  // 204, and any other body-less success.
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function readProblem(response: Response): Promise<ProblemDetail | undefined> {
  try {
    const text = await response.text();
    if (!text) return undefined;
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? (parsed as ProblemDetail) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * What to put in front of the user. The server's `title` is already Korean and
 * specific ("아이디 중복"), so it is preferred over anything invented here; the
 * fallbacks cover the cases where there is no problem body to quote.
 */
export function messageFor(error: unknown): string {
  if (!(error instanceof ApiError)) return '알 수 없는 오류가 발생했어요.';
  if (error.status === NETWORK_ERROR_STATUS) {
    return '서버에 연결하지 못했어요. 네트워크를 확인해주세요.';
  }
  const { title, detail } = error.problem ?? {};
  if (title && detail) return `${title}\n${detail}`;
  return title ?? detail ?? '요청을 처리하지 못했어요.';
}
