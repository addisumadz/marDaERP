import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { CompanyProfileService } from "@/app/lib/companyProfileService";

let ethiopianDate;
try {
  ethiopianDate = require("ethiopian-date");
} catch (e) {
  ethiopianDate = null;
}

let cachedCompanyProfile = null;

async function resolveCompanyProfile(explicitProfile = null) {
  if (explicitProfile && typeof explicitProfile === "object") {
    return explicitProfile.data || explicitProfile;
  }
  if (cachedCompanyProfile) {
    return cachedCompanyProfile;
  }
  if (typeof window !== "undefined") {
    try {
      const s = new CompanyProfileService();
      const res = await s.getLatest();
      const profile = res?.data || res;
      if (profile && (profile.companyName || profile.companyNameAmh)) {
        cachedCompanyProfile = profile;
        return profile;
      }
    } catch (e) {
      console.warn("Could not fetch company profile for PDF:", e);
    }
  }
  return null;
}

function formatEthDate(date = new Date()) {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    if (ethiopianDate && ethiopianDate.toEthiopian) {
      const [eYear, eMonth, eDay] = ethiopianDate.toEthiopian(
        d.getFullYear(),
        d.getMonth() + 1,
        d.getDate()
      );
      return `${String(eDay).padStart(2, "0")}/${String(eMonth).padStart(2, "0")}/${eYear} ዓ.ም`;
    }
    return d.toLocaleDateString();
  } catch {
    return "";
  }
}

function isWaterMeterItem(item) {
  if (!item) return false;
  if (item.isWaterMeter === true || item.isWaterMeter === "true" || item.isWaterMeter === 1) return true;
  const name = String(item.itemNameAm || item.itemName || "").toLowerCase();
  return (
    name.includes("ቆጣሪ") ||
    name.includes("ውሃ ቆጣሪ") ||
    name.includes("water meter") ||
    name.includes("meter")
  );
}

function createMonochromeDoc() {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  try {
    const fontList = doc.getFontList();
    if (fontList && fontList.nyala && !fontList.nyala.includes("bold")) {
      doc.addFont("nyala-normal.ttf", "nyala", "bold");
    }
  } catch {
    // ignore
  }
  doc.setFont("nyala", "normal");
  return doc;
}

/**
 * Draws utility header from CompanyProfile:
 * companyNameAmh (large font) & companyName (small font) with separator line
 */
function drawCompanyHeader(doc, profile) {
  const companyNameAmh = (profile?.companyNameAmh || profile?.companyName || "የውሃ እና ፍሳሽ አገልግሎት ድርጅት").trim();
  const companyNameEng = (profile?.companyName || "").trim();

  // 1. Amharic Utility Name in large bold font
  doc.setFont("nyala", "bold");
  doc.setFontSize(14.5);
  doc.setTextColor(0, 0, 0);
  doc.text(companyNameAmh, 105, 11, { align: "center" });

  // 2. English Utility Name in smaller font
  if (companyNameEng && companyNameEng !== companyNameAmh) {
    doc.setFont("nyala", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text(companyNameEng, 105, 15.5, { align: "center" });
  }

  // Thin divider line below header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.25);
  doc.line(14, 17.5, 196, 17.5);
}

/**
 * Adds page footer across all pages with CompanyProfile info:
 * officePhoneNumber, mobilePhoneNumber, websiteAddress, companyMoto, and page numbers
 */
function addDocumentFooter(doc, profile) {
  const pageCount = doc.getNumberOfPages();
  const officePhone = (profile?.officePhoneNumber || profile?.officePhone || "").trim();
  const mobilePhone = (profile?.mobilePhoneNumber || profile?.mobilePhone || "").trim();
  const website = (profile?.websiteAddress || profile?.website || "").trim();
  const motto = (profile?.companyMoto || profile?.campanyMoto || "").trim();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Bottom divider line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 14, 196, pageHeight - 14);

    doc.setFont("nyala", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);

    // Left/Center: Contact numbers & website
    const contacts = [];
    if (officePhone) contacts.push(`ስልክ: ${officePhone}`);
    if (mobilePhone) contacts.push(`ሞባይል: ${mobilePhone}`);
    if (website) contacts.push(`ድረ-ገጽ: ${website}`);
    const contactLine = contacts.join("  |  ");

    if (contactLine) {
      doc.text(contactLine, 14, pageHeight - 9.5);
    }

    // Right: Page number
    doc.text(`ገጽ ${i} ከ ${pageCount}`, 196, pageHeight - 9.5, { align: "right" });

    // Center bottom: Company motto
    if (motto) {
      doc.setFont("nyala", "italic");
      doc.setFontSize(7);
      doc.text(`መሪ ቃል፡ "${motto}"`, 105, pageHeight - 5.5, { align: "center" });
    }
  }
}

