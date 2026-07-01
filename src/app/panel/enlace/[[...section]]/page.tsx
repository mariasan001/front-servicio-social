import type { Metadata } from "next";
import { EnlaceSectionPage } from "@/features/enlace";

export const metadata: Metadata = {
  title: "Panel enlace escolar",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <EnlaceSectionPage section={section} />;
}
