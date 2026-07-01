import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/api/types";
import { resolveApiUrl } from "@/lib/api/client";
import { resolveHomePath } from "./roles";

type AuthMeResponse = {
  success: boolean;
  data: AuthUser | null;
};

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
    const response = await fetch(resolveApiUrl("/auth/me"), {
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
    return payload.data;
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
