"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "@/shared/icons";
import { FormField } from "./FormField";
import formStyles from "./AuthForm.module.css";

type PasswordInputProps = {
  id?: string;
  label: string;
  name: string;
  value: string;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function PasswordInput({
  id,
  label,
  name,
  value,
  error,
  hint,
  required,
  autoComplete = "current-password",
  disabled = false,
  onChange,
}: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <div className={formStyles.passwordWrap}>
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          className={[formStyles.input, formStyles.passwordInput].join(" ")}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />

        <button
          type="button"
          className={formStyles.toggleButton}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormField>
  );
}
