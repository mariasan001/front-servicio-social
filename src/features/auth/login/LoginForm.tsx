"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isSafeInternalPath, resolveHomePath } from "@/lib/auth/roles";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import { login } from "../services/auth.service";
import {
  hasFormErrors,
  validateLoginForm,
  type LoginFormValues,
} from "../validation/auth.validation";
import { Alert } from "@/shared/components/Alert";
import {
  PasswordInput,
  TextInput,
} from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

const INITIAL_VALUES: LoginFormValues = {
  username: "",
  password: "",
};

type LoginFormProps = {
  nextPath?: string;
};

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const user = await login({
        username: values.username.trim(),
        password: values.password,
      });

      const destination = isSafeInternalPath(nextPath)
        ? nextPath!
        : resolveHomePath(user.roles);

      router.push(destination);
      router.refresh();
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible iniciar sesión. Verifica tus credenciales.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title={AUTH_COPY.loginTitle}
      subtitle={AUTH_COPY.loginSubtitle}
    >
      <form className={formStyles.formBody} onSubmit={handleSubmit} noValidate>
        {formError ? <Alert tone="error">{formError}</Alert> : null}

        <TextInput
          id="login-username"
          name="username"
          label="Usuario"
          value={values.username}
          error={fieldErrors.username}
          autoComplete="username"
          required
          placeholder="Tu usuario institucional"
          onChange={(event) => updateField("username", event.target.value)}
        />

        <PasswordInput
          id="login-password"
          name="password"
          label="Contraseña"
          value={values.password}
          error={fieldErrors.password}
          autoComplete="current-password"
          required
          onChange={(value) => updateField("password", value)}
        />

        <div className={formStyles.inlineAction}>
          <Link
            href={AUTH_ROUTES.resetPassword}
            className={formStyles.footerLink}
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          className={formStyles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
        </button>
      </form>

      <div className={formStyles.footerLinks}>
        <span>
          ¿Aún no tienes cuenta?{" "}
          <Link href={AUTH_ROUTES.register} className={formStyles.footerLink}>
            Regístrate aquí
          </Link>
        </span>
      </div>
    </AuthCard>
  );
}
