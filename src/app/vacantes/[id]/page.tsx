import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicVacanteDetailPage } from "@/features/landing/pages/PublicVacanteDetailPage";
import { getPublicVacanteDetail } from "@/features/landing/services/public-vacantes.service";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

type PageProps = {
  params: Promise<{ id: string }>;
};

function buildVacanteDescription(
  nombre?: string,
  descripcion?: string,
  dependenciaNombre?: string,
) {
  const summary = descripcion?.trim();
  if (summary) {
    return summary.length > 160 ? `${summary.slice(0, 157)}…` : summary;
  }

  const parts = [nombre?.trim(), dependenciaNombre?.trim()].filter(Boolean);
  if (parts.length > 0) {
    return `Vacante de ${parts.join(" en ")} publicada en ${SITE_NAME}.`;
  }

  return SITE_DESCRIPTION;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idVacante = Number(id);

  if (!Number.isFinite(idVacante)) {
    return { title: "Vacante no encontrada" };
  }

  const result = await getPublicVacanteDetail(idVacante);

  if (!result.ok) {
    return { title: "Vacante no disponible" };
  }

  const { nombre, descripcion, dependenciaNombre } = result.data;
  const title = nombre?.trim() || "Detalle de vacante";
  const description = buildVacanteDescription(nombre, descripcion, dependenciaNombre);
  const canonical = `/vacantes/${idVacante}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "es_MX",
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: "/images/logo.webp",
          width: 180,
          height: 48,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/images/logo.webp"],
    },
  };
}

export default async function VacanteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const idVacante = Number(id);

  if (!Number.isFinite(idVacante)) {
    notFound();
  }

  return <PublicVacanteDetailPage idVacante={idVacante} />;
}
