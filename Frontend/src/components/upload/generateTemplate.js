import XLSX from "xlsx-js-style";
import { TEMPLATE_SCHEMAS } from "./templateSchemas";

/**
 * Generate and download a pre-formatted Excel template for the given upload type.
 *
 * Layout:
 *   Row 1 — Headers (bold, dark blue background, white text)
 *   Row 2 — Description of what each column expects (amber/yellow background) ← user deletes this row
 *   Row 3 — Example / mock data (light green background) ← user deletes this row
 *   Row 4+ — User enters data here
 *
 * @param {"course"|"faculty"|"room"|"section"} type
 */
export function downloadTemplate(type) {
  const schema = TEMPLATE_SCHEMAS[type];
  if (!schema) {
    console.error(`Unknown template type: ${type}`);
    return;
  }

  const { label, sheetName, columns } = schema;

  // ── Style definitions ─────────────────────────────────────────────
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
    fill: { fgColor: { rgb: "1F4E79" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  const descStyle = {
    font: { italic: true, color: { rgb: "7A4700" }, sz: 10 },
    fill: { fgColor: { rgb: "FFF3CD" } },
    alignment: { vertical: "top", wrapText: true },
    border: {
      top: { style: "thin", color: { rgb: "E0C97A" } },
      bottom: { style: "thin", color: { rgb: "E0C97A" } },
      left: { style: "thin", color: { rgb: "E0C97A" } },
      right: { style: "thin", color: { rgb: "E0C97A" } },
    },
  };

  const exampleStyle = {
    font: { color: { rgb: "155724" }, sz: 10 },
    fill: { fgColor: { rgb: "D4EDDA" } },
    alignment: { vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "A3D5B1" } },
      bottom: { style: "thin", color: { rgb: "A3D5B1" } },
      left: { style: "thin", color: { rgb: "A3D5B1" } },
      right: { style: "thin", color: { rgb: "A3D5B1" } },
    },
  };

  // ── Build sheet data ──────────────────────────────────────────────
  // Row 1: Headers
  const headerRow = columns.map((c) => c.header);

  // Row 2: Descriptions / context
  const descRow = columns.map((c) => {
    let desc = c.comment;
    if (c.validation) {
      desc += `\nAllowed: ${c.validation.join(", ")}`;
    }
    return desc;
  });

  // Row 3: Example / mock data
  const exampleDataRow = columns.map((c) => c.example ?? "");

  // Create worksheet from array-of-arrays
  const ws = XLSX.utils.aoa_to_sheet([headerRow, descRow, exampleDataRow]);

  // ── Apply styles to each cell ─────────────────────────────────────
  columns.forEach((_, colIdx) => {
    const colLetter = XLSX.utils.encode_col(colIdx);

    // Row 1 (index 0) — header
    const hRef = `${colLetter}1`;
    if (ws[hRef]) ws[hRef].s = headerStyle;

    // Row 2 (index 1) — description
    const dRef = `${colLetter}2`;
    if (ws[dRef]) ws[dRef].s = descStyle;

    // Row 3 (index 2) — example
    const eRef = `${colLetter}3`;
    if (ws[eRef]) ws[eRef].s = exampleStyle;
  });

  // ── Column widths ─────────────────────────────────────────────────
  ws["!cols"] = columns.map((col) => ({
    wch: Math.max(col.header.length, String(col.example ?? "").length, 20) + 6,
  }));

  // Set row heights for description row to accommodate wrapped text
  ws["!rows"] = [
    { hpt: 22 },  // Row 1: headers
    { hpt: 55 },  // Row 2: descriptions (taller for wrapping)
    { hpt: 20 },  // Row 3: examples
  ];

  // ── Data validation dropdowns ─────────────────────────────────────
  const validations = [];
  columns.forEach((col, idx) => {
    if (col.validation && col.validation.length > 0) {
      validations.push({
        type: "list",
        operator: "equal",
        sqref: `${XLSX.utils.encode_col(idx)}4:${XLSX.utils.encode_col(idx)}1000`,
        formulas: [col.validation.join(",")],
        showDropDown: true,
      });
    }
  });
  if (validations.length > 0) {
    ws["!dataValidation"] = validations;
  }

  // ── Build workbook & download ─────────────────────────────────────
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  XLSX.writeFile(wb, `${label}_Template.xlsx`);
}
