"use client";
import { useMemo, useState, useRef, useEffect } from "react";
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
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Collapse,
  Badge,
  LinearProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SpeedIcon from "@mui/icons-material/Speed";
import RefreshIcon from "@mui/icons-material/Refresh";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CalculateIcon from "@mui/icons-material/Calculate";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CustomerService } from "../../../lib/customerService";
import { DropdownService } from "../../../lib/dropdownService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import ConfirmDialog from "@/app/ui/components/ConfirmDialog";
import ViewCustomerModal from "./ViewCustomerModal";
import ReadingDetailModal from "../../components/ReadingDetailModal";
import MetersModal from "./MetersModal";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
import { ReadingService } from "../../../lib/ReadingService";
import bankDerashService from "../../../lib/bankDerashService";
import bankPaymentImportService from "../../../lib/bankPaymentImportService";
import billingBanksService from "../../../lib/billingBanksService";
import { UnicashPaymentImportService } from "../../../lib/unicashPaymentImportService";
import fncJournalEntryService from "../../../lib/fncJournalEntryService";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";

const readingService = new ReadingService();
const customerService = new CustomerService();
const dropdownService = new DropdownService();
const unicashPaymentImportService = new UnicashPaymentImportService();

/**
 * Builds proper journal lines for a single bill edit/void.
 * Mirrors fncBillToJournal Step 1 (buildBillPrepJournalLines) exactly.
 * Each journal line has EITHER debitAmount OR creditAmount (never both).
 *
 * New Bill Push (Step 1): DR Receivable / CR Revenue
 * Old Bill Reversal (opposite): DR Revenue / CR Receivable
 *
 * @param {Object|null} oldBill - Original bill (null for new-bill-only push)
 * @param {Object|null} newBill - New bill data (null for void/delete)
 * @param {Object} bpMappings - BP_ account mappings
 * @returns {{ lines: Array, error: string|null, newBillRows: Array, oldBillRows: Array }}
 */
