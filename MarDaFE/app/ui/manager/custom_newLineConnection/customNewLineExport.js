"use client";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";

/**
 * Export New Line Connection applications to CSV with UTF-8 BOM for Amharic support in Excel.
 * Fetches ALL matching records (not just the current page) based on active filters.
 *
 * @param {Object} params
 * @param {string} params.status   - Status filter ("ALL" or specific status)
 * @param {number|null} params.branchId - Branch ID filter (null = all branches)
 * @param {string} params.search   - Search term
 * @returns {Promise<void>}
 */
export async function exportNewLineApplicationsCsv({ status = "ALL", branchId = null, search = "" } = {}) {
  // Fetch all records (up to 9999) with the same filters the user is viewing
  const res = await customNewLineConnectionService.getApplications({
    page: 0,
    size: 9999,
    status: status === "ALL" ? undefined : status,
    branchId,
    search,
  });

  const records = res?.content || [];
  if (records.length === 0) {
    throw new Error("ምንም ማመልከቻ አልተገኘም (No records to export)");
  }

  // CSV Column definitions (Amharic header + English sub-header)
  const columns = [
    { header: "የማመልከቻ ቁጥር (Application #)", accessor: (r) => r.applicationNumber || "" },
    { header: "የደንበኛ ሙሉ ስም (Customer Name)", accessor: (r) => r.customerFullName || "" },
    { header: "Customer Name (EN)", accessor: (r) => r.customerFullNameEng || "" },
    { header: "ስልክ ቁጥር (Phone)", accessor: (r) => r.phoneNumber || "" },
    { header: "ቀበሌ (Kebele)", accessor: (r) => r.kebele?.streetsName || r.kebele?.name || "" },
    { header: "ቀጠና (Ketena)", accessor: (r) => r.ketena?.ketenaName || r.ketena?.name || "" },
    { header: "ቤት ቁጥር (House #)", accessor: (r) => r.houseNumber || "" },
    { header: "ቅርንጫፍ (Branch)", accessor: (r) => r.branch?.branchDescription || r.branch?.name || "" },
    { header: "ደረጃ (Status)", accessor: (r) => formatStatus(r.status) },
    { header: "ጠቅላላ ተከፋይ (Total Payable)", accessor: (r) => Number(r.totalPayableAmount || 0).toFixed(2) },
    { header: "ክፍያ ተፈጽሟል (Paid?)", accessor: (r) => (r.isPaid ? "አዎ (Yes)" : "አይ (No)") },
    { header: "ደረሰኝ ቁጥር (Receipt #)", accessor: (r) => r.paymentReceiptNumber || "" },
    { header: "ቆጣሪ ቁጥር (Meter #)", accessor: (r) => r.meterNumber || "" },
    { header: "ዳሰሳ ባለሙያ (Survey Plumber)", accessor: (r) => r.surveyPlumber ? `${r.surveyPlumber.firstName} ${r.surveyPlumber.lastName}` : "" },
    { header: "ዝርጋታ ባለሙያ (Install Plumber)", accessor: (r) => r.installationPlumber ? `${r.installationPlumber.firstName} ${r.installationPlumber.lastName}` : "" },
    { header: "የማመልከቻ ቀን (Application Date)", accessor: (r) => r.applicationDate ? new Date(r.applicationDate).toLocaleDateString("en-GB") : "" },
    { header: "የደንበኛ ዓይነት (Customer Type)", accessor: (r) => r.customerType?.customerTypeDescription || "" },
  ];

  // Build CSV content
  const headerRow = columns.map((c) => escapeCsvField(c.header)).join(",");
  const dataRows = records.map((record) =>
    columns.map((c) => escapeCsvField(c.accessor(record))).join(",")
  );

  // UTF-8 BOM (\uFEFF) is critical for Excel to correctly render Amharic characters
  const csvContent = "\uFEFF" + headerRow + "\n" + dataRows.join("\n");

  // Trigger browser download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `የአዲስ_መስመር_ማመልከቻዎች_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape a CSV field value: wrap in double quotes if it contains commas, quotes, or newlines
 */
function escapeCsvField(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert status enum to human-readable Amharic/English label
 */
function formatStatus(status) {
  const map = {
    PENDING_SURVEY_ASSIGNMENT: "ባለሙያ በመጠባበቅ ላይ",
    SURVEY_IN_PROGRESS: "የዳሰሳ ጥናት ላይ",
    PENDING_PAYMENT_APPROVAL: "ክፍያ በመጠባበቅ ላይ",
    PENDING_STORE_COLLECTION: "ዕቃ ከስቶር በመጠባበቅ ላይ",
    MATERIALS_COLLECTED: "ዕቃ ተወስዷል",
    INSTALLATION_IN_PROGRESS: "የመስመር ዝርጋታ ላይ",
    INSTALLATION_COMPLETED: "ዝርጋታ ተጠናቋል",
    FINAL_ACTIVATION_COMPLETED: "የነቃ ቋሚ ደንበኛ",
    SURVEY_REJECTED_UNFEASIBLE: "ዳሰሳ ውድቅ",
    APPLICATION_CANCELLED: "ማመልከቻ ተሰርዟል",
    RETURNED_FOR_REVISION: "ለክለሳ ተመልሷል",
  };
  return map[status] || status || "";
}
