"use client";

import {
  MODALIDAD_INTERES_OPTIONS,
  PASSWORD_MIN_LENGTH,
  REGISTER_SCHOOL_COPY,
} from "../constants/register";
import type { RegisterFormValues } from "../validation/auth.validation";
import {
  CheckboxField,
  PasswordInput,
  SelectInput,
  TextInput,
} from "@/shared/components/Form";
import formStyles from "../components/AuthForm/AuthForm.module.css";

type RegisterFormFieldsProps = {
  values: RegisterFormValues;
  fieldErrors: Partial<Record<keyof RegisterFormValues, string>>;
  formDisabled: boolean;
  schoolLinked: boolean;
  tokenSchoolName: string | null;
  onFieldChange: <K extends keyof RegisterFormValues>(
    field: K,
    value: RegisterFormValues[K],
  ) => void;
};

export function RegisterFormFields({
  values,
  fieldErrors,
  formDisabled,
  schoolLinked,
  tokenSchoolName,
  onFieldChange,
}: RegisterFormFieldsProps) {
  return (
    <>
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
          onChange={(event) => onFieldChange("username", event.target.value)}
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
            onChange={(value) => onFieldChange("password", value)}
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
            onChange={(value) => onFieldChange("confirmPassword", value)}
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
            onChange={(event) => onFieldChange("nombreCompleto", event.target.value)}
          />

          <TextInput
            id="register-curp"
            name="curp"
            label="CURP"
            value={values.curp}
            error={fieldErrors.curp}
            autoComplete="off"
            disabled={formDisabled}
            onChange={(event) => onFieldChange("curp", event.target.value)}
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
            onChange={(event) => onFieldChange("correo", event.target.value)}
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
            onChange={(event) => onFieldChange("telefono", event.target.value)}
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
            <p className={formStyles.successBannerHint}>{REGISTER_SCHOOL_COPY.linkedHint}</p>
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
              onFieldChange("escuelaTextoCapturada", event.target.value)
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
            onChange={(event) => onFieldChange("carrera", event.target.value)}
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
            onChange={(event) => onFieldChange("modalidadInteres", event.target.value)}
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
              onFieldChange("semestreCuatrimestre", event.target.value)
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
              onFieldChange("numeroSeguroEstudiantil", event.target.value)
            }
          />
        </div>
      </fieldset>

      <CheckboxField
        id="register-aviso"
        label="He leído y acepto el aviso de privacidad del Gobierno del Estado de México."
        checked={values.aceptaAvisoPrivacidad}
        error={fieldErrors.aceptaAvisoPrivacidad}
        onChange={(checked) => onFieldChange("aceptaAvisoPrivacidad", checked)}
      />
    </>
  );
}
