export type DelegacionProcesoModalSection =
  | "horas-requeridas"
  | "documentacion"
  | "registros-horas"
  | "cartas"
  | "cancelacion";

export const DELEGACION_PROCESO_SECTION_OPTIONS: {
  id: DelegacionProcesoModalSection;
  label: string;
}[] = [
  { id: "horas-requeridas", label: "Horas requeridas" },
  { id: "documentacion", label: "Documentación" },
  { id: "registros-horas", label: "Registros de horas" },
  { id: "cartas", label: "Cartas" },
  { id: "cancelacion", label: "Cancelar proceso" },
];

export const DELEGACION_PROCESO_SECTION_LABELS = Object.fromEntries(
  DELEGACION_PROCESO_SECTION_OPTIONS.map((option) => [option.id, option.label]),
) as Record<DelegacionProcesoModalSection, string>;
