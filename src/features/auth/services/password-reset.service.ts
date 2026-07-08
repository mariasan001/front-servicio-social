import { apiRequest } from "@/lib/api/client";
import type {
  ForgotPasswordRequest,
  ResetPublicPasswordRequest,
} from "@/lib/api/types";

export async function requestPasswordReset(request: ForgotPasswordRequest) {
  await apiRequest<null>("/auth/password/forgot", {
    method: "POST",
    body: request,
  });
}

export async function confirmPasswordReset(request: ResetPublicPasswordRequest) {
  await apiRequest<null>("/auth/password/reset", {
    method: "POST",
    body: request,
  });
}
