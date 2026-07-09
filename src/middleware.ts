import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_PATHS,
  canAccessPath,
  isGuestOnlyPath,
  isProtectedPath,
  resolveHomePath,
} from "@/lib/auth";
import { resolveGuestAuthRedirect } from "@/lib/auth/guest-redirect";
import { getSessionFromRequest } from "@/lib/auth/session.middleware";

function redirectTo(request: NextRequest, destination: string) {
  const { pathname } = request.nextUrl;

  if (destination === pathname) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(destination, request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (isGuestOnlyPath(pathname) && session) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const destination = await resolveGuestAuthRedirect(session, nextParam, request);

    return redirectTo(request, destination);
  }

  if (isProtectedPath(pathname)) {
    if (!session) {
      const loginUrl = new URL(AUTH_PATHS.login, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessPath(session, pathname)) {
      const fallback = resolveHomePath(session.roles);
      const destination =
        fallback !== pathname ? fallback : AUTH_PATHS.home;

      return redirectTo(request, destination);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/panel/:path*",
    "/login",
    "/registro",
    "/recuperar-contrasena",
    "/restablecer-contrasena/:path*",
  ],
};
