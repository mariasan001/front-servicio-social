import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlumnoExamenSection } from "@/features/alumno/sections/AlumnoExamenSection";

export const metadata: Metadata = {
  title: "Examen diagnóstico",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ idPostulacion: string }>;
};

export default async function Page({ params }: PageProps) {
  const { idPostulacion: rawId } = await params;
  const idPostulacion = Number(rawId);

  if (!Number.isFinite(idPostulacion) || idPostulacion <= 0) {
    notFound();
  }

  return <AlumnoExamenSection idPostulacion={idPostulacion} />;
}
