"use client";

import { usePanelRouter } from "@/features/panel/hooks/usePanelRouter";
import { useMemo, useState, type FormEvent } from "react";
import { USER_ROLES, type UserRole } from "@/lib/auth/constants";
import {
  createUsuarioInternoAction,
  updateUsuarioInternoAction,
} from "../../actions/usuarios.actions";
import { mapActionFieldErrors } from "@/lib/actions/form-errors";
import type { EscuelaResponse } from "../../types/escuela.types";
import type { UsuarioInternoResponse } from "../../types/usuario.types";
import { formatRol } from "./usuario-labels";
import { notify } from "@/shared/notifications";
import { Button } from "@/shared/components/Button";
import {
  CheckboxField,
  FormField,
  PasswordInput,
  SelectInput,
  TextInput,
} from "@/shared/components/Form";
import formStyles from "@/shared/components/Form/Form.module.css";
import { Modal } from "@/shared/components/Modal";
import styles from "@/shared/styles/PanelFormModal.module.css";

const INTERNAL_ROLES: UserRole[] = [
  USER_ROLES.ADMINISTRADOR,
  USER_ROLES.DELEGACION,
  USER_ROLES.TITULAR_AREA,
  USER_ROLES.ENLACE_ESCOLAR,
];

type UsuarioFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  usuario?: UsuarioInternoResponse | null;
  escuelas: EscuelaResponse[];
  onClose: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  username: string;
  password: string;
  nombreCompleto: string;
  correo: string;
  telefono: string;
  cargo: string;
  escuelaId: string;
  puedeDescargarCartas: boolean;
  roles: UserRole[];
};

const EMPTY_VALUES: FormValues = {
  username: "",
  password: "",
  nombreCompleto: "",
  correo: "",
  telefono: "",
  cargo: "",
  escuelaId: "",
  puedeDescargarCartas: false,
  roles: [],
};

function normalizeAssignedRoles(roles: string[]): UserRole[] {
  return roles
    .map((rol) => {
      const trimmed = rol.trim();
      const withPrefix = trimmed.startsWith("ROLE_") ? trimmed : `ROLE_${trimmed}`;
      return INTERNAL_ROLES.find((internalRole) => internalRole === withPrefix) ?? null;
    })
    .filter((rol): rol is UserRole => rol !== null);
}

function buildInitialValues(
  mode: UsuarioFormModalProps["mode"],
  usuario?: UsuarioInternoResponse | null,
): FormValues {
  if (mode === "edit" && usuario) {
    return {
      username: usuario.username,
      password: "",
      nombreCompleto: usuario.nombreCompleto,
      correo: usuario.correo,
      telefono: usuario.telefono ?? "",
      cargo: usuario.cargo ?? "",
      escuelaId: usuario.escuelaId ? String(usuario.escuelaId) : "",
      puedeDescargarCartas: usuario.puedeDescargarCartas === true,
      roles: normalizeAssignedRoles(usuario.roles),
    };
  }

  return EMPTY_VALUES;
}

