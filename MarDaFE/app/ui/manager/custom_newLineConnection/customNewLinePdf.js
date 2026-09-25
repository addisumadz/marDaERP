import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";

let ethiopianDate;
try {
  ethiopianDate = require("ethiopian-date");
} catch (e) {
  ethiopianDate = null;
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

// ─── 1. Field Survey Checklist (Monochrome / B&W Optimized) ────────────────
export async function generateSurveyChecklistPdf(commonMaterials = [], request = null) {
  let materials = Array.isArray(commonMaterials) && commonMaterials.length > 0 ? [...commonMaterials] : [];
  if (materials.length === 0) {
    try {
      const catalog = await customNewLineConnectionService.getCommonMaterials();
      if (Array.isArray(catalog) && catalog.length > 0) {
        materials = catalog;
      }
    } catch (err) {
      console.warn("Could not fetch common materials for checklist PDF:", err);
    }
  }

  const doc = createMonochromeDoc();

  // Document Title Header
  doc.setFont("nyala", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("የአዲስ ውሃ መስመር ዝርጋታ - የዳሰሳ ጥናት ማረጋገጫ ቅጽ", 105, 16, { align: "center" });

  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.text("New Water Connection - Field Survey & Material Verification Form", 105, 21, { align: "center" });

  doc.setFontSize(9);
  doc.text(`ቀን: ${formatEthDate(new Date())}`, 195, 26, { align: "right" });

  // Customer Information Box (Crisp B&W border)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 28, 182, 26, 1.5, 1.5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  if (request) {
    doc.text(`የማመልከቻ ቁጥር: ${request.applicationNumber || "—"}`, 18, 35);
    doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"} ${request.customerFullNameEng ? `(${request.customerFullNameEng})` : ""}`, 18, 42);
    doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 49);

    doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 35);
    doc.text(`የቤት ቁጥር: ${request.houseNumber || "—"}`, 110, 42);
    doc.text(`የተመደበው ባለሙያ: ${request.surveyPlumber?.firstName || "—"} ${request.surveyPlumber?.lastName || ""}`, 110, 49);
  } else {
    doc.text("የደንበኛ ስም: ________________________________________", 18, 36);
    doc.text("ስልክ ቁጥር: ________________________________________", 18, 46);
    doc.text("ቀበሌ / የቤት ቁጥር: __________________________________", 110, 36);
    doc.text("የተመደበ ባለሙያ: ____________________________________", 110, 46);
  }

  // Common Materials Table (Optimized for sharp black-and-white print)
  const tableData = materials.map((m, idx) => [
    idx + 1,
    m.materialNameAm || m.materialName,
    m.unitOfMeasure || "በቁጥር",
    m.defaultUnitPrice ? Number(m.defaultUnitPrice).toFixed(2) : "0.00",
    "", // Blank surveyed qty for plumber to fill by hand
    "", // Blank utility qty
    "", // Blank outside qty
    "", // Remarks
  ]);

  autoTable(doc, {
    startY: 58,
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
      ["ተ.ቁ", "የእቃው ዓይነት", "መለኪያ", "የአንዱ ዋጋ", "የተገመተ ብዛት", "ከድርጅቱ", "ከውጭ", "ምርመራ / ማስታወሻ"],
    ],
    body: tableData,
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 54 },
      2: { cellWidth: 17, halign: "center" },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 18, halign: "center" },
      7: { cellWidth: 21 },
    },
  });

  const finalY = doc.lastAutoTable?.finalY || 230;

  // Plumber Notes & Signature Section
  const noteY = Math.min(finalY + 10, 260);
  doc.setFont("nyala", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("የባለሙያ አስተያየት / ማስታወሻ: ____________________________________________________________________", 14, noteY);
  doc.text("የባለሙያ ፊርማ: _________________________             የቴክኒክ ኃላፊ ፊርማ: _________________________", 14, noteY + 12);

  doc.save(`Survey_Checklist_${request?.applicationNumber || "Standard"}.pdf`);
}

