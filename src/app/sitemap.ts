import type { MetadataRoute } from "next";
import { listPublicVacantes } from "@/features/landing/services/public-vacantes.service";
import { SITE_URL } from "@/lib/site";

const STATIC_ENTRIES: MetadataRoute.Sitemap = [
  {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${SITE_URL}/vacantes`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = await listPublicVacantes();

  if (!result.ok || result.data.length === 0) {
    return STATIC_ENTRIES;
  }

  const vacanteEntries: MetadataRoute.Sitemap = result.data
    .filter((vacante) => Number.isFinite(vacante.idVacante))
    .map((vacante) => ({
      url: `${SITE_URL}/vacantes/${vacante.idVacante}`,
      lastModified: vacante.fechaPublicacion
        ? new Date(vacante.fechaPublicacion)
        : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...STATIC_ENTRIES, ...vacanteEntries];
}
