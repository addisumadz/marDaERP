"use client";
import { useMemo, useState, useEffect, useDeferredValue, useRef, useCallback, Component } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  LinearProgress,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  Alert,
} from "@mui/material";

import * as XLSX from "xlsx";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TimelineIcon from "@mui/icons-material/Timeline";
import BoltIcon from "@mui/icons-material/Bolt";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { QueryClient, QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "../../../lib/ReadingService";
import { ETH_MONTHS_AM } from "@/app/helpers/constants";
import { DropdownService } from "../../../lib/dropdownService";
import { CustomerService } from "../../../lib/customerService";
import { CompanyProfileService } from "../../../lib/companyProfileService";

import ViewBillDetailModal from "./ViewBillDetailModal";
import ReadingDetailModal from "../../components/ReadingDetailModal";
import bankDerashService from "@/app/lib/bankDerashService";
import bankPaymentImportService from "@/app/lib/bankPaymentImportService";
import getSession from "@/app/lib/getSession";
import { exportReadingsToPDF, exportCustomersWithoutReadingPDF } from "./readingReportPdf";
const ethiopianDate = require("ethiopian-date");

// Sub-components
import ReadingFilters from "./ReadingFilters";
import ReadingToolbar from "./ReadingToolbar";
import CustomersWithoutReadingToolbar from "./CustomersWithoutReadingToolbar";
import BulkPreviewDialog from "./BulkPreviewDialog";
import BulkDirectProgressDialog from "./BulkDirectProgressDialog";
import BillGenerationProgressDialog from "./BillGenerationProgressDialog";
import {
  AddNewReadingModal,
  EditReadingModal,
  DeleteReadingDialog,
  CalcPreviewDialog,
} from "./ReadingModals";
import StrategyActions from "./StrategyActions";

// Singleton service instances
const readingService = new ReadingService();
const dropdownService = new DropdownService();
const customerService = new CustomerService();
const companyProfileService = new CompanyProfileService();

// ===== Error Boundary =====
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" color="error">Something went wrong</Typography>
          <Typography variant="body2">{this.state.error?.message}</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ===== Debounce Hook (module-level) =====
const useDebounce = (value, delay = 250) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

// ===== Main BillList Component =====
const BillList = () => {
  // ─── Period State ───
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [currentCycleMonth, setCurrentCycleMonth] = useState("");
  const [currentCycleYear, setCurrentCycleYear] = useState("");

  // ─── System Day Restriction ───
  const [isRestrictedBySystemDay, setIsRestrictedBySystemDay] = useState(true); // default to locked until profile loads

  // ─── Duplicates Filter State ───
  const [showOnlyDuplicatesReadings, setShowOnlyDuplicatesReadings] = useState(false);
  const [showOnlyDuplicatesWithoutReading, setShowOnlyDuplicatesWithoutReading] = useState(false);

  // ─── Modal State ───
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState(null);
  const [previousReadingForModal, setPreviousReadingForModal] = useState(null);
  const [customerForAdd, setCustomerForAdd] = useState(null);

  // ─── Pro Workspace Tab (0: Bill Preparation & Invoicing, 1: Meter Reading & Missing) ───
  const [activeTab, setActiveTab] = useState(0);

  // ─── Calc Preview Modal ───
  const [calcPreviewOpen, setCalcPreviewOpen] = useState(false);
  const [calcPreviewData, setCalcPreviewData] = useState(null);

  // ─── Dropdown Filter State ───
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [wuzifMonthsOp, setWuzifMonthsOp] = useState("eq");
  const [wuzifMonthsVal, setWuzifMonthsVal] = useState("");

  // ─── Row Selection ───
  const [rowSelection, setRowSelection] = useState({});
  const [rowSelectionWithout, setRowSelectionWithout] = useState({});

  // ─── Bulk Apply State ───
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStrategy, setBulkStrategy] = useState("repeat");
  const [bulkComputing, setBulkComputing] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkProcessed, setBulkProcessed] = useState(0);
  const [missingExcelAccounts, setMissingExcelAccounts] = useState([]);
  const [negativeExcelItems, setNegativeExcelItems] = useState([]);

  // ─── Direct Bulk Apply (Server) State ───
  const [directBulkOpen, setDirectBulkOpen] = useState(false);
  const [directBulkStrategy, setDirectBulkStrategy] = useState("repeat");
  const [directBulkJobId, setDirectBulkJobId] = useState(null);
  const [directBulkProgressInfo, setDirectBulkProgressInfo] = useState(null);
  const [directBulkLogs, setDirectBulkLogs] = useState([]);
  const directBulkTimerRef = useRef(null);
  const directBulkPollInFlightRef = useRef(false);

  // ─── Bill Generation Modal Progress State ───
  const [billGenOpen, setBillGenOpen] = useState(false);
  const [billGenJobId, setBillGenJobId] = useState(null);
  const [billGenProgressInfo, setBillGenProgressInfo] = useState(null);
  const [billGenLogs, setBillGenLogs] = useState([]);
  const billGenTimerRef = useRef(null);
  const billGenPollInFlightRef = useRef(false);

  // ─── Excel Import ───
  const fileInputRef = useRef(null);
  const [importingExcel, setImportingExcel] = useState(false);

  // ─── Bank Payment State ───
  const [bankProcessResult, setBankProcessResult] = useState(null);
  const [bankProcessing, setBankProcessing] = useState(false);
  const [bankFromDate, setBankFromDate] = useState("");
  const [bankToDate, setBankToDate] = useState("");

  // ─── ReadingDetailModal State ───
  const [viewReadingId, setViewReadingId] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ─── Ethiopian Date ───
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const { data: profileData } = useQuery({
    queryKey: ["company-profile-latest"],
    queryFn: async () => {
      const latest = await companyProfileService.getLatest();
      const hasLatest = latest && typeof latest === "object" && Object.keys(latest).length > 0;
      if (hasLatest) return latest;
      try {
        return await companyProfileService.getById(9);
      } catch (e) {
        return latest;
      }
    },
    refetchOnWindowFocus: false,
  });

  const yearOptions = useMemo(() => {
    const baseYear = selectedKifyaWerYear ? Number(selectedKifyaWerYear) : ethYear;
    const years = [];
    for (let i = baseYear - 5; i <= baseYear + 1; i++) years.push(i);
    return years;
  }, [selectedKifyaWerYear, ethYear]);

  useEffect(() => {
    if (profileData) {
      const payload = profileData && typeof profileData === "object" && "data" in profileData && profileData.data && typeof profileData.data === "object"
        ? profileData.data
        : profileData;

      // Determine if month/year selection should be restricted
      const restricted = payload?.filename3 === "1" || payload?.filename3 === true;
      setIsRestrictedBySystemDay(restricted);

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
          setCurrentCycleYear(eYear);
          setSelectedKifyaWerMonth(cycleMonth);
          setSelectedKifyaWerYear(eYear);
          return;
        } catch (e) {
          console.error("Error parsing activeBillingMonth:", e);
        }
      }
    }

    const monthIndex = Math.min(ethMonth, 12) - 1;
    const cycleMonth = ETH_MONTHS_AM[monthIndex];
    setCurrentCycleMonth(cycleMonth);
    setCurrentCycleYear(ethYear);
    setSelectedKifyaWerMonth(cycleMonth);
    setSelectedKifyaWerYear(ethYear);
  }, [profileData, ethYear, ethMonth]);

  // ─── Debounced filter values ───
  const dCustomerTypeId = useDebounce(selectedCustomerTypeId);
  const dKebeleId = useDebounce(selectedKebeleId);
  const dKetenaId = useDebounce(selectedKetenaId);
  const dBranchId = useDebounce(selectedBranchId);
  const dReaderId = useDebounce(selectedReaderId);

  const dfCustomerTypeId = useDeferredValue(dCustomerTypeId);
  const dfKebeleId = useDeferredValue(dKebeleId);
  const dfKetenaId = useDeferredValue(dKetenaId);
  const dfBranchId = useDeferredValue(dBranchId);
  const dfReaderId = useDeferredValue(dReaderId);

  const anyDropdownSelected = useMemo(
    () => Boolean(dfCustomerTypeId || dfKebeleId || dfKetenaId || dfBranchId || dfReaderId),
    [dfCustomerTypeId, dfKebeleId, dfKetenaId, dfBranchId, dfReaderId]
  );

  // ═══════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════
  const queryOpts = {
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    keepPreviousData: true,
  };
  const dropdownQueryOpts = { ...queryOpts, staleTime: 60 * 60 * 1000, gcTime: 2 * 60 * 60 * 1000 };

  const {
    data: readings = [],
    isLoading,
    isFetching: isFetchingReadings,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["filteredReadings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        return readingService.getFilteredReadings("ACTIVE", `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`);
      }
      return [];
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    ...queryOpts,
  });

  const {
    data: customersWithoutReading = [],
    isLoading: isLoadingWithoutReading,
    isFetching: isFetchingWithoutReading,
    isError: isErrorWithoutReading,
    refetch: refetchWithoutReading,
  } = useQuery({
    queryKey: ["customersWithoutReading", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        return readingService.getCustomersWithoutReading(`${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`);
      }
      return [];
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    ...queryOpts,
  });

  const {
    data: billedCountServer = 0,
    isFetching: isFetchingBilledCount,
    refetch: refetchBilledCount,
  } = useQuery({
    queryKey: ["billedCountServer", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        return readingService.getBilledCount(`${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`);
      }
      return 0;
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    ...queryOpts,
  });

  // ─── Distinct Kifya Wer Periods Query (from DB) ───
  const { data: dbPeriods = [] } = useQuery({
    queryKey: ["distinctKifyaWer"],
    queryFn: () => readingService.getDistinctKifyaWerList(),
    staleTime: 15 * 60 * 1000,
  });

  // ─── Dropdown Data Queries ───
  const { data: kebeles = [], isLoading: isKebelesLoading, isFetching: isKebelesFetching } = useQuery({
    queryKey: ["kebeles"], queryFn: () => dropdownService.getKebeles(), ...dropdownQueryOpts,
  });
  const { data: branches = [], isLoading: isBranchesLoading, isFetching: isBranchesFetching } = useQuery({
    queryKey: ["branches"], queryFn: () => dropdownService.getBranches(), ...dropdownQueryOpts,
  });
  const { data: customerTypes = [], isLoading: isCustomerTypesLoading, isFetching: isCustomerTypesFetching } = useQuery({
    queryKey: ["customerTypes"], queryFn: () => dropdownService.getCustomerTypes(), ...dropdownQueryOpts,
  });
  const { data: ketenas = [], isLoading: isKetenasLoading, isFetching: isKetenasFetching } = useQuery({
    queryKey: ["ketenas", selectedKebeleId],
    queryFn: () => dropdownService.getKetenasByKebele(selectedKebeleId),
    ...dropdownQueryOpts,
  });
  const { data: readers = [], isLoading: isReadersLoading, isFetching: isReadersFetching } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => (selectedBranchId ? dropdownService.getReadersByBranch(selectedBranchId) : []),
    enabled: !!selectedBranchId,
    ...dropdownQueryOpts,
  });

  const anyDropdownLoading =
    (isKebelesLoading || isKebelesFetching) ||
    (isBranchesLoading || isBranchesFetching) ||
    (isCustomerTypesLoading || isCustomerTypesFetching) ||
    (isKetenasLoading || isKetenasFetching) ||
    (isReadersLoading || isReadersFetching);

  // ─── All Customers query disabled for 20K+ performance; readings already include customer joins ───
  const { data: allCustomers = [] } = useQuery({
    queryKey: ["customers-all-for-filter"],
    queryFn: () => customerService.getAllCustomers(),
    enabled: false,
    ...queryOpts,
  });

  const customerByAccount = useMemo(() => {
    const map = new Map();
    for (const c of allCustomers || []) {
      if (c?.accountNumber) map.set(String(c.accountNumber), c);
    }
    return map;
  }, [allCustomers]);

  // ═══════════════════════════════════════════
  // ENRICHED + FILTERED DATA
  // ═══════════════════════════════════════════
  const enrichedCustomersWithoutReading = useMemo(() => {
    if (!customersWithoutReading?.length) return [];
    if (!anyDropdownSelected || customerByAccount.size === 0) return customersWithoutReading;
    return customersWithoutReading.map((c) => {
      const key = c?.accountNumber ?? c?.customerAccountNumber;
      const full = key ? customerByAccount.get(String(key)) : null;
      return {
        ...c,
        phoneNumber: c?.phoneNumber || full?.phoneNumber || full?.phone || "",
        customerTypeId: full?.customerTypeId ?? c?.customerTypeId,
        addressStreetsId: full?.addressStreetsId ?? c?.addressStreetsId,
        addressKetenaId: full?.addressKetenaId ?? c?.addressKetenaId,
        branchsId: full?.branchsId ?? c?.branchsId,
        assignedReaderId: full?.assignedReaderId ?? c?.assignedReaderId,
      };
    });
  }, [customersWithoutReading, anyDropdownSelected, customerByAccount]);

  const enrichedReadings = useMemo(() => {
    if (!readings?.length) return [];
    if (!anyDropdownSelected || customerByAccount.size === 0) return readings;
    return readings.map((r) => {
      const cust = r?.customerAccountNumber ? customerByAccount.get(String(r.customerAccountNumber)) : null;
      return {
        ...r,
        customerPhoneNumber: r?.customerPhoneNumber || cust?.phoneNumber || cust?.phone || "",
        customerTypeId: cust?.customerTypeId ?? r?.customerTypeId,
        addressStreetsId: cust?.addressStreetsId ?? r?.addressStreetsId,
        addressKetenaId: cust?.addressKetenaId ?? r?.addressKetenaId,
        branchsId: cust?.branchsId ?? r?.branchsId,
        assignedReaderId: cust?.assignedReaderId ?? r?.assignedReaderId,
      };
    });
  }, [readings, anyDropdownSelected, customerByAccount]);

  // Client-side filter helper
  const getVal = (obj, paths) => {
    for (const p of paths) {
      const val = p.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
      if (val !== null && val !== undefined) return val;
    }
    return null;
  };

  const applyDropdownFilters = (data) => {
    let result = [...data];
    if (dfCustomerTypeId) {
      result = result.filter((c) => {
        const v = getVal(c, ["customerTypeId", "customerType.id", "billingCustomerTypeId"]);
        return v != null && String(v) === String(dfCustomerTypeId);
      });
    }
    if (dfKebeleId) {
      result = result.filter((c) => {
        const v = getVal(c, [
          "customerKebeleId",
          "addressStreetId",
          "addressStreetsId",
          "kebeleId",
          "addressStreet.id",
          "addressStreets.id",
          "address.kebeleId",
        ]);
        return v != null && String(v) === String(dfKebeleId);
      });
    }
    if (dfKetenaId) {
      result = result.filter((c) => {
        const v = getVal(c, [
          "addressKetenaId",
          "ketenaId",
          "addressKetena.id",
          "address.ketenaId",
        ]);
        return v != null && String(v) === String(dfKetenaId);
      });
    }
    if (dfBranchId) {
      result = result.filter((c) => {
        const v = getVal(c, ["branchsId", "branchId", "branch.id"]);
        return v != null && String(v) === String(dfBranchId);
      });
    }
    if (dfReaderId) {
      result = result.filter((c) => {
        const v = getVal(c, ["assignedReaderId", "readerId", "assignedReader.id", "userAccountId"]);
        return v != null && String(v) === String(dfReaderId);
      });
    }
    return result;
  };

  const filteredCustomersWithoutReading = useMemo(() => {
    if (!anyDropdownSelected) return customersWithoutReading || [];
    return applyDropdownFilters(enrichedCustomersWithoutReading);
  }, [customersWithoutReading, enrichedCustomersWithoutReading, anyDropdownSelected, dfCustomerTypeId, dfKebeleId, dfKetenaId, dfBranchId, dfReaderId]);

  const filteredReadings = useMemo(() => {
    let result = anyDropdownSelected ? [...enrichedReadings] : [...(readings || [])];
    if (anyDropdownSelected) result = applyDropdownFilters(result);
    if (wuzifMonthsVal !== "" && !isNaN(Number(wuzifMonthsVal))) {
      const target = Number(wuzifMonthsVal);
      result = result.filter((r) => {
        const val = Number(r?.wuzifWorBzat ?? NaN);
        if (Number.isNaN(val)) return false;
        return wuzifMonthsOp === "gte" ? val >= target : wuzifMonthsOp === "lt" ? val < target : val === target;
      });
    }
    return result;
  }, [readings, enrichedReadings, anyDropdownSelected, dfCustomerTypeId, dfKebeleId, dfKetenaId, dfBranchId, dfReaderId, wuzifMonthsOp, wuzifMonthsVal]);

  const finalFilteredReadings = useMemo(() => {
    if (!showOnlyDuplicatesReadings) return filteredReadings;
    const counts = new Map();
    for (const r of filteredReadings) {
      const acc = String(r?.customerAccountNumber || "").trim();
      if (acc) {
        counts.set(acc, (counts.get(acc) || 0) + 1);
      }
    }
    return filteredReadings.filter((r) => {
      const acc = String(r?.customerAccountNumber || "").trim();
      return acc && counts.get(acc) > 1;
    });
  }, [filteredReadings, showOnlyDuplicatesReadings]);

  const finalFilteredCustomersWithoutReading = useMemo(() => {
    if (!showOnlyDuplicatesWithoutReading) return filteredCustomersWithoutReading;
    const counts = new Map();
    for (const c of filteredCustomersWithoutReading) {
      const acc = String(c?.accountNumber || "").trim();
      if (acc) {
        counts.set(acc, (counts.get(acc) || 0) + 1);
      }
    }
    return filteredCustomersWithoutReading.filter((c) => {
      const acc = String(c?.accountNumber || "").trim();
      return acc && counts.get(acc) > 1;
    });
  }, [filteredCustomersWithoutReading, showOnlyDuplicatesWithoutReading]);

  const totalConsumption = useMemo(() => {
    if (!Array.isArray(finalFilteredReadings) || finalFilteredReadings.length === 0) return 0;
    return finalFilteredReadings.reduce((sum, r) => {
      const val = Number(r?.consumption ?? 0);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
  }, [finalFilteredReadings]);

  // Executive KPI summary stats for billing cycle
  const kpiStats = useMemo(() => {
    // Readings in Table 1: Recorded readings where bill is not yet generated (Task 1)
    const pendingBillCount = finalFilteredReadings?.length ?? readings?.length ?? 0;
    // Billed readings for this period obtained directly from index-backed count
    const billedCount = Number(billedCountServer || 0);
    // Total readings taken for this cycle = already invoiced + pending generation
    const totalRecordedReadings = billedCount + pendingBillCount;
    // Missing meter readings that have not yet been recorded (Task 2)
    const missingReadings = finalFilteredCustomersWithoutReading?.length ?? customersWithoutReading?.length ?? 0;
    // Entire customer base in billing cycle
    const totalAccounts = totalRecordedReadings + missingReadings;
    const pendingCoveragePct = totalAccounts > 0 ? Math.round((pendingBillCount / totalAccounts) * 100) : 0;
    const billingCoveragePct = totalRecordedReadings > 0 ? Math.round((billedCount / totalRecordedReadings) * 100) : 0;

    return {
      totalAccounts,
      totalReadings: pendingBillCount, // "Readings Recorded" card displays have-reading-but-unbilled (same as Task 1)
      totalRecordedReadings,
      billedCount,
      pendingBillCount,
      missingReadings,
      pendingCoveragePct,
      billingCoveragePct,
    };
  }, [finalFilteredReadings, readings, customersWithoutReading, finalFilteredCustomersWithoutReading, billedCountServer]);

  const getPreparerName = () => {
    try {
      const session = getSession && getSession();
      if (session && typeof session === "object") {
        return (
          (session.user && (session.user.name || session.user.username)) ||
          session.name ||
          session.username ||
          "System User"
        );
      }
    } catch {}
    return "System User";
  };

  const currentFilterContext = useMemo(() => {
    const selectedCustTypeObj = Array.isArray(customerTypes) ? customerTypes.find((c) => String(c.id) === String(dfCustomerTypeId || selectedCustomerTypeId)) : null;
    const customerTypeName = selectedCustTypeObj ? (selectedCustTypeObj.name || selectedCustTypeObj.customerType || `Type ${selectedCustTypeObj.id}`) : "ሁሉም";

    const selectedKebeleObj = Array.isArray(kebeles) ? kebeles.find((k) => String(k.id) === String(dfKebeleId || selectedKebeleId)) : null;
    const kebeleName = selectedKebeleObj ? (selectedKebeleObj.name || selectedKebeleObj.streetsName || `Kebele ${selectedKebeleObj.id}`) : "ሁሉም";

    const selectedKetenaObj = Array.isArray(ketenas) ? ketenas.find((k) => String(k.id) === String(dfKetenaId || selectedKetenaId)) : null;
    const ketenaName = selectedKetenaObj ? (selectedKetenaObj.name || selectedKetenaObj.ketenaName || `Ketena ${selectedKetenaObj.id}`) : "ሁሉም";

    const selectedBranchObj = Array.isArray(branches) ? branches.find((b) => String(b.id) === String(dfBranchId || selectedBranchId)) : null;
    const branchName = selectedBranchObj ? (selectedBranchObj.name || selectedBranchObj.branchDescription || `Branch ${selectedBranchObj.id}`) : "ሁሉም";

    const selectedReaderObj = Array.isArray(readers) ? readers.find((r) => String(r.id) === String(dfReaderId || selectedReaderId)) : null;
    let readerName = "ሁሉም";
    if (selectedReaderObj) {
      readerName = selectedReaderObj.name || selectedReaderObj.fullName || [selectedReaderObj.firstName, selectedReaderObj.midleName, selectedReaderObj.lastName].filter(Boolean).join(" ") || String(selectedReaderObj.id);
    }

    return {
      customerTypeName,
      kebeleName,
      ketenaName,
      branchName,
      readerName,
    };
  }, [customerTypes, dfCustomerTypeId, selectedCustomerTypeId, kebeles, dfKebeleId, selectedKebeleId, ketenas, dfKetenaId, selectedKetenaId, branches, dfBranchId, selectedBranchId, readers, dfReaderId, selectedReaderId]);

  // ═══════════════════════════════════════════
  // MUTATIONS
  // ═══════════════════════════════════════════
  const addReadingMutation = useMutation({
    mutationFn: ({ customerAccountNumber, lastReading, kifyaWer, previousReading }) =>
      readingService.addReading(customerAccountNumber, lastReading, kifyaWer, previousReading),
    onSuccess: () => { toast.success("Reading added successfully!"); refetch(); refetchWithoutReading(); },
    onError: (error) => toast.error(`Error adding reading: ${error.message}`),
  });

  const updateReadingMutation = useMutation({
    mutationFn: (updatedReading) => readingService.updateReading(updatedReading.id, updatedReading),
    onSuccess: () => { toast.success("Reading updated successfully!"); refetch(); refetchWithoutReading(); },
    onError: (error) => toast.error(`Error updating reading: ${error.message}`),
  });

  const deleteReadingMutation = useMutation({
    mutationFn: (id) => readingService.deleteReading(id),
    onSuccess: () => { toast.success("Reading deleted successfully!"); refetch(); refetchWithoutReading(); },
    onError: (error) => toast.error(`Error deleting reading: ${error.message}`),
  });

  const handleCloseBillGen = () => {
    if (billGenTimerRef.current) {
      clearInterval(billGenTimerRef.current);
      billGenTimerRef.current = null;
    }
    setBillGenOpen(false);
    setBillGenJobId(null);
    setBillGenProgressInfo(null);
    setBillGenLogs([]);
  };

  const isBillGenRunning = Boolean(
    billGenProgressInfo &&
    !billGenProgressInfo.done &&
    billGenProgressInfo.status !== "DONE" &&
    billGenProgressInfo.status !== "ERROR"
  );
  const isBillGenBusy = Boolean(isBillGenRunning || billGenJobId);

  const startBillGeneration = async (ids) => {
    if (!ids || ids.length === 0) {
      toast.warn("Select at least one row to generate bills.");
      return;
    }

    setBillGenOpen(true);
    setBillGenLogs([]);
    setBillGenProgressInfo({
      total: ids.length,
      processed: 0,
      percent: 0,
      done: false,
      status: "RUNNING",
      message: `Starting bill generation for ${ids.length} reading${ids.length > 1 ? "s" : ""}...`,
    });

    try {
      const res = await readingService.startGenerateAsync(ids);
      const jobId = res?.jobId;
      if (!jobId) throw new Error("No jobId received from backend.");
      setBillGenJobId(jobId);

      if (billGenTimerRef.current) {
        clearInterval(billGenTimerRef.current);
        billGenTimerRef.current = null;
      }

      billGenTimerRef.current = setInterval(async () => {
        if (billGenPollInFlightRef.current) return;
        billGenPollInFlightRef.current = true;
        try {
          const [info, logRes] = await Promise.all([
            readingService.getProgress(jobId),
            readingService.getProgressLogs(jobId),
          ]);

          if (info) {
            setBillGenProgressInfo(info);
          }
          if (logRes?.logs && Array.isArray(logRes.logs)) {
            setBillGenLogs(logRes.logs);
          }

          if (info?.done || info?.status === "DONE" || info?.status === "ERROR") {
            if (billGenTimerRef.current) {
              clearInterval(billGenTimerRef.current);
              billGenTimerRef.current = null;
            }

            if (info?.status === "ERROR" || (info?.message && info.message.includes("0 bills"))) {
              toast.error(info?.message || "Failed to generate bills for selected readings.");
            } else {
              toast.success(info?.message || "Bills generated successfully!");
              setRowSelection({});
              Promise.allSettled([refetch(), refetchWithoutReading(), refetchBilledCount()]);
            }
          }
        } catch (pollErr) {
          if (pollErr?.status === 404 || pollErr?.status === 410) {
            if (billGenTimerRef.current) {
              clearInterval(billGenTimerRef.current);
              billGenTimerRef.current = null;
            }
          }
        } finally {
          billGenPollInFlightRef.current = false;
        }
      }, 700);
    } catch (err) {
      toast.error(err.message || "Failed to start bill generation.");
      setBillGenProgressInfo({
        total: ids.length,
        processed: 0,
        percent: 0,
        done: true,
        status: "ERROR",
        message: err.message || "Failed to start bill generation.",
      });
    }
  };

  // Cleanup polling on unmount
  useEffect(() => () => {
    if (billGenTimerRef.current) { clearInterval(billGenTimerRef.current); billGenTimerRef.current = null; }
    if (directBulkTimerRef.current) { clearInterval(directBulkTimerRef.current); directBulkTimerRef.current = null; }
  }, []);

  // ═══════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════
  const handlePeriodChange = useCallback((newMonth, newYear) => {
    setSelectedKifyaWerMonth(newMonth);
    setSelectedKifyaWerYear(newYear);
  }, []);

  const handleFilterClick = () => {
    if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      refetch();
      refetchWithoutReading();
      refetchBilledCount();
    }
    else toast.info("Please select both a month and a year to filter.");
  };

  const handleFilterChange = (name, value) => {
    const setters = {
      selectedCustomerTypeId: setSelectedCustomerTypeId,
      selectedKebeleId: setSelectedKebeleId,
      selectedKetenaId: setSelectedKetenaId,
      selectedBranchId: setSelectedBranchId,
      selectedReaderId: setSelectedReaderId,
    };
    setters[name]?.(value);
  };

  const handleClearAllFilters = () => {
    setSelectedCustomerTypeId(""); setSelectedKebeleId(""); setSelectedKetenaId("");
    setSelectedBranchId(""); setSelectedReaderId("");
  };

  // ─── Bank Derash Handlers ───
  const handleFetchDerash = async () => {
    if (!bankFromDate || !bankToDate) { toast.error("Please select both from and to dates"); return; }
    try {
      setBankProcessing(true);
      const res = await bankDerashService.fetchByDateRange(bankFromDate, bankToDate);
      if (res?.success) toast.success("Fetched CSV successfully from Derash API");
      else toast.error("Fetch failed");
    } catch (e) { toast.error(e?.response?.data?.message || "Fetch failed"); }
    finally { setBankProcessing(false); }
  };

  const handleProcessDerash = async () => {
    if (!bankFromDate || !bankToDate) { toast.error("Please select both from and to dates"); return; }
    try {
      setBankProcessing(true);
      const res = await bankDerashService.processByDateRange(bankFromDate, bankToDate);
      setBankProcessResult(res);
      toast.success(`Processed ${res?.totalPaidCount || 0} CSV rows. Found ${res?.newPayments?.length || 0} new payments.`);
    } catch (e) {
      if (e?.response?.status === 404) toast.error("CSV file not found. Please fetch data first.");
      else toast.error(e?.response?.data?.message || "Process failed");
    } finally { setBankProcessing(false); }
  };

  const handleApplyNewPayments = async () => {
    try {
      if (!bankProcessResult?.newPayments?.length) { toast.info("No new payments to apply"); return; }
      setBankProcessing(true);
      const updates = bankProcessResult.newPayments.map((p) => ({
        id: p.id,
        updates: {
          tekilalaYetekefele: p.tekilalaYetekefele, tekilalaBankYetekefele: p.tekilalaBankYetekefele,
          isPaidThroughBank: true, isDerashPaid: true, moneyCollectedDate: p.moneyCollectedDate,
          bankPaidConfirmationCode: p.bankPaidConfirmationCode, bankPaidAgentId: p.bankPaidAgentId,
        },
      }));
      const res = await bankPaymentImportService.updateBankPayments(updates);
      if (res?.success) { toast.success(`Updated ${updates.length} payments successfully`); await refetch(); setBankProcessResult(null); }
      else toast.error(res?.message || "Bulk update failed");
    } catch (e) { toast.error(e?.response?.data?.message || "Bulk update failed"); }
    finally { setBankProcessing(false); }
  };

  // ─── Modal Handlers ───
  const handleOpenAddReadingFromList = async (customer) => {
    setCustomerForAdd(customer);
    try {
      toast.info("Fetching previous reading...");
      const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      const prevReadingData = await readingService.getPreviousReading(customer.accountNumber, kifyaWerFormatted);
      setPreviousReadingForModal(prevReadingData.previousReading ?? prevReadingData);
      setAddModalOpen(true);
    } catch (error) {
      toast.error(error.message || "Could not fetch previous reading.");
      setAddModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setAddModalOpen(false); setEditModalOpen(false); setDeleteModalOpen(false);
    setViewModalOpen(false); setSelectedReading(null); setPreviousReadingForModal(null);
    setCustomerForAdd(null); setCalcPreviewOpen(false); setCalcPreviewData(null);
    setBulkOpen(false); setBulkItems([]); setBulkSaving(false); setBulkComputing(false);
    setBulkProcessed(0); setMissingExcelAccounts([]); setNegativeExcelItems([]);
  };

  const handleAddNewSubmit = (newReadingData) => { addReadingMutation.mutate(newReadingData); handleCloseModals(); };
  const handleEditSubmit = (readingData) => { updateReadingMutation.mutate(readingData); handleCloseModals(); };
  const handleDeleteConfirm = () => { deleteReadingMutation.mutate(selectedReading.id); handleCloseModals(); };

  const handleViewBillDetails = (row) => { setViewReadingId(row.id); setIsPreviewMode(true); };

  // ─── Strategy Helpers ───
  const formatKifyaWer = (m, y) => `${m}, ${y}`;

  const fetchPreviousReadingValue = async (accountNumber, kifya) => {
    const res = await readingService.getPreviousReading(accountNumber, kifya);
    return res?.previousReading ?? res ?? 0;
  };

  const fetchPreviousReadingInfo = async (accountNumber, kifya) => {
    const res = await readingService.getPreviousReading(accountNumber, kifya);
    return { previousReading: res?.previousReading ?? 0, consumption: res?.consumption ?? 0, meterChanged: !!res?.meterChanged };
  };

  const handleStrategyRepeatPrevious = async (customer) => {
    try {
      const kifya = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);
      const prev = await fetchPreviousReadingValue(customer.accountNumber, kifya);
      setCalcPreviewData({ accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prev, proposedLastReading: prev, consumption: 0, strategy: "Repeat previous reading", kifyaWer: kifya });
      setCalcPreviewOpen(true);
    } catch (e) { toast.error(e.message || "Failed to compute using 'Repeat previous'."); }
  };

  const handleStrategyUseLastMonthConsumption = async (customer) => {
    try {
      const kifyaCurr = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);
      const info = await fetchPreviousReadingInfo(customer.accountNumber, kifyaCurr);
      const prevCurr = Number(info.previousReading || 0);
      let lastMonthConsumption = Number(info.consumption || 0);
      if (!Number.isFinite(lastMonthConsumption) || lastMonthConsumption < 0) lastMonthConsumption = 0;
      setCalcPreviewData({ accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prevCurr, proposedLastReading: prevCurr + lastMonthConsumption, consumption: lastMonthConsumption, strategy: "Use last month's consumption", kifyaWer: kifyaCurr });
      setCalcPreviewOpen(true);
    } catch (e) { toast.error(e.message || "Failed to compute last month's consumption."); }
  };

  const handleStrategyAverageFromInitial = async (customer) => {
    try {
      const kifya = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);
      const prev = await fetchPreviousReadingValue(customer.accountNumber, kifya);
      let initialConsumption = 0;
      try { const customerFull = await customerService.getCustomerById(customer.id); initialConsumption = Number(customerFull?.initialConsumption || 0); } catch { /* fallback */ }
      const consumption = Math.max(0, Math.floor(initialConsumption));
      setCalcPreviewData({ accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prev, proposedLastReading: prev + consumption, consumption, strategy: "Average consumption", kifyaWer: kifya });
      setCalcPreviewOpen(true);
    } catch (e) { toast.error(e.message || "Failed to compute average consumption."); }
  };

  const handleConfirmCalculated = () => {
    if (!calcPreviewData) return;
    addReadingMutation.mutate({ customerAccountNumber: calcPreviewData.accountNumber, lastReading: Number(calcPreviewData.proposedLastReading), kifyaWer: calcPreviewData.kifyaWer, previousReading: Number(calcPreviewData.previousReading ?? 0) });
    setCalcPreviewOpen(false); setCalcPreviewData(null);
  };

  const handleRowStrategy = (row, strategyKey) => {
    const customer = row.original;
    if (strategyKey === "repeat") handleStrategyRepeatPrevious(customer);
    else if (strategyKey === "lastMonth") handleStrategyUseLastMonthConsumption(customer);
    else if (strategyKey === "average") handleStrategyAverageFromInitial(customer);
  };

  const handleAddManual = (row) => handleOpenAddReadingFromList(row.original);

  // ─── Bulk Helpers ───
  const computeForCustomer = async (strategyKey, customer) => {
    const kifya = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);
    const info = await fetchPreviousReadingInfo(customer.accountNumber, kifya);
    const prev = Number(info.previousReading || 0);
    if (strategyKey === "repeat") return { accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prev, proposedLastReading: prev, consumption: 0, strategy: "Repeat previous reading", kifyaWer: kifya };
    if (strategyKey === "lastMonth") {
      let cons = Number(info.consumption || 0); if (!Number.isFinite(cons) || cons < 0) cons = 0;
      return { accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prev, proposedLastReading: prev + cons, consumption: cons, strategy: "Use last month's consumption", kifyaWer: kifya };
    }
    let initialConsumption = 0;
    try { const customerFull = await customerService.getCustomerById(customer.id); initialConsumption = Number(customerFull?.initialConsumption || 0); } catch { /* fallback */ }
    const cons = Math.max(0, Math.floor(initialConsumption));
    return { accountNumber: customer.accountNumber, customerName: customer.fullName, previousReading: prev, proposedLastReading: prev + cons, consumption: cons, strategy: "Average consumption", kifyaWer: kifya };
  };

  const openBulkWithStrategy = async (strategyKey, table) => {
    try {
      setBulkOpen(true); setBulkStrategy(strategyKey); setBulkComputing(true);
      const customers = table.getSelectedRowModel().rows.map((r) => r.original);
      const results = [];
      for (const c of customers) { results.push(await computeForCustomer(strategyKey, c)); }
      setBulkItems(results);
    } catch (e) { toast.error(e.message || "Failed to compute bulk preview."); setBulkOpen(false); }
    finally { setBulkComputing(false); }
  };

  const handleBulkSaveAll = async () => {
    if (!bulkItems?.length) return;
    setBulkSaving(true); setBulkProcessed(0);
    let ok = 0, fail = 0;
    for (let i = 0; i < bulkItems.length; i++) {
      const it = bulkItems[i];
      try {
        await addReadingMutation.mutateAsync({ customerAccountNumber: it.accountNumber, lastReading: Number(it.proposedLastReading), kifyaWer: it.kifyaWer, previousReading: Number(it.previousReading ?? 0) });
        ok++;
      } catch { fail++; }
      finally { setBulkProcessed(i + 1); }
    }
    toast.success(`Saved ${ok} readings${fail ? `, ${fail} failed` : ""}.`);
    setBulkSaving(false); setBulkOpen(false); setBulkItems([]); setRowSelectionWithout({});
    Promise.allSettled([refetch(), refetchWithoutReading()]);
  };

  // ─── Direct Bulk Handlers ───
  const handleCloseDirectBulk = () => {
    if (directBulkTimerRef.current) {
      clearInterval(directBulkTimerRef.current);
      directBulkTimerRef.current = null;
    }
    setDirectBulkOpen(false);
    setDirectBulkJobId(null);
    setDirectBulkProgressInfo(null);
    setDirectBulkLogs([]);
  };

  const handleDirectBulkStrategy = async (strategyKey, tableInstance) => {
    const selectedCustomers = tableInstance.getSelectedRowModel().rows.map((r) => r.original);
    const accountNumbers = selectedCustomers
      .map((c) => c.accountNumber)
      .filter((acc) => Boolean(acc));

    if (accountNumbers.length === 0) {
      toast.warn("No valid customer accounts selected.");
      return;
    }

    const kifyaWer = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);

    setDirectBulkStrategy(strategyKey);
    setDirectBulkOpen(true);
    setDirectBulkLogs([]);
    setDirectBulkProgressInfo({
      total: accountNumbers.length,
      processed: 0,
      percent: 0,
      done: false,
      status: "RUNNING",
      message: "Starting server-side bulk execution...",
    });

    try {
      const res = await readingService.startBulkApplyReadingsAsync({
        accountNumbers,
        kifyaWer,
        strategy: strategyKey,
      });

      const jobId = res?.jobId;
      if (!jobId) throw new Error("No jobId received from backend.");
      setDirectBulkJobId(jobId);

      if (directBulkTimerRef.current) {
        clearInterval(directBulkTimerRef.current);
        directBulkTimerRef.current = null;
      }

      directBulkTimerRef.current = setInterval(async () => {
        if (directBulkPollInFlightRef.current) return;
        directBulkPollInFlightRef.current = true;
        try {
          const [info, logRes] = await Promise.all([
            readingService.getProgress(jobId),
            readingService.getProgressLogs(jobId),
          ]);

          if (info) {
            setDirectBulkProgressInfo(info);
          }
          if (logRes?.logs && Array.isArray(logRes.logs)) {
            setDirectBulkLogs(logRes.logs);
          }

          if (info?.done || info?.status === "DONE" || info?.status === "ERROR") {
            if (directBulkTimerRef.current) {
              clearInterval(directBulkTimerRef.current);
              directBulkTimerRef.current = null;
            }

            if (info?.status === "ERROR") {
              toast.error(info?.message || "Bulk apply failed with errors.");
            } else {
              toast.success(info?.message || "Direct bulk apply completed successfully!");
              setRowSelectionWithout({});
              Promise.allSettled([refetch(), refetchWithoutReading()]);
            }
          }
        } catch (pollErr) {
          if (pollErr?.status === 404 || pollErr?.status === 410) {
            if (directBulkTimerRef.current) {
              clearInterval(directBulkTimerRef.current);
              directBulkTimerRef.current = null;
            }
          }
        } finally {
          directBulkPollInFlightRef.current = false;
        }
      }, 700);
    } catch (err) {
      toast.error(err.message || "Failed to start direct bulk apply.");
      setDirectBulkProgressInfo({
        total: accountNumbers.length,
        processed: 0,
        percent: 0,
        done: true,
        status: "ERROR",
        message: err.message || "Failed to start bulk apply.",
      });
    }
  };

  // ─── Excel Import ───
  const handleClickImportExcel = () => fileInputRef.current?.click();

  const extractColumns = (row) => {
    const norm = (s) => String(s || "").toLowerCase().replace(/\s+|_/g, "");
    const entries = Object.entries(row);
    let acc, cur;
    for (const [k, v] of entries) {
      const nk = norm(k);
      if (!acc && (nk === "accountno" || nk === "accountnumber" || nk === "account")) acc = String(v).trim();
      if (!cur && (nk === "reading" || nk === "currentreading")) cur = v;
    }
    return { accountNumber: acc, currentReading: Number(cur) };
  };

  const handleExcelSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setImportingExcel(true);
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const parsed = rows.map(extractColumns).filter((x) => x.accountNumber && Number.isFinite(x.currentReading));
      if (parsed.length === 0) { toast.warn("No valid rows found. Expected columns: AccountNo, reading"); return; }
      const kifya = formatKifyaWer(selectedKifyaWerMonth, selectedKifyaWerYear);
      const results = [], missing = [], negatives = [];
      for (const it of parsed) {
        try {
          const info = await fetchPreviousReadingInfo(it.accountNumber, kifya);
          const prev = Number(info.previousReading || 0), proposed = Number(it.currentReading), cons = proposed - prev;
          // Use local map for name lookup only — account existence is validated by getPreviousReading above
          const cust = customerByAccount.get(String(it.accountNumber));
          const custName = cust?.fullName || "";
          if (cons < 0) { negatives.push({ accountNumber: String(it.accountNumber), customerName: custName, previousReading: prev, proposedLastReading: proposed, consumption: cons, kifyaWer: kifya }); continue; }
          results.push({ accountNumber: String(it.accountNumber), customerName: custName, previousReading: prev, proposedLastReading: proposed, consumption: cons, strategy: "From Excel", kifyaWer: kifya });
        } catch (err) {
          if (err?.status === 404) missing.push({ accountNumber: String(it.accountNumber), currentReading: Number(it.currentReading), reason: "Previous reading not found (404)" });
          else toast.error(`Failed to fetch previous for ${it.accountNumber}`);
        }
      }
      if (!results.length && !missing.length) { toast.error("No rows could be prepared from Excel."); return; }
      setBulkStrategy("excel"); setBulkItems(results); setMissingExcelAccounts(missing); setNegativeExcelItems(negatives); setBulkOpen(true);
    } catch { toast.error("Failed to read Excel file."); }
    finally { setImportingExcel(false); }
  };

  // ─── Export Helpers ───
  const handleExportCustomersWithoutReadingExcel = (dataToExport = null) => {
    try {
      const data = dataToExport || finalFilteredCustomersWithoutReading;
      if (!Array.isArray(data) || data.length === 0) { toast.info("No rows to export for the selected period."); return; }
      const wb = XLSX.utils.book_new();
      const exportData = data.map((row, index) => {
        const kebeleId = row.addressStreetsId ?? row.addressStreetId ?? row.kebeleId ?? null;
        const kebele = Array.isArray(kebeles) && kebeleId != null ? kebeles.find((k) => String(k.id) === String(kebeleId)) : null;
        const ketenaId = row.addressKetenaId ?? row.ketenaId ?? null;
        const ketena = Array.isArray(ketenas) && ketenaId != null ? ketenas.find((k) => String(k.id) === String(ketenaId)) : null;
        const readerId = row.assignedReaderId ?? row.readerId ?? null;
        let readerName = row.assignedReaderName || "";
        if (!readerName) {
          const reader = Array.isArray(readers) && readerId != null ? readers.find((r) => String(r.id) === String(readerId)) : null;
          if (reader) { readerName = reader.name || reader.fullName || [reader.firstName, reader.midleName, reader.lastName].filter(Boolean).join(" ") || ""; }
        }
        if (!readerName && readerId != null) readerName = String(readerId);
        const phone =
          row.phoneNumber ||
          row.phone ||
          row.customerPhoneNumber ||
          customerByAccount.get(String(row.accountNumber || row.customerAccountNumber || ""))?.phoneNumber ||
          customerByAccount.get(String(row.accountNumber || row.customerAccountNumber || ""))?.phone ||
          "";
        return {
          "#": index + 1,
          "Customer Name": row.fullName || row.customerName || "",
          "Account Number": row.accountNumber || "",
          "Previous Reading": row.previousReading ?? "",
          "Current Reading": "",
          "Phone Number": phone,
          Kebele: (kebele && kebele.name) || kebeleId || "",
          Ketena: (ketena && ketena.name) || ketenaId || "",
          Reader: readerName,
          "Kifya Wer": `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`,
        };
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "CustomersWithoutReading");
      const now = new Date();
      XLSX.writeFile(wb, `Customers_Without_Reading_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.xlsx`);
      toast.success("Excel file exported successfully!");
    } catch { toast.error("Failed to export Excel file"); }
  };

  const exportReadingsToExcel = (data, filenamePrefix = "Readings") => {
    try {
      if (!Array.isArray(data) || data.length === 0) { toast.info("No rows to export for the selected period."); return; }
      const wb = XLSX.utils.book_new();
      const exportData = data.map((row, index) => {
        const phone =
          row.customerPhoneNumber ||
          row.phoneNumber ||
          row.phone ||
          customerByAccount.get(String(row.customerAccountNumber || row.accountNumber || ""))?.phoneNumber ||
          customerByAccount.get(String(row.customerAccountNumber || row.accountNumber || ""))?.phone ||
          "";
        return {
          "#": index + 1,
          "Customer Name": row.customerFullName || row.customerName || "",
          "Account Number": row.customerAccountNumber || row.accountNumber || "",
          "Phone Number": phone,
          "Previous Reading": row.previousReading ?? "",
          "Last Reading": row.lastReading ?? "",
          Consumption: row.consumption ?? "",
          "Kifya Wer": row.kifyaWer || `${selectedKifyaWerMonth || ""}, ${selectedKifyaWerYear || ""}`,
        };
      });
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Readings");
      const now = new Date();
      XLSX.writeFile(wb, `${filenamePrefix}_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.xlsx`);
      toast.success("Excel file exported successfully!");
    } catch { toast.error("Failed to export Excel file"); }
  };

  const handleGenerateSelected = (ids) => {
    if (!ids || ids.length === 0) { toast.warn("Select at least one row to generate bills."); return; }
    startBillGeneration(ids);
  };

  // ═══════════════════════════════════════════
  // TABLE COLUMN DEFINITIONS
  // ═══════════════════════════════════════════
  const columns = useMemo(() => [
    { header: "#", size: 40, Cell: ({ row }) => row.index + 1 },
    {
      accessorKey: "customerFullName",
      header: "Customer Name",
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.customerFullName || row.original.customerName || "-"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.customerPhoneNumber || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "customerAccountNumber",
      header: "Account No",
      size: 110,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
          {row.original.customerAccountNumber || row.original.accountNumber}
        </Typography>
      ),
    },
    {
      accessorKey: "kebeleName",
      header: "Kebele",
      size: 100,
      Cell: ({ row }) => {
        if (row.original.customerKebele) return row.original.customerKebele;
        const kebeleId = row.original.customerKebeleId ?? row.original.addressStreetsId ?? row.original.addressStreetId ?? row.original.kebeleId ?? null;
        const kebele = Array.isArray(kebeles) && kebeleId != null ? kebeles.find((k) => String(k.id) === String(kebeleId)) : null;
        return (kebele && kebele.name) || kebeleId || "-";
      },
    },
    {
      accessorKey: "ketenaName",
      header: "Ketena",
      size: 100,
      Cell: ({ row }) => {
        if (row.original.ketenaName) return row.original.ketenaName;
        const ketenaId = row.original.addressKetenaId ?? row.original.ketenaId ?? null;
        const ketena = Array.isArray(ketenas) && ketenaId != null ? ketenas.find((k) => String(k.id) === String(ketenaId)) : null;
        return (ketena && ketena.name) || ketenaId || "-";
      },
    },
    {
      accessorKey: "previousReading",
      header: "Prev",
      size: 80,
      Cell: ({ row }) => row.original.previousReading ?? "-",
    },
    {
      accessorKey: "lastReading",
      header: "Current",
      size: 80,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.original.lastReading ?? "-"}
        </Typography>
      ),
    },
    {
      accessorKey: "consumption",
      header: "Consumption",
      size: 110,
      Cell: ({ row }) => (
        <Chip
          size="small"
          label={`${row.original.consumption ?? 0} m³`}
          color={Number(row.original.consumption) > 0 ? "primary" : "default"}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      accessorKey: "isBillGenerated",
      header: "Bill Status",
      size: 130,
      Cell: ({ row }) => {
        const isBilled = Boolean(row.original.isBillGenerated || row.original.billingInvoiceNumber);
        const invoiceNum = row.original.billingInvoiceNumber;
        return isBilled ? (
          <Tooltip title={invoiceNum ? `Invoice: #${invoiceNum}` : "Bill Generated"}>
            <Chip
              size="small"
              color="success"
              variant="filled"
              icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
              label={invoiceNum ? `#${invoiceNum}` : "Billed"}
              sx={{ fontWeight: 600 }}
            />
          </Tooltip>
        ) : (
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label="Pending Bill"
            sx={{ fontWeight: 600 }}
          />
        );
      },
    },
    {
      accessorKey: "tekilalaTekefay",
      header: "Total Payable",
      size: 130,
      Cell: ({ row }) => {
        const val = row.original.tekilalaTekefay;
        if (val == null || !Number.isFinite(Number(val)) || Number(val) <= 0) return "-";
        return (
          <Typography variant="body2" sx={{ fontWeight: 700, color: "success.dark" }}>
            {Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB
          </Typography>
        );
      },
    },
    { accessorKey: "kifyaWer", header: "Period", size: 100 },
  ], [kebeles, ketenas]);

  const columnsWithoutReading = useMemo(() => [
    { header: "#", size: 40, Cell: ({ row }) => row.index + 1 },
    {
      accessorKey: "fullName",
      header: "Customer Name",
      Cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.fullName || row.original.customerName || "-"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.phoneNumber || "-"}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: "accountNumber",
      header: "Account Number",
      size: 120,
      Cell: ({ row }) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700 }}>
          {row.original.accountNumber}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 130,
      Cell: () => (
        <Chip
          size="small"
          color="error"
          variant="outlined"
          icon={<AssignmentLateIcon style={{ fontSize: 16 }} />}
          label="Missing Reading"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    { accessorKey: "previousReading", header: "Previous Reading", size: 100 },
    {
      accessorKey: "kebeleName", header: "Kebele", size: 100,
      Cell: ({ row }) => {
        const kebeleId = row.original.addressStreetId ?? row.original.addressStreetsId ?? row.original.kebeleId ?? null;
        const kebele = Array.isArray(kebeles) && kebeleId != null ? kebeles.find((k) => String(k.id) === String(kebeleId)) : null;
        return (kebele && kebele.name) || kebeleId || "-";
      },
    },
    {
      accessorKey: "ketenaName", header: "Ketena", size: 100,
      Cell: ({ row }) => {
        const ketenaId = row.original.addressKetenaId ?? row.original.ketenaId ?? null;
        const ketena = Array.isArray(ketenas) && ketenaId != null ? ketenas.find((k) => String(k.id) === String(ketenaId)) : null;
        return (ketena && ketena.name) || ketenaId || "-";
      },
    },
    {
      accessorKey: "readerName", header: "Assigned Reader", size: 130,
      Cell: ({ row }) => {
        if (row.original.assignedReaderName) return row.original.assignedReaderName;
        const readerId = row.original.assignedReaderId ?? row.original.readerId ?? null;
        const reader = Array.isArray(readers) && readerId != null ? readers.find((r) => String(r.id) === String(readerId)) : null;
        if (reader) { if (reader.name) return reader.name; if (reader.fullName) return reader.fullName; const fromParts = [reader.firstName, reader.midleName, reader.lastName].filter(Boolean).join(" "); if (fromParts) return fromParts; }
        return readerId || "-";
      },
    },
  ], [kebeles, ketenas, readers]);

  // ═══════════════════════════════════════════
  // TABLE INSTANCES
  // ═══════════════════════════════════════════
  const table = useMaterialReactTable({
    columns,
    data: finalFilteredReadings,
    getRowId: (row) => String(row.id ?? row.customerAccountNumber ?? row.accountNumber ?? Math.random()),
    enableRowVirtualization: true,
    enableColumnVirtualization: false,
    enableStickyHeader: true,
    enableGlobalFilter: true,
    positionActionsColumn: "first",
    columnPinning: { left: ["mrt-row-actions"] },
    displayColumnDefOptions: { "mrt-row-actions": { header: "Actions", size: 150, grow: false } },
    initialState: { density: "compact", pagination: { pageSize: 10 }, showGlobalFilter: true },
    muiTableContainerProps: { sx: { maxHeight: 600, overflow: "auto", "& .MuiTableCell-root": { overflow: "visible" } } },
    muiTableBodyCellProps: { sx: { overflow: "visible" } },
    state: { isLoading, showAlertBanner: isError, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    muiToolbarAlertBannerProps: isError ? { color: "error", children: "Failed to load bills." } : undefined,
    enableRowActions: true,
    renderTopToolbarCustomActions: ({ table }) => {
      const handleGenerateSelectedLocal = () => {
        let selected = table.getSelectedRowModel().rows;
        let ids = selected.map((r) => r.original?.id).filter((v) => v != null);
        if (ids.length === 0 && rowSelection && Object.keys(rowSelection).length > 0) {
          const allRows = table.getPrePaginationRowModel().rows;
          ids = allRows
            .filter((r) => r.getIsSelected() || rowSelection[r.id])
            .map((r) => r.original?.id)
            .filter((v) => v != null);
        }
        if (ids.length === 0) {
          toast.warn("Select at least one row to generate bills.");
          return;
        }
        startBillGeneration(ids);
      };

      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: "4px", flexWrap: "wrap" }}>
          <Button
            color="success"
            variant="contained"
            size="small"
            onClick={isBillGenBusy ? () => setBillGenOpen(true) : handleGenerateSelectedLocal}
          >
            {isBillGenBusy ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>View Progress ({billGenProgressInfo?.percent ?? 0}%)</span>
              </Box>
            ) : (
              "Generate Bill for Selected"
            )}
          </Button>
        </Box>
      );
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
        {!row.original.isBillGenerated && (
          <Tooltip title="Generate Bill for this reading">
            <IconButton
              color="success"
              size="small"
              disabled={isBillGenBusy}
              onClick={() => startBillGeneration([row.original.id])}
            >
              <ReceiptLongIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="View Reading Details">
          <IconButton size="small" onClick={() => { setViewReadingId(row.original.id); setIsPreviewMode(false); }}><VisibilityIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Preview Bill Calculation">
          <IconButton size="small" onClick={() => handleViewBillDetails(row.original)}><TimelineIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Edit Reading">
          <IconButton size="small" color="primary" onClick={() => { setSelectedReading(row.original); setEditModalOpen(true); }}><EditIcon fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Delete Reading">
          <IconButton size="small" color="error" onClick={() => { setSelectedReading(row.original); setDeleteModalOpen(true); }}><DeleteIcon fontSize="small" /></IconButton>
        </Tooltip>
      </Box>
    ),
  });

  const tableWithoutReading = useMaterialReactTable({
    columns: columnsWithoutReading,
    data: finalFilteredCustomersWithoutReading,
    getRowId: (row) => String(row.accountNumber ?? row.id ?? Math.random()),
    enableRowVirtualization: true,
    enableColumnVirtualization: false,
    enableStickyHeader: true,
    enableGlobalFilter: true,
    positionActionsColumn: "first",
    columnPinning: { left: ["mrt-row-actions"] },
    displayColumnDefOptions: { "mrt-row-actions": { header: "Actions", size: 140, grow: false } },
    initialState: { density: "compact", pagination: { pageSize: 10 }, showGlobalFilter: true },
    muiTableContainerProps: { sx: { maxHeight: 600 } },
    state: { isLoading: isLoadingWithoutReading, showAlertBanner: isErrorWithoutReading, rowSelection: rowSelectionWithout },
    muiToolbarAlertBannerProps: isErrorWithoutReading ? { color: "error", children: "Failed to load customers without readings." } : undefined,
    enableRowActions: true,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelectionWithout,
    renderTopToolbarCustomActions: undefined,
    renderRowActions: ({ row }) => (
      <StrategyActions row={row} onStrategy={handleRowStrategy} onAddManual={handleAddManual} />
    ),
  });

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <>
      <ToastContainer autoClose={9000} hideProgressBar theme="colored" />

      {/* Reading Detail Modal */}
      <ReadingDetailModal
        readingId={viewReadingId}
        open={!!viewReadingId}
        onClose={() => { setViewReadingId(null); setIsPreviewMode(false); }}
        isPreview={isPreviewMode}
      />

      <Breadcrumb pageName="Registered Readings" />

      {/* ── Executive KPI Dashboard Banner ── */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Grid container spacing={2}>
          {/* Card 1: Customer Base */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Total Accounts
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "text.primary" }}>
                      {kpiStats.totalAccounts.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.50", color: "primary.main" }}>
                    <PeopleAltIcon fontSize="medium" />
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Active billing accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 2: Recorded Readings (Unbilled / Task 1) */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Readings Recorded
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "info.main" }}>
                      {kpiStats.pendingBillCount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: "info.50", color: "info.main" }}>
                    <WaterDropIcon fontSize="medium" />
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={kpiStats.pendingCoveragePct}
                    color="info"
                    sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: "grey.200" }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "info.dark" }}>
                    {kpiStats.pendingCoveragePct}%
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontWeight: 500 }}>
                  Bill not generated (Task 1 table)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 3: Invoiced Bills */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Invoices Generated
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: "success.main" }}>
                        {kpiStats.billedCount.toLocaleString()}
                      </Typography>
                      {isFetchingBilledCount && <CircularProgress size={14} color="success" />}
                    </Stack>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: "success.50", color: "success.main" }}>
                    <ReceiptLongIcon fontSize="medium" />
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={kpiStats.billingCoveragePct}
                    color="success"
                    sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: "grey.200" }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "success.dark" }}>
                    {kpiStats.billingCoveragePct}%
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontWeight: 500 }}>
                  Completed bills for cycle
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 4: Missing Readings */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Missing Readings
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: kpiStats.missingReadings > 0 ? "error.main" : "text.secondary" }}>
                      {kpiStats.missingReadings.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: kpiStats.missingReadings > 0 ? "error.50" : "grey.100", color: kpiStats.missingReadings > 0 ? "error.main" : "text.secondary" }}>
                    <AssignmentLateIcon fontSize="medium" />
                  </Box>
                </Stack>
                <Typography variant="caption" color={kpiStats.missingReadings > 0 ? "error.main" : "text.secondary"} sx={{ mt: 1, display: "block", fontWeight: 500 }}>
                  {kpiStats.missingReadings > 0 ? "Requires strategy / field entry" : "Complete meter reading"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Card 5: Total Consumption */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid", borderColor: "divider" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                      Billed Volume
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: "secondary.main" }}>
                      {totalConsumption.toLocaleString()} m³
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: "secondary.50", color: "secondary.main" }}>
                    <CheckCircleIcon fontSize="medium" />
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Cycle recorded consumption
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ── Global Billing Cycle & Geographic Filters ── */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterAltIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Cycle & Geographic Filters
            </Typography>
            {anyDropdownSelected && (
              <Chip size="small" color="primary" variant="filled" label="Filters Applied" />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Applies simultaneously to both Bill Generation and Meter Reading Management
          </Typography>
        </Box>

        <ReadingFilters
          selectedKifyaWerMonth={selectedKifyaWerMonth}
          selectedKifyaWerYear={selectedKifyaWerYear}
          onMonthChange={setSelectedKifyaWerMonth}
          onYearChange={setSelectedKifyaWerYear}
          onPeriodChange={handlePeriodChange}
          currentCycleMonth={currentCycleMonth}
          currentCycleYear={currentCycleYear}
          dbPeriods={dbPeriods}
          disablePeriodSelect={isRestrictedBySystemDay}
          monthOptions={ETH_MONTHS_AM}
          yearOptions={yearOptions}
          onFilter={handleFilterClick}
          isFetching={isFetchingReadings || isFetchingWithoutReading}
          selectedCustomerTypeId={selectedCustomerTypeId}
          selectedKebeleId={selectedKebeleId}
          selectedKetenaId={selectedKetenaId}
          selectedBranchId={selectedBranchId}
          selectedReaderId={selectedReaderId}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
          wuzifMonthsOp={wuzifMonthsOp}
          wuzifMonthsVal={wuzifMonthsVal}
          onWuzifOpChange={setWuzifMonthsOp}
          onWuzifValChange={setWuzifMonthsVal}
          customerTypes={customerTypes}
          kebeles={kebeles}
          ketenas={ketenas}
          branches={branches}
          readers={readers}
          isCustomerTypesLoading={isCustomerTypesLoading}
          isKebelesLoading={isKebelesLoading}
          isKetenasLoading={isKetenasLoading}
          isBranchesLoading={isBranchesLoading}
          isReadersLoading={isReadersLoading}
          anyDropdownLoading={anyDropdownLoading}
        />

        {/* Bank Process Results Summary */}
        {bankProcessResult && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} gutterBottom>Bank Payment Processing Results</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}><Typography variant="body2" color="success.main"><strong>New Payments:</strong> {bankProcessResult.newPayments?.length || 0}</Typography></Grid>
              <Grid item xs={3}><Typography variant="body2" color="info.main"><strong>Already Paid:</strong> {bankProcessResult.alreadyPaid?.length || 0}</Typography></Grid>
              <Grid item xs={3}><Typography variant="body2" color="warning.main"><strong>Not Found:</strong> {bankProcessResult.notFound?.length || 0}</Typography></Grid>
              <Grid item xs={3}><Typography variant="body2" color="error.main"><strong>Duplicates:</strong> {bankProcessResult.duplicates?.length || 0}</Typography></Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary">Total CSV rows processed: {bankProcessResult.totalPaidCount || 0}</Typography>
          </Box>
        )}
      </Paper>

      {/* ── Pro Segmented Workspace Tabs Navigation ── */}
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            bgcolor: "grey.50",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: "1rem",
              py: 1.75,
              minHeight: 56,
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                bgcolor: "background.paper",
                color: "primary.main",
              },
            },
          }}
        >
          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <span>Task 1: Bill Generation & Invoicing</span>
                <Chip
                  size="small"
                  color={kpiStats.pendingBillCount > 0 ? "warning" : "default"}
                  label={`${kpiStats.pendingBillCount} Readings (Pending Bill)`}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            }
          />
          <Tab
            icon={<AssignmentLateIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <span>Task 2: Meter Reading Management</span>
                <Chip
                  size="small"
                  color={finalFilteredCustomersWithoutReading.length > 0 ? "error" : "success"}
                  label={`${finalFilteredCustomersWithoutReading.length} Missing Readings`}
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════════
          WORKSPACE 1: BILL GENERATION & INVOICING (PRESERVED IN-MEMORY)
          ══════════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ display: activeTab === 0 ? "block" : "none" }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Bill Generation & Invoicing Workspace
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review recorded meter readings for {selectedKifyaWerMonth} {selectedKifyaWerYear}, verify consumption, and generate single or bulk bills.
              </Typography>
            </Box>
            {isFetchingReadings && <CircularProgress size={24} />}
          </Box>

          {/* Sleek Action Toolbar for Table 1 */}
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2,
            p: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
            {/* Left Group: Selection controls */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 600 }}>
                Selection:
              </Typography>
              <Button size="small" variant="outlined" color="primary" onClick={() => {
                const next = {};
                table.getRowModel().rows.forEach((r) => { next[r.id] = true; });
                setRowSelection(next);
              }}>
                Select Visible
              </Button>
              <Button size="small" variant="outlined" color="primary" onClick={() => {
                const next = {};
                table.getFilteredRowModel().rows.forEach((r) => { next[r.id] = true; });
                setRowSelection(next);
              }}>
                Select All Filtered
              </Button>
              <Button size="small" variant="text" color="secondary" onClick={() => setRowSelection({})} disabled={Object.keys(rowSelection).length === 0}>
                Clear Selection
              </Button>
              {Object.keys(rowSelection).length > 0 && (
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, ml: 1 }}>
                  {Object.keys(rowSelection).length} selected
                </Typography>
              )}
            </Box>

            {/* Right Group: Export & Filters */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => exportReadingsToExcel(finalFilteredReadings, "Filtered_Readings")}
              >
                Export Filtered Excel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => exportReadingsToPDF({
                  data: finalFilteredReadings,
                  selectedKifyaWerMonth,
                  selectedKifyaWerYear,
                  companyProfile: profileData,
                  filterContext: currentFilterContext,
                  customerByAccount,
                  preparerName: getPreparerName(),
                  toast,
                  filenamePrefix: "Filtered_Readings",
                })}
              >
                Export Filtered PDF
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  const allRows = table.getPrePaginationRowModel().rows;
                  const selectedSortedRows = allRows.filter((row) => row.getIsSelected());
                  const data = selectedSortedRows.map((r) => r.original);
                  if (data.length === 0) {
                    toast.warn("Select at least one row to export.");
                    return;
                  }
                  exportReadingsToExcel(data, "Selected_Readings");
                }}
                disabled={Object.keys(rowSelection).length === 0}
              >
                Export Selected Excel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  const allRows = table.getPrePaginationRowModel().rows;
                  const selectedSortedRows = allRows.filter((row) => row.getIsSelected());
                  const data = selectedSortedRows.map((r) => r.original);
                  if (data.length === 0) {
                    toast.warn("Select at least one row to export.");
                    return;
                  }
                  exportReadingsToPDF({
                    data,
                    selectedKifyaWerMonth,
                    selectedKifyaWerYear,
                    companyProfile: profileData,
                    filterContext: currentFilterContext,
                    customerByAccount,
                    preparerName: getPreparerName(),
                    toast,
                    filenamePrefix: "Selected_Readings",
                  });
                }}
                disabled={Object.keys(rowSelection).length === 0}
              >
                Export Selected PDF
              </Button>

              <Box sx={{ width: "1px", height: "24px", bgcolor: "divider", mx: 1 }} />

              <Button
                size="small"
                variant={showOnlyDuplicatesReadings ? "contained" : "outlined"}
                color={showOnlyDuplicatesReadings ? "warning" : "inherit"}
                onClick={() => setShowOnlyDuplicatesReadings((prev) => !prev)}
              >
                {showOnlyDuplicatesReadings ? "Show All Readings" : "Show Duplicates Only"}
              </Button>
            </Box>
          </Box>

          <MaterialReactTable table={table} />
          
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{finalFilteredReadings.length}</strong> recorded readings
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
              Total Billed Consumption: {totalConsumption.toLocaleString()} m³
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ══════════════════════════════════════════════════════════════════════════
          WORKSPACE 2: METER READING MANAGEMENT (PRESERVED IN-MEMORY)
          ══════════════════════════════════════════════════════════════════════════ */}
      <Box sx={{ display: activeTab === 1 ? "block" : "none" }}>
        <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                Meter Reading Management & Missing Readings Capture
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capture unrecorded meter readings for {selectedKifyaWerMonth} {selectedKifyaWerYear} using automated strategies, fast direct server calculation, or Excel import.
              </Typography>
            </Box>
            {isFetchingWithoutReading && <CircularProgress size={24} />}
          </Box>

          {/* Sleek Action Toolbar for Table 2 */}
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mb: 2,
            p: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.05)"
          }}>
            {/* Left Group: Selection controls & bulk strategies */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 600 }}>
                Selection:
              </Typography>
              <Button size="small" variant="outlined" color="primary" onClick={() => {
                const next = {};
                tableWithoutReading.getRowModel().rows.forEach((r) => { next[r.id] = true; });
                setRowSelectionWithout(next);
              }}>
                Select Visible
              </Button>
              <Button size="small" variant="outlined" color="primary" onClick={() => {
                const next = {};
                tableWithoutReading.getFilteredRowModel().rows.forEach((r) => { next[r.id] = true; });
                setRowSelectionWithout(next);
              }}>
                Select All Filtered
              </Button>
              <Button size="small" variant="text" color="secondary" onClick={() => setRowSelectionWithout({})} disabled={Object.keys(rowSelectionWithout).length === 0}>
                Clear Selection
              </Button>
              {Object.keys(rowSelectionWithout).length > 0 && (
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, ml: 1 }}>
                  {Object.keys(rowSelectionWithout).length} selected
                </Typography>
              )}

              {/* Bulk Actions Panel */}
              {Object.keys(rowSelectionWithout).length > 0 && (
                <Box sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                  ml: 1,
                  px: 1.5,
                  py: 0.5,
                  bgcolor: "rgba(25, 118, 210, 0.08)",
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "primary.main"
                }}>
                  {/* Group 1: Preview Mode */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: "bold", textTransform: "uppercase" }}>
                      Preview:
                    </Typography>
                    <Tooltip title="Preview repeat previous reading before saving">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => openBulkWithStrategy("repeat", tableWithoutReading)}
                      >
                        Repeat Prev
                      </Button>
                    </Tooltip>
                    <Tooltip title="Preview last month's consumption reading before saving">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => openBulkWithStrategy("lastMonth", tableWithoutReading)}
                      >
                        Last Month
                      </Button>
                    </Tooltip>
                    <Tooltip title="Preview average consumption reading before saving">
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => openBulkWithStrategy("average", tableWithoutReading)}
                      >
                        Average
                      </Button>
                    </Tooltip>
                  </Box>

                  <Box sx={{ width: "1px", height: "20px", bgcolor: "divider" }} />

                  {/* Group 2: Direct Server Apply (Fast) */}
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: "bold", textTransform: "uppercase" }}>
                      ⚡ Direct Server (Fast):
                    </Typography>
                    <Tooltip title="Directly record Repeat Previous on server asynchronously">
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                        onClick={() => handleDirectBulkStrategy("repeat", tableWithoutReading)}
                        startIcon={<BoltIcon />}
                      >
                        Direct Repeat
                      </Button>
                    </Tooltip>
                    <Tooltip title="Directly record Last Month's Consumption on server asynchronously">
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                        onClick={() => handleDirectBulkStrategy("lastMonth", tableWithoutReading)}
                        startIcon={<BoltIcon />}
                      >
                        Direct Last Month
                      </Button>
                    </Tooltip>
                    <Tooltip title="Directly record Average Consumption on server asynchronously">
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                        onClick={() => handleDirectBulkStrategy("average", tableWithoutReading)}
                        startIcon={<BoltIcon />}
                      >
                        Direct Average
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Right Group: Export & Filters */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
              <input type="file" ref={fileInputRef} accept=".xlsx,.xls" style={{ display: "none" }} onChange={handleExcelSelected} />
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={handleClickImportExcel}
                startIcon={<AddCircleOutlineIcon />}
              >
                Import Excel Readings
              </Button>
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => handleExportCustomersWithoutReadingExcel()}
              >
                Export Excel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => exportCustomersWithoutReadingPDF({
                  data: finalFilteredCustomersWithoutReading,
                  selectedKifyaWerMonth,
                  selectedKifyaWerYear,
                  companyProfile: profileData,
                  filterContext: currentFilterContext,
                  kebeles,
                  ketenas,
                  readers,
                  customerByAccount,
                  preparerName: getPreparerName(),
                  toast,
                  filenamePrefix: "Customers_Without_Reading",
                })}
              >
                Export PDF
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  const selectedRows = tableWithoutReading.getSelectedRowModel().rows.map((r) => r.original);
                  if (selectedRows.length === 0) {
                    toast.warn("Select at least one row to export.");
                    return;
                  }
                  handleExportCustomersWithoutReadingExcel(selectedRows);
                }}
                disabled={Object.keys(rowSelectionWithout).length === 0}
              >
                Export Selected Excel
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => {
                  const selectedRows = tableWithoutReading.getSelectedRowModel().rows.map((r) => r.original);
                  if (selectedRows.length === 0) {
                    toast.warn("Select at least one row to export.");
                    return;
                  }
                  exportCustomersWithoutReadingPDF({
                    data: selectedRows,
                    selectedKifyaWerMonth,
                    selectedKifyaWerYear,
                    companyProfile: profileData,
                    filterContext: currentFilterContext,
                    kebeles,
                    ketenas,
                    readers,
                    customerByAccount,
                    preparerName: getPreparerName(),
                    toast,
                    filenamePrefix: "Selected_Customers_Without_Reading",
                  });
                }}
                disabled={Object.keys(rowSelectionWithout).length === 0}
              >
                Export Selected PDF
              </Button>

              <Box sx={{ width: "1px", height: "24px", bgcolor: "divider", mx: 1 }} />

              <Button
                size="small"
                variant={showOnlyDuplicatesWithoutReading ? "contained" : "outlined"}
                color={showOnlyDuplicatesWithoutReading ? "warning" : "inherit"}
                onClick={() => setShowOnlyDuplicatesWithoutReading((prev) => !prev)}
              >
                {showOnlyDuplicatesWithoutReading ? "Show All Customers" : "Show Duplicates Only"}
              </Button>
            </Box>
          </Box>

          <MaterialReactTable table={tableWithoutReading} />
          
          <Box sx={{ mt: 2, p: 1.5, bgcolor: "grey.50", borderRadius: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing <strong>{finalFilteredCustomersWithoutReading.length}</strong> accounts missing readings for this cycle
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Apply strategies or import Excel to record readings
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* ── Modals ── */}
      <CalcPreviewDialog
        open={calcPreviewOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmCalculated}
        previewData={calcPreviewData}
        isLoading={addReadingMutation.isLoading}
      />

      <BulkPreviewDialog
        open={bulkOpen}
        onClose={handleCloseModals}
        bulkStrategy={bulkStrategy}
        bulkComputing={bulkComputing}
        bulkSaving={bulkSaving}
        bulkProcessed={bulkProcessed}
        bulkItems={bulkItems}
        onBulkItemsChange={setBulkItems}
        onSaveAll={handleBulkSaveAll}
        missingExcelAccounts={missingExcelAccounts}
        negativeExcelItems={negativeExcelItems}
      />

      <BulkDirectProgressDialog
        open={directBulkOpen}
        onClose={handleCloseDirectBulk}
        strategy={directBulkStrategy}
        progressInfo={directBulkProgressInfo}
        logs={directBulkLogs}
      />

      <BillGenerationProgressDialog
        open={billGenOpen}
        onClose={handleCloseBillGen}
        progressInfo={billGenProgressInfo}
        logs={billGenLogs}
      />

      <AddNewReadingModal
        open={addModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleAddNewSubmit}
        kifyaWer={`${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`}
        customer={customerForAdd}
        previousReading={previousReadingForModal}
      />

      <EditReadingModal
        open={editModalOpen}
        onClose={handleCloseModals}
        onSubmit={handleEditSubmit}
        reading={selectedReading}
      />

      <DeleteReadingDialog
        open={deleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleDeleteConfirm}
        reading={selectedReading}
      />

      {viewModalOpen && (
        <ViewBillDetailModal
          open={viewModalOpen}
          onClose={handleCloseModals}
          bill={selectedReading}
        />
      )}
    </>
  );
};

const ReadingListPage = () => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <BillList />
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

export default ReadingListPage;
