"use client";

import { useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/api/errors";
import { REGISTER_SCHOOL_COPY } from "../constants/register";
import { validateRegistrationToken } from "../services/register.service";

export type RegisterTokenStatus = "idle" | "loading" | "valid" | "invalid";

export function useRegisterToken(token?: string) {
  const withToken = Boolean(token?.trim());
  const [tokenStatus, setTokenStatus] = useState<RegisterTokenStatus>(
    withToken ? "loading" : "idle",
  );
  const [tokenSchoolName, setTokenSchoolName] = useState<string | null>(null);
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!withToken || !token) {
      return;
    }

    const tokenValue = token.trim();
    let cancelled = false;

    async function verifyToken() {
      setTokenStatus("loading");

      try {
        const result = await validateRegistrationToken(tokenValue);
        if (cancelled) {
          return;
        }

        if (!result?.valido) {
          setTokenStatus("invalid");
          setTokenSchoolName(null);
          setTokenErrorMessage(
            result?.mensaje?.trim() || REGISTER_SCHOOL_COPY.invalidTokenBody,
          );
          return;
        }

        setTokenStatus("valid");
        setTokenSchoolName(result.nombreEscuela ?? null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTokenStatus("invalid");
        setTokenSchoolName(null);
        setTokenErrorMessage(
          getApiErrorMessage(error, REGISTER_SCHOOL_COPY.invalidTokenBody),
        );
      }
    }

    void verifyToken();

    return () => {
      cancelled = true;
    };
  }, [token, withToken]);

  return {
    withToken,
    tokenStatus,
    tokenSchoolName,
    tokenErrorMessage,
  };
}
