"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ALUMNO_PROCESO_BASE_PATH,
  ALUMNO_PROCESO_NAV_TABS,
  type AlumnoProcesoSubSlug,
} from "../../constants/proceso-sections";
import styles from "./AlumnoProcesoSubNav.module.css";

function resolveActiveTab(pathname: string): AlumnoProcesoSubSlug {
  if (pathname === ALUMNO_PROCESO_BASE_PATH) {
    return "resumen";
  }

  const match = ALUMNO_PROCESO_NAV_TABS.find((section) => pathname === section.href);
  return match?.id ?? "resumen";
}

export function AlumnoProcesoSubNav() {
  const pathname = usePathname();
  const activeTab = resolveActiveTab(pathname);

  return (
    <nav className={styles.subNav} aria-label="Secciones de mi proceso">
      <div className={styles.subNavTrack} role="tablist" aria-orientation="horizontal">
        {ALUMNO_PROCESO_NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={[styles.subNavLink, isActive && styles.subNavLinkActive]
                .filter(Boolean)
                .join(" ")}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={[styles.subNavIcon, isActive && styles.subNavIconActive]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              >
                <Icon size={13} strokeWidth={isActive ? 2.1 : 1.85} />
              </span>
              <span className={styles.subNavLabel}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
