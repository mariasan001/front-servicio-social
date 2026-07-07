import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AlumnoCvRouteGuard } from "@/features/alumno/components/AlumnoCvRouteGuard";
import {
  ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV,
  isCvComplete,
} from "@/features/alumno/components/cv/cv-labels";
import { loadAlumnoCv } from "@/features/alumno/lib/load-alumno-cv";
import { PanelLayout } from "@/features/panel/components/PanelLayout/PanelLayout";
import { USER_ROLES } from "@/lib/auth/constants";
import { hasAnyRole } from "@/lib/auth/roles";
import { requireServerSession } from "@/lib/auth/session.server";

type AlumnoPanelLayoutProps = {
  children: ReactNode;
};

export async function AlumnoPanelLayout({ children }: AlumnoPanelLayoutProps) {
  const user = await requireServerSession();

  if (!hasAnyRole(user.roles, [USER_ROLES.ALUMNO])) {
    notFound();
  }

  const cv = await loadAlumnoCv();
  const cvComplete = isCvComplete(cv);
  const disabledNavItemIds = cvComplete
    ? undefined
    : [...ALUMNO_NAV_IDS_BLOCKED_WITHOUT_CV];

  return (
    <PanelLayout
      user={user}
      role={USER_ROLES.ALUMNO}
      disabledNavItemIds={disabledNavItemIds}
      cvGateMessage={
        cvComplete
          ? undefined
          : "Completa y guarda tu CV para desbloquear el resto del panel."
      }
    >
      <AlumnoCvRouteGuard cvComplete={cvComplete}>{children}</AlumnoCvRouteGuard>
    </PanelLayout>
  );
}