const buildSingleBillAdjustmentLines = (oldBill, newBill, bpMappings) => {
  if (!oldBill && !newBill) return { lines: [], error: "No bill data provided.", newBillRows: [], oldBillRows: [] };

  const lines = [];
  const newBillRows = [];
  const oldBillRows = [];
  const missingAccounts = [];

  // Full 14 charge items aligned with fncBillToJournal/buildBillPrepJournalLines
  const getChargeItems = (bill) => {
    if (!bill) return [];
    const cf = (bill.wuzifHisab || 0) - (
      (bill.wuzifKotariKiray || 0) + (bill.wuzifFjotaKfya || 0) +
      (bill.wuzifDerekKoshasha || 0) + (bill.wuzifTechemariKfya || 0)
    );
    return [
      { drKey: "BP_DR_WATER_CONSUMPTION", crKey: "BP_CR_WATER_CONSUMPTION", amount: bill.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ ብር", group: "g1" },
      { drKey: "BP_DR_METER_RENT", crKey: "BP_CR_METER_RENT", amount: bill.kotariKiray, desc: "ቆጣሪ ኪራይ", group: "g1" },
      { drKey: "BP_DR_ADDITIONAL_CHARGE", crKey: "BP_CR_ADDITIONAL_CHARGE", amount: bill.techemariKfya, desc: "ተጨማሪ ክፍያ", group: "g1" },
      { drKey: "BP_DR_SERVICE_CHARGE", crKey: "BP_CR_SERVICE_CHARGE", amount: bill.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ", group: "g1" },
      { drKey: "BP_DR_WASTE_CHARGE", crKey: "BP_CR_WASTE_CHARGE", amount: bill.additionalHisab, desc: "ደረቅ ቆሻሻ", group: "g1" },
      { drKey: "BP_DR_SCHOOL_FEEDING", crKey: "BP_CR_SCHOOL_FEEDING", amount: bill.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ", group: "g1" },
      { drKey: "BP_DR_WUZIF_CONSUMPTION", crKey: "BP_CR_WUZIF_CONSUMPTION", amount: bill.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ ክፍያ", group: "g2" },
      { drKey: "BP_DR_WUZIF_METER_RENT", crKey: "BP_CR_WUZIF_METER_RENT", amount: bill.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ", group: "g2" },
      { drKey: "BP_DR_WUZIF_ADDITIONAL", crKey: "BP_CR_WUZIF_ADDITIONAL", amount: bill.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ ክፍያ", group: "g2" },
      { drKey: "BP_DR_WUZIF_SERVICE_CHARGE", crKey: "BP_CR_WUZIF_SERVICE_CHARGE", amount: bill.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት ክፍያ", group: "g2" },
      { drKey: "BP_DR_PENALTY", crKey: "BP_CR_PENALTY", amount: bill.kitat, desc: "ቅጣት", group: "g2" },
      { drKey: "BP_DR_WUZIF_WASTE", crKey: "BP_CR_WUZIF_WASTE", amount: bill.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ", group: "g2" },
      { drKey: "BP_DR_WUZIF_SCHOOL_FEEDING", crKey: "BP_CR_WUZIF_SCHOOL_FEEDING", amount: bill.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት ምገባ", group: "g2" },
      { drKey: "BP_DR_CARRIED_FORWARD", crKey: "BP_CR_CARRIED_FORWARD", amount: cf > 0 ? cf : 0, desc: "የተላለፈ(ነባር) ውዝፍ", group: "g2" },
    ];
  };

  const primaryBill = oldBill || newBill;
  const invoiceNum = primaryBill.billingInvoiceNumber || primaryBill.invoiceNumber || primaryBill.id;

  // ── New Bill Push (Step 1: DR Receivable / CR Revenue) ──
  if (newBill) {
    const newCharges = getChargeItems(newBill);
    newCharges.forEach((item) => {
      const amt = Math.round((item.amount || 0) * 100) / 100;
      if (amt <= 0) return;
      const drAccId = bpMappings[item.drKey];
      const crAccId = bpMappings[item.crKey];
      if (!drAccId) missingAccounts.push(`DR: ${item.desc}`);
      if (!crAccId) missingAccounts.push(`CR: ${item.desc}`);
      if (!drAccId || !crAccId) return;

      lines.push({
        accountId: Number(drAccId),
        description: `${item.desc} — Receivable — New Bill ${invoiceNum}`,
        debitAmount: amt,
        creditAmount: 0,
      });
      lines.push({
        accountId: Number(crAccId),
        description: `${item.desc} — Revenue — New Bill ${invoiceNum}`,
        debitAmount: 0,
        creditAmount: amt,
      });
      newBillRows.push({ desc: item.desc, drKey: item.drKey, crKey: item.crKey, amount: amt, group: item.group });
    });
  }

  // ── Old Bill Reversal (opposite of Step 1: DR Revenue / CR Receivable) ──
  if (oldBill) {
    const oldCharges = getChargeItems(oldBill);
    oldCharges.forEach((item) => {
      const amt = Math.round((item.amount || 0) * 100) / 100;
      if (amt <= 0) return;
      const drAccId = bpMappings[item.drKey]; // was DR Receivable in Step 1 -> now CR
      const crAccId = bpMappings[item.crKey]; // was CR Revenue in Step 1 -> now DR
      if (!drAccId) missingAccounts.push(`CR: ${item.desc}`);
      if (!crAccId) missingAccounts.push(`DR: ${item.desc}`);
      if (!drAccId || !crAccId) return;

      lines.push({
        accountId: Number(crAccId),
        description: `${item.desc} — Revenue Reversal — Old Bill ${invoiceNum}`,
        debitAmount: amt,
        creditAmount: 0,
      });
      lines.push({
        accountId: Number(drAccId),
        description: `${item.desc} — Receivable Reversal — Old Bill ${invoiceNum}`,
        debitAmount: 0,
        creditAmount: amt,
      });
      oldBillRows.push({ desc: item.desc, drKey: item.drKey, crKey: item.crKey, amount: amt, group: item.group });
    });
  }

  if (missingAccounts.length > 0) {
    return { lines: [], error: `Missing account mappings: ${[...new Set(missingAccounts)].join(", ")}`, newBillRows: [], oldBillRows: [] };
  }
  if (lines.length < 2) {
    return { lines: [], error: "No journal lines to create (all charges are zero).", newBillRows: [], oldBillRows: [] };
  }

  return { lines, error: null, newBillRows, oldBillRows };
};

const fmt = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CustomerList = () => {
  const queryClient = useQueryClient();
  const [viewedCustomerId, setViewedCustomerId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState(0);
  const [activeBillTab, setActiveBillTab] = useState(0);
  const [activeWuzifTab, setActiveWuzifTab] = useState(0);
  const [detailWorkspaceTab, setDetailWorkspaceTab] = useState(0); // 0 = Bills & Readings, 1 = Wuzif Ledger
  const [isCustomerDirectoryExpanded, setIsCustomerDirectoryExpanded] = useState(true);

  const [isMetersOpen, setMetersOpen] = useState(false);
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const fileInputRef = useRef(null);
  const [viewReadingId, setViewReadingId] = useState(null);

  // Generic confirm dialog state
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "Confirm",
    content: "Are you sure?",
    confirmText: "OK",
    cancelText: "Cancel",
    confirmColor: "primary",
  });
  const confirmActionRef = useRef(null);

  // --- Journal adjustment support data (loaded once) ---
  const [bpMappings, setBpMappings] = useState({});
  const [openFiscalYearId, setOpenFiscalYearId] = useState(null);

  // --- Journal preview dialog state (for standalone Delete Reading) ---
  const [journalPreviewOpen, setJournalPreviewOpen] = useState(false);
  const [journalPreviewData, setJournalPreviewData] = useState(null);
  const [journalPushLoading, setJournalPushLoading] = useState(false);

  // Helper to ensure BP mappings & open fiscal year are available
  const getEnsuredJournalSupportData = async () => {
    let currentBpMap = bpMappings;
    let currentFyId = openFiscalYearId;
    if (!currentBpMap || Object.keys(currentBpMap).length === 0 || !currentFyId) {
      try {
        const [mappingsData, fyData] = await Promise.all([
          fncBillingAccountMapService.getAllMappings().catch(() => []),
          fncFiscalYearService.getOpenFiscalYears().catch(() => []),
        ]);
        const bpMap = {};
        if (Array.isArray(mappingsData)) {
          mappingsData.forEach((m) => {
            if (m.mappingKey && m.mappingKey.startsWith("BP_")) {
              bpMap[m.mappingKey] = m.accountId;
            }
          });
        }
        currentBpMap = bpMap;
        setBpMappings(bpMap);
        if (Array.isArray(fyData) && fyData.length > 0) {
          currentFyId = fyData[0].id;
          setOpenFiscalYearId(currentFyId);
        }
      } catch (e) {
        console.warn("[JournalAdjustment] Failed to load support data:", e);
      }
    }
    return { currentBpMap, currentFyId };
  };

  useEffect(() => {
    getEnsuredJournalSupportData();
  }, []);

  const [derashModalOpen, setDerashModalOpen] = useState(false);
  const [derashLoading, setDerashLoading] = useState(false);
  const [derashResult, setDerashResult] = useState(null);
  const [selectedBillForDerash, setSelectedBillForDerash] = useState(null);
  const [manualBankModalOpen, setManualBankModalOpen] = useState(false);
  const [manualBankBill, setManualBankBill] = useState(null);
  const [selectedBankKey, setSelectedBankKey] = useState("");
  const [manualBankConfirmationCode, setManualBankConfirmationCode] = useState("");
  const [manualBankSaving, setManualBankSaving] = useState(false);

  const showConfirm = ({ title, content, confirmText = "OK", cancelText = "Cancel", confirmColor = "primary", onConfirm }) => {
    confirmActionRef.current = onConfirm;
    setConfirmState({ open: true, title, content, confirmText, cancelText, confirmColor });
  };

  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

  // Fetch data for dropdowns
  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
    onError: (error) => console.error("Error fetching kebeles:", error),
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
    onError: (error) => console.error("Error fetching branches:", error),
  });

  const { data: meterSizes = [] } = useQuery({
    queryKey: ["meterSizes"],
    queryFn: () => dropdownService.getMeterSizes(),
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
    onError: (error) => console.error("Error fetching customer types:", error),
  });

  // Fetch ketenas based on selected kebele (or all active if none selected)
  const { data: ketenas = [], isLoading: isKetenasLoading } = useQuery({
    queryKey: ["ketenas", selectedKebeleId],
    queryFn: () => dropdownService.getKetenasByKebele(selectedKebeleId || null),
    staleTime: 5 * 60 * 1000,
    onError: (error) => console.error("Error fetching ketenas:", error),
  });

  // Fetch readers based on selected branch
  const { data: readers = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return [];
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
    enabled: !!selectedBranchId,
    onError: (error) => console.error("Error fetching readers:", error),
  });

  const { data: billingBanks = [], isLoading: isBillingBanksLoading } = useQuery({
    queryKey: ["billing-banks-all-for-manual"],
    queryFn: () => billingBanksService.getAllBillingBanks(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
    onError: (error) => console.error("Error fetching billing banks:", error),
  });

  // Reading Edit States with Stepped In-Modal Workflow
  const [editReadingModalOpen, setEditReadingModalOpen] = useState(false);
  const [selectedBillForEdit, setSelectedBillForEdit] = useState(null);
  const [editReadingData, setEditReadingData] = useState({ currentReading: "", previousReading: "" });
  const [validationError, setValidationError] = useState("");
  const [isEditAndGenerate, setIsEditAndGenerate] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Stepped in-modal workflow states
  const [editModalStep, setEditModalStep] = useState("INPUT"); // 'INPUT' | 'PROCESSING' | 'JOURNAL'
  const [processingStepText, setProcessingStepText] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleBillTabChange = (event, newValue) => {
    setActiveBillTab(newValue);
  };

  const handleCustomerTabChange = (event, newValue) => {
    setActiveCustomerTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setActiveBillTab(0);
  };

  const handleWuzifTabChange = (event, newValue) => {
    setActiveWuzifTab(newValue);
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedCustomerId(selectedIds.length === 1 ? selectedIds[0] : null);
    setActiveBillTab(0);
    setActiveWuzifTab(0);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(globalFilter);
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [
    activeCustomerTab,
    selectedCustomerTypeId,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
  ]);

  const customerStatus = activeCustomerTab === 0 ? "active" : "deleted";

  // Fetch paginated customers based on filters and search
  const {
    data: paginatedData = { content: [], totalElements: 0 },
    isError: isCustomersError,
    isFetching,
    isLoading: isCustomersLoading,
    refetch: refetchCustomersAll,
  } = useQuery({
    queryKey: [
      "customers-paginated-filtered",
      pagination.pageIndex,
      pagination.pageSize,
      customerStatus,
      selectedCustomerTypeId,
      selectedKebeleId,
      selectedKetenaId,
      selectedBranchId,
      selectedReaderId,
      debouncedSearch,
    ],
    queryFn: async () => {
      const data = await customerService.getCustomersPaginatedFiltered({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        status: customerStatus,
        customerTypeId: selectedCustomerTypeId || undefined,
        kebeleId: selectedKebeleId || undefined,
        ketenaId: selectedKetenaId || undefined,
        branchId: selectedBranchId || undefined,
        readerId: selectedReaderId || undefined,
        search: debouncedSearch || undefined,
      });
      return data;
    },
    keepPreviousData: true,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: viewedCustomer, isFetching: isCustomerDetailsFetching } = useQuery({
    queryKey: ["customer-details", viewedCustomerId],
    queryFn: () => {
      if (!viewedCustomerId) return null;
      return customerService.getCustomerById(viewedCustomerId);
    },
    enabled: !!viewedCustomerId,
  });

  // Active Selected Customer Record (found from directory or fetched)
  const selectedCustomerRecord = useMemo(() => {
    if (!selectedCustomerId) return null;
    return paginatedData?.content?.find((c) => String(c.id) === String(selectedCustomerId)) || null;
  }, [selectedCustomerId, paginatedData?.content]);

  // Combined Bill and Wuzif Data Fetch
  const {
    data: combinedBillData,
    isLoading: isBillsLoading,
    isError: isBillsError,
    refetch: refetchBillData,
  } = useQuery({
    queryKey: ["customer-all-bill-data", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      return readingService.getCombinedBillDataForCustomer(selectedCustomerId);
    },
    enabled: !!selectedCustomerId,
    staleTime: 0,
    cacheTime: 0,
    keepPreviousData: true,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Extract bills and wuzif
  const customerBills = combinedBillData?.bills ?? [];
  const wuzifBills = combinedBillData?.wuzifBills ?? [];

  // Filter bills
  const activeBills = useMemo(
    () => (customerBills || []).filter((bill) => !bill.void),
    [customerBills]
  );
  const voidedBills = useMemo(
    () => (customerBills || []).filter((bill) => bill.void),
    [customerBills]
  );

  // Filter wuzif
  const activeWuzifList = useMemo(
    () =>
      (wuzifBills || []).filter(
        (b) => b?.wuzifDeleted === "active" && b?.wuzifIsMoneyCollected === false
      ),
    [wuzifBills]
  );
  const skippedWuzifList = useMemo(
    () =>
      (wuzifBills || []).filter(
        (b) => b?.wuzifDeleted === "deleted" && b?.wuzifIsKitatTenestual === true
      ),
    [wuzifBills]
  );
  const paidWuzifList = useMemo(
    () =>
      (wuzifBills || []).filter(
        (b) => b?.wuzifDeleted === "deleted" && b?.wuzifIsMoneyCollected === true
      ),
    [wuzifBills]
  );

  const activeBillingBanks = useMemo(
    () => (billingBanks || []).filter((bank) => bank.deleted === "active"),
    [billingBanks]
  );

  // Financial summary metrics for selected customer
  const customerFinancials = useMemo(() => {
    const unpaidBills = activeBills.filter((b) => !b.isMoneyCollected && !b.moneyCollected);
    const unpaidBillsTotal = unpaidBills.reduce((acc, b) => acc + (Number(b.tekilalaTekefay) || 0), 0);

    const paidBills = activeBills.filter((b) => b.isMoneyCollected || b.moneyCollected);
    const paidBillsTotal = paidBills.reduce((acc, b) => acc + (Number(b.tekilalaTekefay) || 0), 0);

    const activeWuzifTotal = activeWuzifList.reduce(
      (acc, b) => acc + (Number(b.tekilalaTekefay || b.wuzifHisab || 0)),
      0
    );

    const totalOutstanding = unpaidBillsTotal + activeWuzifTotal;

    return {
      unpaidBillsCount: unpaidBills.length,
      unpaidBillsTotal,
      paidBillsCount: paidBills.length,
      paidBillsTotal,
      activeWuzifCount: activeWuzifList.length,
      activeWuzifTotal,
      totalOutstanding,
    };
  }, [activeBills, activeWuzifList]);

  // Mutations
  const { mutateAsync: changeReadingStatusAsync, isLoading: isChangingStatus } = useMutation({
    mutationFn: ({ readingId, status, previousReading, currentReading }) =>
      readingService.changeReadingStatus(readingId, status, previousReading, currentReading),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Reading status changed successfully!");
    },
    onError: (error) => toast.error(`Error changing reading status: ${error.message}`),
  });

  const handleDeleteReading = async (bill) => {
    if (bill.isMoneyCollected || bill.moneyCollected) {
      toast.error("Cannot delete: Money has already been collected for this bill.");
      return;
    }
    const wasJournalPushed = !!(bill.isJournalPushed || bill.journalPushed);
    showConfirm({
      title: "Delete Reading",
      content: wasJournalPushed
        ? "This bill was already pushed to journal. Deleting will create a REVERSAL journal entry (DRAFT). Continue?"
        : "Are you sure you want to delete this reading?",
      confirmColor: "error",
      onConfirm: async () => {
        try {
          const oldBillSnapshot = { ...bill };
          await changeReadingStatusAsync({ readingId: bill.id, status: "deleted" });
          toast.success("Reading deleted successfully.");
          queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);

          if (wasJournalPushed) {
            const { currentBpMap } = await getEnsuredJournalSupportData();
            if (currentBpMap && Object.keys(currentBpMap).length > 0) {
              const invoiceNum = oldBillSnapshot.billingInvoiceNumber || oldBillSnapshot.invoiceNumber || oldBillSnapshot.id;
              const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillSnapshot, null, currentBpMap);
              if (!error && lines.length >= 2) {
                setJournalPreviewData({
                  lines,
                  newBillRows,
                  oldBillRows,
                  oldBill: oldBillSnapshot,
                  newBill: null,
                  invoiceNum,
                  isVoidOnly: true,
                  mode: "adjustment",
                });
                setJournalPreviewOpen(true);
              } else if (error) {
                toast.warning(`Journal reversal skipped: ${error}`);
              }
            }
          }
        } catch (error) {
          console.error("Error deleting reading:", error);
          toast.error(`Failed to delete reading: ${error.message}`);
        }
      },
    });
  };

  const handleEditReading = (bill) => {
    if (bill.isMoneyCollected || bill.moneyCollected) {
      toast.error("Cannot edit reading: Money has already been collected for this bill.");
      return;
    }

    showConfirm({
      title: "Edit Reading",
      content: "This will delete the active reading and create a new one with your inputs. Continue?",
      confirmColor: "warning",
      onConfirm: () => {
        setSelectedBillForEdit(bill);
        setEditReadingData({
          currentReading: bill.lastReading?.toString() || "",
          previousReading: bill.previousReading?.toString() || "",
        });
        setValidationError("");
        setIsEditAndGenerate(false);
        setEditModalStep("INPUT");
        setProcessingStepText("");
        setProcessingProgress(0);
        setEditReadingModalOpen(true);
      },
    });
  };

  const handleEditAndGenerate = (bill) => {
    if (bill.isMoneyCollected || bill.moneyCollected) {
      toast.error("Cannot edit reading: Money has already been collected for this bill.");
      return;
    }

    showConfirm({
      title: "Edit & Generate Bill",
      content: "This will delete the active reading, create a new one with your inputs, and automatically generate the bill. Continue?",
      confirmColor: "warning",
      onConfirm: () => {
        setSelectedBillForEdit(bill);
        setEditReadingData({
          currentReading: bill.lastReading?.toString() || "",
          previousReading: bill.previousReading?.toString() || "",
        });
        setValidationError("");
        setIsEditAndGenerate(true);
        setEditModalStep("INPUT");
        setProcessingStepText("");
        setProcessingProgress(0);
        setEditReadingModalOpen(true);
      },
    });
  };

  const handleEditReadingSubmit = async () => {
    if (isEditSubmitting) return;
    if (!selectedBillForEdit || !editReadingData.currentReading || !editReadingData.previousReading) {
      toast.error("Please enter valid current and previous readings.");
      return;
    }

    const newReading = parseInt(editReadingData.currentReading);
    const prevReading = parseInt(editReadingData.previousReading);

    if (isNaN(newReading) || isNaN(prevReading)) {
      setValidationError("Please enter valid numeric values for both readings.");
      return;
    }

    if (newReading < 0 || prevReading < 0) {
      setValidationError("Readings cannot be negative.");
      return;
    }

    if (newReading < prevReading) {
      setValidationError("Current reading cannot be less than previous reading.");
      return;
    }

    setValidationError("");
    setIsEditSubmitting(true);

    const oldBillSnapshot = { ...selectedBillForEdit };
    const wasJournalPushed = !!(oldBillSnapshot.isJournalPushed || oldBillSnapshot.journalPushed);

    // ==========================================
    // MULTI-STEP AUTOMATED "EDIT & GENERATE" FLOW
    // ==========================================
    if (isEditAndGenerate) {
      setEditModalStep("PROCESSING");
      setProcessingProgress(20);
      setProcessingStepText("Voiding old reading & saving new inputs...");

      try {
        // Step 1: Void active reading and recreate new reading
        const result = await readingService.deleteActiveAndCreateNewReading(
          selectedBillForEdit.id,
          prevReading,
          newReading
        );

        const newReadingId = result?.newReadingId || result?.id || result?.data?.newReadingId;
        if (!newReadingId) {
          throw new Error("Could not retrieve new reading ID from server.");
        }

        // Step 2: Generate Bill directly on the newly created reading
        setProcessingProgress(55);
        setProcessingStepText("Recalculating charges & generating new bill...");
        await readingService.generateBills([newReadingId]);

        // Step 3: Fetch fresh data to locate the generated bill
        setProcessingProgress(80);
        setProcessingStepText("Preparing DR/CR journal adjustment entries...");
        await queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);

        const freshData = await readingService.getCombinedBillDataForCustomer(selectedCustomerId);
        const allBills = freshData?.bills || freshData || [];
        const generatedNewBill =
          allBills.find((b) => String(b.id) === String(newReadingId)) ||
          allBills.find(
            (b) =>
              b.kifyaWer === oldBillSnapshot.kifyaWer &&
              !b.isVoid &&
              !b.void &&
              String(b.status).toLowerCase() === "active" &&
              b.isBillGenerated
          );

        if (!generatedNewBill) {
          toast.warning("Bill generated but could not load details. Please check the bill list.");
          handleCloseEditReadingModal();
          return;
        }

        // Step 4: Ensure BP account mappings & open fiscal year are loaded
        const { currentBpMap } = await getEnsuredJournalSupportData();
        const invoiceNum = generatedNewBill.billingInvoiceNumber || generatedNewBill.invoiceNumber || generatedNewBill.id;
        const oldBillForJournal = wasJournalPushed ? oldBillSnapshot : null;
        const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillForJournal, generatedNewBill, currentBpMap);

        if (error) {
          toast.warning(`Bill generated! Journal adjustment skipped: ${error}`);
          handleCloseEditReadingModal();
          return;
        }

        if (lines.length >= 2) {
          setProcessingProgress(100);
          setJournalPreviewData({
            lines,
            newBillRows,
            oldBillRows,
            oldBill: oldBillForJournal,
            newBill: generatedNewBill,
            invoiceNum,
            isVoidOnly: false,
            mode: wasJournalPushed ? "adjustment" : "billPrep",
          });
          // Transition seamlessly into the Journal Adjustment Review screen!
          setEditModalStep("JOURNAL");
        } else {
          toast.success("Bill generated successfully!");
          handleCloseEditReadingModal();
        }
      } catch (err) {
        console.error("Error during Edit & Generate:", err);
        toast.error(err.message || "Failed to edit and generate bill.");
        setEditModalStep("INPUT");
      } finally {
        setIsEditSubmitting(false);
      }
      return;
    }

    // ==========================================
    // STANDARD "UPDATE READING" FLOW (NO GENERATE)
    // ==========================================
    try {
      await readingService.deleteActiveAndCreateNewReading(
        selectedBillForEdit.id,
        prevReading,
        newReading
      );

      toast.success("Reading updated successfully!");
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);

      if (wasJournalPushed) {
        const { currentBpMap } = await getEnsuredJournalSupportData();
        if (currentBpMap && Object.keys(currentBpMap).length > 0) {
          const invoiceNum = oldBillSnapshot.billingInvoiceNumber || oldBillSnapshot.invoiceNumber || oldBillSnapshot.id;
          const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillSnapshot, null, currentBpMap);
          if (!error && lines.length >= 2) {
            setJournalPreviewData({
              lines,
              newBillRows,
              oldBillRows,
              oldBill: oldBillSnapshot,
              newBill: null,
              invoiceNum,
              isVoidOnly: true,
              mode: "adjustment",
            });
            setJournalPreviewOpen(true);
          }
        }
      }
      handleCloseEditReadingModal();
    } catch (error) {
      console.error("Error updating reading:", error);
      toast.error(`Failed to update reading: ${error.message}`);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCloseEditReadingModal = () => {
    setEditReadingModalOpen(false);
    setEditModalStep("INPUT");
    setSelectedBillForEdit(null);
    setEditReadingData({ currentReading: "", previousReading: "" });
    setIsEditSubmitting(false);
    setIsEditAndGenerate(false);
    setProcessingStepText("");
    setProcessingProgress(0);
  };

  // --- Journal Preview Push Handler ---
  const handleJournalPreviewPush = async () => {
    if (!journalPreviewData) return;
    const { currentFyId } = await getEnsuredJournalSupportData();
    if (!currentFyId) {
      toast.error("No open fiscal year found for journal creation.");
      return;
    }
    setJournalPushLoading(true);
    const { lines, oldBill, newBill, invoiceNum, isVoidOnly, mode } = journalPreviewData;
    const kifyaWer = (newBill || oldBill)?.kifyaWer || "";
    const isBillPrep = mode === "billPrep";
    const ref = isBillPrep
      ? `BILL-PREP-SINGLE-${invoiceNum}-${Date.now()}`
      : `BILL-ADJ-${invoiceNum}-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];
    try {
      await fncJournalEntryService.createEntry({
        fiscalYearId: currentFyId,
        entryDate: today,
        referenceNumber: ref,
        description: isBillPrep
          ? `Bill Preparation — ${invoiceNum} — ${kifyaWer}`
          : isVoidOnly
            ? `Bill Void Reversal — ${invoiceNum} — ${kifyaWer}`
            : `Bill Adjustment — ${invoiceNum} — ${kifyaWer}`,
        sourceType: isBillPrep ? "BILL_PREP" : "BILL_ADJUSTMENT",
        billingPeriod: kifyaWer,
        billingMonth: kifyaWer,
        lines,
      });
      toast.success(`📋 Journal entry created (DRAFT): ${ref}. Review and post in Journal Entries.`, { autoClose: 8000 });
      setJournalPreviewOpen(false);
      setJournalPreviewData(null);
      handleCloseEditReadingModal();
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
    } catch (err) {
      toast.error(`Failed to create journal entry: ${err.message}`);
    } finally {
      setJournalPushLoading(false);
    }
  };

  const handleCloseJournalPreview = () => {
    setJournalPreviewOpen(false);
    setJournalPreviewData(null);
  };

  // Shared renderer for Journal Adjustment Review tables
  const renderJournalPreviewContent = (data) => {
    if (!data) return null;
    const { newBillRows = [], oldBillRows = [], oldBill, newBill } = data;
    const newTotal = newBillRows.reduce((s, r) => s + (r.amount || 0), 0);
    const oldTotal = oldBillRows.reduce((s, r) => s + (r.amount || 0), 0);

    return (
      <Box>
        {/* New Bill Push Table */}
        {newBillRows.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#00897b" }}>
              ✅ New Bill — Push to Journal (Step 1)
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 1.5, overflow: "auto", border: "1px solid #00897b" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#00897b", color: "white" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#00897b", color: "white" }}>Charge Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#1565c0", color: "white" }}>
                      DR — Receivable (A/R)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#2e7d32", color: "white" }}>
                      CR — Revenue / Liability
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {newBillRows.map((row, idx) => (
                    <TableRow key={idx} sx={{ bgcolor: row.group === "g1" ? "#f0f8ff" : "#fff5f5" }}>
                      <TableCell sx={{ color: "text.secondary" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: "Nyala, serif", fontWeight: 600 }}>{row.desc}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {fmt(row.amount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "success.main" }}>
                        {fmt(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ "& td": { fontWeight: 800, borderTop: "2px solid #333", fontSize: "0.95rem" } }}>
                    <TableCell />
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="right" sx={{ color: "primary.main" }}>{fmt(newTotal)}</TableCell>
                    <TableCell align="right" sx={{ color: "success.main" }}>{fmt(newTotal)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Old Bill Reversal Table */}
        {oldBillRows.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "#c62828" }}>
              ✕ Old Bill — Reversal (Opposite of Step 1)
            </Typography>
            <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 1.5, overflow: "auto", border: "1px solid #ef5350" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#ef5350", color: "white" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: "#ef5350", color: "white" }}>Charge Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#c62828", color: "white" }}>
                      DR — Revenue (Reversal)
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, bgcolor: "#d32f2f", color: "white" }}>
                      CR — Receivable (Reversal)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {oldBillRows.map((row, idx) => (
                    <TableRow key={idx} sx={{ bgcolor: "#fff5f5" }}>
                      <TableCell sx={{ color: "text.secondary" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: "Nyala, serif", fontWeight: 600 }}>{row.desc}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "error.main" }}>
                        {fmt(row.amount)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "error.dark" }}>
                        {fmt(row.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ "& td": { fontWeight: 800, borderTop: "2px solid #c62828", fontSize: "0.95rem" } }}>
                    <TableCell />
                    <TableCell>TOTAL</TableCell>
                    <TableCell align="right" sx={{ color: "error.main" }}>{fmt(oldTotal)}</TableCell>
                    <TableCell align="right" sx={{ color: "error.dark" }}>{fmt(oldTotal)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Balanced check banner */}
        <Alert severity="success" sx={{ mb: 2.5, fontWeight: 600 }}>
          Combined Journal: Total DR = <strong>{fmt(newTotal + oldTotal)}</strong> ETB, Total CR = <strong>{fmt(newTotal + oldTotal)}</strong> ETB — Balanced ✅
        </Alert>

        {/* Bill comparison cards */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {oldBill && (
            <Paper elevation={0} sx={{ p: 1.5, flex: 1, minWidth: 200, bgcolor: "#fff5f5", border: "1px solid #ef9a9a", borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>OLD BILL (VOIDED)</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>Invoice: {oldBill.billingInvoiceNumber || "-"}</Typography>
              <Typography variant="body2">Period: {oldBill.kifyaWer || "-"}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total: {fmt(oldBill.tekilalaTekefay)} ETB</Typography>
            </Paper>
          )}
          {newBill && (
            <Paper elevation={0} sx={{ p: 1.5, flex: 1, minWidth: 200, bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "success.main" }}>NEW BILL (GENERATED)</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>Invoice: {newBill.billingInvoiceNumber || "-"}</Typography>
              <Typography variant="body2">Period: {newBill.kifyaWer || "-"}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>Total: {fmt(newBill.tekilalaTekefay)} ETB</Typography>
            </Paper>
          )}
        </Box>
      </Box>
    );
  };

  const handleFetchDerashForBill = async (bill) => {
    try {
      if (!bill?.billingInvoiceNumber) {
        toast.error("Missing bill invoice number");
        return;
      }
      setSelectedBillForDerash(bill);
      setDerashLoading(true);
      const res = await bankDerashService.fetchSinglePaidBill(bill.billingInvoiceNumber);
      setDerashResult(res);
      setDerashModalOpen(true);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Fetch failed";
      toast.error(msg);
    } finally {
      setDerashLoading(false);
    }
  };

  const handleSaveDerashPayment = async () => {
    try {
      if (!selectedBillForDerash || !derashResult) return;
      const bill = selectedBillForDerash;
      const paidAmount = Number(String(derashResult.paid_amount || "").toString().replace(/,/g, ""));
      const expected = bill.tekilalaTekefay || 0;
      const diff = Math.abs((paidAmount || 0) - expected);
      if (!(paidAmount > 0) || diff > 0.01) {
        toast.error("Payment mismatch");
        return;
      }
      const moneyCollectedDate = derashResult.paid_dt ? new Date(derashResult.paid_dt).toISOString() : new Date().toISOString();
      const updates = {
        tekilalaYetekefele: (bill.kecreditYetekefele || 0) + paidAmount,
        tekilalaBankYetekefele: paidAmount,
        isPaidThroughBank: true,
        isDerashPaid: true,
        moneyCollectedDate,
        bankPaidConfirmationCode: derashResult.confirmation_code || "",
        bankPaidAgentId: derashResult.agent_name || derashResult.agent_id || "",
      };
      await bankPaymentImportService.updateSingleBankPayment(bill.id, updates);
      toast.success("Payment saved");
      setDerashModalOpen(false);
      setDerashResult(null);
      setSelectedBillForDerash(null);
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Save failed";
      toast.error(msg);
    }
  };

  const handleOpenManualBankPayment = (bill) => {
    if (!bill) return;
    if (bill.isMoneyCollected || bill.moneyCollected) {
      toast.error("Cannot update bank payment: Money has already been collected for this bill.");
      return;
    }
    if (!bill.isBillGenerated) {
      toast.error("Cannot update bank payment: Bill is not generated yet.");
      return;
    }
    setManualBankBill(bill);
    setSelectedBankKey("");
    setManualBankConfirmationCode("");
    setManualBankModalOpen(true);
  };

  const handleCloseManualBankModal = () => {
    setManualBankModalOpen(false);
    setManualBankBill(null);
    setSelectedBankKey("");
    setManualBankConfirmationCode("");
  };

  const handleSaveManualBankPayment = async () => {
    if (!manualBankBill) {
      toast.error("No bill selected.");
      return;
    }
    if (!selectedBankKey) {
      toast.error("Please select a bank.");
      return;
    }
    try {
      setManualBankSaving(true);
      const bill = manualBankBill;
      const paidAmount = bill.tekilalaTekefay || 0;
      if (!(paidAmount > 0)) {
        toast.error("Invalid payment amount.");
        return;
      }
      const moneyCollectedDate = new Date().toISOString();

      const selectedBank =
        activeBillingBanks.find((b) => String(b.bankCode) === String(selectedBankKey)) ||
        activeBillingBanks.find((b) => String(b.id) === String(selectedBankKey));

      const gatewayCode = (selectedBank?.gatewayCode || "").toLowerCase();
      const bankCodeToSend = selectedBank?.bankCode || selectedBankKey;

      if (!bankCodeToSend) {
        toast.error("Selected bank is missing bankCode.");
        return;
      }

      if (gatewayCode === "derash") {
        const updates = {
          tekilalaYetekefele: (bill.kecreditYetekefele || 0) + paidAmount,
          tekilalaBankYetekefele: paidAmount,
          isPaidThroughBank: true,
          isDerashPaid: true,
          moneyCollectedDate,
          bankPaidConfirmationCode: manualBankConfirmationCode || "",
          bankPaidAgentId: String(bankCodeToSend),
        };
        await bankPaymentImportService.updateSingleBankPayment(bill.id, updates);
        toast.success("Derash bank payment updated successfully.");
      } else if (gatewayCode === "unicash") {
        const updateRequests = [
          {
            id: bill.id,
            updates: {
              tekilalaYetekefele: (bill.tekilalaTekefay || 0) + (bill.kecreditYetekefele || 0),
              tekilalaBankYetekefele: bill.tekilalaTekefay || 0,
              isUnicashPaid: true,
              moneyCollectedDate,
              uBankPaidConfirmationCode: manualBankConfirmationCode || "",
              uBankPaidAgentId: String(bankCodeToSend),
            },
          },
        ];
        await unicashPaymentImportService.updateUnicashPayments(updateRequests);
        toast.success("Unicash payment updated successfully.");
      } else {
        const updates = {
          tekilalaYetekefele: (bill.kecreditYetekefele || 0) + paidAmount,
          tekilalaBankYetekefele: paidAmount,
          isPaidThroughBank: true,
          moneyCollectedDate,
          bankPaidConfirmationCode: manualBankConfirmationCode || "",
          bankPaidAgentId: String(bankCodeToSend),
        };
        await bankPaymentImportService.updateSingleBankPayment(bill.id, updates);
        toast.success("Bank payment updated successfully.");
      }
      handleCloseManualBankModal();
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to save bank payment.";
      toast.error(msg);
    } finally {
      setManualBankSaving(false);
    }
  };

  // --- WUZIF ACTION MUTATIONS ---
  const { mutateAsync: removeWuzifAsync, isLoading: isRemovingWuzif } = useMutation({
    mutationFn: (readingId) => readingService.removeWuzif(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Wuzif removed successfully.");
    },
    onError: (error) => toast.error(`Failed to remove wuzif: ${error.message}`),
  });

  const { mutateAsync: returnWuzifAsync, isLoading: isReturningWuzif } = useMutation({
    mutationFn: (readingId) => readingService.returnWuzif(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Wuzif returned successfully.");
    },
    onError: (error) => toast.error(`Failed to return wuzif: ${error.message}`),
  });

  const { mutateAsync: removeKitateAsync, isLoading: isRemovingKitate } = useMutation({
    mutationFn: (readingId) => readingService.removeKitate(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Kitate removed successfully.");
    },
    onError: (error) => toast.error(`Failed to remove kitate: ${error.message}`),
  });

  const { mutateAsync: returnKitateAsync, isLoading: isReturningKitate } = useMutation({
    mutationFn: (readingId) => readingService.returnKitate(readingId),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Kitate returned successfully.");
    },
    onError: (error) => toast.error(`Failed to return kitate: ${error.message}`),
  });

  const onRemoveWuzif = async (readingId) => {
    showConfirm({
      title: "Remove Wuzif",
      content: "Are you sure you want to remove this wuzif?",
      confirmColor: "error",
      onConfirm: () => removeWuzifAsync(readingId),
    });
  };

  const onReturnWuzif = async (readingId) => {
    showConfirm({
      title: "Return Wuzif",
      content: "Are you sure you want to return this wuzif?",
      confirmColor: "success",
      onConfirm: () => returnWuzifAsync(readingId),
    });
  };

  const onToggleKitate = async (readingId, isKitatTenestual) => {
    if (isKitatTenestual) {
      showConfirm({
        title: "Return Kitate",
        content: "Return kitate for this wuzif?",
        confirmColor: "success",
        onConfirm: () => returnKitateAsync(readingId),
      });
    } else {
      showConfirm({
        title: "Remove Kitate",
        content: "Remove kitate for this wuzif?",
        confirmColor: "warning",
        onConfirm: () => removeKitateAsync(readingId),
      });
    }
  };

  const handleActivateBill = async (billId) => {
    const targetBill = customerBills?.find?.((b) => b.id === billId);
    if (targetBill && targetBill.kifyaWer != null) {
      const hasDuplicateActive = customerBills?.some?.(
        (b) => b.id !== billId && b.kifyaWer === targetBill.kifyaWer && b.status === "active"
      );
      if (hasDuplicateActive) {
        toast.error("There is already an active bill for the same payment month.");
        return;
      }
    }

    showConfirm({
      title: "Activate Bill",
      content: "Are you sure you want to activate this bill?",
      confirmColor: "success",
      onConfirm: async () => {
        try {
          await changeReadingStatusAsync({ readingId: billId, status: "active" });
          toast.success("Bill activated successfully!");
          queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
        } catch (error) {
          console.error("Error activating bill:", error);
          toast.error(`Failed to activate bill: ${error.message}`);
        }
      },
    });
  };

  // --- Customer Directory Columns ---
  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 30,
        Cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
      },
      {
        accessorKey: "accountNumber",
        header: "Account Number",
        filterFn: amharicFuzzyFilter,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", color: "primary.main" }}>
              {cell.getValue() || "-"}
            </Typography>
            {cell.getValue() && (
              <Tooltip title="Copy Account Number">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(cell.getValue());
                    toast.info(`Account ${cell.getValue()} copied!`);
                  }}
                  sx={{ p: 0.2 }}
                >
                  <ContentCopyIcon sx={{ fontSize: 13, color: "text.secondary" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        filterFn: amharicFuzzyFilter,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
            {cell.getValue() || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "registeredDate",
        header: "Registered Date",
        Cell: ({ cell }) => {
          const gregorianDate = cell.getValue();
          if (!gregorianDate) return "-";
          return EthiopianCalendarConverterPure.formatEthiopianDate(
            EthiopianCalendarConverterPure.gregorianToEthiopian(gregorianDate),
            "dd/mm/yyyy"
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ cell }) => {
          const status = String(cell.getValue() || "").toLowerCase();
          const isActive = status === "active";
          return (
            <Chip
              size="small"
              label={isActive ? "Active" : "Deleted"}
              color={isActive ? "success" : "default"}
              variant={isActive ? "filled" : "outlined"}
              sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600 }}
            />
          );
        },
      },
    ],
    []
  );

  // --- Bill Columns ---
  const billColumns = useMemo(
    () => [
      {
        id: "actions",
        header: "Actions",
        size: 190,
        Cell: ({ row }) => {
          const bill = row.original;
          const canEditOrDelete = !bill.isMoneyCollected && !bill.moneyCollected;

          if (activeBillTab === 0) {
            return (
              <Box sx={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                <Tooltip title="View Reading Details">
                  <IconButton size="small" onClick={() => setViewReadingId(bill.id)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={derashLoading ? "Fetching..." : "Fetch from Derash"}>
                  <span>
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => handleFetchDerashForBill(bill)}
                      disabled={derashLoading}
                    >
                      {derashLoading ? <CircularProgress size={16} color="inherit" /> : <AccountBalanceIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
                {canEditOrDelete && bill.isBillGenerated && (
                  <Tooltip title="Mark as Paid (Manual Bank)">
                    <span>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenManualBankPayment(bill)}
                        disabled={manualBankSaving}
                      >
                        {manualBankSaving ? <CircularProgress size={16} color="inherit" /> : <PaidIcon fontSize="small" />}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {canEditOrDelete ? (
                  <>
                    <Tooltip title="Edit & Generate Bill (Complaint Correction)">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleEditAndGenerate(bill)}
                        disabled={isChangingStatus || isEditSubmitting}
                      >
                        <PlaylistAddCheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isChangingStatus ? "Deleting..." : "Delete Reading"}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteReading(bill)}
                        disabled={isChangingStatus}
                      >
                        {isChangingStatus ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title="Money already collected">
                    <span>
                      <IconButton size="small" disabled>
                        <WarningIcon fontSize="small" color="disabled" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            );
          }

          const canActivate = !bill.isMoneyCollected && !bill.moneyCollected;
          return (
            <Box sx={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <Tooltip title="View Reading Details">
                <IconButton size="small" onClick={() => setViewReadingId(bill.id)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {canActivate ? (
                <Tooltip title={isChangingStatus ? "Activating..." : "Activate Bill"}>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleActivateBill(bill.id)}
                    disabled={isChangingStatus}
                  >
                    {isChangingStatus ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Money already collected">
                  <span>
                    <IconButton size="small" disabled>
                      <WarningIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
      { header: "#", size: 25, Cell: ({ row }) => row.index + 1 },
      {
        accessorKey: "billingInvoiceNumber",
        header: "Invoice Number",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
            {cell.getValue() || "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "kifyaWer",
        header: "Kifya Wer",
        Cell: ({ cell }) => (
          <Chip size="small" label={cell.getValue() || "-"} sx={{ fontWeight: 600, bgcolor: "grey.100" }} />
        ),
      },
      { accessorKey: "previousReading", header: "Previous Reading" },
      { accessorKey: "lastReading", header: "Last Reading" },
      {
        accessorKey: "consumption",
        header: "Consumption (m³)",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
            {cell.getValue() ?? "-"}
          </Typography>
        ),
      },
      {
        accessorKey: "tekilalaTekefay",
        header: "Total Due (ብር)",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {fmt(cell.getValue())}
          </Typography>
        ),
      },
      {
        accessorKey: "kecreditYetekefele",
        header: "Prepaid (ቅድመ)",
        Cell: ({ cell }) => fmt(cell.getValue()),
      },
      {
        accessorKey: "paymentInfo",
        header: "Payment Status",
        Cell: ({ row }) => {
          const {
            unicashPaid,
            uBankPaidAgentId,
            derashPaid,
            bankName,
            paidOnFrontOffice,
            PaidFromTekemach,
            moneyCollected,
          } = row.original;

          if (moneyCollected) {
            const paymentLocations = [];
            if (unicashPaid) paymentLocations.push(uBankPaidAgentId);
            if (derashPaid) paymentLocations.push(bankName);
            if (PaidFromTekemach) paymentLocations.push("ቅድመ ክፍያ");
            if (paidOnFrontOffice) paymentLocations.push("ቢሮ ተከፍሏል");
            const label = paymentLocations.join(", ") || "ተከፍሏል";
            return (
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                label={label}
                color="success"
                sx={{ fontWeight: 600, fontSize: "0.75rem" }}
              />
            );
          }
          return (
            <Chip
              size="small"
              icon={<ErrorOutlineIcon sx={{ fontSize: "14px !important" }} />}
              label="አልተከፈለም"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          );
        },
      },
    ],
    [activeBillTab, derashLoading, manualBankSaving, isChangingStatus, isEditSubmitting]
  );

  // --- Wuzif Columns ---
  const wuzifColumns = useMemo(() => {
    const baseCols = (billColumns || []).filter((col) => col.id !== "actions");
    return [
      ...baseCols,
      {
        id: "penaltyStatus",
        header: "Penalty Status",
        accessorFn: (row) => (row?.wuzifIsKitatTenestual === true ? "ተነስቷል" : "አለበት"),
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              size="small"
              label={val}
              color={val === "ተነስቷል" ? "success" : "error"}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          );
        },
        size: 140,
      },
      {
        id: "wuzifBirr",
        header: "Wuzif Status",
        accessorFn: (row) => {
          const del = row?.wuzifDeleted;
          if (del === "active") return "አለበት";
          if (del === "deleted") return "ተነስቷል";
          return "-";
        },
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              size="small"
              label={val}
              color={val === "ተነስቷል" ? "default" : "warning"}
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          );
        },
        size: 120,
      },
    ];
  }, [billColumns]);

  // Master Customer Table
  const table = useMaterialReactTable({
    columns,
    data: paginatedData?.content || [],
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    manualPagination: true,
    manualFiltering: true,
    rowCount: paginatedData?.totalElements || 0,
    enableRowNumbers: true,
    rowNumberMode: "original",
    onGlobalFilterChange: setGlobalFilter,
    state: {
      pagination,
      globalFilter,
      isLoading: isCustomersLoading,
      showProgressBars: isFetching,
      showAlertBanner: isCustomersError,
      rowSelection,
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    enableRowActions: true,
    positionActionsColumn: "first",
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.25rem" }}>
        <Tooltip title="View Full Customer Profile">
          <IconButton size="small" onClick={() => setViewedCustomerId(row.original.id)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", p: "4px" }}>
        <Chip
          icon={<WarningIcon sx={{ color: "#e65100 !important" }} />}
          label="Customer Complaint Handling Console"
          sx={{
            fontWeight: 700,
            bgcolor: "#fff3e0",
            color: "#e65100",
            border: "1px solid #ffe0b2",
            py: 0.5,
          }}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={isFetching ? <CircularProgress size={14} /> : <RefreshIcon />}
          onClick={() => refetchCustomersAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<SpeedIcon />}
          onClick={() => setMetersOpen(true)}
          disabled={!selectedCustomerId}
        >
          View Meters
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isCustomersError
      ? { color: "error", children: "Error loading customer directory" }
      : undefined,
  });

  // Customer Bills Table
  const billTable = useMaterialReactTable({
    columns: billColumns,
    data: activeBillTab === 0 ? activeBills : voidedBills,
    state: {
      isLoading: isBillsLoading,
      showAlertBanner: isBillsError,
      showProgressBars: isBillsLoading,
    },
    muiToolbarAlertBannerProps: isBillsError
      ? { color: "error", children: "Error loading bills" }
      : undefined,
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.original.moneyCollected ? "#e8f5e9" : "#fffde7",
        "&:hover": {
          backgroundColor: row.original.moneyCollected ? "#c8e6c9 !important" : "#fff9c4 !important",
        },
      },
    }),
    enableRowActions: false,
  });

  // Wuzif Table
  const wuzifTable = useMaterialReactTable({
    columns: wuzifColumns,
    data: activeWuzifTab === 0 ? activeWuzifList : activeWuzifTab === 1 ? skippedWuzifList : paidWuzifList,
    state: {
      isLoading: isBillsLoading,
      showAlertBanner: isBillsError,
      showProgressBars: isBillsLoading,
    },
    muiToolbarAlertBannerProps: isBillsError
      ? { color: "error", children: "Error loading Wuzif bills" }
      : undefined,
    muiTableBodyRowProps: {
      sx: {
        backgroundColor: "#fffde7",
        "&:hover": { backgroundColor: "#fff9c4 !important" },
      },
    },
    enableRowActions: true,
    positionActionsColumn: "first",
    renderRowActions: ({ row }) => {
      const bill = row.original;
      const readingId = bill.id;
      if (activeWuzifTab === 0) {
        const kitated = bill?.wuzifIsKitatTenestual === true;
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => onRemoveWuzif(readingId)}
              disabled={isRemovingWuzif}
              sx={{ py: 0.2, px: 1, fontSize: "0.75rem" }}
            >
              Remove wuzif
            </Button>
            {kitated ? (
              <Button
                size="small"
                color="success"
                variant="outlined"
                onClick={() => onToggleKitate(readingId, true)}
                disabled={isReturningKitate}
                sx={{ py: 0.2, px: 1, fontSize: "0.75rem" }}
              >
                Return kitate
              </Button>
            ) : (
              <Button
                size="small"
                color="warning"
                variant="outlined"
                onClick={() => onToggleKitate(readingId, false)}
                disabled={isRemovingKitate}
                sx={{ py: 0.2, px: 1, fontSize: "0.75rem" }}
              >
                Remove kitate
              </Button>
            )}
          </Box>
        );
      }
      if (activeWuzifTab === 1) {
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button
              size="small"
              color="success"
              variant="outlined"
              onClick={() => onReturnWuzif(readingId)}
              disabled={isReturningWuzif}
              sx={{ py: 0.2, px: 1, fontSize: "0.75rem" }}
            >
              Return wuzif
            </Button>
          </Box>
        );
      }
      return null;
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setConfirmImportOpen(true);
    event.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    try {
      setConfirmImportOpen(false);
      const result = await customerService.importCustomers(selectedFile);
      setImportResult(result);
      setImportDialogOpen(true);
      refetchCustomersAll();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Import failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setSelectedFile(null);
    }
  };

  const activeFiltersCount = [
    selectedCustomerTypeId,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
  ].filter(Boolean).length;

  const handleClearAllFilters = () => {
    setSelectedCustomerTypeId("");
    setSelectedKebeleId("");
    setSelectedKetenaId("");
    setSelectedBranchId("");
    setSelectedReaderId("");
  };

  // Live consumption calculation in Edit Reading modal
  const liveConsumption = useMemo(() => {
    const curr = parseInt(editReadingData.currentReading);
    const prev = parseInt(editReadingData.previousReading);
    if (isNaN(curr) || isNaN(prev)) return null;
    return curr - prev;
  }, [editReadingData.currentReading, editReadingData.previousReading]);

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        content={confirmState.content}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        confirmColor={confirmState.confirmColor}
        onClose={closeConfirm}
        onConfirm={() => (confirmActionRef.current ? confirmActionRef.current() : undefined)}
      />
      <Breadcrumb pageName="Customer Complaint & History Dossier" />

      {/* MASTER SECTION: Customer Directory & Top Filter Bar */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tabs
              value={activeCustomerTab}
              onChange={handleCustomerTabChange}
              aria-label="customer status tabs"
              sx={{ minHeight: 40 }}
            >
              <Tab label="Active Customers" sx={{ fontWeight: 600 }} />
              <Tab label="Deleted Accounts" sx={{ fontWeight: 600 }} />
            </Tabs>
          </Box>

          {selectedCustomerId && (
            <Button
              size="small"
              variant="text"
              startIcon={isCustomerDirectoryExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={() => setIsCustomerDirectoryExpanded(!isCustomerDirectoryExpanded)}
              sx={{ fontWeight: 600 }}
            >
              {isCustomerDirectoryExpanded ? "Collapse Directory Table" : "Expand Customer Directory"}
            </Button>
          )}
        </Box>

        {/* Top Filters Bar */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center", mb: 2 }}>
          {/* Customer Type Filter */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Customer Type</InputLabel>
            <Select
              value={selectedCustomerTypeId}
              label="Customer Type"
              onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
              disabled={isCustomerTypesLoading}
            >
              <MenuItem value="">
                <em>All Types</em>
              </MenuItem>
              {customerTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name || `Type ${type.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Kebele Filter */}
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
              <MenuItem value="">
                <em>All Kebeles</em>
              </MenuItem>
              {kebeles.map((kebele) => (
                <MenuItem key={kebele.id} value={kebele.id}>
                  {kebele.name || `Kebele ${kebele.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ketena Filter - Independent or Scoped */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Ketena</InputLabel>
            <Select
              value={selectedKetenaId}
              label="Ketena"
              onChange={(e) => setSelectedKetenaId(e.target.value)}
              disabled={isKetenasLoading}
            >
              <MenuItem value="">
                <em>All Ketenas</em>
              </MenuItem>
              {ketenas.map((ketena) => (
                <MenuItem key={ketena.id} value={ketena.id}>
                  {ketena.name || `Ketena ${ketena.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Branch Filter */}
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
              <MenuItem value="">
                <em>All Branches</em>
              </MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name || `Branch ${branch.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Reader Filter */}
          <FormControl size="small" sx={{ minWidth: 150 }} disabled={!selectedBranchId}>
            <InputLabel>Reader</InputLabel>
            <Select
              value={selectedReaderId}
              label="Reader"
              onChange={(e) => setSelectedReaderId(e.target.value)}
              disabled={isReadersLoading || !selectedBranchId}
            >
              <MenuItem value="">
                <em>All Readers</em>
              </MenuItem>
              {readers.map((reader) => (
                <MenuItem key={reader.id} value={reader.id}>
                  {reader.name || `Reader ${reader.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearAllFilters}
              sx={{ fontWeight: 600 }}
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </Box>

        {/* Collapsible Customer Directory Table */}
        <Collapse in={isCustomerDirectoryExpanded || !selectedCustomerId}>
          <MaterialReactTable table={table} />
        </Collapse>
      </Paper>

      {/* DETAIL WORKSPACE: Rendered when a customer is selected */}
      {selectedCustomerId ? (
        <Box>
          {/* CUSTOMER 360 EXECUTIVE SPOTLIGHT DOSSIER */}
          <Paper
            elevation={3}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 2,
              background: "linear-gradient(135deg, #ffffff 0%, #f8fafd 100%)",
              border: "1px solid #e2e8f0",
            }}
          >
            <Grid container spacing={2.5} alignItems="center">
              {/* Left Column: Customer Profile */}
              <Grid item xs={12} md={4}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                        {selectedCustomerRecord?.fullName || "Selected Customer"}
                      </Typography>
                      <Chip
                        size="small"
                        label={selectedCustomerRecord?.status === "active" ? "Active Account" : "Inactive"}
                        color={selectedCustomerRecord?.status === "active" ? "success" : "default"}
                        sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" sx={{ fontFamily: "monospace", fontWeight: 700, color: "primary.dark" }}>
                        Acc: {selectedCustomerRecord?.accountNumber || "-"}
                      </Typography>
                      {selectedCustomerRecord?.accountNumber && (
                        <Tooltip title="Copy Account Number">
                          <IconButton
                            size="small"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedCustomerRecord.accountNumber);
                              toast.info("Account number copied!");
                            }}
                            sx={{ p: 0.2 }}
                          >
                            <ContentCopyIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                      Phone: {selectedCustomerRecord?.phoneNumber || "-"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Middle Column: Live Financial KPI Badges */}
              <Grid item xs={12} md={5}>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "#fffde7",
                      border: "1px solid #fff59d",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#795548", fontWeight: 700 }}>
                      UNPAID INVOICES ({customerFinancials.unpaidBillsCount})
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#e65100" }}>
                      {fmt(customerFinancials.unpaidBillsTotal)} ETB
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 120,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "#fff3e0",
                      border: "1px solid #ffe0b2",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#e65100", fontWeight: 700 }}>
                      ACTIVE WUZIF ({customerFinancials.activeWuzifCount})
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#d84315" }}>
                      {fmt(customerFinancials.activeWuzifTotal)} ETB
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 130,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "#fbe9e7",
                      border: "1px solid #ffccbc",
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#b71c1c", fontWeight: 800 }}>
                      NET BALANCE DUE
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: "#c62828" }}>
                      {fmt(customerFinancials.totalOutstanding)} ETB
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Right Column: Quick Action Buttons */}
              <Grid item xs={12} md={3} sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: { xs: "flex-start", md: "flex-end" } }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SpeedIcon />}
                    onClick={() => setMetersOpen(true)}
                  >
                    Meters
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setViewedCustomerId(selectedCustomerId)}
                  >
                    Profile
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={isBillsLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
                    onClick={() => refetchBillData()}
                    disabled={isBillsLoading}
                  >
                    Refresh
                  </Button>
                </Box>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => {
                    setRowSelection({});
                    setSelectedCustomerId(null);
                    setIsCustomerDirectoryExpanded(true);
                  }}
                  startIcon={<CloseIcon />}
                  sx={{ fontSize: "0.75rem", textTransform: "none" }}
                >
                  Switch / Deselect Customer
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* SEGMENTED CUSTOMER LEDGER WORKSPACE */}
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
            {/* Primary Detail Workspace Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8fafd", px: 2, pt: 1 }}>
              <Tabs
                value={detailWorkspaceTab}
                onChange={(e, v) => setDetailWorkspaceTab(v)}
                aria-label="customer ledger sections"
              >
                <Tab
                  icon={<ReceiptLongIcon />}
                  iconPosition="start"
                  label={`Billing & Readings (${activeBills.length} Active, ${voidedBills.length} Voided)`}
                  sx={{ fontWeight: 700 }}
                />
                <Tab
                  icon={<AccountBalanceWalletIcon />}
                  iconPosition="start"
                  label={`Wuzif & Arrears Ledger (${activeWuzifList.length} Active, ${skippedWuzifList.length} Skipped, ${paidWuzifList.length} Paid)`}
                  sx={{ fontWeight: 700 }}
                />
              </Tabs>
            </Box>

            {/* TAB 0: BILLING & READINGS HISTORY */}
            {detailWorkspaceTab === 0 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                  <Tabs
                    value={activeBillTab}
                    onChange={handleBillTabChange}
                    aria-label="bill status tabs"
                    sx={{ minHeight: 36 }}
                  >
                    <Tab label={`Active Bills (${activeBills.length})`} sx={{ fontWeight: 600 }} />
                    <Tab label={`Voided Bills (${voidedBills.length})`} sx={{ fontWeight: 600 }} />
                  </Tabs>

                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    💡 Edit readings is permitted only on bills where payment has not yet been collected.
                  </Typography>
                </Box>
                <MaterialReactTable key={`bill-${activeBillTab}`} table={billTable} />
              </Box>
            )}

            {/* TAB 1: WUZIF & ARREARS LEDGER */}
            {detailWorkspaceTab === 1 && (
              <Box sx={{ p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
                  <Tabs
                    value={activeWuzifTab}
                    onChange={handleWuzifTabChange}
                    aria-label="wuzif status tabs"
                    sx={{ minHeight: 36 }}
                  >
                    <Tab label={`Active Wuzif (${activeWuzifList.length})`} sx={{ fontWeight: 600 }} />
                    <Tab label={`Skipped Wuzif (${skippedWuzifList.length})`} sx={{ fontWeight: 600 }} />
                    <Tab label={`Paid Wuzif (${paidWuzifList.length})`} sx={{ fontWeight: 600 }} />
                  </Tabs>

                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    ⚖️ Active wuzif rows can be removed or have penalties (kitat) waived per resolution policies.
                  </Typography>
                </Box>
                <MaterialReactTable key={`wuzif-${activeWuzifTab}`} table={wuzifTable} />
              </Box>
            )}
          </Paper>
        </Box>
      ) : (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center", borderRadius: 2, bgcolor: "#fafafa", border: "1px dashed #cbd5e1" }}>
          <SearchIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            No Customer Account Selected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: "auto", mt: 0.5 }}>
            Search by Account Number, Full Name, or Phone in the directory table above, and select a customer row to view their billing history, perform reading corrections, and manage wuzif arrears.
          </Typography>
        </Paper>
      )}

      {/* ==================== EXECUTIVE PRO MODALS ==================== */}

      {/* 1. Edit Reading Modal with Multi-step In-Modal Workflow */}
      <Dialog
        open={editReadingModalOpen}
        onClose={editModalStep === "PROCESSING" ? undefined : handleCloseEditReadingModal}
        maxWidth={editModalStep === "JOURNAL" ? "md" : "sm"}
        fullWidth
      >
        {/* Title */}
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor:
              editModalStep === "JOURNAL"
                ? "#f0fdf4"
                : editModalStep === "PROCESSING"
                ? "#fff8e1"
                : "#fff3e0",
            borderBottom:
              editModalStep === "JOURNAL"
                ? "1px solid #bbf7d0"
                : editModalStep === "PROCESSING"
                ? "1px solid #ffe082"
                : "1px solid #ffe0b2",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {editModalStep === "JOURNAL" ? (
              <ReceiptLongIcon sx={{ color: "#166534" }} />
            ) : editModalStep === "PROCESSING" ? (
              <CircularProgress size={20} sx={{ color: "#e65100" }} />
            ) : (
              <EditIcon sx={{ color: "#e65100" }} />
            )}
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: editModalStep === "JOURNAL" ? "#166534" : "#e65100",
                  lineHeight: 1.2,
                }}
              >
                {editModalStep === "JOURNAL"
                  ? journalPreviewData?.mode === "billPrep"
                    ? "📋 Bill Preparation — Revenue Recognition"
                    : "📋 Journal Adjustment Review & Push"
                  : editModalStep === "PROCESSING"
                  ? "Processing Complaint Adjustment..."
                  : isEditAndGenerate
                  ? "Edit & Generate Bill"
                  : "Edit Reading — Customer Complaint"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editModalStep === "JOURNAL" && journalPreviewData?.invoiceNum
                  ? `Invoice: ${journalPreviewData.invoiceNum} — ${journalPreviewData.newBill?.kifyaWer || journalPreviewData.oldBill?.kifyaWer || ""}`
                  : editModalStep === "PROCESSING"
                  ? "Applying corrections and generating new invoice..."
                  : "Reading adjustment and complaint resolution workflow"}
              </Typography>
            </Box>
          </Box>

          {editModalStep !== "PROCESSING" && (
            <IconButton size="small" onClick={handleCloseEditReadingModal}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ pt: 2.5 }}>
          {/* STEP: INPUT */}
          {editModalStep === "INPUT" && (
            <>
              <Alert severity="warning" sx={{ mb: 2.5 }}>
                This will void the active reading and generate an adjusted reading row with your inputs.
              </Alert>

              {selectedBillForEdit && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0", mb: 2.5 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Invoice Number:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                        {selectedBillForEdit.billingInvoiceNumber || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Billing Period:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedBillForEdit.kifyaWer || "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Current Recorded Reading:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedBillForEdit.lastReading ?? "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Recorded Consumption:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedBillForEdit.consumption ?? "-"} m³
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              <TextField
                autoFocus
                margin="dense"
                label="Previous Reading"
                type="number"
                fullWidth
                variant="outlined"
                value={editReadingData.previousReading}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditReadingData((prev) => ({ ...prev, previousReading: value }));
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                margin="dense"
                label="New Current Reading"
                type="number"
                fullWidth
                variant="outlined"
                value={editReadingData.currentReading}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditReadingData((prev) => ({ ...prev, currentReading: value }));
                }}
                error={!!validationError}
                helperText={validationError}
              />

              {liveConsumption !== null && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: liveConsumption >= 0 ? "#e8f5e9" : "#ffebee",
                    border: liveConsumption >= 0 ? "1px solid #a5d6a7" : "1px solid #ef9a9a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalculateIcon sx={{ color: liveConsumption >= 0 ? "success.main" : "error.main" }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: liveConsumption >= 0 ? "success.dark" : "error.dark" }}>
                      {liveConsumption >= 0 ? "Calculated Consumption:" : "Invalid Consumption:"}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${liveConsumption} m³`}
                    color={liveConsumption >= 0 ? "success" : "error"}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              )}
            </>
          )}

          {/* STEP: PROCESSING */}
          {editModalStep === "PROCESSING" && (
            <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
              <CircularProgress size={46} sx={{ color: "#e65100", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                {processingStepText || "Processing complaint resolution..."}
              </Typography>
              <Box sx={{ width: "80%", mx: "auto", mt: 2, mb: 3 }}>
                <LinearProgress variant="determinate" value={processingProgress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Stack spacing={1.5} sx={{ maxWidth: 380, mx: "auto", textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {processingProgress >= 25 ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CircularProgress size={16} />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: processingProgress >= 25 ? 600 : 400 }}>
                    1. Void active reading & save new readings
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {processingProgress >= 75 ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : processingProgress >= 40 ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #ccc" }} />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: processingProgress >= 75 ? 600 : 400 }}>
                    2. Recalculate tariffs & generate new bill
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {processingProgress >= 100 ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : processingProgress >= 75 ? (
                    <CircularProgress size={16} />
                  ) : (
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #ccc" }} />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: processingProgress >= 100 ? 600 : 400 }}>
                    3. Compute DR/CR journal adjustment entries
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* STEP: JOURNAL */}
          {editModalStep === "JOURNAL" && renderJournalPreviewContent(journalPreviewData)}
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {editModalStep === "INPUT" && (
            <>
              <Button onClick={handleCloseEditReadingModal}>Cancel</Button>
              <Button
                onClick={handleEditReadingSubmit}
                variant="contained"
                color="warning"
                disabled={
                  isEditSubmitting ||
                  !editReadingData.currentReading ||
                  !editReadingData.previousReading ||
                  (liveConsumption !== null && liveConsumption < 0)
                }
                sx={{ fontWeight: 700, px: 3 }}
              >
                {isEditSubmitting ? "Processing..." : isEditAndGenerate ? "Update & Generate Bill" : "Update Reading"}
              </Button>
            </>
          )}

          {editModalStep === "PROCESSING" && null}

          {editModalStep === "JOURNAL" && (
            <>
              <Button onClick={handleCloseEditReadingModal} disabled={journalPushLoading}>
                Close / Review Later
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleJournalPreviewPush}
                disabled={journalPushLoading || !journalPreviewData}
                sx={{ bgcolor: "#00897b", "&:hover": { bgcolor: "#00695c" }, fontWeight: 700, px: 3 }}
              >
                {journalPushLoading ? "Pushing..." : "Push to Journal (DRAFT)"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* 2. Standalone Journal Preview Dialog (Used for Delete Reading) */}
      <Dialog open={journalPreviewOpen} onClose={handleCloseJournalPreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#166534" }}>
              {journalPreviewData?.mode === "billPrep"
                ? "📋 Bill Preparation — Revenue Recognition"
                : journalPreviewData?.isVoidOnly
                  ? "📋 Journal Reversal Preview"
                  : "📋 Journal Adjustment Preview"}
            </Typography>
            {journalPreviewData?.invoiceNum && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Invoice: <strong>{journalPreviewData.invoiceNum}</strong>
                {(journalPreviewData.newBill?.kifyaWer || journalPreviewData.oldBill?.kifyaWer) &&
                  ` — ${journalPreviewData.newBill?.kifyaWer || journalPreviewData.oldBill?.kifyaWer}`}
              </Typography>
            )}
          </Box>
          <Button color="error" onClick={handleCloseJournalPreview} sx={{ fontWeight: 700 }}>
            ✕ Close
          </Button>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {renderJournalPreviewContent(journalPreviewData)}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseJournalPreview} disabled={journalPushLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleJournalPreviewPush}
            disabled={journalPushLoading || !journalPreviewData}
            sx={{ bgcolor: "#00897b", "&:hover": { bgcolor: "#00695c" }, fontWeight: 700, px: 4 }}
          >
            {journalPushLoading ? "Pushing..." : "Push to Journal (DRAFT)"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3. Derash Payment Settlement Modal */}
      <Dialog open={derashModalOpen} onClose={() => setDerashModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          Derash Payment Verification
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {selectedBillForDerash && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: 1.5, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Invoice: {selectedBillForDerash.billingInvoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected Amount: <strong>{fmt(selectedBillForDerash.tekilalaTekefay)} ETB</strong>
              </Typography>
            </Paper>
          )}

          {derashResult ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "120px 1fr", rowGap: 1.5, columnGap: 2, p: 2, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
              <Typography variant="body2" color="text.secondary">Agent / Channel:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {derashResult.agent_name || derashResult.agent_id || "-"}
              </Typography>

              <Typography variant="body2" color="text.secondary">Paid Date:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {derashResult.paid_dt || "-"}
              </Typography>

              <Typography variant="body2" color="text.secondary">Paid Amount:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "success.main" }}>
                {fmt(derashResult.paid_amount)} ETB
              </Typography>

              <Typography variant="body2" color="text.secondary">Confirmation:</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                {derashResult.confirmation_code || "-"}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No payment record retrieved from Derash.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDerashModalOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveDerashPayment}
            disabled={!derashResult || !selectedBillForDerash}
            sx={{ fontWeight: 700 }}
          >
            Save Verified Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* 4. Manual Bank Payment Modal */}
      <Dialog open={manualBankModalOpen} onClose={handleCloseManualBankModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          Record Bank Payment
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          {manualBankBill && (
            <Paper elevation={0} sx={{ p: 2, bgcolor: "#f1f5f9", borderRadius: 1.5, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Invoice: {manualBankBill.billingInvoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected Amount: <strong>{fmt(manualBankBill.tekilalaTekefay)} ETB</strong>
              </Typography>
            </Paper>
          )}

          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="manual-bank-select-label">Select Bank</InputLabel>
            <Select
              labelId="manual-bank-select-label"
              label="Select Bank"
              value={selectedBankKey}
              onChange={(e) => setSelectedBankKey(e.target.value)}
              disabled={isBillingBanksLoading || manualBankSaving || !activeBillingBanks.length}
            >
              {activeBillingBanks.map((bank) => (
                <MenuItem key={bank.id} value={bank.bankCode || bank.id}>
                  {bank.bankName || bank.bankCode || bank.gatewayCode || bank.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="normal"
            label="Confirmation Code (optional)"
            fullWidth
            size="small"
            value={manualBankConfirmationCode}
            onChange={(e) => setManualBankConfirmationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseManualBankModal} disabled={manualBankSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveManualBankPayment}
            disabled={manualBankSaving || !selectedBankKey}
            sx={{ fontWeight: 700 }}
          >
            {manualBankSaving ? "Saving..." : "Save Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 5. Auxiliary Modals */}
      <ViewCustomerModal
        open={!!viewedCustomer}
        onClose={() => setViewedCustomerId(null)}
        customer={viewedCustomer}
        isLoading={isCustomerDetailsFetching}
        lookupData={{ customerTypes, meterSizes, kebeles, branches }}
      />

      <MetersModal
        meterSizes={meterSizes}
        open={isMetersOpen}
        onClose={() => setMetersOpen(false)}
        customerId={selectedCustomerId}
      />

      <ReadingDetailModal
        open={!!viewReadingId}
        onClose={() => setViewReadingId(null)}
        readingId={viewReadingId}
      />

      {/* Import Confirmation and Results Dialogs */}
      <Dialog open={confirmImportOpen} onClose={() => setConfirmImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Customer Import</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to import customers from this file?</Typography>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 700 }}>
            File: {selectedFile?.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmImportOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmImport} color="primary" variant="contained" startIcon={<CloudUploadIcon />}>
            Confirm Import
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Import Results</DialogTitle>
        <DialogContent>
          {importResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Imported: {importResult.importedCount || 0} customers | Skipped: {importResult.skippedCount || 0} rows
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const CustomerListPage = () => (
  <QueryClientProvider client={queryClient}>
    <CustomerList />
  </QueryClientProvider>
);

export default CustomerListPage;
