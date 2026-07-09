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

export type CvCompletionSnapshot = {
  completo?: boolean;
  camposFaltantes?: string[];
  perfilProfesional?: string;
  experienciaLaboral?: string;
  habilidades?: string;
  idiomas?: string;
  certificaciones?: string;
};

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

export function isCvComplete(cv?: CvCompletionSnapshot | null) {
  if (cv?.completo === true) {
    return true;
  }

  if (cv?.completo === false) {
    return false;
  }

  if (!cv) {
    return false;
  }

  const values: Record<CvTrackedField, string> = {
    perfilProfesional: cv.perfilProfesional ?? "",
    experienciaLaboral: cv.experienciaLaboral ?? "",
    habilidades: cv.habilidades ?? "",
    idiomas: cv.idiomas ?? "",
    certificaciones: cv.certificaciones ?? "",
  };

  return countCvProgress(values).requiredComplete;
}

/** Secciones del panel alumno bloqueadas hasta completar el CV. */
export const ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV = [
  "inicio",
  "vacantes",
  "postulaciones",
  "proceso",
] as const;

export const ALUMNO_CV_NAV_ID = "cv" as const;
