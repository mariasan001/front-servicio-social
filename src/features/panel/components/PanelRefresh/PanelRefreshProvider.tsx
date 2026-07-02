"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

type PanelRefreshContextValue = {
  isRefreshing: boolean;
  refreshPanel: () => void;
};

const PanelRefreshContext = createContext<PanelRefreshContextValue | null>(null);

type PanelRefreshProviderProps = {
  children: ReactNode;
};

export function PanelRefreshProvider({ children }: PanelRefreshProviderProps) {
  const router = useRouter();
  const [isRefreshing, startTransition] = useTransition();

  const refreshPanel = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  const value = useMemo(
    () => ({
      isRefreshing,
      refreshPanel,
    }),
    [isRefreshing, refreshPanel],
  );

  return <PanelRefreshContext.Provider value={value}>{children}</PanelRefreshContext.Provider>;
}

export function usePanelRefresh() {
  const context = useContext(PanelRefreshContext);

  if (!context) {
    throw new Error("usePanelRefresh must be used within PanelRefreshProvider");
  }

  return context;
}

export function useOptionalPanelRefresh() {
  return useContext(PanelRefreshContext);
}
