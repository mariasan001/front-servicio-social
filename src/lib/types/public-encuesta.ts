export type EncuestaSatisfaccionResponse = {
  idEncuesta: number;
  nombre: string;
  carrera: string;
  escuela: string;
  comentario: string;
  estatus?: string;
  fechaRegistro?: string;
};

export type CrearEncuestaSatisfaccionRequest = {
  nombre: string;
  carrera: string;
  escuela: string;
  comentario: string;
};

export type LandingTestimonial = {
  id: string;
  quote: string;
  name: string;
  program: string;
  institution: string;
};
