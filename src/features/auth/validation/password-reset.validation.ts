import { CORREO_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants/register";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;

export type ResetEmailFormValues = {
  correo: string;
};

export type ResetPasswordFormValues = {
  codigo: string;
  password: string;
  confirmPassword: string;
};

export type ResetEmailFormErrors = Partial<
  Record<keyof ResetEmailFormValues, string>
>;

export type ResetPasswordFormErrors = Partial<
  Record<keyof ResetPasswordFormValues, string>
>;

export function validateResetEmailForm(
  values: ResetEmailFormValues,
): ResetEmailFormErrors {
  const errors: ResetEmailFormErrors = {};
  const correo = values.correo.trim();

  if (!correo) {
    errors.correo = "Ingresa tu correo electrónico.";
  } else if (!EMAIL_PATTERN.test(correo)) {
    errors.correo = "Ingresa un correo electrónico válido.";
  } else if (correo.length > CORREO_MAX_LENGTH) {
    errors.correo = `Máximo ${CORREO_MAX_LENGTH} caracteres.`;
  }

  return errors;
}

export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};
  const codigo = values.codigo.trim();
  const password = values.password;
  const confirmPassword = values.confirmPassword;

  if (!codigo) {
    errors.codigo = "Ingresa el código de verificación.";
  } else if (!CODE_PATTERN.test(codigo)) {
    errors.codigo = "El código debe tener 6 dígitos.";
  }

  if (!password) {
    errors.password = "Ingresa una contraseña nueva.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}
