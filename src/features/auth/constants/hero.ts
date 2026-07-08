export type AuthVariant = "login" | "register" | "reset";

export const AUTH_HERO_COPY: Record<
  AuthVariant,
  { eyebrow: string; title: string; description: string }
> = {
  login: {
    eyebrow: "Gobierno del Estado de México",
    title: "Tu servicio social, en un solo lugar",
    description:
      "Consulta vacantes en dependencias estatales, da seguimiento a tu proceso y concluye tu servicio social, prácticas o residencia profesional con información clara en cada etapa.",
  },
  register: {
    eyebrow: "Registro de estudiantes",
    title: "Da el primer paso en tu trayectoria",
    description:
      "Crea tu cuenta para postularte a vacantes, registrar horas, subir documentación y mantener tu avance actualizado durante todo el programa.",
  },
  reset: {
    eyebrow: "Recuperación de acceso",
    title: "Restablece tu contraseña con seguridad",
    description:
      "Usa el correo con el que te registraste. Te enviaremos un código de verificación para que definas una nueva contraseña y vuelvas a ingresar a la plataforma.",
  },
};
