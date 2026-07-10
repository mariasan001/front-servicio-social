import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (dsn) {
  const sampleRate = Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ??
      process.env.SENTRY_TRACES_SAMPLE_RATE ??
      "0.1",
  );

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number.isFinite(sampleRate) ? sampleRate : 0.1,
  });
}
