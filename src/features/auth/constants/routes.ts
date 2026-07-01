export const AUTH_ROUTES = {
  login: "/login",
  register: "/registro",
  resetPassword: "/recuperar-contrasena",
  home: "/",
  panel: "/panel",
} as const;

export const AUTH_COPY = {
  loginTitle: "Iniciar sesión",
  loginSubtitle:
    "Ingresa tus credenciales institucionales para acceder a la plataforma.",
  registerTitle: "Crear cuenta",
  registerSubtitle:
    "Regístrate como estudiante para consultar vacantes y dar seguimiento a tu participación.",
  registerWithTokenSubtitle:
    "Tu institución te proporcionó un enlace de registro. Completa tus datos para activar tu cuenta.",
  resetTitle: "Restablecer contraseña",
  resetEmailSubtitle:
    "Ingresa tu correo electrónico institucional para recibir un código de verificación.",
  resetCodeSubtitle:
    "Ingresa el código de 6 dígitos y define tu nueva contraseña.",
} as const;
