"use client";

import { useEffect } from "react";
import {
  ensureClientSession,
  getSessionCheckIntervalMs,
} from "@/lib/auth/session.client";

export function PanelSessionMonitor() {
  useEffect(() => {
    let cancelled = false;

    const checkSession = async () => {
      if (cancelled) return;
      await ensureClientSession();
    };

    void checkSession();

    const intervalId = window.setInterval(() => {
      void checkSession();
    }, getSessionCheckIntervalMs());

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
