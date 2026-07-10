import { describe, expect, it } from "vitest";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { buildJobPostingJsonLd } from "./job-posting-jsonld";
import type { PublicVacanteDetalleResponse } from "../types/public-vacante.types";

const base: PublicVacanteDetalleResponse = {
  idVacante: 42,
  nombre: "  Apoyo administrativo  ",
  descripcion: "  Apoyo en oficina  ",
  dependenciaNombre: "  Secretaría de Educación  ",
  areaNombre: "Recursos Humanos",
  direccion: "Toluca, Méx.",
  fechaPublicacion: "2026-01-10",
  activa: true,
  estatus: "PUBLICADA",
  cupoDisponible: 2,
};

describe("buildJobPostingJsonLd", () => {
  it("arma JobPosting con dependencia y ubicación", () => {
    const jsonLd = buildJobPostingJsonLd(base);

    expect(jsonLd).toMatchObject({
      "@type": "JobPosting",
      title: "Apoyo administrativo",
      description: "Apoyo en oficina",
      url: `${SITE_URL}/vacantes/42`,
      datePosted: "2026-01-10",
      employmentType: "INTERN",
      hiringOrganization: {
        "@type": "Organization",
        name: "Secretaría de Educación",
      },
      jobLocation: {
        "@type": "Place",
        address: "Toluca, Méx.",
      },
      occupationalCategory: "Recursos Humanos",
    });
  });

  it("usa fallbacks institucionales sin dependencia ni descripción", () => {
    const jsonLd = buildJobPostingJsonLd({
      idVacante: 7,
      perfilRequerido: "  Estudiante de derecho  ",
    });

    expect(jsonLd.title).toBe("Vacante de servicio social");
    expect(jsonLd.description).toBe("Estudiante de derecho");
    expect(jsonLd.hiringOrganization).toEqual({
      "@type": "GovernmentOrganization",
      name: "Gobierno del Estado de México",
      url: SITE_URL,
    });
    expect(jsonLd.jobLocation).toBeUndefined();
  });

  it("cae al copy del sitio si no hay descripción ni perfil", () => {
    const jsonLd = buildJobPostingJsonLd({ idVacante: 1 });
    expect(jsonLd.description).toBe(`Vacante publicada en ${SITE_NAME}.`);
  });
});
