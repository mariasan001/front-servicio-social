export const ALUMNO_SECTIONS = [
  "inicio",
  "vacantes",
  "postulaciones",
  "proceso",
  "cv",
  "notificaciones",
] as const;

export type AlumnoSectionSlug = (typeof ALUMNO_SECTIONS)[number];
