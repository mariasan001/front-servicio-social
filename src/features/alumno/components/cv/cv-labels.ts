import {
  ALUMNO_CV_NAV_ID,
  ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV,
  CV_OPTIONAL_FIELDS,
  CV_REQUIRED_FIELDS,
  CV_TRACKED_FIELDS,
  countCvProgress,
  isCvComplete,
  type CvRequiredField,
  type CvTrackedField,
} from "@/lib/domain/cv";

export {
  ALUMNO_CV_NAV_ID,
  ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV,
  CV_OPTIONAL_FIELDS,
  CV_REQUIRED_FIELDS,
  CV_TRACKED_FIELDS,
  countCvProgress,
  isCvComplete,
  type CvRequiredField,
  type CvTrackedField,
};

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

export function getMissingCvFields(values: Record<CvTrackedField, string>) {
  return CV_REQUIRED_FIELDS.filter((field) => !values[field].trim()).map(formatCvFieldLabel);
}
