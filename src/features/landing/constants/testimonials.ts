export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  program: string;
  institution: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    quote:
      "Encontré mi vacante en la Secretaría de Salud en pocos días y pude dar seguimiento a cada etapa sin perderme entre trámites. La plataforma hizo todo más claro.",
    name: "María González",
    program: "Licenciatura en Enfermería · UAEMex",
    institution: "Secretaría de Salud del Estado de México",
  },
  {
    id: "2",
    quote:
      "Registrar mi avance y consultar mis documentos en un solo lugar me ahorró mucho tiempo durante mi residencia en el Centro de Gobierno de Toluca.",
    name: "Carlos Méndez",
    program: "Ingeniería en Sistemas · Instituto Tecnológico de Toluca",
    institution: "Dirección General de Tecnologías de la Información",
  },
  {
    id: "3",
    quote:
      "La información estaba organizada y pude concentrarme en mi servicio social con el Instituto de la Juventud. Al final obtuve mis constancias sin complicaciones.",
    name: "Ana Torres",
    program: "Trabajo Social · Universidad Politécnica del Estado de México",
    institution: "Instituto de la Juventud del Estado de México",
  },
];
