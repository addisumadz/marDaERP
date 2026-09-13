const XLSX = require("xlsx");
const path = require("path");

// Output directory
const outDir = path.join(__dirname);

// ============================================================
// Template 1: Import New Customers
// ============================================================
const importHeaders = [
  "#",                    // A (0) - Row number
  "ሙሉ ስም (Full Name)",   // B (1)
  "Full Name (English)",  // C (2)
  "Customer Type",        // D (3) - Must match existing type name
  "Phone Number",         // E (4)
  "Account Number",       // F (5) - Must be unique
  "Meter Number",         // G (6) - Must be unique
  "Meter Size",           // H (7) - Must match existing size (e.g. 0.5)
  "Branch",               // I (8) - Must match existing branch name
  "Kebele",               // J (9) - Must match existing kebele name
  "Ketena",               // K (10) - Must match ketena in the kebele
  "Initial Reading",      // L (11)
  "Latitude",             // M (12) - GPS
  "Longitude",            // N (13) - GPS
  "Status",               // O (14) - Usually "active"
  "Dry Waste Fee",        // P (15)
  "Old Months List",      // Q (16)
  "Old Penalty Months",   // R (17)
  "Old Penalty Total",    // S (18)
];

const importSample1 = [
  1,
  "አበበ ከበደ",
  "Abebe Kebede",
  "የቤት",
  "0911223344",
  "WB-001",
  "MTR-001",
  0.5,
  "ቅርንጫፍ 1",
  "ቀበሌ 01",
  "ከተና 01",
  0,
  9.02,
  38.75,
  "active",
  15,
  "",
  0,
  0,
];

const importSample2 = [
  2,
  "ሰላም ተስፋ",
  "Selam Tesfa",
  "የንግድ",
  "0922334455",
  "WB-002",
  "MTR-002",
  0.75,
  "ቅርንጫፍ 2",
  "ቀበሌ 02",
  "ከተና 03",
  125,
  9.01,
  38.74,
  "active",
  0,
  "ሐምሌ,ነሐሴ",
  2,
  350,
];

const importSample3 = [
  3,
  "ማርያም ገብረ",
  "Maryam Gebre",
  "የቤት",
  "0933445566",
  "WB-003",
  "MTR-003",
  0.5,
  "ቅርንጫፍ 1",
  "ቀበሌ 01",
  "ከተና 02",
  50,
  9.03,
  38.76,
  "active",
  10,
  "",
  0,
  0,
];

const importWs = XLSX.utils.aoa_to_sheet([
  importHeaders,
  importSample1,
  importSample2,
  importSample3,
]);

// Set column widths
importWs["!cols"] = importHeaders.map((h) => ({ wch: Math.max(h.length + 2, 16) }));

const importWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(importWb, importWs, "Import Customers");

// Add instructions sheet
const importInstructions = [
  ["IMPORT NEW CUSTOMERS - Template Instructions"],
  [""],
  ["Column", "Index", "Field", "Required", "Description"],
  ["A", "0", "#", "No", "Row number (optional)"],
  ["B", "1", "Full Name (Amharic)", "YES", "Customer full name in Amharic"],
  ["C", "2", "Full Name (English)", "No", "Customer name in English"],
  ["D", "3", "Customer Type", "YES", "Must EXACTLY match an existing customer type name (e.g. የቤት, የንግድ)"],
  ["E", "4", "Phone Number", "No", "Phone number"],
  ["F", "5", "Account Number", "YES", "Must be UNIQUE - not already in the system"],
  ["G", "6", "Meter Number", "YES", "Must be UNIQUE - not already in the system"],
  ["H", "7", "Meter Size", "YES", "Must match existing meter size NUMBER (e.g. 0.5, 0.75, 1.0)"],
  ["I", "8", "Branch", "YES", "Must EXACTLY match an existing branch name"],
  ["J", "9", "Kebele", "YES", "Must EXACTLY match an existing kebele name"],
  ["K", "10", "Ketena", "YES", "Must EXACTLY match a ketena name WITHIN the specified kebele"],
  ["L", "11", "Initial Reading", "No", "Meter initial reading (default: 0)"],
  ["M", "12", "Latitude", "No", "GPS latitude"],
  ["N", "13", "Longitude", "No", "GPS longitude"],
  ["O", "14", "Status", "YES", "Usually 'active'"],
  ["P", "15", "Dry Waste Fee", "No", "Monthly dry waste payment amount"],
  ["Q", "16", "Old Months List", "No", "Description of arrears months"],
  ["R", "17", "Old Penalty Months", "No", "Number of penalty months (if > 0, sets oldHasPenalty=true)"],
  ["S", "18", "Old Penalty Total", "No", "Total arrears amount (if > 0, sets oldHasPenalty=true)"],
  [""],
  ["IMPORTANT NOTES:"],
  ["- The first row is treated as a HEADER and is SKIPPED"],
  ["- Customer Type, Branch, Kebele, Ketena names must EXACTLY match what is in the system"],
  ["- If ANY row has an error, the ENTIRE import is REJECTED (all-or-nothing)"],
  ["- Account Number and Meter Number must be unique across the entire system"],
];

