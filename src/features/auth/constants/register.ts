export const MODALIDAD_INTERES_OPTIONS = [
  { value: "SERVICIO_SOCIAL", label: "Servicio social" },
  { value: "PRACTICAS", label: "Prácticas profesionales" },
  { value: "RESIDENCIAS", label: "Residencias profesionales" },
] as const;

export type ModalidadInteresValue =
  (typeof MODALIDAD_INTERES_OPTIONS)[number]["value"];

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MAX_LENGTH = 100;
export const NOMBRE_MAX_LENGTH = 250;
export const CORREO_MAX_LENGTH = 150;
export const TELEFONO_MAX_LENGTH = 30;
export const CURP_MAX_LENGTH = 18;
export const CARRERA_MAX_LENGTH = 180;
export const ESCUELA_MAX_LENGTH = 255;
export const SEGURO_MAX_LENGTH = 50;
