import { PUBLIC_VACANTES_ROUTES } from "./routes";

export const LANDING_NAV_LINKS = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Cómo registro", href: "/#como-registro" },
  { label: "Vacantes", href: PUBLIC_VACANTES_ROUTES.directory },
  { label: "Instituciones", href: "/#instituciones" },
  { label: "Preguntas frecuentes", href: "/#preguntas-frecuentes" },
] as const;

export const LANDING_FOOTER_EXTRA_LINKS = [
  { label: "Proceso", href: "/#proceso" },
  { label: "Testimoniales", href: "/#testimoniales" },
] as const;

export const LANDING_FOOTER_LINKS = [
  ...LANDING_NAV_LINKS,
  ...LANDING_FOOTER_EXTRA_LINKS,
] as const;

export const LANDING_SECTION_IDS = [
  "#inicio",
  "#como-registro",
  "#vacantes",
  "#instituciones",
  "#preguntas-frecuentes",
  "#proceso",
  "#testimoniales",
  "#registrarme",
  "#acceder",
] as const;

export function getLandingNavHash(href: string) {
  const hashIndex = href.indexOf("#");
  return hashIndex >= 0 ? href.slice(hashIndex) : null;
}

export function isLandingNavLinkActive(
  href: string,
  pathname: string,
  activeHash: string,
) {
  if (href === PUBLIC_VACANTES_ROUTES.directory) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const hash = getLandingNavHash(href);
  return Boolean(hash && pathname === "/" && activeHash === hash);
}
