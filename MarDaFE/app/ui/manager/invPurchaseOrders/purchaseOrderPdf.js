import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import { CompanyProfileService } from "@/app/lib/companyProfileService";
import workflowService from "@/app/lib/workflowService";
import invPurchaseOrderService from "@/app/lib/invPurchaseOrderService";

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
 * Formats a Date to standard DD/MM/YYYY HH:mm
 */
function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Generates an official, publication-quality Vendor Purchase Order PDF Note
 * with complete supplier info, delivery terms, itemized lines, and workflow signatures.
 */
export async function generatePurchaseOrderPdf(
  purchaseOrder,
  workflowInstance = null,
  companyProfile = null,
  options = { preview: true }
) {
  if (!purchaseOrder) return;

  // 1. Ensure full details with line items are loaded
  let po = purchaseOrder;
  if (!po.lines || po.lines.length === 0) {
    try {
      const full = await invPurchaseOrderService.getById(po.id);
      if (full) po = full;
    } catch (e) {
      console.warn("Could not fetch full PO details:", e);
    }
  }

  // 2. Ensure workflow instance & action history are loaded
  let wf = workflowInstance;
  if (!wf || !wf.actions) {
    try {
      wf = await workflowService.getInstanceByDocument("PURCHASE_ORDER", po.id);
    } catch (e) {
      console.warn("Could not fetch workflow instance:", e);
    }
  }

  // 3. Ensure company profile is loaded
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
  const companyNameAmh = (cpData?.companyNameAmh || cpData?.companyName || "የማርዳ ውኃና ፍሳሽ አገልግሎት ድርጅት").trim();
  const companyNameEng = (cpData?.companyName || "Marda Water Supply and Sewerage Service").trim();
  const officePhone = cpData?.officePhoneNumber || cpData?.mobilePhoneNumber || "025 775 3012 / 0915 000000";
  const locationAmh = cpData?.locationAmh || cpData?.locationEng || "ጅግጅጋ / Jigjiga, Ethiopia";
  const poBox = cpData?.poBox ? `P.O.Box: ${cpData.poBox}` : "P.O.Box: 123";
  const email = cpData?.email || "procurement@marda-water.gov.et";

  // Document setup: A4 Portrait
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth(); // 595.28 pt
  const pageHeight = doc.internal.pageSize.getHeight(); // 841.89 pt
  const MARGIN = 36; // 0.5 in

  try {
    doc.addFont("nyala-normal.ttf", "nyala", "bold");
    doc.addFont("nyala-normal.ttf", "nyala", "italic");
    doc.setFont("nyala", "normal");
  } catch {
    doc.setFont("helvetica", "normal");
  }

  // ── 1. Top Header: Logo & Company Branding ─────────────────────
  const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
  const logoW = 44, logoH = 44;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", MARGIN, 24, logoW, logoH);
    } catch (e) {
      console.warn("Logo rendering failed:", e);
    }
  }

  const textStartX = logoBase64 ? MARGIN + logoW + 12 : MARGIN;
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.setFontSize(14);
  doc.setFont("nyala", "bold");
  doc.text(companyNameAmh, textStartX, 38);

  doc.setFontSize(10);
  doc.setFont("nyala", "normal");
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(companyNameEng, textStartX, 51);

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`${locationAmh} • Tel: ${officePhone} • ${poBox} • ${email}`, textStartX, 63);

  // Decorative Indigo Header Divider
  doc.setDrawColor(79, 70, 229); // Indigo-600
  doc.setLineWidth(1.8);
  doc.line(MARGIN, 74, pageWidth - MARGIN, 74);

  // ── 2. Document Title & Status Badge ──────────────────────────
  const titleY = 96;
  doc.setFont("nyala", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("የግዢ ትዕዛዝ ቅጽ / PURCHASE ORDER NOTE", MARGIN, titleY);

  // Status Badge on Right
  const isApproved = po.status === "APPROVED_L2" || po.status === "SENT_TO_SUPPLIER" || po.status === "FULLY_RECEIVED" || po.status === "PARTIALLY_RECEIVED";
  const badgeText = po.status === "SENT_TO_SUPPLIER"
    ? "✓ ISSUED TO SUPPLIER"
    : isApproved
    ? "✓ FULLY APPROVED"
    : po.status?.replace(/_/g, " ");

  const badgeW = 120, badgeH = 18;
  const badgeX = pageWidth - MARGIN - badgeW;
  const badgeY = titleY - 14;

  if (isApproved) {
    doc.setFillColor(238, 242, 255); // Indigo-50
    doc.setDrawColor(99, 102, 241); // Indigo-500
    doc.setTextColor(67, 56, 202); // Indigo-700
  } else {
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.setDrawColor(156, 163, 175); // Gray-400
    doc.setTextColor(55, 65, 81); // Gray-700
  }
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "FD");
  doc.setFontSize(8.5);
  doc.setFont("nyala", "bold");
  doc.text(badgeText, badgeX + (badgeW / 2), badgeY + 12, { align: "center" });

  // ── 3. Vendor (Supplier) Box & Order Terms Box ─────────────────
  const metaBoxY = 108;
  const metaBoxW = pageWidth - 2 * MARGIN;
  const halfBoxW = (metaBoxW - 12) / 2;
  const metaBoxH = 80;

  // Box A: Vendor / Supplier Details (Left)
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, metaBoxY, halfBoxW, metaBoxH, 4, 4, "FD");

  const vX = MARGIN + 10;
  doc.setFont("nyala", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("የአቅራቢው መረጃ / VENDOR DETAILS", vX, metaBoxY + 16);

  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const supp = po.supplier || {};
  doc.text(`ስም / Vendor Name: ${supp.supplierName || "—"}`, vX, metaBoxY + 30);
  doc.text(`ኮድ / Vendor Code: ${supp.supplierCode || "—"}`, vX, metaBoxY + 43);
  doc.text(`ስልክ / Phone: ${supp.phone || supp.mobileNumber || "—"}`, vX, metaBoxY + 56);
  doc.text(`የግብር ቁጥር / TIN: ${supp.tinNumber || "—"}`, vX, metaBoxY + 69);

  // Box B: Order Information & Delivery (Right)
  const oX = MARGIN + halfBoxW + 12;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(oX, metaBoxY, halfBoxW, metaBoxH, 4, 4, "FD");

  const oContentX = oX + 10;
  doc.setFont("nyala", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("የትዕዛዝ መረጃ / ORDER SPECIFICATIONS", oContentX, metaBoxY + 16);

  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const ethOrderDate = formatEthiopianDate(po.orderDate || new Date());
  doc.text(`የትዕዛዝ ቁጥር / PO No: ${po.poNumber || "—"}`, oContentX, metaBoxY + 30);
  doc.text(`ቀን / Date: ${po.orderDate || "—"} (${ethOrderDate})`, oContentX, metaBoxY + 43);
  doc.text(`የሚረከብ መጋዘን / Store: ${po.store?.storeName || "—"}`, oContentX, metaBoxY + 56);

  const deliveryStr = po.expectedDeliveryDate ? `${po.expectedDeliveryDate}` : "Standard Schedule";
  const prRefStr = po.requisition?.requisitionNumber ? ` • Ref PR: ${po.requisition.requisitionNumber}` : "";
  doc.text(`የማስረከቢያ ቀን / Delivery: ${deliveryStr}${prRefStr}`, oContentX, metaBoxY + 69);

  // Sub-row for Payment and Delivery Terms
  const termsY = metaBoxY + metaBoxH + 6;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(MARGIN, termsY, metaBoxW, 20, 3, 3, "F");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const payTerms = po.paymentTerms ? `Payment Terms: ${po.paymentTerms}` : "Payment Terms: As per Contract Agreement";
  const delTerms = po.deliveryTerms ? `Delivery Terms: ${po.deliveryTerms}` : "Delivery: Delivered to Store (DDP)";
  doc.text(`${payTerms}   |   ${delTerms}`, MARGIN + 10, termsY + 13);

  // ── 4. Itemized Purchase Order Lines Table ─────────────────────
  const lines = po.lines || [];
  const tableRows = lines.map((l, idx) => {
    const itm = l.item || {};
    const itemLabel = `${itm.itemName || "Item"} (${itm.itemCode || "—"})`;
    const uom = itm.unitOfMeasure?.unitCode || itm.unitOfMeasure?.unitName || "PCS";
    const ordQty = Number(l.orderedQuantity || 0).toLocaleString();
    const unitPrice = Number(l.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const totalPrice = Number(l.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return [
      idx + 1,
      itemLabel,
      uom,
      ordQty,
      unitPrice,
      totalPrice
    ];
  });

  const subtotalFmt = Number(po.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  const vatRateVal = Number(po.vatRate || 15);
  const vatAmountFmt = Number(po.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  const grandTotalFmt = Number(po.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  autoTable(doc, {
    head: [[
      "#",
      "የዕቃው ዓይነትና መግለጫ / Item Description & Code",
      "መለኪያ\nUOM",
      "የትዕዛዝ ብዛት\nOrdered Qty",
      "የአንዱ ዋጋ\nUnit Price (ETB)",
      "ጠቅላላ ዋጋ\nTotal Price (ETB)"
    ]],
    body: tableRows,
    foot: [
      ["", "ድምር / Subtotal:", "", "", "", `ETB ${subtotalFmt}`],
      ["", `ተጨማሪ እሴት ታክስ / VAT (${vatRateVal}%):`, "", "", "", `ETB ${vatAmountFmt}`],
      ["", "ጠቅላላ ድምር ዋጋ / Grand Total (ETB):", "", "", "", `ETB ${grandTotalFmt}`]
    ],
    startY: termsY + 26,
    margin: { left: MARGIN, right: MARGIN, bottom: 45 },
    theme: "grid",
    styles: {
      font: "nyala",
      fontSize: 8.5,
      cellPadding: 4,
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
      textColor: [30, 41, 59]
    },
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center"
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252] // Slate-50
    },
    footStyles: {
      fillColor: [241, 245, 249], // Slate-100
      textColor: [15, 23, 42],
      fontStyle: "bold",
      fontSize: 9,
      lineColor: [203, 213, 225],
      lineWidth: 0.8
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 24 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 50 },
      3: { halign: "right", cellWidth: 70 },
      4: { halign: "right", cellWidth: 85 },
      5: { halign: "right", cellWidth: 95 }
    }
  });

  // ── 5. Terms, Conditions & Workflow Signatures ────────────────
  let finalY = doc.lastAutoTable?.finalY || 260;

  if (finalY + 130 > pageHeight - 40) {
    doc.addPage();
    finalY = 40;
  }

  // Legal Conditions Snippet
  doc.setFont("nyala", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "ማሳሰቢያ / TERMS & CONDITIONS:\n" +
    "1. ዕቃዎች በሙሉ በተገለጸው ጥራትና ዝርዝር መሠረት በተጠቀሰው መጋዘን መድረስ አለባቸው። (Goods must conform strictly to specs and delivered to designated store).\n" +
    "2. ከተፈቀደው የትዕዛዝ ቅጽ እና የዋጋ ስምምነት ውጪ የሚደረግ ለውጥ ተቀባይነት የለውም። (No price adjustment permitted without prior written authorization).\n" +
    "3. ክፍያ የሚፈጸመው የመጋዘን ገቢ ደረሰኝ (GRN) እና ሕጋዊ የሽያጭ ደረሰኝ ከቀረበ በኋላ ነው። (Payment processed upon GRN inspection & valid commercial tax invoice).",
    MARGIN,
    finalY + 14
  );

  const sigSectionY = finalY + 46;

  // Build Signature Cards
  const cards = [
    {
      roleTitle: "ያዘጋጀው / Prepared By",
      roleAm: "ግዥ ኦፊሰር",
      name: po.createdBy || "Purchasing Officer",
      date: formatDateTime(po.createdAt || po.orderDate),
      status: "PREPARED",
      comments: po.remarks || "Order created and prepared for review"
    }
  ];

  if (wf && wf.actions && wf.actions.length > 0) {
    wf.actions.forEach((act) => {
      cards.push({
        roleTitle: act.step?.stepName || "Authorized Reviewer",
        roleAm: act.step?.stepNameAm || "የሥራ ኃላፊ",
        name: act.actedBy,
        date: formatDateTime(act.actedAt),
        status: act.action,
        comments: act.comments
      });
    });
  } else {
    if (po.approvedByL1) {
      cards.push({
        roleTitle: "ያረጋገጠው / Verified By",
        roleAm: "የፋይናንስ ኃላፊ",
        name: po.approvedByL1,
        date: formatDateTime(po.approvedDateL1),
        status: "APPROVED_L1",
        comments: "Commercial terms and budget verified"
      });
    }
    if (po.approvedByL2) {
      cards.push({
        roleTitle: "ያጸደቀው / Approved By",
        roleAm: "ዋና ሥራ አስኪያጅ",
        name: po.approvedByL2,
        date: formatDateTime(po.approvedDateL2),
        status: "APPROVED_L2",
        comments: "Final order approved for vendor issuance"
      });
    }
  }

  // Draw signature cards horizontally
  const maxCards = Math.min(cards.length, 3);
  const cardGap = 8;
  const cardW = (metaBoxW - (cardGap * (maxCards - 1))) / maxCards;
  const cardH = 68;

  cards.slice(0, maxCards).forEach((c, idx) => {
    const cardX = MARGIN + idx * (cardW + cardGap);
    const cardY = sigSectionY;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.7);
    doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, "FD");

    // Header bar inside card
    doc.setFillColor(241, 245, 249);
    doc.rect(cardX, cardY, cardW, 18, "F");
    doc.setFont("nyala", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${c.roleTitle} (${c.roleAm})`, cardX + 6, cardY + 12);

    // Card Body details
    doc.setFont("nyala", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("ስም / Name:", cardX + 6, cardY + 28);
    doc.text("ቀን / Date:", cardX + 6, cardY + 39);
    doc.text("ማስታወሻ / Note:", cardX + 6, cardY + 50);

    doc.setFont("nyala", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(c.name || "—", cardX + 46, cardY + 28);
    doc.setFont("nyala", "normal");
    doc.text(c.date || "—", cardX + 46, cardY + 39);
    const shortComment = (c.comments || "").substring(0, 28);
    doc.text(shortComment || "—", cardX + 54, cardY + 50);

    // Signature line
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("ፊርማ / Signature: __________________", cardX + 6, cardY + 62);
  });

  // ── 6. Running Footer on Every Page ───────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  const printTimestamp = new Date().toLocaleString();

  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, pageHeight - 28, pageWidth - MARGIN, pageHeight - 28);

    doc.setFont("nyala", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Printed via Wbill ERP • PO No: ${po.poNumber} • ${printTimestamp}`,
      MARGIN,
      pageHeight - 16
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - MARGIN, pageHeight - 16, { align: "right" });
  }

  // ── 7. Output Result (Preview or Download) ─────────────────────
  if (options.download) {
    doc.save(`Purchase_Order_${po.poNumber || "Doc"}.pdf`);
  } else {
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(pdfUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      doc.save(`Purchase_Order_${po.poNumber || "Doc"}.pdf`);
    }
  }

  return doc;
}
