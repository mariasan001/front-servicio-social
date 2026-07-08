import { AUTH_PATHS, PANEL_PATHS } from "@/lib/auth/constants";

export const AUTH_ROUTES = {
  ...AUTH_PATHS,
  panel: PANEL_PATHS.root,
} as const;

export const AUTH_FOOTER_COPY =
  "Plataforma de Control y Seguimiento de Servicio Social y Residencia — Gobierno del Estado de México";

export const AUTH_COPY = {
  loginTitle: "¡Bienvenido de nuevo!",
  loginSubtitle:
    "Ingresa tus credenciales institucionales para acceder a tu panel.",
  registerTitle: "Crear cuenta",
  registerSubtitle:
    "Regístrate como estudiante para consultar vacantes y dar seguimiento a tu participación.",
  registerWithTokenSubtitle:
    "Completa tus datos personales y escolares. Tu escuela ya viene definida por la invitación.",
  resetTitle: "Recuperar contraseña",
  resetEmailSubtitle:
    "Ingresa tu usuario o correo institucional y te enviaremos un enlace para restablecer tu contraseña.",
  resetEmailSentTitle: "Revisa tu correo",
  resetEmailSentSubtitle:
    "Si la cuenta existe, te enviamos un correo con un enlace para restablecer tu contraseña.",
  resetNewPasswordTitle: "Define tu nueva contraseña",
  resetNewPasswordSubtitle:
    "Crea una contraseña nueva para volver a acceder a tu cuenta.",
  resetInvalidTokenTitle: "Enlace no válido",
  resetInvalidTokenSubtitle:
    "El enlace para restablecer tu contraseña es inválido o ya no está disponible. Solicita uno nuevo.",
  resetSuccessTitle: "Contraseña actualizada",
  resetSuccessSubtitle: "Tu acceso quedó restablecido correctamente.",
} as const;
