// src/features/auth/components/VerificationCodeInput.tsx

import styles from "./VerificationCodeInput.module.css";

type Props = {
  length?: number;
  label?: string;
};

export function VerificationCodeInput({
  length = 6,
  label = "Código de verificación",
}: Props) {
  return (
    <div className={styles.codeGroup} aria-label={label}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          className={styles.codeInput}
          aria-label={`Dígito ${index + 1}`}
          inputMode="numeric"
          maxLength={1}
          pattern="[0-9]*"
        />
      ))}
    </div>
  );
}
