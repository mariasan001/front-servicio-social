import type { Metadata } from "next";
import { AdminSectionPage } from "@/features/admin";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <AdminSectionPage section={section} />;
}
