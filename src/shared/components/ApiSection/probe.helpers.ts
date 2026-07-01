import type { ApiProbe } from "./ApiSection";
import { runApiProbe } from "./ApiSection";

export type ExtraApiProbeDefinition = {
  label: string;
  path: string;
  request: () => Promise<unknown>;
};

type ProbeListAndDetailOptions<T extends object> = {
  listLabel: string;
  listPath: string;
  detailLabelPrefix: string;
  detailPath: (id: number) => string;
  listRequest: () => Promise<T[]>;
  detailRequest: (id: number) => Promise<unknown>;
  idKey: keyof T;
  extraProbes?: (id: number) => ExtraApiProbeDefinition[];
};

export async function probeListAndDetail<T extends object>({
  listLabel,
  listPath,
  detailLabelPrefix,
  detailPath,
  listRequest,
  detailRequest,
  idKey,
  extraProbes,
}: ProbeListAndDetailOptions<T>): Promise<ApiProbe[]> {
  const listProbe = await runApiProbe(listLabel, listPath, listRequest);
  const probes = [listProbe];

  const firstId = listProbe.ok
    ? (listProbe.data as T[] | undefined)?.[0]?.[idKey]
    : undefined;

  if (typeof firstId === "number") {
    probes.push(
      await runApiProbe(
        `${detailLabelPrefix} #${firstId}`,
        detailPath(firstId),
        () => detailRequest(firstId),
      ),
    );

    const extras = extraProbes?.(firstId) ?? [];

    for (const extra of extras) {
      probes.push(
        await runApiProbe(extra.label, extra.path, extra.request),
      );
    }
  }

  return probes;
}
