import { ApiError } from "@/lib/api/errors";
import { AUTH_PATHS } from "./constants";

export function isUnauthorizedStatus(status?: number) {
  return status === 401;
}

export function isUnauthorizedApiError(error: unknown) {
  return error instanceof ApiError && isUnauthorizedStatus(error.status);
}

export function buildLoginRedirectUrl(nextPath?: string) {
  const next =
    nextPath ??
    (typeof window !== "undefined" ? window.location.pathname : AUTH_PATHS.home);
  const loginUrl = new URL(AUTH_PATHS.login, window.location.origin);
  loginUrl.searchParams.set("next", next);
  return loginUrl.toString();
}

export function redirectToLogin(nextPath?: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.assign(buildLoginRedirectUrl(nextPath));
}

export function isNextNavigationError(error: unknown) {
  if (typeof error !== "object" || error === null || !("digest" in error)) {
    return false;
  }

  const digest = String((error as { digest?: unknown }).digest ?? "");
  return digest.includes("NEXT_REDIRECT") || digest.includes("NEXT_NOT_FOUND");
}
