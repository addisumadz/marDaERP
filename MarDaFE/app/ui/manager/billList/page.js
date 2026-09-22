"use client";
import { useMemo, useState, useEffect, useCallback } from "react";
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
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
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
import ProPeriodPicker from "@/app/ui/components/ProPeriodPicker";
import { ETH_MONTHS_AM } from "@/app/helpers/constants";
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
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth, ethDay] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState(
    ethiopianMonths[ethMonth - 1] || ""
  );
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState(
    String(ethYear) || ""
  );
  const [currentCycleMonth, setCurrentCycleMonth] = useState(
    ethiopianMonths[ethMonth - 1] || ""
  );
  const [currentCycleYear, setCurrentCycleYear] = useState(
    String(ethYear) || ""
  );

  // Load company profile to detect active reading date cycle
  const { data: profileData } = useQuery({
    queryKey: ["companyProfileActive"],
    queryFn: () => campanyProfileService.getCompanyProfileByStatus("Active"),
    staleTime: 30 * 60 * 1000,
  });

  useEffect(() => {
    if (profileData) {
      const payload =
        profileData && typeof profileData === "object" && "data" in profileData && profileData.data && typeof profileData.data === "object"
          ? profileData.data
          : profileData;

      if (payload && payload.activeReadingDate) {
        try {
          const activeDate = new Date(payload.activeReadingDate);
          const [eYear, eMonth] = ethiopianDate.toEthiopian(
            activeDate.getFullYear(),
            activeDate.getMonth() + 1,
            activeDate.getDate()
          );
          const monthIndex = Math.min(eMonth, 12) - 1;
          const cycleMonth = ETH_MONTHS_AM[monthIndex];
          setCurrentCycleMonth(cycleMonth);
          setCurrentCycleYear(String(eYear));
          setSelectedKifyaWerMonth(cycleMonth);
          setSelectedKifyaWerYear(String(eYear));
          return;
        } catch (e) {
          console.error("Error parsing activeReadingDate:", e);
        }
      }
    }

    const monthIndex = Math.min(ethMonth, 12) - 1;
    const cycleMonth = ETH_MONTHS_AM[monthIndex];
    setCurrentCycleMonth(cycleMonth);
    setCurrentCycleYear(String(ethYear));
  }, [profileData, ethYear, ethMonth]);

  // Distinct billing periods in database for indicator dots
  const { data: dbPeriods = [] } = useQuery({
    queryKey: ["distinctKifyaWer"],
    queryFn: () => readingService.getDistinctKifyaWerList(),
    staleTime: 15 * 60 * 1000,
  });

  const handlePeriodChange = useCallback((newMonth, newYear) => {
    setSelectedKifyaWerMonth(newMonth);
    setSelectedKifyaWerYear(String(newYear));
  }, []);
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
  const [selectedCashierId, setSelectedCashierId] = useState("");

  const yearOptions = [2014, 2015, 2016, 2017, 2018, 2019, 2020];

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
    queryFn: () => dropdownService.getKetenasByKebele(selectedKebeleId),
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

  const { data: cashiers = [], isLoading: isCashiersLoading } = useQuery({
    queryKey: ["cashiers"],
    queryFn: () => dropdownService.getCashiers(),
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

    if (selectedCashierId) {
      tempReadings = tempReadings.filter(
        (r) =>
          r?.cashierUserId !== undefined &&
          String(r.cashierUserId) === String(selectedCashierId)
      );
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
    selectedCashierId,
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



  const anyFilterSet = Boolean(
    selectedKebeleId ||
    selectedKetenaId ||
    selectedBranchId ||
    selectedReaderId ||
    selectedCustomerTypeId ||
    selectedCashierId ||
    filterDerashPaid ||
    filterPaidOnFrontOffice ||
    filterUnicashPaid ||
    filterPrepaid ||
    filterVoidChangedCustomers ||
    filterMoneyCollected !== "all" ||
    filterSmsSent !== "all" ||
    wuzifMonthsVal ||
    zeroReadingMonthsVal ||
    filterCustomerStatus !== "all"
  );

  const handleClearAllFilters = useCallback(() => {
    setSelectedKebeleId("");
    setSelectedKetenaId("");
    setSelectedBranchId("");
    setSelectedReaderId("");
    setSelectedCustomerTypeId("");
    setSelectedCashierId("");
    setFilterDerashPaid(false);
    setFilterPaidOnFrontOffice(false);
    setFilterUnicashPaid(false);
    setFilterPrepaid(false);
    setFilterVoidChangedCustomers(false);
    setFilterMoneyCollected("all");
    setFilterSmsSent("all");
    setWuzifMonthsVal("");
    setZeroReadingMonthsVal("");
    setFilterCustomerStatus("all");
  }, []);

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
      // Additional Payment 1 & 2
      additionalPayment1: 0,
      additionalPayment2: 0,
      wuzifAdditionalPayment1: 0,
      wuzifAdditionalPayment2: 0,
      prepaidAdditionalPayment1: 0,
      prepaidAdditionalPayment2: 0,
      prepaidWuzifAdditionalPayment1: 0,
      prepaidWuzifAdditionalPayment2: 0,
      prepaidTotalPayment1: 0,
      prepaidTotalPayment2: 0,
      officeAdditionalPayment1: 0,
      officeAdditionalPayment2: 0,
      officeWuzifAdditionalPayment1: 0,
      officeWuzifAdditionalPayment2: 0,
      officeTotalPayment1: 0,
      officeTotalPayment2: 0,
      bankAdditionalPayment1: {},
      bankAdditionalPayment2: {},
      bankWuzifAdditionalPayment1: {},
      bankWuzifAdditionalPayment2: {},
      bankTotalPayment1: {},
      bankTotalPayment2: {},
      duplicateAdditionalPayment1: 0,
      duplicateAdditionalPayment2: 0,
      duplicateWuzifAdditionalPayment1: 0,
      duplicateWuzifAdditionalPayment2: 0,
      totalAdditionalPayment1: 0,
      totalAdditionalPayment2: 0,
      totalWuzifAdditionalPayment1: 0,
      totalWuzifAdditionalPayment2: 0,
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

        // Additional Payment 1 and 2
        const addPay1 = Number(bill.mBillingAdditionalPayment1Value ?? bill.mbillingAdditionalPayment1Value ?? 0);
        const addPay2 = Number(bill.mBillingAdditionalPayment2Value ?? bill.mbillingAdditionalPayment2Value ?? 0);
        const wuzifAddPay1 = Number(bill.mBillingAdditionalPayment1Wuzif ?? bill.mbillingAdditionalPayment1Wuzif ?? 0);
        const wuzifAddPay2 = Number(bill.mBillingAdditionalPayment2Wuzif ?? bill.mbillingAdditionalPayment2Wuzif ?? 0);

        acc.additionalPayment1 += addPay1;
        acc.additionalPayment2 += addPay2;
        acc.wuzifAdditionalPayment1 += wuzifAddPay1;
        acc.wuzifAdditionalPayment2 += wuzifAddPay2;

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
          acc.prepaidAdditionalPayment1 += addPay1;
          acc.prepaidAdditionalPayment2 += addPay2;
          acc.prepaidWuzifAdditionalPayment1 += wuzifAddPay1;
          acc.prepaidWuzifAdditionalPayment2 += wuzifAddPay2;
          acc.prepaidTotalPayment1 += (addPay1 + wuzifAddPay1);
          acc.prepaidTotalPayment2 += (addPay2 + wuzifAddPay2);
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
          acc.officeAdditionalPayment1 += addPay1;
          acc.officeAdditionalPayment2 += addPay2;
          acc.officeWuzifAdditionalPayment1 += wuzifAddPay1;
          acc.officeWuzifAdditionalPayment2 += wuzifAddPay2;
          acc.officeTotalPayment1 += (addPay1 + wuzifAddPay1);
          acc.officeTotalPayment2 += (addPay2 + wuzifAddPay2);
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
            acc.bankAdditionalPayment1[bankKeyForSum] = (acc.bankAdditionalPayment1[bankKeyForSum] || 0) + addPay1;
            acc.bankAdditionalPayment2[bankKeyForSum] = (acc.bankAdditionalPayment2[bankKeyForSum] || 0) + addPay2;
            acc.bankWuzifAdditionalPayment1[bankKeyForSum] = (acc.bankWuzifAdditionalPayment1[bankKeyForSum] || 0) + wuzifAddPay1;
            acc.bankWuzifAdditionalPayment2[bankKeyForSum] = (acc.bankWuzifAdditionalPayment2[bankKeyForSum] || 0) + wuzifAddPay2;
            acc.bankTotalPayment1[bankKeyForSum] = (acc.bankTotalPayment1[bankKeyForSum] || 0) + addPay1 + wuzifAddPay1;
            acc.bankTotalPayment2[bankKeyForSum] = (acc.bankTotalPayment2[bankKeyForSum] || 0) + addPay2 + wuzifAddPay2;
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
            acc.bankAdditionalPayment1[bankKeyForSum] = (acc.bankAdditionalPayment1[bankKeyForSum] || 0) + addPay1;
            acc.bankAdditionalPayment2[bankKeyForSum] = (acc.bankAdditionalPayment2[bankKeyForSum] || 0) + addPay2;
            acc.bankWuzifAdditionalPayment1[bankKeyForSum] = (acc.bankWuzifAdditionalPayment1[bankKeyForSum] || 0) + wuzifAddPay1;
            acc.bankWuzifAdditionalPayment2[bankKeyForSum] = (acc.bankWuzifAdditionalPayment2[bankKeyForSum] || 0) + wuzifAddPay2;
            acc.bankTotalPayment1[bankKeyForSum] = (acc.bankTotalPayment1[bankKeyForSum] || 0) + addPay1 + wuzifAddPay1;
            acc.bankTotalPayment2[bankKeyForSum] = (acc.bankTotalPayment2[bankKeyForSum] || 0) + addPay2 + wuzifAddPay2;
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
          acc.duplicateAdditionalPayment1 += addPay1;
          acc.duplicateAdditionalPayment2 += addPay2;
          acc.duplicateWuzifAdditionalPayment1 += wuzifAddPay1;
          acc.duplicateWuzifAdditionalPayment2 += wuzifAddPay2;
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

    const totalAdditionalPayment1s = Object.values(
      calculatedSums.bankAdditionalPayment1
    ).reduce((sum, amount) => sum + amount, 0);

    const totalAdditionalPayment2s = Object.values(
      calculatedSums.bankAdditionalPayment2
    ).reduce((sum, amount) => sum + amount, 0);

    const totalWuzifAdditionalPayment1s = Object.values(
      calculatedSums.bankWuzifAdditionalPayment1
    ).reduce((sum, amount) => sum + amount, 0);

    const totalWuzifAdditionalPayment2s = Object.values(
      calculatedSums.bankWuzifAdditionalPayment2
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

    calculatedSums.totalAdditionalPayment1 =
      calculatedSums.officeAdditionalPayment1 +
      totalAdditionalPayment1s +
      calculatedSums.prepaidAdditionalPayment1;

    calculatedSums.totalAdditionalPayment2 =
      calculatedSums.officeAdditionalPayment2 +
      totalAdditionalPayment2s +
      calculatedSums.prepaidAdditionalPayment2;

    calculatedSums.totalWuzifAdditionalPayment1 =
      calculatedSums.officeWuzifAdditionalPayment1 +
      totalWuzifAdditionalPayment1s +
      calculatedSums.prepaidWuzifAdditionalPayment1;

    calculatedSums.totalWuzifAdditionalPayment2 =
      calculatedSums.officeWuzifAdditionalPayment2 +
      totalWuzifAdditionalPayment2s +
      calculatedSums.prepaidWuzifAdditionalPayment2;

    return calculatedSums;
  }, [filteredData]);

  // Executive KPI summary stats
  const kpiStats = useMemo(() => {
    const totalBills = readings?.length || 0;
    const filteredCount = filteredData?.length || 0;
    const totalPayable = Number(summations?.tekilalaTekefay || 0);
    const totalCollected = Number(summations?.tekilalaYetekefele || summations?.totalPaidLocationSum || 0);
    const totalUncollected = Math.max(0, totalPayable - totalCollected);
    const collectionRate = totalPayable > 0 ? Math.min(100, (totalCollected / totalPayable) * 100) : 0;
    const totalVolume = Number(summations?.consumption || 0);

    return {
      totalBills,
      filteredCount,
      totalPayable,
      totalCollected,
      totalUncollected,
      collectionRate,
      totalVolume,
    };
  }, [readings, filteredData, summations]);

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

  const addPay1RawLabel = (companyProfile?.mBillingAdditionalPayment1ValueLable || companyProfile?.mbillingAdditionalPayment1ValueLable || "").trim();
  const addPay2RawLabel = (companyProfile?.mBillingAdditionalPayment2ValueLable || companyProfile?.mbillingAdditionalPayment2ValueLable || "").trim();
  const addPay1Label = addPay1RawLabel || "ተጨማሪ ክፍያ 1";
  const addPay2Label = addPay2RawLabel || "ተጨማሪ ክፍያ 2";

  // Label helpers matching dry waste style ("የዚህ ወር ደረቅ ቆሻሻ", "ውዝፍ ደረቅ ቆሻሻ", "ጠቅላላ ደረቅ ቆሻሻ")
  const curPay1Label = addPay1Label.startsWith("የዚህ ወር") ? addPay1Label : `የዚህ ወር ${addPay1Label}`;
  const curPay2Label = addPay2Label.startsWith("የዚህ ወር") ? addPay2Label : `የዚህ ወር ${addPay2Label}`;
  const wuzifPay1Label = addPay1Label.startsWith("ውዝፍ") ? addPay1Label : `ውዝፍ ${addPay1Label}`;
  const wuzifPay2Label = addPay2Label.startsWith("ውዝፍ") ? addPay2Label : `ውዝፍ ${addPay2Label}`;
  const totPay1Label = addPay1Label.startsWith("ጠቅላላ") ? addPay1Label : `ጠቅላላ ${addPay1Label}`;
  const totPay2Label = addPay2Label.startsWith("ጠቅላላ") ? addPay2Label : `ጠቅላላ ${addPay2Label}`;

  // Numerical values & Zero-check helpers
  const curPay1Val = Number(summations.additionalPayment1 || 0);
  const curPay2Val = Number(summations.additionalPayment2 || 0);
  const wuzifPay1Val = Number(summations.wuzifAdditionalPayment1 || 0);
  const wuzifPay2Val = Number(summations.wuzifAdditionalPayment2 || 0);
  const totPay1Val = curPay1Val + wuzifPay1Val;
  const totPay2Val = curPay2Val + wuzifPay2Val;

  const hasCurPay1 = Math.abs(curPay1Val) > 0.0001;
  const hasCurPay2 = Math.abs(curPay2Val) > 0.0001;
  const hasWuzifPay1 = Math.abs(wuzifPay1Val) > 0.0001;
  const hasWuzifPay2 = Math.abs(wuzifPay2Val) > 0.0001;
  const hasTotPay1 = Math.abs(totPay1Val) > 0.0001;
  const hasTotPay2 = Math.abs(totPay2Val) > 0.0001;

  // Export/Preview the current Summations and Payment Location Summary to PDF (Full 1-Page A4 B&W)
  const handleExportSummationsPDF = async (preview = false) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
      try { doc.setFont("nyala", "normal"); } catch (_) { }

      const pageWidth = doc.internal.pageSize.getWidth();   // ~595.28 pt
      const pageHeight = doc.internal.pageSize.getHeight(); // ~841.89 pt
      const MARGIN = 28;
      const fullW = pageWidth - 2 * MARGIN; // ~539.28 pt

      const titleLeftAmh = companyProfile?.companyNameAmh || "";
      const titleLeftEng = companyProfile?.companyName || "";

      // Formatters
      const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmt0 = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

      // ─── 1. HEADER (Y: 24 to 88) ──────────────────────────────────
      const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
      const logoW = 40, logoH = 40;
      if (logoBase64) {
        try { doc.addImage(logoBase64, "PNG", pageWidth - MARGIN - logoW, MARGIN - 4, logoW, logoH); } catch (_) { }
      }

      doc.setFont("nyala", "normal");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(titleLeftAmh, MARGIN, MARGIN + 10);
      doc.setFontSize(12);
      doc.text(titleLeftEng, MARGIN, MARGIN + 23);

      const now = new Date();
      const [ecY, ecM, ecD] = ethiopianDate.toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`GC: ${now.toLocaleDateString()}`, MARGIN, MARGIN + 35);
      doc.text(`EC: ${ecD}/${ecM}/${ecY}`, MARGIN + 75, MARGIN + 35);

      // Header bottom rule
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(MARGIN, MARGIN + 42, pageWidth - MARGIN, MARGIN + 42);

      // Report title
      const statusText = filterMoneyCollected === 'all'
        ? 'ሁሉም ንባብ የገባላቸው'
        : filterMoneyCollected === 'true'
          ? 'የተከፈለ'
          : 'ያልተከፈለ';
      const reportTitle = `የሪፖርት ማጠቃለያ - ${selectedKifyaWerMonth || "-"}, ${selectedKifyaWerYear || "-"} (${statusText})`;
      doc.setFont("nyala", "normal");
      doc.setFontSize(12.5);
      doc.setTextColor(0, 0, 0);
      doc.text(reportTitle, pageWidth / 2, MARGIN + 57, { align: "center" });

      // ─── 2. SUMMARY OVERVIEW (Y: 96 to 196, Height = 100 pt) ───────
      const summaryY = MARGIN + 68; // 96
      const summaryH = 100;

      // Outer border box (White bg with crisp black border)
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.6);
      doc.rect(MARGIN, summaryY, fullW, summaryH, "FD");

      // Title Bar (Light grey fill)
      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN, summaryY, fullW, 15, "FD");
      doc.setFontSize(10.5);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Summary Overview", MARGIN + fullW / 2, summaryY + 11, { align: "center" });

      // 2 Rows of Metrics (6 columns per row)
      const sColW = (fullW - 16) / 6;
      const sLabelY1 = summaryY + 27;
      const sValueY1 = summaryY + 39;
      const sLabelY2 = summaryY + 52;
      const sValueY2 = summaryY + 64;

      // Row 1 Labels
      doc.setFontSize(8.5);
      doc.setFont("nyala", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Total Bills", MARGIN + 8 + 0 * sColW, sLabelY1);
      doc.text("የወሩ ፍጆታ (ሜ3)", MARGIN + 8 + 1 * sColW, sLabelY1);
      doc.text("ውዝፍ ፍጆታ (ሜ3)", MARGIN + 8 + 2 * sColW, sLabelY1);
      doc.text("ጠቅላላ ደረቅ ቆሻሻ", MARGIN + 8 + 3 * sColW, sLabelY1);
      if (hasTotPay1) doc.text(totPay1Label, MARGIN + 8 + 4 * sColW, sLabelY1);
      if (hasTotPay2) doc.text(totPay2Label, MARGIN + 8 + 5 * sColW, sLabelY1);

      // Row 1 Values
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt0(filteredData.length), MARGIN + 8 + 0 * sColW, sValueY1);
      doc.text(fmt0(summations.consumption), MARGIN + 8 + 1 * sColW, sValueY1);
      doc.text(fmt(summations.wuzifFjota), MARGIN + 8 + 2 * sColW, sValueY1);
      doc.text(fmt((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)), MARGIN + 8 + 3 * sColW, sValueY1);
      if (hasTotPay1) doc.text(fmt(totPay1Val), MARGIN + 8 + 4 * sColW, sValueY1);
      if (hasTotPay2) doc.text(fmt(totPay2Val), MARGIN + 8 + 5 * sColW, sValueY1);

      // Row 2 Labels
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("ጠቅላላ የዚህ ወር", MARGIN + 8 + 0 * sColW, sLabelY2);
      doc.text("ቅድሚያ የተከፈለ", MARGIN + 8 + 1 * sColW, sLabelY2);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", MARGIN + 8 + 2 * sColW, sLabelY2);
      doc.text("ቅጣት", MARGIN + 8 + 3 * sColW, sLabelY2);
      doc.text("ጠቅላላ ውዝፍ", MARGIN + 8 + 4 * sColW, sLabelY2);

      // Row 2 Values
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.yezihWer), MARGIN + 8 + 0 * sColW, sValueY2);
      doc.text(fmt(summations.prepaid), MARGIN + 8 + 1 * sColW, sValueY2);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), MARGIN + 8 + 2 * sColW, sValueY2);
      doc.text(fmt(summations.kitat), MARGIN + 8 + 3 * sColW, sValueY2);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), MARGIN + 8 + 4 * sColW, sValueY2);

      // Bottom Grand Total Framing
      const tileY = summaryY + 72;
      const totalExcl = ((summations.tekilalaTekefay || 0) + (summations.prepaid || 0)) - ((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0));
      const totalIncl = (summations.tekilalaTekefay || 0) + (summations.prepaid || 0);

      // Left Box: ጠቅላላ ክፍያ (Excl. Waste)
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text("ጠቅላላ ክፍያ:", MARGIN + 8, tileY + 16);
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(MARGIN + 75, tileY + 3, 145, 18, "FD");
      doc.setFontSize(11);
      doc.text(fmt(totalExcl), MARGIN + 215, tileY + 16, { align: "right" });

      // Right Box: ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ (Incl. Waste)
      doc.setFontSize(9.5);
      doc.text("ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ:", MARGIN + fullW / 2 + 8, tileY + 16);
      doc.setFillColor(245, 245, 245);
      doc.rect(MARGIN + fullW - 148, tileY + 3, 140, 18, "FD");
      doc.setFontSize(11);
      doc.text(fmt(totalIncl), MARGIN + fullW - 12, tileY + 16, { align: "right" });

      // ─── 3. GROUP 1 & 2 SIDE-BY-SIDE (Y: 202 to 346, Height = 144 pt) ──
      const gBoxY = summaryY + summaryH + 6; // 202
      const gBoxH = 144;
      const gBoxW = (fullW - 10) / 2; // ~264.6 pt
      const leftBoxX = MARGIN;
      const rightBoxX = MARGIN + gBoxW + 10;
      const gColW3 = (gBoxW - 16) / 3;

      // ── Left Box: Group 1: የዚህ ወር ──
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.6);
      doc.rect(leftBoxX, gBoxY, gBoxW, gBoxH, "FD");

      doc.setFillColor(240, 240, 240);
      doc.rect(leftBoxX, gBoxY, gBoxW, 15, "FD");
      doc.setFontSize(10.5);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Group 1: የዚህ ወር", leftBoxX + gBoxW / 2, gBoxY + 11, { align: "center" });

      // Row 1
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("የውሃ ፍጆታ ብር", leftBoxX + 8, gBoxY + 27);
      doc.text("ቆጣሪ ኪራይ", leftBoxX + 8 + gColW3, gBoxY + 27);
      doc.text("ተጨማሪ ክፍያ", leftBoxX + 8 + 2 * gColW3, gBoxY + 27);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.yezihWerFjotaKfya), leftBoxX + 8, gBoxY + 39);
      doc.text(fmt(summations.kotariKiray), leftBoxX + 8 + gColW3, gBoxY + 39);
      doc.text(fmt(summations.techemariKfya), leftBoxX + 8 + 2 * gColW3, gBoxY + 39);

      // Row 2
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("የዚህ ወር ደረቅ ቆሻሻ", leftBoxX + 8, gBoxY + 52);
      if (hasCurPay1) doc.text(curPay1Label, leftBoxX + 8 + gColW3, gBoxY + 52);
      if (hasCurPay2) doc.text(curPay2Label, leftBoxX + 8 + 2 * gColW3, gBoxY + 52);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.additionalHisab), leftBoxX + 8, gBoxY + 64);
      if (hasCurPay1) doc.text(fmt(curPay1Val), leftBoxX + 8 + gColW3, gBoxY + 64);
      if (hasCurPay2) doc.text(fmt(curPay2Val), leftBoxX + 8 + 2 * gColW3, gBoxY + 64);

      // Divider line
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(leftBoxX + 6, gBoxY + 91, leftBoxX + gBoxW - 6, gBoxY + 91);

      // Subtotals (G1)
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text("የዚህ ወር", leftBoxX + 8, gBoxY + 104);
      doc.text("የዚህ ወር አና ደረቅ ቆሻሻ", leftBoxX + 8 + gColW3 * 1.3, gBoxY + 104);

      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.rect(leftBoxX + 8, gBoxY + 111, gColW3 * 1.2, 19, "FD");
      doc.rect(leftBoxX + 8 + gColW3 * 1.3, gBoxY + 111, gColW3 * 1.5, 19, "FD");

      doc.setFontSize(10.5);
      doc.text(fmt(summations.yezihWer), leftBoxX + 8 + gColW3 * 1.2 - 4, gBoxY + 125, { align: "right" });
      doc.text(fmt((summations.yezihWer || 0) + (summations.additionalHisab || 0)), leftBoxX + 8 + gColW3 * 2.8 - 4, gBoxY + 125, { align: "right" });

      // ── Right Box: Group 2: ውዝፍ ──
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.6);
      doc.rect(rightBoxX, gBoxY, gBoxW, gBoxH, "FD");

      doc.setFillColor(240, 240, 240);
      doc.rect(rightBoxX, gBoxY, gBoxW, 15, "FD");
      doc.setFontSize(10.5);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Group 2: ውዝፍ", rightBoxX + gBoxW / 2, gBoxY + 11, { align: "center" });

      // Row 1
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("ውዝፍ ቆጣሪ ኪራይ", rightBoxX + 8, gBoxY + 26);
      doc.text("ውዝፍ ተጨማሪ ክፍያ", rightBoxX + 8 + gColW3, gBoxY + 26);
      doc.text("ቅጣት", rightBoxX + 8 + 2 * gColW3, gBoxY + 26);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.wuzifKotariKiray), rightBoxX + 8, gBoxY + 38);
      doc.text(fmt(summations.wuzifTechemariKfya), rightBoxX + 8 + gColW3, gBoxY + 38);
      doc.text(fmt(summations.kitat), rightBoxX + 8 + 2 * gColW3, gBoxY + 38);

      // Row 2
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text("ውዝፍ ፍጆታ ክፍያ", rightBoxX + 8, gBoxY + 48);
      doc.text("ውዝፍ ደረቅ ቆሻሻ", rightBoxX + 8 + gColW3, gBoxY + 48);
      doc.text("የተላለፈ(ነባር) ውዝፍ", rightBoxX + 8 + 2 * gColW3, gBoxY + 48);

      const transferredVal = (summations.wuzifHisab || 0) - (
        (summations.wuzifKotariKiray || 0) +
        (summations.wuzifFjotaKfya || 0) +
        (summations.wuzifDerekKoshasha || 0) +
        (summations.wuzifTechemariKfya || 0)
      );

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.wuzifFjotaKfya), rightBoxX + 8, gBoxY + 60);
      doc.text(fmt(summations.wuzifDerekKoshasha), rightBoxX + 8 + gColW3, gBoxY + 60);
      doc.text(fmt(transferredVal), rightBoxX + 8 + 2 * gColW3, gBoxY + 60);

      // Row 3
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      if (hasWuzifPay1) doc.text(wuzifPay1Label, rightBoxX + 8, gBoxY + 70);
      if (hasWuzifPay2) doc.text(wuzifPay2Label, rightBoxX + 8 + gColW3, gBoxY + 70);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      if (hasWuzifPay1) doc.text(fmt(wuzifPay1Val), rightBoxX + 8, gBoxY + 82);
      if (hasWuzifPay2) doc.text(fmt(wuzifPay2Val), rightBoxX + 8 + gColW3, gBoxY + 82);

      // Divider line
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(rightBoxX + 6, gBoxY + 91, rightBoxX + gBoxW - 6, gBoxY + 91);

      // Subtotals (G2) - 3 items
      const g2SubColW = (gBoxW - 16) / 3;
      doc.setFontSize(8.5);
      doc.setTextColor(0, 0, 0);
      doc.text("ውዝፍ", rightBoxX + 8, gBoxY + 104);
      doc.text("ውዝፍ አና ደረቅ ቆሻሻ", rightBoxX + 8 + g2SubColW, gBoxY + 104);
      doc.text("ውዝፍ አና ቅጣት", rightBoxX + 8 + 2 * g2SubColW, gBoxY + 104);

      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.rect(rightBoxX + 6, gBoxY + 111, g2SubColW - 2, 19, "FD");
      doc.rect(rightBoxX + 6 + g2SubColW, gBoxY + 111, g2SubColW - 2, 19, "FD");
      doc.rect(rightBoxX + 6 + 2 * g2SubColW, gBoxY + 111, g2SubColW - 2, 19, "FD");

      doc.setFontSize(10);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), rightBoxX + g2SubColW + 2, gBoxY + 125, { align: "right" });
      doc.text(fmt(summations.wuzifHisab), rightBoxX + 2 * g2SubColW + 2, gBoxY + 125, { align: "right" });
      doc.text(fmt((summations.wuzifHisab || 0) + (summations.kitat || 0)), rightBoxX + 3 * g2SubColW + 2, gBoxY + 125, { align: "right" });

      // ─── 4. PAYMENT LOCATION SUMMARY TABLE (Y: 352 to ~600) ───────
      const paymentStartY = gBoxY + gBoxH + 6; // ~352

      const resolveBankName = (bankKey) => {
        return getBankName(bankKey) || bankKey || "Unknown Bank";
      };

      // Prepare table rows (All 8 columns matching Web UI)
      const paymentRows = [];

      // 1. Prepaid row
      paymentRows.push([
        "ቅድሚያ የተከፈለ",
        (summations.prepaidCount || 0).toString(),
        fmt(summations.prepaid || 0),
        fmt(summations.prepaidAdditionalHisab || 0),
        fmt(summations.prepaidWuzifDerekKoshasha || 0),
        fmt(summations.prepaidTotalDerekKoshasha || 0),
        fmt(summations.prepaidTekilalaTekefay || 0),
        fmt(summations.prepaidCheck || 0)
      ]);

      // 2. Office row
      paymentRows.push([
        "ቢሮ የተከፈለ",
        (summations.paidAtOfficeCount || 0).toString(),
        fmt(summations.paidAtOffice || 0),
        fmt(summations.officeAdditionalHisab || 0),
        fmt(summations.officeWuzifDerekKoshasha || 0),
        fmt(summations.officeTotalDerekKoshasha || 0),
        fmt(summations.officeTekilalaTekefay || 0),
        fmt(summations.officeCheck || 0)
      ]);

      // 3. Bank payment rows
      Object.keys(summations.paidByBank || {}).forEach((bank) => {
        paymentRows.push([
          resolveBankName(bank),
          (summations.paidByBankCount?.[bank] || 0).toString(),
          fmt(summations.paidByBank?.[bank] || 0),
          fmt(summations.bankAdditionalHisab?.[bank] || 0),
          fmt(summations.bankWuzifDerekKoshasha?.[bank] || 0),
          fmt(summations.bankTotalDerekKoshasha?.[bank] || 0),
          fmt(summations.bankTekilalaTekefay?.[bank] || 0),
          fmt(summations.bankCheck?.[bank] || 0)
        ]);
      });

      // 4. Total Bank Payments row
      const totBankCount = Object.values(summations.paidByBankCount || {}).reduce((a, b) => a + b, 0);
      const totBankPaid = Object.values(summations.paidByBank || {}).reduce((a, b) => a + b, 0);
      const totBankAdd = Object.values(summations.bankAdditionalHisab || {}).reduce((a, b) => a + b, 0);
      const totBankWuzif = Object.values(summations.bankWuzifDerekKoshasha || {}).reduce((a, b) => a + b, 0);
      const totBankDerek = Object.values(summations.bankTotalDerekKoshasha || {}).reduce((a, b) => a + b, 0);
      const totBankTekefay = Object.values(summations.bankTekilalaTekefay || {}).reduce((a, b) => a + b, 0);
      const totBankCheck = Object.values(summations.bankCheck || {}).reduce((a, b) => a + b, 0);

      paymentRows.push([
        "Total Bank Payments",
        totBankCount.toString(),
        fmt(totBankPaid),
        fmt(totBankAdd),
        fmt(totBankWuzif),
        fmt(totBankDerek),
        fmt(totBankTekefay),
        fmt(totBankCheck)
      ]);

      // 5. Grand Total row
      paymentRows.push([
        "Grand Total",
        "",
        fmt(summations.totalPaidLocationSum || 0),
        fmt(summations.totaladditionalHisab || 0),
        fmt(summations.totalwuzifDerekKoshasha || 0),
        fmt((summations.totalwuzifDerekKoshasha || 0) + (summations.totaladditionalHisab || 0)),
        fmt(summations.totaltekelalaTekefay || 0),
        fmt((summations.totaltekelalaTekefay || 0) - (summations.totalPaidLocationSum || 0))
      ]);

      // 6. Duplicate Payments row (if count > 0)
      if ((summations.duplicatePaymentCount || 0) > 0) {
        paymentRows.push([
          "Duplicate Payments",
          (summations.duplicatePaymentCount || 0).toString(),
          fmt(summations.duplicatePayments || 0),
          fmt(summations.duplicateAdditionalHisab || 0),
          fmt(summations.duplicateWuzifDerekKoshasha || 0),
          fmt((summations.duplicateWuzifDerekKoshasha || 0) + (summations.duplicateAdditionalHisab || 0)),
          fmt(summations.duplicateTekilalaTekefay || 0),
          fmt(summations.duplicateCheck || 0)
        ]);
      }

      autoTable(doc, {
        head: [[
          "Payment Location",
          "No. of\nBills",
          "Total Amount\n(ETB)",
          "Additional\nHisab",
          "Wuzif Derek\nKoshasha",
          "Total Derek\nKoshasha",
          "Tekilala\nTekefay",
          "Check"
        ]],
        body: paymentRows,
        styles: {
          font: "nyala",
          fontSize: 7.8,
          fontStyle: "normal",
          lineColor: [0, 0, 0],
          lineWidth: 0.4,
          cellPadding: { top: 2, bottom: 2, left: 2.5, right: 2.5 },
          textColor: [0, 0, 0]
        },
        headStyles: {
          font: "nyala",
          fontSize: 8,
          fontStyle: "normal",
          fillColor: [238, 238, 238],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          halign: "center",
          valign: "middle"
        },
        columnStyles: {
          0: { halign: "left", cellWidth: 90 },
          1: { halign: "center", cellWidth: 34 },
          2: { halign: "right", cellWidth: 68 },
          3: { halign: "right", cellWidth: 58 },
          4: { halign: "right", cellWidth: 64 },
          5: { halign: "right", cellWidth: 64 },
          6: { halign: "right", cellWidth: 78 },
          7: { halign: "right", cellWidth: 83.28 }
        },
        theme: "grid",
        margin: { left: MARGIN, right: MARGIN },
        startY: paymentStartY,
        didParseCell: (data) => {
          if (data.section === "body" && Array.isArray(data.row?.raw)) {
            const rowLabel = data.row.raw[0];
            if (rowLabel === "Grand Total") {
              data.cell.styles.fillColor = [225, 225, 225];
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
            } else if (rowLabel === "Total Bank Payments") {
              data.cell.styles.fillColor = [245, 245, 245];
              data.cell.styles.fontStyle = "bold";
            } else if (rowLabel === "Duplicate Payments") {
              data.cell.styles.fillColor = [245, 245, 245];
            }
          }
        }
      });

      // ─── 5. FOOTER (Y: 818 to 832) ────────────────────────────────
      const footerY = pageHeight - 22;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, footerY - 8, pageWidth - MARGIN, footerY - 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, MARGIN, footerY);

      const moto = companyProfile?.companyMoto || "";
      if (moto) {
        doc.setFont("nyala", "normal");
        doc.setFontSize(8.5);
        doc.text(moto, pageWidth / 2, footerY, { align: "center" });
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Page 1 of 1", pageWidth - MARGIN, footerY, { align: "right" });

      const fileName = `bill-summations-${selectedKifyaWerMonth || "-"}-${selectedKifyaWerYear || "-"}.pdf`;
      if (preview) {
        doc.output("dataurlnewwindow", { filename: fileName });
      } else {
        doc.save(fileName);
      }
    } catch (err) {
      console.error("Failed to export PDF", err);
      toast.error("Failed to export PDF");
    }
  };

  // Export/Preview the current Summations to PDF WITHOUT Payment Location Summary (Basic 1-Page A4 B&W)
  const handleExportSummationsPDFBasic = async (preview = false) => {
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "A4" });
      try { doc.setFont("nyala", "normal"); } catch (_) { }

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const MARGIN = 28;
      const fullW = pageWidth - 2 * MARGIN;

      const titleLeftAmh = companyProfile?.companyNameAmh || "";
      const titleLeftEng = companyProfile?.companyName || "";

      const fmt = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmt0 = (n) => (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

      // ─── 1. HEADER (Y: 24 to 88) ──────────────────────────────────
      const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
      const logoW = 40, logoH = 40;
      if (logoBase64) {
        try { doc.addImage(logoBase64, "PNG", pageWidth - MARGIN - logoW, MARGIN - 4, logoW, logoH); } catch (_) { }
      }

      doc.setFont("nyala", "normal");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(titleLeftAmh, MARGIN, MARGIN + 10);
      doc.setFontSize(12);
      doc.text(titleLeftEng, MARGIN, MARGIN + 23);

      const now = new Date();
      const [ecY, ecM, ecD] = ethiopianDate.toEthiopian(now.getFullYear(), now.getMonth() + 1, now.getDate());
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 60, 60);
      doc.text(`GC: ${now.toLocaleDateString()}`, MARGIN, MARGIN + 35);
      doc.text(`EC: ${ecD}/${ecM}/${ecY}`, MARGIN + 75, MARGIN + 35);

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.8);
      doc.line(MARGIN, MARGIN + 42, pageWidth - MARGIN, MARGIN + 42);

      const statusText = filterMoneyCollected === 'all'
        ? 'ሁሉም ንባብ የገባላቸው'
        : filterMoneyCollected === 'true'
          ? 'የተከፈለ'
          : 'ያልተከፈለ';
      const reportTitle = `የሪፖርት ማጠቃለያ - ${selectedKifyaWerMonth || "-"}, ${selectedKifyaWerYear || "-"} (${statusText})`;
      doc.setFont("nyala", "normal");
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(reportTitle, pageWidth / 2, MARGIN + 58, { align: "center" });

      // ─── 2. SUMMARY OVERVIEW (Y: 96 to 226, Height = 130 pt) ───────
      const summaryY = MARGIN + 68; // 96
      const summaryH = 126;

      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.7);
      doc.rect(MARGIN, summaryY, fullW, summaryH, "FD");

      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN, summaryY, fullW, 18, "FD");
      doc.setFontSize(12);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Summary Overview", MARGIN + fullW / 2, summaryY + 13, { align: "center" });

      const sColW = (fullW - 20) / 6;
      const sLabelY1 = summaryY + 34;
      const sValueY1 = summaryY + 49;
      const sLabelY2 = summaryY + 68;
      const sValueY2 = summaryY + 83;

      // Row 1
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text("Total Bills", MARGIN + 10 + 0 * sColW, sLabelY1);
      doc.text("የወሩ ፍጆታ (ሜ3)", MARGIN + 10 + 1 * sColW, sLabelY1);
      doc.text("ውዝፍ ፍጆታ (ሜ3)", MARGIN + 10 + 2 * sColW, sLabelY1);
      doc.text("ጠቅላላ ደረቅ ቆሻሻ", MARGIN + 10 + 3 * sColW, sLabelY1);
      if (hasTotPay1) doc.text(totPay1Label, MARGIN + 10 + 4 * sColW, sLabelY1);
      if (hasTotPay2) doc.text(totPay2Label, MARGIN + 10 + 5 * sColW, sLabelY1);

      doc.setFontSize(11.5);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt0(filteredData.length), MARGIN + 10 + 0 * sColW, sValueY1);
      doc.text(fmt0(summations.consumption), MARGIN + 10 + 1 * sColW, sValueY1);
      doc.text(fmt(summations.wuzifFjota), MARGIN + 10 + 2 * sColW, sValueY1);
      doc.text(fmt((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0)), MARGIN + 10 + 3 * sColW, sValueY1);
      if (hasTotPay1) doc.text(fmt(totPay1Val), MARGIN + 10 + 4 * sColW, sValueY1);
      if (hasTotPay2) doc.text(fmt(totPay2Val), MARGIN + 10 + 5 * sColW, sValueY1);

      // Row 2
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text("ጠቅላላ የዚህ ወር", MARGIN + 10 + 0 * sColW, sLabelY2);
      doc.text("ቅድሚያ የተከፈለ", MARGIN + 10 + 1 * sColW, sLabelY2);
      doc.text("ጠቅላላ ተጨማሪ ክፍያ", MARGIN + 10 + 2 * sColW, sLabelY2);
      doc.text("ቅጣት", MARGIN + 10 + 3 * sColW, sLabelY2);
      doc.text("ጠቅላላ ውዝፍ", MARGIN + 10 + 4 * sColW, sLabelY2);

      doc.setFontSize(11.5);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.yezihWer), MARGIN + 10 + 0 * sColW, sValueY2);
      doc.text(fmt(summations.prepaid), MARGIN + 10 + 1 * sColW, sValueY2);
      doc.text(fmt((summations.techemariKfya || 0) + (summations.wuzifTechemariKfya || 0)), MARGIN + 10 + 2 * sColW, sValueY2);
      doc.text(fmt(summations.kitat), MARGIN + 10 + 3 * sColW, sValueY2);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), MARGIN + 10 + 4 * sColW, sValueY2);

      // Bottom Grand Total Boxes
      const tileY = summaryY + 95;
      const totalExcl = ((summations.tekilalaTekefay || 0) + (summations.prepaid || 0)) - ((summations.additionalHisab || 0) + (summations.wuzifDerekKoshasha || 0));
      const totalIncl = (summations.tekilalaTekefay || 0) + (summations.prepaid || 0);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("ጠቅላላ ክፍያ:", MARGIN + 10, tileY + 18);
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(MARGIN + 85, tileY + 3, 160, 22, "FD");
      doc.setFontSize(13);
      doc.text(fmt(totalExcl), MARGIN + 238, tileY + 18, { align: "right" });

      doc.setFontSize(11);
      doc.text("ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ:", MARGIN + fullW / 2 + 10, tileY + 18);
      doc.setFillColor(245, 245, 245);
      doc.rect(MARGIN + fullW - 165, tileY + 3, 155, 22, "FD");
      doc.setFontSize(13);
      doc.text(fmt(totalIncl), MARGIN + fullW - 16, tileY + 18, { align: "right" });

      // ─── 3. GROUP 1: የዚህ ወር (Y: 232 to 386, Height = 154 pt) ─────
      const g1Y = summaryY + summaryH + 10; // 232
      const g1H = 154;

      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.7);
      doc.rect(MARGIN, g1Y, fullW, g1H, "FD");

      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN, g1Y, fullW, 18, "FD");
      doc.setFontSize(12);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Group 1: የዚህ ወር", MARGIN + fullW / 2, g1Y + 13, { align: "center" });

      const colW6 = (fullW - 24) / 6;
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      doc.text("የውሃ ፍጆታ ብር", MARGIN + 12 + 0 * colW6, g1Y + 38);
      doc.text("ቆጣሪ ኪራይ", MARGIN + 12 + 1 * colW6, g1Y + 38);
      doc.text("ተጨማሪ ክፍያ", MARGIN + 12 + 2 * colW6, g1Y + 38);
      doc.text("የዚህ ወር ደረቅ ቆሻሻ", MARGIN + 12 + 3 * colW6, g1Y + 38);
      if (hasCurPay1) doc.text(curPay1Label, MARGIN + 12 + 4 * colW6, g1Y + 38);
      if (hasCurPay2) doc.text(curPay2Label, MARGIN + 12 + 5 * colW6, g1Y + 38);

      doc.setFontSize(11.5);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.yezihWerFjotaKfya), MARGIN + 12 + 0 * colW6, g1Y + 56);
      doc.text(fmt(summations.kotariKiray), MARGIN + 12 + 1 * colW6, g1Y + 56);
      doc.text(fmt(summations.techemariKfya), MARGIN + 12 + 2 * colW6, g1Y + 56);
      doc.text(fmt(summations.additionalHisab), MARGIN + 12 + 3 * colW6, g1Y + 56);
      if (hasCurPay1) doc.text(fmt(curPay1Val), MARGIN + 12 + 4 * colW6, g1Y + 56);
      if (hasCurPay2) doc.text(fmt(curPay2Val), MARGIN + 12 + 5 * colW6, g1Y + 56);

      // Divider
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 12, g1Y + 76, MARGIN + fullW - 12, g1Y + 76);

      // Subtotals (G1)
      const colW4 = (fullW - 30) / 4;
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("የዚህ ወር", MARGIN + 12, g1Y + 98);
      doc.text("የዚህ ወር አና ደረቅ ቆሻሻ", MARGIN + 12 + colW4 * 1.5, g1Y + 98);

      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.rect(MARGIN + 12, g1Y + 106, colW4 * 1.3, 24, "FD");
      doc.rect(MARGIN + 12 + colW4 * 1.5, g1Y + 106, colW4 * 1.6, 24, "FD");

      doc.setFontSize(13.5);
      doc.text(fmt(summations.yezihWer), MARGIN + 12 + colW4 * 1.3 - 6, g1Y + 123, { align: "right" });
      doc.text(fmt((summations.yezihWer || 0) + (summations.additionalHisab || 0)), MARGIN + 12 + colW4 * 3.1 - 6, g1Y + 123, { align: "right" });

      // ─── 4. GROUP 2: ውዝፍ (Y: 396 to 586, Height = 190 pt) ─────────
      const g2Y = g1Y + g1H + 10; // 396
      const g2H = 190;

      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.7);
      doc.rect(MARGIN, g2Y, fullW, g2H, "FD");

      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN, g2Y, fullW, 18, "FD");
      doc.setFontSize(12);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text("Group 2: ውዝፍ", MARGIN + fullW / 2, g2Y + 13, { align: "center" });

      const colW3 = (fullW - 30) / 3;

      // Row 1
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("ውዝፍ ቆጣሪ ኪራይ", MARGIN + 12, g2Y + 34);
      doc.text("ውዝፍ ተጨማሪ ክፍያ", MARGIN + 12 + colW3, g2Y + 34);
      doc.text("ቅጣት", MARGIN + 12 + 2 * colW3, g2Y + 34);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.wuzifKotariKiray), MARGIN + 12, g2Y + 48);
      doc.text(fmt(summations.wuzifTechemariKfya), MARGIN + 12 + colW3, g2Y + 48);
      doc.text(fmt(summations.kitat), MARGIN + 12 + 2 * colW3, g2Y + 48);

      // Row 2
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text("ውዝፍ ፍጆታ ክፍያ", MARGIN + 12, g2Y + 64);
      doc.text("ውዝፍ ደረቅ ቆሻሻ", MARGIN + 12 + colW3, g2Y + 64);
      doc.text("የተላለፈ(ነባር) ውዝፍ", MARGIN + 12 + 2 * colW3, g2Y + 64);

      const basicTransferred = (summations.wuzifHisab || 0) - (
        (summations.wuzifKotariKiray || 0) +
        (summations.wuzifFjotaKfya || 0) +
        (summations.wuzifDerekKoshasha || 0) +
        (summations.wuzifTechemariKfya || 0)
      );

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(fmt(summations.wuzifFjotaKfya), MARGIN + 12, g2Y + 78);
      doc.text(fmt(summations.wuzifDerekKoshasha), MARGIN + 12 + colW3, g2Y + 78);
      doc.text(fmt(basicTransferred), MARGIN + 12 + 2 * colW3, g2Y + 78);

      // Row 3
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      if (hasWuzifPay1) doc.text(wuzifPay1Label, MARGIN + 12, g2Y + 94);
      if (hasWuzifPay2) doc.text(wuzifPay2Label, MARGIN + 12 + colW3, g2Y + 94);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      if (hasWuzifPay1) doc.text(fmt(wuzifPay1Val), MARGIN + 12, g2Y + 108);
      if (hasWuzifPay2) doc.text(fmt(wuzifPay2Val), MARGIN + 12 + colW3, g2Y + 108);

      // Divider
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(MARGIN + 12, g2Y + 122, MARGIN + fullW - 12, g2Y + 122);

      // Subtotals (G2) - 3 items
      doc.setFontSize(10.5);
      doc.setTextColor(0, 0, 0);
      doc.text("ውዝፍ", MARGIN + 12, g2Y + 138);
      doc.text("ውዝፍ አና ደረቅ ቆሻሻ", MARGIN + 12 + colW3, g2Y + 138);
      doc.text("ውዝፍ አና ቅጣት", MARGIN + 12 + 2 * colW3, g2Y + 138);

      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(0, 0, 0);
      doc.rect(MARGIN + 12, g2Y + 146, colW3 - 10, 24, "FD");
      doc.rect(MARGIN + 12 + colW3, g2Y + 146, colW3 - 10, 24, "FD");
      doc.rect(MARGIN + 12 + 2 * colW3, g2Y + 146, colW3 - 10, 24, "FD");

      doc.setFontSize(13);
      doc.text(fmt((summations.wuzifHisab || 0) - (summations.wuzifDerekKoshasha || 0)), MARGIN + colW3 - 4, g2Y + 163, { align: "right" });
      doc.text(fmt(summations.wuzifHisab), MARGIN + 2 * colW3 - 4, g2Y + 163, { align: "right" });
      doc.text(fmt((summations.wuzifHisab || 0) + (summations.kitat || 0)), MARGIN + 3 * colW3 - 4, g2Y + 163, { align: "right" });

      // ─── 5. DUPLICATE PAYMENTS CARD (if count > 0) ────────────────
      if ((summations.duplicatePaymentCount || 0) > 0) {
        const dpY = g2Y + g2H + 10;
        const dpH = 34;

        doc.setDrawColor(0, 0, 0);
        doc.setFillColor(245, 245, 245);
        doc.setLineWidth(0.6);
        doc.rect(MARGIN, dpY, fullW, dpH, "FD");

        doc.setFontSize(11);
        doc.setFont("nyala", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text("Duplicate Payments", MARGIN + 12, dpY + 21);

        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        doc.text("No. of Bills:", MARGIN + fullW * 0.35, dpY + 21);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(String(summations.duplicatePaymentCount || 0), MARGIN + fullW * 0.48, dpY + 21);

        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        doc.text("Total Amount (ETB):", MARGIN + fullW * 0.60, dpY + 21);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(fmt(summations.duplicatePayments), MARGIN + fullW - 12, dpY + 21, { align: "right" });
      }

      // ─── 6. FOOTER (Y: 818 to 832) ────────────────────────────────
      const footerY = pageHeight - 22;
      doc.setDrawColor(160, 160, 160);
      doc.setLineWidth(0.5);
      doc.line(MARGIN, footerY - 8, pageWidth - MARGIN, footerY - 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Generated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, MARGIN, footerY);

      const moto = companyProfile?.companyMoto || "";
      if (moto) {
        doc.setFont("nyala", "normal");
        doc.setFontSize(8.5);
        doc.text(moto, pageWidth / 2, footerY, { align: "center" });
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Page 1 of 1", pageWidth - MARGIN, footerY, { align: "right" });

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

      {/* ── Executive KPI Dashboard Banner ── */}
      <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
        {/* Card 1: Total Invoices */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Total Invoices
                </Typography>
                <ReceiptLongIcon color="primary" fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                {kpiStats.filteredCount.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpiStats.filteredCount !== kpiStats.totalBills
                  ? `${kpiStats.totalBills.toLocaleString()} total in cycle`
                  : "All accounts in cycle"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 2: Collected Revenue */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Collected Revenue
                </Typography>
                <CheckCircleIcon color="success" fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "success.main" }}>
                {kpiStats.totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={kpiStats.collectionRate}
                  color="success"
                  sx={{ flex: 1, height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 35, color: "success.dark" }}>
                  {kpiStats.collectionRate.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 3: Outstanding Unpaid */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Outstanding Unpaid
                </Typography>
                <AssignmentLateIcon color="warning" fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "warning.dark" }}>
                {kpiStats.totalUncollected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending collection
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 4: Gross Invoiced */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Gross Invoiced
                </Typography>
                <MonetizationOnIcon color="info" fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "info.dark" }}>
                {kpiStats.totalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total payable amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Card 5: Billed Consumption */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={2} sx={{ borderRadius: 2, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase" }}>
                  Billed Volume
                </Typography>
                <WaterDropIcon color="primary" fontSize="small" />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.main" }}>
                {kpiStats.totalVolume.toLocaleString()} m³
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total water delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Billing Cycle & Geographic Filters Card ── */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterAltIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Billing Cycle & Geographic Filters
            </Typography>
            {anyFilterSet && (
              <Chip size="small" color="primary" variant="filled" label="Filters Applied" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Select billing month and refine by location, customer type, or payment status
          </Typography>
        </Box>

        {/* Row 1: Period Selection & Geographic Filters */}
        <Box sx={{ display: "flex", gap: "1rem", mb: 2, alignItems: "center", flexWrap: "wrap" }}>
          <ProPeriodPicker
            selectedMonth={selectedKifyaWerMonth}
            selectedYear={selectedKifyaWerYear}
            onPeriodChange={handlePeriodChange}
            currentCycleMonth={currentCycleMonth}
            currentCycleYear={currentCycleYear}
            dbPeriods={dbPeriods}
            disabled={isLoading}
          />

          <Button
            variant="contained"
            onClick={handleFilterClick}
            disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear || isLoading}
            sx={{ borderRadius: 2.5, height: 42, px: 3, fontWeight: 700 }}
          >
            {isLoading ? <CircularProgress size={22} color="inherit" /> : "Filter Bills"}
          </Button>

          {/* Kebele */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
              <MenuItem value=""><em>All Kebeles</em></MenuItem>
              {kebeles?.map((k) => (
                <MenuItem key={k.id} value={k.id}>{k.name || `Kebele ${k.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ketena (Independent) */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ketena</InputLabel>
            <Select
              value={selectedKetenaId}
              label="Ketena"
              onChange={(e) => setSelectedKetenaId(e.target.value)}
              disabled={isKetenasLoading}
            >
              <MenuItem value=""><em>All Ketenas</em></MenuItem>
              {ketenas?.map((k) => (
                <MenuItem key={k.id} value={k.id}>{k.name || `Ketena ${k.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Customer Type */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Customer Type</InputLabel>
            <Select
              value={selectedCustomerTypeId}
              label="Customer Type"
              onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
              disabled={isCustomerTypesLoading}
            >
              <MenuItem value=""><em>All Types</em></MenuItem>
              {customerTypes?.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name || `Type ${t.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Branch */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
              <MenuItem value=""><em>All Branches</em></MenuItem>
              {branches?.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name || `Branch ${b.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Reader */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Reader</InputLabel>
            <Select
              value={selectedReaderId}
              label="Reader"
              onChange={(e) => setSelectedReaderId(e.target.value)}
              disabled={isReadersLoading}
            >
              <MenuItem value=""><em>All Readers</em></MenuItem>
              {readers?.map((r) => (
                <MenuItem key={r.id} value={r.id}>{r.name || `Reader ${r.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Cashier */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Cashier</InputLabel>
            <Select
              value={selectedCashierId}
              label="Cashier"
              onChange={(e) => setSelectedCashierId(e.target.value)}
              disabled={isCashiersLoading}
            >
              <MenuItem value=""><em>All Cashiers</em></MenuItem>
              {cashiers?.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name || `Cashier ${c.id}`}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Customer Status Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Account Status</InputLabel>
            <Select
              value={filterCustomerStatus}
              label="Account Status"
              onChange={(e) => setFilterCustomerStatus(e.target.value)}
            >
              <MenuItem value="all">All Accounts</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="deleted">Disconnected</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Row 2: Payment & Operational Status Filters */}
        <Box sx={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Collection Status */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="money-collected-filter-label">Collection</InputLabel>
            <Select
              labelId="money-collected-filter-label"
              value={filterMoneyCollected}
              label="Collection"
              onChange={(e) => setFilterMoneyCollected(e.target.value)}
            >
              <MenuItem value="all">All Collection</MenuItem>
              <MenuItem value="true">Money Collected</MenuItem>
              <MenuItem value="false">Not Collected</MenuItem>
            </Select>
          </FormControl>

          {/* SMS Status */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="sms-sent-filter-label">SMS Status</InputLabel>
            <Select
              labelId="sms-sent-filter-label"
              value={filterSmsSent}
              label="SMS Status"
              onChange={(e) => setFilterSmsSent(e.target.value)}
            >
              <MenuItem value="all">All SMS</MenuItem>
              <MenuItem value="sent">SMS Sent</MenuItem>
              <MenuItem value="not_sent">SMS Not Sent</MenuItem>
            </Select>
          </FormControl>

          {/* Wuzif Filter */}
          <FormControl size="small" sx={{ minWidth: 90 }}>
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
            sx={{ width: 120 }}
          />

          {/* Zero Reading Filter */}
          <FormControl size="small" sx={{ minWidth: 90 }}>
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
            label="Zero Months"
            value={zeroReadingMonthsVal}
            onChange={(e) => setZeroReadingMonthsVal(e.target.value)}
            inputProps={{ min: 0 }}
            sx={{ width: 120 }}
          />

          {/* Checkboxes */}
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterPaidOnFrontOffice}
                onChange={(e) => setFilterPaidOnFrontOffice(e.target.checked)}
                name="paidOnFrontOffice"
              />
            }
            label={<Typography variant="body2">Office Paid</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterDerashPaid}
                onChange={(e) => setFilterDerashPaid(e.target.checked)}
                name="derashPaid"
              />
            }
            label={<Typography variant="body2">Derash Paid</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterUnicashPaid}
                onChange={(e) => setFilterUnicashPaid(e.target.checked)}
                name="unicashPaid"
              />
            }
            label={<Typography variant="body2">Unicash Paid</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterVoidChangedCustomers}
                onChange={(e) => setFilterVoidChangedCustomers(e.target.checked)}
                name="voidChanged"
              />
            }
            label={<Typography variant="body2">Have Void</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={filterPrepaid}
                onChange={(e) => setFilterPrepaid(e.target.checked)}
                name="prepaid"
              />
            }
            label={<Typography variant="body2">Prepaid</Typography>}
          />

          {anyFilterSet && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={handleClearAllFilters}
              sx={{ textTransform: "none", borderRadius: 2, ml: "auto" }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Action Buttons Toolbar & Table ── */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ padding: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>

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
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', visibility: hasTotPay1 ? 'visible' : 'hidden' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {totPay1Label}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'info.main'
                        }}
                      >
                        {totPay1Val.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: '150px', textAlign: 'center', visibility: hasTotPay2 ? 'visible' : 'hidden' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'Nyala, serif',
                          mb: 1,
                          fontSize: '1.105rem',
                          fontWeight: 'medium'
                        }}
                      >
                        {totPay2Label}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          fontSize: '1.3rem',
                          color: 'info.main'
                        }}
                      >
                        {totPay2Val.toLocaleString("en-US", {
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
                          <Box sx={{ flex: 1, textAlign: 'center', visibility: hasCurPay1 ? 'visible' : 'hidden' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {curPay1Label}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'info.main'
                              }}
                            >
                              {curPay1Val.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center', visibility: hasCurPay2 ? 'visible' : 'hidden' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {curPay2Label}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'info.main'
                              }}
                            >
                              {curPay2Val.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
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
                        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
                          <Box sx={{ flex: 1, textAlign: 'center', visibility: hasWuzifPay1 ? 'visible' : 'hidden' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {wuzifPay1Label}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {wuzifPay1Val.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1, textAlign: 'center', visibility: hasWuzifPay2 ? 'visible' : 'hidden' }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Nyala, serif',
                                mb: 1.5,
                                fontSize: '1.17rem',
                                fontWeight: 'medium'
                              }}
                            >
                              {wuzifPay2Label}
                            </Typography>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: "bold",
                                fontSize: '1.43rem',
                                color: 'error.main'
                              }}
                            >
                              {wuzifPay2Val.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            {/* Empty space for alignment */}
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
