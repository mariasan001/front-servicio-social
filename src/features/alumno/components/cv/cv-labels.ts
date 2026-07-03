const CV_FIELD_LABELS: Record<string, string> = {
  perfilProfesional: "Perfil profesional",
  experienciaLaboral: "Experiencia laboral",
  habilidades: "Habilidades",
  idiomas: "Idiomas",
  certificaciones: "Certificaciones",
  portafolioUrl: "URL de portafolio",
};

export function formatCvFieldLabel(field: string) {
  return CV_FIELD_LABELS[field] ?? field;
}

export const CV_REQUIRED_FIELDS = [
  "perfilProfesional",
  "experienciaLaboral",
  "habilidades",
] as const;

export const CV_OPTIONAL_FIELDS = ["idiomas", "certificaciones"] as const;

export const CV_TRACKED_FIELDS = [
  ...CV_REQUIRED_FIELDS,
  ...CV_OPTIONAL_FIELDS,
] as const;

export type CvTrackedField = (typeof CV_TRACKED_FIELDS)[number];
export type CvRequiredField = (typeof CV_REQUIRED_FIELDS)[number];

export function countCvProgress(values: Record<CvTrackedField, string>) {
  const filled = CV_TRACKED_FIELDS.filter((field) => values[field].trim().length > 0).length;
  const requiredFilled = CV_REQUIRED_FIELDS.filter(
    (field) => values[field].trim().length > 0,
  ).length;

  return {
    filled,
    total: CV_TRACKED_FIELDS.length,
    percent: Math.round((filled / CV_TRACKED_FIELDS.length) * 100),
    requiredComplete: requiredFilled === CV_REQUIRED_FIELDS.length,
  };
}

export function getMissingCvFields(values: Record<CvTrackedField, string>) {
  return CV_REQUIRED_FIELDS.filter((field) => !values[field].trim()).map(formatCvFieldLabel);
}
