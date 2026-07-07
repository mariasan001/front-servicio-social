"use client";

import { usePathname } from "next/navigation";
import {
  TITULAR_SEGUIMIENTO_TABS,
  type TitularSeguimientoTab,
} from "../../constants/seguimiento-sections";
import { PanelSubNav } from "@/shared/components/PanelSubNav";

function resolveActiveTab(pathname: string): TitularSeguimientoTab {
  const match = TITULAR_SEGUIMIENTO_TABS.find((tab) => pathname === tab.href);
  return match?.id ?? "alumnos";
}

export function TitularSeguimientoSubNav() {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  return (
    <PanelSubNav
      ariaLabel="Seguimiento de alumnos"
      tabs={TITULAR_SEGUIMIENTO_TABS}
      activeId={activeTab}
    />
  );
}
