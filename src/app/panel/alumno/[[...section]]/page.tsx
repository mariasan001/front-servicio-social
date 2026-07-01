import type { Metadata } from "next";
import { AlumnoSectionPage } from "@/features/alumno";

export const metadata: Metadata = {
  title: "Panel de alumno",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <AlumnoSectionPage section={section} />;
}
