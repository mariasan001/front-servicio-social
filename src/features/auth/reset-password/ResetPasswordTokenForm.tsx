"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { PASSWORD_MIN_LENGTH } from "../constants/register";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import { confirmPasswordReset } from "../services/password-reset.service";
import {
  validateResetPasswordForm,
  type ResetPasswordFormValues,
} from "../validation/password-reset.validation";
import { hasFormErrors } from "../validation/auth.validation";
import { notify } from "@/shared/notifications";
import { PasswordInput } from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

type ResetPasswordTokenFormProps = {
  token?: string;
};

const INITIAL_VALUES: ResetPasswordFormValues = {
  password: "",
  confirmPassword: "",
};

export function ResetPasswordTokenForm({ token }: ResetPasswordTokenFormProps) {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const cleanToken = token?.trim();

  const updateField = <K extends keyof ResetPasswordFormValues>(
    field: K,
    value: ResetPasswordFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!cleanToken) {
      return;
    }

    const validationErrors = validateResetPasswordForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset({
        token: cleanToken,
        newPassword: values.password,
      });
      notify.success(
        "Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.",
      );
      setResetComplete(true);
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          "No fue posible restablecer la contraseña. El enlace pudo expirar; solicita uno nuevo.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cleanToken) {
    return (
      <AuthCard
        title={AUTH_COPY.resetInvalidTokenTitle}
        subtitle={AUTH_COPY.resetInvalidTokenSubtitle}
      >
        <Link
          href={AUTH_ROUTES.resetPassword}
          className={formStyles.submitButtonLink}
        >
          Solicitar un nuevo enlace
        </Link>

        <p className={formStyles.ctaInline}>
          ¿Recordaste tu contraseña?{" "}
          <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
            Volver a iniciar sesión
          </Link>
        </p>
      </AuthCard>
    );
  }

  if (resetComplete) {
    return (
      <AuthCard
        title={AUTH_COPY.resetSuccessTitle}
        subtitle={AUTH_COPY.resetSuccessSubtitle}
      >
        <Link href={AUTH_ROUTES.login} className={formStyles.submitButtonLink}>
          Ir a iniciar sesión
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={AUTH_COPY.resetNewPasswordTitle}
      subtitle={AUTH_COPY.resetNewPasswordSubtitle}
    >
      <form
        className={`${formStyles.formBody} ${formStyles.formRoot}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <PasswordInput
          id="reset-password"
          name="password"
          label="Nueva contraseña"
          value={values.password}
          error={fieldErrors.password}
          placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
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

      <p className={formStyles.ctaInline}>
        ¿Recordaste tu contraseña?{" "}
        <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
          Volver a iniciar sesión
        </Link>
      </p>
    </AuthCard>
  );
}
