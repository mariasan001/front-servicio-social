function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type ClientReportPdfOptions = {
  title: string;
  subtitle?: string;
  headers: string[];
  rows: string[][];
};

export function exportClientReportPdf({
  title,
  subtitle,
  headers,
  rows,
}: ClientReportPdfOptions) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    return;
  }

  const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
    )
    .join("");

  printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      @page { size: landscape; margin: 12mm; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #2d2d2d;
      }
      h1 {
        margin: 0 0 0.25rem;
        font-size: 1.125rem;
        color: #6b2340;
      }
      p {
        margin: 0 0 1rem;
        font-size: 0.75rem;
        color: #6b6b6b;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.6875rem;
      }
      th,
      td {
        padding: 0.4rem 0.5rem;
        border: 1px solid #d8d8d8;
        text-align: left;
        vertical-align: top;
      }
      th {
        background: #f5f5f5;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      tr:nth-child(even) td {
        background: #fcfcfc;
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  </body>
</html>`);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
