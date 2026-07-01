import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import formStyles from "./AuthForm.module.css";

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
    <div className={formStyles.field}>
      <label htmlFor={id} className={formStyles.label}>
        {label}
        {required ? (
          <>
            {" "}
            <span className={formStyles.required} aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </label>

      <div aria-describedby={describedBy}>{children}</div>

      {hint ? (
        <p id={hintId} className={formStyles.hint}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={formStyles.error} role="alert">
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
        className={[formStyles.input, className].filter(Boolean).join(" ")}
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
        className={formStyles.select}
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
    <div className={formStyles.field}>
      <div className={formStyles.checkboxRow}>
        <input
          id={id}
          type="checkbox"
          className={formStyles.checkbox}
          checked={checked}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          onChange={(event) => onChange(event.target.checked)}
        />
        <label htmlFor={id} className={formStyles.checkboxLabel}>
          {label}
        </label>
      </div>

      {error ? (
        <p id={errorId} className={formStyles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
