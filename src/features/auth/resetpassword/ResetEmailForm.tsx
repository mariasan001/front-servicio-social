import Link from "next/link";
import { Mail } from "lucide-react";
import styles from "./ResetEmailForm.module.css";

export default function ResetEmailForm() {
  return (
    <section className={styles.formSide} aria-labelledby="reset-email-title">
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <span className={styles.badge}>Recuperacion de cuenta</span>
          <h2 id="reset-email-title" className={styles.title}>
            Restablecer contrasena
          </h2>
          <p className={styles.subtitle}>
            Ingresa tu correo electronico institucional para enviarte un codigo de verificacion.
          </p>
        </div>

        <form className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo electronico
            </label>

            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <Mail className={styles.inputIconSvg} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="correo@institucion.edu.mx"
                className={styles.input}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>
          </div>

          <p className={styles.helperText}>
            Si el correo esta registrado, recibiras un codigo de 6 digitos para continuar.
          </p>

          <button type="submit" className={styles.submitButton}>
            Enviar codigo
          </button>
        </form>

        <div className={styles.footerActions}>
          <Link href="/login" className={styles.backLink}>
            Volver a iniciar sesion
          </Link>
        </div>
      </div>
    </section>
  );
}