"use client";

import { useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
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
  FormControlLabel,
  Checkbox,
  TextField,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ReadingService } from "../../../lib/ReadingService";
import { DropdownService } from "../../../lib/dropdownService";
import { SmsService } from "../../../lib/smsService";
import EtDatePicker from "mui-ethiopian-datepicker";
import ReadingDetailModal from "../../components/ReadingDetailModal";
import * as XLSX from "xlsx"; // Added for Wuzif export
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../billList/nyala-normal"; // register Nyala font for Amharic
import { CampanyProfileService } from "../../../lib/campanyProfileService"; // Added for company profile

var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const dropdownService = new DropdownService();
const smsService = new SmsService();
const campanyProfileService = new CampanyProfileService();

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

const ethiopianMonthsEng = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yekatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehasse",
  "Pagumen",
];

const getEnglishEthMonth = (amhMonth) => {
  const idx = ethiopianMonths.indexOf(amhMonth);
  if (idx < 0) return null;
  return ethiopianMonthsEng[idx] || null;
};

const getNextEthMonthAndYear = (amhMonth, year) => {
  const idx = ethiopianMonths.indexOf(amhMonth);
  const y = Number(year);
  if (idx < 0 || !Number.isFinite(y)) {
    return { month: amhMonth, year: y };
  }
  let nextIdx = idx + 1;
  let nextYear = y;
  if (nextIdx >= ethiopianMonths.length) {
    nextIdx = 0;
    nextYear = y + 1;
  }
  return { month: ethiopianMonths[nextIdx], year: nextYear };
};

