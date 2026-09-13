"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Button, Grid, Paper, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, Tooltip, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, Snackbar, Alert } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
import EditIcon from "@mui/icons-material/Edit";
import WarningIcon from "@mui/icons-material/Warning";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { ReadingService } from "../../../lib/ReadingService";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaidIcon from '@mui/icons-material/Paid';
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
    newCharges.forEach(item => {
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
      newBillRows.push({ desc: item.desc, group: item.group, amount: amt });
    });
  }

  // ── Old Bill Reversal (opposite of Step 1: DR Revenue / CR Receivable) ──
  if (oldBill) {
    const oldCharges = getChargeItems(oldBill);
    oldCharges.forEach(item => {
      const amt = Math.round((item.amount || 0) * 100) / 100;
      if (amt <= 0) return;
      const drAccId = bpMappings[item.drKey];
      const crAccId = bpMappings[item.crKey];
      if (!drAccId) missingAccounts.push(`DR: ${item.desc}`);
      if (!crAccId) missingAccounts.push(`CR: ${item.desc}`);
      if (!drAccId || !crAccId) return;

      // Reversed: DR Revenue (crAccId) / CR Receivable (drAccId)
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
      oldBillRows.push({ desc: item.desc, group: item.group, amount: amt });
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

const CustomerList = () => {
  const queryClient = useQueryClient();
  const [viewedCustomerId, setViewedCustomerId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState(0);
  const [activeBillTab, setActiveBillTab] = useState(0);
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const fileInputRef = useRef(null);
  const [viewReadingId, setViewReadingId] = useState(null);
  // Wuzif management tab state (applies only to the 3rd table)
  const [activeWuzifTab, setActiveWuzifTab] = useState(0);
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

  // --- Journal preview dialog state ---
  const [journalPreviewOpen, setJournalPreviewOpen] = useState(false);
  const [journalPreviewData, setJournalPreviewData] = useState(null);
  const [journalPushLoading, setJournalPushLoading] = useState(false);

  useEffect(() => {
    // Load BP_ account mappings and open fiscal year for journal adjustments
    const loadJournalSupportData = async () => {
      try {
        const [mappingsData, fyData] = await Promise.all([
          fncBillingAccountMapService.getAllMappings().catch(() => []),
          fncFiscalYearService.getOpenFiscalYears().catch(() => []),
        ]);
        const bpMap = {};
        if (Array.isArray(mappingsData)) {
          mappingsData.forEach(m => {
            if (m.mappingKey && m.mappingKey.startsWith("BP_")) {
              bpMap[m.mappingKey] = m.accountId;
            }
          });
        }
        setBpMappings(bpMap);
        if (Array.isArray(fyData) && fyData.length > 0) {
          setOpenFiscalYearId(fyData[0].id);
        }
      } catch (e) {
        console.warn("[JournalAdjustment] Failed to load support data:", e);
      }
    };
    loadJournalSupportData();
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

  const handleGenerateBill = (bill) => {
    if (!bill || bill.isBillGenerated) {
      toast.info("Bill is already generated.");
      return;
    }
    showConfirm({
      title: "Generate Bill",
      content: "Generate bill for this reading?",
      confirmColor: "primary",
      onConfirm: async () => {
        try {
          await generateBillAsync(bill.id);
        } catch (e) {
          // Error handled in mutation onError
        }
      },
    });
  };
  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));
  // Fetch data for dropdowns
  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
    onSuccess: (data) => {
      //console.log('Fetched kebeles:', data);
      if (data && data.length > 0) {
        //console.log('First kebele object keys:', Object.keys(data[0]));
      }
    },
    onError: (error) => {
      console.error('Error fetching kebeles:', error);
    }
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
    onSuccess: (data) => {
    //  console.log('Fetched branches:', data);
      if (data && data.length > 0) {
       // console.log('First branch object keys:', Object.keys(data[0]));
      }
    },
    onError: (error) => {
      console.error('Error fetching branches:', error);
    }
  });

  const { data: meterSizes = [] } = useQuery({
    queryKey: ["meterSizes"],
    queryFn: () => dropdownService.getMeterSizes(),
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
    onSuccess: (data) => {
      //console.log('Fetched customer types:', data);
    },
    onError: (error) => {
      console.error('Error fetching customer types:', error);
    }
  });

  // Fetch ketenas based on selected kebele
  const { data: ketenas = [], isLoading: isKetenasLoading } = useQuery({
    queryKey: ["ketenas", selectedKebeleId],
    queryFn: () => {
      if (!selectedKebeleId) return [];
      return dropdownService.getKetenasByKebele(selectedKebeleId);
    },
    enabled: !!selectedKebeleId,
    onError: (error) => {
      console.error('Error fetching ketenas:', error);
    }
  });

  // Fetch readers based on selected branch
  const { data: readers = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return [];
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
    enabled: !!selectedBranchId,
    onError: (error) => {
      console.error('Error fetching readers:', error);
    }
  });

  const { data: billingBanks = [], isLoading: isBillingBanksLoading } = useQuery({
    queryKey: ["billing-banks-all-for-manual"],
    queryFn: () => billingBanksService.getAllBillingBanks(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
    onError: (error) => {
      console.error("Error fetching billing banks:", error);
    },
  });

  // Cached helper fetchers for dependent dropdowns (shared with child modals)
  const getKetenasByKebeleCached = async (kebeleId) => {
    if (!kebeleId) return [];
    return queryClient.fetchQuery({
      queryKey: ["ketenas", kebeleId],
      queryFn: () => dropdownService.getKetenasByKebele(kebeleId),
      staleTime: Infinity,
    });
  };

  const handleDeleteReading = async (bill) => {
    // Only allow delete if money is not collected (removed bill generation check)
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
          // Snapshot old bill data BEFORE deletion
          const oldBillSnapshot = { ...bill };
          await changeReadingStatusAsync({ readingId: bill.id, status: 'deleted' });
          toast.success('Reading deleted successfully.');
          queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);

          // If old bill was journal-pushed, show reversal journal preview
          if (wasJournalPushed && openFiscalYearId && Object.keys(bpMappings).length > 0) {
            const invoiceNum = oldBillSnapshot.billingInvoiceNumber || oldBillSnapshot.invoiceNumber || oldBillSnapshot.id;
            const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillSnapshot, null, bpMappings);
            if (!error && lines.length >= 2) {
              setJournalPreviewData({ lines, newBillRows, oldBillRows, oldBill: oldBillSnapshot, newBill: null, invoiceNum, isVoidOnly: true });
              setJournalPreviewOpen(true);
            } else if (error) {
              toast.warning(`Journal reversal skipped: ${error}`);
            }
          }
        } catch (error) {
          console.error("Error deleting reading:", error);
          toast.error(`Failed to delete reading: ${error.message}`);
        }
      },
    });
  };

  const getReadersByBranchCached = async (branchId) => {
    if (!branchId) return [];
    return queryClient.fetchQuery({
      queryKey: ["readers", branchId],
      queryFn: () => dropdownService.getReadersByBranch(branchId),
      staleTime: Infinity,
    });
  };
  // Modal States
  // Removed customer creation functionality for complaint handling
  // const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editReadingModalOpen, setEditReadingModalOpen] = useState(false);
  const [selectedBillForEdit, setSelectedBillForEdit] = useState(null);
  const [editReadingData, setEditReadingData] = useState({ currentReading: '', previousReading: '' });
  const [validationError, setValidationError] = useState('');
  const [isEditAndGenerate, setIsEditAndGenerate] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  // Removed customer editing functionality for complaint handling

  const handleBillTabChange = (event, newValue) => {
    setActiveBillTab(newValue);
  };

  const handleCustomerTabChange = (event, newValue) => {
    setActiveCustomerTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
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
  }, [rowSelection]);
  
  // Reset Wuzif tab to first tab when customer selection changes
  useEffect(() => {
    setActiveWuzifTab(0);
  }, [selectedCustomerId]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(globalFilter);
      // Reset pageIndex when search changes to avoid out of bounds
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [globalFilter]);

  // Reset pagination index when filters change
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
      const customerService = new CustomerService();
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
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });


  const { data: viewedCustomer, isFetching: isCustomerDetailsFetching } =
    useQuery({
      queryKey: ["customer-details", viewedCustomerId],
      queryFn: () => {
        if (!viewedCustomerId) return null;
        const customerService = new CustomerService();
        return customerService.getCustomerById(viewedCustomerId);
      },
      enabled: !!viewedCustomerId,
    });

  // Removed editingCustomer query for complaint handling mode

  // --- 1. SINGLE, COMBINED DATA FETCH ---
  const {
    data: combinedBillData,
    isLoading: isBillsLoading,
    isError: isBillsError,
    refetch: refetchBillData,
  } = useQuery({
    queryKey: ["customer-all-bill-data", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      // Use the new, efficient service method
      return readingService.getCombinedBillDataForCustomer(selectedCustomerId);
    },
    enabled: !!selectedCustomerId,
    staleTime: 0, // Always consider data stale so manual refresh works
    cacheTime: 0, // Don't cache the data
    keepPreviousData: true, // avoid UI flicker during refetch
    retry: 2, // limit retries to reduce long waits
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    refetchOnWindowFocus: false, // Only fetch on customer selection and manual refresh
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // === MUTATIONS for CRUD operations ===

  // Removed customer CREATE/UPDATE mutations for complaint handling
  // Customer management is not allowed in complaint handling mode

  // ADD Reading mutation for complaint handling
  const { mutateAsync: addReading, isLoading: isAddingReading } = useMutation({
    mutationFn: ({ customerAccountNumber, lastReading, kifyaWer }) =>
      readingService.addReading(customerAccountNumber, lastReading, kifyaWer),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Reading updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating reading:", error);
      toast.error(error.message || "Failed to update reading");
    },
  });

  // CHANGE Reading Status mutation for complaint handling
  const { mutate: changeReadingStatus, mutateAsync: changeReadingStatusAsync, isLoading: isChangingStatus } = useMutation({
    mutationFn: ({ readingId, status, previousReading, currentReading }) => 
      readingService.changeReadingStatus(readingId, status, previousReading, currentReading),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Reading status changed successfully!");
    },
    onError: (error) => toast.error(`Error changing reading status: ${error.message}`),
  });

  // GENERATE single bill mutation (per-row action)
  const { mutateAsync: generateBillAsync, isLoading: isGeneratingBill } = useMutation({
    mutationFn: (readingId) => readingService.generateBills([readingId]),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Bill generated successfully!");
    },
    onError: (error) => {
      const msg = error?.message || "Failed to generate bill.";
      toast.error(msg);
    },
  });

  // DELETE active and RECREATE new reading (per complaint resolution rules)
  const { mutateAsync: deleteAndRecreateAsync, isLoading: isDeletingRecreating } = useMutation({
    mutationFn: ({ readingId, previousReading, currentReading }) =>
      readingService.deleteActiveAndCreateNewReading(readingId, previousReading, currentReading),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
      toast.success("Old reading deleted and new reading created!");
    },
    onError: (error) => toast.error(`Error applying changes: ${error.message}`),
  });

  // Removed customer deactivate/activate/import mutations for complaint handling mode

  // Removed customer create/update handlers for complaint handling
  // Added reading edit handlers for complaint handling
  
  const handleEditReading = (bill) => {
    // Check business rule: block only when money is collected
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
          currentReading: bill.lastReading?.toString() || '',
          previousReading: bill.previousReading?.toString() || '',
        });
        setValidationError('');
        setEditReadingModalOpen(true);
      },
    });
  };

  const handleEditAndGenerate = (bill) => {
    // Same guards as handleEditReading
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
          currentReading: bill.lastReading?.toString() || '',
          previousReading: bill.previousReading?.toString() || '',
        });
        setValidationError('');
        setIsEditAndGenerate(true);
        setEditReadingModalOpen(true);
      },
    });
  };

  const handleEditReadingSubmit = async () => {
    // Prevent double submits if user clicks very fast
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
    
    setValidationError('');
    setIsEditSubmitting(true);

    // Snapshot the old bill data BEFORE the edit (for journal adjustment)
    const oldBillSnapshot = { ...selectedBillForEdit };
    const wasJournalPushed = !!(oldBillSnapshot.isJournalPushed || oldBillSnapshot.journalPushed);

    try {
      // New rule: delete active selected reading and create a new one with provided readings
      const result = await deleteAndRecreateAsync({
        readingId: selectedBillForEdit.id,
        previousReading: prevReading,
        currentReading: newReading,
      });

      // Close modal and reset state
      setEditReadingModalOpen(false);
      setSelectedBillForEdit(null);
      setEditReadingData({ currentReading: '', previousReading: '' });

      // If combined Edit & Generate mode, auto-generate the new bill then show journal preview
      if (isEditAndGenerate) {
        let generatedNewBill = null;
        try {
          // Wait briefly for backend to persist the new reading
          await new Promise(resolve => setTimeout(resolve, 1000));
          let freshData = await readingService.getCombinedBillDataForCustomer(selectedCustomerId);
          let allBills = freshData?.bills || freshData || [];
          const newBillToGenerate = allBills.find(b =>
            b.kifyaWer === oldBillSnapshot.kifyaWer &&
            !b.isVoid && !b.void &&
            String(b.status).toLowerCase() === 'active' &&
            !b.isBillGenerated
          );
          if (newBillToGenerate) {
            await generateBillAsync(newBillToGenerate.id);
            toast.success("Bill generated successfully after edit!");

            // Re-fetch to get the generated bill with calculated charges
            await new Promise(resolve => setTimeout(resolve, 1000));
            freshData = await readingService.getCombinedBillDataForCustomer(selectedCustomerId);
            allBills = freshData?.bills || freshData || [];
            generatedNewBill = allBills.find(b =>
              b.kifyaWer === oldBillSnapshot.kifyaWer &&
              !b.isVoid && !b.void &&
              String(b.status).toLowerCase() === 'active' &&
              b.isBillGenerated
            );
          } else {
            toast.warning("Reading updated but could not find new bill to generate. Please generate manually.");
          }
        } catch (genErr) {
          toast.warning(`Reading updated but bill generation failed: ${genErr.message}. Please generate manually.`);
        } finally {
          setIsEditAndGenerate(false);
        }

        // Always show journal preview after Edit & Generate (if new bill was generated and mappings exist)
        if (generatedNewBill && Object.keys(bpMappings).length > 0) {
          try {
            const invoiceNum = generatedNewBill.billingInvoiceNumber || generatedNewBill.invoiceNumber || generatedNewBill.id;
            // If old bill was journal-pushed: adjustment mode (reversal + new push)
            // If not: billPrep mode (new bill push only, Step 1 style)
            const oldBillForJournal = wasJournalPushed ? oldBillSnapshot : null;
            const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillForJournal, generatedNewBill, bpMappings);
            if (!error && lines.length >= 2) {
              setJournalPreviewData({
                lines, newBillRows, oldBillRows,
                oldBill: wasJournalPushed ? oldBillSnapshot : null,
                newBill: generatedNewBill,
                invoiceNum,
                isVoidOnly: false,
                mode: wasJournalPushed ? 'adjustment' : 'billPrep',
              });
              setJournalPreviewOpen(true);
            } else if (error) {
              toast.warning(`Journal preview skipped: ${error}`);
            }
          } catch (journalErr) {
            console.error("[BillAdjustment] Journal preview failed:", journalErr);
            toast.warning(`Bill generated but journal preview failed: ${journalErr.message}`, { autoClose: 10000 });
          }
        }
      } else {
        toast.success("Reading updated successfully!");

        // For non-Edit&Generate edits: only show journal preview if old bill was journal-pushed
        if (wasJournalPushed && openFiscalYearId && Object.keys(bpMappings).length > 0) {
          try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const freshData = await readingService.getCombinedBillDataForCustomer(selectedCustomerId);
            const allBills = freshData?.bills || freshData || [];
            const newBill = allBills.find(b =>
              b.kifyaWer === oldBillSnapshot.kifyaWer &&
              !b.isVoid && !b.void &&
              String(b.status).toLowerCase() === 'active' &&
              b.isBillGenerated
            );
            const invoiceNum = oldBillSnapshot.billingInvoiceNumber || oldBillSnapshot.invoiceNumber || oldBillSnapshot.id;
            const { lines, error, newBillRows, oldBillRows } = buildSingleBillAdjustmentLines(oldBillSnapshot, newBill || null, bpMappings);
            if (!error && lines.length >= 2) {
              setJournalPreviewData({ lines, newBillRows, oldBillRows, oldBill: oldBillSnapshot, newBill: newBill || null, invoiceNum, isVoidOnly: !newBill, mode: 'adjustment' });
              setJournalPreviewOpen(true);
            } else if (error) {
              toast.warning(`Journal adjustment skipped: ${error}`);
            }
          } catch (journalErr) {
            console.error("[BillAdjustment] Journal preview failed:", journalErr);
            toast.warning(`Reading updated but journal preview failed: ${journalErr.message}. Create manually.`, { autoClose: 10000 });
          }
        }
      }
    } catch (error) {
      console.error("Error updating reading:", error);
      toast.error(`Failed to update reading: ${error.message}`);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleCloseEditReadingModal = () => {
    setEditReadingModalOpen(false);
    setSelectedBillForEdit(null);
    setEditReadingData({ currentReading: '', previousReading: 0 });
    setIsEditSubmitting(false);
    setIsEditAndGenerate(false);
  };

  // --- Journal Preview Push Handler ---
  const handleJournalPreviewPush = async () => {
    if (!journalPreviewData || !openFiscalYearId) return;
    setJournalPushLoading(true);
    const { lines, oldBill, newBill, invoiceNum, isVoidOnly, mode } = journalPreviewData;
    const kifyaWer = (newBill || oldBill)?.kifyaWer || '';
    const isBillPrep = mode === 'billPrep';
    const ref = isBillPrep
      ? `BILL-PREP-SINGLE-${invoiceNum}-${Date.now()}`
      : `BILL-ADJ-${invoiceNum}-${Date.now()}`;
    const today = new Date().toISOString().split("T")[0];
    try {
      await fncJournalEntryService.createEntry({
        fiscalYearId: openFiscalYearId,
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
      const paidAmount = Number(String(derashResult.paid_amount || '').toString().replace(/,/g, ''));
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
        bankPaidConfirmationCode: derashResult.confirmation_code || '',
        bankPaidAgentId: derashResult.agent_name || derashResult.agent_id || ''
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

      const selectedBank = activeBillingBanks.find(
        (b) => String(b.bankCode) === String(selectedBankKey)
      ) || activeBillingBanks.find(
        (b) => String(b.id) === String(selectedBankKey)
      );

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
              tekilalaYetekefele:
                (bill.tekilalaTekefay || 0) + (bill.kecreditYetekefele || 0),
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

  // --- WUZIF ACTION HANDLERS WITH CONFIRMATION ---
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

  // --- 2. EXTRACT DATA FROM THE SINGLE SOURCE ---
  const customerBills = combinedBillData?.bills ?? [];
  const wuzifBills = combinedBillData?.wuzifBills ?? [];

  // --- 2b. FILTER WUZIF LISTS FOR THE 3rd TABLE TABS ---
  const activeWuzifList = useMemo(
    () => (wuzifBills || []).filter(
      (b) => b?.wuzifDeleted === "active" && b?.wuzifIsMoneyCollected === false
    ),
    [wuzifBills]
  );
  const skippedWuzifList = useMemo(
    () => (wuzifBills || []).filter(
      (b) => b?.wuzifDeleted === "deleted" && b?.wuzifIsKitatTenestual === true
    ),
    [wuzifBills]
  );
  const paidWuzifList = useMemo(
    () => (wuzifBills || []).filter(
      (b) => b?.wuzifDeleted === "deleted" && b?.wuzifIsMoneyCollected === true
    ),
    [wuzifBills]
  );

  // Filter bills for the tabs (this logic remains the same)
  const activeBills = useMemo(
    () => (customerBills || []).filter((bill) => !bill.void),
    [customerBills]
  );
  const voidedBills = useMemo(
    () => (customerBills || []).filter((bill) => bill.void),
    [customerBills]
  );

  const activeBillingBanks = useMemo(
    () => (billingBanks || []).filter((bank) => bank.deleted === "active"),
    [billingBanks]
  );

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row, table }) => {
          // Fix row numbering to work correctly with filtered data
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
      },
      {
        accessorKey: "accountNumber",
        header: "Account Number",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "fullName",
        header: "Full Name",
        filterFn: amharicFuzzyFilter,
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
            'dd/mm/yyyy'
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
      },
    ],
    [activeBillTab]
  );

  // --- 3. ENHANCED BILL COLUMNS WITH EDIT FUNCTIONALITY FOR COMPLAINTS ---
  const billColumns = useMemo(
    () => [
      {
        id: "actions",
        header: "Actions",
        size: 180,
        Cell: ({ row }) => {
          const bill = row.original;
          const canEditOrDelete = !bill.isMoneyCollected && !bill.moneyCollected;

          // Active tab (index 0): show View + Edit + Delete, with disable + tooltip when not allowed
          if (activeBillTab === 0) {
            return (
              <Box sx={{ display: "flex", gap: "0.5rem" }}>
                <Tooltip title="View Reading Details">
                  <IconButton
                    size="small"
                    onClick={() => setViewReadingId(row.original.id)}
                  >
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
                      {derashLoading ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <AccountBalanceIcon fontSize="small" />
                      )}
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
                        {manualBankSaving ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <PaidIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                {canEditOrDelete ? (
                  <>
                    <Tooltip title="Edit & Generate Bill">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => handleEditAndGenerate(bill)}
                        disabled={isChangingStatus || isGeneratingBill}
                      >
                        <PlaylistAddCheckIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isChangingStatus ? "Deleting..." : "Delete Reading (no recreate)"}>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteReading(bill)}
                        disabled={isChangingStatus}
                      >
                        {isChangingStatus ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DeleteOutlineIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Tooltip title={"Money already collected"}>
                    <span>
                      <IconButton size="small" disabled>
                        <WarningIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>
            );
          }

          // Deleted tab (index 1): show View + Activate, with disable + tooltip when not allowed
          const canActivate = !bill.isMoneyCollected && !bill.moneyCollected;
          return (
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Tooltip title="View Reading Details">
                <IconButton
                  size="small"
                  onClick={() => setViewReadingId(row.original.id)}
                >
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
                    {isChangingStatus ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <CheckCircleOutlineIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={"Money already collected"}>
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
      { header: "#", size: 20, Cell: ({ row }) => row.index + 1 },
      { accessorKey: "billingInvoiceNumber", header: "Invoice Number" },
      { accessorKey: "kifyaWer", header: "Kifya Wer" },
      { accessorKey: "previousReading", header: "Previous Reading" },
      { accessorKey: "lastReading", header: "Last Reading" },
      { accessorKey: "consumption", header: "Consumption" },
      { accessorKey: "tekilalaTekefay", header: "ብር" },
      { accessorKey: "kecreditYetekefele", header: "ቅድመ ክፍያ" },
      {
        accessorKey: "paymentInfo",
        header: "የክፍያ ሁኔታ",
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
            return paymentLocations.join(", ") || "ተከፍሏል";
          }
          return "አልተከፈለም";
        },
      },
    ],
    [activeBillTab]
  );

  const handleActivateBill = async (billId) => {
    // Guard: prevent activating if an active bill already exists for the same payment month
    const targetBill = customerBills?.find?.((b) => b.id === billId);
    if (targetBill && targetBill.kifyaWer != null) {
      const hasDuplicateActive = customerBills?.some?.(
        (b) => b.id !== billId && b.kifyaWer === targetBill.kifyaWer && b.status === 'active'
      );
      if (hasDuplicateActive) {
        toast.error("there is same month reading on active tab");
        return;
      }
    }

    showConfirm({
      title: "Activate Bill",
      content: "Are you sure you want to activate this bill?",
      confirmColor: "success",
      onConfirm: async () => {
        try {
          await changeReadingStatusAsync({ readingId: billId, status: 'active' });
          toast.success('Bill activated successfully!');
          queryClient.invalidateQueries(["customer-all-bill-data", selectedCustomerId]);
        } catch (error) {
          console.error("Error activating bill:", error);
          toast.error(`Failed to activate bill: ${error.message}`);
        }
      },
    });
  };

  const renderVoidedBillActions = (bill) => {
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => setSelectedBillForEdit(bill)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Activate Bill">
          <IconButton 
            size="small" 
            color="success"
            onClick={() => handleActivateBill(bill.id)}
          >
            <CheckCircleOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

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
    rowNumberMode: 'original',
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
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="View Customer Details">
          <IconButton onClick={() => setViewedCustomerId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {/* Removed Edit/Delete customer actions for complaint handling */}
        {/* Only view is allowed in complaint mode */}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        <Typography variant="h6" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          Customer Complaint Handling Mode
        </Typography>
        <Button
          variant="outlined"
          onClick={() => refetchCustomersAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
        <Button
          variant="outlined"
          onClick={() => setMetersOpen(true)}
          disabled={!selectedCustomerId}
        >
          View Meters
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isCustomersError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

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
        backgroundColor: row.original.moneyCollected
          ? "lightgreen"
          : "lightyellow",
      },
    }),
    enableRowActions: false,
  });

  // === MUTATIONS for CRUD operations ===

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Store the file and show confirmation dialog
    setSelectedFile(file);
    setConfirmImportOpen(true);
    
    // Reset file input
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!selectedFile) return;
    
    try {
      setConfirmImportOpen(false);
      const customerService = new CustomerService();
      const result = await customerService.importCustomers(selectedFile);
      setImportResult(result);
      setImportDialogOpen(true);
      // Refresh customer list
      refetchCustomersAll();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Import failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setSelectedFile(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelImport = () => {
    setConfirmImportOpen(false);
    setSelectedFile(null);
  };

  const handleCloseImportDialog = () => {
    setImportDialogOpen(false);
    setImportResult(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Columns specific to Wuzif table (extend billColumns without affecting Bills table)
  const wuzifColumns = useMemo(() => {
    const baseCols = (billColumns || []).filter(col => col.id !== 'actions');
    return [
      ...baseCols,
      {
        id: 'penaltyStatus',
        header: 'Penalty Status',
        accessorFn: (row) => (row?.wuzifIsKitatTenestual === true ? 'ተነስቷል' : 'አለበት'),
        size: 140,
      },
      {
        id: 'wuzifBirr',
        header: 'Wuzif Birr',
        accessorFn: (row) => {
          const del = row?.wuzifDeleted;
          if (del === 'active') return 'አለበት';
          if (del === 'deleted') return 'ተነስቷል';
          return '-';
        },
        size: 120,
      },
    ];
  }, [billColumns]);

  // --- 4. CREATE TABLE INSTANCE FOR WUZIF BILLS ---
  const wuzifTable = useMaterialReactTable({
    columns: wuzifColumns, // Add Penalty Status only for Wuzif table
    data: activeWuzifTab === 0 ? activeWuzifList : activeWuzifTab === 1 ? skippedWuzifList : paidWuzifList,
    state: {
      isLoading: isBillsLoading, // It uses the same loading state
      showAlertBanner: isBillsError,
      showProgressBars: isBillsLoading,
    },
    muiToolbarAlertBannerProps: isBillsError
      ? { color: "error", children: "Error loading Wuzif bills" }
      : undefined,
    muiTableBodyRowProps: { sx: { backgroundColor: "lightyellow" } }, // Styling kept simple for Wuzif
    enableRowActions: true,
    positionActionsColumn: 'first',
    renderRowActions: ({ row }) => {
      const bill = row.original;
      const readingId = bill.id;
      if (activeWuzifTab === 0) {
        // Active Wuzif List: Remove wuzif, and either Remove kitate or Return kitate based on wuzifIsKitatTenestual
        const kitated = bill?.wuzifIsKitatTenestual === true;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" color="error" variant="outlined" onClick={() => onRemoveWuzif(readingId)} disabled={isRemovingWuzif}>
              Remove wuzif
            </Button>
            {kitated ? (
              <Button size="small" color="success" variant="outlined" onClick={() => onToggleKitate(readingId, true)} disabled={isReturningKitate}>
                Return kitate
              </Button>
            ) : (
              <Button size="small" color="warning" variant="outlined" onClick={() => onToggleKitate(readingId, false)} disabled={isRemovingKitate}>
                Remove kitate
              </Button>
            )}
          </Box>
        );
      }
      if (activeWuzifTab === 1) {
        // Skipped Wuzif List: Return wuzif
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" color="success" variant="outlined" onClick={() => onReturnWuzif(readingId)} disabled={isReturningWuzif}>
              Return wuzif
            </Button>
          </Box>
        );
      }
      // Paid Wuzif List: No actions
      return null;
    },
  });

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
      <Breadcrumb pageName="Customer Complaint Handling" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeCustomerTab}
                onChange={handleCustomerTabChange}
                aria-label="customer status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Customer Type Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
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
                  {isCustomerTypesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : customerTypes?.length > 0 ? (
                    customerTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name || `Type ${type.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No types found</MenuItem>
                  )}
                </Select>
              </FormControl>

              {/* Kebele Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Kebele</InputLabel>
                <Select
                  value={selectedKebeleId}
                  label="Kebele"
                  onChange={(e) => {
                    setSelectedKebeleId(e.target.value);
                    setSelectedKetenaId(""); // Reset ketena when kebele changes
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

              {/* Ketena Filter - Only enabled when a kebele is selected */}
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

              {/* Branch Filter */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  value={selectedBranchId}
                  label="Branch"
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedReaderId(""); // Reset reader when branch changes
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

              {/* Reader Filter - Only enabled when a branch is selected */}
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

              {/* Clear All Filters Button */}
              {(selectedCustomerTypeId || selectedKebeleId || selectedKetenaId || selectedBranchId || selectedReaderId) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedCustomerTypeId("");
                    setSelectedKebeleId("");
                    setSelectedKetenaId("");
                    setSelectedBranchId("");
                    setSelectedReaderId("");
                  }}
                  sx={{ ml: 'auto' }}
                >
                  Clear All Filters
                </Button>
              )}
            </Box>
            
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      {selectedCustomerId && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            Bills for Selected Customer - Complaint Handling
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can edit readings for bills that are generated but money is not yet collected.
            This will mark the current reading as deleted and create a new reading.
          </Typography>
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeBillTab}
                onChange={handleBillTabChange}
                aria-label="bill status tabs"
              >
                <Tab label="Active Bills" />
                <Tab label="Voided Bills" />
              </Tabs>
            </Box>
            <MaterialReactTable key={`bill-${activeBillTab}`} table={billTable} />
          </Paper>
        </Box>
      )}

      {/* --- 5. RENDER THE WUZIF TABLE WITH TABS --- */}
      {selectedCustomerId && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Unpaid Wuzif List
          </Typography>
          <Paper>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeWuzifTab}
                onChange={handleWuzifTabChange}
                aria-label="wuzif status tabs"
              >
                <Tab label="Active Wuzif" />
                <Tab label="Skipped Wuzif" />
                <Tab label="Paid Wuzif" />
              </Tabs>
            </Box>
            <MaterialReactTable key={`wuzif-${activeWuzifTab}`} table={wuzifTable} />
          </Paper>
        </Box>
      )}
      {/* MODALS */}
      {/* Removed CustomerFormModal for complaint handling */}
      
      {/* Edit Reading Modal for Complaint Handling */}
      <Dialog open={editReadingModalOpen} onClose={handleCloseEditReadingModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          {isEditAndGenerate ? "Edit & Generate Bill" : "Edit Reading - Customer Complaint"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will mark the current reading as deleted and create a new reading with the updated value.
            <strong> This action is for handling customer complaints only.</strong>
          </DialogContentText>
          {selectedBillForEdit && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Bill Information:</Typography>
              <Typography variant="body2">Invoice: {selectedBillForEdit.billingInvoiceNumber}</Typography>
              <Typography variant="body2">Period: {selectedBillForEdit.kifyaWer}</Typography>
              <Typography variant="body2">Current Reading: {selectedBillForEdit.lastReading}</Typography>
            </Box>
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
              setEditReadingData(prev => ({ ...prev, previousReading: value }));
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
              setEditReadingData(prev => ({ ...prev, currentReading: value }));
            }}
            error={!!validationError}
            helperText={validationError || `Consumption will be: ${editReadingData.currentReading && editReadingData.previousReading ? 
              (parseInt(editReadingData.currentReading) - parseInt(editReadingData.previousReading)) : 0}`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditReadingModal}>Cancel</Button>
          <Button 
            onClick={handleEditReadingSubmit} 
            variant="contained" 
            color="warning"
            disabled={
              isEditSubmitting ||
              isDeletingRecreating ||
              isAddingReading ||
              isChangingStatus ||
              !editReadingData.currentReading ||
              !editReadingData.previousReading
            }
          >
            {isEditSubmitting || isDeletingRecreating || isAddingReading || isChangingStatus
              ? 'Processing...'
              : isEditAndGenerate ? 'Update & Generate' : 'Update Reading'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Journal Preview Dialog — Bill Preparation Summary style */}
      <Dialog open={journalPreviewOpen} onClose={handleCloseJournalPreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" component="span">
              {journalPreviewData?.mode === 'billPrep'
                ? '📋 Bill Preparation — Revenue Recognition'
                : journalPreviewData?.isVoidOnly
                  ? '📋 Journal Reversal Preview'
                  : '📋 Journal Adjustment Preview'}
            </Typography>
            {journalPreviewData?.invoiceNum && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Invoice: <strong>{journalPreviewData.invoiceNum}</strong>
                {(journalPreviewData.newBill?.kifyaWer || journalPreviewData.oldBill?.kifyaWer) &&
                  ` — ${journalPreviewData.newBill?.kifyaWer || journalPreviewData.oldBill?.kifyaWer}`}
              </Typography>
            )}
          </Box>
          <Button color="error" onClick={handleCloseJournalPreview} sx={{ fontWeight: 'bold' }}>✕ CLOSE</Button>
        </DialogTitle>
        <DialogContent>
          {journalPreviewData && (() => {
            const { newBillRows, oldBillRows, isVoidOnly, mode } = journalPreviewData;
            const fmt = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });
            const newTotal = newBillRows.reduce((s, r) => s + (r.amount || 0), 0);
            const oldTotal = oldBillRows.reduce((s, r) => s + (r.amount || 0), 0);

            return (
              <Box>
                {/* ── New Bill Push Table (Step 1: DR Receivable / CR Revenue) ── */}
                {newBillRows.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#00897b' }}>
                      ✅ New Bill — Push to Journal (Step 1)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Revenue Recognition — DR (Receivable) / CR (Revenue) for each charge type.
                    </Typography>
                    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: 'auto', border: '2px solid #00897b' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#00897b', color: 'white' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#00897b', color: 'white' }}>Charge Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#1565c0', color: 'white' }}>DR — Receivable (A/R)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#2e7d32', color: 'white' }}>CR — Revenue / Liability</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {newBillRows.map((row, idx) => (
                            <TableRow key={idx} sx={{ bgcolor: row.group === 'g1' ? '#f0f8ff' : '#fff5f5' }}>
                              <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                              <TableCell sx={{ fontFamily: 'Nyala, serif', fontWeight: 'medium' }}>{row.desc}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{fmt(row.amount)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>{fmt(row.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '3px solid #333', fontSize: '1.05rem' } }}>
                            <TableCell />
                            <TableCell sx={{ fontFamily: 'Nyala, serif' }}>TOTAL</TableCell>
                            <TableCell align="right" sx={{ color: 'primary.main' }}>{fmt(newTotal)}</TableCell>
                            <TableCell align="right" sx={{ color: 'success.main' }}>{fmt(newTotal)}</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* ── Old Bill Reversal Table (opposite of Step 1: DR Revenue / CR Receivable) ── */}
                {oldBillRows.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#c62828' }}>
                      ✕ Old Bill — Reversal (Opposite of Step 1)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Reversing the old bill — DR (Revenue) / CR (Receivable) for each charge type.
                    </Typography>
                    <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, overflow: 'auto', border: '2px solid #ef5350' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ef5350', color: 'white' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#ef5350', color: 'white' }}>Charge Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#c62828', color: 'white' }}>DR — Revenue (Reversal)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#d32f2f', color: 'white' }}>CR — Receivable (Reversal)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {oldBillRows.map((row, idx) => (
                            <TableRow key={idx} sx={{ bgcolor: '#fff5f5' }}>
                              <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                              <TableCell sx={{ fontFamily: 'Nyala, serif', fontWeight: 'medium' }}>{row.desc}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>{fmt(row.amount)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.dark' }}>{fmt(row.amount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                        <TableFooter>
                          <TableRow sx={{ '& td': { fontWeight: 'bold', borderTop: '2px solid #c62828', fontSize: '1rem' } }}>
                            <TableCell />
                            <TableCell sx={{ fontFamily: 'Nyala, serif' }}>TOTAL</TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>{fmt(oldTotal)}</TableCell>
                            <TableCell align="right" sx={{ color: 'error.dark' }}>{fmt(oldTotal)}</TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Balance check */}
                {newBillRows.length > 0 && oldBillRows.length > 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Combined Journal: Total Debit = <strong>{fmt(newTotal + oldTotal)}</strong> ETB, Total Credit = <strong>{fmt(newTotal + oldTotal)}</strong> ETB — Balanced ✅
                  </Alert>
                )}

                {/* Bill info cards */}
                <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  {journalPreviewData.oldBill && (
                    <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200, bgcolor: '#fff5f5', border: '1px solid #ef5350' }}>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>Old Bill (Voided)</Typography>
                      <Typography variant="body2">Invoice: {journalPreviewData.oldBill?.billingInvoiceNumber || '-'}</Typography>
                      <Typography variant="body2">Period: {journalPreviewData.oldBill?.kifyaWer || '-'}</Typography>
                      <Typography variant="body2">Total: {fmt(journalPreviewData.oldBill?.tekilalaTekefay)} ETB</Typography>
                    </Paper>
                  )}
                  {journalPreviewData.newBill && (
                    <Paper elevation={1} sx={{ p: 2, flex: 1, minWidth: 200, bgcolor: '#f0f8ff', border: '1px solid #1565c0' }}>
                      <Typography variant="subtitle2" color="primary.main" gutterBottom>New Bill (Active)</Typography>
                      <Typography variant="body2">Invoice: {journalPreviewData.newBill?.billingInvoiceNumber || '-'}</Typography>
                      <Typography variant="body2">Period: {journalPreviewData.newBill?.kifyaWer || '-'}</Typography>
                      <Typography variant="body2">Total: {fmt(journalPreviewData.newBill?.tekilalaTekefay)} ETB</Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseJournalPreview} disabled={journalPushLoading}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleJournalPreviewPush}
            disabled={journalPushLoading || !journalPreviewData}
            sx={{ bgcolor: '#00897b', '&:hover': { bgcolor: '#00695c' }, fontWeight: 'bold', px: 4 }}
          >
            {journalPushLoading ? 'Pushing...' : 'Push to Journal (DRAFT)'}
          </Button>
        </DialogActions>
      </Dialog>


      <Dialog open={derashModalOpen} onClose={() => setDerashModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Derash Payment</DialogTitle>
        <DialogContent>
          {selectedBillForDerash && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Bill Information</Typography>
              <Typography variant="body2">Invoice: {selectedBillForDerash.billingInvoiceNumber}</Typography>
              <Typography variant="body2">Expected Amount: {selectedBillForDerash.tekilalaTekefay || 0}</Typography>
            </Box>
          )}
          {derashResult ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 1, columnGap: 2 }}>
              <Typography variant="body2">Agent</Typography>
              <Typography variant="body2">{derashResult.agent_name || derashResult.agent_id || '-'}</Typography>
              <Typography variant="body2">Paid Date</Typography>
              <Typography variant="body2">{derashResult.paid_dt || '-'}</Typography>
              <Typography variant="body2">Paid Amount</Typography>
              <Typography variant="body2">{derashResult.paid_amount || '-'}</Typography>
              <Typography variant="body2">Confirmation</Typography>
              <Typography variant="body2">{derashResult.confirmation_code || '-'}</Typography>
            </Box>
          ) : (
            <Typography variant="body2">No payment data.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDerashModalOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveDerashPayment}
            disabled={!derashResult || !selectedBillForDerash}
          >
            Save Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={manualBankModalOpen} onClose={handleCloseManualBankModal} maxWidth="xs" fullWidth>
        <DialogTitle>Manual Bank Payment</DialogTitle>
        <DialogContent>
          {manualBankBill && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="subtitle2">Bill Information</Typography>
              <Typography variant="body2">Invoice: {manualBankBill.billingInvoiceNumber}</Typography>
              <Typography variant="body2">Expected Amount: {manualBankBill.tekilalaTekefay || 0}</Typography>
            </Box>
          )}
          <FormControl fullWidth margin="normal" size="small">
            <InputLabel id="manual-bank-select-label">Bank</InputLabel>
            <Select
              labelId="manual-bank-select-label"
              label="Bank"
              value={selectedBankKey}
              onChange={(e) => setSelectedBankKey(e.target.value)}
              disabled={isBillingBanksLoading || manualBankSaving || !activeBillingBanks.length}
            >
              {isBillingBanksLoading && (
                <MenuItem value="" disabled>Loading banks...</MenuItem>
              )}
              {!isBillingBanksLoading && activeBillingBanks.length === 0 && (
                <MenuItem value="" disabled>No active banks found</MenuItem>
              )}
              {!isBillingBanksLoading && activeBillingBanks.map((bank) => (
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
            value={manualBankConfirmationCode}
            onChange={(e) => setManualBankConfirmationCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseManualBankModal} disabled={manualBankSaving}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveManualBankPayment}
            disabled={manualBankSaving || !selectedBankKey}
          >
            {manualBankSaving ? 'Saving...' : 'Save Payment'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Import Results Modal */}
      <Dialog
        open={importDialogOpen}
        onClose={handleCloseImportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Results</DialogTitle>
        <DialogContent>
          {importResult && (
            <Box>
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography>Successfully imported: {importResult.importedCount || 0} customers</Typography>
                {importResult.importedCustomerSummaries?.length > 0 && (
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle2">Imported Accounts:</Typography>
                    <Box sx={{ maxHeight: '150px', overflow: 'auto', border: '1px solid #e0e0e0', p: 1, borderRadius: 1, mt: 1 }}>
                      {importResult.importedCustomerSummaries.map((summary, index) => (
                        <Typography key={index} variant="body2" component="div" sx={{ py: 0.5 }}>
                          {summary}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                <Typography>Skipped: {importResult.skippedCount || 0} rows</Typography>
              </Box>

              {importResult.skippedRows?.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Skipped Rows
                  </Typography>
                  <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Account Number</TableCell>
                          <TableCell>Error Details</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importResult.skippedRows.map((row, index) => {
                          // Extract the error message - it could be in different formats
                          let errorMessage = 'Unknown error occurred';
                          if (row.message) {
                            errorMessage = row.message;
                          } else if (row.reason) {
                            errorMessage = row.reason;
                          } else if (row.error) {
                            errorMessage = typeof row.error === 'string' ? row.error : JSON.stringify(row.error);
                          }

                          return (
                            <TableRow 
                              key={`${row.rowNum}-${index}`}
                              sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
                            >
                              <TableCell>{row.rowNum || index + 1}</TableCell>
                              <TableCell>{row.accountNumber || 'N/A'}</TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" color="error" sx={{ wordBreak: 'break-word' }}>
                                    {errorMessage}
                                  </Typography>
                                  {row.accountNumber && row.accountNumber !== 'N/A' && (
                                    <Typography variant="caption" color="textSecondary">
                                      Account: {row.accountNumber}
                                    </Typography>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Import Dialog */}
      <Dialog
        open={confirmImportOpen}
        onClose={handleCancelImport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Import</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to import customers from this file?</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, fontWeight: 'bold' }}>
            File: {selectedFile?.name}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelImport} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmImport} 
            color="primary"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Confirm Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
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
