"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import { requestPasswordReset } from "../services/password-reset.service";
import {
  validateResetEmailForm,
  type ResetEmailFormValues,
} from "../validation/password-reset.validation";
import { hasFormErrors } from "../validation/auth.validation";
import { notify } from "@/shared/notifications";
import { TextInput } from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

const INITIAL_VALUES: ResetEmailFormValues = {
  usernameOrEmail: "",
};

export function ResetPasswordFlow() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetEmailFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateResetEmailForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordReset({ usernameOrEmail: values.usernameOrEmail.trim() });
      setRequestSent(true);
    } catch {
      notify.error("No fue posible procesar tu solicitud. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (requestSent) {
    return (
      <AuthCard
        title={AUTH_COPY.resetEmailSentTitle}
        subtitle={AUTH_COPY.resetEmailSentSubtitle}
      >
        <p className={formStyles.helperText}>
          Abre el enlace del correo para crear tu nueva contraseña. Si no lo
          encuentras, revisa tu carpeta de spam o correo no deseado.
        </p>

        <Link href={AUTH_ROUTES.login} className={formStyles.submitButtonLink}>
          Volver a iniciar sesión
        </Link>

        <p className={formStyles.ctaInline}>
          ¿No recibiste el correo?{" "}
          <button
            type="button"
            className={formStyles.textButton}
            onClick={() => setRequestSent(false)}
          >
            Intentar de nuevo
          </button>
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={AUTH_COPY.resetTitle} subtitle={AUTH_COPY.resetEmailSubtitle}>
      <p className={formStyles.ctaInline}>
        ¿Recordaste tu contraseña?{" "}
        <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </p>

      <form
        className={`${formStyles.formBody} ${formStyles.formRoot}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <TextInput
          id="reset-username-or-email"
          name="usernameOrEmail"
          label="Usuario o correo electrónico"
          value={values.usernameOrEmail}
          error={fieldErrors.usernameOrEmail}
          autoComplete="username"
          required
          placeholder="Tu usuario o correo institucional"
          onChange={(event) => {
            setValues({ usernameOrEmail: event.target.value });
            setFieldErrors({});
          }}
        />

        <p className={formStyles.helperText}>
          Si la cuenta existe, recibirás un correo con un enlace para
          restablecer tu contraseña.
        </p>

        <button
          type="submit"
          className={formStyles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando enlace…" : "Enviar enlace"}
        </button>
      </form>
    </AuthCard>
  );
}
