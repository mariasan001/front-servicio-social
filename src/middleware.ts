import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_PATHS,
  canAccessPath,
  isGuestOnlyPath,
  isProtectedPath,
  isSafeInternalPath,
  resolveHomePath,
} from "@/lib/auth";
import { getSessionFromRequest } from "@/lib/auth/session.middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (isGuestOnlyPath(pathname) && session) {
    const nextParam = request.nextUrl.searchParams.get("next");
    const destination = isSafeInternalPath(nextParam)
      ? nextParam
      : resolveHomePath(session.roles);

    return NextResponse.redirect(new URL(destination!, request.url));
  }

  if (isProtectedPath(pathname)) {
    if (!session) {
      const loginUrl = new URL(AUTH_PATHS.login, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessPath(session, pathname)) {
      return NextResponse.redirect(
        new URL(resolveHomePath(session.roles), request.url),
      );
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
  ],
};
