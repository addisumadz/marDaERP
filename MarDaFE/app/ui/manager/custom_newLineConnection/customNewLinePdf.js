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

// ─── 1. Field Survey Checklist (for Plumber to carry to customer house) ─────
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("nyala", "normal");

  // Title & Header
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("የውሃ አገልግሎት መስመር ዝርጋታ - የዳሰሳ ጥናት ማረጋገጫ ቅጽ", 105, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`ቀን: ${formatEthDate(new Date())}`, 195, 26, { align: "right" });

  // Customer Info Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, 182, 28, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  if (request) {
    doc.text(`የማመልከቻ ቁጥር: ${request.applicationNumber || "—"}`, 18, 37);
    doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"} ${request.customerFullNameEng ? `(${request.customerFullNameEng})` : ""}`, 18, 44);
    doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 51);

    doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 37);
    doc.text(`የቤት ቁጥር: ${request.houseNumber || "—"}`, 110, 44);
    doc.text(`የተመደበው ባለሙያ: ${request.surveyPlumber?.firstName || "—"} ${request.surveyPlumber?.lastName || ""}`, 110, 51);
  } else {
    doc.text("የደንበኛ ስም: ____________________________", 18, 38);
    doc.text("ስልክ ቁጥር: ____________________________", 18, 46);
    doc.text("ቀበሌ / የቤት ቁጥር: ______________________", 110, 38);
    doc.text("የተመደበ ባለሙያ: ________________________", 110, 46);
  }

  // Common materials table
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
    startY: 63,
    styles: { font: "nyala", fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [44, 82, 130], textColor: 255, fontStyle: "bold" },
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

  const finalY = doc.lastAutoTable?.finalY || 240;

  // Plumber Notes & Signature
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("የባለሙያ አስተያየት / ማስታወሻ: ____________________________________________________________________", 14, Math.min(finalY + 12, 270));
  doc.text("የባለሙያ ፊርማ: _________________________             የቴክኒክ ኃላፊ ፊርማ: _________________________", 14, Math.min(finalY + 22, 280));

  doc.save(`Survey_Checklist_${request?.applicationNumber || "Standard"}.pdf`);
}

// ─── 2. Cost Estimation & Payment Assessment Sheet (Old System Format) ───────
export function generateCostEstimationPdf(request) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("nyala", "normal");

  // Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("የአዲስ ውሃ መስመር ዝርጋታ የዋጋ ማጠቃለያ እና የክፍያ ማዘዣ ቅጽ", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`የማመልከቻ ቁጥር: ${request.applicationNumber || "—"}`, 14, 25);
  doc.text(`ቀን: ${formatEthDate(request.createdAt || new Date())}`, 195, 25, { align: "right" });

  // Customer & Location details box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, 182, 28, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"} (${request.customerFullNameEng || ""})`, 18, 35);
  doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 43);
  doc.text(`የመታወቂያ ቁጥር: ${request.nationalIdNumber || "—"}`, 18, 51);

  doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 35);
  doc.text(`የቤት ቁጥር: ${request.houseNumber || "—"}`, 110, 43);
  doc.text(`የደንበኛ ዓይነት: ${request.customerType?.customerTypeDescription || "የግል"}`, 110, 51);

  // Items Table
  const itemsData = (request.items || []).map((it, idx) => [
    idx + 1,
    it.itemNameAm || it.itemName,
    it.unitOfMeasure || "በቁጥር",
    Number(it.surveyedQuantity || 0).toFixed(1),
    Number(it.utilityQuantity || 0).toFixed(1),
    Number(it.utilityUnitPrice || 0).toFixed(2),
    Number(it.utilityTotalPrice || 0).toFixed(2),
    Number(it.outsideQuantity || 0).toFixed(1),
    Number(it.outsideUnitPrice || 0).toFixed(2),
    Number(it.outsideTotalPrice || 0).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 60,
    styles: { font: "nyala", fontSize: 8, cellPadding: 1.8 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, halign: "center" },
    head: [
      [
        { content: "ተ.ቁ", rowSpan: 2, styles: { valign: "middle" } },
        { content: "የእቃው ዓይነት", rowSpan: 2, styles: { valign: "middle" } },
        { content: "መለኪያ", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ብዛት", rowSpan: 2, styles: { valign: "middle" } },
        { content: "ከድርጅቱ የተገዛ", colSpan: 3, styles: { halign: "center" } },
        { content: "ከውጭ የተገዛ", colSpan: 3, styles: { halign: "center" } },
      ],
      ["ብዛት", "የአንዱ ዋጋ", "ጠቅላላ", "ብዛት", "የአንዱ ዋጋ", "ጠቅላላ"],
    ],
    body: itemsData,
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

  let currentY = doc.lastAutoTable?.finalY || 140;

  // Additional fees table if present
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
      startY: currentY + 6,
      styles: { font: "nyala", fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
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

    currentY = doc.lastAutoTable?.finalY || currentY + 30;
  }

  // Summary box
  doc.setDrawColor(187, 247, 208);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(105, currentY + 6, 91, 44, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text(`ከድርጅቱ የተገዙ እቃዎች:`, 110, currentY + 13);
  doc.text(`ETB ${Number(request.materialsUtilityTotal || 0).toFixed(2)}`, 190, currentY + 13, { align: "right" });

  doc.text(`የትራንስፖርት (25%):`, 110, currentY + 20);
  doc.text(`ETB ${Number(request.transportChargeAmount || 0).toFixed(2)}`, 190, currentY + 20, { align: "right" });

  doc.text(`የአገልግሎት ክፍያ (55%):`, 110, currentY + 27);
  doc.text(`ETB ${Number(request.serviceChargeAmount || 0).toFixed(2)}`, 190, currentY + 27, { align: "right" });

  doc.text(`ተጨማሪ ክፍያዎች:`, 110, currentY + 34);
  doc.text(`ETB ${Number(request.additionalFeesTotal || 0).toFixed(2)}`, 190, currentY + 34, { align: "right" });

  doc.setFontSize(11);
  doc.setFont("nyala", "bold");
  doc.text(`ጠቅላላ ክፍያ:`, 110, currentY + 44);
  doc.text(`ETB ${Number(request.totalPayableAmount || 0).toFixed(2)}`, 190, currentY + 44, { align: "right" });

  // Signatures
  doc.setFontSize(9);
  doc.setFont("nyala", "normal");
  doc.setTextColor(30, 41, 59);
  const sigY = Math.min(currentY + 58, 280);
  doc.text("ያዘጋጀው ባለሙያ: __________________", 14, sigY);
  doc.text("ያረጋገጠው የቴክኒክ ኃላፊ: ______________", 75, sigY);
  doc.text("የገቢዎች ኦፊሰር: __________________", 140, sigY);

  doc.save(`Cost_Estimation_${request.applicationNumber}.pdf`);
}
