export const AUTH_ROUTES = {
  login: "/login",
  register: "/registro",
  resetPassword: "/recuperar-contrasena",
  home: "/",
  panel: "/panel",
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
    "Ingresa tu correo electrónico institucional para recibir un código de verificación.",
  resetCodeSubtitle:
    "Ingresa el código de 6 dígitos y define tu nueva contraseña.",
  resetSuccessTitle: "Contraseña actualizada",
  resetSuccessSubtitle: "Tu acceso quedó restablecido correctamente.",
} as const;