// ─── 2. Cost Estimation & Payment Assessment Sheet (B&W Optimized) ───────────
export function generateCostEstimationPdf(request) {
  const doc = createMonochromeDoc();

  // Document Title & Subtitle (Black & White high contrast)
  doc.setFont("nyala", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("የአዲስ ውሃ መስመር ዝርጋታ የዋጋ ማጠቃለያ እና የክፍያ ማዘዣ ቅጽ", 105, 15, { align: "center" });

  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("New Line Connection - Cost Estimation & Payment Assessment Form", 105, 20, { align: "center" });

  // Top Metadata
  doc.setFontSize(9);
  doc.text(`የማመልከቻ ቁጥር: ${request.applicationNumber || "—"}`, 14, 26);
  doc.text(`ቀን: ${formatEthDate(request.createdAt || new Date())}`, 196, 26, { align: "right" });

  // Customer & Location details box (Crisp black border, white fill)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 29, 182, 26, 1.5, 1.5, "FD");

  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"} ${request.customerFullNameEng ? `(${request.customerFullNameEng})` : ""}`, 18, 36);
  doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 43);
  doc.text(`የመታወቂያ ቁጥር: ${request.nationalIdNumber || "—"}`, 18, 50);

  doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 36);
  doc.text(`የቤት ቁጥር: ${request.houseNumber || "—"}`, 110, 43);
  doc.text(`የደንበኛ ዓይነት: ${request.customerType?.customerTypeDescription || "የግል"}`, 110, 50);

  // ─── Items Table (Include ONLY items used / have value of quantity) ───
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
  const itemsData = displayItems.map((it, idx) => {
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
    startY: 58,
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
        { content: "የእቃው ዓይነት", rowSpan: 2, styles: { valign: "middle" } },
        { content: "መለኪያ", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ብዛት", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ከድርጅቱ የተገዛ (መጋዘን)", colSpan: 3, styles: { halign: "center" } },
        { content: "ከውጭ የተገዛ (ገበያ)", colSpan: 3, styles: { halign: "center" } },
      ],
      ["ብዛት", "የአንዱ ዋጋ", "ጠቅላላ", "ብዛት", "የአንዱ ዋጋ", "ጠቅላላ"],
    ],
    body: itemsData.length > 0 ? itemsData : [
      [
        { content: "-", styles: { halign: "center" } },
        { content: "ምንም ጥቅም ላይ የዋለ እቃ አልተመዘገበም (No materials used)", colSpan: 9, styles: { halign: "center" } },
      ],
    ],
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 46 },
      2: { cellWidth: 14, halign: "center" },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 14, halign: "right" },
      5: { cellWidth: 18, halign: "right" },
      6: { cellWidth: 20, halign: "right" },
      7: { cellWidth: 14, halign: "right" },
      8: { cellWidth: 18, halign: "right" },
      9: { cellWidth: 20, halign: "right" },
    },
  });

  let currentY = doc.lastAutoTable?.finalY || 135;

  // Additional Fees Table (if present)
  if (request.additionalFees && request.additionalFees.length > 0) {
    const feeData = request.additionalFees.map((f, i) => [
      i + 1,
      f.feeNameAm || f.feeName,
      f.unitName || "ብር",
      Number(f.quantity || 1).toFixed(1),
      Number(f.unitPrice || 0).toFixed(2),
      Number(f.totalPrice || 0).toFixed(2),
    ]);

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
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 65 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 25, halign: "right" },
        4: { cellWidth: 28, halign: "right" },
        5: { cellWidth: 31, halign: "right" },
      },
    });

    currentY = doc.lastAutoTable?.finalY || currentY + 28;
  }

  // Check if we have enough room on page for summary & signatures (requires ~65mm)
  if (currentY > 215) {
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

  // Left Box: Payment Confirmation / Survey Notes (Crisp B&W border)
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
    doc.text("• ክፍያው በገቢዎች ኦፊሰር በኩል በደረሰኝ ይፈጸማል", 18, boxStartY + 15);
    doc.text("• ደንበኛው ክፍያውን ከፈጸመ በኋላ ደረሰኙን", 18, boxStartY + 22);
    doc.text("  በማያያዝ የውሃ መስመር ዝርጋታው ይከናወናል", 18, boxStartY + 29);
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

  // Breakdown lines in high-contrast black
  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  const utilityMat = Number(request.materialsUtilityTotal ?? request.utilityTotal ?? 0).toFixed(2);
  const transAmount = Number(request.transportChargeAmount ?? request.transportCharge ?? 0).toFixed(2);
  const servAmount = Number(request.serviceChargeAmount ?? request.serviceCharge ?? 0).toFixed(2);
  const feesAmount = Number(request.additionalFeesTotal ?? request.feesTotal ?? 0).toFixed(2);
  const totalAmount = Number(request.totalPayableAmount ?? request.totalPayable ?? 0).toFixed(2);

  doc.text("ከድርጅቱ የተገዙ እቃዎች:", 108, boxStartY + 13);
  doc.text(`ETB ${utilityMat}`, 192, boxStartY + 13, { align: "right" });

  doc.text(
    hasMeterFromStore ? "የትራንስፖርት ክፍያ (25%) *:" : "የትራንስፖርት ክፍያ (25%):",
    108,
    boxStartY + 19
  );
  doc.text(`ETB ${transAmount}`, 192, boxStartY + 19, { align: "right" });

  doc.text("የአገልግሎት ክፍያ (55%):", 108, boxStartY + 25);
  doc.text(`ETB ${servAmount}`, 192, boxStartY + 25, { align: "right" });

  doc.text("ተጨማሪ ክፍያዎች:", 108, boxStartY + 31);
  doc.text(`ETB ${feesAmount}`, 192, boxStartY + 31, { align: "right" });

  // Thin black separator line above total
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(106, boxStartY + 36, 194, boxStartY + 36);

  // TOTAL PAYABLE ROW (Bold, Clear Amharic Text with Accounting Double-Underline)
  doc.setFont("nyala", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text("ጠቅላላ ክፍያ:", 108, boxStartY + 43);
  doc.text(`ETB ${totalAmount}`, 192, boxStartY + 43, { align: "right" });

  // Accounting double underline under total
  doc.setLineWidth(0.2);
  doc.line(106, boxStartY + 45.5, 194, boxStartY + 45.5);
  doc.line(106, boxStartY + 46.5, 194, boxStartY + 46.5);

  // Water meter store exemption footnote if applicable
  if (hasMeterFromStore) {
    doc.setFont("nyala", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text("*(የውሃ ቆጣሪ ከመጋዘን ስለሆነ ከ 25% ትራንስፖርት ክፍያ ነፃ ተደርጓል)*", 108, boxStartY + 49.5);
  }

  // Official Signatures Section (Clean, sharp B&W print layout)
  const sigY = Math.min(boxStartY + 62, 280);
  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);

  doc.text("ያዘጋጀው ባለሙያ: _____________________", 14, sigY);
  doc.text("ያረጋገጠው የቴክኒክ ኃላፊ: _________________", 76, sigY);
  doc.text("ያፀደቀው የገቢዎች ኦፊሰር: _________________", 138, sigY);

  doc.save(`Cost_Estimation_${request.applicationNumber || "Document"}.pdf`);
}
