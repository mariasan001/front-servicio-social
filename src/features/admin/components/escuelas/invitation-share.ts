import type { EscuelaTokenResponse } from "../../types/escuela.types";

export type InvitationShareData = {
  token: string;
  fechaExpiracion?: string;
};

export function resolveInvitationShareData(
  invitacion: EscuelaTokenResponse,
  generatedToken?: string,
): InvitationShareData | null {
  const token = invitacion.token?.trim() || generatedToken?.trim();

  if (!token) {
    return null;
  }

  return {
    token,
    fechaExpiracion: invitacion.fechaExpiracion,
  };
}
