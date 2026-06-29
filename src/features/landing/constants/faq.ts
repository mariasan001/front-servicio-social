export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "1",
    question: "¿Quién puede registrarse en la plataforma?",
    answer:
      "Estudiantes de universidades e instituciones educativas del Estado de México registradas en la plataforma que necesiten realizar servicio social, prácticas profesionales o residencias en dependencias del Gobierno del Estado de México.",
  },
  {
    id: "2",
    question: "¿Cómo me registro?",
    answer:
      "Crea tu cuenta con tu correo institucional, completa tu perfil y revisa las vacantes disponibles en secretarías y organismos estatales. Cuando encuentres una opción, sigue el proceso de postulación indicado en cada convocatoria.",
  },
  {
    id: "3",
    question: "¿Cuál es la diferencia entre servicio social, prácticas y residencias?",
    answer:
      "El servicio social es un requisito académico de vinculación con la sociedad. Las prácticas y residencias profesionales son experiencias formativas en un área específica de tu carrera, con mayor enfoque en el desarrollo profesional.",
  },
  {
    id: "4",
    question: "¿Puedo consultar el avance de mi participación?",
    answer:
      "Sí. Una vez registrado, podrás consultar el estado de tu proceso, las etapas completadas y la información relacionada con tu vacante en la dependencia estatal desde tu panel de seguimiento.",
  },
  {
    id: "5",
    question: "¿Qué documentos necesito para concluir mi proceso?",
    answer:
      "Depende del tipo de participación y de la dependencia del Gobierno del Estado de México que te reciba. En general se requieren formatos de seguimiento, evaluaciones y comprobantes de horas. La plataforma te indicará los documentos aplicables a tu caso.",
  },
  {
    id: "6",
    question: "¿Cómo obtengo mis constancias al finalizar?",
    answer:
      "Al concluir tu servicio social o residencia profesional en una dependencia estatal y cumplir los requisitos, podrás descargar tus constancias y documentos desde la plataforma de forma segura.",
  },
];
