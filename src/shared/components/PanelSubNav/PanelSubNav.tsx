"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./PanelSubNav.module.css";

export type PanelSubNavTab<T extends string = string> = {
  id: T;
  label: string;
  href?: string;
  icon?: LucideIcon;
};

export type PanelSubNavProps<T extends string = string> = {
  ariaLabel: string;
  tabs: readonly PanelSubNavTab<T>[];
  activeId: T;
  onTabChange?: (id: T) => void;
  endContent?: ReactNode;
  className?: string;
};

function joinClasses(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PanelSubNav<T extends string>({
  ariaLabel,
  tabs,
  activeId,
  onTabChange,
  endContent,
  className,
}: PanelSubNavProps<T>) {
  const nav = (
    <nav className={joinClasses(styles.subNav, className)} aria-label={ariaLabel}>
      <div className={styles.subNavTrack} role="tablist" aria-orientation="horizontal">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeId;
          const tabClassName = joinClasses(
            styles.subNavLink,
            isActive && styles.subNavLinkActive,
          );
          const iconClassName = joinClasses(
            styles.subNavIcon,
            isActive && styles.subNavIconActive,
          );
          const content = (
            <>
              {Icon ? (
                <span className={iconClassName} aria-hidden="true">
                  <Icon size={13} strokeWidth={isActive ? 2.1 : 1.85} />
                </span>
              ) : null}
              <span className={styles.subNavLabel}>{tab.label}</span>
            </>
          );

          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={tabClassName}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? "page" : undefined}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              className={tabClassName}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange?.(tab.id)}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );

  if (!endContent) {
    return nav;
  }

  return (
    <div className={styles.toolbar}>
      {nav}
      <div className={styles.toolbarActions}>{endContent}</div>
    </div>
  );
}
