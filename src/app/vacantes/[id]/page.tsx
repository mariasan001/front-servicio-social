import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicVacanteDetailPage } from "@/features/landing/pages/PublicVacanteDetailPage";
import { getPublicVacanteDetail } from "@/features/landing/services/public-vacantes.service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idVacante = Number(id);

  if (!Number.isFinite(idVacante)) {
    return { title: "Vacante no encontrada" };
  }

  const result = await getPublicVacanteDetail(idVacante);
  const nombre = result.ok ? result.data.nombre?.trim() : undefined;

  return {
    title: nombre ? nombre : "Detalle de vacante",
    alternates: {
      canonical: `/vacantes/${idVacante}`,
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
