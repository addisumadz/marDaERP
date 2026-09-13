import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "@/app/fonts/nyala-normal";

const ethiopianDate = require("ethiopian-date");

/**
 * Loads an image from a URL or public path and converts it to a base64 Data URL.
 */
async function loadImageAsBase64(path) {
  try {
    const res = await fetch(path);
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
 * Formats a Date to Ethiopian calendar string: "DD-MM-YYYY EC"
 */
function formatEthiopianDate(date = new Date()) {
  try {
    const [eYear, eMonth, eDay] = ethiopianDate.toEthiopian(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate()
    );
    return `${String(eDay).padStart(2, "0")}-${String(eMonth).padStart(2, "0")}-${eYear} EC`;
  } catch (e) {
    return "";
  }
}

/**
 * Formats a Date to Gregorian timestamp string: "DD/MM/YYYY HH.MM"
 */
function formatGregorianTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

/**
 * Builds the shared header, table, bottom summary boxes, and multi-page footer.
 */
async function generateReadingListPdf({
  reportTitleAmh,
  fileName,
  headers,
  rows,
  foot,
  columnStyles,
  tableFontSize = 9.5,
  companyProfile,
  filterContext,
  preparerName,
  toast,
  selectedMonthYear,
}) {
  try {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    doc.setFont("nyala", "normal");
    doc.setTextColor(0, 0, 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 28;

    // Extract fields dynamically from CompanyProfile entity
    const payload = companyProfile && typeof companyProfile === "object" && "data" in companyProfile && companyProfile.data && typeof companyProfile.data === "object"
      ? companyProfile.data
      : companyProfile;

    const companyName = (payload?.companyName || "Woldia Town Water and Sewerage Service").trim();
    const companyNameAmh = (payload?.companyNameAmh || payload?.companyName || "የወልድያ ከተማ ውሃ እና ፍሳሽ አገልግሎት").trim();
    const officePhone = payload?.officePhoneNumber ? payload.officePhoneNumber.trim() : "058 - 3311956";
    const mobilePhone = payload?.mobilePhoneNumber ? payload.mobilePhoneNumber.trim() : "0913919965/0913575971";
    const email = payload?.email ? payload.email.trim() : "info@wolwss.com";
    const website = payload?.websiteAddress ? payload.websiteAddress.trim() : "www.wolwss.com";
    const faxNumber = payload?.faxNumber ? payload.faxNumber.trim() : (payload?.poBox ? `P.O.Box: ${payload.poBox}` : "-");
    const locationAmh = (payload?.locationAmh || "ወልድያ, ኢትዮጵያ").trim();
    const locationEng = (payload?.locationEng || "Woldiya- Ethiopia").trim();
    const companyMoto = (payload?.companyMoto || payload?.campanyMoto || "Water is Life").trim();

    const now = new Date();
    const ethDateStr = formatEthiopianDate(now);
    const gregTimestamp = formatGregorianTimestamp(now);

    // ── 1. Top Header ──
    const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
    const logoW = 40, logoH = 40;
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, "PNG", MARGIN, 22, logoW, logoH);
      } catch (err) {
        console.warn("Could not add logo to PDF:", err);
      }
    }

    // Top-left text: Company Name in Amharic on Line 1, English on Line 2 (WLWSSS removed)
    const textStartX = logoBase64 ? MARGIN + logoW + 10 : MARGIN;
    doc.setFont("nyala", "normal");
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(13);
    doc.text(companyNameAmh, textStartX, 38);

    doc.setFontSize(10);
    doc.text(companyName, textStartX, 53);

    // Top-right text: Report Title with Selected Month in brackets, Date underneath
    const monthBracket = selectedMonthYear ? ` (${selectedMonthYear})` : "";
    const fullRightTitle = `${reportTitleAmh}${monthBracket}`;

    // Dynamically balance title size if month string is long
    let titleFontSize = 13;
    doc.setFontSize(titleFontSize);
    while (doc.getTextWidth(fullRightTitle) > 280 && titleFontSize > 9.5) {
      titleFontSize -= 0.5;
      doc.setFontSize(titleFontSize);
    }
    doc.text(fullRightTitle, pageWidth - MARGIN, 38, { align: "right" });

    doc.setFontSize(10);
    doc.text(`ቀን / Date :  ${ethDateStr}`, pageWidth - MARGIN, 53, { align: "right" });

    // Header divider line (Blue accent line)
    doc.setDrawColor(25, 118, 210);
    doc.setLineWidth(1.4);
    doc.line(MARGIN, 68, pageWidth - MARGIN, 68);

    // ── 2. Data Table with autoTable ──
    // Font sizes are enlarged for readability and rows use soft "light black" [45, 45, 45]
    autoTable(doc, {
      head: [headers],
      body: rows,
      foot: foot ? [foot] : undefined,
      startY: 76,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN, bottom: 56 },
      tableWidth: pageWidth - 2 * MARGIN,
      styles: {
        font: "nyala",
        fontStyle: "normal",
        fontSize: tableFontSize,
        cellPadding: { top: 4.2, bottom: 4.2, left: 3, right: 3 },
        overflow: "linebreak",
        lineColor: [210, 210, 210],
        lineWidth: 0.38,
        textColor: [45, 45, 45], // Light black for odd rows
        valign: "middle",
      },
      headStyles: {
        font: "nyala",
        fontStyle: "normal",
        fontSize: tableFontSize + 0.8,
        fillColor: [228, 228, 228], // Clean grey matching reference screenshot
        textColor: [0, 0, 0],
        lineColor: [160, 160, 160],
        lineWidth: 0.5,
        halign: "center",
        valign: "middle",
        cellPadding: { top: 4.5, bottom: 4.5, left: 2.5, right: 2.5 },
      },
      footStyles: {
        font: "nyala",
        fontStyle: "normal",
        fontSize: Math.round(tableFontSize * 1.3 * 10) / 10, // Increased by 30% for table footer
        fillColor: [238, 238, 238],
        textColor: [0, 0, 0],
        lineColor: [160, 160, 160],
        lineWidth: 0.5,
        cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
      },
      alternateRowStyles: {
        fillColor: [246, 246, 246], // Light black / soft subtle grey tint for even rows (zebra striping)
        textColor: [35, 35, 35],
      },
      columnStyles: columnStyles || {},
    });

    // ── 3. Bottom Summary Boxes (Prepared By & Filter Criterias - on top of footer) ──
    const requiredBoxHeight = 94; // Enlarged to comfortably accommodate 4 rows with 30% larger text
    let finalY = doc.lastAutoTable?.finalY || 100;

    // Check if remaining page height is sufficient for summary boxes before the running footer
    if (finalY + requiredBoxHeight + 15 > pageHeight - 56) {
      doc.addPage();
      finalY = 35;
    }

    const boxY = finalY + 12;
    const box1Width = 220;
    const boxSpacing = 10;
    const box2Width = (pageWidth - 2 * MARGIN) - box1Width - boxSpacing;
    const box2X = MARGIN + box1Width + boxSpacing;

    // Draw Left Box: "Prepared By"
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);

    // Header banner for Box 1
    doc.setFillColor(238, 238, 238);
    doc.rect(MARGIN, boxY, box1Width, 22, "FD");
    doc.setFont("nyala", "normal");
    doc.setFontSize(12.5); // Increased by ~30% (was 9.5)
    doc.setTextColor(0, 0, 0);
    doc.text("Prepared By", MARGIN + 8, boxY + 15);

    // Box 1 Body
    doc.rect(MARGIN, boxY + 22, box1Width, requiredBoxHeight - 22, "S");
    doc.setFontSize(11.5); // Increased by ~30% (was 8.8)
    doc.setTextColor(45, 45, 45); // Light black
    doc.text("Name", MARGIN + 8, boxY + 45);
    doc.text(preparerName || "System User", MARGIN + 55, boxY + 45);
    doc.text("Date", MARGIN + 8, boxY + 73);
    doc.text(ethDateStr, MARGIN + 55, boxY + 73);

    // Draw Right Box: "Filter Criterias"
    // Header banner for Box 2
    doc.setFillColor(238, 238, 238);
    doc.rect(box2X, boxY, box2Width, 22, "FD");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12.5); // Increased by ~30% (was 9.5)
    doc.text("Filter Criterias", box2X + 8, boxY + 15);

    // Box 2 Body
    doc.rect(box2X, boxY + 22, box2Width, requiredBoxHeight - 22, "S");
    doc.setFontSize(11.2); // Increased by ~30% (was 8.5)
    doc.setTextColor(45, 45, 45); // Light black

    const fcCol1X = box2X + 8;
    const fcCol2X = box2X + (box2Width / 2) + 5;

    const fKifya = filterContext?.kifyaWer || selectedMonthYear || "-";
    const fBranch = filterContext?.branchName || "ሁሉም";
    const fKebele = filterContext?.kebeleName || "ሁሉም";
    const fKetena = filterContext?.ketenaName || "ሁሉም";
    const fType = filterContext?.customerTypeName || "ሁሉም";
    const fReader = filterContext?.readerName || "ሁሉም";
    const fCount = rows.length;

    const fTotalConsumption = filterContext?.totalConsumption != null
      ? (typeof filterContext.totalConsumption === "number"
          ? filterContext.totalConsumption.toLocaleString("en-US")
          : filterContext.totalConsumption)
      : null;

    // Col 1: Location & Period filters
    doc.text(`ክፍያ ወር: ${fKifya}`, fcCol1X, boxY + 39);
    doc.text(`ቅርንጫፍ: ${fBranch}`, fcCol1X, boxY + 55);
    doc.text(`ቀበሌ: ${fKebele}`, fcCol1X, boxY + 71);
    doc.text(`ቀጠና: ${fKetena}`, fcCol1X, boxY + 87);

    // Col 2: Customer Type & Reader in separate lines, plus Totals
    doc.text(`ደንበኛ ዓይነት: ${fType}`, fcCol2X, boxY + 39);
    doc.text(`አንባቢ: ${fReader}`, fcCol2X, boxY + 55);
    if (fTotalConsumption != null) {
      doc.text(`ጠቅላላ ፍጆታ: ${fTotalConsumption}`, fcCol2X, boxY + 71);
      doc.text(`ጠቅላላ ብዛት: ${fCount}`, fcCol2X, boxY + 87);
    } else {
      doc.text(`ጠቅላላ ብዛት: ${fCount}`, fcCol2X, boxY + 71);
    }

    // ── 4. Running Footer on Every Page using CompanyProfile fields ──
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      const footerLineY = pageHeight - 40;
      doc.setFont("nyala", "normal");
      doc.setFontSize(10.5); // Increased by ~30% (was 8)
      doc.setTextColor(60, 60, 60);

      // Top line of footer: Generated On ... BiT Water Bill system ... Page X of Y
      doc.text(`Generated On ${gregTimestamp}`, MARGIN, footerLineY - 5);
      doc.text("Report Generated by BiT Water Bill system", pageWidth / 2, footerLineY - 5, { align: "center" });
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - MARGIN, footerLineY - 5, { align: "right" });

      // Thin divider line
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.4);
      doc.line(MARGIN, footerLineY, pageWidth - MARGIN, footerLineY);

      // Bottom contact info row using CompanyProfile data (contacts, addresses, motto)
      const contactY1 = footerLineY + 11;
      const contactY2 = footerLineY + 23;
      doc.setFontSize(9.5); // Increased by ~30% (was 7.2)
      doc.setTextColor(45, 45, 45); // Light black

      // Left: Phones (officePhoneNumber & mobilePhoneNumber)
      doc.text(`Tel: ${officePhone}`, MARGIN, contactY1);
      doc.text(`Mob: ${mobilePhone}`, MARGIN, contactY2);

      // Middle-left: Fax (faxNumber/poBox) & Website (websiteAddress)
      doc.text(`Fax: ${faxNumber}`, MARGIN + 130, contactY1);
      doc.text(`Web: ${website}`, MARGIN + 130, contactY2);

      // Middle-right: Email (email) & Motto (companyMoto)
      doc.text(`Email: ${email}`, MARGIN + 265, contactY1);
      doc.text(companyMoto, MARGIN + 265, contactY2);

      // Right: Address / Locations (locationAmh & locationEng)
      doc.text(locationAmh, pageWidth - MARGIN, contactY1, { align: "right" });
      doc.text(locationEng, pageWidth - MARGIN, contactY2, { align: "right" });
    }

    doc.save(fileName);
    if (toast) toast.success("PDF file exported successfully!");
  } catch (err) {
    console.error("PDF generation failed:", err);
    if (toast) toast.error("Failed to export PDF file: " + (err.message || ""));
  }
}

