export const MODALIDAD_TRABAJO_OPTIONS = [
  { value: "PRESENCIAL", label: "Presencial", hint: "Actividades en las instalaciones del área." },
  { value: "HIBRIDO", label: "Híbrido", hint: "Combinación de trabajo presencial y remoto." },
  { value: "REMOTO", label: "Remoto", hint: "Actividades principalmente a distancia." },
] as const;

export type ModalidadTrabajoValue = (typeof MODALIDAD_TRABAJO_OPTIONS)[number]["value"];

export function getModalidadTrabajoLabel(value?: string) {
  const match = MODALIDAD_TRABAJO_OPTIONS.find((option) => option.value === value);
  return match?.label ?? value ?? "Sin modalidad";
}
