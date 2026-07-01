import type { Metadata } from "next";
import { PanelShell } from "@/features/panel/components/PanelShell/PanelShell";
import { requireServerSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  title: "Panel enlace escolar",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EnlacePanelPage() {
  const user = await requireServerSession();

  return (
    <PanelShell
      user={user}
      eyebrow="Enlace escolar"
      title="Panel de enlace escolar"
      description="Consulta el avance de alumnos vinculados a tu institución educativa."
    />
  );
}
