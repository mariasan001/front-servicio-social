"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/api/types";
import type { UserRole } from "@/lib/auth/constants";
import { getAccessibleNavigations, getNavigationForRole } from "../../constants/navigation";
import { PanelSidebar } from "../PanelSidebar/PanelSidebar";
import styles from "./PanelLayout.module.css";

type PanelLayoutProps = {
  user: AuthUser;
  role: UserRole;
  children: ReactNode;
};

export function PanelLayout({ user, role, children }: PanelLayoutProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const navigation = getNavigationForRole(role);
  const accessibleNavigations = getAccessibleNavigations(user.roles);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  if (!navigation) {
    return null;
  }

  return (
    <div className={styles.panelLayout}>
      <div className={styles.shell}>
        <div
          className={[styles.overlay, isSidebarOpen && styles.overlayVisible]
            .filter(Boolean)
            .join(" ")}
          aria-hidden={!isSidebarOpen}
          onClick={() => setIsSidebarOpen(false)}
        />

        <div
          id="panel-sidebar"
          className={[styles.sidebar, isSidebarOpen && styles.sidebarOpen]
            .filter(Boolean)
            .join(" ")}
        >
          <PanelSidebar
            user={user}
            navigation={navigation}
            accessibleNavigations={accessibleNavigations}
            onNavigate={() => setIsSidebarOpen(false)}
          />
        </div>

        <div className={styles.mainColumn}>
          <header className={styles.topbar}>
            <button
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
