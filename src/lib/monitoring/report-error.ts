type SentryLike = {
  init: (options: {
    dsn: string;
    environment?: string;
    tracesSampleRate?: number;
  }) => void;
  captureException: (error: unknown) => void;
};

let sentryPromise: Promise<SentryLike | null> | null = null;

function getSentryDsn() {
  return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
}

function getTracesSampleRate() {
  const sampleRate = Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
  return Number.isFinite(sampleRate) ? sampleRate : 0.1;
}

async function loadSentry(): Promise<SentryLike | null> {
  const dsn = getSentryDsn();
  if (!dsn) {
    return null;
  }

  if (!sentryPromise) {
    sentryPromise = import("@sentry/nextjs")
      .then((Sentry) => {
        Sentry.init({
          dsn,
          environment: process.env.NODE_ENV,
          tracesSampleRate: getTracesSampleRate(),
        });
        return Sentry as SentryLike;
      })
      .catch(() => null);
  }

  return sentryPromise;
}

/** Reporta errores de UI a Sentry cuando hay DSN; siempre deja rastro en consola. */
export function reportClientError(error: unknown) {
  console.error(error);

  void loadSentry().then((Sentry) => {
    Sentry?.captureException(error);
  });
}
