"use client";
import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  CircularProgress,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  FormControlLabel,
  Checkbox,
  TextField,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "../../../lib/ReadingService";
import { DropdownService } from "../../../lib/dropdownService";
import { CampanyProfileService } from "../../../lib/campanyProfileService";
import ReadingDetailModal from "../../components/ReadingDetailModal";
import BankPaymentImportModal from "./BankPaymentImportModal";
import UnicashPaymentImportModal from "./UnicashPaymentImportModal";
var ethiopianDate = require("ethiopian-date");
import EtDatePicker from "mui-ethiopian-datepicker";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./nyala-normal"; // register Nyala font for Amharic
import * as XLSX from "xlsx";
import { BillingBanksService } from "../../../lib/billingBanksService";
import { SmsService } from "../../../lib/smsService";

const readingService = new ReadingService();
const dropdownService = new DropdownService();
const campanyProfileService = new CampanyProfileService();
const billingBanksService = new BillingBanksService();
const smsService = new SmsService();

const ethiopianMonths = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታህሣሥ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዚያ",
  "ግንቦት",
  "ሰኔ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

const BillList = () => {
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [viewReadingId, setViewReadingId] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [unicashImportModalOpen, setUnicashImportModalOpen] = useState(false);

  // >>> ADDED: State for new client-side filters
  //const [filteredData, setFilteredData] = useState([]);
  const [filterDerashPaid, setFilterDerashPaid] = useState(false);
  const [filterPaidOnFrontOffice, setFilterPaidOnFrontOffice] = useState(false);
  const [filterUnicashPaid, setFilterUnicashPaid] = useState(false);
  const [filterPrepaid, setFilterPrepaid] = useState(false);
  const [filterMoneyCollected, setFilterMoneyCollected] = useState("all");
  const [filterSmsSent, setFilterSmsSent] = useState("all");
  const [wuzifMonthsOp, setWuzifMonthsOp] = useState("eq");
  const [wuzifMonthsVal, setWuzifMonthsVal] = useState("");
  // Zero Reading Filter State
  const [zeroReadingMonthsOp, setZeroReadingMonthsOp] = useState("eq");
  const [zeroReadingMonthsVal, setZeroReadingMonthsVal] = useState("");

  const [filterVoidChangedCustomers, setFilterVoidChangedCustomers] = useState(false);
  const [isBulkKitatTransferring, setIsBulkKitatTransferring] = useState(false);
  const [isBulkSmsSending, setIsBulkSmsSending] = useState(false);
  const [isBulkSmsSendingJasmin, setIsBulkSmsSendingJasmin] = useState(false);
  const [isBackendBulkSmsSending, setIsBackendBulkSmsSending] = useState(false);
  const [anchorElExtra, setAnchorElExtra] = useState(null);
  const [filterCustomerStatus, setFilterCustomerStatus] = useState("all");

  // >>> UPDATED: Due date using Ethiopian date picker, store GC string for CSV
  const [bankDueDate, setBankDueDate] = useState(""); // GC formatted yyyy-mm-dd
  const [bankDueDateEC, setBankDueDateEC] = useState(null); // EtDatePicker value (Date)

  const formatDateGC = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSendBulkSmsFromBackendForFilteredBills = async () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to send SMS.");
      return;
    }

    if (!(bankDueDateEC instanceof Date) || isNaN(bankDueDateEC)) {
      toast.info("Please select a due date (EC) before sending backend bulk SMS.");
      return;
    }

    const ids = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!ids.length) {
      toast.info("No bill IDs found in filtered data.");
      return;
    }

    let smsDueDateText = "";
    if (bankDueDateEC instanceof Date && !isNaN(bankDueDateEC)) {
      const [ey, em, ed] = ethiopianDate.toEthiopian(
        bankDueDateEC.getFullYear(),
        bankDueDateEC.getMonth() + 1,
        bankDueDateEC.getDate()
      );
      const ecMonthName = ethiopianMonths[em - 1] || "";
      smsDueDateText = `${ecMonthName} ${ed}`;
    } else if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      smsDueDateText = `${selectedKifyaWerMonth} ${selectedKifyaWerYear}`;
    }

    const monthYearPart =
      selectedKifyaWerMonth && selectedKifyaWerYear
        ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear} `
        : "";

    setIsBackendBulkSmsSending(true);
    try {
      const result = await smsService.sendBulkBillSms(ids, {
        smsDueDateText,
        monthYearPart,
      });
      const sent = result?.sent ?? 0;
      const failed = result?.failed ?? 0;
      if (sent > 0) {
        const base = `Backend SMS sent for ${sent} bill(s).`;
        const msg = failed > 0 ? `${base} ${failed} failed.` : base;
        toast.success(msg);
      } else if (failed > 0) {
        toast.error("Backend bulk SMS failed for all bills.");
      } else {
        toast.info("No SMS attempted by backend for the selected bills.");
      }
    } catch (error) {
      console.error("Error sending backend bulk SMS", error);
      toast.error(error?.message || "Error sending backend bulk SMS.");
    } finally {
      setIsBackendBulkSmsSending(false);
    }
  };


  // Dropdown selections (same pattern as customerList first table)
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");

  const currentGregorianDate = new Date();
  const [ethYear, ethMonth, ethDay] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = ethYear - 5; i <= ethYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [ethYear]);

  useEffect(() => {
    // Do not preselect month/year. Wait for user to choose and click Filter Bills.
  }, [ethYear, ethMonth]);

  // Fetch dropdown options (copied pattern from customerList/page.js)
  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
  });

  // Load banks for mapping codes to full bank names
  const { data: banks = [] } = useQuery({
    queryKey: ["billingBanksAll"],
    queryFn: async () => {
      try {
        const res = await billingBanksService.getAllBillingBanks();
        return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Failed to load banks:", e);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const lookupBankName = (agentName) => {
    if (!agentName || !Array.isArray(banks) || banks.length === 0) return agentName;
    let bank =
      banks.find((b) => b.bankCode === agentName) ||
      banks.find((b) => b.gatewayCode === agentName) ||
      banks.find((b) => (b.bankName || "").toLowerCase().includes(String(agentName).toLowerCase()));
    return bank ? bank.bankName : agentName;
  };

  // Helper: extract kebele id from bill DTO and map to kebele name
  const getKebeleIdFromBill = (bill) => {
    if (!bill) return null;
    const keys = ["addressStreetsId", "kebeleId", "customerKebeleId"];
    for (const k of keys) {
      if (bill[k] !== undefined && bill[k] !== null && bill[k] !== "") {
        return bill[k];
      }
    }
    return null;
  };

  // >>> ADDED: Export filtered table to Bank CSV format
  const handleExportBankCSV = () => {
    try {
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        toast.info("No rows to export. Apply filters and try again.");
        return;
      }
      if (!bankDueDate) {
        toast.info("Please select a due date (Gregorian) before exporting CSV.");
        return;
      }

      // CSV Headers
      const headers = [
        "bill_id",
        "bill_description",
        "bill_reason",
        "amount_due",
        "customer_id",
        "name",
        "partial_pay_allowed",
        "due_date",
        "mobile",
        "email",
      ];

      const MOBILE_DEFAULT = "0900000000"; // constant as per example
      const EMAIL_DEFAULT = "abc@gmail.com"; // constant as requested

      // CSV rows from filteredData
      // Helper: Ethiopian month transliterations (English words)
      const ethMonthsAmh = [
        "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
      ];
      const ethMonthsEng = [
        "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehasse", "Pagumen"
      ];
      const getEnglishEthMonth = (kifyaWerVal) => {
        if (!kifyaWerVal || typeof kifyaWerVal !== "string") return null;
        // Try match Amharic month first
        for (let i = 0; i < ethMonthsAmh.length; i++) {
          if (kifyaWerVal.includes(ethMonthsAmh[i])) return ethMonthsEng[i];
        }
        // If already contains one of English transliterations, return it
        for (let i = 0; i < ethMonthsEng.length; i++) {
          if (kifyaWerVal.toLowerCase().includes(ethMonthsEng[i].toLowerCase())) return ethMonthsEng[i];
        }
        return null;
      };

      const rows = filteredData.map((row) => {
        const billId = row.billingInvoiceNumber ?? row.invoiceNumber ?? "";
        const billDescription = row.billDescriptionBank ?? "";
        const kifya = row.kifyaWer ?? "";
        const englishEthMonth = getEnglishEthMonth(kifya);
        const yearMatch = (kifya || "").match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : "";
        const billReason = englishEthMonth
          ? `Bill for Period: ${englishEthMonth}${year ? "; " + year : ""}`
          : `Bill for Period: ${kifya}`;
        const amountDue = row.tekilalaTekefay ?? 0;
        const customerId = row.customerAccountNumber ?? row.accountNumber ?? "";
        const name =
          row.customerFullNameEng ??
          row.fullNameEng ??
          row.customerFullName ??
          row.customerName ??
          "";
        const partialPayAllowed = "FALSE";
        const dueDate = bankDueDate; // yyyy-mm-dd, already Gregorian
        const mobile = MOBILE_DEFAULT;
        const email = EMAIL_DEFAULT;

        return [
          billId,
          billDescription,
          billReason,
          amountDue,
          customerId,
          name,
          partialPayAllowed,
          dueDate,
          mobile,
          email,
        ];
      });

      // CSV serialize with escaping
      const escapeCSV = (val) => {
        const s = String(val ?? "");
        if (s.includes(",") || s.includes("\n") || s.includes('"')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");

      const now = new Date();
      const [ecYf, ecMf, ecDf] = ethiopianDate.toEthiopian(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      const todayStr = `${ecYf}-${String(ecMf).padStart(2, "0")}-${String(ecDf).padStart(2, "0")}`;
      // Use same logic as line 198 to derive English EC month from available data
      const sampleKifyaForFile = Array.isArray(filteredData) && filteredData.length > 0 ? (filteredData[0]?.kifyaWer ?? "") : "";
      const englishEthMonthForFile = getEnglishEthMonth(sampleKifyaForFile) || "";
      // Append the selected year next to the month, similar to how year is used around line 200
      const monthWithYear = englishEthMonthForFile
        ? `${englishEthMonthForFile}${selectedKifyaWerYear ? "_" + selectedKifyaWerYear : ""}`
        : (selectedKifyaWerMonth ? `${selectedKifyaWerMonth}${selectedKifyaWerYear ? "_" + selectedKifyaWerYear : ""}` : "");
      const locationEng = companyProfile?.locationEng || "";
      // Put today's EC date in brackets as requested
      const baseFileName = [locationEng, monthWithYear, `(${todayStr})`]
        .filter(Boolean)
        .join("_")
        .replace(/\s+/g, "_");
      const fileName = `${baseFileName || "bank_export_" + todayStr}.csv`;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Bank CSV exported successfully");
    } catch (e) {
      console.error("CSV export failed", e);
      toast.error("Failed to export Bank CSV");
    }
  };

  const getKebeleNameById = (id) => {
    if (!id || !Array.isArray(kebeles)) return null;
    const item = kebeles.find((k) => String(k.id) === String(id));
    return item?.name || null;
  };

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
  });

  const { data: ketenas = [], isLoading: isKetenasLoading } = useQuery({
    queryKey: ["ketenas", selectedKebeleId],
    queryFn: () => {
      if (!selectedKebeleId) return [];
      return dropdownService.getKetenasByKebele(selectedKebeleId);
    },
    enabled: !!selectedKebeleId,
  });

  const { data: readers = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return [];
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
    enabled: !!selectedBranchId,
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
  });

  // Fetch all billing banks (for dynamic bank name lookup)
  const { data: allBillingBanks = [] } = useQuery({
    queryKey: ["billing-banks-all"],
    queryFn: () => billingBanksService.getAllBillingBanks(),
    staleTime: 10 * 60 * 1000,
  });

  // Build a lookup map from bankCode/gatewayCode to bankName
  const bankLookup = useMemo(() => {
    const map = {};
    if (Array.isArray(allBillingBanks)) {
      allBillingBanks.forEach((b) => {
        const name = b?.bankName;
        const bankCode = b?.bankCode;
        const gatewayCode = b?.gatewayCode;
        if (name) {
          if (bankCode !== undefined && bankCode !== null && bankCode !== "") {
            map[String(bankCode)] = name;
          }
          if (gatewayCode !== undefined && gatewayCode !== null && gatewayCode !== "") {
            map[String(gatewayCode)] = name;
          }
        }
      });
    }
    return map;
  }, [allBillingBanks]);

  // Unified helper to get bank name from bill code using dynamic lookup
  const getBankName = (code) => {
    if (code === undefined || code === null || code === "") return null;
    const key = String(code);
    return bankLookup[key] || "Unknown Bank";
  };

  const {
    data: readings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["filteredReadings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
        const [activeList, deletedBillFiltered, deletedFiltered] = await Promise.all([
          readingService.getBillFilteredReadings("ACTIVE", kifyaWerFormatted).catch(() => []),
          readingService.getBillFilteredReadings("DELETED", kifyaWerFormatted).catch(() => []),
          readingService.getFilteredReadings("DELETED", kifyaWerFormatted).catch(() => []),
        ]);
        const merged = [...(activeList || []), ...(deletedBillFiltered || []), ...(deletedFiltered || [])];
        const byId = new Map();
        merged.forEach((it) => {
          const key = it?.id ?? it?.billingInvoiceNumber ?? it?.invoiceNumber ?? Math.random();
          if (!byId.has(key)) byId.set(key, it);
        });
        const arr = Array.from(byId.values());
        return arr.map((it) => {
          const isVoid = !!(it?.isVoid || it?.void || String(it?.status).toLowerCase() === "deleted");
          return { ...it, isVoid: isVoid, void: isVoid || it?.void };
        });
      }
      return [];
    },
    // Auto-fetch when month and year are selected; Filter Bills button also calls refetch()
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      try {
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          // Print available keys and sample of likely mapping fields
          // console.log("[BillList] First bill keys:", Object.keys(first));
          const candidates = [
            "addressStreetsId",
            "kebeleId",
            "customerKebeleId",
            "addressKetenaId",
            "ketenaId",
            "branchsId",
            "branchId",
            "assignedReaderId",
            "readerId",
          ];
          const sample = candidates.reduce((acc, k) => {
            acc[k] = first?.[k];
            return acc;
          }, {});
          // console.log("[BillList] Candidate field samples:", sample);
        }
      } catch (_) { }
    },
    onError: (error) => {
      toast.error("Failed to load bills: " + error.message);
    },
  });

  const voidChangedComparisons = useMemo(() => {
    if (!Array.isArray(readings) || readings.length === 0) return [];

    let items = [...readings];

    const matchesAnyKey = (obj, keys, value) =>
      keys.some((k) => obj?.[k] !== undefined && String(obj[k]) === String(value));

    if (selectedKebeleId) {
      const kebeleKeys = ["addressStreetsId", "kebeleId", "customerKebeleId"];
      items = items.filter((r) => matchesAnyKey(r, kebeleKeys, selectedKebeleId));
    }
    if (selectedKetenaId) {
      const ketenaKeys = ["addressKetenaId", "ketenaId"];
      items = items.filter((r) => matchesAnyKey(r, ketenaKeys, selectedKetenaId));
    }
    if (selectedBranchId) {
      const branchKeys = ["branchsId", "branchId"];
      items = items.filter((r) => matchesAnyKey(r, branchKeys, selectedBranchId));
    }
    if (selectedReaderId) {
      const readerKeys = ["assignedReaderId", "readerId"];
      items = items.filter((r) => matchesAnyKey(r, readerKeys, selectedReaderId));
    }
    if (selectedCustomerTypeId) {
      items = items.filter(
        (r) => r?.customerTypeId !== undefined && String(r.customerTypeId) === String(selectedCustomerTypeId)
      );
    }

    const getAcct = (b) => b?.customerAccountNumber ?? b?.accountNumber ?? b?.customerId ?? null;
    const getId = (b) => (b?.id !== undefined ? Number(b.id) : NaN);
    const getInv = (b) => b?.billingInvoiceNumber ?? b?.invoiceNumber ?? "";
    const getTekefay = (b) => Number(b?.tekilalaTekefay ?? 0) || 0;
    const getCreatedTs = (b) => {
      const d = b?.createdAt || b?.createdDate || b?.registeredDate || b?.created_on || b?.createdOn || b?.created;
      const t = d ? Date.parse(d) : NaN;
      return Number.isNaN(t) ? null : t;
    };
    const isBillGeneratedTrue = (b) =>
      b?.isBillGenerated === true ||
      b?.isBillGenerated === 1 ||
      (typeof b?.isBillGenerated === "string" && b?.isBillGenerated.toLowerCase() === "true");

    const groups = new Map();
    items.forEach((b) => {
      const acct = getAcct(b);
      const kifya = b?.kifyaWer ?? "";
      if (!acct) return;
      const key = `${acct}__${kifya}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(b);
    });

    const result = [];
    groups.forEach((list) => {
      const voids = list.filter((x) => (x?.isVoid || x?.void) && isBillGeneratedTrue(x));
      if (voids.length === 0) return;
      let oldVoid = voids[0];
      voids.forEach((v) => {
        const tv = getCreatedTs(v);
        const to = getCreatedTs(oldVoid);
        if (tv !== null && (to === null || tv < to)) {
          oldVoid = v;
          return;
        }
        if (tv === null && to === null) {
          const idv = getId(v);
          const ido = getId(oldVoid);
          if (!Number.isNaN(idv) && (Number.isNaN(ido) || idv < ido)) oldVoid = v;
        }
      });

      const actives = list.filter((x) => !(x?.isVoid || x?.void));
      let current = actives.length > 0 ? actives[0] : null;
      if (current && actives.length > 1) {
        actives.forEach((a) => {
          const ida = getId(a);
          const idc = getId(current);
          if (!Number.isNaN(ida) && (Number.isNaN(idc) || ida > idc)) current = a;
        });
      }

      result.push({
        accountNumber: getAcct(oldVoid),
        voidInvoice: getInv(oldVoid),
        voidTotal: getTekefay(oldVoid),
        newInvoice: current ? getInv(current) : "",
        newTotal: current ? getTekefay(current) : 0,
        diff: getTekefay(oldVoid) - (current ? getTekefay(current) : 0),
      });
    });

    result.sort((a, b) => String(a.accountNumber).localeCompare(String(b.accountNumber)));
    return result;
  }, [readings, selectedKebeleId, selectedKetenaId, selectedBranchId, selectedReaderId, selectedCustomerTypeId]);

  const handleExportVoidChangedReportPDF = async (preview = false) => {
    try {
      if (!Array.isArray(voidChangedComparisons) || voidChangedComparisons.length === 0) {
        toast.info("No void/changed comparisons to export.");
        return;
      }

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
      try { doc.setFont("nyala", "normal"); } catch (_) { }

      const pageWidth = doc.internal.pageSize.getWidth();
      const MARGIN = 30;

      const titleLeftAmh = companyProfile?.companyNameAmh || "";
      const rightTopLocationAmh = companyProfile?.locationAmh || "";
      const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
      const logoW = 50, logoH = 50;
      if (logoBase64) {
        try { doc.addImage(logoBase64, "PNG", pageWidth - MARGIN - logoW, MARGIN, logoW, logoH); } catch (_) { }
      }

      doc.setFont("nyala", "normal");
      doc.setFontSize(16);
      doc.text(titleLeftAmh, MARGIN, MARGIN + 15);
      doc.setFontSize(12);

      if (rightTopLocationAmh) {
        doc.setFontSize(11);
        doc.text(rightTopLocationAmh, pageWidth - MARGIN - logoW, MARGIN + logoH + 15);
      }

      const subTitle = `የተቋረጡ/ተቀየሩ ደረሰኞች ማነጻጸር - ${selectedKifyaWerMonth || ""} ${selectedKifyaWerYear || ""}`;
      doc.setFont("nyala", "normal");
      doc.setFontSize(14);
      doc.text(subTitle, pageWidth / 2, MARGIN + 90, { align: "center" });

      const head = [[
        "ተ.ቁ.",
        "መለያ ቁጥር",
        "ነባር ደረሰኝ",
        "ነባር ክፍያ (በብር)",
        "አዲስ ደረሰኝ",
        "አዲስ ክፍያ (በብር)",
        "ልዩነት (በብር)",
      ]];
      const body = voidChangedComparisons.map((r, idx) => [
        idx + 1,
        r.accountNumber || "",
        r.voidInvoice || "",
        (r.voidTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        r.newInvoice || "",
        (r.newTotal || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
        (r.diff || 0).toLocaleString("en-US", { minimumFractionDigits: 2 }),
      ]);

      // Totals for money columns
      const sumVoid = voidChangedComparisons.reduce((a, r) => a + (Number(r.voidTotal) || 0), 0);
      const sumNew = voidChangedComparisons.reduce((a, r) => a + (Number(r.newTotal) || 0), 0);
      const sumDiff = sumVoid - sumNew;
      const foot = [[
        "",
        "ጠቅላላ",
        "",
        sumVoid.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        "",
        sumNew.toLocaleString("en-US", { minimumFractionDigits: 2 }),
        sumDiff.toLocaleString("en-US", { minimumFractionDigits: 2 }),
      ]];

      autoTable(doc, {
        head,
        body,
        foot,
        startY: MARGIN + 110,
        margin: { left: MARGIN, right: MARGIN },
        styles: { font: "nyala", fontSize: 10, cellPadding: 4, overflow: "linebreak" },
        tableWidth: pageWidth - 2 * MARGIN,
        showFoot: "lastPage",
        headStyles: { fillColor: [33, 150, 243] },
        columnStyles: {
          // Column widths sum to available width (A4 portrait ~595pt, margins 30pt -> 535pt)
          0: { halign: "center", cellWidth: 30 },   // #
          1: { cellWidth: 80 },                       // account
          2: { cellWidth: 90 },                       // void invoice
          3: { halign: "right", cellWidth: 90 },     // void total
          4: { cellWidth: 90 },                       // new invoice
          5: { halign: "right", cellWidth: 90 },     // new total
          6: { halign: "right", cellWidth: 65 },     // diff
        },
      });

      const now = new Date();
      const fileName = `VoidChanged_Comparison_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.pdf`;
      if (preview) {
        const blob = doc.output("blob");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        doc.save(fileName);
      }
    } catch (err) {
      console.error("Failed to export Void/Changed report PDF", err);
      toast.error("Failed to export comparison PDF");
    }
  };

  const handleExtraClick = (event) => {
    setAnchorElExtra(event.currentTarget);
  };
  const handleExtraClose = () => {
    setAnchorElExtra(null);
  };

  // >>> ADDED: Replace useState and useEffect with a single useMemo for derived data
  const filteredData = useMemo(() => {
    let tempReadings = [...readings];

    // Always show only active (non-void) bills in the main table
    tempReadings = tempReadings.filter((b) => !b?.isVoid && !b?.void);

    // Add debugging to see what data we're working with
    if (tempReadings.length > 0) {
      // console.log("[BillList] Sample bill data for filtering:", tempReadings[0]);
      // console.log("[BillList] Available keys:", Object.keys(tempReadings[0]));
    }

    // --- Customer Status Filter ---
    if (filterCustomerStatus !== "all") {
      tempReadings = tempReadings.filter(r => {
        if (filterCustomerStatus === "active") {
          return String(r.customerStatus).toLowerCase() === "active" || !r.customerStatus; // Default to active if null
        } else if (filterCustomerStatus === "deleted") {
          return String(r.customerStatus).toLowerCase() === "deleted";
        }
        return true;
      });
    }

    // --- Geographic and assignment filters (apply only when a selection exists) ---
    const matchesAnyKey = (obj, keys, value) =>
      keys.some((k) => obj?.[k] !== undefined && String(obj[k]) === String(value));

    const datasetHasAnyKey = (items, keys) =>
      Array.isArray(items) && items.some((it) => keys.some((k) => it?.[k] !== undefined));

    if (selectedKebeleId) {
      const kebeleKeys = [
        "addressStreetsId",
        "kebeleId",
        "customerKebeleId",
      ];
      // console.log("[BillList] Filtering by Kebele ID:", selectedKebeleId);
      // console.log("[BillList] Dataset has kebele keys:", datasetHasAnyKey(tempReadings, kebeleKeys));

      // Apply filter regardless of whether keys exist - let matchesAnyKey handle it
      const beforeCount = tempReadings.length;
      tempReadings = tempReadings.filter((r) =>
        matchesAnyKey(r, kebeleKeys, selectedKebeleId)
      );
      // console.log("[BillList] Kebele filter: before =", beforeCount, "after =", tempReadings.length);
    }

    if (selectedKetenaId) {
      const ketenaKeys = ["addressKetenaId", "ketenaId"];
      // console.log("[BillList] Filtering by Ketena ID:", selectedKetenaId);

      const beforeCount = tempReadings.length;
      tempReadings = tempReadings.filter((r) =>
        matchesAnyKey(r, ketenaKeys, selectedKetenaId)
      );
      // console.log("[BillList] Ketena filter: before =", beforeCount, "after =", tempReadings.length);
    }

    if (selectedBranchId) {
      const branchKeys = ["branchsId", "branchId"];
      // console.log("[BillList] Filtering by Branch ID:", selectedBranchId);

      const beforeCount = tempReadings.length;
      tempReadings = tempReadings.filter((r) =>
        matchesAnyKey(r, branchKeys, selectedBranchId)
      );
      // console.log("[BillList] Branch filter: before =", beforeCount, "after =", tempReadings.length);
    }

    if (selectedReaderId) {
      const readerKeys = ["assignedReaderId", "readerId"];
      // console.log("[BillList] Filtering by Reader ID:", selectedReaderId);

      const beforeCount = tempReadings.length;
      tempReadings = tempReadings.filter((r) =>
        matchesAnyKey(r, readerKeys, selectedReaderId)
      );
      // console.log("[BillList] Reader filter: before =", beforeCount, "after =", tempReadings.length);
    }

    if (selectedCustomerTypeId) {
      const beforeCount = tempReadings.length;
      tempReadings = tempReadings.filter(
        (r) => r?.customerTypeId !== undefined && String(r.customerTypeId) === String(selectedCustomerTypeId)
      );
      // console.log("[BillList] Customer Type filter: before =", beforeCount, "after =", tempReadings.length);
    }

    // --- Payment Type Filters (OR logic) ---
    const paymentFiltersActive =
      filterDerashPaid || filterPaidOnFrontOffice || filterUnicashPaid || filterPrepaid;

    if (paymentFiltersActive) {
      const checks = [];
      if (filterDerashPaid) checks.push((b) => b.derashPaid);
      if (filterPaidOnFrontOffice) checks.push((b) => b.paidOnFrontOffice);
      if (filterUnicashPaid) checks.push((b) => b.unicashPaid);
      if (filterPrepaid) checks.push((b) => (Number(b?.kecreditYetekefele) || 0) > 0);
      tempReadings = tempReadings.filter((b) => checks.every((fn) => fn(b)));
    }

    // --- Money Collected Filter (applied after payment filters) ---
    if (filterMoneyCollected !== "all") {
      const moneyCollectedBool = filterMoneyCollected === "true";
      tempReadings = tempReadings.filter(
        (bill) => bill.moneyCollected === moneyCollectedBool
      );
    }

    // --- SMS Sent Filter (enableEditMeneshaReading) ---
    if (filterSmsSent !== "all") {
      const smsSentBool = filterSmsSent === "sent";
      tempReadings = tempReadings.filter((bill) => {
        const flag = bill.enableEditMeneshaReading;
        return smsSentBool ? !!flag : !flag;
      });
    }

    if (wuzifMonthsVal !== "" && !isNaN(Number(wuzifMonthsVal))) {
      const target = Number(wuzifMonthsVal);
      tempReadings = tempReadings.filter((bill) => {
        const val = Number(bill?.wuzifWorBzat ?? NaN);
        if (Number.isNaN(val)) return false;
        if (wuzifMonthsOp === "lt") return val < target;
        if (wuzifMonthsOp === "lte") return val <= target;
        if (wuzifMonthsOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    // Zero Reading Filter Logic
    if (zeroReadingMonthsVal !== "" && !isNaN(Number(zeroReadingMonthsVal))) {
      const target = Number(zeroReadingMonthsVal);
      tempReadings = tempReadings.filter((bill) => {
        const val = Number(bill?.zeroReadingWorBzat ?? NaN);
        if (Number.isNaN(val)) return false;
        if (zeroReadingMonthsOp === "lt") return val < target;
        if (zeroReadingMonthsOp === "lte") return val <= target;
        if (zeroReadingMonthsOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    if (filterVoidChangedCustomers) {
      const getAcct = (b) =>
        b?.customerAccountNumber ?? b?.accountNumber ?? b?.customerId ?? null;

      // Build the set of accounts that have any void/changed bill
      const voidAccounts = new Set();
      (Array.isArray(readings) ? readings : []).forEach((b) => {
        if (b?.isVoid || b?.void) {
          const a = getAcct(b);
          if (a) voidAccounts.add(String(a));
        }
      });

      // Then, on the main dataset (already non-void), keep only rows
      // whose account appears in that void/changed account set
      tempReadings = tempReadings.filter((b) => {
        const a = getAcct(b);
        return a && voidAccounts.has(String(a));
      });
    }

    return tempReadings; // Return the calculated array
  }, [
    readings,
    // payment filters
    filterDerashPaid,
    filterPaidOnFrontOffice,
    filterUnicashPaid,
    filterMoneyCollected,
    filterSmsSent,
    wuzifMonthsOp,
    wuzifMonthsVal,
    zeroReadingMonthsOp,
    zeroReadingMonthsVal,
    filterVoidChangedCustomers,
    // dropdown filters
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
    selectedCustomerTypeId,
    filterCustomerStatus,
  ]);

  // Bill counts for UI summary
  const nonVoidedCount = useMemo(
    () => (Array.isArray(filteredData) ? filteredData.filter((b) => !b.isVoid).length : 0),
    [filteredData]
  );
  const voidedCount = useMemo(
    () => (Array.isArray(filteredData) ? filteredData.filter((b) => b.isVoid).length : 0),
    [filteredData]
  );

  const handleFilterClick = () => {
    if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      refetch();
    } else {
      toast.info("Please select both a month and a year to filter.");
    }
  };

  const handleImportSuccess = () => {
    // Refresh the bill data after successful import
    refetch();
    toast.success("Bill data refreshed after import");
  };

  const transferKitatMutation = useMutation({
    mutationFn: async ({ accountNumber, totalKitat }) => {
      return await readingService.transferKitatToOldArrears(accountNumber, totalKitat);
    },
    onSuccess: (data, variables) => {
      toast.success(
        `Kitat transferred to old arrears for account ${variables.accountNumber}`
      );
      refetch();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to transfer kitat to old arrears";
      toast.error(message);
    },
  });

  const handleTransferKitatForAccount = (accountNumber, kitatValue) => {
    const totalKitat = Number(kitatValue || 0);

    if (!accountNumber) {
      toast.error("Account number is missing.");
      return;
    }
    if (totalKitat <= 0) {
      toast.info("Kitat is zero for this account; nothing to transfer.");
      return;
    }

    transferKitatMutation.mutate({ accountNumber, totalKitat });
  };

  const handleTransferKitatForFilteredBills = async () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to transfer kitat.");
      return;
    }

    const accountTotals = new Map();
    sourceBills.forEach((b) => {
      const acct = b.customerAccountNumber || b.accountNumber;
      const kitatVal = Number(b.kitat || 0);
      if (!acct || b.isVoid || kitatVal <= 0) return;
      accountTotals.set(acct, (accountTotals.get(acct) || 0) + kitatVal);
    });

    if (accountTotals.size === 0) {
      toast.info("No kitat > 0 found for filtered bills.");
      return;
    }

    setIsBulkKitatTransferring(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (const [acct, totalKitat] of accountTotals.entries()) {
        try {
          await readingService.transferKitatToOldArrears(acct, totalKitat);
          successCount++;
        } catch (err) {
          console.error("Failed to transfer kitat for account", acct, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        const msgBase = `Kitat transferred for ${successCount} account(s).`;
        const msg = failCount > 0
          ? `${msgBase} ${failCount} account(s) failed.`
          : msgBase;
        toast.success(msg);
        refetch();
      } else if (failCount > 0) {
        toast.error("Failed to transfer kitat for filtered bills.");
      }
    } finally {
      setIsBulkKitatTransferring(false);
    }
  };

  const getPhoneNumberFromBill = (bill) => {
    if (!bill) return null;

    const raw =
      bill.customerPhoneNumber ||
      bill.phoneNumber ||
      bill.mobile ||
      bill.customerMobile ||
      null;

    if (!raw) return null;

    // Normalize: remove spaces/hyphens/commas etc., keep digits and leading +
    let cleaned = String(raw).trim().replace(/[\s,-]/g, "");

    // Accept only these patterns (examples):
    // 1) 251935981944  2) 0935981944  3) +251935981944
    // 4) 251735981944  5) 0735981944  6) +251735981944
    // i.e. country format 2517/9xxxxxxxx, local 07/09xxxxxxxx, with optional +251.

    // If starts with +, keep it only for pattern check
    if (!/^\+?\d+$/.test(cleaned)) {
      return null;
    }

    let normalized = null;

    if (/^\+251[79]\d{8}$/.test(cleaned)) {
      // +2517/9xxxxxxxx -> 2517/9xxxxxxxx
      normalized = cleaned.slice(1);
    } else if (/^251[79]\d{8}$/.test(cleaned)) {
      // 2517/9xxxxxxxx
      normalized = cleaned;
    } else if (/^0[79]\d{8}$/.test(cleaned)) {
      // 07/09xxxxxxxx -> 2517/9xxxxxxxx
      normalized = "251" + cleaned.slice(1);
    } else {
      // Any other format is considered invalid for SMS sending
      return null;
    }

    return normalized;
  };

  const buildSmsMessageForBill = (bill) => {
    const name = bill.customerFullName || "";
    const account = bill.customerAccountNumber || "";
    const previous =
      bill.previousReading !== undefined && bill.previousReading !== null
        ? bill.previousReading
        : "";
    const current =
      bill.lastReading !== undefined && bill.lastReading !== null
        ? bill.lastReading
        : "";
    const consumption =
      bill.consumption !== undefined && bill.consumption !== null
        ? bill.consumption
        : "";
    const wuzifHisab =
      bill.wuzifHisab !== undefined && bill.wuzifHisab !== null
        ? bill.wuzifHisab
        : 0;
    const totalPayable =
      bill.tekilalaTekefay !== undefined && bill.tekilalaTekefay !== null
        ? bill.tekilalaTekefay
        : 0;
    let dueStr = "";
    if (bankDueDateEC instanceof Date && !isNaN(bankDueDateEC)) {
      const [ey, em, ed] = ethiopianDate.toEthiopian(
        bankDueDateEC.getFullYear(),
        bankDueDateEC.getMonth() + 1,
        bankDueDateEC.getDate()
      );
      const ecMonthName = ethiopianMonths[em - 1] || "";
      dueStr = `${ecMonthName} ${ed}`;
    } else if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      dueStr = `${selectedKifyaWerMonth} ${selectedKifyaWerYear}`;
    }

    const monthYearPart =
      selectedKifyaWerMonth && selectedKifyaWerYear
        ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear} `
        : "";

    // return `የተከበሩ ደንበኛችን ${name} በውል ቁጥር ${account} ${monthYearPart}ወር ፍጆታ ${consumption} (ቀድሞ ንባብ ${previous}, አሁን ንባብ ${current}) ውዝፍ ${wuzifHisab} ጠቅላላ ክፍያ ${totalPayable} ብር  እስከ ${dueStr} ድረስ ስለሆነ ወደቅጣት ተላልፎ ለተጨማሪ ወጭ ሳይዳረጉና በጊዜ እንዲከፍሉ እናሳስባለን`;
    // return `የተከበሩ ደንበኛችን ${name} የውል ቁጥር ${account} የ ${monthYearPart}ወር ፍጆታ ${consumption} (ከ ${previous} እስከ ${current}) ውዝፍ ${wuzifHisab}፣ ጠቅላላ ክፍያ ${totalPayable} ብር የክፍያ ጊዘው እስከ ${dueStr} መሆኑን አውቀው  ቀኑ ሳያልፍ ክፍያዎን እንዲከፍሉ እናሳስባለን፡፡`; 
    //return `የተከበሩ ${name} የውል ቁጥር ${account} የ ${monthYearPart}ወር ፍጆታ ${consumption} (ከ ${previous} እስከ ${current}) ውዝፍ ${wuzifHisab}፣ ጠቅላላ ክፍያ ${totalPayable} ብር እስከ ${dueStr} ድረስ ይክፈሉ፡፡`;
    return `የተከበሩ ${name} የውል ቁጥር ${account} የ${monthYearPart}ወር ፍጆታ ${consumption}m³(ከ${previous}-${current}) ውዝፍ ${wuzifHisab}፣ጠቅላላ ክፍያ ${totalPayable} ብር እስከ ${dueStr} ድረስ ይክፈሉ፡፡`;
  };

  const handleSendSmsForFilteredBills = async () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to send SMS.");
      return;
    }

    const withPhones = sourceBills.filter((b) => !!getPhoneNumberFromBill(b));
    if (!withPhones.length) {
      toast.info("No phone numbers found in filtered bills.");
      return;
    }

    setIsBulkSmsSending(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (const bill of withPhones) {
        const phoneNumber = getPhoneNumberFromBill(bill);
        const message = buildSmsMessageForBill(bill);
        console.log("[BillList] Final SMS (direct)", {
          phoneNumber,
          message,
          billId: bill.id,
          accountNumber: bill.customerAccountNumber || bill.accountNumber,
        });
        try {
          await smsService.sendTestSms({ phoneNumber, message });
          successCount++;
        } catch (err) {
          console.error("Failed to send SMS for bill", bill, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        const base = `SMS sent for ${successCount} customer(s).`;
        const msg = failCount > 0 ? `${base} ${failCount} failed.` : base;
        toast.success(msg);
      } else if (failCount > 0) {
        toast.error("Failed to send SMS for filtered bills.");
      }
    } catch (error) {
      console.error("Unexpected error while sending bulk SMS", error);
      toast.error(error?.message || "Unexpected error while sending SMS.");
    } finally {
      setIsBulkSmsSending(false);
    }
  };

  const handleSendSmsViaJasminForFilteredBills = async () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to send SMS.");
      return;
    }

    const withPhones = sourceBills.filter((b) => !!getPhoneNumberFromBill(b));
    if (!withPhones.length) {
      toast.info("No phone numbers found in filtered bills.");
      return;
    }

    setIsBulkSmsSendingJasmin(true);
    let successCount = 0;
    let failCount = 0;
    try {
      for (const bill of withPhones) {
        const phoneNumber = getPhoneNumberFromBill(bill);
        const message = buildSmsMessageForBill(bill);
        console.log("[BillList] Final SMS (Jasmin)", {
          phoneNumber,
          message,
          billId: bill.id,
          accountNumber: bill.customerAccountNumber || bill.accountNumber,
        });
        try {
          await smsService.sendTestSmsViaJasmin({ phoneNumber, message });
          successCount++;
        } catch (err) {
          console.error("Failed to send SMS via Jasmin for bill", bill, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        const base = `SMS via Jasmin sent for ${successCount} customer(s).`;
        const msg = failCount > 0 ? `${base} ${failCount} failed.` : base;
        toast.success(msg);
      } else if (failCount > 0) {
        toast.error("Failed to send SMS via Jasmin for filtered bills.");
      }
    } catch (error) {
      console.error("Unexpected error while sending bulk SMS via Jasmin", error);
      toast.error(error?.message || "Unexpected error while sending SMS via Jasmin.");
    } finally {
      setIsBulkSmsSendingJasmin(false);
    }
  };
  // 1 sumation segment
  const summations = useMemo(() => {
    const initialSums = {
      // Group 1
      yezihWerFjotaKfya: 0,
      kotariKiray: 0,
      additionalHisab: 0,
      techemariKfya: 0,
      yezihWer: 0,
      // Group 2
      wuzifKotariKiray: 0,
      wuzifFjota: 0,
      wuzifDerekKoshasha: 0,
      wuzifTechemariKfya: 0,
      kitat: 0,
      wuzifHisab: 0,
      wuzifFjotaKfya: 0,
      // Group 3
      temelashBirr: 0,
      kecreditYetekefele: 0,
      tekilalaYetekefele: 0,
      tekilalaTekefay: 0,
      // Group 4
      consumption: 0,
      // Payment Location Summary fields
      prepaid: 0,
      paidAtOffice: 0,
      paidByBank: {},
      duplicatePayments: 0,
      duplicatePaymentCount: 0,
      duplicateAdditionalHisab: 0,
      duplicateWuzifDerekKoshasha: 0,
      duplicateTekilalaTekefay: 0,
      duplicateCheck: 0,
      totalPaidLocationSum: 0,
      totaladditionalHisab: 0,
      totalwuzifDerekKoshasha: 0,
      totaltekelalaTekefay: 0,
      // >>> ADDED: New fields for bill counts
      prepaidCount: 0,
      paidAtOfficeCount: 0,
      paidByBankCount: {},
      // >>> ADDED: New fields for additional sums by payment location
      prepaidAdditionalHisab: 0,
      prepaidWuzifDerekKoshasha: 0,
      prepaidTekilalaTekefay: 0,
      officeAdditionalHisab: 0,
      officeWuzifDerekKoshasha: 0,
      officeTekilalaTekefay: 0,
      bankAdditionalHisab: {},
      bankWuzifDerekKoshasha: {},
      bankTekilalaTekefay: {},

      // New calculated fields
      prepaidTotalDerekKoshasha: 0,
      officeTotalDerekKoshasha: 0,
      bankTotalDerekKoshasha: {},
      prepaidCheck: 0,
      officeCheck: 0,
      bankCheck: {},
    };

    // if (!readings || readings.length === 0) {
    //   return initialSums;
    // }
    // >>> MODIFIED: Use filteredData instead of readings
    if (!filteredData || filteredData.length === 0) {
      return initialSums;
    }

    // >>> MODIFIED: Use filteredData for the reduction
    const calculatedSums = filteredData.reduce((acc, bill) => {
      //if (bill.moneyCollected && !bill.isVoid) {
      if (!bill.isVoid) {
        acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
        //console.log('Account with zero kotariKiray');
        // Log accounts with zero kotariKiray
        // if (bill.kotariKiray === 0) {
        //   console.log(`Account with zero kotariKiray - Account Number: ${bill.accountNumber || 'N/A'}, Customer Name: ${bill.customerName || 'N/A'}`);
        // }

        acc.kotariKiray += bill.kotariKiray || 0;
        acc.additionalHisab += bill.additionalHisab || 0;
        acc.techemariKfya += bill.techemariKfya || 0;
        acc.yezihWer += bill.yezihWer || 0;
        acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
        acc.wuzifFjota += bill.wuzifFjota || 0;
        acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
        acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
        acc.kitat += bill.kitat || 0;
        acc.wuzifHisab += bill.wuzifHisab || 0;
        acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
        acc.temelashBirr += bill.temelashBirr || 0;
        acc.kecreditYetekefele += bill.kecreditYetekefele || 0;
        acc.tekilalaYetekefele += bill.tekilalaYetekefele || 0;
        acc.tekilalaTekefay += bill.tekilalaTekefay || 0;
        acc.consumption += bill.consumption || 0;

        // Local bank name resolver fallback
        const getBankName = (key) => key;

        const totalPaidAmount = bill.tekilalaYetekefele || 0;
        let duplicatePaymentsIterator = 0;
        const paymentMethodsFound = [];
        const bankKeysHandled = new Set();

        // 0. pre paid Payments Check
        if (bill.kecreditYetekefele) {
          paymentMethodsFound.push("Prepaid");
          acc.prepaid += bill.kecreditYetekefele;
          acc.prepaidCount += 1;
          acc.prepaidAdditionalHisab += bill.additionalHisab || 0;
          acc.prepaidWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.prepaidTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.prepaidTotalDerekKoshasha +=
            (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.prepaidCheck +=
            (bill.tekilalaTekefay || 0) - (bill.kecreditYetekefele || 0);
        }
        // 1. Office Payments Check
        if (bill.paidOnFrontOffice) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Office");
          acc.paidAtOffice += totalPaidAmount;
          acc.paidAtOfficeCount += 1;
          // Add additional sums for office
          acc.officeAdditionalHisab += bill.additionalHisab || 0;
          acc.officeWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.officeTekilalaTekefay += bill.tekilalaTekefay || 0;
          // Calculate total fields
          acc.officeTotalDerekKoshasha +=
            (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.officeCheck += (bill.tekilalaTekefay || 0) - totalPaidAmount;
        }

        // 2. Bank Payments Check (Derash)
        if (bill.derashPaid) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Bank");
          const rawDerashKey = bill.bankPaidAgentId ?? bill.bankName ?? null;
          const normDerashKey = rawDerashKey !== null && rawDerashKey !== undefined ? String(rawDerashKey) : null;
          const derashLookupName = normDerashKey ? getBankName(normDerashKey) : null;
          const bankKeyForSum = derashLookupName && derashLookupName !== "Unknown Bank" ? derashLookupName : normDerashKey;
          if (bankKeyForSum && !bankKeysHandled.has(bankKeyForSum)) {
            bankKeysHandled.add(bankKeyForSum);
            const bankPaid = bill.tekilalaBankYetekefele || 0;
            acc.paidByBank[bankKeyForSum] = (acc.paidByBank[bankKeyForSum] || 0) + bankPaid;
            acc.paidByBankCount[bankKeyForSum] = (acc.paidByBankCount[bankKeyForSum] || 0) + 1;
            acc.bankAdditionalHisab[bankKeyForSum] = (acc.bankAdditionalHisab[bankKeyForSum] || 0) + (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankKeyForSum] = (acc.bankWuzifDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankKeyForSum] = (acc.bankTekilalaTekefay[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0);
            acc.bankTotalDerekKoshasha[bankKeyForSum] = (acc.bankTotalDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
            acc.bankCheck[bankKeyForSum] = (acc.bankCheck[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0) - bankPaid;
          }
        }

        // 3. Bank Payments Check (Unicash)
        if (bill.unicashPaid) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Bank");
          const rawUnicashKey = bill.uBankPaidAgentId ?? bill.bankName ?? null;
          const normUnicashKey = rawUnicashKey !== null && rawUnicashKey !== undefined ? String(rawUnicashKey) : null;
          const unicashLookupName = normUnicashKey ? getBankName(normUnicashKey) : null;
          const bankKeyForSum = unicashLookupName && unicashLookupName !== "Unknown Bank" ? unicashLookupName : normUnicashKey;
          if (bankKeyForSum && !bankKeysHandled.has(bankKeyForSum)) {
            bankKeysHandled.add(bankKeyForSum);
            let bankPaid = Number(bill.tekilalaBankYetekefele) || 0;
            if (bankPaid === 0) {
              bankPaid = Math.max(
                0,
                (Number(bill.tekilalaYetekefele) || 0) - (Number(bill.kecreditYetekefele) || 0)
              );
            }
            acc.paidByBank[bankKeyForSum] = (acc.paidByBank[bankKeyForSum] || 0) + bankPaid;
            acc.paidByBankCount[bankKeyForSum] = (acc.paidByBankCount[bankKeyForSum] || 0) + 1;
            acc.bankAdditionalHisab[bankKeyForSum] = (acc.bankAdditionalHisab[bankKeyForSum] || 0) + (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankKeyForSum] = (acc.bankWuzifDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankKeyForSum] = (acc.bankTekilalaTekefay[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0);
            acc.bankTotalDerekKoshasha[bankKeyForSum] = (acc.bankTotalDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
            acc.bankCheck[bankKeyForSum] = (acc.bankCheck[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0) - bankPaid;
          }
        }

        // 4. Duplicate Payment Check
        if (duplicatePaymentsIterator > 1) {
          acc.duplicatePayments += totalPaidAmount;
          acc.duplicatePaymentCount += 1;
          acc.duplicateAdditionalHisab += bill.additionalHisab || 0;
          acc.duplicateWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.duplicateTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.duplicateCheck += (bill.tekilalaTekefay || 0) - totalPaidAmount;
        }
      }
      return acc;
    }, initialSums);

    // Calculate Grand Total
    const totalBankPayments = Object.values(calculatedSums.paidByBank).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const totaladditionalHisabs = Object.values(
      calculatedSums.bankAdditionalHisab
    ).reduce((sum, amount) => sum + amount, 0);

    const totalwuzifDerekKoshasha = Object.values(
      calculatedSums.bankWuzifDerekKoshasha
    ).reduce((sum, amount) => sum + amount, 0);

    const totaltekelalaTekefay = Object.values(
      calculatedSums.bankTekilalaTekefay
    ).reduce((sum, amount) => sum + amount, 0);

    calculatedSums.totalPaidLocationSum =
      calculatedSums.paidAtOffice + totalBankPayments + calculatedSums.prepaid;

    calculatedSums.totaladditionalHisab =
      calculatedSums.officeAdditionalHisab +
      totaladditionalHisabs +
      calculatedSums.prepaidAdditionalHisab;

    calculatedSums.totalwuzifDerekKoshasha =
      calculatedSums.officeWuzifDerekKoshasha +
      totalwuzifDerekKoshasha +
      calculatedSums.prepaidWuzifDerekKoshasha;

    calculatedSums.totaltekelalaTekefay =
      calculatedSums.officeTekilalaTekefay +
      totaltekelalaTekefay +
      calculatedSums.prepaidTekilalaTekefay;

    return calculatedSums;
  }, [filteredData]);

  // Load logo image from public path and return base64 data URL
  const loadImageAsBase64 = async (path) => {
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
  };

  // Fetch company profile by status = Active and use the first record
  const { data: companyProfile } = useQuery({
    queryKey: ["companyProfileByStatus", "Active"],
    queryFn: async () => {
      try {
        const res = await campanyProfileService.getCompanyProfileByStatus("Active");
        const payload = res?.data || res;
        const list = Array.isArray(payload) ? payload : payload?.data || [];
        return Array.isArray(list) && list.length > 0 ? list[0] : null;
      } catch (e) {
        console.error("Failed to fetch company profile:", e);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  // Export/Preview the current Summations and Payment Location Summary to PDF
  const handleExportSummationsPDF = async (preview = false) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
      // Ensure Amharic glyphs render with proper font
      try { doc.setFont("nyala", "normal"); } catch (_) { }

      // Header
      const titleLeftAmh = companyProfile?.companyNameAmh || "";
      const titleLeftEng = companyProfile?.companyName || "";
      const rightTopLocationAmh = companyProfile?.locationAmh || "";
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      // Tighter margins to match template
      const MARGIN = 30;

      // Draw logo on the RIGHT as requested
      const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
      const logoW = 50, logoH = 50;
      if (logoBase64) {
        try { doc.addImage(logoBase64, "PNG", pageWidth - MARGIN - logoW, MARGIN, logoW, logoH); } catch (_) { }
      }

      // Left header text (Amharic only)
      doc.setFont("nyala", "normal");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(titleLeftAmh, MARGIN, MARGIN + 15);
      doc.setFontSize(16);
      doc.text(titleLeftEng, MARGIN, MARGIN + 30);

      // Location in header (right side, below logo)
      // if (rightTopLocationAmh) {
      //   doc.setFont("nyala", "normal");
      //   doc.setFontSize(11);
      //   doc.text(rightTopLocationAmh, pageWidth - MARGIN - logoW, MARGIN + logoH + 15);
      // }

      // Report title (centered) and period under the header rule
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(MARGIN, MARGIN + 55, pageWidth - MARGIN, MARGIN + 55);

      const reportTitle = `የሪፖርት ማጠቃለያ - ${selectedKifyaWerMonth || "-"}, ${selectedKifyaWerYear || "-"} - ${filterMoneyCollected === 'all'
        ? 'ሁሉም ንባብ  የገባላቸው'
        : filterMoneyCollected === 'true'
          ? 'የተከፈለ '
          : 'ይልተከፈለ '
        }`;
      doc.setFont("nyala", "normal");
      doc.setFontSize(16);
      doc.text(reportTitle, pageWidth / 2, MARGIN + 75, { align: "center" });

      // Dates: show both GC and EC on the bottom-left of header
      const now = new Date();
      const [ecY, ecM, ecD] = ethiopianDate.toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const gcText = `GC: ${now.toLocaleDateString()}`;
      const ecText = `EC: ${ecD}/${ecM}/${ecY}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(gcText, MARGIN, MARGIN + 45);
      doc.text(ecText, MARGIN + 80, MARGIN + 45);

      // Helper for currency formatting (must be defined before use)
      const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmt0 = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

      // Start content right after title
      const contentStartY = MARGIN + 110;

      // Summary Overview block (mirror frontend)
      const summaryX = MARGIN;
      const summaryY = contentStartY;
      const summaryW = pageWidth - 2 * MARGIN;
      const summaryH = 140; // Increased from 130 to accommodate taller tiles

      // Outer rectangle with light blue background
      doc.setDrawColor(0);
      doc.setFillColor(240, 248, 255);
      doc.rect(summaryX, summaryY, summaryW, summaryH, "FD");

      // Title
      doc.setFontSize(16);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Summary Overview", summaryX + summaryW / 2, summaryY + 16, { align: "center" });

      // Two-row grid (5 columns each) matching frontend content
      const sColW = (summaryW - 16) / 6;
      const sLabelY1 = summaryY + 34;
      const sValueY1 = summaryY + 50;
      const sLabelY2 = summaryY + 82;
      const sValueY2 = summaryY + 98;


      // Row 1 labels (reordered per web UI)
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Total Bills", summaryX + 8 + 0 * sColW, sLabelY1);
      doc.text("የወሩ ፍጆታ (ሜ3)", summaryX + 8 + 1 * sColW, sLabelY1);
      doc.text("ውዝፍ ፍጆታ (ሜ3)", summaryX + 8 + 2 * sColW, sLabelY1);
      doc.text("ጠቅላላ ደረቅ ቆሻሻ", summaryX + 8 + 3 * sColW, sLabelY1);
      doc.text("ጠቅላላ ውዝፍ", summaryX + 8 + 4 * sColW, sLabelY1);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", summaryX + 8 + 5 * sColW, sLabelY1);

      // Row 1 values (colored like UI)
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      // Total Bills
      doc.setTextColor(33, 150, 243);
      doc.text(fmt0(filteredData.length), summaryX + 8 + 0 * sColW, sValueY1);
      // የወሩ ፍጆታ (ሜ3)
      doc.setTextColor(33, 150, 243);
      doc.text(fmt0(summations.consumption), summaryX + 8 + 1 * sColW, sValueY1);
      doc.setTextColor(33, 150, 243);
      doc.text(fmt(summations.wuzifFjota), summaryX + 8 + 2 * sColW, sValueY1);
      // ጠቅላላ ደረቅ ቆሻሻ
      doc.setTextColor(33, 150, 243);
      doc.text(fmt((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)), summaryX + 8 + 3 * sColW, sValueY1);
      // ጠቅላላ ውዝፍ (exclude ውዝፍ ደረቅ ቆሻሻ)
      doc.setTextColor(244, 67, 54);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), summaryX + 8 + 4 * sColW, sValueY1);
      // ጠቅላላ ተጨማሪ ክፍያ
      doc.setTextColor(33, 150, 243);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), summaryX + 8 + 5 * sColW, sValueY1);

      // Row 2 labels
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ቅድሚያ የተከፈለ", summaryX + 8 + 0 * sColW, sLabelY2);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", summaryX + 8 + 1 * sColW, sLabelY2);
      doc.text("ቅጣት", summaryX + 8 + 2 * sColW, sLabelY2);
      doc.text("ጠቅላላ ውዝፍ", summaryX + 8 + 3 * sColW, sLabelY2);

      // Row 2 values
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      // ቅድሚያ የተከፈለ
      doc.setTextColor(255, 87, 34);
      doc.text(fmt(summations.prepaid), summaryX + 8 + 0 * sColW, sValueY2);
      // ጠቅላላ ተጨማሪ ክፍያ
      doc.setTextColor(33, 150, 243);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), summaryX + 8 + 1 * sColW, sValueY2);
      // ቅጣት
      doc.setTextColor(244, 67, 54);
      doc.text(fmt(summations.kitat), summaryX + 8 + 2 * sColW, sValueY2);
      // ጠቅላላ ውዝፍ (exclude ውዝፍ ደረቅ ቆሻሻ)
      doc.setTextColor(244, 67, 54);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), summaryX + 8 + 3 * sColW, sValueY2);

      // Bottom-right tiles inside Summary Overview
      const tileH = 36; // Increased height to better accommodate two lines of text
      const tileY = summaryY + summaryH - tileH + 5;
      const tileW = sColW - 8; // Make tiles wider
      const leftTileX = summaryX + 3 * sColW + 4; // Align with 4th column
      const halfW = summaryW / 2;
      doc.setFillColor(236, 239, 241);
      doc.setDrawColor(120, 144, 156);
      doc.setLineWidth(0.8);
      doc.setFontSize(12);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      const label1 = "ጠቅላላ ክፍያ:";
      const value1 = fmt(((summations.tekilalaTekefay || 0) + (summations.prepaid || 0)) - ((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)));
      // Place label on first line and value on second line for better spacing
      doc.text(label1, summaryX + 10, tileY + 22, { align: 'left' });

      // Create a rectangle box around the value for better visibility
      const valueBoxWidth = 120;
      const valueBoxHeight = 20;
      const valueBoxX = summaryX + halfW - valueBoxWidth - 8;
      const valueBoxY = tileY + 8;

      // Draw background box for the value
      doc.setFillColor(232, 245, 233); // Light green background
      doc.setDrawColor(129, 199, 132); // Green border
      doc.roundedRect(valueBoxX, valueBoxY, valueBoxWidth, valueBoxHeight, 2, 2, 'FD');

      doc.setFontSize(13);
      doc.setTextColor(0); // Black text
      doc.text(value1, summaryX + halfW - 14, tileY + 22, { align: 'right' });

      // Right tile: ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ (green)
      const rightTileX = summaryX + 4 * sColW + 4; // Align with 5th column
      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(129, 199, 132);
      doc.setLineWidth(0.8);
      doc.setFontSize(12);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      const label2 = "ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ:";
      const value2 = fmt((summations.tekilalaTekefay || 0) + (summations.prepaid || 0));
      // Place label on first line and value on second line for better spacing
      doc.text(label2, summaryX + halfW + 10, tileY + 22, { align: 'left' });

      // Create a rectangle box around the value for better visibility
      const value2BoxWidth = 120;
      const value2BoxHeight = 20;
      const value2BoxX = summaryX + summaryW - value2BoxWidth - 8;
      const value2BoxY = tileY + 8;

      // Draw background box for the value
      doc.setFillColor(232, 245, 233); // Light green background
      doc.setDrawColor(129, 199, 132); // Green border
      doc.roundedRect(value2BoxX, value2BoxY, value2BoxWidth, value2BoxHeight, 2, 2, 'FD');

      doc.setFontSize(13);
      doc.setTextColor(0); // Black text
      doc.text(value2, summaryX + summaryW - 14, tileY + 22, { align: 'right' });

      // Group 1 & 2: Side-by-side layout matching web interface
      const g2StartY = summaryY + summaryH + 15;
      const boxY = g2StartY;
      const boxW = (pageWidth - 2 * MARGIN - 20) / 2;
      const leftBoxX = MARGIN;
      const rightBoxX = MARGIN + boxW + 20;

      // Group 1 outer rectangle with light blue background
      doc.setDrawColor(0);
      doc.setFillColor(240, 248, 255); // Light blue background (#f0f8ff)
      doc.rect(leftBoxX, boxY, boxW, 150, "FD"); // increased height for PDF

      // Group 1 title - larger font size (30% increase)
      doc.setFontSize(16); // Increased from 14
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Group 1: የዚህ ወር", leftBoxX + boxW / 2, boxY + 15, { align: "center" });

      // Group 1 - First row (3 columns)
      const colW = (boxW - 24) / 3;
      doc.setFontSize(11); // Increased from 8 (30% increase)
      doc.setFont("nyala", "normal");
      doc.text("የውሃ ፍጆታ ብር", leftBoxX + 8, boxY + 35);
      doc.text("ቆጣሪ ኪራይ", leftBoxX + 8 + colW, boxY + 35);
      doc.text("ተጨማሪ ክፍያ", leftBoxX + 8 + 2 * colW, boxY + 35);

      doc.setFontSize(13); // Increased from 10 (30% increase)
      doc.setFont("nyala", "normal");
      doc.setTextColor(255, 152, 0); // Orange color for values
      doc.text(fmt(summations.yezihWerFjotaKfya), leftBoxX + 8, boxY + 50);
      doc.setTextColor(33, 150, 243); // Blue color for values
      doc.text(fmt(summations.kotariKiray), leftBoxX + 8 + colW, boxY + 50);
      doc.setTextColor(76, 175, 80); // Green color for values
      doc.text(fmt(summations.techemariKfya), leftBoxX + 8 + 2 * colW, boxY + 50);

      // Group 1 - Second row (2 columns)
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የዚህ ወር ደረቅ ቆሻሻ", leftBoxX + 8, boxY + 70);

      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(156, 39, 176); // Purple color for values
      doc.text(fmt(summations.additionalHisab), leftBoxX + 8, boxY + 85);

      // Group 1 totals (two columns)
      doc.setDrawColor(0);
      doc.line(leftBoxX + 8, boxY + 95, leftBoxX + boxW - 8, boxY + 95);

      // Left total - የዚህ ወር
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የዚህ ወር", leftBoxX + 8, boxY + 105);
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(33, 150, 243); // Blue color for info.main
      doc.text(fmt(summations.yezihWer), leftBoxX + 8, boxY + 118);

      // Right total - የዚህ ወር አና ደረቅ ቆሻሻ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የዚህ ወር አና ደረቅ ቆሻሻ", leftBoxX + 8 + colW, boxY + 105);
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(33, 150, 243); // Blue color for info.main
      doc.text(fmt((summations.yezihWer || 0) + (summations.additionalHisab || 0)), leftBoxX + 8 + colW, boxY + 118);

      // Right box - Group 2: ውዝፍ with light blue background
      const rightBoxH = 170; // increased height for PDF
      doc.setFillColor(240, 248, 255); // Light blue background (#f0f8ff)
      doc.rect(rightBoxX, boxY, boxW, rightBoxH, "FD");

      // Group 2 title - larger font size (30% increase)
      doc.setFontSize(16); // Increased from 14
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Group 2: ውዝፍ", rightBoxX + boxW / 2, boxY + 15, { align: "center" });

      // Group 2 - First row (3 columns) - matching web UI exactly
      // Column 1 - ውዝፍ ቆጣሪ ኪራይ
      doc.setFontSize(11); // Matching web UI fontSize: '1.17rem'
      doc.setFont("nyala", "normal");
      doc.text("ውዝፍ ቆጣሪ ኪራይ", rightBoxX + 8, boxY + 35);
      doc.setFontSize(13); // Matching web UI fontSize: '1.43rem'
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.wuzifKotariKiray), rightBoxX + 8, boxY + 50);

      // Column 2 - ውዝፍ ተጨማሪ ክፍያ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ ተጨማሪ ክፍያ", rightBoxX + 8 + colW, boxY + 35);
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.wuzifTechemariKfya), rightBoxX + 8 + colW, boxY + 50);

      // Column 3 - ቅጣት
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ቅጣት", rightBoxX + 8 + 2 * colW, boxY + 35);
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.kitat), rightBoxX + 8 + 2 * colW, boxY + 50);

      // Group 2 - Second row (3 columns) - matching web UI exactly
      // Column 1 - ውዝፍ ፍጆታ ክፍያ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ ፍጆታ ክፍያ", rightBoxX + 8, boxY + 70);
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.wuzifFjotaKfya), rightBoxX + 8, boxY + 85);

      // Column 2 - ውዝፍ ደረቅ ቆሻሻ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ ደረቅ ቆሻሻ", rightBoxX + 8 + colW, boxY + 70);
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.wuzifDerekKoshasha), rightBoxX + 8 + colW, boxY + 85);

      // Column 3 - የተላለፈ(ነባር) ውዝፍ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የተላለፈ(ነባር) ውዝፍ", rightBoxX + 8 + 2 * colW, boxY + 70);
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(
        (summations.wuzifHisab || 0) - (
          (summations.wuzifKotariKiray || 0) +
          (summations.wuzifFjotaKfya || 0) +
          (summations.wuzifDerekKoshasha || 0) +
          (summations.wuzifTechemariKfya || 0)
        )
      ), rightBoxX + 8 + 2 * colW, boxY + 85);

      // Group 2 totals (two columns) - matching web UI exactly
      doc.setDrawColor(0);
      doc.line(rightBoxX + 8, boxY + 100, rightBoxX + boxW - 8, boxY + 100);

      // First total - ውዝፍ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ", rightBoxX + 8, boxY + 115);
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), rightBoxX + 8, boxY + 130);

      // Second total - ውዝፍ አና ደረቅ ቆሻሻ
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ አና ደረቅ ቆሻሻ", rightBoxX + 8 + colW, boxY + 115);
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt(summations.wuzifHisab), rightBoxX + 8 + colW, boxY + 130);

      // Third total - ውዝፍ አና ቅጣት
      doc.setFontSize(11);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ አና ቅጣት", rightBoxX + 8 + 2 * colW, boxY + 115);
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54); // Red color for error.main
      doc.text(fmt((summations.wuzifHisab || 0) + (summations.kitat || 0)), rightBoxX + 8 + 2 * colW, boxY + 130);
      // (Removed extra summary tables; move directly to Payment Location Summary)

      // Payment Location Summary matching web interface (start directly after Group 2)
      const paymentStartY = boxY + rightBoxH + 20;

      // Prepare payment location data
      const paymentRows = [];



      // Add "ቅድሚያ የተከፈለ" row (6 columns)
      paymentRows.push([
        "ቅድሚያ የተከፈለ",
        (summations.prepaidCount || 0).toString(),
        fmt(summations.prepaid || 0),
        fmt(summations.prepaidAdditionalHisab || 0),
        fmt(summations.prepaidWuzifDerekKoshasha || 0),
        fmt(summations.prepaidTotalDerekKoshasha || 0)
      ]);

      // Add "ቢሮ የተከፈለ" row (6 columns)
      paymentRows.push([
        "ቢሮ የተከፈለ",
        (summations.paidAtOfficeCount || 0).toString(),
        fmt(summations.paidAtOffice || 0),
        fmt(summations.officeAdditionalHisab || 0),
        fmt(summations.officeWuzifDerekKoshasha || 0),
        fmt(summations.officeTotalDerekKoshasha || 0)
      ]);

      // Add bank payment rows (6 columns)
      Object.keys(summations.paidByBank || {}).forEach((bank) => {
        paymentRows.push([
          lookupBankName(bank),
          (summations.paidByBankCount?.[bank] || 0).toString(),
          fmt(summations.paidByBank?.[bank] || 0),
          fmt(summations.bankAdditionalHisab?.[bank] || 0),
          fmt(summations.bankWuzifDerekKoshasha?.[bank] || 0),
          fmt(summations.bankTotalDerekKoshasha?.[bank] || 0)
        ]);
      });

      // Add Total Bank Payments row
      paymentRows.push([
        'Total Bank Payments',
        Object.values(summations.paidByBankCount).reduce((a, b) => a + b, 0).toString(),
        fmt(Object.values(summations.paidByBank).reduce((a, b) => a + b, 0)),
        fmt(Object.values(summations.bankAdditionalHisab).reduce((a, b) => a + b, 0)),
        fmt(Object.values(summations.bankWuzifDerekKoshasha).reduce((a, b) => a + b, 0)),
        fmt(Object.values(summations.bankTotalDerekKoshasha).reduce((a, b) => a + b, 0))
      ]);

      // Add Duplicate Payments row back (no special background)
      if (summations.duplicatePaymentCount > 0) {
        paymentRows.push([
          "Duplicate Payments",
          (summations.duplicatePaymentCount || 0).toString(),
          fmt(summations.duplicatePayments || 0),
          fmt(summations.duplicateAdditionalHisab || 0),
          fmt(summations.duplicateWuzifDerekKoshasha || 0),
          fmt((summations.duplicateWuzifDerekKoshasha || 0) + (summations.duplicateAdditionalHisab || 0))
        ]);
      }

      // Add totals row (6 columns)
      paymentRows.push([
        "Grand Total",
        "",
        fmt(summations.totalPaidLocationSum || 0),
        fmt(summations.totaladditionalHisab || 0),
        fmt(summations.totalwuzifDerekKoshasha || 0),
        fmt((summations.totalwuzifDerekKoshasha || 0) + (summations.totaladditionalHisab || 0))
      ]);

      // (Duplicate Payments row removed per requirement)

      autoTable(doc, {
        head: [[
          "Payment Location",
          "No. of\nBills",
          "Total Amount\n(ETB)",
          "Additional\nHisab",
          "Wuzif Derek\nKoshasha",
          "Total Derek\nKoshasha"
        ]],
        body: paymentRows,
        styles: {
          font: "nyala",
          fontSize: 10,
          fontStyle: "normal",
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          cellPadding: 4,
          halign: 'center'
        },
        headStyles: {
          font: "nyala",
          fontSize: 11,
          fontStyle: "normal",
          fillColor: [240, 248, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5
        },
        theme: "grid",
        margin: { left: MARGIN, right: MARGIN },
        startY: paymentStartY,
        didParseCell: (data) => {
          if (data.section === 'body' && Array.isArray(data.row?.raw)) {
            if (data.row.raw[0] === 'Grand Total') {
              data.cell.styles.fillColor = [232, 245, 233];
              data.cell.styles.textColor = [27, 94, 32];
              data.cell.styles.fontStyle = 'bold';
            } else if (data.row.raw[0] === 'Duplicate Payments') {
              // No special styling for this row
            }
          }
        }
      });

      // Footer
      const gen = new Date();
      const moto = companyProfile?.companyMoto || "";
      const footerY = pageHeight - 30;

      doc.setDrawColor(180);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, footerY - 10, pageWidth - MARGIN, footerY - 10);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      // Left side: Generation date
      doc.text(`Generated on: ${gen.toLocaleDateString()} at ${gen.toLocaleTimeString()}`, MARGIN, footerY);

      // Center: Moto
      if (moto) {
        doc.text(moto, pageWidth / 2, footerY, { align: 'center' });
      }

      // Right side: Page number
      doc.text(`Page 1 of 1`, pageWidth - MARGIN, footerY, { align: 'right' });

      const fileName = `bill-summations-${selectedKifyaWerMonth || "-"}-${selectedKifyaWerYear || "-"}.pdf`;
      if (preview) {
        // Open in a new tab for quick visual inspection against old format
        doc.output("dataurlnewwindow", { filename: fileName });
      } else {
        doc.save(fileName);
      }
    } catch (err) {
      console.error("Failed to export PDF", err);
      toast.error("Failed to export PDF");
    }
  };

  // Export/Preview the current Summations to PDF WITHOUT Payment Location Summary
  const handleExportSummationsPDFBasic = async (preview = false) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
      try { doc.setFont("nyala", "normal"); } catch (_) { }

      const titleLeftAmh = companyProfile?.companyNameAmh || "";
      const titleLeftEng = companyProfile?.companyName || "";
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const MARGIN = 30;

      const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
      const logoW = 50, logoH = 50;
      if (logoBase64) {
        try { doc.addImage(logoBase64, "PNG", pageWidth - MARGIN - logoW, MARGIN, logoW, logoH); } catch (_) { }
      }

      doc.setFont("nyala", "normal");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(titleLeftAmh, MARGIN, MARGIN + 15);
      doc.setFontSize(16);
      doc.text(titleLeftEng, MARGIN, MARGIN + 30);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(1);
      doc.line(MARGIN, MARGIN + 55, pageWidth - MARGIN, MARGIN + 55);

      const reportTitle = `የሪፖርት ማጠቃለያ - ${selectedKifyaWerMonth || "-"}, ${selectedKifyaWerYear || "-"} - ${filterMoneyCollected === 'all'
        ? 'ሁሉም ንባብ  የገባላቸው'
        : filterMoneyCollected === 'true'
          ? 'የተከፈለ '
          : 'ይልተከፈለ '
        }`;
      doc.setFont("nyala", "normal");
      doc.setFontSize(16);
      doc.text(reportTitle, pageWidth / 2, MARGIN + 75, { align: "center" });

      const now = new Date();
      const [ecY, ecM, ecD] = ethiopianDate.toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      const gcText = `GC: ${now.toLocaleDateString()}`;
      const ecText = `EC: ${ecD}/${ecM}/${ecY}`;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(gcText, MARGIN, MARGIN + 45);
      doc.text(ecText, MARGIN + 80, MARGIN + 45);

      const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmt0 = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

      const contentStartY = MARGIN + 110;
      const fullW = pageWidth - 2 * MARGIN;

      // ───────────────────────────────────────────────────────────────
      // SUMMARY OVERVIEW — expanded with larger fonts & more spacing
      // ───────────────────────────────────────────────────────────────
      const summaryX = MARGIN;
      const summaryY = contentStartY;
      const summaryW = fullW;
      const summaryH = 180; // taller to breathe

      doc.setDrawColor(0);
      doc.setFillColor(240, 248, 255);
      doc.rect(summaryX, summaryY, summaryW, summaryH, "FD");

      doc.setFontSize(18);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Summary Overview", summaryX + summaryW / 2, summaryY + 20, { align: "center" });

      const sColW = (summaryW - 20) / 6;
      const sLabelY1 = summaryY + 42;
      const sValueY1 = summaryY + 62;
      const sLabelY2 = summaryY + 95;
      const sValueY2 = summaryY + 115;

      // Row 1 labels
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Total Bills", summaryX + 10 + 0 * sColW, sLabelY1);
      doc.text("የወሩ ፍጆታ (ሜ3)", summaryX + 10 + 1 * sColW, sLabelY1);
      doc.text("ውዝፍ ፍጆታ (ሜ3)", summaryX + 10 + 2 * sColW, sLabelY1);
      doc.text("ጠቅላላ ደረቅ ቆሻሻ", summaryX + 10 + 3 * sColW, sLabelY1);
      doc.text("ጠቅላላ ውዝፍ", summaryX + 10 + 4 * sColW, sLabelY1);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", summaryX + 10 + 5 * sColW, sLabelY1);

      // Row 1 values
      doc.setFontSize(15);
      doc.setFont("nyala", "normal");
      doc.setTextColor(33, 150, 243);
      doc.text(fmt0(filteredData.length), summaryX + 10 + 0 * sColW, sValueY1);
      doc.text(fmt0(summations.consumption), summaryX + 10 + 1 * sColW, sValueY1);
      doc.text(fmt(summations.wuzifFjota), summaryX + 10 + 2 * sColW, sValueY1);
      doc.text(fmt((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)), summaryX + 10 + 3 * sColW, sValueY1);
      doc.setTextColor(244, 67, 54);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), summaryX + 10 + 4 * sColW, sValueY1);
      doc.setTextColor(33, 150, 243);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), summaryX + 10 + 5 * sColW, sValueY1);

      // Row 2 labels
      doc.setFontSize(13);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ቅድሚያ የተከፈለ", summaryX + 10 + 0 * sColW, sLabelY2);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", summaryX + 10 + 1 * sColW, sLabelY2);
      doc.text("ቅጣት", summaryX + 10 + 2 * sColW, sLabelY2);
      doc.text("ጠቅላላ ውዝፍ", summaryX + 10 + 3 * sColW, sLabelY2);

      // Row 2 values
      doc.setFontSize(15);
      doc.setFont("nyala", "normal");
      doc.setTextColor(255, 87, 34);
      doc.text(fmt(summations.prepaid), summaryX + 10 + 0 * sColW, sValueY2);
      doc.setTextColor(33, 150, 243);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), summaryX + 10 + 1 * sColW, sValueY2);
      doc.setTextColor(244, 67, 54);
      doc.text(fmt(summations.kitat), summaryX + 10 + 2 * sColW, sValueY2);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), summaryX + 10 + 3 * sColW, sValueY2);

      // Grand total tiles inside Summary Overview — larger
      const halfW = summaryW / 2;
      const tileY = summaryY + summaryH - 42;

      // Left tile: ጠቅላላ ክፍያ
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ጠቅላላ ክፍያ:", summaryX + 12, tileY + 26, { align: 'left' });
      const gv1 = fmt(((summations.tekilalaTekefay || 0) + (summations.prepaid || 0)) - ((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)));
      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(129, 199, 132);
      doc.roundedRect(summaryX + halfW - 140, tileY + 10, 140, 24, 3, 3, 'FD');
      doc.setFontSize(15);
      doc.setTextColor(0);
      doc.text(gv1, summaryX + halfW - 8, tileY + 26, { align: 'right' });

      // Right tile: ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ:", summaryX + halfW + 12, tileY + 26, { align: 'left' });
      const gv2 = fmt((summations.tekilalaTekefay || 0) + (summations.prepaid || 0));
      doc.setFillColor(232, 245, 233);
      doc.setDrawColor(129, 199, 132);
      doc.roundedRect(summaryX + summaryW - 148, tileY + 10, 140, 24, 3, 3, 'FD');
      doc.setFontSize(15);
      doc.setTextColor(0);
      doc.text(gv2, summaryX + summaryW - 16, tileY + 26, { align: 'right' });

      // ───────────────────────────────────────────────────────────────
      // GROUP 1: የዚህ ወር — FULL WIDTH, larger fonts
      // ───────────────────────────────────────────────────────────────
      const g1Y = summaryY + summaryH + 20;
      const groupH = 180;

      doc.setDrawColor(0);
      doc.setFillColor(240, 248, 255);
      doc.rect(MARGIN, g1Y, fullW, groupH, "FD");

      doc.setFontSize(18);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Group 1: የዚህ ወር", MARGIN + fullW / 2, g1Y + 20, { align: "center" });

      const colW = (fullW - 30) / 4; // 4 columns across full width
      // Row 1: 3 items
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የውሃ ፍጆታ ብር", MARGIN + 12, g1Y + 48);
      doc.text("ቆጣሪ ኪራይ", MARGIN + 12 + colW, g1Y + 48);
      doc.text("ተጨማሪ ክፍያ", MARGIN + 12 + 2 * colW, g1Y + 48);
      doc.text("የዚህ ወር ደረቅ ቆሻሻ", MARGIN + 12 + 3 * colW, g1Y + 48);

      doc.setFontSize(17);
      doc.setFont("nyala", "normal");
      doc.setTextColor(255, 152, 0);
      doc.text(fmt(summations.yezihWerFjotaKfya), MARGIN + 12, g1Y + 70);
      doc.setTextColor(33, 150, 243);
      doc.text(fmt(summations.kotariKiray), MARGIN + 12 + colW, g1Y + 70);
      doc.setTextColor(76, 175, 80);
      doc.text(fmt(summations.techemariKfya), MARGIN + 12 + 2 * colW, g1Y + 70);
      doc.setTextColor(156, 39, 176);
      doc.text(fmt(summations.additionalHisab), MARGIN + 12 + 3 * colW, g1Y + 70);

      // Divider
      doc.setDrawColor(0);
      doc.line(MARGIN + 12, g1Y + 100, MARGIN + fullW - 12, g1Y + 100);

      // Totals row
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("የዚህ ወር", MARGIN + 12, g1Y + 120);
      doc.text("የዚህ ወር አና ደረቅ ቆሻሻ", MARGIN + 12 + colW, g1Y + 120);

      doc.setFontSize(18);
      doc.setFont("nyala", "normal");
      doc.setTextColor(33, 150, 243);
      doc.text(fmt(summations.yezihWer), MARGIN + 12, g1Y + 145);
      doc.text(fmt((summations.yezihWer || 0) + (summations.additionalHisab || 0)), MARGIN + 12 + colW, g1Y + 145);

      // ───────────────────────────────────────────────────────────────
      // GROUP 2: ውዝፍ — FULL WIDTH, larger fonts
      // ───────────────────────────────────────────────────────────────
      const g2Y = g1Y + groupH + 20;
      const g2H = 200;

      doc.setDrawColor(0);
      doc.setFillColor(240, 248, 255);
      doc.rect(MARGIN, g2Y, fullW, g2H, "FD");

      doc.setFontSize(18);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("Group 2: ውዝፍ", MARGIN + fullW / 2, g2Y + 20, { align: "center" });

      // Row 1: 3 items
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ ቆጣሪ ኪራይ", MARGIN + 12, g2Y + 48);
      doc.text("ውዝፍ ተጨማሪ ክፍያ", MARGIN + 12 + colW, g2Y + 48);
      doc.text("ቅጣት", MARGIN + 12 + 2 * colW, g2Y + 48);

      doc.setFontSize(17);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54);
      doc.text(fmt(summations.wuzifKotariKiray), MARGIN + 12, g2Y + 70);
      doc.text(fmt(summations.wuzifTechemariKfya), MARGIN + 12 + colW, g2Y + 70);
      doc.text(fmt(summations.kitat), MARGIN + 12 + 2 * colW, g2Y + 70);

      // Row 2: 3 items
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ ፍጆታ ክፍያ", MARGIN + 12, g2Y + 95);
      doc.text("ውዝፍ ደረቅ ቆሻሻ", MARGIN + 12 + colW, g2Y + 95);
      doc.text("የተላለፈ(ነባር) ውዝፍ", MARGIN + 12 + 2 * colW, g2Y + 95);

      doc.setFontSize(17);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54);
      doc.text(fmt(summations.wuzifFjotaKfya), MARGIN + 12, g2Y + 117);
      doc.text(fmt(summations.wuzifDerekKoshasha), MARGIN + 12 + colW, g2Y + 117);
      doc.text(fmt(
        (summations.wuzifHisab || 0) - (
          (summations.wuzifKotariKiray || 0) +
          (summations.wuzifFjotaKfya || 0) +
          (summations.wuzifDerekKoshasha || 0) +
          (summations.wuzifTechemariKfya || 0)
        )
      ), MARGIN + 12 + 2 * colW, g2Y + 117);

      // Divider
      doc.setDrawColor(0);
      doc.line(MARGIN + 12, g2Y + 135, MARGIN + fullW - 12, g2Y + 135);

      // Totals row: 3 items
      doc.setFontSize(14);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0);
      doc.text("ውዝፍ", MARGIN + 12, g2Y + 155);
      doc.text("ውዝፍ አና ደረቅ ቆሻሻ", MARGIN + 12 + colW, g2Y + 155);
      doc.text("ውዝፍ አና ቅጣት", MARGIN + 12 + 2 * colW, g2Y + 155);

      doc.setFontSize(18);
      doc.setFont("nyala", "normal");
      doc.setTextColor(244, 67, 54);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), MARGIN + 12, g2Y + 178);
      doc.text(fmt(summations.wuzifHisab), MARGIN + 12 + colW, g2Y + 178);
      doc.text(fmt((summations.wuzifHisab || 0) + (summations.kitat || 0)), MARGIN + 12 + 2 * colW, g2Y + 178);

      // Duplicate Payments row — only if total amount > 0
      if ((summations.duplicatePayments || 0) > 0) {
        const dpY = g2Y + g2H + 15;
        const dpW = fullW;
        const dpH = 40;

        doc.setDrawColor(244, 67, 54);
        doc.setFillColor(255, 235, 238); // light red background
        doc.setLineWidth(1);
        doc.rect(MARGIN, dpY, dpW, dpH, "FD");

        // Label
        doc.setFontSize(15);
        doc.setFont("nyala", "normal");
        doc.setTextColor(183, 28, 28); // dark red
        doc.text("Duplicate Payments", MARGIN + 12, dpY + 26);

        // No. of Bills
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text("No. of Bills:", MARGIN + dpW / 3, dpY + 16);
        doc.setFontSize(16);
        doc.setTextColor(244, 67, 54);
        doc.text(String(summations.duplicatePaymentCount || 0), MARGIN + dpW / 3, dpY + 34);

        // Total Amount (ETB)
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text("Total Amount (ETB):", MARGIN + (dpW * 2) / 3, dpY + 16);
        doc.setFontSize(16);
        doc.setTextColor(244, 67, 54);
        doc.text(fmt(summations.duplicatePayments), MARGIN + (dpW * 2) / 3, dpY + 34);
      }

      // NOTE: Payment Location Summary table is intentionally SKIPPED in this basic version

      // Footer
      const gen = new Date();
      const moto = companyProfile?.companyMoto || "";
      const footerY = pageHeight - 30;

      doc.setDrawColor(180);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, footerY - 10, pageWidth - MARGIN, footerY - 10);

      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);

      doc.text(`Generated on: ${gen.toLocaleDateString()} at ${gen.toLocaleTimeString()}`, MARGIN, footerY);

      if (moto) {
        doc.text(moto, pageWidth / 2, footerY, { align: 'center' });
      }

      doc.text(`Page 1 of 1`, pageWidth - MARGIN, footerY, { align: 'right' });

      const fileName = `bill-summations-basic-${selectedKifyaWerMonth || "-"}-${selectedKifyaWerYear || "-"}.pdf`;
      if (preview) {
        doc.output("dataurlnewwindow", { filename: fileName });
      } else {
        doc.save(fileName);
      }
    } catch (err) {
      console.error("Failed to export PDF (Basic)", err);
      toast.error("Failed to export PDF (Basic)");
    }
  };

  // Excel export function
  const handleExportToExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Prepare data for export - only visible columns
      const exportData = filteredData.map((row, index) => ({
        '#': index + 1,
        'Invoice Number': row.billingInvoiceNumber || '',
        'Customer Name': row.customerFullName || '',
        'Account Number': row.customerAccountNumber || '',
        'Zero Reading Wor Bzat': row.zeroReadingWorBzat || 0,
        'Kebele': row.customerKebele || '',
        'wuzifWorBzat': row.wuzifWorBzat || 0,
        'Yezih Wer': row.yezihWer || 0,
        'Wuzif Hisab': row.wuzifHisab || 0,
        'Kitat': row.kitat || 0,
        'Total Payable': row.tekilalaTekefay || 0,
        'Customer Type': row.customerType || '',
      }));

      // Create worksheet from data
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Bills');

      // Generate filename with current date
      const now = new Date();
      const filename = `Bills_Export_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);

      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "billingInvoiceNumber",
        header: "Invoice Number",
      },
      {
        // NEW COLUMN: Customer Name
        accessorKey: "customerFullName",
        header: "Customer Name",
      },
      {
        // NEW COLUMN: Account Number
        accessorKey: "customerAccountNumber",
        header: "Account Number",
      },
      {
        // NEW COLUMN: Kebele (from customer table)
        accessorKey: "customerKebele",
        header: "Kebele",
      },
      {
        accessorKey: "wuzifWorBzat",
        header: "wuzifWorBzat",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      // {
      //   accessorKey: "id",
      //   header: "DB ID",
      // },
      // {
      //   accessorKey: "lastReading",
      //   header: "Last Reading",
      //   Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      // },
      // {
      //   accessorKey: "previousReading",
      //   header: "Previous Reading",
      //   Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      // },
      // {
      //   accessorKey: "consumption",
      //   header: "Consumption",
      //   Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      // },
      // {
      //   accessorKey: "kifyaWer",
      //   header: "Kifya Wer (Month)",
      // },
      // {
      //   accessorKey: "yezihWerFjotaKfya",
      //   header: "Current Month Fee",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      {
        accessorKey: "yezihWer",
        header: "Yezih Wer",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      // {
      //   accessorKey: "additionalHisab",
      //   header: "Additional Hisab",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "techemariKfya",
      //   header: "Techemari Kfya",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      {
        accessorKey: "wuzifHisab",
        header: "Wuzif Hisab",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "kitat",
        header: "Kitat",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      // {
      //   id: "actions-transfer-kitat",
      //   header: "Kitat Transfer",
      //   Cell: ({ row }) => {
      //     const original = row.original;
      //     const accountNumber =
      //       original.customerAccountNumber || original.accountNumber || null;
      //     const kitatVal = Number(original.kitat || 0);
      //     const disabled = !accountNumber || kitatVal <= 0 || original.isVoid;
      //     return (
      //       <Button
      //         variant="outlined"
      //         size="small"
      //         disabled={disabled || transferKitatMutation.isLoading}
      //         onClick={() => handleTransferKitatForAccount(accountNumber, kitatVal)}
      //       >
      //         Transfer Kitat
      //       </Button>
      //     );
      //   },
      // },
      {
        accessorKey: "tekilalaTekefay",
        header: "Total Payable",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "customerType",
        header: "Customer Type",
      },
      {
        accessorKey: "zeroReadingWorBzat",
        header: "Zero Reading Wor Bzat",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      // {
      //   accessorKey: "wuzifDerekKoshasha",
      //   header: "Wuzif Derek Koshasha",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "status",
      //   header: "Status",
      // },
      // {
      //   accessorKey: "moneyCollected",
      //   header: "Money Collected",
      //   Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      // },
      // {
      //   accessorKey: "isVoid",
      //   header: "Is Void",
      //   Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      // },
      // Existing New columns from the latest DTO
      // {
      //   accessorKey: "kitat",
      //   header: "Kitat",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "wuzifTechemariKfya",
      //   header: "Wuzif Techemari Kfya",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "consumptionWuzif",
      //   header: "Consumption Wuzif",
      //   Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      // },
      // {
      //   accessorKey: "wuzifKotariKiray",
      //   header: "Wuzif Kotari Kiray",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "wuzifFjota",
      //   header: "Wuzif Fjota",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "temelashBirr",
      //   header: "Temelash Birr",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "kecreditYetekefele",
      //   header: "Kecredit Yetekefele",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "tekilalaYetekefele",
      //   header: "Tekilala Yetekefele",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   accessorKey: "tekilalaBankYetekefele",
      //   header: "Tekilala Bank Yetekefele",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // NEW COLUMN
      // {
      //   accessorKey: "wuzifFjotaKfya",
      //   header: "Wuzif Fjota Kfya",
      //   Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      // },
      // {
      //   // Added isBillGenerated column
      //   accessorKey: "isBillGenerated",
      //   header: "Bill Generated",
      //   Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      // },
    ],
    [kebeles]
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.original?.moneyCollected ? "lightgreen" : "lightyellow",
      },
    }),
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Failed to load bills." }
      : undefined,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <Tooltip title="View Details">
          <IconButton onClick={() => setViewReadingId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Bill List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="month-select-label">Month</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedKifyaWerMonth}
                  label="Month"
                  onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
                >
                  {ethiopianMonths.map((month, index) => (
                    <MenuItem key={index} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedKifyaWerYear}
                  label="Year"
                  onChange={(e) => setSelectedKifyaWerYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleFilterClick}
                disabled={
                  !selectedKifyaWerMonth || !selectedKifyaWerYear || isLoading
                }
              >
                Filter Bills
              </Button>


              {/* >>> ADDED: New client-side filter controls */}
              <FormControlLabel
                sx={{ ml: 1 }}
                control={
                  <Checkbox
                    checked={filterDerashPaid}
                    onChange={(e) => setFilterDerashPaid(e.target.checked)}
                    name="derashPaid"
                  />
                }
                label="Derash Paid"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterPaidOnFrontOffice}
                    onChange={(e) =>
                      setFilterPaidOnFrontOffice(e.target.checked)
                    }
                    name="paidOnFrontOffice"
                  />
                }
                label="Office Paid"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterUnicashPaid}
                    onChange={(e) => setFilterUnicashPaid(e.target.checked)}
                    name="unicashPaid"
                  />
                }
                label="Unicash Paid"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterVoidChangedCustomers}
                    onChange={(e) => setFilterVoidChangedCustomers(e.target.checked)}
                    name="voidChanged"
                  />
                }
                label="Have Void"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterPrepaid}
                    onChange={(e) => setFilterPrepaid(e.target.checked)}
                    name="prepaid"
                  />
                }
                label="Prepaid"
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="money-collected-filter-label">
                  Collection Status
                </InputLabel>
                <Select
                  labelId="money-collected-filter-label"
                  value={filterMoneyCollected}
                  label="Collection Status"
                  onChange={(e) => setFilterMoneyCollected(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Money Collected</MenuItem>
                  <MenuItem value="false">Not Collected</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="sms-sent-filter-label">SMS Status</InputLabel>
                <Select
                  labelId="sms-sent-filter-label"
                  value={filterSmsSent}
                  label="SMS Status"
                  onChange={(e) => setFilterSmsSent(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="sent">SMS Sent</MenuItem>
                  <MenuItem value="not_sent">SMS Not Sent</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="wuzif-operator-label">Wuzif Op</InputLabel>
                <Select
                  labelId="wuzif-operator-label"
                  value={wuzifMonthsOp}
                  label="Wuzif Op"
                  onChange={(e) => setWuzifMonthsOp(e.target.value)}
                >
                  <MenuItem value="eq">=</MenuItem>
                  <MenuItem value="lt">{"<"}</MenuItem>
                  <MenuItem value="gte">≥</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                type="number"
                label="Wuzif Months"
                value={wuzifMonthsVal}
                onChange={(e) => setWuzifMonthsVal(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ width: 140 }}
              />

              {/* Zero Reading Filter UI */}
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="zero-reading-operator-label">Zero Op</InputLabel>
                <Select
                  labelId="zero-reading-operator-label"
                  value={zeroReadingMonthsOp}
                  label="Zero Op"
                  onChange={(e) => setZeroReadingMonthsOp(e.target.value)}
                >
                  <MenuItem value="eq">=</MenuItem>
                  <MenuItem value="lt">{"<"}</MenuItem>
                  <MenuItem value="gte">≥</MenuItem>
                  <MenuItem value="lte">≤</MenuItem>
                </Select>
              </FormControl>

              <TextField
                size="small"
                type="number"
                label="Zero Read Months"
                value={zeroReadingMonthsVal}
                onChange={(e) => setZeroReadingMonthsVal(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ width: 140 }}
              />

              {/* Dropdown filters from customerList (no data filtering applied yet) */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Kebele</InputLabel>
                <Select
                  value={selectedKebeleId}
                  label="Kebele"
                  onChange={(e) => {
                    setSelectedKebeleId(e.target.value);
                    setSelectedKetenaId("");
                  }}
                  disabled={isKebelesLoading}
                >
                  <MenuItem value="">
                    <em>All Kebeles</em>
                  </MenuItem>
                  {isKebelesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : kebeles?.length > 0 ? (
                    kebeles.map((kebele) => (
                      <MenuItem key={kebele.id} value={kebele.id}>
                        {kebele.name || `Kebele ${kebele.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No kebeles found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }} disabled={!selectedKebeleId}>
                <InputLabel>Ketena</InputLabel>
                <Select
                  value={selectedKetenaId}
                  label="Ketena"
                  onChange={(e) => setSelectedKetenaId(e.target.value)}
                  disabled={isKetenasLoading || !selectedKebeleId}
                >
                  <MenuItem value="">
                    <em>All Ketenas</em>
                  </MenuItem>
                  {isKetenasLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : ketenas?.length > 0 ? (
                    ketenas.map((ketena) => (
                      <MenuItem key={ketena.id} value={ketena.id}>
                        {ketena.name || `Ketena ${ketena.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No ketenas found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={selectedBranchId}
                  label="Branch"
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedReaderId("");
                  }}
                  disabled={isBranchesLoading}
                >
                  <MenuItem value="">
                    <em>All Branches</em>
                  </MenuItem>
                  {isBranchesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : branches?.length > 0 ? (
                    branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name || `Branch ${branch.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No branches found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }} disabled={!selectedBranchId}>
                <InputLabel>Assigned Reader</InputLabel>
                <Select
                  value={selectedReaderId}
                  label="Assigned Reader"
                  onChange={(e) => setSelectedReaderId(e.target.value)}
                  disabled={isReadersLoading || !selectedBranchId}
                >
                  <MenuItem value="">
                    <em>All Readers</em>
                  </MenuItem>
                  {isReadersLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : readers?.length > 0 ? (
                    readers.map((reader) => (
                      <MenuItem key={reader.id} value={reader.id}>
                        {reader.name || `Reader ${reader.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No readers found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={selectedCustomerTypeId}
                  label="Customer Type"
                  onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
                  disabled={isCustomerTypesLoading}
                >
                  <MenuItem value="">
                    <em>All Customer Types</em>
                  </MenuItem>
                  {isCustomerTypesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : customerTypes?.length > 0 ? (
                    customerTypes.map((ct) => (
                      <MenuItem key={ct.id} value={ct.id}>
                        {ct.name || `Type ${ct.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No customer types found</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Customer Status Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Customer Status</InputLabel>
                <Select
                  value={filterCustomerStatus}
                  label="Customer Status"
                  onChange={(e) => setFilterCustomerStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="deleted">Disconnected</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                mb: 1,
                mt: 1,
                flexWrap: "wrap",
              }}
            >
              <Button variant="contained" onClick={() => handleExportToExcel()}>
                Export to Excel
              </Button>
              {/* Ethiopian Date Picker (returns JS Date), convert to GC string */}
              <EtDatePicker
                label="Due Date (EC)"
                value={bankDueDateEC}
                onChange={(val) => {
                  setBankDueDateEC(val);
                  setBankDueDate(formatDateGC(val));
                }}
              />
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleExtraClick}
              >
                Extra Options
              </Button>
              <Menu
                anchorEl={anchorElExtra}
                open={Boolean(anchorElExtra)}
                onClose={handleExtraClose}
              >
                <MenuItem onClick={() => { handleExportBankCSV(); handleExtraClose(); }}>
                  Export Bank CSV
                </MenuItem>
                <MenuItem
                  onClick={() => { handleSendBulkSmsFromBackendForFilteredBills(); handleExtraClose(); }}
                  disabled={
                    isBackendBulkSmsSending ||
                    isBulkSmsSending ||
                    isBulkSmsSendingJasmin ||
                    isLoading ||
                    !filteredData.length
                  }
                >
                  {isBackendBulkSmsSending ? "Backend Bulk SMS..." : "Send SMS (Backend Bulk)"}
                </MenuItem>
                <MenuItem
                  onClick={() => { setImportModalOpen(true); handleExtraClose(); }}
                  disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear || filteredData.length === 0}
                >
                  Import Bank Payments
                </MenuItem>
                <MenuItem
                  onClick={() => { setUnicashImportModalOpen(true); handleExtraClose(); }}
                  disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear || filteredData.length === 0}
                >
                  Import Unicash Payments
                </MenuItem>
                <MenuItem onClick={() => { handleExportVoidChangedReportPDF(true); handleExtraClose(); }}>
                  Preview Void/Changed Report
                </MenuItem>
                <MenuItem onClick={() => { handleExportVoidChangedReportPDF(false); handleExtraClose(); }}>
                  Export Void/Changed PDF
                </MenuItem>
                <MenuItem
                  onClick={() => { handleSendSmsForFilteredBills(); handleExtraClose(); }}
                  disabled={
                    isBulkSmsSending ||
                    isBulkSmsSendingJasmin ||
                    isLoading ||
                    !filteredData.length ||
                    !bankDueDateEC
                  }
                >
                  {isBulkSmsSending ? "Sending SMS..." : "Send SMS (Filtered Bills)"}
                </MenuItem>
                <MenuItem
                  onClick={() => { handleSendSmsViaJasminForFilteredBills(); handleExtraClose(); }}
                  disabled={
                    isBulkSmsSending ||
                    isBulkSmsSendingJasmin ||
                    isLoading ||
                    !filteredData.length ||
                    !bankDueDateEC
                  }
                >
                  {isBulkSmsSendingJasmin ? "Sending via Jasmin..." : "Send via Jasmin (Filtered Bills)"}
                </MenuItem>
              </Menu>

            </Box>

            {/* Counts: filtered bills vs non-void/voided */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Filtered bills: {filteredData.length.toLocaleString()} (
                Non-void: {nonVoidedCount.toLocaleString()},
                Voided: {voidedCount.toLocaleString()}
                )
              </Typography>
            </Box>

            <MaterialReactTable table={table} />
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                {`Summations - ${selectedKifyaWerMonth} - ${selectedKifyaWerYear} - ${filterMoneyCollected === 'all'
                  ? 'ሁሉም ንባብ  የገባላቸው'
                  : filterMoneyCollected === 'true'
                    ? 'የተከፈለ '
                    : 'ይልተከፈለ '
                  }`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mb: 1 }}>
                <Button variant="outlined" size="small" onClick={() => handleExportSummationsPDF(true)}>
                  Preview PDF
                </Button>
                <Button variant="contained" size="small" onClick={() => handleExportSummationsPDF(false)}>
                  Export PDF
                </Button>
                <Button variant="contained" size="small" color="secondary" onClick={() => handleExportSummationsPDFBasic(false)}>
                  Export PDF Basic
                </Button>
              </Box>

              {/* New Horizontal Summary Group - Moved to Top */}
              <Box sx={{ mb: 2 }}>
                <Paper elevation={1} sx={{
                  p: 3,
                  border: '2px solid #000',
                  borderRadius: 1,
                  backgroundColor: '#f0f8ff'
                }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    align="center"
                    sx={{
                      fontFamily: 'Nyala, serif',
                      fontWeight: "bold",
                      mb: 3,
                      fontSize: '1.56rem' // 30% increase from 1.2rem
                    }}
                  >
                    Summary Overview
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
                    {/* Total Bills moved to first */}
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem', // 30% increase from 0.85rem
                          fontWeight: 'medium'
                        }}
                      >
                        Total Bills
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'info.main'
                        }}
                      >
                        {filteredData.length.toLocaleString("en-US")}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem', // 30% increase from 0.85rem
                          fontWeight: 'medium'
                        }}
                      >
                        የወሩ ፍጆታ (ሜ3)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem', // 30% increase from 1rem
                          color: 'primary.main'
                        }}
                      >
                        {summations.consumption.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ውዝፍ ፍጆታ (ሜ3)
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'info.main'
                        }}
                      >
                        {summations.wuzifFjota.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ጠቅላላ ደረቅ ቆሻሻ
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'info.main'
                        }}
                      >
                        {(
                          (summations.additionalHisab || 0) +
                          (summations.wuzifDerekKoshasha || 0)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ጠቅላላ የዚህ ወር
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'success.main'
                        }}
                      >
                        {summations.yezihWer.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', order: 9 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ጠቅላላ ውዝፍ
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'error.main'
                        }}
                      >

                        {((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}

                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', order: 8 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ቅጣት
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'error.main'
                        }}
                      >
                        {summations.kitat.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', order: 7 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ጠቅላላ ተጨማሪ ክፍያ
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'warning.main'
                        }}
                      >
                        {((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', order: 6 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        ቅድሚያ የተከፈለ
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'warning.main'
                        }}
                      >
                        {(summations.prepaid || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    {/* Bottom-right totals tiles */}
                    <Box sx={{ flex: '1 1 100%', display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1, order: 10 }}>
                      {/* ጠቅላላ ክፍያ */}
                      <Box sx={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: 1, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'Nyala, serif',
                            fontWeight: 'bold',
                            mb: 1
                          }}
                        >
                          ጠቅላላ ክፍያ:
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: '#e3f2fd',
                            border: '1px solid #90caf9',
                            borderRadius: '4px',
                            py: 0.5,
                            px: 3,
                            minWidth: '180px',
                            display: 'flex',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: 'info.main' }}
                          >
                            {(
                              ((summations.tekilalaTekefay || 0) + (summations.prepaid || 0))
                              -
                              ((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0))
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ */}
                      <Box sx={{ textAlign: 'center', border: '1px solid #ccc', borderRadius: 1, p: 1, bgcolor: '#e8f5e9', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: 'Nyala, serif',
                            fontWeight: 'bold',
                            mb: 1
                          }}
                        >
                          ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ:
                        </Typography>
                        <Box
                          sx={{
                            bgcolor: '#e8f5e9',
                            border: '1px solid #81c784',
                            borderRadius: '4px',
                            py: 0.5,
                            px: 3,
                            minWidth: '180px',
                            display: 'flex',
                            justifyContent: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: 'black' }}
                          >
                            {((summations.tekilalaTekefay || 0) + (summations.prepaid || 0)).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                  </Box>
                </Paper>
              </Box>

              {/* Group 1 & 2: Combined Box Layout */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{
                      p: 3,
                      border: '2px solid #000',
                      borderRadius: 1,
                      backgroundColor: '#f0f8ff',
                      minHeight: 420
                    }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          fontWeight: "bold",
                          mb: 3,
                          fontSize: '1.43rem' // 30% increase from 1.1rem
                        }}
                      >
                        Group 1: የዚህ ወር
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem', // 30% increase from 0.9rem
                                fontWeight: 'medium'
                              }}
                            >
                              የውሃ ፍጆታ ብር
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem', // 30% increase from 1.1rem
                                color: 'info.main'
                              }}
                            >
                              {summations.yezihWerFjotaKfya.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ቆጣሪ ኪራይ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'info.main'
                              }}
                            >
                              {summations.kotariKiray.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ተጨማሪ ክፍያ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'info.main'
                              }}
                            >
                              {summations.techemariKfya.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              የዚህ ወር ደረቅ ቆሻሻ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'info.main'
                              }}
                            >
                              {summations.additionalHisab.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            {/* Empty space for alignment */}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            {/* Empty space for alignment */}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ borderTop: '2px solid #000', pt: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              የዚህ ወር
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: "bold",
                                color: 'info.main',
                                fontSize: '1.69rem' // 30% increase from 1.3rem
                              }}
                            >
                              {summations.yezihWer.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              የዚህ ወር አና ደረቅ ቆሻሻ
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{
                                fontWeight: "bold",
                                color: 'info.main',
                                fontSize: '1.69rem'
                              }}
                            >
                              {((summations.yezihWer || 0) + (summations.additionalHisab || 0)).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={1} sx={{
                      p: 3,
                      border: '2px solid #000',
                      borderRadius: 1,
                      backgroundColor: '#f0f8ff',
                      minHeight: 420
                    }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        align="center"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          fontWeight: "bold",
                          mb: 3,
                          fontSize: '1.43rem' // 30% increase from 1.1rem
                        }}
                      >
                        Group 2: ውዝፍ
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ውዝፍ ቆጣሪ ኪራይ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {summations.wuzifKotariKiray.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ውዝፍ ተጨማሪ ክፍያ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {summations.wuzifTechemariKfya.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ቅጣት
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {summations.kitat.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ውዝፍ ፍጆታ ክፍያ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {summations.wuzifFjotaKfya.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              ውዝፍ ደረቅ ቆሻሻ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {summations.wuzifDerekKoshasha.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              የተላለፈ(ነባር) ውዝፍ
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                color: 'error.main',
                                fontSize: '1.43rem'
                              }}
                            >
                              {(
                                (summations.wuzifHisab || 0) - (
                                  (summations.wuzifKotariKiray || 0) +
                                  (summations.wuzifFjotaKfya || 0) +
                                  (summations.wuzifDerekKoshasha || 0) +
                                  (summations.wuzifTechemariKfya || 0)
                                )
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ borderTop: '2px solid #000', pt: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Nyala, serif',
                                  mb: 1.5,
                                  fontSize: '1.17rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                ውዝፍ
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: 'error.main',
                                  fontSize: '1.43rem'
                                }}
                              >
                                {((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Nyala, serif',
                                  mb: 1.5,
                                  fontSize: '1.17rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                ውዝፍ አና ደረቅ ቆሻሻ
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: 'error.main',
                                  fontSize: '1.43rem'
                                }}
                              >
                                {summations.wuzifHisab.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: 'Nyala, serif',
                                  mb: 1.5,
                                  fontSize: '1.17rem',
                                  fontWeight: 'medium'
                                }}
                              >
                                ውዝፍ አና ቅጣት
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: "bold",
                                  color: 'error.main',
                                  fontSize: '1.43rem'
                                }}
                              >
                                {(
                                  (summations.wuzifHisab || 0) +
                                  (summations.kitat || 0)
                                ).toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>



            </Box>
            {/* 2 summation segment */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Payment Location Summary
              </Typography>
              <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                      >
                        Payment Location
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="center"
                      >
                        No. of Bills
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Total Amount (ETB)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Additional Hisab
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Wuzif Derek Koshasha
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Total Derek Koshasha
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Tekilala Tekefay
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Check
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: "background.paper" }}>
                      <TableCell>Prepaid</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {summations.prepaidCount}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {summations.prepaid.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidAdditionalHisab.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidWuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", bgcolor: "action.selected" }}
                      >
                        {summations.prepaidTotalDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidTekilalaTekefay.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            summations.prepaidCheck < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {summations.prepaidCheck.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>ቢሮ የተከፈለ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {summations.paidAtOfficeCount}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {summations.paidAtOffice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeAdditionalHisab.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeWuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", bgcolor: "action.selected" }}
                      >
                        {summations.officeTotalDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeTekilalaTekefay.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            summations.officeCheck < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {summations.officeCheck.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>

                    {Object.entries(summations.paidByBank).map(
                      ([bankName, amount], index) => (
                        <TableRow
                          key={bankName}
                          sx={{
                            bgcolor:
                              index % 2 === 0
                                ? "background.paper"
                                : "action.hover",
                          }}
                        >
                          <TableCell>{lookupBankName(bankName)}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            {summations.paidByBankCount[bankName] || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankAdditionalHisab[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankWuzifDerekKoshasha[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "action.selected",
                            }}
                          >
                            {summations.bankTotalDerekKoshasha[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankTekilalaTekefay[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              color:
                                (summations.bankCheck[bankName] || 0) < 0
                                  ? "error.main"
                                  : "success.main",
                            }}
                          >
                            {(
                              summations.bankCheck[bankName] || 0
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow
                      sx={{
                        "& td": {
                          fontWeight: "bold",
                          bgcolor: "#e8f5e9",
                          color: "#1b5e20",
                        },
                      }}
                    >
                      <TableCell>Total Bank Payments</TableCell>
                      <TableCell align="center">
                        {Object.values(summations.paidByBankCount).reduce(
                          (a, b) => a + b,
                          0
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.paidByBank)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankAdditionalHisab)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankWuzifDerekKoshasha)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ bgcolor: "action.selected" }}
                      >
                        {(
                          Object.values(
                            summations.bankWuzifDerekKoshasha
                          ).reduce((a, b) => a + b, 0) +
                          Object.values(summations.bankAdditionalHisab).reduce(
                            (a, b) => a + b,
                            0
                          )
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankTekilalaTekefay)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            Object.values(summations.bankCheck).reduce(
                              (a, b) => a + b,
                              0
                            ) < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {Object.values(summations.bankCheck)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "& td, & th": {
                          borderTop: "2px solid rgba(224, 224, 224, 1)",
                          bgcolor: "#e8f5e9",
                          color: "#1b5e20",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        Grand Total
                      </TableCell>
                      <TableCell align="center"></TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totalPaidLocationSum.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totaladditionalHisab.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totalwuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.05em",
                          bgcolor: "action.selected",
                        }}
                      >
                        {(
                          summations.totalwuzifDerekKoshasha +
                          summations.totaladditionalHisab
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totaltekelalaTekefay.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.05em",
                          color:
                            summations.totaltekelalaTekefay -
                              summations.totalPaidLocationSum <
                              0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {(
                          summations.totaltekelalaTekefay -
                          summations.totalPaidLocationSum
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        colSpan={8}
                        style={{ padding: "4px 0", border: "none" }}
                      />
                    </TableRow>

                    <TableRow
                      sx={{
                        "& td, & th": { border: "none" },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                      >
                        Duplicate Payments
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="center"
                      >
                        {summations.duplicatePaymentCount}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicatePayments.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateAdditionalHisab?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateWuzifDerekKoshasha?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "error.main",
                          bgcolor: "action.selected",
                        }}
                        align="right"
                      >
                        {(
                          (summations.duplicateWuzifDerekKoshasha || 0) +
                          (summations.duplicateAdditionalHisab || 0)
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateTekilalaTekefay?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateCheck?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        }) || "0.00"}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <ReadingDetailModal
        readingId={viewReadingId}
        open={!!viewReadingId}
        onClose={() => setViewReadingId(null)}
      />

      <BankPaymentImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        filteredData={filteredData}
        selectedKifyaWerMonth={selectedKifyaWerMonth}
        selectedKifyaWerYear={selectedKifyaWerYear}
        onSaveSuccess={handleImportSuccess}
      />

      <UnicashPaymentImportModal
        open={unicashImportModalOpen}
        onClose={() => setUnicashImportModalOpen(false)}
        filteredData={filteredData}
        selectedKifyaWerMonth={selectedKifyaWerMonth}
        selectedKifyaWerYear={selectedKifyaWerYear}
        onSaveSuccess={handleImportSuccess}
      />

    </>
  );
};

const queryClient = new QueryClient();

const BillListPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillList />
  </QueryClientProvider>
);

export default BillListPage;
