"use client";

import { useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/lib/actions";

type UseDetailModalLoaderOptions = {
  reloadKey?: number;
  onBeforeLoad?: () => void;
};

export function useDetailModalLoader<T>(
  open: boolean,
  id: number | null,
  load: (entityId: number) => Promise<ActionResult<T>>,
  options: UseDetailModalLoaderOptions = {},
) {
  const { reloadKey = 0, onBeforeLoad } = options;
  const [detail, setDetail] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadRef = useRef(load);
  const onBeforeLoadRef = useRef(onBeforeLoad);

  loadRef.current = load;
  onBeforeLoadRef.current = onBeforeLoad;

  useEffect(() => {
    if (!open || id === null) {
      return;
    }

    const selectedId = id;
    let cancelled = false;

    async function fetchDetail() {
      setIsLoading(true);
      setError(null);
      setDetail(null);
      onBeforeLoadRef.current?.();

      const result = await loadRef.current(selectedId);

      if (cancelled) {
        return;
      }

      if (result.success) {
        setDetail(result.data);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    }

    void fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [open, id, reloadKey]);

  return {
    detail,
    setDetail,
    error,
    setError,
    isLoading,
    setIsLoading,
  };
}