function UsuarioFormModalContent({
  mode,
  usuario,
  escuelas,
  onClose,
  onSuccess,
}: Omit<UsuarioFormModalProps, "open">) {
  const router = usePanelRouter();
  const [values, setValues] = useState(() => buildInitialValues(mode, usuario));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requiresEscuela = values.roles.includes(USER_ROLES.ENLACE_ESCOLAR);

  const escuelaOptions = useMemo(
    () =>
      escuelas
        .slice()
        .sort((a, b) => a.nombreOficial.localeCompare(b.nombreOficial, "es")),
    [escuelas],
  );

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleRole = (role: UserRole, checked: boolean) => {
    setValues((current) => {
      const roles = checked
        ? Array.from(new Set([...current.roles, role]))
        : current.roles.filter((assignedRole) => assignedRole !== role);

      return {
        ...current,
        roles,
        escuelaId: roles.includes(USER_ROLES.ENLACE_ESCOLAR) ? current.escuelaId : "",
      };
    });
    setFieldErrors((current) => ({ ...current, roles: undefined, escuelaId: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const nombreCompleto = values.nombreCompleto.trim();
    const correo = values.correo.trim();

    if (mode === "create" && !values.username.trim()) {
      errors.username = "Escribe el nombre de usuario.";
    }

    if (mode === "create" && !values.password.trim()) {
      errors.password = "Escribe una contraseña temporal.";
    }

    if (!nombreCompleto) {
      errors.nombreCompleto = "Escribe el nombre completo.";
    }

    if (!correo) {
      errors.correo = "Escribe el correo electrónico.";
    }

    if (values.roles.length === 0) {
      errors.roles = "Selecciona al menos un perfil.";
    }

    if (requiresEscuela && !values.escuelaId) {
      errors.escuelaId = "Selecciona la escuela vinculada al enlace escolar.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const sharedPayload = {
      nombreCompleto,
      correo,
      telefono: values.telefono.trim() || undefined,
      cargo: values.cargo.trim() || undefined,
      roles: values.roles,
      escuelaId: requiresEscuela ? Number(values.escuelaId) : undefined,
      puedeDescargarCartas: values.puedeDescargarCartas,
    };

    const result =
      mode === "create"
        ? await createUsuarioInternoAction({
            ...sharedPayload,
            username: values.username.trim(),
            password: values.password,
          })
        : await updateUsuarioInternoAction(usuario!.idUsuario, sharedPayload);

    setIsSubmitting(false);

    if (!result.success) {
      notify.error(result.error);
      setFieldErrors(mapActionFieldErrors(result.fieldErrors));
      return;
    }

    router.refresh();
    onSuccess?.();
    onClose();
  };

  return (
    <Modal
      open
      title={mode === "create" ? "Dar de alta usuario interno" : "Editar usuario interno"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form="usuario-form" variant="success" disabled={isSubmitting}>
            {isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar cuenta"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form id="usuario-form" className={styles.formLayout} onSubmit={handleSubmit}>

        {mode === "create" ? (
          <section className={styles.formSection} aria-label="Acceso">
            <p className={styles.formSectionTitle}>Acceso</p>
            <div className={styles.formGrid}>
              <TextInput
                id="usuario-username"
                label="Nombre de usuario"
                value={values.username}
                required
                error={fieldErrors.username}
                onChange={(event) => updateField("username", event.target.value)}
              />
              <PasswordInput
                id="usuario-password"
                name="password"
                label="Contraseña temporal"
                hint="Compártela de forma segura con la persona usuaria."
                value={values.password}
                required
                error={fieldErrors.password}
                autoComplete="new-password"
                onChange={(value) => updateField("password", value)}
              />
            </div>
          </section>
        ) : null}

        <section className={styles.formSection} aria-label="Datos de la cuenta">
          <p className={styles.formSectionTitle}>Datos de la cuenta</p>
          <div className={styles.formGrid}>
            <div className={styles.formGridFull}>
              <TextInput
                id="usuario-nombre"
                label="Nombre completo"
                value={values.nombreCompleto}
                required
                error={fieldErrors.nombreCompleto}
                onChange={(event) => updateField("nombreCompleto", event.target.value)}
              />
            </div>

            <TextInput
              id="usuario-correo"
              label="Correo electrónico"
              type="email"
              value={values.correo}
              required
              error={fieldErrors.correo}
              onChange={(event) => updateField("correo", event.target.value)}
            />

            <TextInput
              id="usuario-telefono"
              label="Teléfono"
              value={values.telefono}
              error={fieldErrors.telefono}
              onChange={(event) => updateField("telefono", event.target.value)}
            />

            <div className={styles.formGridFull}>
              <TextInput
                id="usuario-cargo"
                label="Cargo"
                value={values.cargo}
                error={fieldErrors.cargo}
                onChange={(event) => updateField("cargo", event.target.value)}
              />
            </div>
          </div>
        </section>

        <section className={styles.formSection} aria-label="Permisos">
          <p className={styles.formSectionTitle}>Permisos</p>
          <FormField
            id="usuario-roles"
            label="Perfiles del sistema"
            error={fieldErrors.roles}
            required
          >
            <div className={formStyles.optionPanel}>
              <div className={formStyles.optionGrid} role="group" aria-label="Perfiles del sistema">
                {INTERNAL_ROLES.map((role) => (
                  <CheckboxField
                    key={role}
                    id={`usuario-rol-${role}`}
                    variant="tile"
                    label={formatRol(role)}
                    checked={values.roles.includes(role)}
                    onChange={(checked) => toggleRole(role, checked)}
                  />
                ))}
              </div>

              {requiresEscuela ? (
                <>
                  <div className={formStyles.optionPanelDivider} />
                  <SelectInput
                    id="usuario-escuela"
                    label="Escuela vinculada"
                    required
                    placeholder="Selecciona una escuela"
                    value={values.escuelaId}
                    error={fieldErrors.escuelaId}
                    onChange={(event) => updateField("escuelaId", event.target.value)}
                  >
                    {escuelaOptions.map((escuela) => (
                      <option key={escuela.idEscuela} value={escuela.idEscuela}>
                        {escuela.nombreOficial}
                      </option>
                    ))}
                  </SelectInput>
                </>
              ) : null}

              <div className={formStyles.optionPanelDivider} />
              <div className={formStyles.optionFull}>
                <CheckboxField
                  id="usuario-cartas"
                  variant="tile"
                  label="Puede descargar cartas"
                  checked={values.puedeDescargarCartas}
                  onChange={(checked) => updateField("puedeDescargarCartas", checked)}
                />
              </div>
            </div>
          </FormField>
        </section>
      </form>
    </Modal>
  );
}

export function UsuarioFormModal({
  open,
  mode,
  usuario,
  escuelas,
  onClose,
  onSuccess,
}: UsuarioFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <UsuarioFormModalContent
      key={mode === "edit" ? `edit-${usuario?.idUsuario}` : "create"}
      mode={mode}
      usuario={usuario}
      escuelas={escuelas}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
