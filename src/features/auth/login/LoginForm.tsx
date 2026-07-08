"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isSafeInternalPath, resolveHomePath } from "@/lib/auth/roles";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import { consumePostRegisterCredentials } from "../constants/storage";
import { login } from "../services/auth.service";
import {
  hasFormErrors,
  validateLoginForm,
  type LoginFormValues,
} from "../validation/auth.validation";
import { notify } from "@/shared/notifications";
import { PasswordInput, TextInput } from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

const INITIAL_VALUES: LoginFormValues = {
  username: "",
  password: "",
};

type LoginFormProps = {
  nextPath?: string;
  justRegistered?: boolean;
};

export function LoginForm({ nextPath, justRegistered }: LoginFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const credentials = consumePostRegisterCredentials();
    if (credentials) {
      setValues({
        username: credentials.username,
        password: credentials.password,
      });
    }
  }, []);

  const updateField = <K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(values);
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

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
      notify.error(
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
    <AuthCard title={AUTH_COPY.loginTitle} subtitle={AUTH_COPY.loginSubtitle}>
      {justRegistered ? (
        <p className={formStyles.infoBanner} role="status">
          {AUTH_COPY.loginAfterRegisterBanner}
        </p>
      ) : null}

      <form
        className={`${formStyles.formBody} ${formStyles.formRoot}`}
        onSubmit={handleSubmit}
        noValidate
      >
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
          <Link href={AUTH_ROUTES.resetPassword} className={formStyles.footerLink}>
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

        <p className={formStyles.ctaInline}>
          ¿Aún no tienes cuenta?{" "}
          <Link href={AUTH_ROUTES.register} className={formStyles.footerLink}>
            Regístrate ahora
          </Link>
          , es gratis.
        </p>
      </form>
    </AuthCard>
  );
}
