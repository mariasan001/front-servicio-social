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

function getInitialHash() {
  if (typeof window === "undefined") {
    return DEFAULT_HASH;
  }

  return resolveHash(window.location.hash || DEFAULT_HASH);
}

function getInitialScrolled() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.scrollY > 8;
}

export function useLandingNav() {
  const [activeHash, setActiveHash] = useState(getInitialHash);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(getInitialScrolled);

  useEffect(() => {
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
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

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
