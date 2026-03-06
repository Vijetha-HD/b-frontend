import * as XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const excelPath = path.resolve(
  __dirname,
  "../../formats/BL_Bulk Upload Laptops.xlsx",
);

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

  if (rows.length > 0) {
    console.log("=== Excel Column Headers ===");
    console.log(rows[0].join(" | "));
    console.log("\n=== Row 2 Data ===");
    if (rows.length > 1) console.log(rows[1].join(" | "));

    const headers = rows[0].map((h) => String(h).trim());
    const mrpIdx = headers.findIndex((h) => h === "MRP");
    const priceIdx = headers.findIndex((h) => h === "Price*" || h === "Price");
    const discountIdx = headers.findIndex(
      (h) => h === "Discount Percentage (%)" || h === "Discount Percentage",
    );

    console.log("\n=== Key Column Positions ===");
    console.log(
      `MRP column: ${mrpIdx !== -1 ? `index ${mrpIdx}` : "NOT FOUND"}`,
    );
    console.log(
      `Price* column: ${priceIdx !== -1 ? `index ${priceIdx}` : "NOT FOUND"}`,
    );
    console.log(
      `Discount column: ${discountIdx !== -1 ? `index ${discountIdx}` : "NOT FOUND"}`,
    );

    if (rows.length > 1 && mrpIdx !== -1) {
      console.log(`\nMRP value in row 2: ${rows[1][mrpIdx]}`);
    }
    if (rows.length > 1 && priceIdx !== -1) {
      console.log(`Price* value in row 2: ${rows[1][priceIdx]}`);
    }
  }
} catch (e) {
  console.error("Error reading Excel file:", e.message);
}
