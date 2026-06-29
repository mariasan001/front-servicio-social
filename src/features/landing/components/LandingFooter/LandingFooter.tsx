import Image from "next/image";
import Link from "next/link";
import { ArrowUp, Code2 } from "@/shared/icons";
import { LANDING_FOOTER_LINKS } from "../../constants/nav";
import styles from "./LandingFooter.module.css";

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.accentBar} aria-hidden />

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <span className={styles.eyebrow}>Plataforma oficial</span>

            <Link href="#inicio" className={styles.logo} aria-label="Ir al inicio">
              <Image
                className={styles.logoImage}
                src="/images/logo.webp"
                alt=""
                width={180}
                height={48}
                sizes="180px"
              />
            </Link>

            <p className={styles.tagline}>
              Plataforma del Gobierno del Estado de México para consultar
              vacantes, dar seguimiento y concluir tu servicio social, prácticas
              o residencia profesional.
            </p>
          </div>

          <nav className={styles.nav} aria-label="Enlaces del pie de página">
            <h2 className={styles.navTitle}>Navegación</h2>
            <ul className={styles.navList}>
              {LANDING_FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={styles.navLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.devCard}>
            <span className={styles.devIconWrap} aria-hidden>
              <Code2 size={20} strokeWidth={2} />
            </span>
            <p className={styles.devLabel}>Desarrollo tecnológico</p>
            <p className={styles.devText}>
              Desarrollado por{" "}
              <strong>Subdirección de Desarrollo Tecnológico</strong>
            </p>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {year} Plataforma de Servicio Social. Todos los derechos reservados.
          </p>

          <Link href="#main" className={styles.backToTop}>
            Volver al inicio
            <ArrowUp size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
