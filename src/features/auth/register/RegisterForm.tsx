"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  MODALIDAD_INTERES_OPTIONS,
  PASSWORD_MIN_LENGTH,
  REGISTER_SCHOOL_COPY,
} from "../constants/register";
import { AUTH_COPY, AUTH_ROUTES } from "../constants/routes";
import {
  registerWithoutToken,
  registerWithToken,
  validateRegistrationToken,
} from "../services/register.service";
import {
  hasFormErrors,
  validateRegisterForm,
  type RegisterFormValues,
} from "../validation/auth.validation";
import { notify } from "@/shared/notifications";
import {
  CheckboxField,
  PasswordInput,
  SelectInput,
  TextInput,
} from "@/shared/components/Form";
import { AuthCard } from "../components/AuthCard/AuthCard";
import formStyles from "../components/AuthForm/AuthForm.module.css";

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
};

export function RegisterForm({ token }: RegisterFormProps) {
  const withToken = Boolean(token?.trim());
  const [values, setValues] = useState(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    "idle" | "loading" | "valid" | "invalid"
  >(withToken ? "loading" : "idle");
  const [tokenSchoolName, setTokenSchoolName] = useState<string | null>(null);
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!withToken || !token) return;

    const tokenValue = token.trim();
    let cancelled = false;

    async function verifyToken() {
      setTokenStatus("loading");

      try {
        const result = await validateRegistrationToken(tokenValue);
        if (cancelled) return;

        if (result?.valido) {
          setTokenStatus("valid");
          setTokenSchoolName(result.nombreEscuela ?? null);
          setTokenErrorMessage(null);
          return;
        }

        setTokenStatus("invalid");
        setTokenErrorMessage(
          result?.mensaje ?? REGISTER_SCHOOL_COPY.invalidTokenBody,
        );
        return;
      } catch (error) {
        if (cancelled) return;
        setTokenStatus("invalid");
        setTokenErrorMessage(
          getApiErrorMessage(
            error,
            REGISTER_SCHOOL_COPY.invalidTokenBody,
          ),
        );
      }
    }

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token, withToken]);

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
      numeroSeguroEstudiantil:
        values.numeroSeguroEstudiantil.trim() || undefined,
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

  const formDisabled =
    isSubmitting || (withToken && tokenStatus !== "valid");

  const schoolLinked = withToken && tokenStatus === "valid";

  return (
    <AuthCard
      title={AUTH_COPY.registerTitle}
      subtitle={
        withToken
          ? AUTH_COPY.registerWithTokenSubtitle
          : AUTH_COPY.registerSubtitle
      }
    >
      {withToken && tokenStatus === "loading" ? (
        <p className={formStyles.infoBanner}>{REGISTER_SCHOOL_COPY.validatingToken}</p>
      ) : null}

      {withToken && tokenStatus === "invalid" ? (
        <div className={formStyles.warningBanner} role="alert">
          <p className={formStyles.warningBannerTitle}>
            {REGISTER_SCHOOL_COPY.invalidTokenTitle}
          </p>
          <p className={formStyles.warningBannerBody}>
            {tokenErrorMessage ?? REGISTER_SCHOOL_COPY.invalidTokenBody}
          </p>
          <Link href={AUTH_ROUTES.register} className={formStyles.footerLink}>
            {REGISTER_SCHOOL_COPY.invalidTokenAction}
          </Link>
        </div>
      ) : null}

      {!withToken ? (
        <p className={formStyles.introNote}>{REGISTER_SCHOOL_COPY.manualNote}</p>
      ) : null}

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
        <fieldset className={formStyles.fieldset}>
          <legend className={formStyles.legend}>Cuenta de acceso</legend>

          <TextInput
            id="register-username"
            name="username"
            label="Usuario"
            value={values.username}
            error={fieldErrors.username}
            autoComplete="username"
            required
            disabled={formDisabled}
            onChange={(event) => updateField("username", event.target.value)}
          />

          <div className={formStyles.gridTwo}>
            <PasswordInput
              id="register-password"
              name="password"
              label="Contraseña"
              value={values.password}
              error={fieldErrors.password}
              placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
              autoComplete="new-password"
              required
              disabled={formDisabled}
              onChange={(value) => updateField("password", value)}
            />

            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              label="Confirmar contraseña"
              value={values.confirmPassword}
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
              required
              disabled={formDisabled}
              onChange={(value) => updateField("confirmPassword", value)}
            />
          </div>
        </fieldset>

        <fieldset className={formStyles.fieldset}>
          <legend className={formStyles.legend}>Datos personales</legend>

          <div className={formStyles.gridTwo}>
            <TextInput
              id="register-nombre"
              name="nombreCompleto"
              label="Nombre completo"
              value={values.nombreCompleto}
              error={fieldErrors.nombreCompleto}
              autoComplete="name"
              required
              disabled={formDisabled}
              onChange={(event) =>
                updateField("nombreCompleto", event.target.value)
              }
            />

            <TextInput
              id="register-curp"
              name="curp"
              label="CURP"
              value={values.curp}
              error={fieldErrors.curp}
              autoComplete="off"
              disabled={formDisabled}
              onChange={(event) => updateField("curp", event.target.value)}
            />
          </div>

          <div className={formStyles.gridTwo}>
            <TextInput
              id="register-correo"
              name="correo"
              type="email"
              label="Correo electrónico"
              value={values.correo}
              error={fieldErrors.correo}
              autoComplete="email"
              inputMode="email"
              required
              disabled={formDisabled}
              onChange={(event) => updateField("correo", event.target.value)}
            />

            <TextInput
              id="register-telefono"
              name="telefono"
              type="tel"
              label="Teléfono"
              value={values.telefono}
              error={fieldErrors.telefono}
              autoComplete="tel"
              disabled={formDisabled}
              onChange={(event) => updateField("telefono", event.target.value)}
            />
          </div>
        </fieldset>

        <fieldset className={formStyles.fieldset}>
          <legend className={formStyles.legend}>Datos escolares</legend>

          {schoolLinked ? (
            <div className={formStyles.successBanner}>
              <p className={formStyles.successBannerTitle}>
                {REGISTER_SCHOOL_COPY.linkedTitle}
              </p>
              <p className={formStyles.successBannerName}>
                {tokenSchoolName?.trim() || "Institución confirmada"}
              </p>
              <p className={formStyles.successBannerHint}>
                {REGISTER_SCHOOL_COPY.linkedHint}
              </p>
            </div>
          ) : (
            <TextInput
              id="register-escuela"
              name="escuelaTextoCapturada"
              label={REGISTER_SCHOOL_COPY.manualLabel}
              value={values.escuelaTextoCapturada}
              error={fieldErrors.escuelaTextoCapturada}
              required
              disabled={formDisabled}
              placeholder="Ej. Universidad Autónoma del Estado de México"
              onChange={(event) =>
                updateField("escuelaTextoCapturada", event.target.value)
              }
            />
          )}

          {!schoolLinked ? (
            <p className={formStyles.fieldNote}>{REGISTER_SCHOOL_COPY.manualHint}</p>
          ) : null}

          <div className={formStyles.gridTwo}>
            <TextInput
              id="register-carrera"
              name="carrera"
              label="Carrera"
              value={values.carrera}
              error={fieldErrors.carrera}
              disabled={formDisabled}
              onChange={(event) => updateField("carrera", event.target.value)}
            />

            <SelectInput
              id="register-modalidad"
              name="modalidadInteres"
              label="Modalidad de interés"
              value={values.modalidadInteres}
              error={fieldErrors.modalidadInteres}
              placeholder="Selecciona una opción"
              required
              disabled={formDisabled}
              onChange={(event) =>
                updateField("modalidadInteres", event.target.value)
              }
            >
              {MODALIDAD_INTERES_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </div>

          <div className={formStyles.gridTwo}>
            <TextInput
              id="register-semestre"
              name="semestreCuatrimestre"
              label="Semestre o cuatrimestre"
              type="number"
              min={1}
              max={20}
              value={values.semestreCuatrimestre}
              error={fieldErrors.semestreCuatrimestre}
              disabled={formDisabled}
              onChange={(event) =>
                updateField("semestreCuatrimestre", event.target.value)
              }
            />

            <TextInput
              id="register-seguro"
              name="numeroSeguroEstudiantil"
              label="Número de seguro estudiantil"
              value={values.numeroSeguroEstudiantil}
              error={fieldErrors.numeroSeguroEstudiantil}
              disabled={formDisabled}
              onChange={(event) =>
                updateField("numeroSeguroEstudiantil", event.target.value)
              }
            />
          </div>
        </fieldset>

        <CheckboxField
          id="register-aviso"
          label="He leído y acepto el aviso de privacidad del Gobierno del Estado de México."
          checked={values.aceptaAvisoPrivacidad}
          error={fieldErrors.aceptaAvisoPrivacidad}
          onChange={(checked) => updateField("aceptaAvisoPrivacidad", checked)}
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
