export const LANDING_NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Cómo registro", href: "#como-registro" },
  { label: "Vacantes", href: "#vacantes" },
  { label: "Instituciones", href: "#instituciones" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
] as const;

export const LANDING_FOOTER_EXTRA_LINKS = [
  { label: "Proceso", href: "#proceso" },
  { label: "Testimoniales", href: "#testimoniales" },
] as const;

export const LANDING_FOOTER_LINKS = [
  ...LANDING_NAV_LINKS,
  ...LANDING_FOOTER_EXTRA_LINKS,
] as const;

export const LANDING_SECTION_IDS = [
  ...LANDING_NAV_LINKS.map((link) => link.href),
  "#proceso",
  "#testimoniales",
  "#registrarme",
  "#acceder",
] as const;
