import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

const excelPath = path.resolve("../../formats/BL_Bulk Upload Laptops.xlsx");

try {
  // Read the workbook
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON array (array of arrays to keep column order)
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (rows.length > 0) {
    const header = rows[0].map((h) => (typeof h === "string" ? h.trim() : h));

    // Find index of 'Price*'
    const priceIdx = header.findIndex((h) => h === "Price*" || h === "Price");

    if (priceIdx !== -1 && !header.includes("MRP")) {
      // Add MRP before Price*
      header.splice(priceIdx, 0, "MRP");

      const newRows = [header];

      // Update each data row
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        let priceVal = parseFloat(row[priceIdx]) || 0;

        // Find discount index
        let discountIdx = header.indexOf("Discount Percentage (%)") - 1;
        if (discountIdx === -2)
          discountIdx = header.indexOf("Discount Percentage") - 1;

        let discountVal = 0;
        if (discountIdx !== -2 && discountIdx < row.length) {
          discountVal = parseFloat(row[discountIdx]) || 0;
        }

        let mrpVal = priceVal;
        if (discountVal > 0 && discountVal < 100) {
          mrpVal = Math.round((priceVal / (1 - discountVal / 100)) * 100) / 100;
        }

        // Ensure row has enough elements
        while (row.length < priceIdx) {
          row.push("");
        }

        row.splice(priceIdx, 0, mrpVal || "");
        newRows.push(row);
      }

      // Create new worksheet from new rows
      const newWorksheet = XLSX.utils.aoa_to_sheet(newRows);

      // Replace old worksheet with new one
      workbook.Sheets[sheetName] = newWorksheet;

      // Write back to file
      XLSX.writeFile(workbook, excelPath);
      console.log("✅ Excel updated successfully with MRP column.");
    } else {
      console.log("Price column not found or MRP already exists in Excel.");
    }
  }
} catch (error) {
  console.error("Error updating Excel:", error);
}
