import * as Sentry from "@sentry/nextjs";

/** Reporta errores de UI a Sentry cuando hay DSN; siempre deja rastro en consola. */
export function reportClientError(error: unknown) {
  console.error(error);

  if (!process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
    return;
  }

  Sentry.captureException(error);
}
