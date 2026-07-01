import { AUTH_PATHS, GUEST_ONLY_PATHS, PANEL_PATHS } from "./constants";

export function isGuestOnlyPath(pathname: string) {
  return GUEST_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isProtectedPath(pathname: string) {
  return (
    pathname === PANEL_PATHS.root ||
    pathname.startsWith(`${PANEL_PATHS.root}/`)
  );
}

export function isAuthPath(pathname: string) {
  return (
    isGuestOnlyPath(pathname) ||
    pathname === AUTH_PATHS.home ||
    pathname.startsWith("/registro")
  );
}
