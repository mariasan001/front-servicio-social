import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { AUTH_PATHS } from "@/lib/auth/constants";
import { isNextNavigationError, isUnauthorizedApiError } from "@/lib/auth/unauthorized";
import {
  actionFailure,
  actionSuccess,
  type ActionResult,
} from "./action-result";

type ValidationErrors = Record<string, string[]>;

function extractFieldErrors(errors: unknown): ValidationErrors | undefined {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return undefined;
  }

  const fieldErrors: ValidationErrors = {};

  for (const [field, value] of Object.entries(errors)) {
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      fieldErrors[field] = value;
      continue;
    }

    if (typeof value === "string") {
      fieldErrors[field] = [value];
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function runServerAction<T>(
  action: () => Promise<T>,
  fallbackMessage = "No fue posible completar la acción.",
): Promise<ActionResult<T>> {
  try {
    const data = await action();
    return actionSuccess(data);
  } catch (error) {
    if (isNextNavigationError(error)) {
      throw error;
    }

    if (isUnauthorizedApiError(error)) {
      redirect(AUTH_PATHS.login);
    }

    if (error instanceof ApiError) {
      return actionFailure(error.message || fallbackMessage, {
        code: error.code,
        fieldErrors: extractFieldErrors(error.errors),
      });
    }

    if (error instanceof Error) {
      return actionFailure(error.message || fallbackMessage);
    }

    return actionFailure(fallbackMessage);
  }
}
