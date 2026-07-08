export type PublicTestimonioResponse = {
  idTestimonio: number;
  comentario: string;
  nombreEstudiante: string;
  programaEstudios?: string;
  escuela?: string;
  dependencia?: string;
};

export type LandingTestimonial = {
  id: string;
  quote: string;
  name: string;
  program: string;
  institution: string;
};
