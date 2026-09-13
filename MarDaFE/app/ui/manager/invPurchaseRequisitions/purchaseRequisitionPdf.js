import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";
import { CompanyProfileService } from "@/app/lib/companyProfileService";
import workflowService from "@/app/lib/workflowService";
import invPurchaseRequisitionService from "@/app/lib/invPurchaseRequisitionService";

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
 * Generates an official Purchase Requisition PDF Note with complete line items
 * and multi-step approval workflow history.
 */
export async function generatePurchaseRequisitionPdf(
  requisition,
  workflowInstance = null,
  companyProfile = null,
  options = { preview: true }
) {
  if (!requisition) return;

  // 1. Ensure full details with line items are loaded
  let pr = requisition;
  if (!pr.lines || pr.lines.length === 0) {
    try {
      const full = await invPurchaseRequisitionService.getById(pr.id);
      if (full) pr = full;
    } catch (e) {
      console.warn("Could not fetch full PR details:", e);
    }
  }

  // 2. Ensure workflow instance & action history are loaded
  let wf = workflowInstance;
  if (!wf || !wf.actions) {
    try {
      wf = await workflowService.getInstanceByDocument("PURCHASE_REQUISITION", pr.id);
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
  const email = cpData?.email || "info@marda-water.gov.et";

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

  // ── 1. Top Header: Logo & Company Information ─────────────────
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

  // Decorative blue header divider
  doc.setDrawColor(37, 99, 235); // Blue-600
  doc.setLineWidth(1.8);
  doc.line(MARGIN, 74, pageWidth - MARGIN, 74);

  // ── 2. Document Title & Status Badge ──────────────────────────
  const titleY = 96;
  doc.setFont("nyala", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text("የግዢ መጠየቂያ ቅጽ / PURCHASE REQUISITION NOTE", MARGIN, titleY);

  // Status Badge on Right
  const isApproved = pr.status === "APPROVED" || pr.status === "APPROVED_L2" || pr.status === "CONVERTED_TO_PO";
  const badgeText = isApproved ? "✓ FULLY APPROVED" : pr.status?.replace(/_/g, " ");
  const badgeW = 110, badgeH = 18;
  const badgeX = pageWidth - MARGIN - badgeW;
  const badgeY = titleY - 14;

  if (isApproved) {
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.setDrawColor(16, 185, 129); // Emerald-500
    doc.setTextColor(4, 120, 87); // Emerald-700
  } else {
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(59, 130, 246); // Blue-500
    doc.setTextColor(29, 78, 216); // Blue-700
  }
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "FD");
  doc.setFontSize(9);
  doc.setFont("nyala", "bold");
  doc.text(badgeText, badgeX + (badgeW / 2), badgeY + 12, { align: "center" });

  // ── 3. Requisition Metadata Box ───────────────────────────────
  const metaBoxY = 108;
  const metaBoxW = pageWidth - 2 * MARGIN;
  const metaBoxH = 58;

  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.8);
  doc.roundedRect(MARGIN, metaBoxY, metaBoxW, metaBoxH, 4, 4, "FD");

  const col1X = MARGIN + 12;
  const col2X = MARGIN + (metaBoxW / 3) + 6;
  const col3X = MARGIN + ((metaBoxW / 3) * 2) + 6;

  // Row 1
  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("የመጠየቂያ ቁጥር / PR Number:", col1X, metaBoxY + 16);
  doc.text("የተጠየቀበት ቀን / Request Date:", col2X, metaBoxY + 16);
  doc.text("ጠቅላላ ግምት ዋጋ / Total Estimated:", col3X, metaBoxY + 16);

  doc.setFont("nyala", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(pr.requisitionNumber || "—", col1X, metaBoxY + 28);
  const reqDateStr = pr.requestedDate ? `${pr.requestedDate} (${formatEthiopianDate(pr.requestedDate)})` : "—";
  doc.text(reqDateStr, col2X, metaBoxY + 28);
  doc.setTextColor(37, 99, 235); // Blue
  doc.text(`ETB ${Number(pr.totalEstimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, col3X, metaBoxY + 28);

  // Row 2
  doc.setFont("nyala", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("ጠያቂ / Requested By:", col1X, metaBoxY + 42);
  doc.text("መጋዘን / Destination Store:", col2X, metaBoxY + 42);
  doc.text("የጸደቀበት ደረጃ / Approval Status:", col3X, metaBoxY + 42);

  doc.setFont("nyala", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text(pr.requestedBy || "—", col1X, metaBoxY + 53);
  doc.text(pr.store ? `${pr.store.storeName} (${pr.store.storeCode || ""})` : "—", col2X, metaBoxY + 53);
  doc.setTextColor(16, 185, 129); // Green
  doc.text(pr.status?.replace(/_/g, " ") || "APPROVED", col3X, metaBoxY + 53);

  // ── 4. Line Items Table (autoTable) ───────────────────────────
  const lines = pr.lines || [];
  const tableRows = lines.map((l, idx) => {
    const itemLabel = l.item?.itemNameAm
      ? `${l.item.itemNameAm} (${l.item.itemName || l.item.itemCode})`
      : l.item?.itemName || l.item?.itemCode || "Item";
    const uom = l.item?.unitOfMeasure?.unitName || l.item?.unitOfMeasure?.unitCode || "Pcs";
    const reqQty = Number(l.requestedQuantity || 0).toLocaleString();
    const appQty = Number(l.approvedQuantity ?? l.requestedQuantity ?? 0).toLocaleString();
    const unitCost = Number(l.estimatedUnitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const estTotal = Number(l.estimatedTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return [
      idx + 1,
      itemLabel,
      uom,
      reqQty,
      appQty,
      unitCost,
      estTotal
    ];
  });

  const totalFormatted = Number(pr.totalEstimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  autoTable(doc, {
    head: [[
      "#",
      "የዕቃው ዓይነትና ዝርዝር / Item Description",
      "መለኪያ\nUOM",
      "የተጠየቀ\nReq. Qty",
      "የተፈቀደ\nAppr. Qty",
      "የአንዱ ግምት ዋጋ\nUnit Cost (ETB)",
      "ጠቅላላ ግምት\nTotal (ETB)"
    ]],
    body: tableRows,
    foot: [[
      "",
      "ጠቅላላ ድምር / Total Estimated Amount:",
      "",
      "",
      "",
      "",
      `ETB ${totalFormatted}`
    ]],
    startY: metaBoxY + metaBoxH + 12,
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
      2: { halign: "center", cellWidth: 46 },
      3: { halign: "right", cellWidth: 54 },
      4: { halign: "right", cellWidth: 54 },
      5: { halign: "right", cellWidth: 72 },
      6: { halign: "right", cellWidth: 78 }
    }
  });

  // ── 5. Approval Workflow & Signature Section ───────────────────
  let finalY = doc.lastAutoTable?.finalY || 240;

  // Calculate required height for signatures
  const actions = (wf?.actions && wf.actions.length > 0)
    ? wf.actions.filter(a => a.action === "APPROVED" || a.action === "SKIPPED")
    : [];

  // Deduplicate by step id/order to show final approval per step
  const stepActionMap = new Map();
  actions.forEach(a => {
    const key = a.step?.id || a.step?.stepOrder || a.id;
    stepActionMap.set(key, a);
  });
  const uniqueApprovalSteps = Array.from(stepActionMap.values());

  // If no dynamic actions recorded, fallback to L1/L2
  const effectiveApprovals = uniqueApprovalSteps.length > 0
    ? uniqueApprovalSteps.map(a => ({
        stepName: a.step?.stepName || `Step ${a.step?.stepOrder || 1}`,
        approver: a.actedBy,
        role: a.step?.approverRoleCode || "Approver",
        date: a.actedAt,
        comments: a.comments
      }))
    : [
        {
          stepName: "Department / Branch Review",
          approver: pr.approvedByL1 || "Authorized Approver",
          role: "M_TECHNICAL_MANAGER",
          date: pr.approvedDateL1 || pr.requestedDate,
          comments: "Approved"
        },
        {
          stepName: "Finance & Purchase Approval",
          approver: pr.approvedByL2 || "Purchasing Officer",
          role: "M_PURCHASING_OFFICER",
          date: pr.approvedDateL2 || pr.requestedDate,
          comments: "Approved"
        }
      ];

  const totalCards = 1 + effectiveApprovals.length; // 1 requester + N approvers
  const cardHeight = 72;
  const cardsPerRow = totalCards <= 3 ? totalCards : (totalCards === 4 ? 2 : 3);
  const numRows = Math.ceil(totalCards / cardsPerRow);
  const requiredSigHeight = 26 + (numRows * (cardHeight + 10));

  // If not enough room on current page before footer, add page
  if (finalY + requiredSigHeight + 40 > pageHeight - 40) {
    doc.addPage();
    finalY = MARGIN + 10;
  } else {
    finalY += 14;
  }

  // Section Header
  doc.setFont("nyala", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("የማረጋገጫና የውሳኔ ሒደት / APPROVAL WORKFLOW & SIGNATURES", MARGIN, finalY);

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, finalY + 4, pageWidth - MARGIN, finalY + 4);

  // Render cards (Requester card + Approval cards)
  const allCards = [
    {
      title: "Requested By (ያዘጋጀው)",
      name: pr.requestedBy || "Requester",
      role: "Store / Department User",
      status: "SUBMITTED",
      date: pr.requestedDate || "—",
      comments: pr.remarks || "Requisition initiated"
    },
    ...effectiveApprovals.map(ea => ({
      title: ea.stepName,
      name: ea.approver,
      role: ea.role,
      status: "APPROVED ✓",
      date: formatDateTime(ea.date),
      comments: ea.comments || "Approved"
    }))
  ];

  const cardGap = 8;
  const cardWidth = (pageWidth - 2 * MARGIN - ((cardsPerRow - 1) * cardGap)) / cardsPerRow;
  let currentCardY = finalY + 12;

  allCards.forEach((c, idx) => {
    const colIndex = idx % cardsPerRow;
    const rowIndex = Math.floor(idx / cardsPerRow);
    const cardX = MARGIN + colIndex * (cardWidth + cardGap);
    const cardY = currentCardY + rowIndex * (cardHeight + 10);

    // Card Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.6);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 3, 3, "FD");

    // Header banner inside card
    doc.setFillColor(241, 245, 249);
    doc.rect(cardX, cardY, cardWidth, 16, "FD");
    doc.setFont("nyala", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(c.title, cardX + 6, cardY + 11);

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
    doc.text("ፊርማ / Signature: __________________", cardX + 6, cardY + 63);
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
      `Printed via Wbill ERP • PR No: ${pr.requisitionNumber} • ${printTimestamp}`,
      MARGIN,
      pageHeight - 16
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - MARGIN, pageHeight - 16, { align: "right" });
  }

  // ── 7. Output Result (Preview or Download) ─────────────────────
  if (options.download) {
    doc.save(`Purchase_Requisition_${pr.requisitionNumber || "Doc"}.pdf`);
  } else {
    // Open preview in new tab for browser printing & saving
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const win = window.open(pdfUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      // Fallback if browser popup blocker blocks new tab
      doc.save(`Purchase_Requisition_${pr.requisitionNumber || "Doc"}.pdf`);
    }
  }

  return doc;
}
