import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import { CompanyProfileService } from "@/app/lib/companyProfileService";
import invGrnService from "@/app/lib/invGrnService";

const ethiopianDate = require("ethiopian-date");

/**
 * Loads an image from a URL or public path and converts it to a base64 Data URL.
 */
async function loadImageAsBase64(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Logo load failed:", e);
    return null;
  }
}

/**
 * Formats a Date to Ethiopian calendar string: "DD-MM-YYYY ዓ.ም"
 */
function formatEthiopianDate(date = new Date()) {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    const [eYear, eMonth, eDay] = ethiopianDate.toEthiopian(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    return `${String(eDay).padStart(2, "0")}-${String(eMonth).padStart(2, "0")}-${eYear} ዓ.ም`;
  } catch {
    return "";
  }
}

/**
 * Formats a Date to standard DD/MM/YYYY
 */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Formats currency amount
 */
function formatCurrency(amount) {
  return Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getUomString(item) {
  if (!item) return "Pcs";
  const uom = item.unitOfMeasure || item.uom;
  if (!uom) return "Pcs";
  if (typeof uom === "string") return uom;
  if (typeof uom === "object") {
    return uom.unitCode || uom.unitName || uom.unitNameAm || "Pcs";
  }
  return "Pcs";
}

/**
 * Generates an official, publication-quality Goods Received Note (GRN) PDF
 * with complete supplier info, receiving warehouse, inspection quantities,
 * GL journal voucher reference, and tripartite signature blocks.
 */
export async function generateGrnPdf(
  grnData,
  companyProfile = null,
  options = { preview: true }
) {
  if (!grnData) return;

  // 1. Ensure full details with line items are loaded
  let grn = grnData;
  if (!grn.lines || grn.lines.length === 0) {
    try {
      const full = await invGrnService.getById(grn.id);
      if (full) grn = full;
    } catch (e) {
      console.warn("Could not fetch full GRN details:", e);
    }
  }

  // 2. Ensure company profile is loaded
  let cp = companyProfile;
  if (!cp) {
    try {
      const cpService = new CompanyProfileService();
      cp = await cpService.getLatest();
    } catch (e) {
      console.warn("Could not fetch company profile:", e);
    }
  }

  const cpData = cp && typeof cp === "object" && "data" in cp && cp.data ? cp.data : cp;
  const companyNameAmh = (cpData?.companyNameAmh || cpData?.companyNameAmharic || cpData?.companyName || "የማርዳ ውኃና ፍሳሽ አገልግሎት ድርጅት").trim();
  const companyNameEng = (cpData?.companyName || "Marda Water Supply and Sewerage Service").trim();
  const officePhone = cpData?.officePhoneNumber || cpData?.phoneNumber || cpData?.mobilePhoneNumber || "025 775 3012 / 0915 000000";
  const locationAmh = cpData?.locationAmh || cpData?.address || cpData?.locationEng || "ጅግጅጋ / Jigjiga, Ethiopia";
  const poBox = cpData?.poBox ? `P.O.Box: ${cpData.poBox}` : "P.O.Box: 123";
  const email = cpData?.email || "procurement@marda-water.gov.et";
  const tinNumber = cpData?.tinNumber ? `TIN: ${cpData.tinNumber}` : "";

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const MARGIN = 36;
  const contentWidth = pageWidth - MARGIN * 2;

  try {
    doc.addFont("nyala-normal.ttf", "nyala", "bold");
    doc.addFont("nyala-normal.ttf", "nyala", "italic");
    doc.setFont("nyala", "normal");
  } catch {
    doc.setFont("helvetica", "normal");
  }

  // ── 1. Company Header with Logo & Contacts ─────────────────────
  let logoData = null;
  const logoCandidates = [
    cpData?.logoUrl,
    "/images/logo/logo.png",
    "/logo.png"
  ].filter(Boolean);

  for (const candidate of logoCandidates) {
    try {
      logoData = await loadImageAsBase64(candidate);
      if (logoData) break;
    } catch (_) {}
  }

  const logoW = 44, logoH = 44;
  if (logoData) {
    try {
      doc.addImage(logoData, "PNG", MARGIN, 24, logoW, logoH);
    } catch (e) {
      console.warn("Could not embed logo image:", e);
    }
  }

  const textStartX = logoData ? MARGIN + logoW + 12 : MARGIN;

  // Primary Ethiopian Organization Name
  doc.setFont("nyala", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(companyNameAmh, textStartX, 38);

  // English Name
  doc.setFont("nyala", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(companyNameEng, textStartX, 51);

  // Metadata / Contact Info (Phone, P.O. Box, TIN, Email)
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  const contacts = [
    `${locationAmh} • Tel: ${officePhone}`,
    poBox,
    tinNumber,
    email
  ].filter(Boolean).join(" • ");
  doc.text(contacts, textStartX, 63);

  // Decorative Header Divider
  doc.setDrawColor(13, 148, 136); // Teal-600 accent
  doc.setLineWidth(1.8);
  doc.line(MARGIN, 74, pageWidth - MARGIN, 74);

  // ── 2. Document Title Banner ──────────────────────────────────
  const titleY = 96;
  doc.setFont("nyala", "bold");
  doc.setFontSize(13);
  doc.setTextColor(13, 148, 136);
  doc.text("የዕቃ መረከቢያ ሰነድ (GOODS RECEIVED NOTE)", MARGIN, titleY);

  // Document status badge (right-aligned)
  const statusStr = grn.status || "DRAFT";
  const isConfirmed = statusStr === "CONFIRMED";
  const badgeWidth = 110;
  const badgeHeight = 18;
  const badgeX = pageWidth - MARGIN - badgeWidth;
  const badgeY = titleY - 13;

  if (isConfirmed) {
    doc.setFillColor(16, 185, 129); // Emerald-500
  } else {
    doc.setFillColor(245, 158, 11); // Amber-500
  }
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, "F");
  doc.setFont("nyala", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    isConfirmed ? "CONFIRMED (የተረጋገጠ)" : "DRAFT (ረቂቅ)",
    badgeX + badgeWidth / 2,
    badgeY + 12,
    { align: "center" }
  );

  // ── 3. Two-Column Metadata Box: Receipt Info & Vendor Info ────
  const metaBoxY = titleY + 12;
  const metaBoxW = contentWidth;
  const metaBoxH = 78;
  const colW = (metaBoxW - 12) / 2;

  // Box 1: Receipt Metadata
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.7);
  doc.roundedRect(MARGIN, metaBoxY, colW, metaBoxH, 4, 4, "FD");

  // Box 1 Header
  doc.setFillColor(241, 245, 249);
  doc.rect(MARGIN, metaBoxY, colW, 16, "F");
  doc.setFont("nyala", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("የመረከቢያ ዝርዝር / Receipt Metadata", MARGIN + 6, metaBoxY + 11);

  // Box 1 Fields
  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const m1Y = metaBoxY + 28;
  doc.text("GRN ቁጥር / GRN No:", MARGIN + 6, m1Y);
  doc.text("የተረከበበት ቀን / Date:", MARGIN + 6, m1Y + 12);
  doc.text("ተቀባይ መጋዘን / Store:", MARGIN + 6, m1Y + 24);
  doc.text("ተረካቢ ሠራተኛ / Received By:", MARGIN + 6, m1Y + 36);

  doc.setFont("nyala", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(grn.grnNumber || "—", MARGIN + 120, m1Y);
  const recDateGreg = formatDate(grn.receivedDate || grn.createdAt);
  const recDateEth = formatEthiopianDate(grn.receivedDate || grn.createdAt);
  doc.text(`${recDateGreg} (${recDateEth})`, MARGIN + 120, m1Y + 12);
  doc.text(grn.store?.storeName || `Store #${grn.storeId || "—"}`, MARGIN + 120, m1Y + 24);
  doc.text(grn.receivedBy || grn.createdBy || "Storekeeper", MARGIN + 120, m1Y + 36);

  // Box 2: Supplier & Source PO Info
  const col2X = MARGIN + colW + 12;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(col2X, metaBoxY, colW, metaBoxH, 4, 4, "FD");

  // Box 2 Header
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, metaBoxY, colW, 16, "F");
  doc.setFont("nyala", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("የአቅራቢና የትዕዛዝ መረጃ / Vendor & PO Sourcing", col2X + 6, metaBoxY + 11);

  // Box 2 Fields
  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("አቅራቢ / Supplier:", col2X + 6, m1Y);
  doc.text("የትዕዛዝ ቁጥር / PO Ref:", col2X + 6, m1Y + 12);
  doc.text("የአቅራቢ ሰነድ / Invoice #:", col2X + 6, m1Y + 24);
  doc.text("ፋይናንስ ጆርናል / JV Ref:", col2X + 6, m1Y + 36);

  doc.setFont("nyala", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(grn.supplier?.supplierName || "—", col2X + 116, m1Y);
  const poBadge = grn.purchaseOrder?.poNumber ? grn.purchaseOrder.poNumber : `PO #${grn.purchaseOrderId || "—"}`;
  doc.text(poBadge, col2X + 116, m1Y + 12);
  doc.text(grn.supplierInvoiceNumber || "—", col2X + 116, m1Y + 24);

  // Journal Entry Voucher Reference
  const jvNumber = grn.journalEntry?.entryNumber || grn.journalEntry?.referenceNumber;
  if (jvNumber) {
    doc.setTextColor(13, 148, 136); // Teal
    doc.text(jvNumber, col2X + 116, m1Y + 36);
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text(isConfirmed ? "Auto-posted in GL" : "Pending Confirmation", col2X + 116, m1Y + 36);
  }

  // ── 4. Itemized Receiving & Inspection Table ──────────────────
  const tableStartY = metaBoxY + metaBoxH + 12;

  const tableHeaders = [
    [
      { content: "#", styles: { halign: "center", fontStyle: "bold" } },
      { content: "የዕቃው አይነትና ዝርዝር\nItem Code & Description", styles: { halign: "left" } },
      { content: "መለኪያ\nUOM", styles: { halign: "center" } },
      { content: "የታዘዘ\nOrdered", styles: { halign: "right" } },
      { content: "የቀረበ\nDelivered", styles: { halign: "right" } },
      { content: "የተረከበው\nAccepted", styles: { halign: "right", fontStyle: "bold" } },
      { content: "ያልተረከበው\nRejected", styles: { halign: "right" } },
      { content: "የአንዱ ዋጋ\nUnit Cost", styles: { halign: "right" } },
      { content: "ጠቅላላ ዋጋ\nTotal (ETB)", styles: { halign: "right", fontStyle: "bold" } },
    ],
  ];

  let totalDeliveredQty = 0;
  let totalAcceptedQty = 0;
  let totalRejectedQty = 0;
  let calculatedGrandTotal = 0;

  const tableRows = (grn.lines || []).map((line, idx) => {
    const itemCode = line.item?.itemCode || "—";
    const itemName = line.item?.itemName || "Item";
    const itemNameAm = line.item?.itemNameAmharic ? `\n${line.item.itemNameAmharic}` : "";
    const batchInfo = line.batchNumber ? `\nBatch: ${line.batchNumber}` : "";

    const orderedQty = line.poLine?.orderedQuantity != null ? Number(line.poLine.orderedQuantity) : "—";
    const deliveredQty = Number(line.receivedQuantity || line.deliveredQuantity || line.acceptedQuantity || 0);
    const acceptedQty = Number(line.acceptedQuantity || 0);
    const rejectedQty = Number(line.rejectedQuantity || 0);
    const unitCost = Number(line.unitCost || 0);
    const lineTotal = Number(line.totalCost || (acceptedQty * unitCost));

    totalDeliveredQty += deliveredQty;
    totalAcceptedQty += acceptedQty;
    totalRejectedQty += rejectedQty;
    calculatedGrandTotal += lineTotal;

    return [
      { content: String(idx + 1), styles: { halign: "center" } },
      { content: `${itemCode} — ${itemName}${itemNameAm}${batchInfo}`, styles: { halign: "left" } },
      { content: getUomString(line.item), styles: { halign: "center" } },
      { content: typeof orderedQty === "number" ? orderedQty.toLocaleString() : orderedQty, styles: { halign: "right" } },
      { content: deliveredQty.toLocaleString(), styles: { halign: "right" } },
      { content: acceptedQty.toLocaleString(), styles: { halign: "right", fontStyle: "bold", textColor: [15, 23, 42] } },
      { content: rejectedQty > 0 ? rejectedQty.toLocaleString() : "0", styles: { halign: "right", textColor: rejectedQty > 0 ? [220, 38, 38] : [100, 116, 139] } },
      { content: formatCurrency(unitCost), styles: { halign: "right" } },
      { content: formatCurrency(lineTotal), styles: { halign: "right", fontStyle: "bold" } },
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN },
    head: tableHeaders,
    body: tableRows,
    theme: "striped",
    styles: {
      font: "nyala",
      fontSize: 7.5,
      cellPadding: 4,
      overflow: "linebreak",
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 20,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: "auto" },
      2: { cellWidth: 38 },
      3: { cellWidth: 46 },
      4: { cellWidth: 46 },
      5: { cellWidth: 50 },
      6: { cellWidth: 46 },
      7: { cellWidth: 54 },
      8: { cellWidth: 64 },
    },
  });

  // ── 5. Total Received Summary Section ────────────────────────
  const finalY = doc.lastAutoTable.finalY + 8;
  const summaryBoxW = 220;
  const summaryBoxX = pageWidth - MARGIN - summaryBoxW;

  const grandTotal = Number(grn.totalAmount) || calculatedGrandTotal;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.7);
  doc.roundedRect(summaryBoxX, finalY, summaryBoxW, 46, 4, 4, "FD");

  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("ጠቅላላ የተረከበ ብዛት / Total Accepted Units:", summaryBoxX + 8, finalY + 16);
  doc.setFont("nyala", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(totalAcceptedQty.toLocaleString(), summaryBoxX + summaryBoxW - 8, finalY + 16, { align: "right" });

  doc.setFont("nyala", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text("ጠቅላላ የተረከበ ዋጋ / Total Value (ETB):", summaryBoxX + 8, finalY + 34);
  doc.text(`${formatCurrency(grandTotal)} ETB`, summaryBoxX + summaryBoxW - 8, finalY + 34, { align: "right" });

  // ── 6. Tripartite Official Signature Blocks ────────────────────
  let sigY = Math.max(finalY + 56, doc.lastAutoTable.finalY + 60);
  if (sigY + 70 > pageHeight - 32) {
    doc.addPage();
    sigY = MARGIN + 20;
  }

  const sigW = (contentWidth - 16) / 3;
  const sigH = 64;

  const signatures = [
    {
      titleEn: "Delivered By (Vendor Rep)",
      titleAm: "አስረካቢ (የአቅራቢ ተወካይ)",
      name: grn.supplier?.contactPerson || grn.supplier?.supplierName || "—",
      date: recDateGreg,
      note: `Invoice/Ref: ${grn.supplierInvoiceNumber || "—"}`,
    },
    {
      titleEn: "Inspected & Received By",
      titleAm: "ተረካቢና መርማሪ (መጋዘን ኃላፊ)",
      name: grn.receivedBy || "Storekeeper",
      date: recDateGreg,
      note: `Store: ${grn.store?.storeName || "Main"}`,
    },
    {
      titleEn: "Verified By (Store Auditor)",
      titleAm: "ያረጋገጠው (ኦዲት/ተቆጣጣሪ)",
      name: "Authorized Signatory",
      date: recDateGreg,
      note: "Stock intake reconciled with GL",
    },
  ];

  signatures.forEach((sig, idx) => {
    const sX = MARGIN + idx * (sigW + 8);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.7);
    doc.roundedRect(sX, sigY, sigW, sigH, 4, 4, "FD");

    // Header bar inside card
    doc.setFillColor(241, 245, 249);
    doc.rect(sX, sigY, sigW, 16, "F");
    doc.setFont("nyala", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${sig.titleAm}`, sX + 6, sigY + 11);

    // Body
    doc.setFont("nyala", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text("ስም / Name:", sX + 6, sigY + 26);
    doc.text("ቀን / Date:", sX + 6, sigY + 36);

    doc.setFont("nyala", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(sig.name, sX + 44, sigY + 26);
    doc.setFont("nyala", "normal");
    doc.text(sig.date, sX + 44, sigY + 36);

    // Signature line
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text("ፊርማ / Signature: __________________", sX + 6, sigY + 54);
  });

  // ── 7. Running Footer on Every Page ───────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  const printTimestamp = new Date().toLocaleString();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageHeight - 26, pageWidth - MARGIN, pageHeight - 26);

    doc.setFont("nyala", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Printed via Wbill ERP • GRN No: ${grn.grnNumber || "—"} • ${printTimestamp}`,
      MARGIN,
      pageHeight - 14
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - MARGIN, pageHeight - 14, { align: "right" });
  }

  // ── 8. Output Result ──────────────────────────────────────────
  if (options.download) {
    doc.save(`GRN_${grn.grnNumber || "Receipt"}.pdf`);
  } else {
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(pdfUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      doc.save(`GRN_${grn.grnNumber || "Receipt"}.pdf`);
    }
  }

  return doc;
}
