"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useOptionalPanelRefresh } from "../components/PanelRefresh/PanelRefreshProvider";

export function usePanelRouter() {
  const router = useRouter();
  const panelRefresh = useOptionalPanelRefresh();

  const refresh = useCallback(() => {
    if (panelRefresh) {
      panelRefresh.refreshPanel();
      return;
    }

    router.refresh();
  }, [panelRefresh, router]);

  return {
    back: router.back,
    forward: router.forward,
    push: router.push,
    replace: router.replace,
    prefetch: router.prefetch,
    refresh,
    isRefreshing: panelRefresh?.isRefreshing ?? false,
  };
}
