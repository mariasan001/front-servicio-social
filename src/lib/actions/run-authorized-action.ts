import type { UserRole } from "@/lib/auth/constants";
import { requireActionSession } from "@/lib/auth/action-session";
import type { ActionResult } from "./action-result";
import { runServerAction } from "./run-server-action";

export async function runAuthorizedAction<T>(
  requiredRoles: UserRole[],
  action: () => Promise<T>,
  fallbackMessage = "No fue posible completar la acción.",
): Promise<ActionResult<T>> {
  await requireActionSession(requiredRoles);
  return runServerAction(action, fallbackMessage);
}
