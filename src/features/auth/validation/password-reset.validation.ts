import { PASSWORD_MIN_LENGTH } from "../constants/register";

const USERNAME_OR_EMAIL_MAX_LENGTH = 150;
const PASSWORD_MAX_LENGTH = 100;

export type ResetEmailFormValues = {
  usernameOrEmail: string;
};

export type ResetPasswordFormValues = {
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
  const usernameOrEmail = values.usernameOrEmail.trim();

  if (!usernameOrEmail) {
    errors.usernameOrEmail = "Ingresa tu usuario o correo electrónico.";
  } else if (usernameOrEmail.length > USERNAME_OR_EMAIL_MAX_LENGTH) {
    errors.usernameOrEmail = `Máximo ${USERNAME_OR_EMAIL_MAX_LENGTH} caracteres.`;
  }

  return errors;
}

export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
): ResetPasswordFormErrors {
  const errors: ResetPasswordFormErrors = {};
  const password = values.password;
  const confirmPassword = values.confirmPassword;

  if (!password) {
    errors.password = "Ingresa una contraseña nueva.";
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Máximo ${PASSWORD_MAX_LENGTH} caracteres.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirma tu contraseña.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }

  return errors;
}