/**
 * Export Registered Readings (Table 1) to PDF
 */
export async function exportReadingsToPDF({
  data,
  selectedKifyaWerMonth,
  selectedKifyaWerYear,
  companyProfile,
  filterContext,
  customerByAccount,
  preparerName,
  toast,
  filenamePrefix = "Filtered_Readings",
}) {
  if (!Array.isArray(data) || data.length === 0) {
    if (toast) toast.info("No rows to export for the selected period.");
    return;
  }

  // 7 columns (ክፍያ ወር column removed and moved to header)
  const headers = [
    "ተ.ቁ",
    "የደንበኞች ስም ዝርዝር",
    "አካውንት ቁጥር",
    "ስልክ ቁጥር",
    "ነባር ንባብ",
    "የአሁኑ ንባብ",
    "ፍጆታ",
  ];

  let totalConsumption = 0;
  const rows = data.map((row, index) => {
    const phone =
      row.customerPhoneNumber ||
      row.phoneNumber ||
      row.phone ||
      customerByAccount?.get(String(row.customerAccountNumber || row.accountNumber || ""))?.phoneNumber ||
      customerByAccount?.get(String(row.customerAccountNumber || row.accountNumber || ""))?.phone ||
      "";

    const cons = Number(row.consumption) || 0;
    totalConsumption += cons;

    return [
      index + 1,
      row.customerFullName || row.customerName || "",
      row.customerAccountNumber || row.accountNumber || "",
      phone,
      row.previousReading ?? "",
      row.lastReading ?? "",
      row.consumption ?? "",
    ];
  });

  const foot = [
    "",
    "ጠቅላላ ድምር",
    `ጠቅላላ ፍጆታ: ${totalConsumption.toLocaleString("en-US")}`,
    "",
    "",
    "",
    "",
  ];

  // Sum of widths: 30 + 165 + 68 + 96 + 60 + 60 + 60 = 539 pt
  const columnStyles = {
    0: { halign: "center", cellWidth: 30 }, // ተ.ቁ
    1: { halign: "left", cellWidth: 165 },   // የደንበኞች ስም ዝርዝር
    2: { halign: "center", cellWidth: 68 }, // አካውንት ቁጥር
    3: { halign: "center", cellWidth: 96 }, // ስልክ ቁጥር
    4: { halign: "right", cellWidth: 60 },  // ነባር ንባብ
    5: { halign: "right", cellWidth: 60 },  // የአሁኑ ንባብ
    6: { halign: "right", cellWidth: 60 },  // ፍጆታ
  };

  const selectedMonthYear = [selectedKifyaWerMonth, selectedKifyaWerYear].filter(Boolean).join(", ");
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fileName = `${filenamePrefix}_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.pdf`;

  await generateReadingListPdf({
    reportTitleAmh: "የተመዘገቡ ንባቦች ዝርዝር",
    fileName,
    headers,
    rows,
    foot,
    columnStyles,
    tableFontSize: 9.8,
    companyProfile,
    filterContext: {
      ...filterContext,
      kifyaWer: selectedMonthYear,
      totalConsumption,
    },
    preparerName,
    toast,
    selectedMonthYear,
  });
}

