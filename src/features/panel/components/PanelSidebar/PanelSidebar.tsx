"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AuthUser } from "@/lib/api/types";
import { LogoutButton } from "@/features/auth/components/LogoutButton/LogoutButton";
import type { PanelNavGroup } from "../../constants/navigation";
import styles from "./PanelSidebar.module.css";

type PanelSidebarProps = {
  user: AuthUser;
  navigation: PanelNavGroup;
  accessibleNavigations: PanelNavGroup[];
  onNavigate?: () => void;
};

function matchNavItem(pathname: string, href: string, basePath: string) {
  if (pathname === href) {
    return true;
  }

  if (href === basePath) {
    return pathname === basePath;
  }

  return pathname.startsWith(`${href}/`);
}

export function PanelSidebar({
  user,
  navigation,
  accessibleNavigations,
  onNavigate,
}: PanelSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar} aria-label="Menú del panel">
      <div className={styles.brandBlock}>
        <span className={styles.roleLabel}>{navigation.label}</span>
        <Link href={navigation.basePath} className={styles.brand}>
          Servicio Social Edomex
        </Link>
      </div>

      {accessibleNavigations.length > 1 ? (
        <div className={styles.roleSwitcher} aria-label="Cambiar panel por rol">
          {accessibleNavigations.map((group) => {
            const isActive = group.role === navigation.role;

            return (
              <Link
                key={group.role}
                href={group.basePath}
                className={[
                  styles.roleSwitcherLink,
                  isActive && styles.roleSwitcherLinkActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={isActive ? "page" : undefined}
                onClick={onNavigate}
              >
                {group.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      <nav className={styles.nav}>
        {navigation.items.map((item) => {
          const active = matchNavItem(pathname, item.href, navigation.basePath);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={[styles.navLink, active && styles.navLinkActive]
                .filter(Boolean)
                .join(" ")}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon className={styles.navIcon} size={18} strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.userBlock}>
        <span className={styles.userName}>{user.nombreCompleto}</span>
        <span className={styles.userMeta}>@{user.username}</span>
        <LogoutButton className={styles.logout} />
      </div>
    </aside>
  );
}