// ─── 1. Field Inspection & Maintenance Checklist PDF (B&W Optimized) ────────
export async function generateSurveyChecklistPdf(commonMaterials = [], request = null, explicitCompanyProfile = null) {
  let materials = Array.isArray(commonMaterials) && commonMaterials.length > 0 ? [...commonMaterials] : [];
  if (materials.length === 0) {
    try {
      const mTypeId = request?.maintenanceType?.id || null;
      const catalog = await customMaintenanceService.getCommonMaterials(mTypeId);
      if (Array.isArray(catalog) && catalog.length > 0) {
        materials = catalog;
      }
    } catch (err) {
      console.warn("Could not fetch common materials for maintenance checklist PDF:", err);
    }
  }

  const profile = await resolveCompanyProfile(explicitCompanyProfile || request?.companyProfile);
  const doc = createMonochromeDoc();

  // Utility Company Header (Amharic large, English small)
  drawCompanyHeader(doc, profile);

  // Title & Header (Black & White high contrast)
  doc.setFont("nyala", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("የውሃ ጥገና አገልግሎት - የዳሰሳ ጥናትና ምርመራ ማረጋገጫ ቅጽ", 105, 23, { align: "center" });

  doc.setFont("nyala", "normal");
  doc.setFontSize(8);
  doc.text("Water Maintenance Service - Inspection & Material Verification Form", 105, 27, { align: "center" });

  doc.setFontSize(8.5);
  doc.text(`ቀን: ${formatEthDate(new Date())}`, 195, 32, { align: "right" });

  // Customer Info Box (Crisp black border, white fill)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 34, 182, 30, 1.5, 1.5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  if (request) {
    doc.text(`የጥገና ቁጥር: ${request.requestNumber || "—"}`, 18, 41);
    doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"}`, 18, 48);
    doc.text(`መለያ/ሂሳብ ቁጥር: ${request.accountNumber || "—"}`, 18, 55);
    doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 61);

    const typeName = request.maintenanceType?.typeNameAm || request.maintenanceType?.typeName || "አጠቃላይ ጥገና";
    doc.text(`የጥገና ዓይነት: ${typeName}`, 110, 41);
    doc.text(`የቆጣሪ ቁጥር: ${request.meterNumber || "—"}`, 110, 48);
    doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 55);
    doc.text(`የተመደበ ባለሙያ: ${request.surveyPlumber?.firstName || "—"} ${request.surveyPlumber?.lastName || ""}`, 110, 61);
  } else {
    doc.text("የደንበኛ ስም: ________________________________________", 18, 42);
    doc.text("ስልክ ቁጥር: ________________________________________", 18, 50);
    doc.text("የሂሳብ ቁጥር: _______________________________________", 18, 58);
    doc.text("የጥገና ዓይነት: ______________________________________", 110, 42);
    doc.text("የተመደበ ባለሙያ: ____________________________________", 110, 50);
  }

  // Common materials table
  const tableData = materials.map((m, idx) => [
    idx + 1,
    m.materialNameAm || m.materialName,
    m.unitOfMeasure || "በቁጥር",
    m.defaultUnitPrice ? Number(m.defaultUnitPrice).toFixed(2) : "0.00",
    "", // Blank surveyed qty for plumber to fill on site
    "", // Blank utility qty
    "", // Blank outside qty
    "", // Remarks
  ]);

  autoTable(doc, {
    startY: 68,
    styles: {
      font: "nyala",
      fontSize: 8.5,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.2,
      cellPadding: 1.8,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    head: [
      ["ተ.ቁ", "የእቃው ዓይነት", "መለኪያ", "የአንዱ ዋጋ", "የተገመተ ብዛት", "ከድርጅቱ", "ከውጭ", "ምርመራ"],
    ],
    body: tableData,
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 19 },
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 235;

  // Plumber Notes & Signature
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const noteY = Math.min(finalY + 10, 258);
  doc.text(
    "ያጋጠመው ችግር/ማስታወሻ: " +
      (request?.problemDescription ? request.problemDescription : "________________________________________________________"),
    14,
    noteY
  );
  doc.text(
    "የባለሙያ ፊርማ: _________________________             የቴክኒክ ኃላፊ ፊርማ: _________________________",
    14,
    noteY + 12
  );

  // Add document footer across all pages
  addDocumentFooter(doc, profile);

  doc.save(`Maintenance_Survey_${request?.requestNumber || "Standard"}.pdf`);
}

// ─── 2. Cost Estimation & Payment Assessment Sheet (B&W Optimized) ──────────
export async function generateCostEstimationPdf(request, explicitCompanyProfile = null) {
  const profile = await resolveCompanyProfile(explicitCompanyProfile || request?.companyProfile);
  const doc = createMonochromeDoc();

  // 1. Utility Company Header from CompanyProfile (Amharic large, English small)
  drawCompanyHeader(doc, profile);

  // 2. Title & Subtitle
  doc.setFont("nyala", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(0, 0, 0);
  doc.text("የውሃ ጥገና አገልግሎት የዋጋ ማጠቃለያ እና የክፍያ ማዘዣ ቅጽ", 105, 23, { align: "center" });

  doc.setFont("nyala", "normal");
  doc.setFontSize(8);
  doc.text("Water Maintenance Service - Cost Estimation & Payment Assessment Form", 105, 27, { align: "center" });

  doc.setFontSize(8.5);
  doc.text(`የጥገና ቁጥር: ${request.requestNumber || request.applicationNumber || "—"}`, 14, 32);
  doc.text(`ቀን: ${formatEthDate(request.createdAt || new Date())}`, 196, 32, { align: "right" });

  // Customer & Location details box
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 34, 182, 28, 1.5, 1.5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"}`, 18, 41);
  doc.text(`የሂሳብ ቁጥር: ${request.accountNumber || "—"}`, 18, 48);
  doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 55);

  const typeName = request.maintenanceType?.typeNameAm || request.maintenanceType?.typeName || "አጠቃላይ ጥገና";
  doc.text(`የጥገና ዓይነት: ${typeName}`, 110, 41);
  doc.text(`የቆጣሪ ቁጥር: ${request.meterNumber || "—"}`, 110, 48);
  doc.text(`ቅርንጫፍ: ${request.branch?.branchName || "—"}`, 110, 55);

  // ─── Material Items Table (Include ONLY items used / have value of quantity) ───
  const rawItems = Array.isArray(request.items) ? request.items : [];
  const activeItems = rawItems.filter((it) => {
    const sQty = Number(it.surveyedQuantity || it.quantity || 0);
    const uQty = Number(it.utilityQuantity || 0);
    const oQty = Number(it.outsideQuantity || 0);
    const uTot = Number(it.utilityTotalPrice || 0);
    const oTot = Number(it.outsideTotalPrice || 0);
    return sQty > 0 || uQty > 0 || oQty > 0 || uTot > 0 || oTot > 0;
  });

  const displayItems = activeItems.length > 0 ? activeItems : [];
  let hasMeterFromStore = false;

  let totalSurveyedQty = 0;
  let totalUtilQty = 0;
  let totalUtilAmount = 0;
  let totalOutQty = 0;
  let totalOutAmount = 0;

  const itemRows = displayItems.map((it, idx) => {
    const isMeter = isWaterMeterItem(it);
    const uQty = Number(it.utilityQuantity || 0);
    if (isMeter && uQty > 0) {
      hasMeterFromStore = true;
    }
    const itemNameDisplay = isMeter && uQty > 0
      ? `${it.itemNameAm || it.itemName} *(የውሃ ቆጣሪ)*`
      : (it.itemNameAm || it.itemName);

    const sQty = Number(it.surveyedQuantity || it.quantity || (uQty + Number(it.outsideQuantity || 0)) || 0);
    const uPrice = Number(it.utilityUnitPrice || 0);
    const uTotal = Number(it.utilityTotalPrice || (uQty * uPrice));
    const oQty = Number(it.outsideQuantity || 0);
    const oPrice = Number(it.outsideUnitPrice || 0);
    const oTotal = Number(it.outsideTotalPrice || (oQty * oPrice));

    totalSurveyedQty += sQty;
    totalUtilQty += uQty;
    totalUtilAmount += uTotal;
    totalOutQty += oQty;
    totalOutAmount += oTotal;

    return [
      idx + 1,
      itemNameDisplay,
      it.unitOfMeasure || "በቁጥር",
      sQty.toFixed(1),
      uQty.toFixed(1),
      uPrice.toFixed(2),
      uTotal.toFixed(2),
      oQty.toFixed(1),
      oPrice.toFixed(2),
      oTotal.toFixed(2),
    ];
  });

  autoTable(doc, {
    startY: 65,
    styles: {
      font: "nyala",
      fontSize: 8,
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.18,
      cellPadding: 1.6,
    },
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    head: [
      [
        { content: "ተ.ቁ", rowSpan: 2, styles: { valign: "middle" } },
        { content: "የእቃው ዝርዝር", rowSpan: 2, styles: { valign: "middle" } },
        { content: "መለኪያ", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ብዛት", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ከድርጅቱ የቀረበ (መጋዘን)", colSpan: 3, styles: { halign: "center" } },
        { content: "ከውጭ በደንበኛ (ገበያ)", colSpan: 3, styles: { halign: "center" } },
      ],
      ["ብዛት", "የአንዱ ዋጋ", "ጠቅላላ", "ብዛት", "የአንዱ ዋጋ", "ጠቅላላ"],
    ],
    body: itemRows.length > 0 ? itemRows : [
      [
        { content: "-", styles: { halign: "center" } },
        { content: "ምንም ጥቅም ላይ የዋለ እቃ አልተመዘገበም (No materials used)", colSpan: 9, styles: { halign: "center" } },
      ],
    ],
    // Total Sums Row: Bold with increased font size (10pt) for utility and outside totals
    foot: itemRows.length > 0 ? [
      [
        { content: "ጠቅላላ ድምር (Total):", colSpan: 4, styles: { halign: "right", fontStyle: "bold", fontSize: 9 } },
        { content: totalUtilQty.toFixed(1), styles: { halign: "right", fontStyle: "bold", fontSize: 9 } },
        { content: "-", styles: { halign: "center", fontStyle: "bold" } },
        { content: totalUtilAmount.toFixed(2), styles: { halign: "right", fontStyle: "bold", fontSize: 10 } },
        { content: totalOutQty.toFixed(1), styles: { halign: "right", fontStyle: "bold", fontSize: 9 } },
        { content: "-", styles: { halign: "center", fontStyle: "bold" } },
        { content: totalOutAmount.toFixed(2), styles: { halign: "right", fontStyle: "bold", fontSize: 10 } },
      ],
    ] : undefined,
    footStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      font: "nyala",
      fontStyle: "bold",
      lineColor: [0, 0, 0],
      lineWidth: 0.25,
    },
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 46 },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 14, halign: "right" },
      5: { cellWidth: 18, halign: "right" },
      6: { cellWidth: 20, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 14, halign: "right" },
      8: { cellWidth: 18, halign: "right" },
      9: { cellWidth: 20, halign: "right", fontStyle: "bold" },
    },
  });

  let currentY = doc.lastAutoTable?.finalY || 135;

  // Additional Fees Table (if present)
  if (request.additionalFees && request.additionalFees.length > 0) {
    let totalFeeQty = 0;
    let totalFeeAmount = 0;

    const feeData = request.additionalFees.map((f, i) => {
      const qty = Number(f.quantity || 1);
      const price = Number(f.unitPrice || 0);
      const total = Number(f.totalPrice || (qty * price));
      totalFeeQty += qty;
      totalFeeAmount += total;
      return [
        i + 1,
        f.feeNameAm || f.feeName,
        f.unitName || "ብር",
        qty.toFixed(1),
        price.toFixed(2),
        total.toFixed(2),
      ];
    });

    autoTable(doc, {
      startY: currentY + 5,
      styles: {
        font: "nyala",
        fontSize: 8,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.18,
        cellPadding: 1.5,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      head: [["ተ.ቁ", "ተጨማሪ ክፍያ ዓይነት", "መለኪያ", "ብዛት/መጠን", "የአንዱ ዋጋ", "ጠቅላላ ዋጋ"]],
      body: feeData,
      // Total Sums Row for Additional Fees: Bold with increased font size (10pt)
      foot: [
        [
          { content: "ተጨማሪ ክፍያዎች ድምር (Total Fees):", colSpan: 5, styles: { halign: "right", fontStyle: "bold", fontSize: 9 } },
          { content: totalFeeAmount.toFixed(2), styles: { halign: "right", fontStyle: "bold", fontSize: 10 } },
        ],
      ],
      footStyles: {
        fillColor: [235, 235, 235],
        textColor: [0, 0, 0],
        font: "nyala",
        fontStyle: "bold",
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
      },
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 65 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
        5: { cellWidth: 31, halign: "right", fontStyle: "bold" },
      },
    });

    currentY = doc.lastAutoTable?.finalY || currentY + 28;
  }

  // Check if we have enough room on page for summary & signatures (requires ~65mm)
  if (currentY > 210) {
    doc.addPage();
    currentY = 15;
  }

  const boxStartY = currentY + 5;
  const isPaid = Boolean(
    request.receiptNumber ||
    request.paymentReceiptNumber ||
    request.paymentStatus === "PAID" ||
    request.isPaymentApproved
  );

  // Left Box: Payment Details / Notice (Crisp B&W border)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, boxStartY, 86, 50, 1.5, 1.5, "FD");

  // Left Box Header
  doc.setFillColor(240, 240, 240);
  doc.rect(14, boxStartY, 86, 7, "FD");
  doc.setFont("nyala", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(isPaid ? "የክፍያ ማረጋገጫ ዝርዝር (Payment Details)" : "የክፍያ ማስታወሻ (Notice)", 18, boxStartY + 5);

  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  if (isPaid) {
    const rcNum = request.receiptNumber || request.paymentReceiptNumber || "—";
    const refNum = request.referenceNumber || request.bankReference || "—";
    const pDate = formatEthDate(request.paymentDate || request.updatedAt || new Date());
    doc.text(`የደረሰኝ ቁጥር: ${rcNum}`, 18, boxStartY + 14);
    doc.text(`የማመሳከሪያ ቁጥር: ${refNum}`, 18, boxStartY + 21);
    doc.text(`የተከፈለበት ቀን: ${pDate}`, 18, boxStartY + 28);
    doc.text(`የክፍያ ሁኔታ: የተከፈለ እና የጸደቀ (PAID)`, 18, boxStartY + 35);
    if (request.paymentRemarks || request.remarks) {
      doc.text(`ማስታወሻ: ${String(request.paymentRemarks || request.remarks).slice(0, 38)}`, 18, boxStartY + 42);
    }
  } else {
    doc.text("• የጥገና ክፍያው በገቢዎች ኦፊሰር በኩል በደረሰኝ ይፈጸማል", 18, boxStartY + 15);
    doc.text("• ክፍያው ሲጠናቀቅ የጥገና ስራው በይፋ ይረጋገጣል", 18, boxStartY + 22);
    doc.text("• ለጥያቄዎ የጥገና ቁጥሩን ይጠቀሙ", 18, boxStartY + 29);
    doc.text("• ዋጋው ለተወሰነ ጊዜ ብቻ የሚያገለግል ነው", 18, boxStartY + 36);
  }

  // Right Box: Payment Assessment Breakdown (Clean B&W Invoice Style)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(104, boxStartY, 92, 50, 1.5, 1.5, "FD");

  // Right Box Header
  doc.setFillColor(240, 240, 240);
  doc.rect(104, boxStartY, 92, 7, "FD");
  doc.setFont("nyala", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("የክፍያ ማጠቃለያ (Payment Assessment)", 108, boxStartY + 5);

  const utilityMat = Number(request.materialsUtilityTotal ?? request.utilityTotal ?? 0).toFixed(2);
  const outsideMat = Number(request.materialsOutsideTotal ?? request.outsideTotal ?? 0).toFixed(2);
  const transAmount = Number(request.transportChargeAmount ?? request.transportCharge ?? 0).toFixed(2);
  const servAmount = Number(request.serviceChargeAmount ?? request.serviceCharge ?? 0).toFixed(2);
  const feesAmount = Number(request.additionalFeesTotal ?? request.feesTotal ?? 0).toFixed(2);
  const totalAmount = Number(request.totalPayableAmount ?? request.totalPayable ?? 0).toFixed(2);

  // Row 1: Utility Materials
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("ከድርጅቱ የቀረቡ ዕቃዎች:", 108, boxStartY + 12.5);
  doc.setFont("nyala", "bold");
  doc.setFontSize(10.5);
  doc.text(`${utilityMat}`, 192, boxStartY + 12.5, { align: "right" });

  // Row 2: Transport Charge (25%)
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.text(
    hasMeterFromStore ? "የትራንስፖርት ክፍያ (25%) *:" : "የትራንስፖርት ክፍያ (25%):",
    108,
    boxStartY + 18.5
  );
  doc.setFont("nyala", "bold");
  doc.setFontSize(10.5);
  doc.text(`${transAmount}`, 192, boxStartY + 18.5, { align: "right" });

  // Row 3: Service Charge (55%)
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.text(
    hasMeterFromStore ? "የአገልግሎት ክፍያ (55%) *:" : "የአገልግሎት ክፍያ (55%):",
    108,
    boxStartY + 24.5
  );
  doc.setFont("nyala", "bold");
  doc.setFontSize(10.5);
  doc.text(`${servAmount}`, 192, boxStartY + 24.5, { align: "right" });

  // Row 4: Additional Fees
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.text("ተጨማሪ ክፍያዎች:", 108, boxStartY + 30.5);
  doc.setFont("nyala", "bold");
  doc.setFontSize(10.5);
  doc.text(`${feesAmount}`, 192, boxStartY + 30.5, { align: "right" });

  // Thin black separator line above total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(106, boxStartY + 35, 194, boxStartY + 35);

  // TOTAL PAYABLE ROW (Bold, Clear Amharic Text with Accounting Double-Underline)
  doc.setFont("nyala", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("ጠቅላላ የሚከፈል:", 108, boxStartY + 41.5);
  doc.setFontSize(12.5);
  doc.text(`${totalAmount}`, 192, boxStartY + 41.5, { align: "right" });

  // Accounting double underline under total
  doc.setLineWidth(0.25);
  doc.line(106, boxStartY + 43.5, 194, boxStartY + 43.5);
  doc.line(106, boxStartY + 44.5, 194, boxStartY + 44.5);

  // Water meter store exemption footnote if applicable
  if (hasMeterFromStore) {
    doc.setFont("nyala", "normal");
    doc.setFontSize(7);
    doc.setTextColor(0, 0, 0);
    doc.text("*(የውሃ ቆጣሪ ከመጋዘን ስለሆነ ከ 25% ትራንስፖርትና 55% አገልግሎት ነፃ ነው)*", 108, boxStartY + 48);
  }

  // Official Signatures Section
  const sigY = Math.min(boxStartY + 62, 275);
  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  doc.text("ያዘጋጀው ባለሙያ: _____________________", 14, sigY);
  doc.text("ያረጋገጠው የቴክኒክ ኃላፊ: _________________", 76, sigY);
  doc.text("ያፀደቀው የገቢ ሰብሳቢ: _________________", 138, sigY);

  // 4. Add CompanyProfile Footer across all pages
  addDocumentFooter(doc, profile);

  doc.save(`Maintenance_Cost_Estimate_${request.requestNumber || request.applicationNumber || "Document"}.pdf`);
}
