import { getBackendOrigin } from "@/lib/api/client";

const BACKEND_PROBE_TIMEOUT_MS = 2_500;

async function probeBackend(): Promise<"up" | "down"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), BACKEND_PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(
      `${getBackendOrigin().replace(/\/$/, "")}/api/public/vacantes?page=0&size=1`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: controller.signal,
      },
    );

    return response.ok || response.status < 500 ? "up" : "down";
  } catch {
    return "down";
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const backend = await probeBackend();
  const status = backend === "up" ? "ok" : "degraded";

  return Response.json(
    {
      status,
      service: "front-servicio-social",
      backend,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
