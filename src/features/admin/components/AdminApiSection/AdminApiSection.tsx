import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AdminEndpointDefinition } from "../../constants/endpoints";
import styles from "./AdminApiSection.module.css";

export type AdminApiProbe = {
  label: string;
  path: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

type AdminApiSectionProps = {
  title: string;
  description?: string;
  endpoints: AdminEndpointDefinition[];
  probes: AdminApiProbe[];
};

export function AdminApiSection({
  title,
  description,
  endpoints,
  probes,
}: AdminApiSectionProps) {
  return (
    <section className={styles.section} aria-labelledby="admin-api-section-title">
      <PageHeader
        title={title}
        description={description}
        note="Consumo real del backend. Sin datos de prueba ni mocks."
        titleId="admin-api-section-title"
      />

      <div className={styles.grid}>
        <section className={styles.block} aria-labelledby="admin-endpoints-title">
          <h2 id="admin-endpoints-title" className={styles.blockTitle}>
            Endpoints integrados ({endpoints.length})
          </h2>
          <ul className={styles.endpointList}>
            {endpoints.map((endpoint) => (
              <li key={`${endpoint.method}-${endpoint.path}`} className={styles.endpointItem}>
                <span className={styles.method}>{endpoint.method}</span>
                <code className={styles.path}>{endpoint.path}</code>
                <span className={styles.meta}>
                  {endpoint.operationId} → {endpoint.serviceFunction}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="admin-probes-title">
          <h2 id="admin-probes-title" className={styles.blockTitle}>
            Lecturas ejecutadas ({probes.length})
          </h2>
          <div className={styles.probeList}>
            {probes.map((probe) => (
              <article key={probe.label} className={styles.probeCard}>
                <div className={styles.probeHeader}>
                  <h3 className={styles.probeTitle}>{probe.label}</h3>
                  <StatusBadge tone={probe.ok ? "success" : "error"}>
                    {probe.ok ? "OK" : "Error"}
                  </StatusBadge>
                </div>
                <code className={styles.probePath}>{probe.path}</code>
                {probe.error ? (
                  <p className={styles.error} role="alert">
                    {probe.error}
                  </p>
                ) : (
                  <pre className={styles.payload}>
                    {JSON.stringify(probe.data, null, 2)}
                  </pre>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export async function runAdminProbe(
  label: string,
  path: string,
  request: () => Promise<unknown>,
): Promise<AdminApiProbe> {
  try {
    const data = await request();
    return { label, path, ok: true, data };
  } catch (error) {
    return {
      label,
      path,
      ok: false,
      error: getApiErrorMessage(error, "No fue posible consumir el endpoint."),
    };
  }
}
