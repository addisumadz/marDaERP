import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import customMaintenanceService from "../../../lib/customMaintenanceService";

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

// ─── 1. Field Inspection & Maintenance Checklist PDF ────────────────────────
export async function generateSurveyChecklistPdf(commonMaterials = [], request = null) {
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

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("nyala", "normal");

  // Title & Header
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("የውሃ ጥገና አገልግሎት - የዳሰሳ ጥናትና ምርመራ ማረጋገጫ ቅጽ", 105, 18, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`ቀን: ${formatEthDate(new Date())}`, 195, 26, { align: "right" });

  // Customer Info Box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 30, 182, 32, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  if (request) {
    doc.text(`የጥገና ቁጥር: ${request.requestNumber || "—"}`, 18, 36);
    doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"}`, 18, 43);
    doc.text(`መለያ/ሂሳብ ቁጥር: ${request.accountNumber || "—"}`, 18, 50);
    doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 57);

    const typeName = request.maintenanceType?.typeNameAm || request.maintenanceType?.typeName || "አጠቃላይ ጥገና";
    doc.text(`የጥገና ዓይነት: ${typeName}`, 110, 36);
    doc.text(`የቆጣሪ ቁጥር: ${request.meterNumber || "—"}`, 110, 43);
    doc.text(`ቀበሌ: ${request.kebele?.streetsName ? `ቀበሌ ${request.kebele.streetsName}` : (request.kebele?.name || "—")}`, 110, 50);
    doc.text(`የተመደበ ባለሙያ: ${request.surveyPlumber?.firstName || "—"} ${request.surveyPlumber?.lastName || ""}`, 110, 57);
  } else {
    doc.text("የደንበኛ ስም: ____________________________", 18, 38);
    doc.text("ስልክ ቁጥር: ____________________________", 18, 46);
    doc.text("የሂሳብ ቁጥር: ___________________________", 18, 54);
    doc.text("የጥገና ዓይነት: __________________________", 110, 38);
    doc.text("የተመደበ ባለሙያ: ________________________", 110, 46);
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
    startY: 66,
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

  const finalY = doc.lastAutoTable?.finalY || 235;

  // Plumber Notes & Signature
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text("ያጋጠመው ችግር/ማስታወሻ: " + (request?.problemDescription ? request.problemDescription : "________________________________________________________"), 14, Math.min(finalY + 12, 265));
  doc.text("የባለሙያ ፊርማ: _________________________             የቴክኒክ ኃላፊ ፊርማ: _________________________", 14, Math.min(finalY + 24, 280));

  doc.save(`Maintenance_Survey_${request?.requestNumber || "Standard"}.pdf`);
}

