"use client";

import {
  useCallback,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import styles from "./VerificationCodeInput.module.css";

const CODE_LENGTH = 6;

type VerificationCodeInputProps = {
  id: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function VerificationCodeInput({
  id,
  value,
  error,
  disabled = false,
  onChange,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: CODE_LENGTH }, (_, index) => value[index] ?? "");

  const updateValue = useCallback(
    (nextDigits: string[]) => {
      onChange(nextDigits.join("").slice(0, CODE_LENGTH));
    },
    [onChange],
  );

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const handleChange = (index: number, nextChar: string) => {
    const sanitized = nextChar.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = sanitized;
    updateValue(nextDigits);

    if (sanitized && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pasted) {
      return;
    }

    updateValue(pasted.split(""));
    focusInput(Math.min(pasted.length, CODE_LENGTH - 1));
  };

  return (
    <div
      className={styles.codeGroup}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      {digits.map((digit, index) => (
        <input
          key={`${id}-${index}`}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          id={index === 0 ? id : `${id}-${index + 1}`}
          className={styles.input}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-label={`Dígito ${index + 1} de ${CODE_LENGTH}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.currentTarget.select()}
        />
      ))}
    </div>
  );
}
