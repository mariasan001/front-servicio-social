import type { Metadata } from "next";
import { PanelShell } from "@/features/panel/components/PanelShell/PanelShell";
import { requireServerSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  title: "Panel de titular",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TitularPanelPage() {
  const user = await requireServerSession();

  return (
    <PanelShell
      user={user}
      eyebrow="Titular de área"
      title="Panel de titular"
      description="Administra vacantes, postulaciones y seguimiento de alumnos en tu área."
    />
  );
}
