/**
 * Generate Reading Import Excel Template
 * 
 * Run: node generate_reading_template.js
 * 
 * The import parser in page.js accepts these columns (case-insensitive, whitespace/underscore ignored):
 *   - AccountNo (aliases: accountnumber, account)
 *   - Reading   (aliases: currentreading)
 */
const XLSX = require("xlsx");

const sampleData = [
  { AccountNo: "WB-001", Reading: 350 },
  { AccountNo: "WB-002", Reading: 1200 },
  { AccountNo: "WB-003", Reading: 89 },
  { AccountNo: "WB-004", Reading: 560 },
  { AccountNo: "WB-005", Reading: 2100 },
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleData);

// Set column widths
ws["!cols"] = [
  { wch: 20 }, // AccountNo
  { wch: 15 }, // Reading
];

XLSX.utils.book_append_sheet(wb, ws, "ReadingImport");

const filename = "Reading_Import_Template.xlsx";
XLSX.writeFile(wb, filename);
console.log(`✅ Template created: ${filename}`);
console.log(`\nColumns required:`);
console.log(`  - AccountNo  → Customer account number`);
console.log(`  - Reading    → Current meter reading value`);
console.log(`\nNotes:`);
console.log(`  - Headers are case-insensitive`);
console.log(`  - Column order doesn't matter`);
console.log(`  - Only these 2 columns are needed`);
