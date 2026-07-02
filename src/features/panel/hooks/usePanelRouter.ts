"use client";

import { useRouter } from "next/navigation";

export function usePanelRouter() {
  const router = useRouter();

  return {
    back: router.back,
    forward: router.forward,
    push: router.push,
    replace: router.replace,
    prefetch: router.prefetch,
    refresh: router.refresh,
  };
}
