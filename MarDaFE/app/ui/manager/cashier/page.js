"use client";
import { useState, useEffect } from "react";
import { Box, Button, Grid, Paper, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReadingService } from "../../../lib/ReadingService";
import cashierPaymentService from "../../../lib/cashierPaymentService";
import { CustomerService } from "../../../lib/customerService";
import { CompanyProfileService } from "../../../lib/companyProfileService";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import getSession from "../../../lib/getSession";
import "../../../fonts/nyala-normal"; // Import Amharic font

const readingService = new ReadingService();
const customerService = new CustomerService();
const companyProfileService = new CompanyProfileService();

export default function CashierPage() {
  const [customerId, setCustomerId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [wuzifBills, setWuzifBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [remark, setRemark] = useState("");
  const [lastCustomer, setLastCustomer] = useState(null); // cache for receipt
  const [lastPayment, setLastPayment] = useState(null); // cache for last successful payment
  const [currentKifyaWer, setCurrentKifyaWer] = useState("");
  const [companyProfile, setCompanyProfile] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [changeToReturn, setChangeToReturn] = useState(0);

  useEffect(() => {
    const fetchLogo = async () => {
      const base64 = await loadImageAsBase64("/images/logo/logo.png");
      setLogoBase64(base64);
    };
    fetchLogo();
  }, []);

  const handleSearch = async () => {
    try {
      console.log("Cashier: Search clicked", { customerId, accountNumber });
      setLoading(true);
      // Reset lists to avoid confusion if search fails or returns empty
      setBills([]);
      setWuzifBills([]);
      setPaidBills([]);

      let idToSearch = customerId;
      let customerDto = null;
      // 1) Determine allowed payment month from Company Profile
      let kifyaWerFormatted = "";
      try {
        const profile = await companyProfileService.getLatest();
        setCompanyProfile(profile);
        const activeBillingMonth = profile?.activeBillingMonth; // ISO yyyy-MM-dd expected
        if (activeBillingMonth) {
          const et = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(activeBillingMonth));
          const monthName = EthiopianCalendarConverterPure.getEthiopianMonthNameAmharic(et.month);
          kifyaWerFormatted = `${monthName}, ${et.year}`;
          setCurrentKifyaWer(kifyaWerFormatted);
        }
      } catch (e) {
        console.warn("Cashier: Could not load active billing month", e);
      }
      if (!idToSearch && accountNumber) {
        try {
          customerDto = await customerService.getCustomerByAccountNumber(accountNumber.trim());
          console.log("Cashier: customerDto from account number", customerDto);
          idToSearch = customerDto?.id;
          if (!idToSearch) throw new Error("Customer not found");
          setCustomerId(String(idToSearch));
        } catch (e) {
          console.error("Cashier: getCustomerByAccountNumber failed", e);
          toast.error("Customer not found by account number");
          return;
        }
      }
      if (!idToSearch) {
        toast.info("Enter Customer ID or Account Number");
        return;
      }

      console.log("Cashier: fetching bills for", idToSearch);
      const res = await readingService.getCombinedBillDataForCustomer(idToSearch);
      console.log("Cashier: bills response", res);
      // Expect shape { bills: [...], wuzifBills: [...] }
      const regular = Array.isArray(res?.bills) ? res.bills : res;
      // 2) Filter to unpaid, allowed month (kifyaWer), active status, and not void
      const unpaidOnly = (Array.isArray(regular) ? regular : []).filter(
        (b) =>
          Boolean(b?.isBillGenerated) &&
          !b?.isVoid &&
          (b?.status || "").toLowerCase() === "active" &&
          !normalizeMoneyCollected(b)
      );
      const monthFiltered = kifyaWerFormatted
        ? unpaidOnly.filter((b) => (b?.kifyaWer || "") === kifyaWerFormatted)
        : unpaidOnly;
      setBills(monthFiltered);
      // 3) Wuzif unpaid like customerHistory - show ALL unpaid wuzif (not filtered by month)
      const rawWuzif = Array.isArray(res?.wuzifBills) ? res.wuzifBills : [];
      const unpaidWuzif = rawWuzif.filter(
        (w) => w?.wuzifDeleted === "active" && w?.wuzifIsMoneyCollected === false
      );
      // Show all unpaid Wuzif bills for the customer (not filtered by payment month)
      setWuzifBills(unpaidWuzif);

      // 4) Get paid bills for reprint functionality (last 10 paid bills)
      const paidOnly = (Array.isArray(regular) ? regular : []).filter(
        (b) =>
          Boolean(b?.isBillGenerated) &&
          !b?.isVoid &&
          normalizeMoneyCollected(b)
      );
      // Sort by collection date (most recent first) and take last 10
      const sortedPaid = paidOnly.sort((a, b) => {
        const dateA = new Date(a.moneyCollectedDate || a.collectionDate || 0);
        const dateB = new Date(b.moneyCollectedDate || b.collectionDate || 0);
        return dateB - dateA;
      }).slice(0, 10);
      setPaidBills(sortedPaid);
      // keep detailed customer cache for receipt header and UI card
      const baseCustomer = customerDto || {};
      const firstBill = regular && regular.length ? regular[0] : {};
      
      setLastCustomer({
        id: idToSearch,
        fullName: baseCustomer.fullName || firstBill.fullName || firstBill.customerFullName || firstBill.customerName || "-",
        accountNumber: baseCustomer.accountNumber || firstBill.accountNumber || firstBill.customerAccountNumber || "-",
        phoneNumber: baseCustomer.phoneNumber || baseCustomer.mobile || firstBill.customerPhoneNumber || firstBill.phoneNumber || firstBill.customerMobile || "-",
        customerType: baseCustomer.customerTypeName || baseCustomer.customerType || firstBill.customerTypeName || firstBill.customerType || "-",
      });
    } catch (e) {
      console.error("Search failed", e);
      toast.error("Failed to load customer bills");
    } finally {
      setLoading(false);
    }
  };

  const isTrue = (val) => val === true || val === "true" || val === 1 || val === "1";

  const normalizeMoneyCollected = (bill) => {
    const raw = bill?.moneyCollected ?? bill?.isMoneyCollected;
    return isTrue(raw);
  };

  const unpaidFilter = (b) =>
    Boolean(b?.isBillGenerated) &&
    !b?.isVoid &&
    (b?.status || "").toLowerCase() === "active" &&
    !normalizeMoneyCollected(b);

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
      console.warn("Cashier: Logo load failed:", e);
      return null;
    }
  }

  const openPayDialog = (bill) => {
    setSelectedBill(bill);
    setRemark("");
    setAmountTendered("");
    setChangeToReturn(0);
  };

  const closePayDialog = () => {
    setSelectedBill(null);
    setRemark("");
    setAmountTendered("");
    setChangeToReturn(0);
  };

  const handleAmountTenderedChange = (val) => {
    setAmountTendered(val);
    const numVal = Number(val);
    const billAmount = selectedBill?.tekilalaTekefay ?? 0;
    if (!isNaN(numVal) && numVal >= billAmount) {
      setChangeToReturn(numVal - billAmount);
    } else {
      setChangeToReturn(0);
    }
  };

  const confirmPay = async () => {
    if (!selectedBill) return;
    const id = selectedBill.id;
    const amount = selectedBill.tekilalaTekefay ?? 0;
    if (!amount || amount <= 0) {
      toast.error("Invalid bill amount");
      return;
    }
    try {
      setLoading(true);

      // Debug: Check if user is authenticated and has correct role
      const token = localStorage.getItem('user_token');
      if (!token) {
        toast.error("Please log in to make payments");
        return;
      }

      // Check user roles for debugging
      try {
        const session = JSON.parse(token);
        const roles = session?.roles || session?.authorities || [];
        console.log("User roles:", roles);
        console.log("Making payment with token present:", !!token);

        // Check if user has required roles (CASHIER or BILLZGJT) - case insensitive
        const hasRequiredRole = roles.some(role => {
          const normalizedRole = String(role).toLowerCase();
          return normalizedRole === 'role_cashier' ||
            normalizedRole === 'cashier' ||
            normalizedRole === 'role_billzgjt' ||
            normalizedRole === 'billzgjt';
        });

        if (!hasRequiredRole) {
          toast.error("You don't have permission to make cashier payments. Required role: CASHIER or BILLZGJT");
          console.warn("Missing required role. User roles:", roles);
          return;
        }
      } catch (e) {
        console.error("Error parsing user session:", e);
      }

      const paymentResult = await cashierPaymentService.updateCashierPayment(id, {
        amount,
        // Explicitly send collection date in Gregorian (ISO) for accurate EC conversion
        moneyCollectedDate: new Date().toISOString(),
        remark,
      });
      toast.success("Payment recorded");

      const updatedFlags = {
        moneyCollected:
          paymentResult?.isMoneyCollected === true ||
          paymentResult?.moneyCollected === true,
        moneyCollectedDate:
          paymentResult?.moneyCollectedDate || new Date().toISOString(),
        isPaidOnFrontOffice:
          paymentResult?.isPaidOnFrontOffice === true ||
          selectedBill.isPaidOnFrontOffice,
      };
      const updatedBillForReceipt = { ...selectedBill, ...updatedFlags };

      // Store payment details for PDF generation
      setLastPayment({
        bill: updatedBillForReceipt,
        amount,
        customer: lastCustomer,
        remark,
      });

      try {
        generateReceiptPDF(
          { bill: updatedBillForReceipt, amount, customer: lastCustomer },
          true
        );
      } catch (_) { }
      closePayDialog();
      await handleSearch(); // refresh list
    } catch (e) {
      console.error("Payment error:", e);
      let msg = "Payment failed";

      if (e?.response?.status === 401) {
        msg = "Authentication failed. Please log in again.";
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (e?.response?.status === 403) {
        msg = "You don't have permission to make payments.";
      } else if (e?.response?.data?.message) {
        msg = e.response.data.message;
      } else if (e?.message) {
        msg = e.message;
      }

      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Generate Ethiopian format receipt PDF - A5 size with Amharic font
  const generateReceiptPDF = ({ bill }, preview = true) => {
    if (!bill) return;
    try {
      // Reuse the new detailed receipt layout for all receipts
      generateDetailedReceiptPDF(bill, preview);
    } catch (e) {
      console.error("Failed to generate receipt PDF", e);
      toast.error("Failed to generate receipt PDF");
    }
  };

  const generateDetailedReceiptPDF = async (bill, preview = true) => {
    if (!bill?.id) {
      toast.error("No bill selected for detailed receipt");
      return;
    }

    try {
      const detail = await readingService.getReadingDetailWithConsumption(bill.id);
      let payload = detail;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) { }
      }

      const reading = payload?.reading || {};
      const consumptionItems = Array.isArray(payload?.consumption)
        ? payload.consumption
        : [];

      const name =
        reading.customerName ||
        lastCustomer?.fullName ||
        bill.fullName ||
        "-";
      const englishName =
        reading.customerFullNameEng ||
        reading.fullNameEng ||
        reading.customerNameEng ||
        bill.customerFullNameEng ||
        bill.fullNameEng ||
        bill.customerNameEng ||
        lastCustomer?.fullNameEng ||
        "";
      const hasEnglishName = Boolean(
        englishName && name && englishName !== name
      );
      const accountNumber =
        reading.accountNumber ||
        reading.customerAccountNumber ||
        bill.customerAccountNumber ||
        bill.accountNumber ||
        lastCustomer?.accountNumber ||
        "-";
      const phone =
        reading.phoneNumber ||
        reading.customerPhoneNumber ||
        reading.customerMobile ||
        "-";
      const customerId =
        reading.customerId ||
        bill.customerId ||
        lastCustomer?.id ||
        "-";
      const customerType =
        reading.customerTypeName ||
        reading.customerType ||
        bill.customerType ||
        "-";
      const invoiceNumber =
        reading.invoiceNumber ||
        bill.billingInvoiceNumber ||
        bill.invoiceNumber ||
        "-";
      const kifyaWer = reading.kifyaWer || bill.kifyaWer || "-";
      const meterNumber = reading.meterNumber || bill.meterNumber || "-";
      const meterSize =
        reading.meterSize ||
        bill.meterSize ||
        bill.meterSizeName ||
        "-";
      const currentReading = reading.lastReading ?? bill.lastReading ?? "";
      const previousReading =
        reading.previousReading ?? bill.previousReading ?? "";
      const consumptionValue =
        reading.consumption ?? bill.consumption ?? "";
      let cashierName = reading.cashierUser || "-";
      try {
        const session = getSession && getSession();
        if (session && typeof session === "object") {
          const nameFromSession =
            (session.user && (session.user.name || session.user.username)) ||
            session.name ||
            session.username;
          if (nameFromSession) {
            cashierName = nameFromSession;
          }
        }
      } catch (e) {
        // Fallback to reading.cashierUser when session is not available
      }

      // Header date: today (GC -> EC)
      let etDateStr;
      try {
        const ethToday = EthiopianCalendarConverterPure.gregorianToEthiopian(
          new Date()
        );
        etDateStr =
          EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(
            ethToday
          );
      } catch (e) {
        etDateStr = new Date().toLocaleDateString();
      }

      // Paid date (bottom-left next to signature): use moneyCollectedDate if available
      let etPaidDateStr = etDateStr;
      try {
        if (reading.moneyCollectedDate) {
          const gcPaid = new Date(reading.moneyCollectedDate);
          if (!Number.isNaN(gcPaid.getTime())) {
            const ethPaid =
              EthiopianCalendarConverterPure.gregorianToEthiopian(gcPaid);
            const formattedPaid =
              EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(
                ethPaid
              );
            if (formattedPaid) {
              etPaidDateStr = formattedPaid;
            }
          }
        }
      } catch (e) {
        // Fallback to header date if parsing/conversion fails
      }

      const isFrontOfficePaid =
        reading.isPaidOnFrontOffice === true ||
        reading.isPaidOnFrontOffice === "true" ||
        (bill &&
          (bill.isPaidOnFrontOffice === true ||
            bill.isPaidOnFrontOffice === "true"));

      let paymentLocation = "-";
      if (isFrontOfficePaid) {
        paymentLocation = "ቢሮ";
      } else {
        const locationFromReading =
          reading.bankName ||
          reading.bankPaidAgentId ||
          reading.uBankPaidAgentId;
        const locationFromBill =
          bill.bankName || bill.bankPaidAgentId || bill.uBankPaidAgentId;
        const loc = locationFromReading || locationFromBill;
        if (loc) {
          paymentLocation = String(loc);
        }
      }

      const fmtMoney = (val) => {
        const n = Number(val);
        if (!Number.isFinite(n)) return "-";
        return n.toLocaleString("en-ET", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };

      const extraLabelBase = "ተጨማሪ ክፍያ";
      const extraDesc =
        reading.techemariFieldName ||
        bill.techemariFieldName ||
        "";
      const extraLabel =
        extraDesc ? `${extraLabelBase} (${extraDesc})` : extraLabelBase;

      const summaryRows = [
        ["የዚህ ወር ፍጆታ", fmtMoney(reading.yezihWerFjotaKfya)],
        ["የቆጣሪ ኪራይ", fmtMoney(reading.kotariKiray)],
        ["ውዝፍ ወር ብዛት", reading.wuzifWorBzat ?? "-"],
        ["ውዝፍ ድምር", fmtMoney(reading.wuzifHisab)],
        ["ቅጣት", fmtMoney(reading.kitat)],
        ["የደረቅ ቆሻሻ ክፍያ", fmtMoney(reading.additionalHisab)],
        [
          extraLabel,
          fmtMoney(reading.techemariKfya),
        ],
        [
          "ቅድመ ክፍያ",
          reading.kecreditYetekefele
            ? `(${fmtMoney(reading.kecreditYetekefele)})`
            : "-",
        ],
        [
          "ጠቅላላ ተከፋይ",
          fmtMoney(reading.tekilalaTekefay || bill.tekilalaTekefay),
        ],
      ];
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      try {
        doc.setFont("nyala", "normal");
      } catch (e) {
        doc.setFont("helvetica", "normal");
      }

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const halfHeight = pageHeight / 2;
      // Slightly increase usable height so the outer rectangle extends lower
      const usableHeight = halfHeight * 0.9;
      const topOffset = (halfHeight - usableHeight) / 2;

      const outerMarginX = 10;
      const outerX = outerMarginX;
      const outerY = topOffset;
      const outerWidth = pageWidth - outerMarginX * 2;
      const outerHeight = halfHeight - topOffset * 2;

      // Outer border similar to sample receipt
      doc.setLineWidth(0.3);
      doc.rect(outerX, outerY, outerWidth, outerHeight);

      // Company profile for header (name & logo)
      let profileForHeader = companyProfile;
      if (!profileForHeader) {
        try {
          profileForHeader = await companyProfileService.getLatest();
          setCompanyProfile(profileForHeader);
        } catch (e) {
          console.warn("Cashier: Failed to load company profile for receipt header", e);
        }
      }
      const companyNameAmh = profileForHeader?.companyNameAmh || "";
      const companyNameEng = profileForHeader?.companyName || "";

      // Logo on the right, similar to BillList PDF header (uses cached base64 if available)
      const logoToUse = logoBase64 || await loadImageAsBase64("/images/logo/logo.png");
      const logoSize = 18; // mm (~30% larger)
      const logoX = outerX + outerWidth - logoSize - 2;
      const logoY = outerY + 2;
      if (logoToUse) {
        try {
          doc.addImage(logoToUse, "PNG", logoX, logoY, logoSize, logoSize);
        } catch (_) { }
      }

      // Title first - big and centered
      doc.setFontSize(16);
      const titleY = outerY + 8;
      doc.text(
        "የውሃ ክፍያ ደረሰኝ",
        outerX + outerWidth / 2,
        titleY,
        { align: "center" }
      );

      const drawBoldHeaderText = (text, x, y, options) => {
        const t = String(text ?? "");
        const opts = options || {};
        doc.text(t, x, y, opts);
        doc.text(t, x + 0.1, y, opts);
      };

      // Company name (Amharic + English) below title, left aligned
      const companyRowY = titleY + 7;
      let companyLine = "";
      if (companyNameAmh && companyNameEng) {
        companyLine = `${companyNameAmh} (${companyNameEng})`;
      } else if (companyNameAmh) {
        companyLine = companyNameAmh;
      } else if (companyNameEng) {
        companyLine = companyNameEng;
      }
      if (companyLine) {
        doc.setFontSize(14);
        drawBoldHeaderText(companyLine, outerX + 2, companyRowY);
      }

      // Separator line under header
      const headerLineY = titleY + 11;
      doc.setLineWidth(0.3);
      doc.line(outerX + 1, headerLineY, outerX + outerWidth - 1, headerLineY);

      // Header row: receipt no, month, date
      doc.setFontSize(12);
      const headerRowY = headerLineY + 6;
      drawBoldHeaderText(`ደረሰኝ ቁጥር: ${invoiceNumber}`, outerX + 2, headerRowY);
      drawBoldHeaderText(
        `ወር ክፍያ: ${kifyaWer}`,
        outerX + outerWidth / 2,
        headerRowY,
        { align: "center" }
      );
      drawBoldHeaderText(
        `ቀን: ${etDateStr}`,
        outerX + outerWidth - 2,
        headerRowY,
        { align: "right" }
      );

      // Content area: left (customer/meter) & right (tables)
      const contentTopY = headerRowY + 6;
      const contentBottomY = outerY + outerHeight;
      const leftRatio = 0.48;
      const leftAreaWidth = outerWidth * leftRatio;
      const leftAreaX = outerX + 2;
      const rightAreaX = outerX + leftAreaWidth + 2;

      // Vertical split line
      doc.line(rightAreaX - 1, contentTopY, rightAreaX - 1, contentBottomY);

      // ---------- LEFT COLUMN: Customer & Meter stacked boxes ----------
      const boxWidth = leftAreaWidth - 4;
      const rowGap = 5;
      let boxY = contentTopY;

      doc.setFontSize(12);
      const labelX = leftAreaX + 2;
      const valueX = leftAreaX + 32;

      const drawBoldText = (text, x, y, options) => {
        const t = String(text ?? "");
        const opts = options || {};
        doc.text(t, x, y, opts);
        doc.text(t, x + 0.1, y, opts);
      };

      const drawRow = (y, label, value) => {
        doc.text(label, labelX, y);
        drawBoldText(String(value ?? "-"), valueX, y);
      };

      // Box 1: Customer info
      const box1Height = rowGap * (hasEnglishName ? 4 : 3) + 6;
      doc.rect(leftAreaX, boxY, boxWidth, box1Height);
      let y = boxY + 7;
      // Amharic name on first row
      drawRow(y, "የደንበኛ ስም:", name);
      // English name on the row below (no brackets) when available
      if (hasEnglishName) {
        y += rowGap;
        drawRow(y, "", englishName);
      }
      y += rowGap;
      drawRow(y, "ስልክ ቁጥር:", phone);
      y += rowGap;
      drawRow(y, "ሂሳብ ቁጥር:", accountNumber);
      boxY += box1Height + 2;

      // Box 2: Meter & customer type
      const box2Height = rowGap * 3 + 6;
      doc.rect(leftAreaX, boxY, boxWidth, box2Height);
      y = boxY + 7;
      drawRow(y, "የቆጣሪ ቁጥር:", meterNumber);
      y += rowGap;
      drawRow(y, "የደንበኛ ዓይነት:", customerType);
      y += rowGap;
      drawRow(y, "የቆጣሪ መጠን:", meterSize);
      boxY += box2Height + 2;

      // Box 3: Readings
      const box3Height = rowGap * 3 + 6;
      doc.rect(leftAreaX, boxY, boxWidth, box3Height);
      y = boxY + 7;
      drawRow(y, "የአሁን ንባብ:", currentReading);
      y += rowGap;
      drawRow(y, "ያለፈ ንባብ:", previousReading);
      y += rowGap;
      drawRow(y, "ፍጆታ:", consumptionValue);
      boxY += box3Height + 2;

      // Box 4: Cashier & date
      const box4Height = rowGap * 3 + 6;
      doc.rect(leftAreaX, boxY, boxWidth, box4Height);
      y = boxY + 7;
      drawRow(y, "ገንዘብ ሰብሳቢ:", cashierName);
      y += rowGap;
      doc.text("ፊርማ:", labelX, y);
      doc.text("__________________", valueX, y);
      y += rowGap;
      // Use bill paid date (moneyCollectedDate -> EC) here
      drawRow(y, "ቀን:", etPaidDateStr);

      // ---------- RIGHT COLUMN: Consumption Breakdown & Reading Summary ----------
      let rightY = contentTopY;
      const rightInnerX = rightAreaX + 2;
      const rightInnerWidth = outerX + outerWidth - 2 - rightInnerX;

      // Consumption breakdown area (no title, reuse space)
      doc.setFontSize(14);

      // Table headers
      const tableY = rightY;
      const rowHeight = 6;
      const col1Width = rightInnerWidth * 0.4;
      const col2Width = rightInnerWidth * 0.2;
      const col3Width = rightInnerWidth * 0.2;
      const col4Width = rightInnerWidth - (col1Width + col2Width + col3Width);

      // Light background for header row
      doc.setFillColor(235, 235, 235);
      doc.rect(rightInnerX, tableY, rightInnerWidth, rowHeight, "F");

      doc.setFontSize(12);
      doc.rect(rightInnerX, tableY, col1Width, rowHeight);
      doc.rect(rightInnerX + col1Width, tableY, col2Width, rowHeight);
      doc.rect(
        rightInnerX + col1Width + col2Width,
        tableY,
        col3Width,
        rowHeight
      );
      doc.rect(
        rightInnerX + col1Width + col2Width + col3Width,
        tableY,
        col4Width,
        rowHeight
      );
      drawBoldText("የቦሎክ መጠን", rightInnerX + 1, tableY + 4);
      drawBoldText(
        "ፍጆታ",
        rightInnerX + col1Width + col2Width - 1,
        tableY + 4,
        { align: "right" }
      );
      drawBoldText(
        "ታሪፍ",
        rightInnerX + col1Width + col2Width + col3Width - 1,
        tableY + 4,
        { align: "right" }
      );
      drawBoldText(
        "ድምር",
        rightInnerX + col1Width + col2Width + col3Width + col4Width - 1,
        tableY + 4,
        { align: "right" }
      );

      let curRowY = tableY + rowHeight;
      (consumptionItems || []).forEach((c) => {
        const blockName = c.blockName || "";
        const cons = c.consumption ?? "";
        const tariff = c.tariff ?? "";
        const total = c.totalAmount ?? "";

        doc.rect(rightInnerX, curRowY, col1Width, rowHeight);
        doc.rect(rightInnerX + col1Width, curRowY, col2Width, rowHeight);
        doc.rect(
          rightInnerX + col1Width + col2Width,
          curRowY,
          col3Width,
          rowHeight
        );
        doc.rect(
          rightInnerX + col1Width + col2Width + col3Width,
          curRowY,
          col4Width,
          rowHeight
        );

        drawBoldText(String(blockName), rightInnerX + 1, curRowY + 4);
        drawBoldText(
          String(cons),
          rightInnerX + col1Width + col2Width - 1,
          curRowY + 4,
          { align: "right" }
        );
        drawBoldText(
          String(tariff),
          rightInnerX + col1Width + col2Width + col3Width - 1,
          curRowY + 4,
          { align: "right" }
        );
        drawBoldText(
          String(total),
          rightInnerX + col1Width + col2Width + col3Width + col4Width - 1,
          curRowY + 4,
          { align: "right" }
        );

        curRowY += rowHeight;
      });

      rightY = curRowY + 4;

      // Reading summary (no title, reuse space)
      doc.setFontSize(14);

      doc.setFontSize(12);
      summaryRows.forEach(([label, value]) => {
        const isTotalRow = label === "ጠቅላላ ተከፋይ";

        if (isTotalRow) {
          // Soft dark background behind total payable
          const bgHeight = 7;
          const bgY = rightY - 4;
          doc.setFillColor(235, 235, 235);
          doc.rect(rightInnerX - 1, bgY, rightInnerWidth + 2, bgHeight, "F");
          doc.setFontSize(13);
        }
        doc.text(String(label), rightInnerX, rightY);
        drawBoldText(
          String(value),
          rightInnerX + rightInnerWidth - 1,
          rightY,
          { align: "right" }
        );

        // Dotted (or solid fallback) underline for each row
        const lineY = rightY + 1.5;
        try {
          if (typeof doc.setLineDash === "function") {
            doc.setLineWidth(0.2);
            doc.setDrawColor(150, 150, 150);
            doc.setLineDash([1, 1], 0);
            doc.line(rightInnerX, lineY, rightInnerX + rightInnerWidth, lineY);
            doc.setLineDash([], 0);
            doc.setDrawColor(0, 0, 0);
          } else {
            doc.setLineWidth(0.1);
            doc.setDrawColor(180, 180, 180);
            doc.line(rightInnerX, lineY, rightInnerX + rightInnerWidth, lineY);
            doc.setDrawColor(0, 0, 0);
          }
        } catch (_) {
          // Ignore line dash errors on older jsPDF versions
        }

        if (isTotalRow) {
          doc.setFontSize(12);
        }

        rightY += 6;
      });


      // Determine confirmation code to show based on payment method
      const isDerash =
        reading.isDerashPaid === true ||
        reading.isDerashPaid === "true" ||
        (bill && (bill.isDerashPaid === true || bill.isDerashPaid === "true"));

      const isUnicash =
        reading.isUnicashPaid === true ||
        reading.isUnicashPaid === "true" ||
        (bill && (bill.isUnicashPaid === true || bill.isUnicashPaid === "true"));

      const derashCodeVal = reading.bankPaidConfirmationCode || (bill ? bill.bankPaidConfirmationCode : null);
      const unicashCodeVal = reading.uBankPaidConfirmationCode || (bill ? bill.uBankPaidConfirmationCode : null);
      const derashBankName = reading.bankName || (bill ? bill.bankName : "Derash");
      const unicashBankName = reading.uBankName || (bill ? bill.uBankName : "Unicash");

      if (isDerash && isUnicash && derashCodeVal && unicashCodeVal) {
        // Both present: Show Derash inline, Unicash on next line
        drawBoldText(
          `የተከፈለበት ቦታ: ${derashBankName}: (${derashCodeVal})`,
          rightInnerX,
          rightY + 2
        );
        drawBoldText(
          `${unicashBankName}: (${unicashCodeVal})`,
          rightInnerX,
          rightY + 6
        );
      } else if (isDerash && derashCodeVal) {
        // Only Derash
        drawBoldText(
          `የተከፈለበት ቦታ: ${derashBankName} (${derashCodeVal})`,
          rightInnerX,
          rightY + 2
        );
      } else if (isUnicash && unicashCodeVal) {
        // Only Unicash
        drawBoldText(
          `የተከፈለበት ቦታ: ${unicashBankName} (${unicashCodeVal})`,
          rightInnerX,
          rightY + 2
        );
      } else {
        // None
        drawBoldText(
          `የተከፈለበት ቦታ: ${paymentLocation}`,
          rightInnerX,
          rightY + 2
        );
      }

      if (preview) {
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const previewWindow = window.open(
          pdfUrl,
          "_blank",
          "width=800,height=600"
        );
        if (previewWindow) {
          previewWindow.onbeforeunload = () => {
            URL.revokeObjectURL(pdfUrl);
          };
        }
      } else {
        // Build filename: Receipt_<accountNumber>_<kifyaWer>.pdf
        const rawAccount =
          accountNumber || bill.accountNumber || bill.customerAccountNumber || "unknown";
        const rawKifya = kifyaWer || bill.kifyaWer || "";
        const sanitize = (val) =>
          String(val || "")
            .replace(/[\\/:*?"<>|]/g, "_")
            .trim() || "unknown";
        const safeAccount = sanitize(rawAccount);
        const safeKifya = sanitize(rawKifya);
        const fileName = `Receipt_${safeAccount}_${safeKifya}.pdf`;
        doc.save(fileName);
      }
    } catch (error) {
      console.error("Failed to generate detailed receipt", error);
      toast.error("Failed to generate detailed receipt");
    }
  };

  const handleDetailedReceipt = async (bill, preview = true) => {
    if (!bill) {
      toast.error("No bill selected for detailed receipt");
      return;
    }
    await generateDetailedReceiptPDF(bill, preview);
  };

  const handleReprintReceipt = (bill, preview = true) => {
    console.log("Reprinting receipt for bill:", bill, "Preview:", preview);

    // Use the existing generateReceiptPDF function with the paid amount
    const paidAmount = bill.tekilalaYetekefele || bill.tekilalaTekefay || 0;
    generateReceiptPDF({ bill, amount: paidAmount, customer: lastCustomer }, preview);

    if (preview) {
      toast.info(`Receipt preview opened for Bill ID: ${bill.id}`);
    } else {
      toast.success(`Receipt downloaded for Bill ID: ${bill.id}`);
    }
  };

  return (
    <Box p={2}>
      <ToastContainer />
      <Typography variant="h5" mb={2}>Cashier - Front Office Payments</Typography>
      {currentKifyaWer && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#e3f2fd", border: "1px solid #2196f3" }}>
          <Typography variant="h6" color="primary" mb={1}>
            🗓️ Allowed Payment Month (Kifya Wer)
          </Typography>
          <Typography variant="body1" fontWeight="bold" color="primary">
            {currentKifyaWer}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Only bills for this payment month can be processed. Bills from other months will not be shown.
          </Typography>
        </Paper>
      )}

      {/* PDF Management Section */}
      {lastPayment && (
        <Paper sx={{ p: 2, mb: 3, backgroundColor: "#f5f5f5" }}>
          <Typography variant="h6" mb={1}>Last Receipt</Typography>
          <Typography variant="body2" mb={2}>
            Bill ID: {lastPayment.bill?.id} - Customer: {lastPayment.customer?.fullName || "-"} - Amount: {(lastPayment.amount || 0).toLocaleString()}
          </Typography>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                onClick={() => generateReceiptPDF(lastPayment, true)}
                size="small"
              >
                Preview PDF
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => generateReceiptPDF(lastPayment, false)}
                size="small"
              >
                Download PDF
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleDetailedReceipt(lastPayment.bill, true)}
                size="small"
              >
                Preview Detail Receipt
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDetailedReceipt(lastPayment.bill, false)}
                size="small"
              >
                Download Detail Receipt
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ width: '100%' }}>
          <Grid container spacing={2} alignItems="center">
            {/*
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="Customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loading}
              />
            </Grid>
            */}
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                label="Account Number"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  setCustomerId(""); // Clear ID to force re-search by account number
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Loading..." : "Search"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Customer Information Card */}
      {lastCustomer && lastCustomer.fullName && lastCustomer.fullName !== "-" && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 3, 
            borderRadius: 2, 
            border: "1px solid rgba(224, 224, 224, 0.6)",
            background: "linear-gradient(135deg, #ffffff 0%, #f9fbfd 100%)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
          }}
        >
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
            👤 Customer Profile
          </Typography>
          <Grid container spacing={3} mt={0.5}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Full Name</Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: "#1a237e" }}>{lastCustomer.fullName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Account Number</Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: "#0d47a1" }}>{lastCustomer.accountNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Phone Number</Typography>
              <Typography variant="body1" fontWeight="bold">{lastCustomer.phoneNumber}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">Customer Type / Category</Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ color: "#2e7d32" }}>{lastCustomer.customerType}</Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      <Typography variant="h6" mb={1}>Unpaid Bills</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(bills?.filter(unpaidFilter) || []).map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.billingInvoiceNumber || b.invoiceNumber || "-"}</TableCell>
                <TableCell>{b.kifyaWer || "-"}</TableCell>
                <TableCell>{(b.tekilalaTekefay || 0).toLocaleString()}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" size="small" onClick={() => openPayDialog(b)}>
                    Pay
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!bills || bills.filter(unpaidFilter).length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {currentKifyaWer
                    ? `No unpaid bills found for the allowed payment month: ${currentKifyaWer}`
                    : "No unpaid bills"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={4}>
        <Typography variant="h6" mb={1}>Unpaid Wuzif List</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(wuzifBills || []).map((w) => (
                <TableRow key={`w-${w.id}`}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.kifyaWer || "-"}</TableCell>
                  <TableCell>{(w.tekilalaTekefay || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {(!wuzifBills || wuzifBills.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} align="center">No unpaid wuzif found for this customer</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" mb={1}>Recent Paid Bills (Reprint Available)</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Invoice</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount Paid</TableCell>
                <TableCell>Payment Date</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Where Paid</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(paidBills || []).map((b) => (
                <TableRow key={`paid-${b.id}`}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.billingInvoiceNumber || b.invoiceNumber || "-"}</TableCell>
                  <TableCell>{b.kifyaWer || "-"}</TableCell>
                  <TableCell>{(b.tekilalaYetekefele || b.tekilalaTekefay || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {(() => {
                      const dateHtml = b.moneyCollectedDate || b.uMoneyCollectedDate || b.UMoneyCollectedDate || b.collectionDate || b.modifiedDate || b.registeredDate;
                      if (!dateHtml) return "-";
                      try {
                        const ethDate = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(dateHtml));
                        return EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(ethDate);
                      } catch (e) {
                        return "-";
                      }
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      // Reverted: Explicitly check for Office flags. Default to Bank if not found (as per previous state).
                      const isOffice = isTrue(b.isPaidOnFrontOffice) ||
                        (b.moneyCollector && b.moneyCollector !== "") ||
                        (b.cashierUser && b.cashierUser !== null) ||
                        (b.cashierFullName && b.cashierFullName !== "");
                      if (isOffice) return "Office";
                      return "Bank";
                    })()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const isOffice = isTrue(b.isPaidOnFrontOffice) ||
                        (b.moneyCollector && b.moneyCollector !== "") ||
                        (b.cashierUser && b.cashierUser !== null) ||
                        (b.cashierFullName && b.cashierFullName !== "");

                      if (isOffice) return "Office";

                      // Logic from Reference Modal for Bank/Location Name
                      const bankName = b.bankName || b.uBankName || b.UBankName || b.ubankName || b.billingBank?.bankName || b.billingBanks?.bankName;
                      if (bankName) return bankName;

                      const agentId = b.bankPaidAgentId || b.uBankPaidAgentId || b.UBankPaidAgentId;
                      if (agentId) return agentId;

                      return "-";
                    })()}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleReprintReceipt(b, true)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleReprintReceipt(b, false)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Download
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleDetailedReceipt(b, true)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Detail
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {(!paidBills || paidBills.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No recent paid bills found for this customer</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Dialog open={!!selectedBill} onClose={closePayDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pb: 1, fontWeight: 'bold' }}>Confirm Payment</DialogTitle>
        <DialogContent>
          {wuzifBills && wuzifBills.length > 0 && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#fffde7', border: '1px solid #ffd54f', borderRadius: 1.5 }}>
              <Typography variant="subtitle2" color="warning.main" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ⚠️ Outstanding Arrears (Wuzif) Notice
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                This customer has <strong>{wuzifBills.length}</strong> unpaid Wuzif bill(s) totaling <strong>{wuzifBills.reduce((acc, w) => acc + (w.tekilalaTekefay || 0), 0).toLocaleString()} ETB</strong>.
              </Typography>
            </Box>
          )}

          <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Bill Details:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1.5, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Bill ID: {selectedBill?.id}</Typography>
            <Typography variant="body1" fontWeight="bold" color="text.primary">
              Total Due: {(selectedBill?.tekilalaTekefay || 0).toLocaleString()} ETB
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount Received (Tendered)"
                value={amountTendered}
                onChange={(e) => handleAmountTenderedChange(e.target.value)}
                placeholder="0.00"
                type="number"
                inputProps={{ min: 0, step: "any" }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
              {Number(amountTendered) > 0 && (
                <Box sx={{ width: '100%', p: 1.5, bgcolor: changeToReturn > 0 ? '#e8f5e9' : '#ffebee', border: changeToReturn > 0 ? '1px solid #c8e6c9' : '1px solid #ffcdd2', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {changeToReturn > 0 ? "Change Owed" : "Shortage"}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={changeToReturn > 0 ? "green" : "red"}>
                    {changeToReturn.toLocaleString()} ETB
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Remark (optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Enter payment remark..."
                sx={{ mt: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closePayDialog} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={confirmPay} disabled={loading} color="primary">Pay</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
