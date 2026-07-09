"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { isSafeInternalPath } from "@/lib/auth/roles";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import {
  registerWithoutToken,
  registerWithToken,
} from "../services/register.service";
import {
  hasFormErrors,
  validateRegisterForm,
  type RegisterFormValues,
} from "../validation/auth.validation";
import { notify } from "@/shared/notifications";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";
import { RegisterFormFields } from "./RegisterFormFields";
import { RegisterTokenBanner } from "./RegisterTokenBanner";
import { useRegisterToken } from "./useRegisterToken";

const INITIAL_VALUES: RegisterFormValues = {
  username: "",
  password: "",
  confirmPassword: "",
  nombreCompleto: "",
  correo: "",
  telefono: "",
  curp: "",
  escuelaTextoCapturada: "",
  carrera: "",
  semestreCuatrimestre: "",
  numeroSeguroEstudiantil: "",
  modalidadInteres: "",
  aceptaAvisoPrivacidad: false,
};

type RegisterFormProps = {
  token?: string;
  nextPath?: string;
};

export function RegisterForm({ token, nextPath }: RegisterFormProps) {
  const router = useRouter();
  const { withToken, tokenStatus, tokenSchoolName, tokenErrorMessage } =
    useRegisterToken(token);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (withToken && tokenStatus !== "valid") {
      return;
    }

    const validationErrors = validateRegisterForm(values, { withToken });
    if (hasFormErrors(validationErrors)) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const semestre = values.semestreCuatrimestre.trim();
    const sharedPayload = {
      username: values.username.trim(),
      password: values.password,
      nombreCompleto: values.nombreCompleto.trim(),
      correo: values.correo.trim(),
      telefono: values.telefono.trim() || undefined,
      curp: values.curp.trim().toUpperCase() || undefined,
      carrera: values.carrera.trim() || undefined,
      semestreCuatrimestre: semestre ? Number(semestre) : undefined,
      numeroSeguroEstudiantil: values.numeroSeguroEstudiantil.trim() || undefined,
      modalidadInteres: values.modalidadInteres,
      aceptaAvisoPrivacidad: values.aceptaAvisoPrivacidad,
    };

    try {
      const response = withToken
        ? await registerWithToken({
            ...sharedPayload,
            token: token!.trim(),
          })
        : await registerWithoutToken({
            ...sharedPayload,
            escuelaTextoCapturada: values.escuelaTextoCapturada.trim(),
          });

      notify.success(
        response.mensaje ??
          (withToken
            ? "Tu cuenta fue creada y quedó vinculada a tu institución. Ya puedes iniciar sesión."
            : response.requiereNormalizacionEscuela
              ? "Tu cuenta fue creada. Tu escuela será validada por la delegación antes de que puedas postularte."
              : "Tu cuenta fue creada correctamente. Ya puedes iniciar sesión."),
      );
      setValues(INITIAL_VALUES);

      if (isSafeInternalPath(nextPath)) {
        router.push(`${AUTH_ROUTES.login}?next=${encodeURIComponent(nextPath!)}`);
      }
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          "No fue posible completar el registro. Intenta nuevamente.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formDisabled = isSubmitting || (withToken && tokenStatus !== "valid");
  const schoolLinked = withToken && tokenStatus === "valid";

  return (
    <AuthCard
      title={AUTH_COPY.registerTitle}
      subtitle={
        withToken ? AUTH_COPY.registerWithTokenSubtitle : AUTH_COPY.registerSubtitle
      }
    >
      <RegisterTokenBanner
        withToken={withToken}
        tokenStatus={tokenStatus}
        tokenErrorMessage={tokenErrorMessage}
      />

      <p className={formStyles.ctaInline}>
        ¿Ya tienes cuenta?{" "}
        <Link href={AUTH_ROUTES.login} className={formStyles.footerLink}>
          Inicia sesión
        </Link>
      </p>

      <form
        className={`${formStyles.formBody} ${formStyles.formRoot}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <RegisterFormFields
          values={values}
          fieldErrors={fieldErrors}
          formDisabled={formDisabled}
          schoolLinked={schoolLinked}
          tokenSchoolName={tokenSchoolName}
          onFieldChange={updateField}
        />

        <button
          type="submit"
          className={formStyles.submitButton}
          disabled={formDisabled}
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
