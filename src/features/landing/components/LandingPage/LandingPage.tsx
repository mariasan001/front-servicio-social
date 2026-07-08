import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/shared/components/JsonLd";
import { LandingHeader } from "../LandingHeader/LandingHeader";
import { LandingHero } from "../LandingHero/LandingHero";
import { LandingAbout } from "../LandingAbout/LandingAbout";
import { LandingTimeline } from "../LandingTimeline/LandingTimeline";
import { LandingVacancies } from "../LandingVacancies/LandingVacancies";
import { LandingTestimonials } from "../LandingTestimonials/LandingTestimonials";
import { LandingInstitutions } from "../LandingInstitutions/LandingInstitutions";
import { LandingFaq } from "../LandingFaq/LandingFaq";
import { LandingFooter } from "../LandingFooter/LandingFooter";
import { ScrollReveal } from "../ScrollReveal/ScrollReveal";
import { getLandingInstitutionStats } from "../../lib/public-escuelas";
import { getLandingTestimonials } from "../../lib/public-testimonios";
import { getLandingVacancyPreview } from "../../lib/public-vacantes";
import styles from "./LandingPage.module.css";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  inLanguage: "es-MX",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "Gobierno del Estado de México",
  url: SITE_URL,
};

export async function LandingPage() {
  const [vacantesResult, escuelasResult, testimonialsResult] = await Promise.all([
    getLandingVacancyPreview(),
    getLandingInstitutionStats(),
    getLandingTestimonials(),
  ]);

  return (
    <div className={styles.page}>
      <JsonLd data={[websiteJsonLd, organizationJsonLd]} />
      <span id="acceder" className="sr-only" tabIndex={-1}>
        Acceso a la plataforma
      </span>

      <LandingHeader />
      <main id="main" className={styles.main}>
        <ScrollReveal immediate>
          <LandingHero />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <LandingAbout />
        </ScrollReveal>

        <LandingTimeline />

        <ScrollReveal delay={80}>
          <LandingVacancies
            vacantes={vacantesResult.data}
            loadError={vacantesResult.loadError}
          />
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <LandingTestimonials
            testimonials={testimonialsResult.data}
            loadError={testimonialsResult.loadError}
          />
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <LandingInstitutions
            instituciones={escuelasResult.data}
            loadError={escuelasResult.loadError}
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <LandingFaq />
        </ScrollReveal>
      </main>

      <ScrollReveal delay={100}>
        <LandingFooter />
      </ScrollReveal>
    </div>
  );
}
