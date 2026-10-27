"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import arifpayService from "@/app/lib/arifpayService";
import { ReadingService } from "@/app/lib/ReadingService";
import { CustomerService } from "@/app/lib/customerService";
import { CompanyProfileService } from "@/app/lib/companyProfileService";
import EthiopianCalendarConverterPure from "@/app/lib/ethiopianCalendarConverterPure";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../../fonts/nyala-normal"; // Import Amharic font for receipts
import {
  CreditCard,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Phone,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  DollarSign,
  Filter,
  Receipt,
  Layers,
  Calendar,
  Copy,
  Check,
  Download,
  Eye,
  Printer,
  Sparkles,
  Coins,
  Settings,
} from "lucide-react";

const readingService = new ReadingService();
const customerService = new CustomerService();
const companyProfileService = new CompanyProfileService();

export default function PayWithArifpayPage() {
  const { data: session } = useSession();
  const [customerId, setCustomerId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [wuzifBills, setWuzifBills] = useState([]);
  const [paidBills, setPaidBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [lastCustomer, setLastCustomer] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);
  const [currentKifyaWer, setCurrentKifyaWer] = useState("");
  const [companyProfile, setCompanyProfile] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [activeTab, setActiveTab] = useState("unpaid"); // "unpaid" | "paid" | "wuzif"
  const [copiedAcc, setCopiedAcc] = useState(false);

  // ArifPay Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

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

  // Check authorization
  const isAuthorized = () => {
    const sessionRoles = session?.user?.roles || session?.roles || [];
    const sessionPermitted = session?.user?.permittedPages || session?.permittedPages || [];

    if (Array.isArray(sessionPermitted) && (sessionPermitted.includes("payWithArifpay") || sessionPermitted.includes("cashier"))) {
      return true;
    }

    const allRoles = [...sessionRoles];
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("user_token");
        if (raw) {
          const parsed = JSON.parse(raw);
          const localRoles = parsed?.roles || parsed?.authorities || parsed?.user?.roles || [];
          if (Array.isArray(localRoles)) allRoles.push(...localRoles);
          const localPermitted = parsed?.permittedPages || parsed?.user?.permittedPages || [];
          if (Array.isArray(localPermitted) && (localPermitted.includes("payWithArifpay") || localPermitted.includes("cashier"))) {
            return true;
          }
        }
      } catch (_) {}
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
      const activeMonth = profile?.activeBillingMonth;
      if (activeMonth) {
        const et = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(activeMonth));
        const monthName = EthiopianCalendarConverterPure.getEthiopianMonthNameAmharic(et.month);
        const kifyaWerFormatted = `${monthName}, ${et.year}`;
        setCurrentKifyaWer(kifyaWerFormatted);
        return kifyaWerFormatted;
      }
    } catch (e) {
      console.warn("PayWithArifpay: Could not load active billing month", e);
    }
    return "";
  };

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

  // Handle return redirect from ArifPay gateway
  useEffect(() => {
    fetchActiveBillingMonth();
    loadImageAsBase64("/images/logo/logo.png").then(setLogoBase64);

    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const sessionId = params.get("sessionId");

    if (status) {
      // Clear query params to prevent duplicate verification on browser reload
      window.history.replaceState({}, document.title, window.location.pathname);

      if (status === "success" && sessionId) {
        toast.info("Verifying ArifPay payment status...", { autoClose: 4000 });
        arifpayService
          .checkStatus(sessionId)
          .then(async (res) => {
            if (res.status === "SUCCESS") {
              toast.success("Bill payment successfully confirmed with ArifPay!", { autoClose: 7000 });

              // Retrieve updated reading to prepare receipt preview
              if (res.readingId) {
                try {
                  const updatedBill = await readingService.getReadingById(res.readingId);
                  if (updatedBill) {
                    setLastPayment({
                      bill: updatedBill,
                      amount: updatedBill.tekilalaYetekefele || updatedBill.tekilalaTekefay || 0,
                      customer: {
                        fullName: updatedBill.customerFullName || updatedBill.customerName || "-",
                        accountNumber: updatedBill.customerAccountNumber || updatedBill.accountNumber || "-",
                        phoneNumber: updatedBill.customerPhoneMobile || updatedBill.phoneNumber || "-",
                        customerType: updatedBill.customerTypeName || updatedBill.customerType || "-",
                      },
                    });
                  }
                } catch (_) {}
              }
            } else {
              toast.warn(`ArifPay payment status: ${res.status || "Pending"}`, { autoClose: 6000 });
            }
          })
          .catch((err) => {
            console.error("Status check error:", err);
            toast.error(`Verification error: ${err.message || "Failed to confirm payment status"}`);
          });
      } else if (status === "cancel") {
        toast.warn("Payment was cancelled by user.", { autoClose: 5000 });
      } else if (status === "error") {
        toast.error("An error occurred during ArifPay payment.", { autoClose: 6000 });
      }
    }
  }, []);

  // Main customer search by account number (cashier page strategy)
  const handleSearch = async () => {
    try {
      setLoading(true);
      setBills([]);
      setWuzifBills([]);
      setPaidBills([]);

      let idToSearch = customerId;
      let customerDto = null;

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
          console.error("PayWithArifpay: getCustomerByAccountNumber failed", e);
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

      // 1) Filter unpaid bills for active month
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

      // 2) Unpaid arrears (Wuzif)
      const rawWuzif = Array.isArray(res?.wuzifBills) ? res.wuzifBills : [];
      const unpaidWuzif = rawWuzif.filter(
        (w) => w?.wuzifDeleted === "active" && w?.wuzifIsMoneyCollected === false
      );
      setWuzifBills(unpaidWuzif);

      // 3) Paid bills history (last 10)
      const paidOnly = (Array.isArray(regular) ? regular : []).filter(
        (b) => Boolean(b?.isBillGenerated) && !b?.isVoid && normalizeMoneyCollected(b)
      );
      const sortedPaid = paidOnly
        .sort((a, b) => {
          const dateA = new Date(a.moneyCollectedDate || a.collectionDate || 0);
          const dateB = new Date(b.moneyCollectedDate || b.collectionDate || 0);
          return dateB - dateA;
        })
        .slice(0, 10);
      setPaidBills(sortedPaid);

      // Customer cache for banner & receipt
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

      // Default active tab: if no current unpaid bills but arrears exist, show wuzif
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

  // Open ArifPay Modal
  const handleOpenArifpayModal = (bill) => {
    if (!bill) return;
    if (currentKifyaWer && (bill?.kifyaWer || "").trim() !== currentKifyaWer.trim()) {
      toast.error(`ክፍያ የሚፈቀደው ለአሁኑ ንቁ ወር (${currentKifyaWer}) ብቻ ነው።`);
      return;
    }
    setSelectedBill(bill);

    // Pre-fill phone digits (last 9 digits after 251 or 09)
    let digits = "";
    const rawPhone = lastCustomer?.phoneNumber || bill.customerPhoneMobile || bill.phoneNumber;
    if (rawPhone) {
      const cleaned = String(rawPhone).replace(/\D/g, "");
      if (cleaned.length >= 9) {
        digits = cleaned.slice(-9);
      } else {
        digits = cleaned;
      }
    }
    setPhoneDigits(digits);
    setSubmittingPayment(false);
    setIsModalOpen(true);
  };

  // Submit ArifPay Checkout Session
  const handleSubmitArifpayPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || submittingPayment) return;

    const trimmed = phoneDigits.trim();
    if (!/^\d{9}$/.test(trimmed)) {
      toast.error("Please enter exactly 9 digits after 251 (e.g. 911223344)");
      return;
    }

    const phone = "251" + trimmed;
    setSubmittingPayment(true);

    try {
      toast.info("Connecting to ArifPay checkout gateway...", { autoClose: 2500 });
      const res = await arifpayService.initiatePayment(selectedBill.id, phone);

      if (res && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Failed to receive checkout URL from ArifPay");
        setSubmittingPayment(false);
      }
    } catch (err) {
      console.error("ArifPay initiate error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to initiate ArifPay payment");
      setSubmittingPayment(false);
    }
  };

  // Copy account number helper
  const copyAccountNum = () => {
    if (lastCustomer?.accountNumber && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(lastCustomer.accountNumber);
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
      toast.success("Account number copied to clipboard");
    }
  };

  // Receipt PDF Generation (adapted from cashier)
  const generateReceiptPDF = ({ bill, amount, customer }, preview = true) => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 150], // Receipt format
      });

      // Register Amharic font
      try {
        doc.setFont("nyala-normal");
      } catch (_) {}

      doc.setFontSize(14);
      doc.text(companyProfile?.companyNameAmh || companyProfile?.companyName || "የውሃ አገልግሎት ቢሮ", 40, 12, { align: "center" });

      doc.setFontSize(10);
      doc.text("የአሪፍፔይ ክፍያ ደረሰኝ (ArifPay Receipt)", 40, 18, { align: "center" });

      doc.setLineWidth(0.3);
      doc.line(6, 22, 74, 22);

      let y = 28;
      const row = (label, val) => {
        doc.setFontSize(9);
        doc.text(label, 8, y);
        doc.text(String(val || "-"), 72, y, { align: "right" });
        y += 5.5;
      };

      row("ደረሰኝ ቁጥር:", bill.billingInvoiceNumber || bill.invoiceNumber || `ID-${bill.id}`);
      row("የደንበኛ መለያ:", customer?.accountNumber || bill.accountNumber || bill.customerId);
      row("የደንበኛ ስም:", customer?.fullName || bill.customerFullName || bill.customerName);
      row("የክፍያ ወር:", bill.kifyaWer || currentKifyaWer);
      row("የክፍያ ዓይነት:", "ArifPay (Electronic)");
      row("ትራንዛክሽን:", bill.mBankPaidConfirmationCode || "ARIFPAY-ELECTRONIC");

      const paidDate = bill.moneyCollectedDate || new Date();
      try {
        const etDate = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(paidDate));
        row("ቀን:", EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(etDate));
      } catch (_) {
        row("ቀን:", new Date().toLocaleDateString());
      }

      doc.line(6, y + 1, 74, y + 1);
      y += 6;

      doc.setFontSize(11);
      doc.text("የተከፈለ መጠን (Amount Paid):", 8, y);
      y += 6;
      doc.setFontSize(13);
      doc.text(`${Number(amount || bill.tekilalaTekefay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB`, 72, y, { align: "right" });

      y += 10;
      doc.setFontSize(8);
      doc.text("ስለከፈሉ እናመሰግናለን! • Thank You!", 40, y, { align: "center" });

      if (preview) {
        const blobUrl = URL.createObjectURL(doc.output("blob"));
        window.open(blobUrl, "_blank", "width=500,height=700");
      } else {
        doc.save(`ArifPay_Receipt_${bill.id}.pdf`);
      }
    } catch (e) {
      console.error("Receipt generation error:", e);
      toast.error("Failed to generate receipt PDF");
    }
  };

  // Quick KPI calculations
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
              ArifPay Register • አሪፍፔይ የክፍያ መስኮት
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-indigo-400" />
              የቢል ክፍያ በአሪፍፔይ (Pay with Arifpay)
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl">
              Look up customer bills by account number, verify arrears, and initiate secure electronic payments via Telebirr, CBE, and Awash Birr through ArifPay.
            </p>
          </div>

          {/* Header Badges */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-300">User:</span>
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

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isAuthorized() ? (
                  <span className="text-emerald-300 font-medium">Authorized to Initiate Payments</span>
                ) : (
                  <span className="text-amber-300 font-medium">Read-Only Mode</span>
                )}
              </div>

              <Link
                href="/ui/manager/arifpaySetting"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white border border-white/20 transition active:scale-95 shadow-sm"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-300" />
                <span>API Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeTab === "unpaid" ? "ring-2 ring-indigo-500 border-indigo-400" : "border-gray-200 dark:border-gray-700"
          } flex items-center justify-between`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              ያልተከፈለ ቢል (Unpaid)
            </span>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalUnpaidAmount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-gray-400">ETB</span>
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
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
            activeTab === "paid" ? "ring-2 ring-emerald-500 border-emerald-400" : "border-gray-200 dark:border-gray-700"
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
          className={`rounded-xl p-4 shadow-sm border cursor-pointer transition-all hover:shadow-md flex items-center justify-between ${
            activeTab === "wuzif" ? "ring-2 ring-amber-500 border-amber-400" : ""
          } ${
            wuzifBills.length > 0
              ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              ያልተከፈለ ውዝፍ (Arrears)
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {totalWuzifAmount.toLocaleString()}{" "}
              <span className="text-xs font-normal text-gray-400">ETB</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {wuzifBills.length > 0 ? `${wuzifBills.length} Overdue bill(s) detected` : "Clean • No arrears"}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              wuzifBills.length > 0
                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
                : "bg-gray-100 dark:bg-gray-700 text-gray-400"
            }`}
          >
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
                <span>Search Customer Bills</span>
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
                <span>Payment Confirmed via ArifPay!</span>
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
          </div>
        </div>
      )}

      {/* ─── Tabs Navigation (Unpaid vs Paid History vs Wuzif Arrears) ─── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-850">
          <button
            onClick={() => setActiveTab("unpaid")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "unpaid"
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>የአሁን ያልተከፈሉ ቢሎች (Current Unpaid)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                bills.filter(unpaidFilter).length > 0
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {bills.filter(unpaidFilter).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "paid"
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
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "wuzif"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-800"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>ያልተከፈለ ውዝፍ (Wuzif Arrears)</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                wuzifBills.length > 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
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
                  <th className="px-6 py-3.5 text-right">Consumption (m³)</th>
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
                    <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                      {b.consumption ?? b.consumptionWuzif ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {(b.tekilalaTekefay || 0).toLocaleString()}
                      </span>{" "}
                      <span className="text-xs text-gray-400">ETB</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleOpenArifpayModal(b)}
                        disabled={
                          !isAuthorized() ||
                          (currentKifyaWer && (b?.kifyaWer || "").trim() !== currentKifyaWer.trim())
                        }
                        title={
                          !isAuthorized()
                            ? "Permission required"
                            : currentKifyaWer && (b?.kifyaWer || "").trim() !== currentKifyaWer.trim()
                            ? `ክፍያ የሚፈቀደው ለአሁኑ ወር (${currentKifyaWer}) ብቻ ነው`
                            : "Pay with ArifPay"
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition-all font-semibold text-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay with Arifpay (በአሪፍፔይ ክፈል)</span>
                      </button>
                    </td>
                  </tr>
                ))}

                {bills.filter(unpaidFilter).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm font-medium">
                          {accountNumber
                            ? `No unpaid bills found for this customer for ${currentKifyaWer || "the active month"}.`
                            : "Enter a Customer Account Number above to load bills."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 2: Paid History ─── */}
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
                  <th className="px-5 py-3.5 text-center">Collector / Method</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paidBills.map((b) => {
                  const dateVal = b.moneyCollectedDate || b.collectionDate || b.modifiedDate;
                  let ethDateText = "—";
                  if (dateVal) {
                    try {
                      const ethDate = EthiopianCalendarConverterPure.gregorianToEthiopian(new Date(dateVal));
                      ethDateText = EthiopianCalendarConverterPure.formatEthiopianDateWithAmharicMonth(ethDate);
                    } catch (_) {}
                  }

                  const isArifPayPaid = b.isMardaArifPaid || b.moneyCollector === "Arifpay";

                  return (
                    <tr key={`paid-${b.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        #{b.id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-700 dark:text-gray-300">
                        {b.billingInvoiceNumber || b.invoiceNumber || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">
                        {b.kifyaWer || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {(b.tekilalaYetekefele || b.tekilalaTekefay || 0).toLocaleString()} ETB
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300 text-xs">
                        {ethDateText}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isArifPayPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            <CreditCard className="w-3 h-3" />
                            ArifPay
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {b.moneyCollector || "Front Office"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => generateReceiptPDF({ bill: b, amount: b.tekilalaYetekefele || b.tekilalaTekefay, customer: lastCustomer }, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          Receipt
                        </button>
                        <button
                          onClick={() => generateReceiptPDF({ bill: b, amount: b.tekilalaYetekefele || b.tekilalaTekefay, customer: lastCustomer }, false)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {paidBills.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No recent paid bills found for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── TAB 3: Wuzif Arrears ─── */}
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

      {/* ─── ArifPay Payment Checkout Modal ─── */}
      {isModalOpen && selectedBill && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => !submittingPayment && setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl p-6 text-gray-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Pay with ArifPay</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Telebirr • CBE • Awash Birr</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !submittingPayment && setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitArifpayPayment} className="mt-4 space-y-4">
              {/* Arrears Warning Banner if applicable */}
              {wuzifBills.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Outstanding Arrears (ውዝፍ) Notice:</strong> This customer has{" "}
                    <strong>{wuzifBills.length}</strong> unpaid arrears bill(s) totaling{" "}
                    <strong>
                      {wuzifBills.reduce((acc, w) => acc + (w.tekilalaTekefay || 0), 0).toLocaleString()} ETB
                    </strong>
                    .
                  </div>
                </div>
              )}

              {/* Bill Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Customer:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {lastCustomer?.fullName || selectedBill.customerFullName || selectedBill.customerName || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Account No:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {lastCustomer?.accountNumber || selectedBill.accountNumber || selectedBill.customerId || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Bill ID / Inv:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    #{selectedBill.id} ({selectedBill.billingInvoiceNumber || selectedBill.invoiceNumber || "—"})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Period:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedBill.kifyaWer || currentKifyaWer}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">Total Amount Due:</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                    {Number(selectedBill.tekilalaTekefay || selectedBill.totalAmount || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}{" "}
                    ETB
                  </span>
                </div>
              </div>

              {/* Phone Input with 251 Prefix */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  Payer&apos;s Mobile Number (የከፋይ ስልክ ቁጥር)
                </label>
                <div className="flex items-stretch rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-white dark:bg-gray-700">
                  <span className="flex items-center justify-center px-3.5 bg-gray-100 dark:bg-gray-600 border-r border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 select-none">
                    251
                  </span>
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="9XXXXXXXX"
                    value={phoneDigits}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, "");
                      setPhoneDigits(numeric);
                    }}
                    autoFocus
                    required
                    className="flex-1 px-3 py-2 text-sm font-semibold tracking-wider bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                  />
                </div>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Enter the 9 digits after 251 (e.g. 911223344)
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submittingPayment}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all disabled:opacity-50"
                >
                  {submittingPayment ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting to ArifPay...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-3.5 h-3.5" />
                      Pay with Arifpay (በአሪፍፔይ ክፈል)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
