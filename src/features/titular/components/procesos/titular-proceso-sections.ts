export type TitularProcesoModalSection = "horas" | "incidencias" | "liberacion" | "evaluacion";

export const TITULAR_PROCESO_SECTION_OPTIONS: {
  id: TitularProcesoModalSection;
  label: string;
}[] = [
  { id: "horas", label: "Registro de horas" },
  { id: "incidencias", label: "Incidencias" },
  { id: "liberacion", label: "Liberación técnica" },
  { id: "evaluacion", label: "Evaluación final" },
];

export const TITULAR_PROCESO_SECTION_LABELS = Object.fromEntries(
  TITULAR_PROCESO_SECTION_OPTIONS.map((option) => [option.id, option.label]),
) as Record<TitularProcesoModalSection, string>;
