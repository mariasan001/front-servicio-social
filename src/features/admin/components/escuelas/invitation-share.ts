import type { EscuelaTokenResponse } from "../../types/escuela.types";

export type InvitationShareData = {
  token: string;
  fechaExpiracion?: string;
};

export function resolveInvitationShareData(
  invitacion: EscuelaTokenResponse,
  revealedToken?: string,
): InvitationShareData | null {
  const token = revealedToken?.trim();

  if (!token) {
    return null;
  }

  return {
    token,
    fechaExpiracion: invitacion.fechaExpiracion,
  };
}
