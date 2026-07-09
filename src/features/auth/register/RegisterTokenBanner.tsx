"use client";

import Link from "next/link";
import { REGISTER_SCHOOL_COPY } from "../constants/register";
import { AUTH_ROUTES } from "../constants/routes";
import formStyles from "../components/AuthForm/AuthForm.module.css";

type RegisterTokenBannerProps = {
  withToken: boolean;
  tokenStatus: "idle" | "loading" | "valid" | "invalid";
  tokenErrorMessage: string | null;
};

export function RegisterTokenBanner({
  withToken,
  tokenStatus,
  tokenErrorMessage,
}: RegisterTokenBannerProps) {
  if (!withToken) {
    return <p className={formStyles.introNote}>{REGISTER_SCHOOL_COPY.manualNote}</p>;
  }

  if (tokenStatus === "loading") {
    return <p className={formStyles.infoBanner}>{REGISTER_SCHOOL_COPY.validatingToken}</p>;
  }

  if (tokenStatus === "invalid") {
    return (
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
    );
  }

  return null;
}
