/** Códigos de `cat_modalidades` en el backend. */
export const MODALIDAD_CATALOGO_OPTIONS = [
  { value: "SERVICIO_SOCIAL", label: "Servicio social" },
  { value: "PRACTICAS_PROFESIONALES", label: "Prácticas profesionales" },
  { value: "RESIDENCIAS", label: "Residencias profesionales" },
] as const;

export type ModalidadCatalogoValue =
  (typeof MODALIDAD_CATALOGO_OPTIONS)[number]["value"];

const MODALIDAD_CATALOGO_LABELS: Record<ModalidadCatalogoValue, string> = {
  SERVICIO_SOCIAL: "Servicio social",
  PRACTICAS_PROFESIONALES: "Prácticas profesionales",
  RESIDENCIAS: "Residencias profesionales",
};

export function getModalidadCatalogoLabel(value?: string) {
  const normalized = value?.trim().toUpperCase() ?? "";
  if (normalized in MODALIDAD_CATALOGO_LABELS) {
    return MODALIDAD_CATALOGO_LABELS[normalized as ModalidadCatalogoValue];
  }

  return value?.trim() || "Sin modalidad";
}

export function isValidModalidadCatalogo(value?: string): value is ModalidadCatalogoValue {
  const normalized = value?.trim().toUpperCase() ?? "";
  return (MODALIDAD_CATALOGO_OPTIONS as readonly { value: string }[]).some(
    (option) => option.value === normalized,
  );
}
