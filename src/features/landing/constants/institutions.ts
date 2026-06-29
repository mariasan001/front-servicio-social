export type RegisteredInstitution = {
  id: string;
  name: string;
  participants: number;
  practicasResidencias: number;
  servicioSocial: number;
};

export const REGISTERED_INSTITUTIONS: RegisteredInstitution[] = [
  {
    id: "1",
    name: "Universidad Autónoma del Estado de México",
    participants: 312,
    practicasResidencias: 118,
    servicioSocial: 194,
  },
  {
    id: "2",
    name: "Universidad Politécnica del Estado de México",
    participants: 198,
    practicasResidencias: 84,
    servicioSocial: 114,
  },
  {
    id: "3",
    name: "Instituto Tecnológico de Toluca",
    participants: 176,
    practicasResidencias: 72,
    servicioSocial: 104,
  },
  {
    id: "4",
    name: "Universidad Tecnológica de Tecámac",
    participants: 142,
    practicasResidencias: 56,
    servicioSocial: 86,
  },
  {
    id: "5",
    name: "Universidad Estatal del Valle de Ecatepec",
    participants: 128,
    practicasResidencias: 48,
    servicioSocial: 80,
  },
  {
    id: "6",
    name: "Universidad Pedagógica Nacional — Unidad 131 Valle de México",
    participants: 96,
    practicasResidencias: 38,
    servicioSocial: 58,
  },
];
