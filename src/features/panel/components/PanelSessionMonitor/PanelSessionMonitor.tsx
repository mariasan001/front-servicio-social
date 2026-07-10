"use client";

import { useEffect } from "react";
import {
  ensureClientSession,
  getSessionCheckIntervalMs,
} from "@/lib/auth/session.client";

const INITIAL_CHECK_DELAY_MS = 1_500;

export function PanelSessionMonitor() {
  useEffect(() => {
    let cancelled = false;
    let intervalId = 0;
    let initialTimeoutId = 0;

    const checkSession = async () => {
      if (cancelled) return;
      await ensureClientSession();
    };

    // Evita un falso 401 justo después del login, antes de que la cookie esté lista.
    initialTimeoutId = window.setTimeout(() => {
      void checkSession();
      intervalId = window.setInterval(() => {
        void checkSession();
      }, getSessionCheckIntervalMs());
    }, INITIAL_CHECK_DELAY_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
