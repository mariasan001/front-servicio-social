import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveBackendUrl } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/types";
import { normalizeAuthUser, resolveHomePath } from "./roles";

type AuthMeResponse = {
  success: boolean;
  data: AuthUser | null;
};

async function fetchSession(cookieHeader: string) {
  const response = await fetch(resolveBackendUrl("/auth/me"), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AuthMeResponse;

  if (!payload.data) {
    return null;
  }

  return normalizeAuthUser(payload.data);
}

export async function getServerSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  if (!cookieHeader) {
    return null;
  }

  try {
    return await fetchSession(cookieHeader);
  } catch {
    return null;
  }
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function redirectToRoleHome(session: AuthUser): Promise<never> {
  redirect(resolveHomePath(session.roles));
}
