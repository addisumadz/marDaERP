"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Alert,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import CancelPresentationIcon from "@mui/icons-material/CancelPresentation";
import ProPeriodPicker from "@/app/ui/components/ProPeriodPicker";
import { ETH_MONTHS_AM } from "@/app/helpers/constants";
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

const modernSelectSx = {
  borderRadius: 2,
  bgcolor: "#f8fafc",
  "&:hover": { bgcolor: "#f1f5f9" },
};

const modernMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 320,
      borderRadius: 2,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        py: 0.8,
        borderRadius: 1,
        mx: 0.5,
        my: 0.2,
      },
    },
  },
};

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

const BillSupport = () => {
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
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
  const [viewReadingId, setViewReadingId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [billsToVoid, setBillsToVoid] = useState([]);

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
  const [selectedCashierId, setSelectedCashierId] = useState("");


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
  const [isExportingSmsExcel, setIsExportingSmsExcel] = useState(false);

  // Direct Message state
  const [isDirectMsgDialogOpen, setIsDirectMsgDialogOpen] = useState(false);
  const [directMsgText, setDirectMsgText] = useState("");
  const [isDirectMsgSending, setIsDirectMsgSending] = useState(false);

  // Custom loading state for correction application
  const [isApplying, setIsApplying] = useState(false);
  const [smsDueDateEC, setSmsDueDateEC] = useState(null); // For SMS due date

  // Wuzif Export State
  const [exportCustomerId, setExportCustomerId] = useState("");
  const [isWuzifExporting, setIsWuzifExporting] = useState(false);

  // Wuzif Occurrence Check State
  const [isCheckingWuzif, setIsCheckingWuzif] = useState(false);
  const [wuzifFilterActive, setWuzifFilterActive] = useState(false);
  const [wuzifReadingIdSet, setWuzifReadingIdSet] = useState(new Set());

  // Having Wuzif Check State (mirrors formalizeArrearsFor, read-only)
  const [isCheckingHavingWuzif, setIsCheckingHavingWuzif] = useState(false);
  const [havingWuzifFilterActive, setHavingWuzifFilterActive] = useState(false);
  const [havingWuzifReadingIdSet, setHavingWuzifReadingIdSet] = useState(new Set());

  // Wuzif List Check State (bills in wuzif table with deleted='active')
  const [isCheckingWuzifList, setIsCheckingWuzifList] = useState(false);
  const [wuzifListFilterActive, setWuzifListFilterActive] = useState(false);
  const [wuzifListReadingIdSet, setWuzifListReadingIdSet] = useState(new Set());

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

  // Sync active reading date cycle
  useEffect(() => {
    if (companyProfile && companyProfile.activeReadingDate) {
      try {
        const activeDate = new Date(companyProfile.activeReadingDate);
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
    const monthIndex = Math.min(ethMonth, 12) - 1;
    const cycleMonth = ETH_MONTHS_AM[monthIndex];
    setCurrentCycleMonth(cycleMonth);
    setCurrentCycleYear(String(ethYear));
  }, [companyProfile, ethYear, ethMonth]);

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

  const yearOptions = [2014, 2015, 2016, 2017, 2018, 2019, 2020];

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
    queryFn: () => dropdownService.getKetenasByKebele(selectedKebeleId || null),
  });

  const { data: readers = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return dropdownService.getActiveMeterReaders();
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } =
    useQuery({
      queryKey: ["customerTypes"],
      queryFn: () => dropdownService.getCustomerTypes(),
    });

  const { data: cashiers = [], isLoading: isCashiersLoading } = useQuery({
    queryKey: ["cashiers"],
    queryFn: () => dropdownService.getCashiers(),
  });

  // load bills for month/year
  const {
    data: readings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["billsupportReadings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
        const merged = await readingService.getBillFilteredReadingsSupportMerged(kifyaWerFormatted);
        return (merged || []).map((it) => {
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


  const isBillGeneratedTrue = (b) =>
    b?.isBillGenerated === true ||
    b?.isBillGenerated === 1 ||
    (typeof b?.isBillGenerated === "string" && b?.isBillGenerated.toLowerCase() === "true");

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
    if (selectedCashierId) {
      temp = temp.filter(
        (r) =>
          r?.cashierUserId !== undefined &&
          String(r.cashierUserId) === String(selectedCashierId)
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
        if ((b?.isVoid || b?.void) && isBillGeneratedTrue(b)) {
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
    selectedCashierId,
    filterVoidChangedCustomers,
  ]);

  const filteredData = useMemo(() => {
    return filteredReadingsWithVoids.filter((b) => !b?.isVoid && !b?.void);
  }, [filteredReadingsWithVoids]);

  const displayData = useMemo(() => {
    if (!Array.isArray(filteredData)) return [];

    let base = filteredData;

    // Wuzif occurrence filter (applied before duplicate filter)
    if (wuzifFilterActive && wuzifReadingIdSet.size > 0) {
      base = base.filter((bill) => bill?.id != null && wuzifReadingIdSet.has(bill.id));
    } else if (wuzifFilterActive && wuzifReadingIdSet.size === 0) {
      // Filter is active but no wuzif IDs found — show empty
      return [];
    }

    // Having Wuzif filter (bills whose previous month is unpaid)
    if (havingWuzifFilterActive && havingWuzifReadingIdSet.size > 0) {
      base = base.filter((bill) => bill?.id != null && havingWuzifReadingIdSet.has(bill.id));
    } else if (havingWuzifFilterActive && havingWuzifReadingIdSet.size === 0) {
      return [];
    }

    // Wuzif List filter (bills existing in wuzif table with deleted='active')
    if (wuzifListFilterActive && wuzifListReadingIdSet.size > 0) {
      base = base.filter((bill) => bill?.id != null && wuzifListReadingIdSet.has(bill.id));
    } else if (wuzifListFilterActive && wuzifListReadingIdSet.size === 0) {
      return [];
    }

    if (!showDuplicatesOnly) return base;

    const byAccount = new Map();
    const byInvoice = new Map();

    base.forEach((bill) => {
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

    return base.filter((bill) => duplicateIds.has(bill?.id));
  }, [filteredData, showDuplicatesOnly, wuzifFilterActive, wuzifReadingIdSet, havingWuzifFilterActive, havingWuzifReadingIdSet, wuzifListFilterActive, wuzifListReadingIdSet]);

  const nonVoidedCount = useMemo(
    () => (Array.isArray(displayData) ? displayData.length : 0),
    [displayData]
  );

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedKebeleId) count++;
    if (selectedKetenaId) count++;
    if (selectedBranchId) count++;
    if (selectedReaderId) count++;
    if (selectedCustomerTypeId) count++;
    if (selectedCashierId) count++;
    if (filterMoneyCollected !== "all") count++;
    if (filterBankSent !== "all") count++;
    if (filterSmsSent !== "all") count++;
    if (wuzifMonthsVal !== "") count++;
    if (zeroReadingMonthsVal !== "") count++;
    if (consumptionVal !== "") count++;
    if (additionalHisabVal !== "") count++;
    if (filterVoidChangedCustomers) count++;
    return count;
  }, [
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
    selectedCustomerTypeId,
    selectedCashierId,
    filterMoneyCollected,
    filterBankSent,
    filterSmsSent,
    wuzifMonthsVal,
    zeroReadingMonthsVal,
    consumptionVal,
    additionalHisabVal,
    filterVoidChangedCustomers,
  ]);

  const handleClearAllFilters = useCallback(() => {
    setSelectedKebeleId("");
    setSelectedKetenaId("");
    setSelectedBranchId("");
    setSelectedReaderId("");
    setSelectedCustomerTypeId("");
    setSelectedCashierId("");
    setFilterMoneyCollected("all");
    setFilterBankSent("all");
    setFilterSmsSent("all");
    setWuzifMonthsOp("eq");
    setWuzifMonthsVal("");
    setZeroReadingMonthsOp("eq");
    setZeroReadingMonthsVal("");
    setConsumptionOp("eq");
    setConsumptionVal("");
    setAdditionalHisabOp("eq");
    setAdditionalHisabVal("");
    setFilterVoidChangedCustomers(false);
  }, []);

  const handleFilterClick = () => {
    if (selectedKifyaWerMonth && selectedKifyaWerYear) refetch();
    else toast.info("Please select both a month and a year to filter.");
  };

  const selectedRows = useMemo(() => {
    if (!rowSelection || Object.keys(rowSelection).length === 0) return [];
    return displayData.filter((r) => rowSelection[String(r.id)] || rowSelection[r.id]);
  }, [rowSelection, displayData]);

  const voidBillsMutation = useMutation({
    mutationFn: async (readingIds) => readingService.voidBillsAndRevertToReadings(readingIds),
    onSuccess: (data) => {
      const voided = data?.voidedCount || 0;
      const skipped = data?.skippedCount || 0;
      if (voided > 0) {
        toast.success(`${voided} bill(s) successfully voided and reverted to unbilled readings!`);
      }
      if (skipped > 0) {
        toast.warn(`${skipped} bill(s) skipped (already paid or unbilled).`);
      }
      setRowSelection({});
      setIsVoidModalOpen(false);
      setBillsToVoid([]);
      refetch();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to void bills.");
    },
  });

  const handleOpenVoidSelected = () => {
    if (selectedRows.length === 0) {
      toast.info("Please select at least one bill from the table using checkboxes to void.");
      return;
    }
    setBillsToVoid(selectedRows);
    setIsVoidModalOpen(true);
  };

  const handleOpenVoidSingle = (bill) => {
    if (!bill) return;
    setBillsToVoid([bill]);
    setIsVoidModalOpen(true);
  };

  const handleConfirmVoidBills = () => {
    const eligible = billsToVoid.filter((b) => !b.moneyCollected && !b.isVoid);
    if (eligible.length === 0) {
      toast.error("None of the selected bills can be voided (they are already paid or void).");
      return;
    }
    const ids = eligible.map((b) => b.id);
    voidBillsMutation.mutate(ids);
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

  // ===== Direct Message Handlers =====
  const DIRECT_MSG_MAX_CHARS = 134; // 2 SMS max for UCS-2 encoding

  const getSmsParts = (text) => {
    const len = (text || "").length;
    if (len === 0) return 0;
    if (len <= 70) return 1;
    return Math.ceil(len / 67); // concatenated UCS-2 uses 67 chars per part
  };

  const handleOpenDirectMsgDialog = () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to send direct message.");
      return;
    }
    setDirectMsgText("");
    setIsDirectMsgDialogOpen(true);
  };

  const handleSendDirectMessage = async () => {
    const msg = directMsgText.trim();
    if (!msg) {
      toast.info("Please enter a message to send.");
      return;
    }
    if (msg.length > DIRECT_MSG_MAX_CHARS) {
      toast.error(`Message exceeds maximum ${DIRECT_MSG_MAX_CHARS} characters.`);
      return;
    }

    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

    setIsDirectMsgSending(true);
    try {
      const CHUNK_SIZE = 500;
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunk = allIds.slice(i, i + CHUNK_SIZE);

        if (allIds.length > CHUNK_SIZE) {
          toast.info(`Sending batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(allIds.length / CHUNK_SIZE)}...`, { autoClose: 2000 });
        }

        try {
          const result = await smsService.sendDirectBulkSms(chunk, msg);
          totalSent += result?.sent ?? 0;
          totalFailed += result?.failed ?? 0;
        } catch (errChunk) {
          console.error("Error sending direct message chunk", i, errChunk);
          totalFailed += chunk.length;
        }
      }

      if (totalSent > 0) {
        const base = `Direct SMS sending finished. Total Sent: ${totalSent}.`;
        const msgResult = totalFailed > 0 ? `${base} Failed: ${totalFailed}.` : base;
        toast.success(msgResult);
      } else if (totalFailed > 0) {
        toast.error(`Direct SMS failed. All ${totalFailed} attempts failed.`);
      } else {
        toast.info("No SMS attempted (check if phone numbers exist).");
      }

      setIsDirectMsgDialogOpen(false);
      setDirectMsgText("");
    } catch (error) {
      console.error("Error sending direct message", error);
      toast.error(error?.message || "Error sending direct message.");
    } finally {
      setIsDirectMsgSending(false);
    }
  };

  const handleExportSmsToExcel = async () => {
    const sourceBills =
      Array.isArray(filteredData) && filteredData.length > 0
        ? filteredData
        : Array.isArray(readings)
          ? readings
          : [];

    if (!sourceBills.length) {
      toast.info("No bills loaded to export SMS data.");
      return;
    }

    if (!(smsDueDateEC instanceof Date) || isNaN(smsDueDateEC)) {
      toast.info("Please select a Due Date (EC) before exporting SMS.");
      return;
    }

    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

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

    setIsExportingSmsExcel(true);
    try {
      const CHUNK_SIZE = 500;
      let allExportItems = [];

      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunk = allIds.slice(i, i + CHUNK_SIZE);

        if (allIds.length > CHUNK_SIZE) {
          toast.info(`Fetching SMS data batch ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(allIds.length / CHUNK_SIZE)}...`, { autoClose: 2000 });
        }

        try {
          const items = await smsService.getBulkBillSmsExportData(chunk, {
            smsDueDateText,
            monthYearPart,
          });
          if (Array.isArray(items)) {
            allExportItems = allExportItems.concat(items);
          }
        } catch (errChunk) {
          console.error("Error fetching SMS export chunk", i, errChunk);
          toast.error(`Failed to fetch SMS data for batch ${Math.floor(i / CHUNK_SIZE) + 1}.`);
        }
      }

      if (!allExportItems.length) {
        toast.info("No SMS export data returned (no valid phone numbers found).");
        return;
      }

      const cityName = companyProfile?.locationEng || "";
      const billMonth = selectedKifyaWerMonth && selectedKifyaWerYear
        ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear}`
        : "";

      const exportData = allExportItems.map((item, index) => ({
        'No': index + 1,
        'CityName': cityName,
        'AccountNumber': item.accountNumber || '',
        'PhoneNumber': item.phoneNumber || '',
        'Message': item.message || '',
        'BillMonth': billMonth,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, 'SMS Export');

      const now = new Date();
      const filename = `SMS_Export_${selectedKifyaWerMonth || ''}_${selectedKifyaWerYear || ''}_${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.xlsx`;

      XLSX.writeFile(wb, filename);
      toast.success(`SMS Excel exported successfully! ${allExportItems.length} rows.`);

    } catch (error) {
      console.error("Error exporting SMS to Excel", error);
      toast.error(error?.message || "Error exporting SMS to Excel.");
    } finally {
      setIsExportingSmsExcel(false);
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
      const dataToExport = Array.isArray(displayData) && displayData.length > 0 ? displayData : [];

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
    if (!Array.isArray(displayData) || displayData.length === 0) {
      toast.info("No filtered data to export.");
      return;
    }

    // Validate Kifya Wer
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.info("Please select Month and Year for the report context.");
      return;
    }

    const accountNumbers = displayData
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
        'Phone Number': row.customerPhoneNumber || '',
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

  // ===== Check Wuzif Occurrence Handler =====
  const handleCheckWuzifOccurrence = async () => {
    const sourceBills = Array.isArray(filteredData) ? filteredData : [];
    if (!sourceBills.length) {
      toast.info("No filtered bills to check.");
      return;
    }

    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

    setIsCheckingWuzif(true);
    try {
      const result = await readingService.checkWuzifOccurrence(allIds);
      const wuzifIds = result?.wuzifReadingIds || [];
      setWuzifReadingIdSet(new Set(wuzifIds));
      setWuzifFilterActive(true);
      toast.success(
        `Wuzif check complete: ${wuzifIds.length} of ${allIds.length} bills are still considered as wuzif/unpaid.`
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to check wuzif occurrence.";
      toast.error(msg);
    } finally {
      setIsCheckingWuzif(false);
    }
  };

  const handleClearWuzifFilter = () => {
    setWuzifFilterActive(false);
    setWuzifReadingIdSet(new Set());
  };

  // ===== Check for Having Wuzif Handler (mirrors formalizeArrearsFor, read-only) =====
  const handleCheckForHavingWuzif = async () => {
    const sourceBills = Array.isArray(filteredData) ? filteredData : [];
    if (!sourceBills.length) {
      toast.info("No filtered bills to check.");
      return;
    }

    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

    setIsCheckingHavingWuzif(true);
    try {
      const result = await readingService.checkForHavingWuzif(allIds);
      const havingIds = result?.havingWuzifReadingIds || [];
      setHavingWuzifReadingIdSet(new Set(havingIds));
      setHavingWuzifFilterActive(true);
      toast.success(
        `Having Wuzif check complete: ${havingIds.length} of ${allIds.length} bills have unpaid previous-month bills.`
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to check for having wuzif.";
      toast.error(msg);
    } finally {
      setIsCheckingHavingWuzif(false);
    }
  };

  const handleClearHavingWuzifFilter = () => {
    setHavingWuzifFilterActive(false);
    setHavingWuzifReadingIdSet(new Set());
  };

  // ===== Check Wuzif List Handler (bills in wuzif table with deleted='active') =====
  const handleCheckWuzifList = async () => {
    const sourceBills = Array.isArray(filteredData) ? filteredData : [];
    if (!sourceBills.length) {
      toast.info("No filtered bills to check.");
      return;
    }

    const allIds = sourceBills
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found in filtered data.");
      return;
    }

    setIsCheckingWuzifList(true);
    try {
      const result = await readingService.checkWuzifList(allIds);
      const listIds = result?.wuzifListReadingIds || [];
      setWuzifListReadingIdSet(new Set(listIds));
      setWuzifListFilterActive(true);
      toast.success(
        `Wuzif List check complete: ${listIds.length} of ${allIds.length} bills found in wuzif table (deleted=active).`
      );
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to check wuzif list.";
      toast.error(msg);
    } finally {
      setIsCheckingWuzifList(false);
    }
  };

  const handleClearWuzifListFilter = () => {
    setWuzifListFilterActive(false);
    setWuzifListReadingIdSet(new Set());
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
    getRowId: (row) => String(row.id),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: { isLoading, showAlertBanner: isError, showProgressBars: isLoading, rowSelection },
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => setViewReadingId(row.original.id)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={row.original?.moneyCollected ? "Cannot void: already collected" : "Void Bill (Revert to Reading)"}>
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={row.original?.moneyCollected || row.original?.isVoid || voidBillsMutation.isPending}
              onClick={() => handleOpenVoidSingle(row.original)}
            >
              <CancelPresentationIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Bill Support" />

      <Grid container spacing={3} mt={1}>
        {/* Billing Period Selection Panel (Pro Period Picker) */}
        <Grid item xs={12}>
          <Paper
            elevation={2}
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
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
                sx={{
                  px: 3.5,
                  height: 42,
                  fontWeight: "bold",
                  borderRadius: 2.5,
                  boxShadow: "0 2px 8px rgba(25, 118, 210, 0.25)",
                  textTransform: "none",
                }}
              >
                {isLoading ? <CircularProgress size={20} color="inherit" /> : "Load Bills"}
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Selected Period: <strong>{selectedKifyaWerMonth || "-"}, {selectedKifyaWerYear || "-"}</strong>
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Filters accordion Hub */}
        <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "text.primary" }}>
                Filter Parameters
              </Typography>
              {activeFiltersCount > 0 && (
                <Chip
                  size="small"
                  color="primary"
                  label={`${activeFiltersCount} active filter${activeFiltersCount > 1 ? "s" : ""}`}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>

            {activeFiltersCount > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                startIcon={<FilterAltOffIcon />}
                onClick={handleClearAllFilters}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Clear All Filters ({activeFiltersCount})
              </Button>
            )}
          </Box>

          <Accordion sx={{ borderRadius: "8px !important", mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "600", color: "primary.main" }}>
                1. Locality & Customer Type Filters
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Kebele</InputLabel>
                    <Select
                      value={selectedKebeleId}
                      label="Kebele"
                      onChange={(e) => {
                        setSelectedKebeleId(e.target.value);
                        setSelectedKetenaId("");
                      }}
                      disabled={isKebelesLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Kebeles</em></MenuItem>
                      {kebeles.map((kebele) => (
                        <MenuItem key={kebele.id} value={kebele.id}>{kebele.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Ketena</InputLabel>
                    <Select
                      value={selectedKetenaId}
                      label="Ketena"
                      onChange={(e) => setSelectedKetenaId(e.target.value)}
                      disabled={isKetenasLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Ketenas</em></MenuItem>
                      {ketenas.map((ketena) => (
                        <MenuItem key={ketena.id} value={ketena.id}>{ketena.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Branch</InputLabel>
                    <Select
                      value={selectedBranchId}
                      label="Branch"
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        setSelectedReaderId("");
                      }}
                      disabled={isBranchesLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Branches</em></MenuItem>
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Assigned Reader</InputLabel>
                    <Select
                      value={selectedReaderId}
                      label="Assigned Reader"
                      onChange={(e) => setSelectedReaderId(e.target.value)}
                      disabled={isReadersLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Readers</em></MenuItem>
                      {readers.map((reader) => (
                        <MenuItem key={reader.id} value={reader.id}>{reader.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Customer Type</InputLabel>
                    <Select
                      value={selectedCustomerTypeId}
                      label="Customer Type"
                      onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
                      disabled={isCustomerTypesLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Customer Types</em></MenuItem>
                      {customerTypes.map((ct) => (
                        <MenuItem key={ct.id} value={ct.id}>{ct.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Cashier</InputLabel>
                    <Select
                      value={selectedCashierId}
                      label="Cashier"
                      onChange={(e) => setSelectedCashierId(e.target.value)}
                      disabled={isCashiersLoading}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value=""><em>All Cashiers</em></MenuItem>
                      {cashiers.map((cashier) => (
                        <MenuItem key={cashier.id} value={cashier.id}>{cashier.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ borderRadius: "8px !important", mb: 1, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "600", color: "primary.main" }}>
                2. Status & Reconcile Filters
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Money Collected</InputLabel>
                    <Select
                      value={filterMoneyCollected}
                      label="Money Collected"
                      onChange={(e) => setFilterMoneyCollected(e.target.value)}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="true" sx={{ color: "success.main", fontWeight: 600 }}>
                        ● Collected
                      </MenuItem>
                      <MenuItem value="false" sx={{ color: "warning.main", fontWeight: 600 }}>
                        ○ Not Collected
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>Bank Sent</InputLabel>
                    <Select
                      value={filterBankSent}
                      label="Bank Sent"
                      onChange={(e) => setFilterBankSent(e.target.value)}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="sent" sx={{ color: "primary.main", fontWeight: 600 }}>
                        ● Sent to Bank
                      </MenuItem>
                      <MenuItem value="not_sent" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        ○ Not Sent
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl size="small" fullWidth sx={modernSelectSx}>
                    <InputLabel>SMS Status</InputLabel>
                    <Select
                      value={filterSmsSent}
                      label="SMS Status"
                      onChange={(e) => setFilterSmsSent(e.target.value)}
                      MenuProps={modernMenuProps}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="sent" sx={{ color: "info.main", fontWeight: 600 }}>
                        ● SMS Sent
                      </MenuItem>
                      <MenuItem value="not_sent" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        ○ Not Sent
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ borderRadius: "8px !important", mb: 2, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "600", color: "primary.main" }}>
                3. Advanced Numeric Operators (Wuzif, Consumption, Dry Waste)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                {/* Wuzif Filter Group */}
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>Wuzif Months</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 80, ...modernSelectSx }}>
                      <Select
                        value={wuzifMonthsOp}
                        onChange={(e) => setWuzifMonthsOp(e.target.value)}
                        MenuProps={modernMenuProps}
                        sx={{ fontWeight: "bold" }}
                      >
                        <MenuItem value="eq">{"="}</MenuItem>
                        <MenuItem value="lt">{"<"}</MenuItem>
                        <MenuItem value="gte">{"≥"}</MenuItem>
                        <MenuItem value="lte">{"≤"}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      type="number"
                      label="Count"
                      value={wuzifMonthsVal}
                      onChange={(e) => setWuzifMonthsVal(e.target.value)}
                      inputProps={{ min: 0 }}
                      sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
                      fullWidth
                    />
                  </Box>
                </Grid>

                {/* Zero Reading Filter Group */}
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>Zero Read Months</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 80, ...modernSelectSx }}>
                      <Select
                        value={zeroReadingMonthsOp}
                        onChange={(e) => setZeroReadingMonthsOp(e.target.value)}
                        MenuProps={modernMenuProps}
                        sx={{ fontWeight: "bold" }}
                      >
                        <MenuItem value="eq">{"="}</MenuItem>
                        <MenuItem value="lt">{"<"}</MenuItem>
                        <MenuItem value="gte">{"≥"}</MenuItem>
                        <MenuItem value="lte">{"≤"}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      type="number"
                      label="Count"
                      value={zeroReadingMonthsVal}
                      onChange={(e) => setZeroReadingMonthsVal(e.target.value)}
                      inputProps={{ min: 0 }}
                      sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
                      fullWidth
                    />
                  </Box>
                </Grid>

                {/* Consumption Filter Group */}
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>Consumption</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 80, ...modernSelectSx }}>
                      <Select
                        value={consumptionOp}
                        onChange={(e) => setConsumptionOp(e.target.value)}
                        MenuProps={modernMenuProps}
                        sx={{ fontWeight: "bold" }}
                      >
                        <MenuItem value="eq">{"="}</MenuItem>
                        <MenuItem value="lt">{"<"}</MenuItem>
                        <MenuItem value="gte">{"≥"}</MenuItem>
                        <MenuItem value="lte">{"≤"}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      type="number"
                      label="Value"
                      value={consumptionVal}
                      onChange={(e) => setConsumptionVal(e.target.value)}
                      inputProps={{ min: 0 }}
                      sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
                      fullWidth
                    />
                  </Box>
                </Grid>

                {/* Dry Waste Filter Group */}
                <Grid item xs={12} md={3}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>Dry Waste (AdditionalHisab)</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <FormControl size="small" sx={{ minWidth: 80, ...modernSelectSx }}>
                      <Select
                        value={additionalHisabOp}
                        onChange={(e) => setAdditionalHisabOp(e.target.value)}
                        MenuProps={modernMenuProps}
                        sx={{ fontWeight: "bold" }}
                      >
                        <MenuItem value="eq">{"="}</MenuItem>
                        <MenuItem value="lt">{"<"}</MenuItem>
                        <MenuItem value="gte">{"≥"}</MenuItem>
                        <MenuItem value="lte">{"≤"}</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      type="number"
                      label="Value"
                      value={additionalHisabVal}
                      onChange={(e) => setAdditionalHisabVal(e.target.value)}
                      inputProps={{ min: 0 }}
                      sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
                      fullWidth
                    />
                  </Box>
                </Grid>

                {/* Bill Corrections Sub-Group */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1, color: "primary.main" }}>
                    Bill Corrections & Status:
                  </Typography>
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
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Action Suite (Collapsible Panel) */}
        <Grid item xs={12}>
          <Accordion sx={{ borderRadius: "8px !important", mb: 2, boxShadow: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontWeight: "600", color: "primary.main" }}>
                Action Suite (Corrections, Reconcile, SMS, Reports & Exports)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
            {/* Card 1: Bill Corrections */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
                <CardHeader 
                  title="Bill Corrections" 
                  titleTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'primary.main' }}
                  sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f4f6f9' }}
                />
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 2, flexGrow: 1 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    disabled={isLoading || consumptionCorrectionMutation.isPending || !filteredData?.length}
                    onClick={() => handleOpenConsumptionDialog(null)}
                  >
                    Consumption Based (ADD)
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    color="secondary"
                    disabled={isLoading || consumptionCorrectionMutation.isPending || !filteredData?.length}
                    onClick={() => handleOpenConsumptionDialog(null, "SUB")}
                  >
                    Correction SUB
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    disabled={isLoading || averageInitMutation.isPending || !filteredData?.length}
                    onClick={handleOpenAverageInitDialog}
                    startIcon={averageInitMutation.isPending ? <CircularProgress size={16} /> : null}
                  >
                    Init Avg Consumption
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    color="error"
                    disabled={isLoading || voidBillsMutation.isPending || !filteredData?.length}
                    onClick={handleOpenVoidSelected}
                    startIcon={voidBillsMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <CancelPresentationIcon fontSize="small" />}
                    sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                  >
                    {selectedRows.length > 0 ? `Void Bills (${selectedRows.length})` : "Void Bills"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Reconcile & Verify */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
                <CardHeader 
                  title="Deduplication & Reconcile" 
                  titleTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'warning.main' }}
                  sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#fffde7' }}
                />
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 2, flexGrow: 1 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      fullWidth
                      disabled={isLoading || !filteredData?.length}
                      onClick={() => setShowDuplicatesOnly((prev) => !prev)}
                    >
                      {showDuplicatesOnly ? "Show All" : "Find Dups"}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      fullWidth
                      disabled={isLoading || isRemovingDuplicates || !filteredData?.length}
                      onClick={handleRemoveDuplicateBills}
                    >
                      {isRemovingDuplicates ? "Removing..." : "Remove Dups"}
                    </Button>
                  </Box>

                  {/* Wuzif occurrence */}
                  {!wuzifFilterActive ? (
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      fullWidth
                      disabled={isLoading || isCheckingWuzif || !filteredData?.length}
                      onClick={handleCheckWuzifOccurrence}
                      startIcon={isCheckingWuzif ? <CircularProgress size={14} /> : null}
                    >
                      Check Wuzif Occurrence
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      color="warning"
                      fullWidth
                      onClick={handleClearWuzifFilter}
                    >
                      Clear Wuzif ({wuzifReadingIdSet.size})
                    </Button>
                  )}

                  {/* Having Wuzif */}
                  {!havingWuzifFilterActive ? (
                    <Button
                      variant="outlined"
                      size="small"
                      color="info"
                      fullWidth
                      disabled={isLoading || isCheckingHavingWuzif || !filteredData?.length}
                      onClick={handleCheckForHavingWuzif}
                      startIcon={isCheckingHavingWuzif ? <CircularProgress size={14} /> : null}
                    >
                      Check for Having Wuzif
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      color="info"
                      fullWidth
                      onClick={handleClearHavingWuzifFilter}
                    >
                      Clear Having Wuzif ({havingWuzifReadingIdSet.size})
                    </Button>
                  )}

                  {/* Wuzif List check */}
                  {!wuzifListFilterActive ? (
                    <Button
                      variant="outlined"
                      size="small"
                      color="secondary"
                      fullWidth
                      disabled={isLoading || isCheckingWuzifList || !filteredData?.length}
                      onClick={handleCheckWuzifList}
                      startIcon={isCheckingWuzifList ? <CircularProgress size={14} /> : null}
                    >
                      Check Wuzif List
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      color="secondary"
                      fullWidth
                      onClick={handleClearWuzifListFilter}
                    >
                      Clear Wuzif List ({wuzifListReadingIdSet.size})
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: SMS Outbox */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
                <CardHeader 
                  title="SMS Messaging" 
                  titleTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'success.main' }}
                  sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#e8f5e9' }}
                />
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 2, flexGrow: 1 }}>
                  <FormControl size="small" fullWidth>
                    <EtDatePicker
                      label="SMS Due Date (EC)"
                      value={smsDueDateEC}
                      onChange={(val) => setSmsDueDateEC(val)}
                    />
                  </FormControl>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleExportSmsToExcel}
                    disabled={isExportingSmsExcel || !filteredData?.length || !smsDueDateEC}
                    fullWidth
                    sx={{ py: 1, fontWeight: "bold" }}
                  >
                    {isExportingSmsExcel ? <CircularProgress size={20} color="inherit" /> : "Export SMS Excel"}
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleSendBulkSms}
                    disabled={isBackendBulkSmsSending || !filteredData?.length || !smsDueDateEC}
                    fullWidth
                    sx={{ mt: "auto", py: 1, fontWeight: "bold" }}
                  >
                    {isBackendBulkSmsSending ? <CircularProgress size={20} color="inherit" /> : "Send SMS Notifications"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={handleOpenDirectMsgDialog}
                    disabled={isDirectMsgSending || isBackendBulkSmsSending || !filteredData?.length}
                    fullWidth
                    sx={{ py: 1, fontWeight: "bold" }}
                  >
                    {isDirectMsgSending ? <CircularProgress size={20} color="inherit" /> : "Send Direct Message"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 4: Reports & Exports */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
                <CardHeader 
                  title="Reports & Integration" 
                  titleTypographyProps={{ variant: 'subtitle2', fontWeight: 'bold', color: 'text.primary' }}
                  sx={{ pb: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#eceff1' }}
                />
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 2, flexGrow: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={handleExportToExcel}
                    disabled={!displayData?.length}
                  >
                    Export to Excel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    color="secondary"
                    onClick={handleExportWuzifReport}
                    disabled={isWuzifExporting || !displayData?.length}
                  >
                    {isWuzifExporting ? "Exporting..." : "Export Wuzif Report"}
                  </Button>
                  
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={handleExtraClick}
                      disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear}
                    >
                      Extra Reports
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      fullWidth
                      disabled={isLoading || isPreparingMobileCsv || !selectedReaderId || !filteredData?.length}
                      onClick={handlePrepareCsvForReader}
                    >
                      {isPreparingMobileCsv ? "CSV..." : "For Readers"}
                    </Button>
                  </Box>
                  
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
                </CardContent>
              </Card>
            </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Main Grid / MaterialReactTable */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" color="grey.800" sx={{ fontWeight: "bold" }}>
                Bill Records
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Filtered bills count: <strong>{nonVoidedCount.toLocaleString()}</strong>
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

      {/* Void Bills Confirmation Dialog */}
      <Dialog
        open={isVoidModalOpen}
        onClose={() => !voidBillsMutation.isPending && setIsVoidModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1, bgcolor: "#fff5f5", borderBottom: "1px solid #fed7d7" }}>
          <CancelPresentationIcon color="error" />
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: "bold", color: "#c53030", lineHeight: 1.2 }}>
              Void Bills & Revert to Readings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Reverse bill generation and return records to unbilled readings
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Alert severity="info" sx={{ fontSize: "0.85rem" }}>
            Reverting will remove the selected month&apos;s bill properties (calculated charges, tariffs, and invoice), resetting each record to <strong>isBillGenerated = false</strong>.
            All meter reading data (consumption, readings, cycle) and customer arrears/wuzif history are completely preserved, and the records will immediately appear in <strong>Registered Readings (readingList)</strong> ready for <em>&quot;Generate Bill for Selected&quot;</em>.
          </Alert>

          {(() => {
            const eligibleCount = billsToVoid.filter((b) => !b.moneyCollected && !b.isVoid).length;
            const blockedCount = billsToVoid.length - eligibleCount;

            return (
              <>
                <Stack direction="row" spacing={2} sx={{ bgcolor: "#f8fafc", p: 1.5, borderRadius: 1, border: "1px solid #e2e8f0" }}>
                  <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">Total Selected</Typography>
                    <Typography variant="h6" fontWeight="bold">{billsToVoid.length}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="caption" color="success.main" fontWeight="bold">Eligible to Void</Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">{eligibleCount}</Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography variant="caption" color={blockedCount > 0 ? "error.main" : "text.secondary"} fontWeight={blockedCount > 0 ? "bold" : "normal"}>
                      Blocked (Paid)
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color={blockedCount > 0 ? "error.main" : "text.secondary"}>
                      {blockedCount}
                    </Typography>
                  </Box>
                </Stack>

                {blockedCount > 0 && (
                  <Alert severity="warning" sx={{ fontSize: "0.825rem" }}>
                    <strong>{blockedCount} bill(s)</strong> have already received payment or are void and cannot be reverted. They will be skipped automatically to safeguard accounting integrity.
                  </Alert>
                )}

                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                    Bills to be reverted ({billsToVoid.length}):
                  </Typography>
                  <Box
                    sx={{
                      maxHeight: 220,
                      overflowY: "auto",
                      border: "1px solid #e2e8f0",
                      borderRadius: 1,
                      p: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      bgcolor: "#ffffff",
                    }}
                  >
                    {billsToVoid.map((bill, index) => {
                      const isBlocked = bill.moneyCollected || bill.isVoid;
                      const accNo = bill.customerAccountNumber || bill.accountNumber || "N/A";
                      const custName = bill.customerName || bill.name || "Customer";
                      const invNo = bill.invoiceNumber || "-";
                      const amount = typeof bill.tekilalaTekefay === "number" ? bill.tekilalaTekefay.toFixed(2) : bill.tekilalaTekefay || "0.00";
                      const cons = bill.consumption !== undefined ? bill.consumption : "-";

                      return (
                        <Box
                          key={bill.id || index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            p: 1,
                            borderRadius: 1,
                            bgcolor: isBlocked ? "#fff5f5" : "#f0fdf4",
                            border: `1px solid ${isBlocked ? "#fed7d7" : "#bbf7d0"}`,
                          }}
                        >
                          <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {custName} ({accNo})
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Inv: {invNo} | Cons: {cons} m³ | Total: {amount} ETB
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={isBlocked ? "Paid / Skip" : "Ready to Void"}
                            color={isBlocked ? "default" : "success"}
                            variant={isBlocked ? "outlined" : "filled"}
                            sx={{ fontWeight: "bold", fontSize: "0.7rem" }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc" }}>
          <Button
            onClick={() => setIsVoidModalOpen(false)}
            disabled={voidBillsMutation.isPending}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmVoidBills}
            disabled={
              voidBillsMutation.isPending ||
              billsToVoid.filter((b) => !b.moneyCollected && !b.isVoid).length === 0
            }
            variant="contained"
            color="error"
            startIcon={
              voidBillsMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CancelPresentationIcon fontSize="small" />
              )
            }
          >
            {voidBillsMutation.isPending
              ? "Reverting..."
              : `Confirm & Void (${billsToVoid.filter((b) => !b.moneyCollected && !b.isVoid).length})`}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Direct Message Dialog */}
      <Dialog
        open={isDirectMsgDialogOpen}
        onClose={() => !isDirectMsgSending && setIsDirectMsgDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Direct Message</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Type a custom message to send directly to {filteredData?.length || 0} filtered customers via SMS.
            </Typography>
            <TextField
              label="Message"
              multiline
              minRows={3}
              maxRows={6}
              fullWidth
              value={directMsgText}
              onChange={(e) => {
                if (e.target.value.length <= DIRECT_MSG_MAX_CHARS) {
                  setDirectMsgText(e.target.value);
                }
              }}
              placeholder="Enter your message here..."
              helperText={
                `${directMsgText.length} / ${DIRECT_MSG_MAX_CHARS} characters` +
                (directMsgText.length > 0 ? ` (${getSmsParts(directMsgText)} SMS)` : "")
              }
              error={directMsgText.length > DIRECT_MSG_MAX_CHARS}
              FormHelperTextProps={{
                sx: {
                  color: directMsgText.length > DIRECT_MSG_MAX_CHARS
                    ? "error.main"
                    : directMsgText.length > 70
                      ? "warning.main"
                      : "text.secondary",
                  fontWeight: "bold",
                },
              }}
            />
            {directMsgText.length > 70 && directMsgText.length <= DIRECT_MSG_MAX_CHARS && (
              <Typography variant="caption" color="warning.main">
                ⚠ Message will be sent as 2 SMS parts (concatenated).
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDirectMsgDialogOpen(false)}
            disabled={isDirectMsgSending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSendDirectMessage}
            disabled={
              isDirectMsgSending ||
              !directMsgText.trim() ||
              directMsgText.length > DIRECT_MSG_MAX_CHARS
            }
            startIcon={isDirectMsgSending ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {isDirectMsgSending ? "Sending..." : "Send SMS"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

const BillSupportPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillSupport />
  </QueryClientProvider>
);

export default BillSupportPage;
