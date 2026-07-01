import Image from "next/image";
import { ArrowLeft } from "@/shared/icons";

import styles from "./ResetCodeForm.module.css";
import authFormStyles from "@/features/auth/styles/AuthForm.module.css";

import { VerificationCodeInput } from "@/features/auth/components/VerificationCodeInput";


type Props = {
  email: string;
  onBack: () => void;
};

export function ResetCodeForm({ email, onBack }: Props) {
  return (
    <section className={authFormStyles.formSide} aria-labelledby="reset-code-title">
      <div className={`${authFormStyles.formCard} ${styles.formCard}`}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Volver al correo">
          <ArrowLeft className={styles.backIcon} />
        </button>

        <div className={styles.headerBlock}>
          <h2 id="reset-code-title" className={styles.title}>
            Se ha enviado un código de verificación a su correo electrónico
          </h2>
          {email ? <p className={styles.emailText}>{email}</p> : null}
        </div>

        <form className={styles.form} noValidate>
          <VerificationCodeInput />

          <p className={styles.helperText}>
            Si no recibiste el código, puedes solicitar uno nuevo con el siguiente botón.
          </p>

          <button type="button" className={styles.resendButton}>
            Reenviar Código
          </button>

          <p className={styles.timerText}>
            Tu código expira en: <strong>3m</strong>
          </p>

          <Image
            src="/img/resetPassword/IconPassword2.svg"
            alt="Ilustración de verificación de código"
            width={261}
            height={343}
            className={styles.illustration}
          />
        </form>
      </div>
    </section>
  );
}
