"use client";

import { usePathname } from "next/navigation";
import {
  ALUMNO_PROCESO_BASE_PATH,
  ALUMNO_PROCESO_NAV_TABS,
  type AlumnoProcesoSubSlug,
} from "../../constants/proceso-sections";
import { PanelSubNav } from "@/shared/components/PanelSubNav";

function resolveActiveTab(pathname: string): AlumnoProcesoSubSlug {
  if (pathname === ALUMNO_PROCESO_BASE_PATH) {
    return "resumen";
  }

  const match = ALUMNO_PROCESO_NAV_TABS.find((section) => pathname === section.href);
  return match?.id ?? "resumen";
}

export function AlumnoProcesoSubNav() {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  return (
    <PanelSubNav
      ariaLabel="Secciones de mi proceso"
      tabs={ALUMNO_PROCESO_NAV_TABS}
      activeId={activeTab}
    />
  );
}