/**
 * Export Customers Without Reading (Table 2) to PDF
 */
export async function exportCustomersWithoutReadingPDF({
  data,
  selectedKifyaWerMonth,
  selectedKifyaWerYear,
  companyProfile,
  filterContext,
  kebeles,
  ketenas,
  readers,
  customerByAccount,
  preparerName,
  toast,
  filenamePrefix = "Customers_Without_Reading",
}) {
  if (!Array.isArray(data) || data.length === 0) {
    if (toast) toast.info("No rows to export for the selected period.");
    return;
  }

  // 9 columns (ክፍያ ወር column removed and moved to header)
  const headers = [
    "ተ.ቁ",
    "የደንበኞች ስም ዝርዝር",
    "አካውንት ቁጥር",
    "ስልክ ቁጥር",
    "ነባር ንባብ",
    "የአሁኑ ንባብ",
    "ቀበሌ",
    "ቀጠና",
    "አንባቢ",
  ];

  const rows = data.map((row, index) => {
    const kebeleId = row.addressStreetsId ?? row.addressStreetId ?? row.kebeleId ?? null;
    const kebele = Array.isArray(kebeles) && kebeleId != null ? kebeles.find((k) => String(k.id) === String(kebeleId)) : null;
    const ketenaId = row.addressKetenaId ?? row.ketenaId ?? null;
    const ketena = Array.isArray(ketenas) && ketenaId != null ? ketenas.find((k) => String(k.id) === String(ketenaId)) : null;
    const readerId = row.assignedReaderId ?? row.readerId ?? null;
    let readerName = row.assignedReaderName || "";
    if (!readerName) {
      const reader = Array.isArray(readers) && readerId != null ? readers.find((rd) => String(rd.id) === String(readerId)) : null;
      if (reader) {
        readerName = reader.name || reader.fullName || [reader.firstName, reader.midleName, reader.lastName].filter(Boolean).join(" ") || "";
      }
    }
    if (!readerName && readerId != null) readerName = String(readerId);

    const phone =
      row.phoneNumber ||
      row.phone ||
      row.customerPhoneNumber ||
      customerByAccount?.get(String(row.accountNumber || row.customerAccountNumber || ""))?.phoneNumber ||
      customerByAccount?.get(String(row.accountNumber || row.customerAccountNumber || ""))?.phone ||
      "";

    return [
      index + 1,
      row.fullName || row.customerName || "",
      row.accountNumber || "",
      phone,
      row.previousReading ?? "",
      "", // Blank for meter readers to write in the field
      (kebele && kebele.name) || kebeleId || "",
      (ketena && ketena.name) || ketenaId || "",
      readerName,
    ];
  });

  const foot = [
    "",
    "ጠቅላላ ብዛት",
    `${data.length} ደንበኞች`,
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  // Sum of widths: 26 + 132 + 58 + 82 + 48 + 52 + 45 + 45 + 51 = 539 pt
  const columnStyles = {
    0: { halign: "center", cellWidth: 26 }, // ተ.ቁ
    1: { halign: "left", cellWidth: 132 },   // የደንበኞች ስም ዝርዝር
    2: { halign: "center", cellWidth: 58 }, // አካውንት ቁጥር
    3: { halign: "center", cellWidth: 82 }, // ስልክ ቁጥር
    4: { halign: "right", cellWidth: 48 },  // ነባር ንባብ
    5: { halign: "center", cellWidth: 52 }, // የአሁኑ ንባብ
    6: { halign: "center", cellWidth: 45 }, // ቀበሌ
    7: { halign: "center", cellWidth: 45 }, // ቀጠና
    8: { halign: "left", cellWidth: 51 },   // አንባቢ
  };

  const selectedMonthYear = [selectedKifyaWerMonth, selectedKifyaWerYear].filter(Boolean).join(", ");
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fileName = `${filenamePrefix}_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.pdf`;

  await generateReadingListPdf({
    reportTitleAmh: "ንባብ ያልተወሰደላቸው ደንበኞች ዝርዝር",
    fileName,
    headers,
    rows,
    foot,
    columnStyles,
    tableFontSize: 9.2,
    companyProfile,
    filterContext: {
      ...filterContext,
      kifyaWer: selectedMonthYear,
    },
    preparerName,
    toast,
    selectedMonthYear,
  });
}
