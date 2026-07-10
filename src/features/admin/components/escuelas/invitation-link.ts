import { AUTH_PATHS } from "@/lib/auth/constants";
import { SITE_URL } from "@/lib/site";

const REGISTRATION_ALUMNO_PATH = /^\/registro\/alumno\/?$/i;
const REGISTRATION_TOKEN_PATH = /^\/registro\/([^/?#]+)\/?$/i;

function splitPathAndQuery(value: string) {
  const [rawPath = "", rawQuery = ""] = value.split("?");
  return {
    pathname: rawPath.trim() || AUTH_PATHS.register,
    query: rawQuery.trim(),
  };
}

function extractTokenFromQuery(query: string) {
  if (!query) {
    return null;
  }

  const params = new URLSearchParams(query.startsWith("?") ? query : `?${query}`);
  const token = params.get("token")?.trim();
  return token || null;
}

function toTokenPath(token: string, next?: string | null) {
  const nextQuery = next?.trim()
    ? `?next=${encodeURIComponent(next.trim())}`
    : "";
  return `${AUTH_PATHS.register}/${encodeURIComponent(token)}${nextQuery}`;
}

export function normalizeRegistrationPath(pathOrUrl?: string) {
  if (!pathOrUrl?.trim()) {
    return AUTH_PATHS.register;
  }

  const value = pathOrUrl.trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      const tokenFromQuery = url.searchParams.get("token")?.trim();
      const next = url.searchParams.get("next");

      if (tokenFromQuery) {
        return toTokenPath(tokenFromQuery, next);
      }

      const tokenMatch = REGISTRATION_TOKEN_PATH.exec(url.pathname);
      if (tokenMatch?.[1] && tokenMatch[1].toLowerCase() !== "alumno") {
        return toTokenPath(decodeURIComponent(tokenMatch[1]), next);
      }

      const pathname = REGISTRATION_ALUMNO_PATH.test(url.pathname)
        ? AUTH_PATHS.register
        : url.pathname || AUTH_PATHS.register;

      return next ? `${pathname}?next=${encodeURIComponent(next)}` : pathname;
    } catch {
      return AUTH_PATHS.register;
    }
  }

  const { pathname, query } = splitPathAndQuery(value);
  const tokenFromQuery = extractTokenFromQuery(query);
  const next = query
    ? new URLSearchParams(query.startsWith("?") ? query : `?${query}`).get("next")
    : null;

  if (tokenFromQuery) {
    return toTokenPath(tokenFromQuery, next);
  }

  const tokenMatch = REGISTRATION_TOKEN_PATH.exec(pathname);
  if (tokenMatch?.[1] && tokenMatch[1].toLowerCase() !== "alumno") {
    return toTokenPath(decodeURIComponent(tokenMatch[1]), next);
  }

  const normalizedPath = REGISTRATION_ALUMNO_PATH.test(pathname)
    ? AUTH_PATHS.register
    : pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

  return next ? `${normalizedPath}?next=${encodeURIComponent(next)}` : normalizedPath;
}

export function buildRegistrationUrl(urlRegistro?: string, token?: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : SITE_URL.replace(/\/$/, "");

  const cleanToken = token?.trim();
  if (cleanToken) {
    return `${origin}${toTokenPath(cleanToken)}`;
  }

  const normalized = normalizeRegistrationPath(urlRegistro);

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  return `${origin}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