const ReadingManagement = () => {
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [viewReadingId, setViewReadingId] = useState(null);

  const [filterMoneyCollected, setFilterMoneyCollected] = useState("all");
  const [wuzifMonthsOp, setWuzifMonthsOp] = useState("eq");
  const [wuzifMonthsVal, setWuzifMonthsVal] = useState("");
  const [isBulkKitatTransferring, setIsBulkKitatTransferring] = useState(false);
  const [isRemovingDuplicates, setIsRemovingDuplicates] = useState(false);

  // Zero Reading Filter State
  const [zeroReadingMonthsOp, setZeroReadingMonthsOp] = useState("eq");
  const [zeroReadingMonthsVal, setZeroReadingMonthsVal] = useState("");

  // Consumption Filter State
  const [consumptionOp, setConsumptionOp] = useState("eq");
  const [consumptionVal, setConsumptionVal] = useState("");

  // AdditionalHisab Filter State
  const [additionalHisabOp, setAdditionalHisabOp] = useState("eq");
  const [additionalHisabVal, setAdditionalHisabVal] = useState("");

  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");


  const [filterVoidChangedCustomers, setFilterVoidChangedCustomers] = useState(false);
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionPercent, setCorrectionPercent] = useState("");
  const [correctionBaseType, setCorrectionBaseType] = useState("CURRENT_CONSUMPTION");
  const [correctionMode, setCorrectionMode] = useState("ADD"); // "ADD" or "SUB"
  const [isAvgDialogOpen, setIsAvgDialogOpen] = useState(false);
  const [singleCorrectionBillId, setSingleCorrectionBillId] = useState(null);
  const [avgMonths, setAvgMonths] = useState("");

  const [isPreparingMobileCsv, setIsPreparingMobileCsv] = useState(false);

  // New filters and SMS state
  const [filterBankSent, setFilterBankSent] = useState("all");
  const [filterSmsSent, setFilterSmsSent] = useState("all");
  const [isBackendBulkSmsSending, setIsBackendBulkSmsSending] = useState(false);

  // Custom loading state for correction application
  const [isApplying, setIsApplying] = useState(false);
  const [smsDueDateEC, setSmsDueDateEC] = useState(null); // For SMS due date

  // Wuzif Export State
  const [exportCustomerId, setExportCustomerId] = useState("");
  const [isWuzifExporting, setIsWuzifExporting] = useState(false);

  // Added for Void/Changed PDF
  const [anchorElExtra, setAnchorElExtra] = useState(null);

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



  const currentGregorianDate = new Date();
  const [ethYear] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = ethYear - 5; i <= ethYear + 1; i++) years.push(i);
    return years;
  }, [ethYear]);

  // dropdown data
  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
  });

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

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } =
    useQuery({
      queryKey: ["customerTypes"],
      queryFn: () => dropdownService.getCustomerTypes(),
    });

  // load bills for month/year
  const {
    data: readings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["readingManagementReadings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
        const [activeList, deletedFiltered] =
          await Promise.all([
            readingService
              .getReadingManagementFiltered("ACTIVE", kifyaWerFormatted)
              .catch(() => []),
            readingService
              .getReadingManagementFiltered("DELETED", kifyaWerFormatted)
              .catch(() => []),
          ]);
        const merged = [
          ...(activeList || []),
          ...(deletedFiltered || []),
        ];
        const byId = new Map();
        merged.forEach((it) => {
          const key =
            it?.id ?? it?.billingInvoiceNumber ?? it?.invoiceNumber ?? Math.random();
          if (!byId.has(key)) byId.set(key, it);
        });
        const arr = Array.from(byId.values());
        return arr.map((it) => {
          const isVoid = !!(
            it?.isVoid || it?.void || String(it?.status).toLowerCase() === "deleted"
          );
          return { ...it, isVoid: isVoid, void: isVoid || it?.void };
        });
      }
      return [];
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    staleTime: 5 * 60 * 1000,
    onError: (error) => toast.error("Failed to load bills: " + error.message),
  });

  const filteredReadingsWithVoids = useMemo(() => {
    let temp = [...readings];

    // only non-void bills - REMOVED to allow Void Report to work
    // temp = temp.filter((b) => !b?.isVoid && !b?.void);

    const matchesAnyKey = (obj, keys, value) =>
      keys.some((k) => obj?.[k] !== undefined && String(obj[k]) === String(value));

    if (selectedKebeleId) {
      const kebeleKeys = ["addressStreetsId", "kebeleId", "customerKebeleId"];
      temp = temp.filter((r) => matchesAnyKey(r, kebeleKeys, selectedKebeleId));
    }
    if (selectedKetenaId) {
      const ketenaKeys = ["addressKetenaId", "ketenaId"];
      temp = temp.filter((r) => matchesAnyKey(r, ketenaKeys, selectedKetenaId));
    }
    if (selectedBranchId) {
      const branchKeys = ["branchsId", "branchId"];
      temp = temp.filter((r) => matchesAnyKey(r, branchKeys, selectedBranchId));
    }
    if (selectedReaderId) {
      const readerKeys = ["assignedReaderId", "readerId"];
      temp = temp.filter((r) => matchesAnyKey(r, readerKeys, selectedReaderId));
    }
    if (selectedCustomerTypeId) {
      temp = temp.filter(
        (r) =>
          r?.customerTypeId !== undefined &&
          String(r.customerTypeId) === String(selectedCustomerTypeId)
      );
    }

    // collection status
    if (filterMoneyCollected !== "all") {
      const moneyCollectedBool = filterMoneyCollected === "true";
      temp = temp.filter((bill) => bill.moneyCollected === moneyCollectedBool);
    }

    // Wuzif status (Option B: =, <, >=, <= on wuzifWorBzat)
    if (wuzifMonthsVal !== "" && !isNaN(Number(wuzifMonthsVal))) {
      const target = Number(wuzifMonthsVal);
      temp = temp.filter((bill) => {
        const val = Number(bill?.wuzifWorBzat ?? NaN);
        if (Number.isNaN(val)) return false;
        if (wuzifMonthsOp === "lt") return val < target;
        if (wuzifMonthsOp === "lte") return val <= target;
        if (wuzifMonthsOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    // Zero Reading Filter
    if (zeroReadingMonthsVal !== "" && !isNaN(Number(zeroReadingMonthsVal))) {
      const target = Number(zeroReadingMonthsVal);
      temp = temp.filter((bill) => {
        const val = Number(bill?.zeroReadingWorBzat ?? NaN);
        if (Number.isNaN(val)) return false;
        if (zeroReadingMonthsOp === "lt") return val < target;
        if (zeroReadingMonthsOp === "lte") return val <= target;
        if (zeroReadingMonthsOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    // Consumption Filter
    if (consumptionVal !== "" && !isNaN(Number(consumptionVal))) {
      const target = Number(consumptionVal);
      temp = temp.filter((bill) => {
        const val = Number(bill?.consumption ?? NaN);
        if (Number.isNaN(val)) return false;
        if (consumptionOp === "lt") return val < target;
        if (consumptionOp === "lte") return val <= target;
        if (consumptionOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    // AdditionalHisab Filter
    if (additionalHisabVal !== "" && !isNaN(Number(additionalHisabVal))) {
      const target = Number(additionalHisabVal);
      temp = temp.filter((bill) => {
        const val = Number(bill?.additionalHisab ?? NaN);
        if (Number.isNaN(val)) return false;
        if (additionalHisabOp === "lt") return val < target;
        if (additionalHisabOp === "lte") return val <= target;
        if (additionalHisabOp === "gte") return val >= target;
        return val === target; // eq
      });
    }

    // Bank Sent Filter
    if (filterBankSent !== "all") {
      if (filterBankSent === "sent") {
        temp = temp.filter(
          (r) => r.isSendToBank === true || r.sendToBank === true
        );
      } else if (filterBankSent === "not_sent") {
        temp = temp.filter(
          (r) =>
            r.isSendToBank === false ||
            r.sendToBank === false ||
            (r.isSendToBank == null && r.sendToBank == null)
        );
      }
    }

    // SMS Status Filter
    if (filterSmsSent !== "all") {
      const smsSentBool = filterSmsSent === "sent";
      temp = temp.filter((bill) => {
        const flag = bill.enableEditMeneshaReading;
        return smsSentBool ? !!flag : !flag;

      });
    }

    // Void/Changed Customers Filter
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
      temp = temp.filter((b) => {
        const a = getAcct(b);
        return a && voidAccounts.has(String(a));
      });
    }

    return temp;
  }, [
    readings,
    filterMoneyCollected,
    filterBankSent,
    filterSmsSent,
    wuzifMonthsOp,
    wuzifMonthsVal,
    zeroReadingMonthsOp,
    zeroReadingMonthsVal,
    consumptionOp,
    consumptionVal,
    additionalHisabOp,
    additionalHisabVal,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
    selectedCustomerTypeId,
    filterVoidChangedCustomers,
  ]);

  const filteredData = useMemo(() => {
    return filteredReadingsWithVoids.filter((b) => !b?.isVoid && !b?.void);
  }, [filteredReadingsWithVoids]);
  const nonVoidedCount = useMemo(
    () => (Array.isArray(filteredData) ? filteredData.length : 0),
    [filteredData]
  );

  const displayData = useMemo(() => {
    if (!Array.isArray(filteredData)) return [];
    if (!showDuplicatesOnly) return filteredData;

    const byAccount = new Map();
    const byInvoice = new Map();

    filteredData.forEach((bill) => {
      const id = bill?.id;
      const account =
        bill?.customerAccountNumber || bill?.accountNumber || null;
      const invoice =
        bill?.billingInvoiceNumber || bill?.invoiceNumber || null;

      if (account) {
        if (!byAccount.has(account)) byAccount.set(account, []);
        byAccount.get(account).push(id);
      }
      if (invoice) {
        if (!byInvoice.has(invoice)) byInvoice.set(invoice, []);
        byInvoice.get(invoice).push(id);
      }
    });

    const duplicateIds = new Set();
    const markDuplicates = (map) => {
      map.forEach((ids) => {
        if (Array.isArray(ids) && ids.length > 1) {
          ids.forEach((id) => {
            if (id != null) duplicateIds.add(id);
          });
        }
      });
    };

    markDuplicates(byAccount);
    markDuplicates(byInvoice);

    if (duplicateIds.size === 0) {
      return [];
    }

    return filteredData.filter((bill) => duplicateIds.has(bill?.id));
  }, [filteredData, showDuplicatesOnly]);

  const handleFilterClick = () => {
    if (selectedKifyaWerMonth && selectedKifyaWerYear) refetch();
    else toast.info("Please select both a month and a year to filter.");
  };

  // Kitat transfer
  const transferKitatMutation = useMutation({
    mutationFn: async ({ accountNumber, totalKitat }) =>
      readingService.transferKitatToOldArrears(accountNumber, totalKitat),
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
    if (!window.confirm("Are you sure you want to transfer Kitat?")) return;
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
        const base = `Kitat transferred for ${successCount} account(s).`;
        const msg = failCount > 0 ? `${base} ${failCount} failed.` : base;
        toast.success(msg);
        refetch();
      } else if (failCount > 0) {
        toast.error("Failed to transfer kitat for filtered bills.");
      }
    } finally {
      setIsBulkKitatTransferring(false);
    }

  };

  const handleSendBulkSms = async () => {
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

    if (!(smsDueDateEC instanceof Date) || isNaN(smsDueDateEC)) {
      toast.info("Please select a Due Date (EC) before sending SMS.");
      return;
    }

    // Extract IDs
    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

    // Prepare date string for backend message builder
    let smsDueDateText = "";
    if (smsDueDateEC instanceof Date && !isNaN(smsDueDateEC)) {
      const [ey, em, ed] = ethiopianDate.toEthiopian(
        smsDueDateEC.getFullYear(),
        smsDueDateEC.getMonth() + 1,
        smsDueDateEC.getDate()
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
      // Batch processing in chunks of 500
      const CHUNK_SIZE = 500;
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunk = allIds.slice(i, i + CHUNK_SIZE);

        // Show progress toast if multiple chunks
        if (allIds.length > CHUNK_SIZE) {
          toast.info(`Sending batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(allIds.length / CHUNK_SIZE)}...`, { autoClose: 2000 });
        }

        try {
          const result = await smsService.sendBulkBillSmsSilent(chunk, {
            smsDueDateText,
            monthYearPart,
          });
          totalSent += result?.sent ?? 0;
          totalFailed += result?.failed ?? 0;
        } catch (errChunk) {
          console.error("Error sending chunk", i, errChunk);
          totalFailed += chunk.length; // Assume all failed in this chunk if request fails
        }
      }

      if (totalSent > 0) {
        const base = `SMS sending process finished. Total Sent: ${totalSent}.`;
        const msg = totalFailed > 0 ? `${base} Failed: ${totalFailed}.` : base;
        toast.success(msg);
        refetch(); // Refresh to update SMS status flags
      } else if (totalFailed > 0) {
        toast.error(`SMS sending failed. All ${totalFailed} attempts failed.`);
      } else {
        toast.info("No SMS attempted (check if numbers exist).");
      }

    } catch (error) {
      console.error("Error sending bulk SMS", error);
      toast.error(error?.message || "Error sending bulk SMS.");
    } finally {
      setIsBackendBulkSmsSending(false);
    }
  };

  const handlePrepareCsvForReader = async () => {
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.info("Please select both a month and a year first.");
      return;
    }
    if (!selectedReaderId) {
      toast.info("Please select an Assigned Reader first.");
      return;
    }

    const bills = Array.isArray(filteredData) ? filteredData : [];
    if (!bills.length) {
      toast.info("No filtered bills to prepare CSV from.");
      return;
    }

    const { month: targetMonthAmh, year: targetYear } = getNextEthMonthAndYear(
      selectedKifyaWerMonth,
      selectedKifyaWerYear
    );
    const kifyaWerAmh = `${targetMonthAmh}, ${targetYear}`;
    const monthEng = getEnglishEthMonth(targetMonthAmh) || String(targetMonthAmh);
    const kifyaWerEng = `${monthEng}_${targetYear}`;

    const rows = bills
      .map((bill) => {
        if (!bill) return null;
        const customerInfoId = bill.customerInfoId ?? null;
        const lastReadingRaw = bill.lastReading ?? bill.lastreading ?? null;
        const lastReading = Number(lastReadingRaw ?? 0);
        const avg = Number(bill.initialConsumption ?? 0);

        if (!customerInfoId || !Number.isFinite(lastReading) || lastReading <= 0) {
          return null;
        }

        let maximumreading = 0;
        if (Number.isFinite(avg) && avg > 0) {
          maximumreading = Math.round(lastReading + (avg * 2));
        } else {
          maximumreading = lastReading;
        }

        return {
          customer_info_id: customerInfoId,
          consumption: lastReading,
          maximumreading,
          wuzif_hisab: bill.wuzifHisab,
          wuzif_kezih_eske: bill.wuzifKezihEske,
          kifya_wer: kifyaWerAmh,
          additional_text: "",
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      toast.info("No eligible rows found for CSV (missing customer info or readings).");
      return;
    }

    setIsPreparingMobileCsv(true);
    try {
      const payload = {
        readerId: Number(selectedReaderId),
        kifyaWerEng,
        rows,
      };

      const resp = await readingService.prepareMobileCsvForReader(payload);
      if (resp?.success) {
        const fileName = resp.fileName || "(no file name)";
        const rowCount = resp.rowCount ?? rows.length;
        toast.success(`CSV prepared for reader. File: ${fileName}, Rows: ${rowCount}`);
      } else {
        toast.error(resp?.message || "Failed to prepare CSV for reader.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to prepare CSV for reader.";
      toast.error(msg);
    } finally {
      setIsPreparingMobileCsv(false);
    }
  };

  const handleRemoveDuplicateBills = async () => {
    const sourceBills = Array.isArray(filteredData) ? filteredData : [];

    if (!sourceBills.length) {
      toast.info("No bills to check for duplicates.");
      return;
    }

    // Group bills by account and invoice, similar to the duplicate finder
    const groups = new Map();

    sourceBills.forEach((bill) => {
      if (!bill || bill.id == null) return;

      const account =
        bill.customerAccountNumber || bill.accountNumber || null;
      const invoice =
        bill.billingInvoiceNumber || bill.invoiceNumber || null;

      if (account) {
        const key = `ACC:${account}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(bill);
      }

      if (invoice) {
        const key = `INV:${invoice}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(bill);
      }
    });

    const candidateMap = new Map();

    groups.forEach((bills) => {
      if (!Array.isArray(bills) || bills.length < 2) return;

      const sorted = bills
        .filter((b) => b && b.id != null)
        .sort((a, b) => Number(a.id) - Number(b.id));

      if (sorted.length < 2) return;

      const [, ...rest] = sorted; // keep the smallest id (first element), process the rest

      rest.forEach((bill) => {
        if (!bill || bill.id == null) return;

        // Respect money collected and void guards
        if (bill.isMoneyCollected || bill.moneyCollected) return;
        if (bill.isVoid || bill.void) return;

        if (!candidateMap.has(bill.id)) {
          candidateMap.set(bill.id, bill);
        }
      });
    });

    const candidates = Array.from(candidateMap.values());

    if (!candidates.length) {
      toast.info("No duplicate bills found that can be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Found ${candidates.length} duplicate bill(s). The earliest bill (smallest ID) in each duplicate group will be kept and the others will be marked as deleted. Continue?`
    );

    if (!confirmed) return;

    setIsRemovingDuplicates(true);
    let success = 0;
    let fail = 0;

    try {
      for (const bill of candidates) {
        try {
          await readingService.changeReadingStatus(bill.id, "deleted");
          success++;
        } catch (err) {
          console.error("Error deleting duplicate bill:", err);
          fail++;
        }
      }

      if (success > 0) {
        toast.success(`Removed ${success} duplicate bill(s).`);
        refetch();
      }

      if (fail > 0) {
        toast.error(`${fail} duplicate bill(s) could not be deleted.`);
      }
    } finally {
      setIsRemovingDuplicates(false);
    }
  };

  const consumptionCorrectionMutation = useMutation({
    mutationFn: async ({ readingIds, reason, percent, baseType }) =>
      readingService.applyConsumptionBasedCorrection(readingIds, reason, percent, baseType),
    onSuccess: (data) => {
      const msg =
        data?.message ||
        `Consumption based correction applied to ${data?.updatedCount || ""} bills.`;
      toast.success(msg);
      setIsCorrectionDialogOpen(false);
      setIsApplying(false);
      refetch();
    },
    onError: (error) => {
      setIsApplying(false);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to apply consumption based correction";
      toast.error(message);
    },
  });

  const averageInitMutation = useMutation({
    mutationFn: async ({ accountNumbers, kifyaWer, months }) =>
      readingService.initAverageConsumption(accountNumbers, kifyaWer, months),
    onSuccess: (data) => {
      const msg =
        data?.message ||
        `Average consumption initialized for ${data?.updatedCount || ""} customer(s).`;
      toast.success(msg);
      setIsAvgDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initialize average consumption";
      toast.error(message);
    },
  });

  const handleOpenConsumptionDialog = (billId = null, mode = "ADD") => {
    if (!billId && (!Array.isArray(filteredData) || filteredData.length === 0)) {
      toast.info("No filtered bills to correct.");
      return;
    }
    setSingleCorrectionBillId(billId);
    setCorrectionReason("");
    setCorrectionPercent("");
    setCorrectionBaseType("CURRENT_CONSUMPTION");
    setCorrectionMode(mode);
    setIsApplying(false);
    setIsCorrectionDialogOpen(true);
  };

  const handleApplyConsumptionCorrection = () => {
    let ids = [];
    if (singleCorrectionBillId) {
      ids = [singleCorrectionBillId];
    } else {
      ids = (Array.isArray(filteredData) ? filteredData : [])
        .map((b) => b.id)
        .filter((id) => id != null);
    }

    if (!ids.length) {
      toast.info("No valid bill IDs found.");
      return;
    }

    let percentNum = Number(correctionPercent);
    if (!Number.isFinite(percentNum) || percentNum === 0) {
      toast.error("Percent must be a non-zero number.");
      return;
    }

    // If mode is SUB, make percentage negative
    if (correctionMode === "SUB") {
      percentNum = -Math.abs(percentNum);
    } else {
      percentNum = Math.abs(percentNum);
    }

    setIsApplying(true);
    consumptionCorrectionMutation.mutate({
      readingIds: ids,
      reason: correctionReason,
      percent: percentNum,
      baseType: correctionBaseType,
    });
  };

  const handleExportToExcel = () => {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();

      // Check for filtered data
      const dataToExport = Array.isArray(filteredData) && filteredData.length > 0 ? filteredData : [];

      if (dataToExport.length === 0) {
        toast.info("No data to export.");
        return;
      }

      // Prepare data for export - only visible columns
      const exportData = dataToExport.map((row, index) => ({
        '#': index + 1,
        'Invoice Number': row.billingInvoiceNumber || '',
        'Customer Name': row.customerFullName || '',
        'Account Number': row.customerAccountNumber || '',
        'Zero Reading Wor Bzat': row.zeroReadingWorBzat || 0,
        'Consumption': row.consumption || 0,
        'Dry Waste': row.additionalHisab || 0,
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



  const voidChangedComparisons = useMemo(() => {
    if (!Array.isArray(filteredReadingsWithVoids) || filteredReadingsWithVoids.length === 0) return [];

    let items = [...filteredReadingsWithVoids];

    const getAcct = (b) => b?.customerAccountNumber ?? b?.accountNumber ?? b?.customerId ?? null;
    const getId = (b) => (b?.id !== undefined ? Number(b.id) : NaN);
    const getInv = (b) => b?.billingInvoiceNumber ?? b?.invoiceNumber ?? "";
    const getTekefay = (b) => Number(b?.tekilalaTekefay ?? 0) || 0;
    const getCreatedTs = (b) => {
      const d = b?.createdAt || b?.createdDate || b?.registeredDate || b?.created_on || b?.createdOn || b?.created;
      const t = d ? Date.parse(d) : NaN;
      return Number.isNaN(t) ? null : t;
    };

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
      const voids = list.filter((x) => (x?.isVoid || x?.void));
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
  }, [filteredReadingsWithVoids]);

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

  const handleExportWuzifReport = async () => {
    // 1. Gather filtered account numbers
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      toast.info("No filtered data to export.");
      return;
    }

    // Validate Kifya Wer
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.info("Please select Month and Year for the report context.");
      return;
    }

    const accountNumbers = filteredData
      .map(row => row.customerAccountNumber || row.accountNumber)
      .filter(acc => acc);

    if (accountNumbers.length === 0) {
      toast.info("No valid account numbers found.");
      return;
    }

    // Format Kifya Wer: "Month, Year" (e.g., "መስከረም, 2016")
    const kifyaWer = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;

    try {
      setIsWuzifExporting(true);
      const data = await readingService.getBulkWuzifReportForCustomer(accountNumbers, kifyaWer);

      if (!data || data.length === 0) {
        toast.info("No data returned for export.");
        return;
      }

      // Prepare Excel data
      // wuzifWorBzat is already set in the backend to the list count
      const exportData = data.map((row, index) => ({
        '#': index + 1,
        // 'Invoice Number': row.billingInvoiceNumber || '', // Ignored
        'Customer Name': row.customerFullName || '',
        'Account Number': row.customerAccountNumber || '',
        'Kebele': row.customerKebele || '',
        'wuzifWorBzat': row.wuzifWorBzat || 0, // Should be constant for all rows
        'Dry Waste': row.additionalHisab || 0,
        'Yezih Wer': row.yezihWer || 0,
        'Wuzif Hisab': row.wuzifHisab || 0,
        'Kitat': row.kitat || 0,
        'Total Payable': row.tekilalaTekefay || 0,
        'Customer Type': row.customerType || '',
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'Wuzif Bulk Report');

      // Generate filename
      const now = new Date();
      const filename = `Wuzif_Bulk_Report_${selectedKifyaWerMonth}_${selectedKifyaWerYear}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      toast.success('Wuzif bulk report exported successfully!');

    } catch (error) {
      console.error("Export error:", error);
      toast.error('Failed to export bulk Wuzif report.');
    } finally {
      setIsWuzifExporting(false);
    }
  };

  const handleOpenAverageInitDialog = () => {
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.info("Please select both a month and a year first.");
      return;
    }
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      toast.info("No filtered bills to calculate averages.");
      return;
    }
    setAvgMonths("");
    setIsAvgDialogOpen(true);
  };

  const handleApplyAverageInit = () => {
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error("Month and year are required.");
      return;
    }

    const source = Array.isArray(filteredData) ? filteredData : [];
    const accountsSet = new Set();
    source.forEach((bill) => {
      if (!bill) return;
      const acc = bill.customerAccountNumber || bill.accountNumber;
      if (acc) {
        accountsSet.add(String(acc));
      }
    });

    const accountNumbers = Array.from(accountsSet);
    if (!accountNumbers.length) {
      toast.info("No account numbers found in filtered bills.");
      return;
    }

    const monthsNum = Number(avgMonths);
    if (!Number.isFinite(monthsNum) || monthsNum <= 0) {
      toast.error("Number of months must be greater than zero.");
      return;
    }

    const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;

    averageInitMutation.mutate({
      accountNumbers,
      kifyaWer: kifyaWerFormatted,
      months: monthsNum,
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row }) => row.index + 1,
      },
      { accessorKey: "billingInvoiceNumber", header: "Invoice Number" },
      { accessorKey: "customerFullName", header: "Customer Name" },
      { accessorKey: "customerAccountNumber", header: "Account Number" },
      { accessorKey: "customerKebele", header: "Kebele" },
      {
        accessorKey: "consumption",
        header: "Consumption",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "initialConsumption",
        header: "Average",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val != null ? Number(val).toLocaleString() : "";
        },
      },
      {
        accessorKey: "wuzifWorBzat",
        header: "wuzifWorBzat",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "zeroReadingWorBzat",
        header: "Zero Reading Wor Bzat",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "additionalHisab",
        header: "Dry Waste",
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return val != null ? Number(val).toLocaleString() : "";
        },
      },
      {
        accessorKey: "yezihWer",
        header: "Yezih Wer",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
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
      {
        id: "actions-consumption-based",
        header: "Consumption Based",
        Cell: ({ row }) => (
          <>
            <Button
              variant="outlined"
              size="small"
              color="primary"
              onClick={() => handleOpenConsumptionDialog(row.original.id)}
              disabled={
                row.original.isVoid || consumptionCorrectionMutation.isPending
              }
            >
              Consumption Based
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="secondary"
              sx={{ ml: 1 }}
              onClick={() => handleOpenConsumptionDialog(row.original.id, "SUB")}
              disabled={
                row.original.isVoid || consumptionCorrectionMutation.isPending
              }
            >
              Correction SUB
            </Button>
          </>
        ),
      },
      {
        id: "actions-transfer-kitat",
        header: "Kitat Transfer",
        Cell: ({ row }) => {
          const original = row.original;
          const accountNumber =
            original.customerAccountNumber || original.accountNumber || null;
          const kitatVal = Number(original.kitat || 0);
          const disabled = !accountNumber || kitatVal <= 0 || original.isVoid;
          return (
            <Button
              variant="outlined"
              size="small"
              disabled={disabled || transferKitatMutation.isLoading}
              onClick={() =>
                handleTransferKitatForAccount(accountNumber, kitatVal)
              }
            >
              Transfer Kitat
            </Button>
          );
        },
      },
      {
        accessorKey: "tekilalaTekefay",
        header: "Total Payable",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      { accessorKey: "customerType", header: "Customer Type" },
    ],
    [transferKitatMutation]
  );

  const table = useMaterialReactTable({
    columns,
    data: displayData,
    state: { isLoading, showAlertBanner: isError, showProgressBars: isLoading },
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
      <Breadcrumb pageName="ንባብ ማኔጅመንት" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            {/* Top: month/year + filter + bulk kitat */}
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
                mb: 2,
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
                  {ethiopianMonths.map((month) => (
                    <MenuItem key={month} value={month}>
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

              {/* Added Extra Options Button and Menu */}
              <Button
                variant="outlined"
                onClick={handleExtraClick}
                disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear}
              >
                Extra Options
              </Button>
              <Menu
                anchorEl={anchorElExtra}
                open={Boolean(anchorElExtra)}
                onClose={handleExtraClose}
              >
                <MenuItem onClick={() => { handleExportVoidChangedReportPDF(true); handleExtraClose(); }}>
                  Preview Void/Changed Report
                </MenuItem>
                <MenuItem onClick={() => { handleExportVoidChangedReportPDF(false); handleExtraClose(); }}>
                  Export Void/Changed PDF
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                onClick={handleFilterClick}
                disabled={
                  !selectedKifyaWerMonth || !selectedKifyaWerYear || isLoading
                }
              >
                Filter Bills
              </Button>

              <Button
                variant="outlined"
                color="primary"
                disabled={
                  isLoading ||
                  consumptionCorrectionMutation.isPending ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={() => handleOpenConsumptionDialog(null)}
              >
                Consumption Based
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                disabled={
                  isLoading ||
                  consumptionCorrectionMutation.isPending ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={() => handleOpenConsumptionDialog(null, "SUB")}
              >
                Correction SUB
              </Button>

              <Button
                variant="outlined"
                color="primary"
                disabled={
                  isLoading ||
                  averageInitMutation.isPending ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={handleOpenAverageInitDialog}
                startIcon={averageInitMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {averageInitMutation.isPending
                  ? "Initializing Averages..."
                  : "Init Avg Consumption"}
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                disabled={
                  isLoading ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={() =>
                  setShowDuplicatesOnly((prev) => !prev)
                }
              >
                {showDuplicatesOnly ? "Show All Bills" : "Find Duplicates"}
              </Button>

              <Button
                variant="outlined"
                color="error"
                disabled={
                  isLoading ||
                  isRemovingDuplicates ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={handleRemoveDuplicateBills}
              >
                {isRemovingDuplicates
                  ? "Removing Duplicates..."
                  : "Remove Duplicate Bills"}
              </Button>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterVoidChangedCustomers}
                    onChange={(e) => setFilterVoidChangedCustomers(e.target.checked)}
                    name="voidChanged"
                  />
                }
                label="Void/Changed Acc."
              />

              <Button
                variant="contained"
                color="success"
                disabled={
                  isLoading ||
                  isPreparingMobileCsv ||
                  !selectedReaderId ||
                  !Array.isArray(filteredData) ||
                  filteredData.length === 0
                }
                onClick={handlePrepareCsvForReader}
              >
                {isPreparingMobileCsv ? "Preparing CSV..." : "Prepare for Readers"}
              </Button>
            </Box>

            {/* Filters: collection status, wuzif, geo, customer type */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Money Collected</InputLabel>
                <Select
                  value={filterMoneyCollected}
                  label="Money Collected"
                  onChange={(e) => setFilterMoneyCollected(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Collected</MenuItem>
                  <MenuItem value="false">Not Collected</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Bank Sent</InputLabel>
                <Select
                  value={filterBankSent}
                  label="Bank Sent"
                  onChange={(e) => setFilterBankSent(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="not_sent">Not Sent</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>SMS Status</InputLabel>
                <Select
                  value={filterSmsSent}
                  label="SMS Status"
                  onChange={(e) => setFilterSmsSent(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="not_sent">Not Sent</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180 }}>
                {/* Re-using EtDatePicker for SMS Due Date */}
                <EtDatePicker
                  label="SMS Due Date (EC)"
                  value={smsDueDateEC}
                  onChange={(val) => setSmsDueDateEC(val)}
                />
              </FormControl>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleSendBulkSms}
                disabled={isBackendBulkSmsSending || !filteredData?.length || !smsDueDateEC}
                sx={{ ml: 2 }}
              >
                {isBackendBulkSmsSending ? "Sending..." : "Send SMS"}
              </Button>

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
                  <MenuItem value="lte">≤</MenuItem>
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

              {/* Consumption Filter UI */}
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="consumption-operator-label">Cons. Op</InputLabel>
                <Select
                  labelId="consumption-operator-label"
                  value={consumptionOp}
                  label="Cons. Op"
                  onChange={(e) => setConsumptionOp(e.target.value)}
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
                label="Consumption"
                value={consumptionVal}
                onChange={(e) => setConsumptionVal(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ width: 140 }}
              />

              {/* AdditionalHisab Filter UI */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="additionalHisab-operator-label">Dry Waste Op</InputLabel>
                <Select
                  labelId="additionalHisab-operator-label"
                  value={additionalHisabOp}
                  label="Dry Waste Op"
                  onChange={(e) => setAdditionalHisabOp(e.target.value)}
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
                label="Dry Waste Value"
                value={additionalHisabVal}
                onChange={(e) => setAdditionalHisabVal(e.target.value)}
                inputProps={{ min: 0 }}
                sx={{ width: 140 }}
              />

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

              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
                disabled={!selectedKebeleId}
              >
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

              <FormControl
                size="small"
                sx={{ minWidth: 180 }}
                disabled={!selectedBranchId}
              >
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

              {/* New Wuzif Report Section - Bulk */}
              <Box sx={{ ml: 4, display: 'flex', gap: 1, alignItems: 'center', borderLeft: '1px solid #ccc', pl: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => handleExportToExcel()}
                  disabled={!Array.isArray(filteredData) || filteredData.length === 0}
                  sx={{ mr: 1 }}
                >
                  Export to Excel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleExportWuzifReport}
                  disabled={isWuzifExporting || !Array.isArray(filteredData) || filteredData.length === 0}
                >
                  {isWuzifExporting ? "Exporting..." : "Export Wuzif Report"}
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Filtered bills: {nonVoidedCount.toLocaleString()}
              </Typography>
            </Box>

            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      <ReadingDetailModal
        readingId={viewReadingId}
        open={!!viewReadingId}
        onClose={() => setViewReadingId(null)}
      />

      <Dialog
        open={isCorrectionDialogOpen}
        onClose={() =>
          !consumptionCorrectionMutation.isLoading && setIsCorrectionDialogOpen(false)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {correctionMode === "SUB"
            ? "Consumption Based Subtraction (Correction)"
            : "Consumption Based Correction"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Reason"
              fullWidth
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
            />
            <TextField
              label="Percent"
              type="number"
              fullWidth
              value={correctionPercent}
              onChange={(e) => setCorrectionPercent(e.target.value)}
              inputProps={{ step: "0.01" }}
              helperText="Enter percent, e.g. 10 for 10%"
            />
            <FormControl fullWidth size="small">
              <InputLabel id="correction-base-type-label">Base Amount</InputLabel>
              <Select
                labelId="correction-base-type-label"
                value={correctionBaseType}
                label="Base Amount"
                onChange={(e) => setCorrectionBaseType(e.target.value)}
              >
                <MenuItem value="CURRENT_CONSUMPTION">
                  Curunt Month Consumption (የፍጆታ ብቻ)
                </MenuItem>
                <MenuItem value="CURRENT_EDW_TOTAL">
                  Total Curunt Month (የፍጆታ እና ቆጣሪ ክራይ)
                </MenuItem>
                <MenuItem value="TOTAL_BILL">
                  Total Bill (ጠቅላላ የተዘጋጀ)
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsCorrectionDialogOpen(false)}
            disabled={consumptionCorrectionMutation.isPending || isApplying}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyConsumptionCorrection}
            disabled={consumptionCorrectionMutation.isPending || isApplying}
            startIcon={consumptionCorrectionMutation.isPending || isApplying ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {consumptionCorrectionMutation.isPending || isApplying ? "Applying..." : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isAvgDialogOpen}
        onClose={() =>
          !averageInitMutation.isLoading && setIsAvgDialogOpen(false)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Initialize Average Consumption</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Number of Months"
              type="number"
              fullWidth
              value={avgMonths}
              onChange={(e) => setAvgMonths(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsAvgDialogOpen(false)}
            disabled={averageInitMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyAverageInit}
            disabled={averageInitMutation.isPending}
            startIcon={averageInitMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {averageInitMutation.isPending ? "Applying..." : "Apply"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

const ReadingManagementPage = () => (
  <QueryClientProvider client={queryClient}>
    <ReadingManagement />
  </QueryClientProvider>
);

export default ReadingManagementPage;
