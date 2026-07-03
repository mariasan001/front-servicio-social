"use client";

import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import styles from "./ConfirmDialog.module.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "No, volver",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="md"
      footer={
        <div className={styles.footer}>
          <Button type="button" variant="outline" disabled={isLoading} onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" disabled={isLoading} onClick={onConfirm}>
            {isLoading ? "Procesando…" : confirmLabel}
          </Button>
        </div>
      }
    >
      <p className={styles.description}>{description}</p>
    </Modal>
  );
}
