import { AUTH_PATHS } from "@/lib/auth/constants";
import { SITE_URL } from "@/lib/site";

const REGISTRATION_ALUMNO_PATH = /^\/registro\/alumno\/?$/i;

function splitPathAndQuery(value: string) {
  const [rawPath = "", rawQuery = ""] = value.split("?");
  return {
    pathname: rawPath.trim() || AUTH_PATHS.register,
    query: rawQuery.trim(),
  };
}

export function normalizeRegistrationPath(pathOrUrl?: string) {
  if (!pathOrUrl?.trim()) {
    return AUTH_PATHS.register;
  }

  const value = pathOrUrl.trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      const pathname = REGISTRATION_ALUMNO_PATH.test(url.pathname)
        ? AUTH_PATHS.register
        : url.pathname || AUTH_PATHS.register;

      return `${pathname}${url.search}`;
    } catch {
      return AUTH_PATHS.register;
    }
  }

  const { pathname, query } = splitPathAndQuery(value);
  const normalizedPath = REGISTRATION_ALUMNO_PATH.test(pathname)
    ? AUTH_PATHS.register
    : pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export function buildRegistrationUrl(urlRegistro?: string, token?: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : SITE_URL.replace(/\/$/, "");

  const normalized = normalizeRegistrationPath(urlRegistro);

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.includes("token=")) {
    return `${origin}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
  }

  const cleanToken = token?.trim();

  if (cleanToken) {
    return `${origin}${AUTH_PATHS.register}?token=${encodeURIComponent(cleanToken)}`;
  }

  return `${origin}${normalized.startsWith("/") ? normalized : `/${normalized}`}`;
}
