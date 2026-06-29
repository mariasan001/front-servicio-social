"use client";

import { useCallback, useEffect, useState } from "react";
import { LANDING_SECTION_IDS } from "../constants/nav";

const DEFAULT_HASH = "#inicio";

function resolveHash(hash: string) {
  return LANDING_SECTION_IDS.includes(
    hash as (typeof LANDING_SECTION_IDS)[number],
  )
    ? hash
    : DEFAULT_HASH;
}

export function useLandingNav() {
  const [activeHash, setActiveHash] = useState(DEFAULT_HASH);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setActiveHash(resolveHash(window.location.hash || DEFAULT_HASH));

    const onHashChange = () => {
      setActiveHash(resolveHash(window.location.hash || DEFAULT_HASH));
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const sections = LANDING_SECTION_IDS.map((id) =>
      document.querySelector(id),
    ).filter((element): element is HTMLElement => element instanceof HTMLElement);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topEntry = visibleEntries[0];

        if (topEntry?.target.id) {
          setActiveHash(`#${topEntry.target.id}`);
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 8);
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", isMenuOpen);
  }, [isMenuOpen]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;

      setIsMenuOpen(false);
      document.documentElement.classList.remove("menu-open");
    };

    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((open) => !open);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setActiveHash(href);
    setIsMenuOpen(false);
  }, []);

  return {
    activeHash,
    isMenuOpen,
    isScrolled,
    closeMenu,
    toggleMenu,
    handleNavClick,
  };
}
