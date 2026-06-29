import { ChevronDown } from "@/shared/icons";
import { FAQ_ITEMS } from "../../constants/faq";
import { JsonLd } from "@/shared/components/JsonLd";
import { LandingSectionHeader } from "../LandingSectionHeader/LandingSectionHeader";
import sectionStyles from "../../styles/LandingSection.module.css";
import headerStyles from "../LandingSectionHeader/LandingSectionHeader.module.css";
import styles from "./LandingFaq.module.css";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function LandingFaq() {
  return (
    <section
      id="preguntas-frecuentes"
      className={`${sectionStyles.section} ${sectionStyles.surfaceWhite}`}
    >
      <JsonLd data={faqJsonLd} />

      <div className={sectionStyles.container}>
        <LandingSectionHeader
          align="center"
          eyebrow="Preguntas frecuentes"
          title={
            <>
              Preguntas y{" "}
              <span className={headerStyles.titleAccent}>respuestas</span>
            </>
          }
          intro="Resolvemos las dudas más comunes sobre el registro, la participación y el seguimiento de tu servicio social, prácticas o residencia profesional."
        />

        <div className={styles.list}>
          {FAQ_ITEMS.map((item, index) => (
            <details
              key={item.id}
              className={styles.item}
              data-accent={
                index % 3 === 0
                  ? "dorado"
                  : index % 3 === 1
                    ? "vino-dark"
                    : "blanco"
              }
            >
              <summary className={styles.question}>
                <span className={styles.questionText}>{item.question}</span>
                <span className={styles.iconWrap} aria-hidden="true">
                  <ChevronDown
                    className={styles.chevron}
                    size={18}
                    strokeWidth={2}
                  />
                </span>
              </summary>
              <div className={styles.answer}>
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
