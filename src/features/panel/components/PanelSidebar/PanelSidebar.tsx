"use client";

import Image from "next/image";
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

function getUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

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
        <Link
          href={navigation.basePath}
          className={styles.brandLink}
          aria-label="Ir al inicio del panel"
          onClick={onNavigate}
        >
          <span className={styles.brandLogoWrap}>
            <Image
              className={styles.brandLogo}
              src="/images/Flor_3.png"
              alt=""
              width={120}
              height={120}
              sizes="44px"
            />
          </span>
          <span className={styles.brandCopy}>
            <span className={styles.brandEyebrow}>Servicio Social</span>
            <span className={styles.brandTitle}>Edomex</span>
          </span>
        </Link>
        <p className={styles.roleCaption}>
          <span className={styles.roleDot} aria-hidden="true" />
          {navigation.label}
        </p>
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
              <span className={styles.navIconWrap} aria-hidden="true">
                <Icon className={styles.navIcon} size={17} strokeWidth={2} />
              </span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.userBlock}>
        <div className={styles.userRow}>
          <span className={styles.userAvatar} aria-hidden="true">
            {getUserInitials(user.nombreCompleto)}
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.nombreCompleto}</span>
            <span className={styles.userMeta}>{user.username.replace(/^@+/, "")}</span>
          </div>
        </div>
        <LogoutButton className={styles.logoutButton} />
      </div>
    </aside>
  );
}
