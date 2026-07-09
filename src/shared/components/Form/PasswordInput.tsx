"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/shared/icons";
import { FormField, useFormFieldDescribedBy } from "./FormField";
import styles from "./Form.module.css";

type PasswordInputProps = {
  id?: string;
  label: string;
  name: string;
  value: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

type PasswordInputControlProps = Omit<PasswordInputProps, "label" | "error" | "hint" | "required"> & {
  inputId: string;
  error?: string;
  required?: boolean;
};

function PasswordInputControl({
  inputId,
  name,
  value,
  error,
  placeholder,
  required,
  autoComplete = "current-password",
  disabled = false,
  onChange,
}: PasswordInputControlProps) {
  const describedBy = useFormFieldDescribedBy();
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.passwordWrap}>
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        className={[styles.input, styles.passwordInput].join(" ")}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />

      <button
        type="button"
        className={styles.toggleButton}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        disabled={disabled}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function PasswordInput({
  id,
  label,
  name,
  value,
  error,
  hint,
  placeholder,
  required,
  autoComplete,
  disabled,
  onChange,
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FormField id={inputId} label={label} error={error} hint={hint} required={required}>
      <PasswordInputControl
        inputId={inputId}
        name={name}
        value={value}
        error={error}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={onChange}
      />
    </FormField>
  );
}
