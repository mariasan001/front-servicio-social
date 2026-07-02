import type { DownloadedFile } from "@/lib/api/download";

export function triggerBrowserDownload(file: DownloadedFile) {
  const binary = atob(file.base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  const blob = new Blob([bytes], { type: file.contentType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function runDownloadAction(
  action: () => Promise<{ success: true; data: DownloadedFile } | { success: false; error: string }>,
  onError: (message: string) => void,
) {
  const result = await action();

  if (!result.success) {
    onError(result.error);
    return;
  }

  triggerBrowserDownload(result.data);
}
