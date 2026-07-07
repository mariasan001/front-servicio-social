"use client";

import { usePathname } from "next/navigation";
import {
  DELEGACION_VALIDACION_NAV_TABS,
  type DelegacionValidacionSubSlug,
} from "../../constants/validacion-sections";
import { PanelSubNav } from "@/shared/components/PanelSubNav";

function resolveActiveTab(pathname: string): DelegacionValidacionSubSlug {
  const match = DELEGACION_VALIDACION_NAV_TABS.find((section) => pathname === section.href);
  return match?.id ?? "documentos";
}

export function DelegacionValidacionSubNav() {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  return (
    <PanelSubNav
      ariaLabel="Secciones de validaciones"
      tabs={DELEGACION_VALIDACION_NAV_TABS}
      activeId={activeTab}
    />
  );
}
