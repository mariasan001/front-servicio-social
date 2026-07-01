import type { Metadata } from "next";
import { PanelShell } from "@/features/panel/components/PanelShell/PanelShell";
import { requireServerSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  title: "Panel de delegación",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DelegacionPanelPage() {
  const user = await requireServerSession();

  return (
    <PanelShell
      user={user}
      eyebrow="Delegación"
      title="Panel de delegación"
      description="Gestiona vacantes, procesos, documentos y reportes del programa."
    />
  );
}
