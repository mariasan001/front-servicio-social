import type { Metadata } from "next";
import { PanelShell } from "@/features/panel/components/PanelShell/PanelShell";
import { requireServerSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  title: "Panel de alumno",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AlumnoPanelPage() {
  const user = await requireServerSession();

  return (
    <PanelShell
      user={user}
      eyebrow="Alumno"
      title="Panel de alumno"
      description="Aquí darás seguimiento a vacantes, postulaciones y tu proceso de servicio social."
    />
  );
}
