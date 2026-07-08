import { Quote } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import type { LandingTestimonial } from "../../types/public-testimonial.types";
import { LandingPublicLoadAlert } from "../LandingPublicLoadAlert/LandingPublicLoadAlert";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingTestimonials.module.css";

type LandingTestimonialsProps = {
  testimonials: LandingTestimonial[];
  loadError?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LandingTestimonials({
  testimonials,
  loadError,
}: LandingTestimonialsProps) {
  const hasTestimonials = testimonials.length > 0;

  return (
    <section
      id="testimoniales"
      className={`${sectionStyles.section} ${sectionStyles.surfaceWhite}`}
    >
      <div
        className={`${sectionStyles.container} ${sectionStyles.containerFlushMobile}`}
      >
        <div className={styles.introBlock}>
          <LandingSectionHeader
            align="center"
            className={`${sectionStyles.headerPad} ${styles.testimonialsHeader}`}
            copyClassName={styles.testimonialsCopy}
            title={
              <>
                Lo que dicen nuestros{" "}
                <span className={headerStyles.titleAccent}>estudiantes</span>
              </>
            }
            intro="Conoce la experiencia de estudiantes mexiquenses que ya realizaron su servicio social, prácticas o residencia en dependencias del Gobierno del Estado de México."
          />

          {hasTestimonials ? (
            <p
              id="testimonials-scroll-hint"
              className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintVisible} ${styles.scrollHint}`}
            >
              Desliza horizontalmente para ver más testimonios
            </p>
          ) : null}
        </div>

        {loadError ? (
          <LandingPublicLoadAlert message={loadError} />
        ) : !hasTestimonials ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>
              <Quote size={28} strokeWidth={1.75} />
            </span>
            <p>No hay testimonios disponibles en este momento.</p>
          </div>
        ) : (
          <ul
            className={`${styles.grid} ${scrollStyles.scrollRegion}`}
            aria-label="Testimoniales de estudiantes"
            aria-describedby="testimonials-scroll-hint"
            tabIndex={0}
          >
            {testimonials.map((testimonial, index) => {
              const accent = getLandingAccent(index);

              return (
                <li
                  key={testimonial.id}
                  className={styles.card}
                  data-accent={accent}
                >
                  <Quote
                    className={styles.quoteIcon}
                    size={22}
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />

                  <blockquote className={styles.quote}>
                    <p>{testimonial.quote}</p>
                  </blockquote>

                  <footer className={styles.author}>
                    <span className={styles.avatar} aria-hidden="true">
                      {getInitials(testimonial.name)}
                    </span>

                    <span className={styles.authorInfo}>
                      <cite className={styles.authorName}>{testimonial.name}</cite>
                      {testimonial.program ? (
                        <span className={styles.authorProgram}>
                          {testimonial.program}
                        </span>
                      ) : null}
                      {testimonial.institution ? (
                        <span className={styles.authorInstitution}>
                          {testimonial.institution}
                        </span>
                      ) : null}
                    </span>
                  </footer>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
