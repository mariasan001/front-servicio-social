import Link from "next/link";
import Image from "next/image";
import { UserCircle2Icon, LockKeyhole } from "lucide-react";
import plantaLogin from "@/../public/img/login/PlantaLogin.svg";

import authFormStyles from "@/features/auth/styles/AuthForm.module.css";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  return (
    <section className={authFormStyles.formSide}>
      <div className={authFormStyles.formCard}>
        <div className={authFormStyles.formHeader}>
          <h2 className={authFormStyles.title}>Iniciar sesión</h2>
          <p className={authFormStyles.subtitle}>
            Ingresa tus credenciales institucionales
          </p>
        </div>

        <form className={authFormStyles.form} noValidate>
          <div className={authFormStyles.fieldGroup}>
            <label htmlFor="username" className={authFormStyles.label}>
              Usuario
            </label>

            <div className={authFormStyles.inputWrap}>
              <span className={authFormStyles.inputIcon} aria-hidden="true">
                <UserCircle2Icon className={authFormStyles.inputIconSvg} />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Escribe tu usuario institucional"
                className={authFormStyles.input}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={authFormStyles.fieldGroup}>
            <label htmlFor="password" className={authFormStyles.label}>
              Contraseña
            </label>

            <div className={authFormStyles.inputWrap}>
              <span className={authFormStyles.inputIcon} aria-hidden="true">
                <LockKeyhole className={authFormStyles.inputIconSvg} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className={authFormStyles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <label className={styles.checkRow}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.checkText}>Mostrar contraseña</span>
            </label>

            <Link href="/resetPassword" className={styles.forgotText}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button type="submit" className={authFormStyles.submitButton}>
            Iniciar sesión
          </button>
        </form>

        <div className={styles.signupBlock}>
          <div className={styles.signupLine} aria-hidden="true" />
          <div className={styles.signupLine} aria-hidden="true" />
        </div>

        <div className={styles.footerDecor} aria-hidden="true">
          <Image
            src={plantaLogin}
            alt="planta del fondo login"
            width={64}
            height={96}
            className={styles.footerPlantImage}
          />
        </div>

        <p className={styles.legal}>
          © 2026 Plataforma de Control y Seguimiento de Servicio Social y Residencia
          <br />
          Todos los derechos reservados.
        </p>
      </div>
    </section>
  );
}
