import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import { CompanyProfileService } from "@/app/lib/companyProfileService";
import invTransferService from "@/app/lib/invTransferService";

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
 * Generates an official, publication-quality Store Transfer Note (STN) PDF
 * with source/destination warehouses, vehicle/carrier information,
 * workflow sign-offs, and tripartite/quad signature blocks.
 */
export async function generateTransferPdf(
  transferData,
  companyProfile = null,
  options = { preview: true }
) {
  if (!transferData) return;

  // 1. Ensure full details with line items are loaded
  let transfer = transferData;
  if (!transfer.lines || transfer.lines.length === 0) {
    try {
      const full = await invTransferService.getById(transfer.id);
      if (full) transfer = full;
    } catch (e) {
      console.warn("Could not fetch full transfer details:", e);
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
  const email = cpData?.email || "inventory@marda-water.gov.et";
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
  doc.setDrawColor(37, 99, 235); // Blue-600 accent for Transfers
  doc.setLineWidth(1.8);
  doc.line(MARGIN, 74, pageWidth - MARGIN, 74);

  // ── 2. Document Title Banner ──────────────────────────────────
  const titleY = 96;
  doc.setFont("nyala", "bold");
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text("የመጋዘን ዕቃ ማስተላለፊያ ሰነድ (STORE TRANSFER NOTE / WAYBILL)", MARGIN, titleY);

  // Document status badge (right-aligned)
  const statusStr = transfer.status || "DRAFT";
  const badgeWidth = 110;
  const badgeHeight = 18;
  const badgeX = pageWidth - MARGIN - badgeWidth;
  const badgeY = titleY - 13;

  if (statusStr === "RECEIVED") {
    doc.setFillColor(16, 185, 129); // Emerald-500
  } else if (statusStr === "IN_TRANSIT") {
    doc.setFillColor(59, 130, 246); // Blue-500
  } else if (statusStr === "APPROVED") {
    doc.setFillColor(13, 148, 136); // Teal-600
  } else if (statusStr === "SUBMITTED") {
    doc.setFillColor(245, 158, 11); // Amber-500
  } else if (statusStr === "CANCELLED") {
    doc.setFillColor(239, 68, 68); // Red-500
  } else {
    doc.setFillColor(148, 163, 184); // Slate-400
  }

  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, "F");
  doc.setFont("nyala", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    statusStr,
    badgeX + badgeWidth / 2,
    badgeY + 12,
    { align: "center" }
  );

  // ── 3. Two-Column Metadata Box: Warehouse Transfer & Logistics ────
  const metaBoxY = titleY + 12;
  const metaBoxW = contentWidth;
  const metaBoxH = 82;
  const colW = (metaBoxW - 12) / 2;

  // Box 1: Store & Transfer Details
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
  doc.text("የዝውውር መረጃ / Transfer Information", MARGIN + 6, metaBoxY + 11);

  // Box 1 Fields
  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const m1Y = metaBoxY + 27;
  doc.text("ማስተላለፊያ ቁጥር / STN No:", MARGIN + 6, m1Y);
  doc.text("የዝውውር ቀን / Date:", MARGIN + 6, m1Y + 12);
  doc.text("መነሻ መጋዘን / From Store:", MARGIN + 6, m1Y + 24);
  doc.text("መዳረሻ መጋዘን / To Store:", MARGIN + 6, m1Y + 36);
  doc.text("ጠያቂ / Requested By:", MARGIN + 6, m1Y + 48);

  doc.setFont("nyala", "bold");
  doc.setTextColor(15, 23, 42);
  const v1X = MARGIN + 120;
  doc.text(transfer.transferNumber || "—", v1X, m1Y);

  const tDate = transfer.transferDate || transfer.createdAt;
  const ethD = formatEthiopianDate(tDate);
  const greD = formatDate(tDate);
  doc.text(`${greD} ${ethD ? `(${ethD})` : ""}`, v1X, m1Y + 12);

  const fromStoreName = transfer.fromStore?.storeName || `Store #${transfer.fromStore?.id || "—"}`;
  const toStoreName = transfer.toStore?.storeName || `Store #${transfer.toStore?.id || "—"}`;
  doc.text(fromStoreName, v1X, m1Y + 24);
  doc.text(toStoreName, v1X, m1Y + 36);
  doc.text(transfer.requestedBy || transfer.createdBy || "—", v1X, m1Y + 48);

  // Box 2: Transport, Waybill & GL Voucher
  const col2X = MARGIN + colW + 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(col2X, metaBoxY, colW, metaBoxH, 4, 4, "FD");

  // Box 2 Header
  doc.setFillColor(241, 245, 249);
  doc.rect(col2X, metaBoxY, colW, 16, "F");
  doc.setFont("nyala", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("የትራንስፖርትና ሂሳብ መረጃ / Logistics & Accounting", col2X + 6, metaBoxY + 11);

  // Box 2 Fields
  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const m2Y = metaBoxY + 27;
  doc.text("ዌይቢል ቁጥር / Waybill No:", col2X + 6, m2Y);
  doc.text("ተሸከርካሪ ሰሌዳ / Vehicle Plate:", col2X + 6, m2Y + 12);
  doc.text("አሽከርካሪ / Driver Name:", col2X + 6, m2Y + 24);
  doc.text("የሂሳብ መዝገብ / GL Voucher:", col2X + 6, m2Y + 36);
  doc.text("ማስታወሻ / Purpose:", col2X + 6, m2Y + 48);

  doc.setFont("nyala", "bold");
  doc.setTextColor(15, 23, 42);
  const v2X = col2X + 115;
  doc.text(transfer.waybillNumber || "—", v2X, m2Y);
  doc.text(transfer.vehiclePlate || "—", v2X, m2Y + 12);
  doc.text(transfer.driverName || "—", v2X, m2Y + 24);

  if (transfer.journalEntry) {
    doc.setTextColor(37, 99, 235);
    doc.text(`JV #${transfer.journalEntry.entryNumber || transfer.journalEntry.id}`, v2X, m2Y + 36);
  } else {
    doc.setTextColor(148, 163, 184);
    doc.text("Pending Receipt Completion", v2X, m2Y + 36);
  }

  doc.setFont("nyala", "normal");
  doc.setTextColor(71, 85, 105);
  const remarksText = transfer.remarks || "Inter-store inventory transfer";
  doc.text(remarksText.length > 35 ? remarksText.substring(0, 35) + "..." : remarksText, v2X, m2Y + 48);

  // ── 4. Item Transfer Lines Table ─────────────────────────────
  const tableStartY = metaBoxY + metaBoxH + 12;

  const tableHead = [
    [
      { content: "#", styles: { halign: "center", fontStyle: "bold" } },
      { content: "የዕቃ ኮድ\nItem Code", styles: { halign: "left", fontStyle: "bold" } },
      { content: "የዕቃው ስምና ዝርዝር\nItem Name & Description", styles: { halign: "left", fontStyle: "bold" } },
      { content: "መለኪያ\nUOM", styles: { halign: "center", fontStyle: "bold" } },
      { content: "የተላከ ብዛት\nQty Shipped", styles: { halign: "right", fontStyle: "bold" } },
      { content: "የተረከበ ብዛት\nQty Received", styles: { halign: "right", fontStyle: "bold" } },
      { content: "የአንዱ ዋጋ\nUnit Cost (ETB)", styles: { halign: "right", fontStyle: "bold" } },
      { content: "ጠቅላላ ዋጋ\nTotal Cost (ETB)", styles: { halign: "right", fontStyle: "bold" } },
    ],
  ];

  let totalTransferValue = 0;
  let totalShippedUnits = 0;
  let totalReceivedUnits = 0;

  const lines = transfer.lines || [];
  const tableBody = lines.map((l, idx) => {
    const item = l.item || {};
    const qty = Number(l.quantity || 0);
    const recQty = l.receivedQuantity != null ? Number(l.receivedQuantity) : qty;
    const unitCost = Number(l.unitCost || item.lastPurchasePrice || 0);
    const lineTotal = Number(l.totalCost || qty * unitCost);

    totalTransferValue += lineTotal;
    totalShippedUnits += qty;
    if (transfer.status === "RECEIVED") {
      totalReceivedUnits += recQty;
    }

    return [
      { content: String(idx + 1), styles: { halign: "center" } },
      { content: item.itemCode || `ITM-${item.id || "—"}`, styles: { halign: "left", fontStyle: "bold" } },
      {
        content: `${item.itemName || "Item"}${item.itemNameAm ? ` (${item.itemNameAm})` : ""}`,
        styles: { halign: "left" },
      },
      { content: getUomString(item), styles: { halign: "center" } },
      { content: qty.toLocaleString(), styles: { halign: "right", fontStyle: "bold" } },
      {
        content: transfer.status === "RECEIVED" ? recQty.toLocaleString() : "—",
        styles: { halign: "right" },
      },
      { content: formatCurrency(unitCost), styles: { halign: "right" } },
      { content: formatCurrency(lineTotal), styles: { halign: "right", fontStyle: "bold" } },
    ];
  });

  if (tableBody.length === 0) {
    tableBody.push([
      { content: "1", styles: { halign: "center" } },
      { content: "—", styles: { halign: "left" } },
      { content: "No line items found", styles: { halign: "left" } },
      { content: "—", styles: { halign: "center" } },
      { content: "0", styles: { halign: "right" } },
      { content: "—", styles: { halign: "right" } },
      { content: "0.00", styles: { halign: "right" } },
      { content: "0.00", styles: { halign: "right" } },
    ]);
  }

  // Summary Row
  const summaryRow = [
    { content: "ጠቅላላ ድምር / GRAND TOTAL", colSpan: 4, styles: { halign: "right", fontStyle: "bold", fillColor: [241, 245, 249] } },
    { content: totalShippedUnits.toLocaleString(), styles: { halign: "right", fontStyle: "bold", fillColor: [241, 245, 249] } },
    { content: transfer.status === "RECEIVED" ? totalReceivedUnits.toLocaleString() : "—", styles: { halign: "right", fontStyle: "bold", fillColor: [241, 245, 249] } },
    { content: "—", styles: { halign: "right", fillColor: [241, 245, 249] } },
    { content: formatCurrency(totalTransferValue || transfer.totalAmount || 0), styles: { halign: "right", fontStyle: "bold", textColor: [37, 99, 235], fillColor: [241, 245, 249] } },
  ];

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: MARGIN, right: MARGIN },
    head: tableHead,
    body: [...tableBody, summaryRow],
    theme: "grid",
    styles: {
      font: "nyala",
      fontSize: 7.5,
      cellPadding: 4,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [30, 58, 138], // Navy-900 / Blue-900
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 55 },
      2: { cellWidth: 160 },
      3: { cellWidth: 35 },
      4: { cellWidth: 50 },
      5: { cellWidth: 50 },
      6: { cellWidth: 65 },
      7: { cellWidth: 70 },
    },
    didDrawPage: (data) => {
      // AutoTable handles pagination
    },
  });

  // ── 5. Authorization & Quad Signatures ──────────────────────
  let finalY = doc.lastAutoTable.finalY + 16;
  if (finalY + 95 > pageHeight - 40) {
    doc.addPage();
    finalY = MARGIN + 20;
  }

  doc.setFont("nyala", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("የማረጋገጫና ርክክብ ፊርማዎች / Authorization & Transfer Sign-Offs", MARGIN, finalY);

  const sigY = finalY + 8;
  const sigH = 68;
  const sigGap = 8;
  const sigColW = (contentWidth - sigGap * 3) / 4;

  const signatures = [
    {
      titleAm: "1. ያዘጋጀው / የጠየቀው",
      titleEn: "Requested By",
      name: transfer.requestedBy || transfer.createdBy || "—",
      date: formatDate(transfer.createdAt || transfer.transferDate),
      color: [248, 250, 252],
    },
    {
      titleAm: "2. ያፀደቀው ኃላፊ",
      titleEn: "Approved By",
      name: transfer.approvedBy || "—",
      date: transfer.approvedDate ? formatDate(transfer.approvedDate) : "—",
      color: [248, 250, 252],
    },
    {
      titleAm: "3. የላከው መጋዘንተኛ",
      titleEn: "Dispatched By",
      name: transfer.shippedBy || "—",
      date: transfer.shippedDate ? formatDate(transfer.shippedDate) : "—",
      color: [248, 250, 252],
    },
    {
      titleAm: "4. የተረከበው መጋዘንተኛ",
      titleEn: "Received By",
      name: transfer.receivedBy || "—",
      date: transfer.receivedDate ? formatDate(transfer.receivedDate) : "—",
      color: [248, 250, 252],
    },
  ];

  signatures.forEach((sig, idx) => {
    const sX = MARGIN + idx * (sigColW + sigGap);

    doc.setFillColor(sig.color[0], sig.color[1], sig.color[2]);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.6);
    doc.roundedRect(sX, sigY, sigColW, sigH, 3, 3, "FD");

    // Header strip
    doc.setFillColor(241, 245, 249);
    doc.rect(sX, sigY, sigColW, 14, "F");
    doc.setFont("nyala", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sig.titleAm} (${sig.titleEn})`, sX + 4, sigY + 10);

    // Name & Date
    doc.setFont("nyala", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("ስም / Name:", sX + 4, sigY + 24);
    doc.text("ቀን / Date:", sX + 4, sigY + 35);

    doc.setFont("nyala", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(sig.name.length > 15 ? sig.name.substring(0, 15) + "..." : sig.name, sX + 38, sigY + 24);
    doc.setFont("nyala", "normal");
    doc.text(sig.date, sX + 38, sigY + 35);

    // Signature line
    doc.setFontSize(6.2);
    doc.setTextColor(148, 163, 184);
    doc.text("ፊርማ / Signature: ________________", sX + 4, sigY + 54);
  });

  // ── 6. Running Footer on Every Page ───────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  const printTimestamp = new Date().toLocaleString();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageHeight - 24, pageWidth - MARGIN, pageHeight - 24);

    doc.setFont("nyala", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Printed via Wbill ERP • Transfer No: ${transfer.transferNumber || "—"} • ${printTimestamp}`,
      MARGIN,
      pageHeight - 12
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - MARGIN, pageHeight - 12, { align: "right" });
  }

  // ── 7. Output Result ──────────────────────────────────────────
  if (options.download) {
    doc.save(`STN_${transfer.transferNumber || "Transfer"}.pdf`);
  } else {
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(pdfUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      doc.save(`STN_${transfer.transferNumber || "Transfer"}.pdf`);
    }
  }

  return doc;
}
