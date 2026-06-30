import Link from 'next/link'
import Image from 'next/image'
import { UserCircle2Icon, LockKeyhole } from 'lucide-react'
import plantaLogin from '@/../public/img/login/PlantaLogin.svg'

import styles from './LoginForm.module.css'


export default function LoginForm() {
 

  return (
    <section className={styles.formSide}>
      <div className={styles.formCard}>
        <div className={styles.formHeader}>
          <h2 className={styles.title}>Iniciar sesión</h2>
          <p className={styles.subtitle}>
            Ingresa tus credenciales institucionales
          </p>
        </div>

        <form className={styles.form} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor="username" className={styles.label}>
              Usuario
            </label>

            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <UserCircle2Icon className={styles.inputIconSvg} />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Escribe tu usuario institucional"
                className={styles.input}
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>

            <div className={styles.inputWrap}>
              <span className={styles.inputIcon} aria-hidden="true">
                <LockKeyhole className={styles.inputIconSvg} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                className={styles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className={styles.actionsRow}>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
              />
              <span className={styles.checkText}>Mostrar contraseña</span>
            </label>

            <Link href="/resetPassword" className={styles.forgotText}>¿Olvidaste tu contraseña?</Link>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            // disabled={!canSubmit || isSubmitting}
          >
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
            alt='planta del fondo login'
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
  )
}