const instrWs = XLSX.utils.aoa_to_sheet(importInstructions);
instrWs["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 60 }];
XLSX.utils.book_append_sheet(importWb, instrWs, "Instructions");

XLSX.writeFileSync(importWb, path.join(outDir, "Template_Import_New_Customers.xlsx"));
console.log("Created: Template_Import_New_Customers.xlsx");

// ============================================================
// Template 2: Update Existing Customers
// ============================================================
const updateHeaders = [
  "A", "B", "C", "D", "E", "F", "G",
  "Account Number",  // H (7) - KEY field
  "I", "J", "K", "L", "M", "N",
  "Initial Reading",  // O (14)
  "P", "Q", "R", "S", "T",
  "Penalty Amount",   // U (20)
  "Penalty Months",   // V (21)
];

const updateSample1 = [
  "", "", "", "", "", "", "",
  "WB-001",
  "", "", "", "", "", "",
  250,
  "", "", "", "", "",
  0,
  0,
];

const updateSample2 = [
  "", "", "", "", "", "", "",
  "WB-002",
  "", "", "", "", "", "",
  500,
  "", "", "", "", "",
  1200,
  3,
];

const updateSample3 = [
  "", "", "", "", "", "", "",
  "WB-003",
  "", "", "", "", "", "",
  100,
  "", "", "", "", "",
  0,
  0,
];

const updateWs = XLSX.utils.aoa_to_sheet([
  updateHeaders,
  updateSample1,
  updateSample2,
  updateSample3,
]);

updateWs["!cols"] = updateHeaders.map((h, i) => {
  if (i === 7) return { wch: 20 };
  if (i === 14) return { wch: 18 };
  if (i === 20) return { wch: 18 };
  if (i === 21) return { wch: 18 };
  return { wch: 5 };
});

const updateWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(updateWb, updateWs, "Update Customers");

const updateInstructions = [
  ["UPDATE EXISTING CUSTOMERS - Template Instructions"],
  [""],
  ["ONLY these columns are used (all others are IGNORED):"],
  [""],
  ["Column", "Index", "Field", "Required", "Description"],
  ["H", "7", "Account Number", "YES", "Must match an EXISTING customer account number"],
  ["O", "14", "Initial Reading", "YES", "New initial reading value (updates customer + active meter)"],
  ["U", "20", "Penalty Amount", "No", "If > 0: sets oldHasPenalty=true, oldMonthsList='የቆየ ውዝፍ', oldKfyaAndPenaltyTotal=this value"],
  ["V", "21", "Penalty Months", "No", "Sets oldPenlityNumberOfMonths (only used if column U > 0)"],
  [""],
  ["IMPORTANT NOTES:"],
  ["- The first row is treated as a HEADER and is SKIPPED"],
  ["- Account Number (column H) is the KEY - it finds the existing customer to update"],
  ["- Columns A-G, I-N, P-T are IGNORED - you can put any data or leave blank"],
  ["- If column U (Penalty Amount) = 0, penalty fields are NOT modified"],
  ["- Each row is processed independently - errors in one row don't block others"],
];

const updateInstrWs = XLSX.utils.aoa_to_sheet(updateInstructions);
updateInstrWs["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 70 }];
XLSX.utils.book_append_sheet(updateWb, updateInstrWs, "Instructions");

XLSX.writeFileSync(updateWb, path.join(outDir, "Template_Update_Existing_Customers.xlsx"));
console.log("Created: Template_Update_Existing_Customers.xlsx");

// ============================================================
// Template 3: Update Customer Reader
// ============================================================
const readerHeaders = [
  "#",               // A (0) - ignored
  "Account Number",  // B (1) - KEY field
];

const readerSamples = [
  [1, "WB-001"],
  [2, "WB-002"],
  [3, "WB-003"],
  [4, "WB-004"],
  [5, "WB-005"],
];

const readerWs = XLSX.utils.aoa_to_sheet([readerHeaders, ...readerSamples]);
readerWs["!cols"] = [{ wch: 8 }, { wch: 25 }];

const readerWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(readerWb, readerWs, "Update Reader");

const readerInstructions = [
  ["UPDATE CUSTOMER READER - Template Instructions"],
  [""],
  ["This template is for assigning a meter reader to multiple customers at once."],
  [""],
  ["Column", "Index", "Field", "Required", "Description"],
  ["A", "0", "#", "No", "Row number (ignored)"],
  ["B", "1", "Account Number", "YES", "Customer account number to match"],
  [""],
  ["HOW IT WORKS:"],
  ["1. Select a Branch and Reader in the modal"],
  ["2. Upload this Excel file with account numbers in Column B"],
  ["3. Click 'Process' to match account numbers against existing customers"],
  ["4. Review matched and not-found accounts"],
  ["5. Click 'Save' to assign the selected reader to all matched customers"],
  [""],
  ["IMPORTANT NOTES:"],
  ["- ONLY Column B is used - all other columns are ignored"],
  ["- The first row is treated as a HEADER and is SKIPPED"],
  ["- Processing happens on the frontend (no server call until Save)"],
  ["- Account numbers are matched against the currently loaded customer list"],
];

const readerInstrWs = XLSX.utils.aoa_to_sheet(readerInstructions);
readerInstrWs["!cols"] = [{ wch: 10 }, { wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 60 }];
XLSX.utils.book_append_sheet(readerWb, readerInstrWs, "Instructions");

XLSX.writeFileSync(readerWb, path.join(outDir, "Template_Update_Customer_Reader.xlsx"));
console.log("Created: Template_Update_Customer_Reader.xlsx");

console.log("\nAll 3 templates created successfully!");
