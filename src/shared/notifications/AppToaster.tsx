"use client";

import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import { Toaster } from "sonner";
import styles from "./AppToaster.module.css";

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      visibleToasts={4}
      closeButton
      offset={16}
      gap={10}
      icons={{
        success: <CircleCheck size={18} strokeWidth={2} aria-hidden="true" />,
        error: <CircleX size={18} strokeWidth={2} aria-hidden="true" />,
        warning: <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" />,
        info: <Info size={18} strokeWidth={2} aria-hidden="true" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: "Cerrar notificación",
        classNames: {
          toast: styles.toast,
          content: styles.content,
          title: styles.title,
          description: styles.description,
          closeButton: styles.closeButton,
          icon: styles.icon,
          success: styles.success,
          error: styles.error,
          warning: styles.warning,
          info: styles.info,
        },
      }}
    />
  );
}
