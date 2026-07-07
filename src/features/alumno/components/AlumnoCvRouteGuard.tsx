"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, type ReactNode } from "react";
import { PANEL_PATHS } from "@/lib/auth/constants";
import { PanelSectionSkeleton } from "@/features/panel/components/PanelSectionSkeleton/PanelSectionSkeleton";

const CV_PATH = `${PANEL_PATHS.alumno}/cv`;

function isCvRoute(pathname: string) {
  return pathname === CV_PATH || pathname.startsWith(`${CV_PATH}/`);
}

type AlumnoCvRouteGuardProps = {
  cvComplete: boolean;
  children: ReactNode;
};

export function AlumnoCvRouteGuard({ cvComplete, children }: AlumnoCvRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const onCvRoute = isCvRoute(pathname);

  useLayoutEffect(() => {
    if (cvComplete || onCvRoute) {
      return;
    }

    router.replace(CV_PATH);
  }, [cvComplete, onCvRoute, router]);

  if (!cvComplete && !onCvRoute) {
    return <PanelSectionSkeleton />;
  }

  return children;
}
