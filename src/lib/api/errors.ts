export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly errors: unknown;

  constructor(message: string, code: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.errors = errors ?? null;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
