import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatPublicVacanteDate,
  getLandingVacancyPreview,
  isPublishedVacante,
  LANDING_VACANCY_PREVIEW_LIMIT,
  listPublishedPublicVacantes,
  sortPublicVacantes,
} from "./public-vacantes";
import type { PublicVacanteResponse } from "../types/public-vacante.types";

vi.mock("../services/public-vacantes.service", () => ({
  listPublicVacantes: vi.fn(),
}));

import { listPublicVacantes } from "../services/public-vacantes.service";

const listPublicVacantesMock = vi.mocked(listPublicVacantes);

function vacante(
  overrides: Partial<PublicVacanteResponse> = {},
): PublicVacanteResponse {
  return {
    idVacante: 1,
    nombre: "Vacante",
    activa: true,
    estatus: "PUBLICADA",
    cupoDisponible: 1,
    ...overrides,
  };
}

describe("isPublishedVacante", () => {
  it("acepta vacantes publicadas con cupo", () => {
    expect(isPublishedVacante(vacante())).toBe(true);
  });

  it("rechaza inactivas, no publicadas o sin cupo", () => {
    expect(isPublishedVacante(vacante({ activa: false }))).toBe(false);
    expect(isPublishedVacante(vacante({ estatus: "BORRADOR" }))).toBe(false);
    expect(isPublishedVacante(vacante({ cupoDisponible: 0 }))).toBe(false);
  });
});

describe("sortPublicVacantes", () => {
  it("ordena por fecha de publicación descendente", () => {
    const sorted = sortPublicVacantes([
      vacante({ idVacante: 1, fechaPublicacion: "2024-01-01" }),
      vacante({ idVacante: 2, fechaPublicacion: "2025-06-01" }),
      vacante({ idVacante: 3 }),
    ]);

    expect(sorted.map((item) => item.idVacante)).toEqual([2, 1, 3]);
  });
});

describe("formatPublicVacanteDate", () => {
  it("formatea fechas válidas en es-MX", () => {
    expect(formatPublicVacanteDate("2024-03-15")).toMatch(/2024/);
  });

  it("devuelve null ante vacío o inválido", () => {
    expect(formatPublicVacanteDate()).toBeNull();
    expect(formatPublicVacanteDate("   ")).toBeNull();
    expect(formatPublicVacanteDate("no-es-fecha")).toBeNull();
  });
});

describe("listPublishedPublicVacantes", () => {
  beforeEach(() => {
    listPublicVacantesMock.mockReset();
  });

  it("filtra y ordena publicadas", async () => {
    listPublicVacantesMock.mockResolvedValue({
      ok: true,
      data: [
        vacante({ idVacante: 1, fechaPublicacion: "2024-01-01" }),
        vacante({ idVacante: 2, estatus: "BORRADOR" }),
        vacante({ idVacante: 3, fechaPublicacion: "2025-01-01" }),
      ],
    });

    const result = await listPublishedPublicVacantes();
    expect(result.loadError).toBeUndefined();
    expect(result.data.map((item) => item.idVacante)).toEqual([3, 1]);
  });

  it("propaga error de carga", async () => {
    listPublicVacantesMock.mockResolvedValue({
      ok: false,
      reason: "unavailable",
    });

    const result = await listPublishedPublicVacantes();
    expect(result.data).toEqual([]);
    expect(result.loadError).toMatch(/vacantes/i);
  });
});

describe("getLandingVacancyPreview", () => {
  beforeEach(() => {
    listPublicVacantesMock.mockReset();
  });

  it("limita el preview de landing", async () => {
    listPublicVacantesMock.mockResolvedValue({
      ok: true,
      data: Array.from({ length: LANDING_VACANCY_PREVIEW_LIMIT + 2 }, (_, index) =>
        vacante({
          idVacante: index + 1,
          fechaPublicacion: `2025-0${index + 1}-01`,
        }),
      ),
    });

    const result = await getLandingVacancyPreview();
    expect(result.data).toHaveLength(LANDING_VACANCY_PREVIEW_LIMIT);
  });
});
