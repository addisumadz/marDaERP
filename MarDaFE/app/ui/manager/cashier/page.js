"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  CreditCard,
  Search,
  Receipt,
  Calendar,
  DollarSign,
  User,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Download,
  Eye,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw,
  X,
  Coins,
  ChevronRight,
  Printer,
  Sparkles
} from "lucide-react";

const readingService = new ReadingService();
const customerService = new CustomerService();
const companyProfileService = new CompanyProfileService();

export default function CashierPage() {
  const { data: session } = useSession();
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
  const [activeTab, setActiveTab] = useState("unpaid"); // "unpaid" | "wuzif" | "paid"
  const [copiedAcc, setCopiedAcc] = useState(false);

  // Hybrid Authorization: Check if user has 'cashier' permittedPage or a recognized role
  const isAuthorizedCashier = () => {
    const sessionRoles = session?.user?.roles || session?.roles || [];
    const sessionPermitted = session?.user?.permittedPages || session?.permittedPages || [];

    // 1. Dynamic permission check from Role Assignment Menu Access
    if (Array.isArray(sessionPermitted) && sessionPermitted.includes("cashier")) return true;

    // 2. Role code check (NextAuth session + localStorage fallback)
    const allRoles = [...sessionRoles];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user_token");
        if (raw) {
          const parsed = JSON.parse(raw);
          const localRoles = parsed?.roles || parsed?.authorities || parsed?.user?.roles || [];
          if (Array.isArray(localRoles)) allRoles.push(...localRoles);
          const localPermitted = parsed?.permittedPages || parsed?.user?.permittedPages || [];
          if (Array.isArray(localPermitted) && localPermitted.includes("cashier")) return true;
        }
      } catch (_) { }
    }

    return allRoles.some((role) => {
      const norm = String(role || "").toLowerCase().replace(/^role_/, "").trim();
      return norm === "cashier" || norm === "billzgjt" || norm === "systemadmin" || norm === "admin";
    });
  };

  const fetchActiveBillingMonth = async () => {
    try {
      const profile = await companyProfileService.getLatest();
      setCompanyProfile(profile);
      const activeBillingMonth = profile?.activeBillingMonth;
      if (activeBillingMonth) {
        const et = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(activeBillingMonth));
        const monthName = EthiopianCalendarConverterPure.getEthiopianMonthNameAmharic(et.month);
        const kifyaWerFormatted = `${monthName}, ${et.year}`;
        setCurrentKifyaWer(kifyaWerFormatted);
        return kifyaWerFormatted;
      }
    } catch (e) {
      console.warn("Cashier: Could not load active billing month", e);
    }
    return "";
  };

  useEffect(() => {
    fetchActiveBillingMonth();
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
      setBills([]);
      setWuzifBills([]);
      setPaidBills([]);

      let idToSearch = customerId;
      let customerDto = null;

      // 1) Ensure active billing month from Company Profile
      let kifyaWerFormatted = currentKifyaWer;
      if (!kifyaWerFormatted) {
        kifyaWerFormatted = await fetchActiveBillingMonth();
      }

      if (!idToSearch && accountNumber) {
        try {
          customerDto = await customerService.getCustomerByAccountNumber(accountNumber.trim());
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
        toast.info("Please enter a Customer Account Number");
        return;
      }

      const res = await readingService.getCombinedBillDataForCustomer(idToSearch);
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
        ? unpaidOnly.filter((b) => (b?.kifyaWer || "").trim() === kifyaWerFormatted.trim())
        : unpaidOnly;
      setBills(monthFiltered);

      // 3) Wuzif unpaid (show ALL active unpaid wuzif)
      const rawWuzif = Array.isArray(res?.wuzifBills) ? res.wuzifBills : [];
      const unpaidWuzif = rawWuzif.filter(
        (w) => w?.wuzifDeleted === "active" && w?.wuzifIsMoneyCollected === false
      );
      setWuzifBills(unpaidWuzif);

      // 4) Get paid bills for reprint functionality (last 10 paid bills)
      const paidOnly = (Array.isArray(regular) ? regular : []).filter(
        (b) =>
          Boolean(b?.isBillGenerated) &&
          !b?.isVoid &&
          normalizeMoneyCollected(b)
      );
      const sortedPaid = paidOnly
        .sort((a, b) => {
          const dateA = new Date(a.moneyCollectedDate || a.collectionDate || 0);
          const dateB = new Date(b.moneyCollectedDate || b.collectionDate || 0);
          return dateB - dateA;
        })
        .slice(0, 10);
      setPaidBills(sortedPaid);

      // Customer cache
      const baseCustomer = customerDto || {};
      const firstBill = regular && regular.length ? regular[0] : {};

      setLastCustomer({
        id: idToSearch,
        fullName: baseCustomer.fullName || firstBill.fullName || firstBill.customerFullName || firstBill.customerName || "-",
        fullNameEng: baseCustomer.fullNameEng || firstBill.fullNameEng || firstBill.customerFullNameEng || "",
        accountNumber: baseCustomer.accountNumber || firstBill.accountNumber || firstBill.customerAccountNumber || "-",
        phoneNumber: baseCustomer.phoneNumber || baseCustomer.mobile || firstBill.customerPhoneNumber || firstBill.phoneNumber || firstBill.customerMobile || "-",
        customerType: baseCustomer.customerTypeName || baseCustomer.customerType || firstBill.customerTypeName || firstBill.customerType || "-",
      });

      // Default active tab: if no current bills but arrears exist, switch to wuzif
      if (monthFiltered.length === 0 && unpaidWuzif.length > 0) {
        setActiveTab("wuzif");
      } else {
        setActiveTab("unpaid");
      }
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
    !normalizeMoneyCollected(b) &&
    (!currentKifyaWer || (b?.kifyaWer || "").trim() === currentKifyaWer.trim());

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
      return null;
    }
  }

  const openPayDialog = (bill) => {
    if (!bill) return;
    if (currentKifyaWer && (bill?.kifyaWer || "").trim() !== currentKifyaWer.trim()) {
      toast.error(`ክፍያ የሚፈቀደው ለአሁኑ ንቁ ወር (${currentKifyaWer}) ብቻ ነው።`);
      return;
    }
    setSelectedBill(bill);
    setRemark("");
    setAmountTendered(String(bill?.tekilalaTekefay || ""));
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

  const setQuickDenomination = (addAmount) => {
    const billAmount = selectedBill?.tekilalaTekefay ?? 0;
    if (addAmount === "exact") {
      setAmountTendered(String(billAmount));
      setChangeToReturn(0);
    } else {
      const current = Number(amountTendered) || billAmount;
      const next = current + addAmount;
      setAmountTendered(String(next));
      if (next >= billAmount) {
        setChangeToReturn(next - billAmount);
      } else {
        setChangeToReturn(0);
      }
    }
  };

  const confirmPay = async () => {
    if (!selectedBill) return;
    if (currentKifyaWer && (selectedBill?.kifyaWer || "").trim() !== currentKifyaWer.trim()) {
      toast.error(`ክፍያ የሚፈቀደው ለአሁኑ ንቁ ወር (${currentKifyaWer}) ብቻ ነው።`);
      return;
    }
    const id = selectedBill.id;
    const amount = selectedBill.tekilalaTekefay ?? 0;
    if (!amount || amount <= 0) {
      toast.error("Invalid bill amount");
      return;
    }
    try {
      setLoading(true);

      // Verify authorization: Hybrid check (roles + permittedPages)
      if (!isAuthorizedCashier()) {
        toast.error("You don't have permission to make cashier payments. Required role: CASHIER, BILLZGJT, ADMIN, or 'cashier' menu access");
        return;
      }

      // Determine cashier user ID to record for audit trail
      const currentUserId = session?.id || session?.user?.id || (() => {
        try {
          const raw = localStorage.getItem("user_token");
          if (raw) {
            const p = JSON.parse(raw);
            return p?.id || p?.user?.id;
          }
        } catch (_) { }
        return null;
      })();

      const paymentResult = await cashierPaymentService.updateCashierPayment(id, {
        amount,
        moneyCollectedDate: new Date().toISOString(),
        remark,
        cashierUserId: currentUserId ? Number(currentUserId) : null,
      });
      toast.success("Payment recorded successfully!");

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
      await handleSearch(); // refresh lists
    } catch (e) {
      console.error("Payment error:", e);
      let msg = "Payment failed";
      if (e?.response?.status === 401) {
        msg = "Authentication failed. Please log in again.";
      } else if (e?.response?.status === 403) {
        msg = "You don't have permission to record payments.";
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
      let detail = null;
      try {
        detail = await readingService.getReadingDetailWithConsumption(bill.id);
      } catch (err) {
        console.warn("getReadingDetailWithConsumption failed", err);
      }
      let payload = detail;
      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (e) { }
      }

      let reading = payload?.reading || {};
      let consumptionItems = Array.isArray(payload?.consumption)
        ? payload.consumption
        : [];

      // Fallback if consumptionItems is empty: call getBillPreview
      if (!consumptionItems || consumptionItems.length === 0) {
        try {
          const previewData = await readingService.getBillPreview(bill.id);
          const p = typeof previewData === "string" ? JSON.parse(previewData) : previewData;
          if (Array.isArray(p?.consumption) && p.consumption.length > 0) {
            consumptionItems = p.consumption;
          }
          if ((!reading || Object.keys(reading).length === 0) && p?.reading) {
            reading = p.reading;
          }
        } catch (_) { }
      }

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
        const nameFromSession =
          session?.user?.name ||
          session?.name ||
          session?.user?.username ||
          session?.username ||
          (getSession && (() => {
            const s = getSession();
            return (s?.user && (s.user.name || s.user.username)) || s?.name || s?.username;
          })());
        if (nameFromSession) {
          cashierName = nameFromSession;
        }
      } catch (e) { }

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
      } catch (e) { }

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
        [extraLabel, fmtMoney(reading.techemariKfya)],
        [
          "ቅድመ ክፍያ",
          reading.kecreditYetekefele
            ? `(${fmtMoney(reading.kecreditYetekefele)})`
            : "-",
        ],
        ["ጠቅላላ ተከፋይ", fmtMoney(reading.tekilalaTekefay || bill.tekilalaTekefay)],
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
      const usableHeight = halfHeight * 0.9;
      const topOffset = (halfHeight - usableHeight) / 2;

      const outerMarginX = 10;
      const outerX = outerMarginX;
      const outerY = topOffset;
      const outerWidth = pageWidth - outerMarginX * 2;
      const outerHeight = halfHeight - topOffset * 2;

      doc.setLineWidth(0.3);
      doc.rect(outerX, outerY, outerWidth, outerHeight);

      // Company profile
      let profileForHeader = companyProfile;
      if (!profileForHeader) {
        try {
          profileForHeader = await companyProfileService.getLatest();
          setCompanyProfile(profileForHeader);
        } catch (e) { }
      }
      const companyNameAmh = profileForHeader?.companyNameAmh || "";
      const companyNameEng = profileForHeader?.companyName || "";

      const logoToUse = logoBase64 || (await loadImageAsBase64("/images/logo/logo.png"));
      const logoSize = 18;
      const logoX = outerX + outerWidth - logoSize - 2;
      const logoY = outerY + 2;
      if (logoToUse) {
        try {
          doc.addImage(logoToUse, "PNG", logoX, logoY, logoSize, logoSize);
        } catch (_) { }
      }

      doc.setFontSize(16);
      const titleY = outerY + 8;
      doc.text("የውሃ ክፍያ ደረሰኝ", outerX + outerWidth / 2, titleY, { align: "center" });

      const drawBoldHeaderText = (text, x, y, options) => {
        const t = String(text ?? "");
        const opts = options || {};
        doc.text(t, x, y, opts);
        doc.text(t, x + 0.1, y, opts);
      };

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

      const headerLineY = titleY + 11;
      doc.setLineWidth(0.3);
      doc.line(outerX + 1, headerLineY, outerX + outerWidth - 1, headerLineY);

      doc.setFontSize(12);
      const headerRowY = headerLineY + 6;
      drawBoldHeaderText(`ደረሰኝ ቁጥር: ${invoiceNumber}`, outerX + 2, headerRowY);
      drawBoldHeaderText(`ወር ክፍያ: ${kifyaWer}`, outerX + outerWidth / 2, headerRowY, { align: "center" });
      drawBoldHeaderText(`ቀን: ${etDateStr}`, outerX + outerWidth - 2, headerRowY, { align: "right" });

      const contentTopY = headerRowY + 6;
      const contentBottomY = outerY + outerHeight;
      const leftRatio = 0.48;
      const leftAreaWidth = outerWidth * leftRatio;
      const leftAreaX = outerX + 2;
      const rightAreaX = outerX + leftAreaWidth + 2;

      doc.line(rightAreaX - 1, contentTopY, rightAreaX - 1, contentBottomY);

      // LEFT COLUMN: Customer & Meter stacked boxes
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
      drawRow(y, "የደንበኛ ስም:", name);
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
      drawRow(y, "ቀን:", etPaidDateStr);

      // RIGHT COLUMN: Consumption Breakdown & Reading Summary
      let rightY = contentTopY;
      const rightInnerX = rightAreaX + 2;
      const rightInnerWidth = outerX + outerWidth - 2 - rightInnerX;

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
      drawBoldText("የብሎክ መጠን", rightInnerX + 1, tableY + 4);
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
        const blockName = c.blockName || c.block || "";
        const cons = c.consumption ?? c.consumptionAmount ?? "";
        const tariff = c.tariff ?? c.rate ?? "";
        const total = c.totalAmount ?? c.totalRateAmount ?? "";

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

      const isFrontOffice =
        reading.isPaidOnFrontOffice === true ||
        reading.isPaidOnFrontOffice === "true" ||
        (bill &&
          (bill.isPaidOnFrontOffice === true ||
            bill.isPaidOnFrontOffice === "true"));

      const isDerash =
        reading.isDerashPaid === true ||
        reading.isDerashPaid === "true" ||
        (bill && (bill.isDerashPaid === true || bill.isDerashPaid === "true"));

      const isUnicash =
        reading.isUnicashPaid === true ||
        reading.isUnicashPaid === "true" ||
        (bill && (bill.isUnicashPaid === true || bill.isUnicashPaid === "true"));

      const isMardaArif =
        reading.isMardaArifPaid === true ||
        reading.isMardaArifPaid === "true" ||
        (bill && (bill.isMardaArifPaid === true || bill.isMardaArifPaid === "true"));

      const isPaidThroughBank =
        reading.isPaidThroughBank === true ||
        reading.isPaidThroughBank === "true" ||
        (bill && (bill.isPaidThroughBank === true || bill.isPaidThroughBank === "true"));

      const derashBankName =
        reading?.billingBanks?.bankName ||
        reading?.billingBank?.bankName ||
        reading?.bankName ||
        (bill ? (bill.billingBanks?.bankName || bill.bankName) : null) ||
        "ደራሽ";

      const unicashBankName =
        reading?.uBankName ||
        reading?.UBankName ||
        reading?.ubankName ||
        reading?.uBillingBank?.bankName ||
        (bill ? (bill.uBankName || bill.UBankName || bill.ubankName || bill.uBillingBank?.bankName) : null) ||
        "ዩኒካሽ";

      const mardaBankName =
        reading?.mBillingBank?.bankName ||
        reading?.mBankName ||
        (bill ? bill.mBankName : null) ||
        "ማርዳአሪፍ";

      const genericBankName =
        reading?.bankName || (bill ? bill.bankName : null) || "ባንክ";

      const paymentLocations = [];
      if (isFrontOffice) {
        paymentLocations.push("ቢሮ");
      }
      if (isDerash) {
        paymentLocations.push(String(derashBankName).trim());
      }
      if (isUnicash) {
        paymentLocations.push(String(unicashBankName).trim());
      }
      if (isMardaArif) {
        paymentLocations.push(String(mardaBankName).trim());
      }
      if (!isDerash && !isUnicash && !isMardaArif && isPaidThroughBank) {
        paymentLocations.push(String(genericBankName).trim());
      }

      const uniqueLocations = Array.from(new Set(paymentLocations.filter(Boolean)));
      if (uniqueLocations.length === 0) {
        if (paymentLocation && paymentLocation !== "-") {
          uniqueLocations.push(paymentLocation);
        } else {
          uniqueLocations.push("-");
        }
      }

      const locationsText = uniqueLocations.join(", ");
      const fullLocationLine = `የተከፈለበት ቦታ: ${locationsText}`;

      doc.setFontSize(uniqueLocations.length > 2 ? 11 : 12);
      const splitLocationLines = doc.splitTextToSize(fullLocationLine, rightInnerWidth);
      let locY = rightY + 2;
      splitLocationLines.forEach((line) => {
        drawBoldText(line, rightInnerX, locY);
        locY += 4.5;
      });

      if (preview) {
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const previewWindow = window.open(pdfUrl, "_blank", "width=850,height=750");
        if (previewWindow) {
          previewWindow.onbeforeunload = () => {
            URL.revokeObjectURL(pdfUrl);
          };
        }
      } else {
        const rawAccount = accountNumber || bill.accountNumber || bill.customerAccountNumber || "unknown";
        const rawKifya = kifyaWer || bill.kifyaWer || "";
        const sanitize = (val) => String(val || "").replace(/[\\/:*?"<>|]/g, "_").trim() || "unknown";
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
    const paidAmount = bill.tekilalaYetekefele || bill.tekilalaTekefay || 0;
    generateReceiptPDF({ bill, amount: paidAmount, customer: lastCustomer }, preview);
    if (preview) {
      toast.info(`Receipt preview opened for Bill ID: ${bill.id}`);
    } else {
      toast.success(`Receipt downloaded for Bill ID: ${bill.id}`);
    }
  };

  const copyAccountNum = () => {
    if (lastCustomer?.accountNumber && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(lastCustomer.accountNumber);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
      toast.success("Account number copied to clipboard");
    }
  };

  // Calculations for quick KPIs
  const totalUnpaidAmount = bills.filter(unpaidFilter).reduce((sum, b) => sum + (b?.tekilalaTekefay || 0), 0);
  const totalWuzifAmount = wuzifBills.reduce((sum, w) => sum + (w?.tekilalaTekefay || 0), 0);
  const cashierDisplayName = session?.user?.name || session?.name || session?.user?.username || session?.username || "Authorized User";
  const branchName = session?.user?.branch?.branchName || session?.branch?.branchName || "Main Office";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ─── Top Hero / Header Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cashier Register • ቢሮ የክፍያ መስኮት
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-400" />
              የቢል ክፍያ (Cashier Payments)
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl">
              Front-office bill collection, arrears verification, instant cash change calculation, and Ethiopian water bill receipt generation.
            </p>
          </div>

          {/* Header Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">Cashier:</span>
              <span className="font-semibold text-white">{cashierDisplayName}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-600/60 font-mono">{branchName}</span>
            </div>

            {currentKifyaWer && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 text-xs">
                <Calendar className="w-4 h-4 text-amber-300" />
                <span className="text-indigo-200">Active Month:</span>
                <span className="font-bold text-amber-300">{currentKifyaWer}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {isAuthorizedCashier() ? (
                <span className="text-emerald-300 font-medium">Authorized to Collect Cash</span>
              ) : (
                <span className="text-amber-300 font-medium">Read-Only Mode</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Permission Warning Banner if not authorized */}
      {!isAuthorizedCashier() && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <strong>Read-Only Access:</strong> You can inspect customer bills and arrears, but recording payments requires the Cashier role or explicit permission in <em>Role Assignment &gt; Menu Access</em>.
          </div>
        </div>
      )}

      {/* ─── KPI Metric Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Billing Month */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ክፍያ ወር (Active Month)
            </span>
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {currentKifyaWer || "Loading..."}
            </div>
            <p className="text-xs text-gray-400">Allowed collection period</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Current Unpaid Bills */}
        <div
          onClick={() => setActiveTab("unpaid")}
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${activeTab === "unpaid" ? "ring-2 ring-indigo-500 border-indigo-400" : "border-gray-200 dark:border-gray-700"
            } flex items-center justify-between`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ያልተከፈለ ቢል (Unpaid)
            </span>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalUnpaidAmount.toLocaleString()} <span className="text-xs font-normal text-gray-400">ETB</span>
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {bills.filter(unpaidFilter).length} Current bill(s) ready
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Recent Receipts Recorded (Paid) */}
        <div
          onClick={() => setActiveTab("paid")}
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${activeTab === "paid" ? "ring-2 ring-emerald-500 border-emerald-400" : "border-gray-200 dark:border-gray-700"
            } flex items-center justify-between`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              የተከፈሉ ደረሰኞች (Paid)
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {paidBills.length} <span className="text-xs font-normal text-gray-400">Receipt(s)</span>
            </div>
            <p className="text-xs text-gray-400">Ready for instant reprint</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Arrears / Wuzif Notice */}
        <div
          onClick={() => setActiveTab("wuzif")}
          className={`rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${activeTab === "wuzif" ? "ring-2 ring-amber-500 border-amber-400" : ""
            } ${wuzifBills.length > 0
              ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              ያልተከፈለ ውዝፍ (Arrears)
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {totalWuzifAmount.toLocaleString()} <span className="text-xs font-normal text-gray-400">ETB</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {wuzifBills.length > 0 ? `${wuzifBills.length} Overdue bill(s) detected` : "Clean • No arrears"}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${wuzifBills.length > 0
              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400"
            }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value);
                setCustomerId("");
              }}
              placeholder="Enter Customer Account Number (e.g. ACC100234)..."
              disabled={loading}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/50 text-gray-900 dark:text-white font-medium focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
            {accountNumber && (
              <button
                type="button"
                onClick={() => {
                  setAccountNumber("");
                  setCustomerId("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !accountNumber.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search Bills</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ─── Customer Profile Card (VIP Summary) ─── */}
      {lastCustomer && lastCustomer.fullName && lastCustomer.fullName !== "-" && (
        <div className="bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800/90 rounded-2xl p-5 border border-indigo-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-indigo-100/60 dark:border-gray-700/80">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/20">
                {(lastCustomer.fullName[0] || "C").toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {lastCustomer.fullName}
                  </h3>
                  {lastCustomer.customerType && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {lastCustomer.customerType}
                    </span>
                  )}
                </div>
                {lastCustomer.fullNameEng && lastCustomer.fullNameEng !== lastCustomer.fullName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {lastCustomer.fullNameEng}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Badges */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={copyAccountNum}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 transition-colors"
                title="Click to copy account number"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{lastCustomer.accountNumber}</span>
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-300">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                <span>{lastCustomer.phoneNumber || "-"}</span>
              </div>

              {wuzifBills.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {wuzifBills.length} Arrears
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="w-3.5 h-3.5" />
                  No Arrears
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Last Successful Payment Quick Bar ─── */}
      {lastPayment && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4.5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <span>Payment Recorded Successfully!</span>
                <span className="px-2 py-0.5 rounded text-xs bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-mono">
                  Bill #{lastPayment.bill?.id}
                </span>
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Customer: <strong>{lastPayment.customer?.fullName || "-"}</strong> • Amount: <strong>{(lastPayment.amount || 0).toLocaleString()} ETB</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => generateReceiptPDF(lastPayment, true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview Receipt
            </button>
            <button
              onClick={() => generateReceiptPDF(lastPayment, false)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={() => handleDetailedReceipt(lastPayment.bill, true)}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Detail Breakdown
            </button>
          </div>
        </div>
      )}

      {/* ─── Tabs Navigation (Unpaid vs Paid History vs Wuzif Arrears) ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850">
          <button
            onClick={() => setActiveTab("unpaid")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === "unpaid"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>የአሁን ያልተከፈሉ ቢሎች (Current Unpaid)</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bills.filter(unpaidFilter).length > 0
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}>
              {bills.filter(unpaidFilter).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === "paid"
                ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <Receipt className="w-4 h-4" />
            <span>የተከፈሉ ደረሰኞች (Paid History)</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {paidBills.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("wuzif")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${activeTab === "wuzif"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>ያልተከፈለ ውዝፍ (Wuzif Arrears)</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${wuzifBills.length > 0
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}>
              {wuzifBills.length}
            </span>
          </button>
        </div>

        {/* ─── TAB 1: Current Unpaid Bills ─── */}
        {activeTab === "unpaid" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3.5 text-left">Bill ID</th>
                  <th className="px-6 py-3.5 text-left">Invoice No</th>
                  <th className="px-6 py-3.5 text-left">Period (ክፍያ ወር)</th>
                  <th className="px-6 py-3.5 text-right">Amount (ጠቅላላ ተከፋይ)</th>
                  <th className="px-6 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {bills.filter(unpaidFilter).map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      #{b.id}
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                      {b.billingInvoiceNumber || b.invoiceNumber || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Calendar className="w-3 h-3" />
                        {b.kifyaWer || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {(b.tekilalaTekefay || 0).toLocaleString()}
                      </span>{" "}
                      <span className="text-xs text-gray-400">ETB</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openPayDialog(b)}
                        disabled={
                          !isAuthorizedCashier() ||
                          (currentKifyaWer && (b?.kifyaWer || "").trim() !== currentKifyaWer.trim())
                        }
                        title={
                          !isAuthorizedCashier()
                            ? "Permission required"
                            : currentKifyaWer && (b?.kifyaWer || "").trim() !== currentKifyaWer.trim()
                              ? `ክፍያ የሚፈቀደው ለአሁኑ ወር (${currentKifyaWer}) ብቻ ነው`
                              : "Pay Bill"
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all font-semibold text-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Bill (ክፈል)</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {bills.filter(unpaidFilter).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">
                          {currentKifyaWer
                            ? `No unpaid bills found for the active month: ${currentKifyaWer}`
                            : "Enter an Account Number to look up customer bills"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 2: Paid Bills & Reprints (Moved to 2nd next to unpaid) ─── */}
        {activeTab === "paid" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3.5 text-left">Bill ID</th>
                  <th className="px-5 py-3.5 text-left">Invoice No</th>
                  <th className="px-5 py-3.5 text-left">Period</th>
                  <th className="px-5 py-3.5 text-right">Amount Paid</th>
                  <th className="px-5 py-3.5 text-left">Payment Date</th>
                  <th className="px-5 py-3.5 text-center">Method</th>
                  <th className="px-5 py-3.5 text-left">Location</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paidBills.map((b) => {
                  const dateHtml =
                    b.moneyCollectedDate ||
                    b.uMoneyCollectedDate ||
                    b.UMoneyCollectedDate ||
                    b.collectionDate ||
                    b.modifiedDate ||
                    b.registeredDate;

                  let ethDateText = "—";
                  if (dateHtml) {
                    try {
                      const ethDate = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(dateHtml));
                      ethDateText = EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(ethDate);
                    } catch (_) { }
                  }

                  const isOffice =
                    isTrue(b.isPaidOnFrontOffice) ||
                    (b.moneyCollector && b.moneyCollector !== "") ||
                    (b.cashierUser && b.cashierUser !== null) ||
                    (b.cashierFullName && b.cashierFullName !== "");

                  const bankLocName =
                    b.bankName ||
                    b.uBankName ||
                    b.UBankName ||
                    b.billingBank?.bankName ||
                    b.bankPaidAgentId ||
                    (isOffice ? "Front Office" : "Bank");

                  return (
                    <tr key={`paid-${b.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        #{b.id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-700 dark:text-gray-300">
                        {b.billingInvoiceNumber || b.invoiceNumber || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                        {b.kifyaWer || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                        {(b.tekilalaYetekefele || b.tekilalaTekefay || 0).toLocaleString()}{" "}
                        <span className="text-xs text-gray-400 font-normal">ETB</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400">
                        {ethDateText}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isOffice
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          }`}>
                          {isOffice ? "Office" : "Bank"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400">
                        {bankLocName}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleReprintReceipt(b, true)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400"
                            title="Preview PDF Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReprintReceipt(b, false)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-emerald-600 dark:text-emerald-400"
                            title="Download PDF Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDetailedReceipt(b, true)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400"
                            title="Detailed Consumption Breakdown"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paidBills.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No recent paid bills found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 3: Wuzif Arrears (Moved to 3rd) ─── */}
        {activeTab === "wuzif" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 uppercase text-xs tracking-wider border-b border-amber-200 dark:border-amber-800">
                <tr>
                  <th className="px-6 py-3.5 text-left">Wuzif ID</th>
                  <th className="px-6 py-3.5 text-left">Overdue Period (ክፍያ ወር)</th>
                  <th className="px-6 py-3.5 text-right">Arrears Due (የውዝፍ መጠን)</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {wuzifBills.map((w) => (
                  <tr key={`w-${w.id}`} className="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-amber-700 dark:text-amber-400">
                      #w-{w.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {w.kifyaWer || "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                        {(w.tekilalaTekefay || 0).toLocaleString()}
                      </span>{" "}
                      <span className="text-xs text-gray-400">ETB</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                        Unpaid Arrears
                      </span>
                    </td>
                  </tr>
                ))}

                {wuzifBills.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          Great! No overdue Wuzif arrears found for this customer.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── POS Cash Tender & Payment Confirmation Modal ─── */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-gray-50 to-indigo-50/40 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Confirm Cashier Payment
                  </h3>
                  <p className="text-xs text-gray-500">Record cash & print official receipt</p>
                </div>
              </div>
              <button
                onClick={closePayDialog}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Arrears Warning Banner if applicable */}
              {wuzifBills && wuzifBills.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Outstanding Arrears (ውዝፍ) Notice:</strong> This customer has{" "}
                    <strong>{wuzifBills.length}</strong> unpaid Wuzif bill(s) totaling{" "}
                    <strong className="underline">
                      {wuzifBills.reduce((acc, w) => acc + (w.tekilalaTekefay || 0), 0).toLocaleString()} ETB
                    </strong>
                    .
                  </div>
                </div>
              )}

              {/* Bill Details Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-blue-50/50 dark:from-gray-700/60 dark:to-gray-700/40 border border-indigo-100 dark:border-gray-600 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-indigo-700 dark:text-indigo-300 tracking-wider">
                    Total Amount Due
                  </span>
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    {(selectedBill?.tekilalaTekefay || 0).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-gray-500">ETB</span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                  <div>Bill ID: <span className="font-mono font-bold text-gray-900 dark:text-white">#{selectedBill?.id}</span></div>
                  <div>Invoice: <span className="font-mono text-gray-900 dark:text-white">{selectedBill?.billingInvoiceNumber || selectedBill?.invoiceNumber || "—"}</span></div>
                  <div>Period: <span className="font-medium text-gray-900 dark:text-white">{selectedBill?.kifyaWer || "—"}</span></div>
                </div>
              </div>

              {/* Tender Calculator Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Amount Received / Tendered (የተቀበሉት ገንዘብ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amountTendered}
                    onChange={(e) => handleAmountTenderedChange(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                    ETB
                  </span>
                </div>

                {/* Quick denomination chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-gray-400 mr-1">Quick:</span>
                  <button
                    type="button"
                    onClick={() => setQuickDenomination("exact")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-200 transition-colors"
                  >
                    Exact Due
                  </button>
                  {[50, 100, 200, 500, 1000].map((denom) => (
                    <button
                      key={denom}
                      type="button"
                      onClick={() => setQuickDenomination(denom)}
                      className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                    >
                      +{denom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Indicator Box */}
              {Number(amountTendered) > 0 && (
                <div
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${changeToReturn >= 0 && Number(amountTendered) >= (selectedBill?.tekilalaTekefay || 0)
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {changeToReturn > 0 ? (
                      <Coins className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                    )}
                    <div>
                      <div className="text-xs font-semibold">
                        {changeToReturn > 0
                          ? "Change to Return (የሚመለስ መልስ)"
                          : Number(amountTendered) === (selectedBill?.tekilalaTekefay || 0)
                            ? "Exact Amount Given"
                            : "Shortage (ያነሰ ገንዘብ)"}
                      </div>
                      <div className="text-lg font-black">
                        {changeToReturn > 0
                          ? `${changeToReturn.toLocaleString()} ETB`
                          : Number(amountTendered) === (selectedBill?.tekilalaTekefay || 0)
                            ? "0.00 ETB"
                            : `${((selectedBill?.tekilalaTekefay || 0) - Number(amountTendered)).toLocaleString()} ETB Remaining`}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remark */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Remark (optional)
                </label>
                <input
                  type="text"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Paid in cash at counter..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closePayDialog}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPay}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Confirm &amp; Issue Receipt</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
