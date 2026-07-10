import { afterEach, describe, expect, it, vi } from "vitest";
import { runDownloadAction, triggerBrowserDownload } from "./download-file";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function stubDownloadDom() {
  const click = vi.fn();
  const revoke = vi.fn();
  const createObjectURL = vi.fn(() => "blob:mock");

  vi.stubGlobal("atob", (value: string) =>
    value === "QUI=" ? "AB" : value === "QQ==" ? "A" : "",
  );
  vi.stubGlobal("URL", {
    createObjectURL,
    revokeObjectURL: revoke,
  });
  vi.spyOn(document, "createElement").mockReturnValue({
    click,
    href: "",
    download: "",
  } as unknown as HTMLAnchorElement);

  return { click, revoke, createObjectURL };
}

describe("triggerBrowserDownload", () => {
  it("crea un enlace temporal y lo dispara", () => {
    const { click, revoke, createObjectURL } = stubDownloadDom();

    triggerBrowserDownload({
      filename: "carta.pdf",
      contentType: "application/pdf",
      base64: "QUI=",
    });

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith("blob:mock");
  });
});

describe("runDownloadAction", () => {
  it("reporta error sin descargar", async () => {
    const onError = vi.fn();
    const createElement = vi.spyOn(document, "createElement");

    await runDownloadAction(
      async () => ({ success: false, error: "No disponible" }),
      onError,
    );

    expect(onError).toHaveBeenCalledWith("No disponible");
    expect(createElement).not.toHaveBeenCalled();
  });

  it("descarga cuando la action es exitosa", async () => {
    const onError = vi.fn();
    const { click } = stubDownloadDom();

    await runDownloadAction(
      async () => ({
        success: true,
        data: {
          filename: "file.pdf",
          contentType: "application/pdf",
          base64: "QQ==",
        },
      }),
      onError,
    );

    expect(onError).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
  });
});
