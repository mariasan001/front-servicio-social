import { describe, expect, it } from "vitest";
import {
  ACCEPTED_PDF_MIME,
  ACCEPTED_UPLOAD_MIME,
  formatFileSize,
  isPdfFile,
  MAX_UPLOAD_SIZE_BYTES,
  MAX_UPLOAD_SIZE_MB,
} from "./upload";

describe("upload limits", () => {
  it("alinean UI con el bodySizeLimit de 2mb", () => {
    expect(MAX_UPLOAD_SIZE_MB).toBe(2);
    expect(MAX_UPLOAD_SIZE_BYTES).toBe(2 * 1024 * 1024);
    expect(ACCEPTED_UPLOAD_MIME).toContain("application/pdf");
    expect(ACCEPTED_PDF_MIME).toContain("application/pdf");
  });
});

describe("isPdfFile", () => {
  it("detecta PDF por MIME o extensión", () => {
    expect(
      isPdfFile(new File(["x"], "doc.pdf", { type: "application/pdf" })),
    ).toBe(true);
    expect(isPdfFile(new File(["x"], "doc.PDF", { type: "" }))).toBe(true);
    expect(isPdfFile(new File(["x"], "foto.png", { type: "image/png" }))).toBe(
      false,
    );
  });
});

describe("formatFileSize", () => {
  it("formatea bytes, KB y MB", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });
});
