"use client";

import Image from "next/image";
import Link from "next/link";
import { UserCircle2Icon, LockKeyhole } from "@/shared/icons";

import authFormStyles from "@/features/auth/styles/AuthForm.module.css";
import { useLoginFormUi } from "./hooks/useLoginFormUi";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const {
    username,
    password,
    showPassword,
    usernameError,
    passwordError,
    isSubmitDisabled,
    handleUsernameChange,
    handlePasswordChange,
    handleUsernameBlur,
    handlePasswordBlur,
    handleShowPasswordChange,
    handleSubmit,
  } = useLoginFormUi();

  return (
    <section className={authFormStyles.formSide}>
      <div className={`${authFormStyles.formCard} ${styles.loginCard}`}>
        <Image
          className={styles.logoImage}
          src="/img/logos/logo.webp"
          alt="Gobierno del Estado de México"
          width={180}
          height={48}
          sizes="180px"
          priority
        />

        <div className={styles.loginContent}>
          <div className={styles.loginHeader}>
            <h2 className={`${authFormStyles.title} ${styles.title}`}>
              Iniciar sesión
            </h2>

            <p className={`${authFormStyles.subtitle} ${styles.subtitle}`}>
              Usa tu usuario y contraseña institucionales para continuar
            </p>
          </div>

          <form
            className={`${authFormStyles.form} ${styles.loginForm}`}
            onSubmit={handleSubmit}
            noValidate
          >
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
                  value={username}
                  onChange={handleUsernameChange}
                  onBlur={handleUsernameBlur}
                  required
                  maxLength={40}
                  pattern="[A-Za-z0-9._-]+"
                  title="Usa solo letras, números, punto, guion o guion bajo."
                  aria-invalid={usernameError ? "true" : "false"}
                  aria-describedby={usernameError ? "username-error" : undefined}
                />
              </div>

              {usernameError ? (
                <p id="username-error" className={styles.fieldError}>
                  {usernameError}
                </p>
              ) : null}
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className={authFormStyles.input}
                  autoComplete="current-password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  required
                  minLength={8}
                  aria-invalid={passwordError ? "true" : "false"}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
              </div>

              {passwordError ? (
                <p id="password-error" className={styles.fieldError}>
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className={styles.actionsRow}>
              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={showPassword}
                  onChange={handleShowPasswordChange}
                />
                <span className={styles.checkText}>Mostrar contraseña</span>
              </label>

              <Link href="/resetPassword" className={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className={authFormStyles.submitButton}
              disabled={isSubmitDisabled}
            >
              Iniciar sesión
            </button>
          </form>
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