// ─── 2. Cost Estimation & Payment Assessment Sheet ──────────────────────────
export function generateCostEstimationPdf(request) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  doc.setFont("nyala", "normal");

  // Title
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text("የውሃ ጥገና አገልግሎት የዋጋ ማጠቃለያ እና የክፍያ ማዘዣ ቅጽ", 105, 18, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`የጥገና ቁጥር: ${request.requestNumber || "—"}`, 14, 25);
  doc.text(`ቀን: ${formatEthDate(request.createdAt || new Date())}`, 195, 25, { align: "right" });

  // Customer & Location details box
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 28, 182, 28, 2, 2, "FD");

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`የደንበኛ ስም: ${request.customerFullName || "—"}`, 18, 35);
  doc.text(`የሂሳብ ቁጥር: ${request.accountNumber || "—"}`, 18, 42);
  doc.text(`ስልክ ቁጥር: ${request.phoneNumber || "—"}`, 18, 49);

  const typeName = request.maintenanceType?.typeNameAm || request.maintenanceType?.typeName || "አጠቃላይ ጥገና";
  doc.text(`የጥገና ዓይነት: ${typeName}`, 110, 35);
  doc.text(`የቆጣሪ ቁጥር: ${request.meterNumber || "—"}`, 110, 42);
  doc.text(`ቅርንጫፍ: ${request.branch?.branchName || "—"}`, 110, 49);

  // Material items table
  const items = Array.isArray(request.items) ? request.items : [];
  const itemRows = items.map((it, idx) => [
    idx + 1,
    it.itemNameAm || it.itemName,
    it.unitOfMeasure || "በቁጥር",
    it.surveyedQuantity ? Number(it.surveyedQuantity).toFixed(2) : "0.00",
    it.utilityQuantity ? Number(it.utilityQuantity).toFixed(2) : "0.00",
    it.utilityUnitPrice ? Number(it.utilityUnitPrice).toFixed(2) : "0.00",
    it.utilityTotalPrice ? Number(it.utilityTotalPrice).toFixed(2) : "0.00",
    it.outsideQuantity ? Number(it.outsideQuantity).toFixed(2) : "0.00",
    it.outsideUnitPrice ? Number(it.outsideUnitPrice).toFixed(2) : "0.00",
  ]);

  let currentY = 60;
  if (itemRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      styles: { font: "nyala", fontSize: 8.5, cellPadding: 2 },
      headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold" },
      head: [
        ["ተ.ቁ", "የእቃው ዝርዝር", "መለኪያ", "የተገመተ", "ከድርጅቱ ብዛት", "የአንዱ ዋጋ", "ጠቅላላ ዋጋ", "ከውጭ ብዛት", "የውጭ ዋጋ"],
      ],
      body: itemRows,
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 8, halign: "center" },
        1: { cellWidth: 50 },
        2: { cellWidth: 14, halign: "center" },
        3: { cellWidth: 15, halign: "right" },
        4: { cellWidth: 18, halign: "right" },
        5: { cellWidth: 20, halign: "right" },
        6: { cellWidth: 22, halign: "right" },
        7: { cellWidth: 17, halign: "right" },
        8: { cellWidth: 18, halign: "right" },
      },
    });
    currentY = doc.lastAutoTable.finalY + 6;
  }

  // Summary Financials Table
  const utilityTotal = Number(request.materialsUtilityTotal || 0);
  const outsideTotal = Number(request.materialsOutsideTotal || 0);
  const serviceCharge = Number(request.serviceChargeAmount || 0);
  const transportCharge = Number(request.transportChargeAmount || 0);
  const addFeesTotal = Number(request.additionalFeesTotal || 0);
  const totalPayable = Number(request.totalPayableAmount || 0);

  autoTable(doc, {
    startY: currentY,
    styles: { font: "nyala", fontSize: 9, cellPadding: 2 },
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 130, halign: "right" },
      1: { cellWidth: 52, halign: "right", fontStyle: "bold" },
    },
    body: [
      ["1. ከድርጅቱ የሚቀርቡ ዕቃዎች ጠቅላላ ዋጋ:", `${utilityTotal.toFixed(2)} ብር`],
      ["2. ከውጭ በደንበኛ የሚገዙ ዕቃዎች ግምት:", `${outsideTotal.toFixed(2)} ብር`],
      ["3. የአገልግሎት ክፍያ (Service Charge 55%):", `${serviceCharge.toFixed(2)} ብር`],
      ["4. የትራንስፖርት ክፍያ (Transport Charge 25%):", `${transportCharge.toFixed(2)} ብር`],
      ["5. ተጨማሪ ክፍያዎች (Additional Fees):", `${addFeesTotal.toFixed(2)} ብር`],
      ["የክፍያ ድምር (ጠቅላላ የሚከፈል):", `${totalPayable.toFixed(2)} ብር`],
    ],
  });

  const finalY = doc.lastAutoTable?.finalY || 240;

  // Signatures
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("ያዘጋጀው ባለሙያ: _________________________         ያረጋገጠው ቴክኒክ ኃላፊ: _________________________", 14, Math.min(finalY + 16, 275));
  doc.text("ያፀደቀው የገቢ ሰብሳቢ: _______________________        የደንበኛ ፊርማ: _________________________________", 14, Math.min(finalY + 28, 285));

  doc.save(`Maintenance_Cost_Estimate_${request.requestNumber || "Standard"}.pdf`);
}
