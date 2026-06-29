import { Quote } from "@/shared/icons";
import { getLandingAccent } from "../../constants/accents";
import { TESTIMONIALS } from "../../constants/testimonials";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import scrollStyles from "../../styles/LandingScrollRegion.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingTestimonials.module.css";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LandingTestimonials() {
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
            eyebrow="Experiencias reales"
            title={
              <>
                Lo que dicen nuestros{" "}
                <span className={headerStyles.titleAccent}>estudiantes</span>
              </>
            }
            intro="Conoce la experiencia de estudiantes mexiquenses que ya realizaron su servicio social, prácticas o residencia en dependencias del Gobierno del Estado de México."
          />

          <p
            id="testimonials-scroll-hint"
            className={`${scrollStyles.scrollHint} ${scrollStyles.scrollHintVisible} ${styles.scrollHint}`}
          >
            Desliza horizontalmente para ver más testimonios
          </p>
        </div>

        <ul
          className={`${styles.grid} ${scrollStyles.scrollRegion}`}
          aria-label="Testimoniales de estudiantes"
          aria-describedby="testimonials-scroll-hint"
          tabIndex={0}
        >
          {TESTIMONIALS.map((testimonial, index) => {
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
                    <span className={styles.authorProgram}>
                      {testimonial.program}
                    </span>
                    <span className={styles.authorInstitution}>
                      {testimonial.institution}
                    </span>
                  </span>
                </footer>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
