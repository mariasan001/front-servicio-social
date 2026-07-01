"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/shared/components/Button";
import { LogIn, Menu, Minus, UserPlus } from "@/shared/icons";
import { LANDING_NAV_LINKS } from "../../constants/nav";
import { useLandingNav } from "../../hooks/useLandingNav";
import styles from "./LandingHeader.module.css";

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function BrandLogo({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      className={styles.logoImage}
      src="/images/logo.webp"
      alt=""
      width={180}
      height={48}
      sizes="180px"
      priority={priority}
    />
  );
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled"));
}

export function LandingHeader() {
  const {
    activeHash,
    isMenuOpen,
    isScrolled,
    closeMenu,
    toggleMenu,
    handleNavClick,
  } = useLandingNav();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpenRef = useRef(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const menu = menuRef.current;
    if (!menu) return;

    const focusable = getFocusableElements(menu);
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusable.length === 0) return;

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

    menu.addEventListener("keydown", onKeyDown);

    return () => {
      menu.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      wasMenuOpenRef.current = true;
      return;
    }

    if (!wasMenuOpenRef.current) return;

    menuToggleRef.current?.focus();
  }, [isMenuOpen]);

  return (
    <>
      <header
        className={joinClassNames(
          styles.header,
          isScrolled && styles.headerScrolled,
          isMenuOpen && styles.headerHidden,
        )}
      >
        <div className={styles.container}>
          <Link href="/" className={styles.logo} aria-label="Ir al inicio">
            <BrandLogo priority />
          </Link>

          <nav className={styles.navDesktop} aria-label="Navegación principal">
            <ul className={styles.navList}>
              {LANDING_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={joinClassNames(
                      styles.navLink,
                      activeHash === link.href && styles.navLinkActive,
                    )}
                    aria-current={activeHash === link.href ? "page" : undefined}
                    onClick={() => handleNavClick(link.href)}
                  >
                    <span className={styles.navLinkLabel}>{link.label}</span>
                    <span
                      className={styles.navLinkIndicator}
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.actionsDesktop}>
            <Button href="/login" variant="outline">
              <LogIn className={styles.actionIcon} size={18} strokeWidth={2} />
              Acceder
            </Button>
            <Button href="/registro" variant="primary">
              <UserPlus className={styles.actionIcon} size={18} strokeWidth={2} />
              Registrarme
            </Button>
          </div>

          <button
            ref={menuToggleRef}
            type="button"
            className={styles.menuToggle}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={toggleMenu}
          >
            <Menu className={styles.menuIcon} size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      <div
        ref={menuRef}
        id="landing-mobile-menu"
        className={joinClassNames(
          styles.mobileMenu,
          isMenuOpen && styles.mobileMenuOpen,
        )}
        aria-hidden={!isMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className={styles.mobileMenuTop}>
          <Link
            href="/"
            className={styles.logo}
            aria-label="Ir al inicio"
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <BrandLogo />
          </Link>

          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Cerrar menú"
            tabIndex={isMenuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            <Minus className={styles.closeIcon} size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className={styles.mobileMenuNav} aria-label="Navegación móvil">
          <ul className={styles.mobileNavList}>
            {LANDING_NAV_LINKS.map((link, index) => (
              <li
                key={link.href}
                className={styles.mobileNavItem}
                style={{
                  transitionDelay: isMenuOpen ? `${120 + index * 60}ms` : "0ms",
                }}
              >
                <a
                  href={link.href}
                  className={joinClassNames(
                    styles.mobileNavLink,
                    activeHash === link.href && styles.mobileNavLinkActive,
                  )}
                  aria-current={activeHash === link.href ? "page" : undefined}
                  tabIndex={isMenuOpen ? 0 : -1}
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.mobileMenuFooter}>
          <div className={styles.mobileActions}>
            <Button
              href="/login"
              variant="outline"
              className={styles.mobileActionButton}
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={closeMenu}
            >
              <LogIn className={styles.actionIcon} size={18} strokeWidth={2} />
              Acceder
            </Button>
            <Button
              href="/registro"
              variant="primary"
              className={styles.mobileActionButton}
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={closeMenu}
            >
              <UserPlus className={styles.actionIcon} size={18} strokeWidth={2} />
              Registrarme
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
