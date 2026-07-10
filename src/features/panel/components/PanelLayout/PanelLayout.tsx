"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/api/types";
import type { UserRole } from "@/lib/auth/constants";
import { getAccessibleNavigations, getNavigationForRole } from "../../constants/navigation";
import { PanelSessionMonitor } from "../PanelSessionMonitor/PanelSessionMonitor";
import { PanelSidebar } from "../PanelSidebar/PanelSidebar";
import styles from "./PanelLayout.module.css";

type PanelLayoutProps = {
  user: AuthUser;
  role: UserRole;
  children: ReactNode;
  disabledNavItemIds?: string[];
  cvGateMessage?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  );
}

export function PanelLayout({
  user,
  role,
  children,
  disabledNavItemIds,
  cvGateMessage,
}: PanelLayoutProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const navigation = getNavigationForRole(role);
  const accessibleNavigations = getAccessibleNavigations(user.roles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarPath, setSidebarPath] = useState(pathname);

  if (pathname !== sidebarPath) {
    setSidebarPath(pathname);
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    document.documentElement.classList.add("panel-shell");

    return () => {
      document.documentElement.classList.remove("panel-shell");
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusInitial = () => {
      const sidebar = sidebarRef.current;
      if (!sidebar) {
        return;
      }

      const focusable = getFocusableElements(sidebar);
      (focusable[0] ?? sidebar).focus();
    };

    const frame = window.requestAnimationFrame(focusInitial);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSidebar();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const sidebar = sidebarRef.current;
      if (!sidebar) {
        return;
      }

      const focusable = getFocusableElements(sidebar);
      if (focusable.length === 0) {
        event.preventDefault();
        sidebar.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const menuButton = menuButtonRef.current;

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      const previous = previouslyFocusedRef.current ?? menuButton;
      previous?.focus();
    };
  }, [isSidebarOpen]);

  if (!navigation) {
    return null;
  }

  return (
    <div className={styles.panelLayout}>
      <PanelSessionMonitor />
      <div className={styles.shell}>
        <div
          className={[styles.overlay, isSidebarOpen && styles.overlayVisible]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!isSidebarOpen}
          onClick={closeSidebar}
        />

        <div
          id="panel-sidebar"
          ref={sidebarRef}
          className={[styles.sidebar, isSidebarOpen && styles.sidebarOpen]
            .filter(Boolean)
            .join(" ")}
          tabIndex={-1}
        >
          <PanelSidebar
            user={user}
            navigation={navigation}
            accessibleNavigations={accessibleNavigations}
            disabledNavItemIds={disabledNavItemIds}
            disabledNavMessage={cvGateMessage}
            onNavigate={closeSidebar}
          />
        </div>

        <div className={styles.mainColumn}>
          <header className={styles.topbar}>
            <button
              ref={menuButtonRef}
              type="button"
              className={styles.menuButton}
              aria-expanded={isSidebarOpen}
              aria-controls="panel-sidebar"
              onClick={() => setIsSidebarOpen((open) => !open)}
            >
              {isSidebarOpen ? (
                <X size={20} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Menu size={20} strokeWidth={2} aria-hidden="true" />
              )}
              <span className="sr-only">
                {isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
              </span>
            </button>

            <div>
              <p className={styles.topbarTitle}>{navigation.label}</p>
              <p className={styles.topbarMeta}>{user.nombreCompleto}</p>
            </div>
          </header>

          <main className={styles.content} id="main">
            <div ref={contentRef} className={styles.contentInner}>
              <div className={styles.contentBody}>{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
