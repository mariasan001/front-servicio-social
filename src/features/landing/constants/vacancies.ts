export type VacancyCategory = "servicio-social" | "residencias" | "practicas";
export type VacancyModality = "presencial" | "hibrido";

export type VacancyCard = {
  id: string;
  tipo: VacancyCategory;
  lugaresDisponibles: number;
  lugar: string;
  ubicacion: string;
  perfil: string;
  modalidad: VacancyModality;
  descripcion: string;
  horario: string;
};

export const VACANCY_TYPE_LABELS: Record<VacancyCategory, string> = {
  "servicio-social": "Servicio social",
  residencias: "Residencias",
  practicas: "Prácticas",
};

export const VACANCY_MODALITY_LABELS: Record<VacancyModality, string> = {
  presencial: "Presencial",
  hibrido: "Híbrido",
};

export const FEATURED_VACANCIES: VacancyCard[] = [
  {
    id: "1",
    tipo: "servicio-social",
    lugaresDisponibles: 12,
    lugar: "Secretaría de Salud del Estado de México",
    ubicacion: "Toluca, Estado de México",
    perfil: "Estudiantes de ciencias de la salud",
    modalidad: "presencial",
    descripcion:
      "Apoyo en programas de prevención y promoción de la salud en comunidades de la zona conurbada de Toluca.",
    horario: "Lunes a viernes · 8:00 – 14:00",
  },
  {
    id: "2",
    tipo: "residencias",
    lugaresDisponibles: 5,
    lugar: "Dirección General de Tecnologías de la Información",
    ubicacion: "Centro de Gobierno, Toluca",
    perfil: "Ingeniería en sistemas o afines",
    modalidad: "hibrido",
    descripcion:
      "Participación en proyectos de digitalización y mejora de procesos del Gobierno del Estado de México.",
    horario: "Lunes a viernes · 9:00 – 15:00",
  },
  {
    id: "3",
    tipo: "practicas",
    lugaresDisponibles: 8,
    lugar: "Instituto de la Juventud del Estado de México",
    ubicacion: "Naucalpan de Juárez, Estado de México",
    perfil: "Licenciatura en trabajo social o afines",
    modalidad: "presencial",
    descripcion:
      "Colaboración en actividades de vinculación juvenil y programas de desarrollo comunitario en el Valle de México.",
    horario: "Martes a sábado · 10:00 – 16:00",
  },
  {
    id: "4",
    tipo: "servicio-social",
    lugaresDisponibles: 6,
    lugar: "Secretaría de Educación, Ciencia, Tecnología e Innovación",
    ubicacion: "Ecatepec de Morelos, Estado de México",
    perfil: "Estudiantes de pedagogía o educación",
    modalidad: "hibrido",
    descripcion:
      "Apoyo en talleres formativos y actividades de acompañamiento escolar en comunidades del oriente del estado.",
    horario: "Lunes a viernes · 7:00 – 13:00",
  },
];
