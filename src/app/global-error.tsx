"use client";

import { gotham } from "@/lib/fonts";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="es" className={gotham.variable}>
      <body className={gotham.variable}>
        <main
          id="main"
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            background: "#f7f0e6",
            fontFamily: "var(--font-gotham), system-ui, sans-serif",
          }}
        >
          <section
            style={{
              width: "min(100%, 32rem)",
              padding: "2rem",
              borderRadius: "1rem",
              background: "#ffffff",
              border: "1px solid #ececec",
              textAlign: "center",
            }}
          >
            <h1 style={{ margin: "0 0 0.75rem", color: "#2d2d2d" }}>
              Error del sistema
            </h1>
            <p style={{ margin: "0 0 1.5rem", color: "#5c5c5c", lineHeight: 1.6 }}>
              La aplicación encontró un problema grave. Intenta recargar la página.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                minHeight: "2.75rem",
                padding: "0 1.25rem",
                border: "none",
                borderRadius: "0.5rem",
                background: "#6b2340",
                color: "#ffffff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
