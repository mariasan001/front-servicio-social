"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { AUTH_ROUTES } from "../../constants/routes";
import { logout } from "../../services/auth.service";
import formStyles from "@/shared/components/Form/Form.module.css";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className,
  label = "Cerrar sesión",
}: LogoutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    setIsSubmitting(true);

    try {
      await logout();
      router.push(AUTH_ROUTES.login);
      router.refresh();
    } catch (error) {
      console.error(getApiErrorMessage(error, "No fue posible cerrar sesión."));
      router.push(AUTH_ROUTES.login);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      className={[formStyles.textButton, className].filter(Boolean).join(" ")}
      disabled={isSubmitting}
      onClick={() => void handleLogout()}
    >
      {isSubmitting ? "Cerrando sesión…" : label}
    </button>
  );
}
