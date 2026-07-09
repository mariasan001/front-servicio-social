export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "front-servicio-social",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
