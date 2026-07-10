import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";
const analyzeBundles = process.env.ANALYZE === "true";
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
const sentryEnabled = Boolean(sentryDsn);
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN?.trim() || "";

if (isProduction && !process.env.API_PROXY_TARGET) {
  throw new Error("API_PROXY_TARGET must be set when NODE_ENV=production");
}

const scriptSrc = isProduction
  ? "script-src 'self' 'unsafe-inline'; script-src-attr 'none'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src-attr 'none'";

const connectSrc = [
  "connect-src 'self'",
  ...(sentryEnabled
    ? ["https://*.ingest.sentry.io", "https://*.ingest.us.sentry.io"]
    : []),
].join(" ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      connectSrc,
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/restablecer-contrasena/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
      {
        source: "/registro/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    const apiOrigin = process.env.API_PROXY_TARGET ?? "http://localhost:8080";

    return [
      {
        source: "/api/backend/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

const analyzedConfig = withBundleAnalyzer({
  enabled: analyzeBundles,
})(nextConfig);

const exportedConfig = sentryEnabled
  ? withSentryConfig(analyzedConfig, {
      silent: true,
      sourcemaps: {
        disable: !sentryAuthToken,
      },
      telemetry: false,
    })
  : analyzedConfig;

export default exportedConfig;
