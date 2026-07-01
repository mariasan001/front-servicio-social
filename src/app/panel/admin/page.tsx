import type { Metadata } from "next";
import { PanelShell } from "@/features/panel/components/PanelShell/PanelShell";
import { requireServerSession } from "@/lib/auth/session.server";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPanelPage() {
  const user = await requireServerSession();

  return (
    <PanelShell
      user={user}
      eyebrow="Administración"
      title="Panel administrador"
      description="Configura usuarios internos, catálogos base y parámetros del sistema."
    />
  );
}
