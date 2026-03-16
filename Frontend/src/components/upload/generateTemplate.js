import * as XLSX from "xlsx";
import { TEMPLATE_SCHEMAS } from "./templateSchemas";

/**
 * Generate and download a pre-formatted Excel template for the given upload type.
 *
 * Layout:
 *   Sheet 1 (data sheet)  — Row 1: Headers, Row 2: Instruction hints (deletable), Row 3+: Data
 *   Sheet 2 ("Instructions") — Full reference table with column details
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

  // ══════════════════════════════════════════════════════════════════
  // Sheet 1 — Data Sheet
  // ══════════════════════════════════════════════════════════════════
  const headers = columns.map((c) => c.header);

  // Row 2: human-readable hints (users can select row → delete)
  const hintRow = columns.map((c) => {
    let hint = `[${c.type === "number" ? "Number" : "Text"}]`;
    if (c.validation) {
      hint += ` Values: ${c.validation.join(", ")}`;
    }
    return hint;
  });

  // Row 3: example data
  const exampleRow = columns.map((c) => c.example ?? "");

  const aoa = [headers, hintRow, exampleRow];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws["!cols"] = columns.map((col) => ({
    wch: Math.max(col.header.length, String(col.example ?? "").length, 22) + 4,
  }));

  // Data validation dropdowns (e.g., CourseType, CourseNature, Semester)
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

  // ══════════════════════════════════════════════════════════════════
  // Sheet 2 — Instructions
  // ══════════════════════════════════════════════════════════════════
  const instrHeader = ["#", "Column Name", "Data Type", "Required", "Constraints / Allowed Values", "Example"];
  const instrRows = columns.map((col, i) => [
    i + 1,
    col.header,
    col.type === "number" ? "Number" : "Text",
    col.header === "Remarks" ? "No" : "Yes",
    col.validation
      ? `Only: ${col.validation.join(", ")}`
      : col.comment.replace(/\. Required.*/, "").replace(/Optional.*/, ""),
    col.example ?? "",
  ]);

  const instrAoa = [
    [`${label} Upload — Column Reference`],
    [],
    instrHeader,
    ...instrRows,
    [],
    ["Tips:"],
    ["• Delete Row 2 (hint row) in the data sheet before uploading — it is only for your reference."],
    ["• The example row (Row 3) should also be replaced or deleted before uploading."],
    ["• Do NOT rename or reorder columns — the backend reads them by position."],
    ["• All columns marked 'Yes' under Required must have a value in every row."],
  ];

  const wsInstr = XLSX.utils.aoa_to_sheet(instrAoa);

  // Merge the title row across all 6 columns
  wsInstr["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];

  wsInstr["!cols"] = [
    { wch: 4 },
    { wch: 22 },
    { wch: 12 },
    { wch: 10 },
    { wch: 50 },
    { wch: 20 },
  ];

  // ══════════════════════════════════════════════════════════════════
  // Build workbook & download
  // ══════════════════════════════════════════════════════════════════
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  XLSX.writeFile(wb, `${label}_Template.xlsx`);
}
