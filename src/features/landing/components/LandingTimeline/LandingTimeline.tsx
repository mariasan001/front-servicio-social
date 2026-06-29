"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Briefcase, ClipboardList, FileCheck, UserPlus } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import { ScrollReveal } from "../ScrollReveal/ScrollReveal";
import sectionStyles from "../../styles/LandingSection.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingTimeline.module.css";

const STEPS = [
  {
    icon: Briefcase,
    title: "Encuentra vacante",
    description:
      "Explora las oportunidades activas y elige la vacante que mejor se adapte a tu perfil y área de interés.",
  },
  {
    icon: UserPlus,
    title: "Regístrate",
    description:
      "Crea tu cuenta en la plataforma y completa tu registro para iniciar tu participación.",
  },
  {
    icon: ClipboardList,
    title: "Registra tu progreso",
    description:
      "Actualiza y consulta el avance de tu servicio social o residencia profesional en cada etapa.",
  },
  {
    icon: FileCheck,
    title: "Obtén tus constancias",
    description:
      "Al concluir tu proceso, descarga tus constancias y documentos de manera segura.",
  },
] as const;

function joinClassNames(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function LandingTimeline() {
  const timelineRef = useRef<HTMLOListElement>(null);
  const [lineProgress, setLineProgress] = useState(0);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setLineProgress(1);
      return;
    }

    const stepNodes = Array.from(
      timeline.querySelectorAll<HTMLElement>("[data-timeline-step]"),
    );

    if (stepNodes.length === 0) return;

    const visibility = new Map<number, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(
            entry.target.getAttribute("data-timeline-step"),
          );

          if (Number.isNaN(index)) return;

          visibility.set(index, entry.isIntersecting);
        });

        let highestVisible = -1;

        visibility.forEach((isVisible, index) => {
          if (isVisible) {
            highestVisible = Math.max(highestVisible, index);
          }
        });

        setLineProgress(
          highestVisible >= 0 ? (highestVisible + 1) / STEPS.length : 0,
        );
      },
      {
        threshold: 0.35,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    stepNodes.forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
    };
  }, []);

  const timelineStyle = {
    "--timeline-progress": String(lineProgress),
  } as CSSProperties;

  return (
    <section
      id="proceso"
      className={`${sectionStyles.section} ${sectionStyles.surfaceDark}`}
    >
      <div className={sectionStyles.container}>
        <ScrollReveal delay={0}>
          <LandingSectionHeader
            align="center"
            tone="dark"
            eyebrow="Proceso de participación"
            title={
              <>
                ¿Cómo <span className={headerStyles.titleAccent}>funciona</span>?
              </>
            }
            intro="Sigue estos pasos para participar en el servicio social o residencia profesional. La plataforma te acompaña desde la búsqueda de vacante hasta la obtención de tus constancias."
          />
        </ScrollReveal>

        <ol
          ref={timelineRef}
          className={styles.timeline}
          style={timelineStyle}
          aria-label="Pasos del proceso"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const contentOnRight = index % 2 === 0;
            const accent = getLandingAccent(index);

            return (
              <ScrollReveal
                key={step.title}
                as="li"
                data-timeline-step={index}
                delay={index * 100}
                className={joinClassNames(
                  styles.row,
                  styles.stepReveal,
                  contentOnRight ? styles.rowContentRight : styles.rowContentLeft,
                )}
              >
                <div className={styles.colAxis}>
                  <span
                    className={styles.dot}
                    data-accent={accent}
                    aria-hidden="true"
                  />
                </div>

                <div className={styles.stepBody}>
                  <div className={styles.iconCell}>
                    <div
                      className={styles.iconBox}
                      data-accent={accent}
                      aria-hidden="true"
                    >
                      <Icon className={styles.stepIcon} size={22} strokeWidth={2} />
                    </div>
                  </div>

                  <div className={styles.contentCell} data-accent={accent}>
                    <span className={styles.stepNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
