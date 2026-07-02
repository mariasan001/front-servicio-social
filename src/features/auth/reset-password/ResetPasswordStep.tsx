"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { PASSWORD_MIN_LENGTH } from "../constants/register";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import {
  confirmPasswordReset,
  requestPasswordReset,
} from "../services/password-reset.service";
import {
  validateResetPasswordForm,
  type ResetPasswordFormValues,
} from "../validation/password-reset.validation";
import { hasFormErrors } from "../validation/auth.validation";
import { Alert } from "@/shared/components/Alert";
import {
  FormField,
  PasswordInput,
} from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";
import { VerificationCodeInput } from "../components/VerificationCodeInput/VerificationCodeInput";

type ResetPasswordStepProps = {
  correo: string;
  onBack: () => void;
};

const INITIAL_VALUES: ResetPasswordFormValues = {
  codigo: "",
  password: "",
  confirmPassword: "",
};

export function ResetPasswordStep({ correo, onBack }: ResetPasswordStepProps) {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const updateField = <K extends keyof ResetPasswordFormValues>(
    field: K,
    value: ResetPasswordFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateResetPasswordForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await confirmPasswordReset({
        correo,
        codigo: values.codigo.trim(),
        password: values.password,
      });

      setSuccessMessage(
        result.mensaje ??
          "Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.",
      );
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible restablecer la contraseña. Verifica el código e intenta de nuevo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setFormError(null);

    try {
      await requestPasswordReset({ correo });
      setSuccessMessage("Enviamos un nuevo código a tu correo electrónico.");
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible reenviar el código. Intenta de nuevo.",
        ),
      );
    } finally {
      setIsResending(false);
    }
  };

  if (successMessage) {
    return (
      <AuthCard
        title="Contraseña actualizada"
        subtitle="Tu acceso quedó restablecido correctamente."
      >
        <Alert tone="success">{successMessage}</Alert>

        <button
          type="button"
          className={formStyles.submitButton}
          onClick={() => router.push(AUTH_ROUTES.login)}
        >
          Ir a iniciar sesión
        </button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Verifica tu correo"
      subtitle={AUTH_COPY.resetCodeSubtitle}
    >
      <p className={formStyles.helperText}>
        Código enviado a <strong>{correo}</strong>
      </p>

      <form className={formStyles.formBody} onSubmit={handleSubmit} noValidate>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <FormField
          id="reset-code"
          label="Código de verificación"
          error={fieldErrors.codigo}
          required
        >
          <VerificationCodeInput
            id="reset-code"
            value={values.codigo}
            error={fieldErrors.codigo}
            disabled={isSubmitting}
            onChange={(value) => updateField("codigo", value)}
          />
        </FormField>

        <PasswordInput
          id="reset-password"
          name="password"
          label="Nueva contraseña"
          value={values.password}
          error={fieldErrors.password}
          hint={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres.`}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          onChange={(value) => updateField("password", value)}
        />

        <PasswordInput
          id="reset-confirm-password"
          name="confirmPassword"
          label="Confirmar contraseña"
          value={values.confirmPassword}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          required
          disabled={isSubmitting}
          onChange={(value) => updateField("confirmPassword", value)}
        />

        <button
          type="submit"
          className={formStyles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Restableciendo…" : "Restablecer contraseña"}
        </button>
      </form>

      <div className={formStyles.footerLinks}>
        <button
          type="button"
          className={formStyles.textButton}
          disabled={isResending}
          onClick={() => void handleResend()}
        >
          {isResending ? "Reenviando código…" : "Reenviar código"}
        </button>

        <button type="button" className={formStyles.textButton} onClick={onBack}>
          Usar otro correo
        </button>

        <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </div>
    </AuthCard>
  );
}
