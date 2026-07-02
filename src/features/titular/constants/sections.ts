export const TITULAR_SECTIONS = [
  "inicio",
  "vacantes",
  "postulaciones",
  "procesos",
  "incidencias",
] as const;

export type TitularSectionSlug = (typeof TITULAR_SECTIONS)[number];
