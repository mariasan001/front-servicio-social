import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getApiErrorMessage } from "@/lib/api/errors";
import styles from "./ApiSection.module.css";

export type ApiEndpointDefinition = {
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string;
  operationId: string;
  serviceFunction: string;
};

export type ApiProbe = {
  label: string;
  path: string;
  ok: boolean;
  data?: unknown;
  error?: string;
};

type ApiSectionProps = {
  title: string;
  description?: string;
  note?: string;
  sectionId?: string;
  endpoints: ApiEndpointDefinition[];
  probes: ApiProbe[];
};

export function ApiSection({
  title,
  description,
  note = "Consumo real del backend. Sin datos de prueba ni mocks.",
  sectionId = "api-section",
  endpoints,
  probes,
}: ApiSectionProps) {
  const titleId = `${sectionId}-title`;

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <PageHeader
        title={title}
        description={description}
        note={note}
        titleId={titleId}
      />

      <div className={styles.grid}>
        <section className={styles.block} aria-labelledby={`${sectionId}-endpoints`}>
          <h2 id={`${sectionId}-endpoints`} className={styles.blockTitle}>
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

        <section className={styles.block} aria-labelledby={`${sectionId}-probes`}>
          <h2 id={`${sectionId}-probes`} className={styles.blockTitle}>
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

export async function runApiProbe(
  label: string,
  path: string,
  request: () => Promise<unknown>,
): Promise<ApiProbe> {
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
