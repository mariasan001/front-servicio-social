export const LANDING_NAV_LINKS = [
  { label: "Inicio", href: "#inicio" },
  { label: "Cómo registro", href: "#como-registro" },
  { label: "Vacantes", href: "#vacantes" },
  { label: "Convenios", href: "#convenios" },
  { label: "Preguntas frecuentes", href: "#preguntas-frecuentes" },
] as const;

export const LANDING_SECTION_IDS = LANDING_NAV_LINKS.map((link) => link.href);
