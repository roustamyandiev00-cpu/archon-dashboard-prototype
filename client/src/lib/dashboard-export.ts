type CsvRow = Record<string, string | number>;

const toCsv = (rows: CsvRow[]) => {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    const values = headers.map((key) => String(row[key] ?? "").replace(/\n/g, " "));
    lines.push(values.join(","));
  });
  return lines.join("\n");
};

const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportCashflowCsv = (rows: { month: string; inkomsten: number; uitgaven: number }[]) => {
  const csv = toCsv(rows.map((row) => ({
    maand: row.month,
    inkomsten: row.inkomsten,
    uitgaven: row.uitgaven,
  })));
  if (csv) {
    downloadCsv("cashflow.csv", csv);
  }
};

export const exportProjectStatusCsv = (rows: { status: string; count: number }[]) => {
  const csv = toCsv(rows.map((row) => ({
    status: row.status,
    aantal: row.count,
  })));
  if (csv) {
    downloadCsv("project-status.csv", csv);
  }
};
