"use client";

import type { TitularAreaContext } from "../../lib/area-context";
import type { VacanteDetalleResponse, VacanteResponse } from "../../types/titular.types";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { TitularVacanteFormBody } from "./TitularVacanteFormBody";
import { useTitularVacanteForm } from "./useTitularVacanteForm";
import styles from "./TitularVacanteFormModal.module.css";

type VacanteFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  vacante?: VacanteResponse | VacanteDetalleResponse | null;
  areaContext: TitularAreaContext | null;
  onClose: () => void;
};

function VacanteFormModalContent({
  mode,
  vacante,
  areaContext,
  onClose,
}: Omit<VacanteFormModalProps, "open">) {
  const form = useTitularVacanteForm({ mode, vacante, areaContext, onClose });

  return (
    <Modal
      open
      title={mode === "create" ? "Nueva vacante" : "Editar vacante"}
      onClose={onClose}
      size="lg"
      footer={
        <div className={styles.modalFooter}>
          <Button type="button" variant="outline" onClick={onClose} disabled={form.isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="titular-vacante-form"
            variant={mode === "create" ? "primary" : "success"}
            disabled={form.isSubmitting}
          >
            {form.isSubmitting
              ? "Guardando…"
              : mode === "create"
                ? "Registrar vacante"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <TitularVacanteFormBody
        form={form}
        areaContextHint={
          mode === "create" && !areaContext
            ? "Tu área se vinculará al registrar la vacante."
            : undefined
        }
        onSubmit={() => void form.handleSubmit()}
      />
    </Modal>
  );
}

export function TitularVacanteFormModal({
  open,
  mode,
  vacante,
  areaContext,
  onClose,
}: VacanteFormModalProps) {
  if (!open) {
    return null;
  }

  return (
    <VacanteFormModalContent
      key={mode === "edit" ? `edit-${vacante?.idVacante}` : "create"}
      mode={mode}
      vacante={vacante}
      areaContext={areaContext}
      onClose={onClose}
    />
  );
}
