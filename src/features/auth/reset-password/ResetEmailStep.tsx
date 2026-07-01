"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import { requestPasswordReset } from "../services/password-reset.service";
import {
  validateResetEmailForm,
  type ResetEmailFormValues,
} from "../validation/password-reset.validation";
import { hasFormErrors } from "../validation/auth.validation";
import { Alert } from "@/shared/components/Alert";
import { TextInput } from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

type ResetEmailStepProps = {
  onSuccess: (correo: string) => void;
};

const INITIAL_VALUES: ResetEmailFormValues = {
  correo: "",
};

export function ResetEmailStep({ onSuccess }: ResetEmailStepProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetEmailFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateResetEmailForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await requestPasswordReset({ correo: values.correo.trim() });
      onSuccess(values.correo.trim());
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible enviar el código de verificación. Intenta de nuevo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Recuperación"
      title={AUTH_COPY.resetTitle}
      subtitle={AUTH_COPY.resetEmailSubtitle}
    >
      <form className={formStyles.formBody} onSubmit={handleSubmit} noValidate>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <TextInput
          id="reset-email"
          name="correo"
          type="email"
          label="Correo electrónico"
          value={values.correo}
          error={fieldErrors.correo}
          autoComplete="email"
          inputMode="email"
          required
          placeholder="correo@institucion.edu.mx"
          onChange={(event) => {
            setValues({ correo: event.target.value });
            setFieldErrors({});
            setFormError(null);
          }}
        />

        <p className={formStyles.helperText}>
          Si el correo está registrado, recibirás un código de 6 dígitos para
          continuar.
        </p>

        <button
          type="submit"
          className={formStyles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando código…" : "Enviar código"}
        </button>
      </form>

      <div className={formStyles.footerLinks}>
        <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}
