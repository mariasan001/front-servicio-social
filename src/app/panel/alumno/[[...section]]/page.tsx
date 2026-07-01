import type { Metadata } from "next";
import { RolePanelSectionPage } from "@/features/panel";
import { USER_ROLES } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Panel de alumno",
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ section?: string[] }>;
};

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  return <RolePanelSectionPage role={USER_ROLES.ALUMNO} section={section} />;
}
