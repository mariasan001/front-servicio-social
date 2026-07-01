import type { Metadata } from "next";
import { DelegacionSectionPage } from "@/features/delegacion";

export const metadata: Metadata = {
  title: "Panel de delegación",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <DelegacionSectionPage section={section} />;
}
