import type { Metadata } from "next";
import { TitularSectionPage } from "@/features/titular";

export const metadata: Metadata = {
  title: "Panel de titular",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <TitularSectionPage section={section} />;
}
