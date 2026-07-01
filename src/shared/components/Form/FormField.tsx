import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import styles from "./Form.module.css";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <>
            {" "}
            <span className={styles.required} aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>

      <div aria-describedby={describedBy}>{children}</div>

      {hint ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function TextInput({
  id,
  label,
  error,
  hint,
  required,
  className,
  ...props
}: TextInputProps) {
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        className={[styles.input, className].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FormField>
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  children: ReactNode;
};

export function SelectInput({
  id,
  label,
  error,
  hint,
  required,
  placeholder,
  children,
  value,
  ...props
}: SelectInputProps) {
  return (
    <FormField id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        className={styles.select}
        aria-invalid={Boolean(error)}
        required={required}
        value={value}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
    </FormField>
  );
}

type CheckboxFieldProps = {
  id: string;
  label: ReactNode;
  error?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function CheckboxField({
  id,
  label,
  error,
  checked,
  onChange,
}: CheckboxFieldProps) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={styles.field}>
      <div className={styles.checkboxRow}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor={id} className={styles.checkboxLabel}>
          {label}
        </label>
      </div>

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
