export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    return;
  }

  const Sentry = await import("@sentry/nextjs");
  const sampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: Number.isFinite(sampleRate) ? sampleRate : 0.1,
  });
}
