import { PASSWORD_MIN_LENGTH } from "../constants/register";

export const PASSWORD_MAX_LENGTH = 100;

export const PASSWORD_COMPLEXITY_MESSAGE =
  "La contraseña debe incluir mayúscula, minúscula, número y carácter especial.";

export function getPasswordComplexityError(password: string): string | undefined {
  if (!password) {
    return undefined;
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }

  if (!/[A-ZÁÉÍÓÚÑ]/.test(password)) {
    return PASSWORD_COMPLEXITY_MESSAGE;
  }

  if (!/[a-záéíóúñ]/.test(password)) {
    return PASSWORD_COMPLEXITY_MESSAGE;
  }

  if (!/[0-9]/.test(password)) {
    return PASSWORD_COMPLEXITY_MESSAGE;
  }

  if (!/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(password)) {
    return PASSWORD_COMPLEXITY_MESSAGE;
  }

  return undefined;
}
