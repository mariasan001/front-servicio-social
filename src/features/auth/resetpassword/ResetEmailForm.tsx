import Link from "next/link";
import { Mail } from "lucide-react";

import authFormStyles from "@/features/auth/styles/AuthForm.module.css";
import styles from "./ResetEmailForm.module.css";

export default function ResetEmailForm() {
  return (
    <section className={authFormStyles.formSide} aria-labelledby="reset-email-title">
      <div className={`${authFormStyles.formCard} ${styles.formCard}`}>
        <div className={authFormStyles.formHeader}>
          <span className={styles.eyebrow}>Recuperación de cuenta</span>

          <h2 id="reset-email-title" className={authFormStyles.title}>
            Restablecer contraseña
          </h2>
          <p className={authFormStyles.subtitle}>
            Ingresa tu correo electrónico institucional para enviarte un código de verificación.
          </p>
        </div>

        <form className={authFormStyles.form} noValidate>
          <div className={authFormStyles.fieldGroup}>
            <label htmlFor="email" className={authFormStyles.label}>
              Correo electrónico
            </label>

            <div className={authFormStyles.inputWrap}>
              <span className={authFormStyles.inputIcon} aria-hidden="true">
                <Mail className={authFormStyles.inputIconSvg} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="correo@institucion.edu.mx"
                className={authFormStyles.input}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>
          </div>

          <p className={styles.helperText}>
            Si el correo está registrado, recibirás un código de 6 dígitos para continuar.
          </p>

          <button type="submit" className={authFormStyles.submitButton}>
            Enviar código
          </button>
        </form>

        <div className={styles.footerActions}>
          <Link href="/login" className={styles.backLink}>
            Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </section>
  );
}
