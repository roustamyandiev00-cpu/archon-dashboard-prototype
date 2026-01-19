export type CsvColumn<T> = {
  key: keyof T;
  label: string;
};

const escapeCsvValue = (value: unknown) => {
  const stringValue = value === null || value === undefined ? "" : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

export const downloadBlob = (filename: string, blob: Blob) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.rel = "noopener";
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadTextFile = (filename: string, contents: string, type = "text/plain") => {
  const blob = new Blob([contents], { type });
  downloadBlob(filename, blob);
};

export const exportToCsv = <T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns?: CsvColumn<T>[]
) => {
  if (rows.length === 0) {
    downloadTextFile(filename, "", "text/csv;charset=utf-8;");
    return;
  }

  const keys = columns ? columns.map((column) => column.key) : (Object.keys(rows[0]) as (keyof T)[]);
  const header = columns ? columns.map((column) => column.label) : keys.map((key) => String(key));
  const lines = [
    header.join(","),
    ...rows.map((row) => keys.map((key) => escapeCsvValue(row[key])).join(",")),
  ];

  downloadTextFile(filename, lines.join("\n"), "text/csv;charset=utf-8;");
};

export const parseCsv = <T extends Record<string, unknown>>(
  csvText: string,
  columns?: CsvColumn<T>[]
): T[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);

  // Map headers to keys
  const keyMap = new Map<string, keyof T>();
  if (columns) {
    columns.forEach(col => {
      const headerIndex = headers.findIndex(h => h.toLowerCase() === col.label.toLowerCase());
      if (headerIndex !== -1) {
        keyMap.set(col.key as string, col.key);
      }
    });
  } else {
    headers.forEach((header, index) => {
      keyMap.set(header, header as keyof T);
    });
  }

  // Parse data rows
  const rows: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const row: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      const value = values[index] || '';
      const key = keyMap.get(header);
      if (key) {
        // Try to parse numbers and booleans
        if (value === '') {
          row[key as string] = undefined;
        } else if (value.toLowerCase() === 'true') {
          row[key as string] = true;
        } else if (value.toLowerCase() === 'false') {
          row[key as string] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          row[key as string] = Number(value);
        } else {
          row[key as string] = value;
        }
      }
    });

    rows.push(row as T);
  }

  return rows;
};

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);

  return result;
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const openPrintableDocument = (title: string, bodyHtml: string) => {
  const popup = window.open("", "_blank", "noopener,noreferrer,width=800,height=600");
  if (!popup) {
    return;
  }

  popup.document.open();
  popup.document.write(`<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
      h1 { font-size: 20px; margin: 0 0 16px; }
      h2 { font-size: 16px; margin: 24px 0 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
      .muted { color: #64748b; font-size: 12px; }
      .total { font-weight: bold; }
      .section { margin-top: 16px; }
    </style>
  </head>
  <body>
    ${bodyHtml}
  </body>
</html>`);
  popup.document.close();
  popup.focus();
  popup.print();
};
