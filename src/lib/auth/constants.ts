export const USER_ROLES = {
  ADMINISTRADOR: "ROLE_ADMINISTRADOR",
  ALUMNO: "ROLE_ALUMNO",
  DELEGACION: "ROLE_DELEGACION",
  ENLACE_ESCOLAR: "ROLE_ENLACE_ESCOLAR",
  TITULAR_AREA: "ROLE_TITULAR_AREA",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PANEL_PATHS = {
  root: "/panel",
  alumno: "/panel/alumno",
  delegacion: "/panel/delegacion",
  titular: "/panel/titular",
  admin: "/panel/admin",
  enlace: "/panel/enlace",
} as const;

export const AUTH_PATHS = {
  login: "/login",
  register: "/registro",
  resetPassword: "/recuperar-contrasena",
  resetPasswordConfirm: "/restablecer-contrasena",
  home: "/",
} as const;

export const GUEST_ONLY_PATHS = [
  AUTH_PATHS.login,
  AUTH_PATHS.register,
  AUTH_PATHS.resetPassword,
  AUTH_PATHS.resetPasswordConfirm,
] as const;

export const ROLE_HOME_PATHS: Record<UserRole, string> = {
  [USER_ROLES.ADMINISTRADOR]: PANEL_PATHS.admin,
  [USER_ROLES.DELEGACION]: PANEL_PATHS.delegacion,
  [USER_ROLES.TITULAR_AREA]: PANEL_PATHS.titular,
  [USER_ROLES.ENLACE_ESCOLAR]: PANEL_PATHS.enlace,
  [USER_ROLES.ALUMNO]: PANEL_PATHS.alumno,
};

export const ROLE_PRIORITY: UserRole[] = [
  USER_ROLES.ADMINISTRADOR,
  USER_ROLES.DELEGACION,
  USER_ROLES.TITULAR_AREA,
  USER_ROLES.ENLACE_ESCOLAR,
  USER_ROLES.ALUMNO,
];

export const PANEL_ROLE_ACCESS: Record<string, UserRole[]> = {
  [PANEL_PATHS.alumno]: [USER_ROLES.ALUMNO],
  [PANEL_PATHS.delegacion]: [USER_ROLES.DELEGACION],
  [PANEL_PATHS.titular]: [USER_ROLES.TITULAR_AREA],
  [PANEL_PATHS.admin]: [USER_ROLES.ADMINISTRADOR],
  [PANEL_PATHS.enlace]: [USER_ROLES.ENLACE_ESCOLAR],
};
