"use client";
import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import * as XLSX from "xlsx";

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
import { ReadingService } from "../../../lib/ReadingService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import ConfirmDialog from "@/app/ui/components/ConfirmDialog";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { generateWordVariants } from "../../../lib/amharicSearchUtils";
import { transliterateToAmharic } from "../../../helpers/amharicInput";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";

// Modals
import ViewCustomerModal from "./ViewCustomerModal";
import CustomerFormModal from "./CustomerFormModal";
import MetersModal from "./MetersModal";
import CustomerStatusModal from "./CustomerStatusModal";
import BulkActionsDialogs from "./BulkActionsDialogs";
import ImportDialogs from "./ImportDialogs";

// Sub-components
import ErrorBoundary from "./ErrorBoundary";
import CustomerFilters from "./CustomerFilters";
import CustomerBillsPanel from "./CustomerBillsPanel";
import CustomerToolbar from "./CustomerToolbar";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PaymentsIcon from "@mui/icons-material/Payments";
import DownloadIcon from "@mui/icons-material/Download";
import PeopleIcon from "@mui/icons-material/People";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WarningIcon from "@mui/icons-material/Warning";
import SpeedIcon from "@mui/icons-material/Speed";

// Service instances
const readingService = new ReadingService();
const customerService = new CustomerService();
const dropdownService = new DropdownService();

// =========================================================================
// PRO-LEVEL BILINGUAL SEARCH FILTERS (AMHARIC + ENGLISH + GLOBAL SEARCH)
// =========================================================================

const bilingualNameFilter = (row, columnId, filterValue) => {
  if (!row || !row.original || !filterValue) return false;
  const q = String(filterValue).trim();
  if (!q) return true;

  const amharic = String(row.original.fullName || "").trim();
  const english = String(row.original.fullNameEng || "").trim();
  const qLower = q.toLowerCase();

  // 1. Direct English substring match
  if (english.toLowerCase().includes(qLower)) return true;

  // 2. Direct Amharic substring match
  if (amharic.toLowerCase().includes(qLower)) return true;

  // 3. Transliterate English phonetically to Amharic and check Amharic name
  try {
    const transliterated = transliterateToAmharic(q, "phonetic");
    if (transliterated && amharic.includes(transliterated)) return true;
  } catch (e) {}

  // 4. Amharic fuzzy / variants match
  try {
    const normalized = amharic.replace(/\s+/g, "").toLowerCase();
    const variants = generateWordVariants(q.replace(/\s+/g, "").toLowerCase());
    if (variants.some((v) => normalized.includes(v))) return true;
  } catch (e) {}

  return false;
};

const bilingualGlobalFilter = (row, columnIds, filterValue) => {
  if (!filterValue) return true;
  const q = String(filterValue).trim().toLowerCase();
  if (!q) return true;

  const c = row.original;
  if (!c) return false;

  // 1. Account Number
  if (c.accountNumber && String(c.accountNumber).toLowerCase().includes(q)) return true;

  // 2. English Name
  if (c.fullNameEng && String(c.fullNameEng).toLowerCase().includes(q)) return true;

  // 3. Amharic Name (plain, transliterated, and fuzzy variants)
  if (c.fullName) {
    const amharicLower = String(c.fullName).toLowerCase();
    if (amharicLower.includes(q)) return true;
    try {
      const transliterated = transliterateToAmharic(q, "phonetic");
      if (transliterated && amharicLower.includes(transliterated)) return true;
    } catch (e) {}
    try {
      const normalized = amharicLower.replace(/\s+/g, "");
      const variants = generateWordVariants(q.replace(/\s+/g, ""));
      if (variants.some((v) => normalized.includes(v))) return true;
    } catch (e) {}
  }

  // 4. Phone Number
  if (c.phoneNumber && String(c.phoneNumber).toLowerCase().includes(q)) return true;

  // 5. Meter Number
  if (c.meterNumber && String(c.meterNumber).toLowerCase().includes(q)) return true;

  // 6. National ID / House Number
  if (c.nationalIdNumber && String(c.nationalIdNumber).toLowerCase().includes(q)) return true;
  if (c.houseNumber && String(c.houseNumber).toLowerCase().includes(q)) return true;

  return false;
};

const CustomerList = () => {
  const queryClient = useQueryClient();

  // =====================================================================
  // STATE DECLARATIONS
  // =====================================================================

  // Customer selection & tabs
  const [viewedCustomerId, setViewedCustomerId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState(0); // 0=Active, 1=Deleted
  const [activeBillTab, setActiveBillTab] = useState(0);

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isMetersOpen, setMetersOpen] = useState(false);
  const [metersCustomerId, setMetersCustomerId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusCustomerId, setStatusCustomerId] = useState(null);

  // Complete Delete confirmation
  const [completeDeleteDialogOpen, setCompleteDeleteDialogOpen] = useState(false);
  const [completeDeleteCustomerId, setCompleteDeleteCustomerId] = useState(null);

  // Bulk operations
  const [bulkAdditionalPaymentOpen, setBulkAdditionalPaymentOpen] = useState(false);
  const [bulkAdditionalPaymentValue, setBulkAdditionalPaymentValue] = useState("");
  const [bulkTechemariOpen, setBulkTechemariOpen] = useState(false);
  const [techemariNameValue, setTechemariNameValue] = useState("");
  const [techemariKfyaValue, setTechemariKfyaValue] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignScope, setAssignScope] = useState("");
  const [assignReaderId, setAssignReaderId] = useState("");
  const [bulkBranchId, setBulkBranchId] = useState("");

  // Filters
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [filterOldPenalty, setFilterOldPenalty] = useState("");
  const [filterRegistrationDateFrom, setFilterRegistrationDateFrom] = useState("");
  const [filterRegistrationDateTo, setFilterRegistrationDateTo] = useState("");
  const [filterHasPrepaid, setFilterHasPrepaid] = useState("");
  const [filterMeterChanged, setFilterMeterChanged] = useState("");
  const [filterHasDryWaste, setFilterHasDryWaste] = useState("");
  const [filterHasAdditionalPayment, setFilterHasAdditionalPayment] = useState("");

  // Import/Update Dialogs
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmUpdateOpen, setConfirmUpdateOpen] = useState(false);
  const [selectedUpdateFile, setSelectedUpdateFile] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  // Update Customer Reader
  const [updateReaderModalOpen, setUpdateReaderModalOpen] = useState(false);
  const [updateReaderBranchId, setUpdateReaderBranchId] = useState("");
  const [updateReaderReaderId, setUpdateReaderReaderId] = useState("");
  const [updateReaderFile, setUpdateReaderFile] = useState(null);
  const [updateReaderMatchedCustomers, setUpdateReaderMatchedCustomers] = useState([]);
  const [updateReaderNotFound, setUpdateReaderNotFound] = useState([]);
  const [updateReaderProcessing, setUpdateReaderProcessing] = useState(false);
  const [updateReaderSaving, setUpdateReaderSaving] = useState(false);

  // Update GPS
  const [updateGpsModalOpen, setUpdateGpsModalOpen] = useState(false);
  const [updateGpsFile, setUpdateGpsFile] = useState(null);
  const [updateGpsMatchedCustomers, setUpdateGpsMatchedCustomers] = useState([]);
  const [updateGpsNotFound, setUpdateGpsNotFound] = useState([]);
  const [updateGpsProcessing, setUpdateGpsProcessing] = useState(false);
  const [updateGpsSaving, setUpdateGpsSaving] = useState(false);

  // Notifications
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Pagination
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Refs
  const fileInputRef = useRef(null);
  const updateFileInputRef = useRef(null);

  // =====================================================================
  // HELPER FUNCTIONS
  // =====================================================================

  const formatEthiopianDateForPicker = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === "string") {
      try {
        const d = new Date(dateValue);
        if (!isNaN(d.getTime())) return d;
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const parseFilterDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
      try {
        const parsed = EthiopianCalendarConverterPure.fromEthiopianInputValue(val);
        if (parsed instanceof Date && !isNaN(parsed.getTime())) return parsed;
      } catch (e) {}
    }
    return null;
  };

  const handleFilterChange = useCallback((filterName, value) => {
    const setters = {
      selectedCustomerTypeId: setSelectedCustomerTypeId,
      selectedKebeleId: setSelectedKebeleId,
      selectedKetenaId: setSelectedKetenaId,
      selectedBranchId: setSelectedBranchId,
      selectedReaderId: setSelectedReaderId,
      filterOldPenalty: setFilterOldPenalty,
      filterRegistrationDateFrom: setFilterRegistrationDateFrom,
      filterRegistrationDateTo: setFilterRegistrationDateTo,
      filterHasPrepaid: setFilterHasPrepaid,
      filterMeterChanged: setFilterMeterChanged,
      filterHasDryWaste: setFilterHasDryWaste,
      filterHasAdditionalPayment: setFilterHasAdditionalPayment,
    };
    if (setters[filterName]) {
      setters[filterName](value);
    }
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSelectedCustomerTypeId("");
    setSelectedKebeleId("");
    setSelectedKetenaId("");
    setSelectedBranchId("");
    setSelectedReaderId("");
    setFilterOldPenalty("");
    setFilterRegistrationDateFrom("");
    setFilterRegistrationDateTo("");
    setFilterHasPrepaid("");
    setFilterMeterChanged("");
    setFilterHasDryWaste("");
    setFilterHasAdditionalPayment("");
    setAssignScope("");
    setRowSelection({});
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // =====================================================================
  // DATA QUERIES
  // =====================================================================

  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
  });

  const { data: meterSizes = [] } = useQuery({
    queryKey: ["meterSizes"],
    queryFn: () => dropdownService.getMeterSizes(),
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
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
    queryKey: ["readers", selectedBranchId || bulkBranchId],
    queryFn: () => {
      const bId = selectedBranchId || bulkBranchId;
      if (!bId) return [];
      return dropdownService.getReadersByBranch(bId);
    },
    enabled: !!(selectedBranchId || bulkBranchId),
    refetchOnWindowFocus: false,
  });

  const { data: updateReaderReaders = [], isLoading: isUpdateReaderReadersLoading } = useQuery({
    queryKey: ["readers", updateReaderBranchId],
    queryFn: () => {
      if (!updateReaderBranchId) return [];
      return dropdownService.getReadersByBranch(updateReaderBranchId);
    },
    enabled: !!updateReaderBranchId,
    refetchOnWindowFocus: false,
  });

  const getKetenasByKebeleCached = async (kebeleId) => {
    if (!kebeleId) return [];
    return queryClient.fetchQuery({
      queryKey: ["ketenas", kebeleId],
      queryFn: () => dropdownService.getKetenasByKebele(kebeleId),
      staleTime: Infinity,
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

  // Fetch all customers
  const {
    data: allCustomers = [],
    isError: isCustomersError,
    isFetching,
    isLoading: isCustomersLoading,
    refetch: refetchCustomersAll,
  } = useQuery({
    queryKey: ["customers-all"],
    queryFn: async () => {
      return customerService.getAllCustomers();
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // Customer details queries
  const { data: viewedCustomer, isFetching: isCustomerDetailsFetching } = useQuery({
    queryKey: ["customer-details", viewedCustomerId],
    queryFn: () => {
      if (!viewedCustomerId) return null;
      return customerService.getCustomerById(viewedCustomerId);
    },
    enabled: !!viewedCustomerId,
  });

  const { data: editingCustomer, isLoading: isFetchingCustomer } = useQuery({
    queryKey: ["customer-details", editingCustomerId],
    queryFn: () => {
      if (!editingCustomerId) return null;
      return customerService.getCustomerById(editingCustomerId);
    },
    enabled: !!editingCustomerId,
  });

  // Combined bill data for selected customer
  const {
    data: combinedBillData,
    isLoading: isBillsLoading,
    isError: isBillsError,
  } = useQuery({
    queryKey: ["customer-all-bill-data", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      return readingService.getCombinedBillDataForCustomer(selectedCustomerId);
    },
    enabled: !!selectedCustomerId,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });

  // =====================================================================
  // COMPUTED DATA & EXECUTIVE KPIS
  // =====================================================================

  const kpiStats = useMemo(() => {
    let totalActive = 0;
    let totalDeleted = 0;
    let totalCompleteDeleted = 0;
    let totalPrepaid = 0;
    let totalArrears = 0;
    let unassignedReaders = 0;
    let hasDryWasteCount = 0;

    (allCustomers || []).forEach((c) => {
      if (c.completeDeleted === "deleted") {
        totalCompleteDeleted++;
      } else if (c.status === "deleted") {
        totalDeleted++;
      } else {
        totalActive++;
      }

      const prepaid = Number(c.customerBalanceBirr || c.prepaidBirrCurrentBalance || 0);
      if (prepaid > 0) totalPrepaid += prepaid;

      const arrears = Number(c.oldKfyaAndPenaltyTotal || 0);
      if (arrears > 0) totalArrears += arrears;

      if (!c.assignedReaderId) unassignedReaders++;
      if (Number(c.additionalMonthlyPayment || 0) > 0) hasDryWasteCount++;
    });

    return {
      totalActive,
      totalDeleted,
      totalCompleteDeleted,
      totalCount: (allCustomers || []).length,
      totalPrepaid,
      totalArrears,
      unassignedReaders,
      hasDryWasteCount,
    };
  }, [allCustomers]);

  const activeCustomers = useMemo(
    () => (allCustomers || []).filter((c) => c.status === "active"),
    [allCustomers]
  );

  const deletedCustomers = useMemo(
    () => (allCustomers || []).filter((c) => c.status === "deleted"),
    [allCustomers]
  );

  const filteredCustomers = useMemo(() => {
    let result = activeCustomerTab === 0 ? [...activeCustomers] : [...deletedCustomers];

    if (selectedCustomerTypeId) {
      result = result.filter(
        (c) => c.customerTypeId && String(c.customerTypeId) === String(selectedCustomerTypeId)
      );
    }
    if (selectedKebeleId) {
      result = result.filter(
        (c) => c.addressStreetsId && String(c.addressStreetsId) === String(selectedKebeleId)
      );
    }
    if (selectedKetenaId) {
      result = result.filter(
        (c) => c.addressKetenaId && String(c.addressKetenaId) === String(selectedKetenaId)
      );
    }
    if (selectedBranchId) {
      result = result.filter(
        (c) => c.branchsId && String(c.branchsId) === String(selectedBranchId)
      );
    }
    if (selectedReaderId) {
      result = result.filter(
        (c) => c.assignedReaderId && String(c.assignedReaderId) === String(selectedReaderId)
      );
    }
    if (filterOldPenalty === "true") {
      result = result.filter((c) => c.oldHasPenalty === true);
    } else if (filterOldPenalty === "false") {
      result = result.filter((c) => c.oldHasPenalty === false);
    }
    if (filterRegistrationDateFrom || filterRegistrationDateTo) {
      const fromDate = parseFilterDate(filterRegistrationDateFrom);
      const toDate = parseFilterDate(filterRegistrationDateTo);
      if (fromDate || toDate) {
        result = result.filter((c) => {
          const regDate = c.registeredDate;
          if (!regDate) return false;
          const cDate =
            typeof regDate === "string" ? new Date(regDate) : regDate instanceof Date ? regDate : null;
          if (!cDate || isNaN(cDate.getTime())) return false;
          if (fromDate && cDate < fromDate) return false;
          if (toDate && cDate > toDate) return false;
          return true;
        });
      }
    }
    if (filterHasPrepaid === "true") {
      result = result.filter((c) => (c.customerBalanceBirr || c.prepaidBirrCurrentBalance) > 0);
    } else if (filterHasPrepaid === "false") {
      result = result.filter((c) => (c.customerBalanceBirr || c.prepaidBirrCurrentBalance) <= 0);
    }
    if (filterMeterChanged === "true") {
      result = result.filter((c) => c.isInitializedSecondTime === true);
    } else if (filterMeterChanged === "false") {
      result = result.filter((c) => c.isInitializedSecondTime === false);
    }
    if (filterHasDryWaste === "true") {
      result = result.filter((c) => c.additionalMonthlyPayment > 0);
    } else if (filterHasDryWaste === "false") {
      result = result.filter((c) => c.additionalMonthlyPayment <= 0);
    }
    if (filterHasAdditionalPayment === "true") {
      result = result.filter((c) => c.techemariKfya > 0);
    } else if (filterHasAdditionalPayment === "false") {
      result = result.filter((c) => c.techemariKfya <= 0);
    }
    return result;
  }, [
    activeCustomers,
    deletedCustomers,
    activeCustomerTab,
    selectedCustomerTypeId,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
    filterOldPenalty,
    filterRegistrationDateFrom,
    filterRegistrationDateTo,
    filterHasPrepaid,
    filterMeterChanged,
    filterHasDryWaste,
    filterHasAdditionalPayment,
  ]);

  const selectedIdsList = useMemo(() => Object.keys(rowSelection || {}), [rowSelection]);
  const selectedCount = selectedIdsList.length;

  const targetCustomerCount = useMemo(() => {
    if (selectedCount > 0) return selectedCount;
    if (assignScope === "visible") {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredCustomers.slice(start, end).length;
    }
    if (assignScope === "all") return filteredCustomers.length;
    return 0;
  }, [selectedCount, assignScope, pagination, filteredCustomers]);

  const canUpdateDryWaste = selectedCount > 0 || Boolean(assignScope);

  const selectedCustomerObj = useMemo(() => {
    if (!selectedCustomerId) return null;
    return (allCustomers || []).find((c) => String(c.id) === String(selectedCustomerId)) || null;
  }, [selectedCustomerId, allCustomers]);

  const statusCustomerObj = useMemo(() => {
    if (!statusCustomerId) return null;
    return (allCustomers || []).find((c) => String(c.id) === String(statusCustomerId)) || null;
  }, [statusCustomerId, allCustomers]);

  // Keep single selected customer synced with rowSelection
  useEffect(() => {
    const ids = Object.keys(rowSelection || {});
    if (ids.length === 1) {
      setSelectedCustomerId(ids[0]);
    } else {
      setSelectedCustomerId(null);
    }
    setActiveBillTab(0);
  }, [rowSelection]);

  // =====================================================================
  // MUTATIONS
  // =====================================================================

  const { mutateAsync: createCustomer, isLoading: isCreating } = useMutation({
    mutationFn: customerService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers-all"]);
      toast.success("Customer created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: updateCustomer, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => customerService.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers-all"]);
      toast.success("Customer updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: deactivateCustomer, isLoading: isDeactivating } = useMutation({
    mutationFn: customerService.deactivateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers-all"]);
      toast.success("Customer deactivated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: activateCustomer, isLoading: isActivating } = useMutation({
    mutationFn: customerService.activateCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers-all"]);
      toast.success("Customer activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: completeDeleteCustomer, isLoading: isCompleteDeleting } = useMutation({
    mutationFn: customerService.completeDeleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers-all"]);
      toast.success("Customer completely deleted successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // =====================================================================
  // EVENT HANDLERS
  // =====================================================================

  const handleCustomerTabChange = (event, newValue) => {
    setActiveCustomerTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setRowSelection({});
    setSelectedCustomerId(null);
    setActiveBillTab(0);
  };

  const handleCreateSubmit = async (data) => {
    await createCustomer(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingCustomerId) return;
    await updateCustomer({ id: editingCustomerId, data });
  };

  // Helper to extract target IDs for bulk actions
  const getTargetCustomerIds = () => {
    const explicitIds = Object.keys(rowSelection || {}).map(Number);
    if (explicitIds.length > 0) return explicitIds;

    if (assignScope === "visible") {
      const start = pagination.pageIndex * pagination.pageSize;
      const end = start + pagination.pageSize;
      return filteredCustomers.slice(start, end).map((c) => Number(c.id));
    }
    if (assignScope === "all") {
      return filteredCustomers.map((c) => Number(c.id));
    }
    return [];
  };

  // Bulk Actions
  const handleConfirmAssignReader = async () => {
    const targetIds = getTargetCustomerIds();
    if (!assignReaderId || targetIds.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select a reader and at least one customer.",
        severity: "warning",
      });
      return;
    }
    try {
      await customerService.assignReaderBulk({
        readerId: Number(assignReaderId),
        customerIds: targetIds,
      });
      setAssignDialogOpen(false);
      setRowSelection({});
      refetchCustomersAll();
      setSnackbar({
        open: true,
        message: `Successfully assigned reader to ${targetIds.length} customers.`,
        severity: "success",
      });
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to assign reader.", severity: "error" });
    }
  };

  const handleConfirmBulkAdditionalPayment = async () => {
    const targetIds = getTargetCustomerIds();
    if (targetIds.length === 0) {
      setSnackbar({ open: true, message: "No customers selected.", severity: "warning" });
      return;
    }
    const amountNumber = parseFloat(bulkAdditionalPaymentValue);
    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      setSnackbar({ open: true, message: "Enter a valid non-negative amount.", severity: "warning" });
      return;
    }
    try {
      await customerService.updateAdditionalMonthlyPaymentBulk({
        amount: amountNumber,
        customerIds: targetIds,
      });
      setBulkAdditionalPaymentOpen(false);
      setBulkAdditionalPaymentValue("");
      setRowSelection({});
      refetchCustomersAll();
      setSnackbar({
        open: true,
        message: `Updated dry waste fee for ${targetIds.length} customers.`,
        severity: "success",
      });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update dry waste fee.", severity: "error" });
    }
  };

  const handleConfirmBulkTechemari = async () => {
    const targetIds = getTargetCustomerIds();
    if (targetIds.length === 0) {
      setSnackbar({ open: true, message: "No customers selected.", severity: "warning" });
      return;
    }
    const amountNumber = parseFloat(techemariKfyaValue);
    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      setSnackbar({ open: true, message: "Enter a valid non-negative amount.", severity: "warning" });
      return;
    }
    try {
      await customerService.updateTechemariBulk({
        fieldName: techemariNameValue,
        amount: amountNumber,
        customerIds: targetIds,
      });
      setBulkTechemariOpen(false);
      setTechemariNameValue("");
      setTechemariKfyaValue("");
      setRowSelection({});
      refetchCustomersAll();
      setSnackbar({
        open: true,
        message: `Updated additional fee for ${targetIds.length} customers.`,
        severity: "success",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to update additional fee.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    }
  };

  // Status Change
  const handleStatusConfirm = async (payload) => {
    if (!statusCustomerId) return;
    try {
      if (payload.status === "deleted") {
        const { billingTerminationReasonId, terminationRemark } = payload;
        await deactivateCustomer({
          id: statusCustomerId,
          data: { billingTerminationReasonId, terminationRemark },
        });
      } else if (payload.status === "active") {
        await activateCustomer(statusCustomerId);
      }
      setStatusModalOpen(false);
      setStatusCustomerId(null);
      setStatusModalMode(null);
    } catch (e) {
      // Handled in mutation onError
    }
  };

  // Excel Import / Update
  const handleFileUpload = (event) => {
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
      setSnackbar({ open: true, message: `Import failed: ${error.message}`, severity: "error" });
    } finally {
      setSelectedFile(null);
    }
  };

  const handleUpdateFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedUpdateFile(file);
    setConfirmUpdateOpen(true);
    event.target.value = "";
  };

  const handleConfirmUpdate = async () => {
    if (!selectedUpdateFile) return;
    try {
      setConfirmUpdateOpen(false);
      const result = await customerService.updateCustomersFromExcel(selectedUpdateFile);
      setUpdateResult(result);
      setUpdateDialogOpen(true);
      refetchCustomersAll();
    } catch (error) {
      setSnackbar({ open: true, message: `Update failed: ${error.message}`, severity: "error" });
    } finally {
      setSelectedUpdateFile(null);
    }
  };

  // Update Customer Reader via Excel
  const handleProcessReaderExcel = () => {
    if (!updateReaderFile) {
      setSnackbar({ open: true, message: "Upload an Excel file first.", severity: "warning" });
      return;
    }
    setUpdateReaderProcessing(true);
    setUpdateReaderMatchedCustomers([]);
    setUpdateReaderNotFound([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        const accountNumbers = jsonData
          .slice(1)
          .map((row) => (row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : ""))
          .filter((v) => v.length > 0);

        if (accountNumbers.length === 0) {
          setSnackbar({
            open: true,
            message: "No account numbers found in column B.",
            severity: "warning",
          });
          setUpdateReaderProcessing(false);
          return;
        }

        const accountSet = new Set(accountNumbers);
        const matched = [];
        const foundAccounts = new Set();

        (allCustomers || []).forEach((customer) => {
          if (customer.accountNumber && accountSet.has(customer.accountNumber.trim())) {
            matched.push(customer);
            foundAccounts.add(customer.accountNumber.trim());
          }
        });

        setUpdateReaderMatchedCustomers(matched);
        setUpdateReaderNotFound(accountNumbers.filter((acc) => !foundAccounts.has(acc)));
        setUpdateReaderProcessing(false);
      } catch (err) {
        setSnackbar({ open: true, message: "Failed to process Excel file.", severity: "error" });
        setUpdateReaderProcessing(false);
      }
    };
    reader.readAsArrayBuffer(updateReaderFile);
  };

  const handleSaveUpdateReader = async () => {
    if (!updateReaderReaderId) {
      setSnackbar({ open: true, message: "Please select a reader.", severity: "warning" });
      return;
    }
    if (updateReaderMatchedCustomers.length === 0) {
      setSnackbar({ open: true, message: "No matched customers to assign.", severity: "warning" });
      return;
    }
    setUpdateReaderSaving(true);
    try {
      const customerIds = updateReaderMatchedCustomers.map((c) => Number(c.id));
      await customerService.assignReaderBulk({
        readerId: Number(updateReaderReaderId),
        customerIds,
      });
      setSnackbar({
        open: true,
        message: `Successfully assigned reader to ${customerIds.length} customers.`,
        severity: "success",
      });
      setUpdateReaderModalOpen(false);
      refetchCustomersAll();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to assign reader.", severity: "error" });
    } finally {
      setUpdateReaderSaving(false);
    }
  };

  // Update Customer GPS (supports ID or Account Number)
  const handleProcessGpsJson = () => {
    if (!updateGpsFile) {
      setSnackbar({ open: true, message: "Upload a JSON file first.", severity: "warning" });
      return;
    }
    setUpdateGpsProcessing(true);
    setUpdateGpsMatchedCustomers([]);
    setUpdateGpsNotFound([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsedData = JSON.parse(e.target.result);
        let jsonData;
        if (Array.isArray(parsedData)) {
          jsonData = parsedData;
        } else if (parsedData && typeof parsedData === "object") {
          const arrayProp = Object.values(parsedData).find((v) => Array.isArray(v));
          jsonData = arrayProp ? arrayProp : [parsedData];
        } else {
          setSnackbar({ open: true, message: "Invalid JSON format.", severity: "error" });
          setUpdateGpsProcessing(false);
          return;
        }

        const customerMapById = new Map();
        const customerMapByAccount = new Map();
        (allCustomers || []).forEach((c) => {
          if (c.id) customerMapById.set(Number(c.id), c);
          if (c.accountNumber) customerMapByAccount.set(String(c.accountNumber).trim(), c);
        });

        const matched = [];
        const notFound = [];

        jsonData.forEach((entry) => {
          const id = Number(entry.customer_info_id || entry.id || entry.customerId);
          const acc = entry.accountNumber || entry.account_number || entry.account;
          const lat = entry.latitude ?? entry.lat;
          const lng = entry.longitude ?? entry.lng;

          if (lat === undefined || lng === undefined) return;

          let customer = null;
          if (id && customerMapById.has(id)) {
            customer = customerMapById.get(id);
          } else if (acc && customerMapByAccount.has(String(acc).trim())) {
            customer = customerMapByAccount.get(String(acc).trim());
          }

          if (customer) {
            let rawOldGps = customer.locationCoordination;
            let oldGpsFormatted = "-";
            if (rawOldGps) {
              const trimmed = String(rawOldGps).trim();
              if (trimmed && trimmed.toLowerCase() !== "null" && trimmed !== "-") {
                oldGpsFormatted = trimmed;
              }
            }

            matched.push({
              customerId: customer.id,
              accountNumber: customer.accountNumber || "-",
              fullName: customer.fullName || customer.fullNameEng || "-",
              oldGps: oldGpsFormatted,
              newGps: `${lat},${lng}`,
            });
          } else {
            notFound.push(id || acc || "Unknown");
          }
        });

        setUpdateGpsMatchedCustomers(matched);
        setUpdateGpsNotFound(notFound);
        setUpdateGpsProcessing(false);
      } catch (err) {
        setSnackbar({ open: true, message: "Failed to parse JSON file.", severity: "error" });
        setUpdateGpsProcessing(false);
      }
    };
    reader.readAsText(updateGpsFile);
  };

  const handleSaveUpdateGps = async () => {
    const diffEntries = updateGpsMatchedCustomers.filter((c) => c.oldGps !== c.newGps);
    if (diffEntries.length === 0) {
      setSnackbar({
        open: true,
        message: "No GPS changes to update. All coordinates are identical.",
        severity: "warning",
      });
      return;
    }
    setUpdateGpsSaving(true);
    try {
      const entries = diffEntries.map((c) => ({
        customerId: c.customerId,
        locationCoordination: c.newGps,
      }));
      await customerService.updateGpsBulk(entries);
      setSnackbar({
        open: true,
        message: `Successfully updated GPS for ${entries.length} customers.`,
        severity: "success",
      });
      setUpdateGpsModalOpen(false);
      refetchCustomersAll();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to update GPS coordinates.", severity: "error" });
    } finally {
      setUpdateGpsSaving(false);
    }
  };

  // Excel Export
  const handleExportExcel = useCallback(
    (recordsToExport = null) => {
      const list =
        recordsToExport ||
        (selectedCount > 0
          ? filteredCustomers.filter((c) => rowSelection[c.id])
          : filteredCustomers);

      if (!list || list.length === 0) {
        setSnackbar({ open: true, message: "No customer records to export.", severity: "warning" });
        return;
      }
      const exportData = list.map((c, idx) => ({
        "#": idx + 1,
        "Account Number": c.accountNumber || "",
        "Full Name": c.fullName || "",
        "English Name": c.fullNameEng || "",
        "Phone Number": c.phoneNumber || "",
        Status: c.status || "",
        "Meter Number": c.meterNumber || "",
        "Initial Reading": c.initialReading || 0,
        "Dry Waste Fee": c.additionalMonthlyPayment || 0,
        "Prepaid Balance": c.customerBalanceBirr || c.prepaidBirrCurrentBalance || 0,
        "Additional Fee Name": c.techemariFieldName || "",
        "Additional Fee Amount": c.techemariKfya || 0,
        "Has Old Penalty": c.oldHasPenalty ? "Yes" : "No",
        "Old Arrears Total": c.oldKfyaAndPenaltyTotal || 0,
        "Registered Date (EC)": c.registeredDateEthiopianAmharic || c.registeredDateEthiopian || "",
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Customers");
      const tabName = activeCustomerTab === 0 ? "Active" : "Deleted";
      XLSX.writeFile(wb, `Customers_${tabName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setSnackbar({
        open: true,
        message: `Exported ${exportData.length} customers to Excel.`,
        severity: "success",
      });
    },
    [filteredCustomers, rowSelection, selectedCount, activeCustomerTab]
  );

  // =====================================================================
  // TABLE CONFIGURATION (BILINGUAL COLUMNS & ADVANCED SEARCH)
  // =====================================================================

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
        filterFn: "contains",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.main" }}>
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "fullName",
        header: "Full Name (ሙሉ ስም)",
        filterFn: "bilingualName", // Searches BOTH Amharic & English
        Cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.original.fullName || "—"}
            </Typography>
            {row.original.fullNameEng && (
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {row.original.fullNameEng}
              </Typography>
            )}
          </Box>
        ),
      },
      {
        accessorKey: "fullNameEng",
        header: "English Name",
        filterFn: "contains",
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone Number",
        filterFn: "contains",
        Cell: ({ cell }) => cell.getValue() || "—",
      },
      {
        accessorKey: "addressStreetsId",
        header: "Kebele",
        Cell: ({ cell }) => {
          const k = (kebeles || []).find((x) => String(x.id) === String(cell.getValue()));
          return k?.name || cell.getValue() || "—";
        },
      },
      {
        accessorKey: "meterNumber",
        header: "Meter Number",
        filterFn: "contains",
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <SpeedIcon fontSize="inherit" color="action" />
            <span>{cell.getValue() || "—"}</span>
          </Box>
        ),
      },
      {
        accessorKey: "customerBalanceBirr",
        header: "Prepaid Deposit",
        Cell: ({ row }) => {
          const val = Number(
            row.original.customerBalanceBirr || row.original.prepaidBirrCurrentBalance || 0
          );
          return val > 0 ? (
            <Chip label={`${val.toLocaleString()} ETB`} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
          ) : (
            "—"
          );
        },
      },
      {
        accessorKey: "registeredDate",
        header: "Reg. Date (EC)",
        Cell: ({ row }) => {
          return (
            row.original.registeredDateEthiopianAmharic ||
            row.original.registeredDateEthiopian ||
            "—"
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        Cell: ({ row }) => {
          const isComplete = row.original.completeDeleted === "deleted";
          const isActive = row.original.status === "active";
          return (
            <Chip
              size="small"
              label={isComplete ? "Complete Deleted" : isActive ? "Active" : "Terminated"}
              color={isComplete ? "default" : isActive ? "success" : "error"}
              sx={{ fontWeight: 700 }}
            />
          );
        },
      },
    ],
    [kebeles]
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredCustomers,
    filterFns: {
      amharicFuzzy: amharicFuzzyFilter,
      bilingualName: bilingualNameFilter,
    },
    globalFilterFn: bilingualGlobalFilter, // Enables common search across English, Amharic, Account, Phone, Meter
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    manualPagination: false,
    enableColumnFilterModes: true,
    columnFilterModeOptions: ["contains", "startsWith", "equals", "fuzzy", "bilingualName"],
    enableRowNumbers: true,
    rowNumberMode: "original",
    state: {
      pagination,
      isLoading: isCustomersLoading,
      showProgressBars: isFetching,
      showAlertBanner: isCustomersError,
      rowSelection,
    },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    enableRowActions: true,
    positionActionsColumn: "first",
    renderRowActions: ({ row }) => {
      const isActive = row.original.status === "active";
      const isCompletelyDeleted = row.original.completeDeleted === "deleted";

      return (
        <Box sx={{ display: "flex", gap: "0.25rem" }}>
          <Tooltip title="View 360 Customer Profile">
            <IconButton
              size="small"
              onClick={() => setViewedCustomerId(row.original.id)}
              color="primary"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Customer Information">
            <IconButton
              size="small"
              onClick={() => setEditingCustomerId(row.original.id)}
              color="info"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isActive ? (
            <Tooltip title="Deactivate / Terminate Customer">
              <IconButton
                color="error"
                size="small"
                onClick={() => {
                  setStatusCustomerId(row.original.id);
                  setStatusModalMode("deactivate");
                  setStatusModalOpen(true);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              {!isCompletelyDeleted && (
                <Tooltip title="Reactivate Customer">
                  <IconButton
                    color="success"
                    size="small"
                    onClick={() => {
                      setStatusCustomerId(row.original.id);
                      setStatusModalMode("activate");
                      setStatusModalOpen(true);
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {!isCompletelyDeleted && (
                <Tooltip title="Permanent Complete Delete">
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      setCompleteDeleteCustomerId(row.original.id);
                      setCompleteDeleteDialogOpen(true);
                    }}
                    disabled={isCompleteDeleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      );
    },
    renderTopToolbarCustomActions: () => (
      <CustomerToolbar
        onCreate={() => {
          setEditingCustomerId(null);
          setCreateModalOpen(true);
        }}
        onImportClick={() => fileInputRef.current?.click()}
        onUpdateClick={() => updateFileInputRef.current?.click()}
        onUpdateReaderOpen={() => setUpdateReaderModalOpen(true)}
        onUpdateGpsOpen={() => setUpdateGpsModalOpen(true)}
        onRefresh={() => refetchCustomersAll()}
        onExportExcel={() => handleExportExcel()}
        isFetching={isFetching}
        selectedCustomerId={selectedCustomerId}
        selectedCount={selectedCount}
        onClearSelection={() => {
          setRowSelection({});
          setAssignScope("");
        }}
        onOpenMeters={() => {
          setMetersCustomerId(selectedCustomerId);
          setMetersOpen(true);
        }}
        onOpenAssignReader={() => {
          setAssignReaderId("");
          setBulkBranchId(selectedBranchId || "");
          setAssignDialogOpen(true);
        }}
        onOpenBulkPayment={() => setBulkAdditionalPaymentOpen(true)}
        onOpenBulkTechemari={() => setBulkTechemariOpen(true)}
        canUpdateDryWaste={canUpdateDryWaste}
        fileInputRef={fileInputRef}
        updateFileInputRef={updateFileInputRef}
        handleFileUpload={handleFileUpload}
        handleUpdateFileUpload={handleUpdateFileUpload}
      />
    ),
    muiToolbarAlertBannerProps: isCustomersError
      ? { color: "error", children: "Error loading customer records from server" }
      : undefined,
  });

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Customer Management" />

      {/* EXECUTIVE KPI METRIC CARDS */}
      <Grid container spacing={2} sx={{ mt: 1, mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              borderLeft: "4px solid",
              borderColor: "primary.main",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Active Consumers
              </Typography>
              <PeopleIcon color="primary" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>
              {kpiStats.totalActive.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Database: {kpiStats.totalCount.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              borderLeft: "4px solid",
              borderColor: "error.main",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Terminated / Inactive
              </Typography>
              <PersonOffIcon color="error" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: "error.main" }}>
              {kpiStats.totalDeleted.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Complete Deleted: {kpiStats.totalCompleteDeleted.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              borderLeft: "4px solid",
              borderColor: "success.main",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Prepaid Balances
              </Typography>
              <AccountBalanceWalletIcon color="success" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: "success.main" }}>
              {kpiStats.totalPrepaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total consumer deposits (ETB)
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              borderLeft: "4px solid",
              borderColor: "warning.main",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Unassigned Readers
              </Typography>
              <WarningIcon color="warning" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 1, color: "warning.dark" }}>
              {kpiStats.unassignedReaders.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Requires mobile reader assignment
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* MAIN CONTAINER */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
        {/* Active vs Deleted Customer Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeCustomerTab}
            onChange={handleCustomerTabChange}
            aria-label="customer status tabs"
          >
            <Tab
              label={`Active Consumers (${activeCustomers.length.toLocaleString()})`}
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
            <Tab
              label={`Terminated / Deleted (${deletedCustomers.length.toLocaleString()})`}
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* RESPONSIVE FILTER BAR */}
        <CustomerFilters
          selectedCustomerTypeId={selectedCustomerTypeId}
          selectedKebeleId={selectedKebeleId}
          selectedKetenaId={selectedKetenaId}
          selectedBranchId={selectedBranchId}
          selectedReaderId={selectedReaderId}
          filterOldPenalty={filterOldPenalty}
          filterRegistrationDateFrom={filterRegistrationDateFrom}
          filterRegistrationDateTo={filterRegistrationDateTo}
          filterHasPrepaid={filterHasPrepaid}
          filterMeterChanged={filterMeterChanged}
          filterHasDryWaste={filterHasDryWaste}
          filterHasAdditionalPayment={filterHasAdditionalPayment}
          assignScope={assignScope}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
          onAssignScopeChange={(value) => {
            setAssignScope(value);
            if (!value) {
              setRowSelection({});
            } else if (value === "visible") {
              const next = {};
              table.getRowModel().rows.forEach((r) => {
                next[r.id] = true;
              });
              setRowSelection(next);
            } else if (value === "all") {
              const next = {};
              filteredCustomers.forEach((r) => {
                next[r.id] = true;
              });
              setRowSelection(next);
            }
          }}
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
          formatEthiopianDateForPicker={formatEthiopianDateForPicker}
        />

        {/* FLOATING SELECTION ACTION BAR */}
        {selectedCount > 0 && (
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 2,
              bgcolor: "primary.lighter",
              border: "1px solid",
              borderColor: "primary.main",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={`${selectedCount} Selected`}
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Quick Batch Actions:
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AssignmentIndIcon />}
                onClick={() => {
                  setAssignReaderId("");
                  setBulkBranchId(selectedBranchId || "");
                  setAssignDialogOpen(true);
                }}
              >
                Assign Reader
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<CleaningServicesIcon />}
                onClick={() => setBulkAdditionalPaymentOpen(true)}
              >
                Set Dry Waste
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<PaymentsIcon />}
                onClick={() => setBulkTechemariOpen(true)}
              >
                Set Additional Fee
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportExcel()}
              >
                Export Selected
              </Button>
              <Button
                size="small"
                color="inherit"
                onClick={() => {
                  setRowSelection({});
                  setAssignScope("");
                }}
              >
                Clear Selection
              </Button>
            </Box>
          </Paper>
        )}

        {/* Table View Counts & Info */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Showing <strong>{filteredCustomers.length.toLocaleString()}</strong> filtered consumers
            (Page {pagination.pageIndex + 1} of{" "}
            {Math.ceil(filteredCustomers.length / pagination.pageSize) || 1})
          </Typography>
        </Box>

        {/* Material React Table */}
        <MaterialReactTable table={table} />
      </Paper>

      {/* BILLS & INVOICE LEDGER PANEL */}
      <CustomerBillsPanel
        selectedCustomerId={selectedCustomerId}
        customerName={selectedCustomerObj?.fullName || selectedCustomerObj?.fullNameEng || ""}
        accountNumber={selectedCustomerObj?.accountNumber || ""}
        combinedBillData={combinedBillData}
        isLoading={isBillsLoading}
        isError={isBillsError}
        activeBillTab={activeBillTab}
        onBillTabChange={(e, val) => setActiveBillTab(val)}
      />

      {/* =================== MODAL SUITE =================== */}

      {/* Create & Edit Modal (Passes existingCustomers for Duplicate Protection) */}
      <CustomerFormModal
        open={isCreateModalOpen || Boolean(editingCustomerId)}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingCustomerId(null);
        }}
        onSubmit={editingCustomerId ? handleUpdateSubmit : handleCreateSubmit}
        customer={isFetchingCustomer ? null : editingCustomer}
        isLoading={isFetchingCustomer || isUpdating || isCreating}
        lookupData={{ kebeles, branches, customerTypes, meterSizes }}
        existingCustomers={allCustomers}
        ketenaFetcher={getKetenasByKebeleCached}
        readerFetcher={getReadersByBranchCached}
      />

      {/* Status Activation / Deactivation Modal */}
      <CustomerStatusModal
        open={statusModalOpen}
        mode={statusModalMode}
        customer={statusCustomerObj}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusCustomerId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        isSubmitting={isDeactivating || isActivating}
      />

      {/* Customer 360 View Modal */}
      <ViewCustomerModal
        open={Boolean(viewedCustomer)}
        onClose={() => setViewedCustomerId(null)}
        customer={viewedCustomer}
        isLoading={isCustomerDetailsFetching}
        lookupData={{ customerTypes, meterSizes, kebeles, branches }}
        onEdit={(id) => {
          setEditingCustomerId(id);
          setViewedCustomerId(null);
        }}
        onOpenMeters={(id) => {
          setMetersCustomerId(id);
          setMetersOpen(true);
        }}
      />

      {/* Meters Management Modal (Passes allCustomers for Duplicate Meter Protection) */}
      <MetersModal
        meterSizes={meterSizes}
        open={isMetersOpen}
        onClose={() => {
          setMetersOpen(false);
          setMetersCustomerId(null);
        }}
        customerId={metersCustomerId || selectedCustomerId}
        allCustomers={allCustomers}
      />

      {/* Safe Complete Delete Confirmation */}
      <ConfirmDialog
        open={completeDeleteDialogOpen}
        title="Confirm Permanent Customer Deletion"
        content={
          <Typography variant="body2">
            Are you sure you want to permanently delete customer{" "}
            <strong>#{completeDeleteCustomerId}</strong>? This action finalizes removal and cannot
            be undone.
          </Typography>
        }
        confirmText="Permanently Delete"
        confirmColor="error"
        onClose={() => {
          setCompleteDeleteDialogOpen(false);
          setCompleteDeleteCustomerId(null);
        }}
        onConfirm={async () => {
          if (completeDeleteCustomerId) {
            await completeDeleteCustomer(completeDeleteCustomerId);
            setCompleteDeleteDialogOpen(false);
            setCompleteDeleteCustomerId(null);
          }
        }}
      />

      {/* Bulk Actions Suite */}
      <BulkActionsDialogs
        assignDialogOpen={assignDialogOpen}
        onAssignClose={() => setAssignDialogOpen(false)}
        onAssignConfirm={handleConfirmAssignReader}
        assignReaderId={assignReaderId}
        onAssignReaderIdChange={setAssignReaderId}
        readers={readers}
        isReadersLoading={isReadersLoading}
        selectedBranchId={bulkBranchId || selectedBranchId}
        branches={branches}
        onBranchChange={(bId) => {
          setBulkBranchId(bId);
          setAssignReaderId("");
        }}
        targetCustomerCount={targetCustomerCount}
        bulkPaymentOpen={bulkAdditionalPaymentOpen}
        onPaymentClose={() => setBulkAdditionalPaymentOpen(false)}
        onPaymentConfirm={handleConfirmBulkAdditionalPayment}
        paymentValue={bulkAdditionalPaymentValue}
        onPaymentValueChange={setBulkAdditionalPaymentValue}
        bulkTechemariOpen={bulkTechemariOpen}
        onTechemariClose={() => setBulkTechemariOpen(false)}
        onTechemariConfirm={handleConfirmBulkTechemari}
        techemariName={techemariNameValue}
        onTechemariNameChange={setTechemariNameValue}
        techemariAmount={techemariKfyaValue}
        onTechemariAmountChange={setTechemariKfyaValue}
      />

      {/* Import & Update Suite */}
      <ImportDialogs
        confirmImportOpen={confirmImportOpen}
        onCancelImport={() => {
          setConfirmImportOpen(false);
          setSelectedFile(null);
        }}
        onConfirmImport={handleConfirmImport}
        selectedFile={selectedFile}
        importDialogOpen={importDialogOpen}
        onCloseImportDialog={() => {
          setImportDialogOpen(false);
          setImportResult(null);
        }}
        importResult={importResult}
        confirmUpdateOpen={confirmUpdateOpen}
        onCancelUpdate={() => {
          setConfirmUpdateOpen(false);
          setSelectedUpdateFile(null);
        }}
        onConfirmUpdate={handleConfirmUpdate}
        selectedUpdateFile={selectedUpdateFile}
        updateDialogOpen={updateDialogOpen}
        onCloseUpdateDialog={() => {
          setUpdateDialogOpen(false);
          setUpdateResult(null);
        }}
        updateResult={updateResult}
        updateReaderModalOpen={updateReaderModalOpen}
        onUpdateReaderClose={() => setUpdateReaderModalOpen(false)}
        branches={branches}
        isBranchesLoading={isBranchesLoading}
        updateReaderBranchId={updateReaderBranchId}
        onUpdateReaderBranchIdChange={(val) => {
          setUpdateReaderBranchId(val);
          setUpdateReaderReaderId("");
        }}
        updateReaderReaderId={updateReaderReaderId}
        onUpdateReaderReaderIdChange={setUpdateReaderReaderId}
        updateReaderReaders={updateReaderReaders}
        isUpdateReaderReadersLoading={isUpdateReaderReadersLoading}
        updateReaderFile={updateReaderFile}
        onUpdateReaderFileChange={(file) => {
          setUpdateReaderFile(file);
          setUpdateReaderMatchedCustomers([]);
          setUpdateReaderNotFound([]);
        }}
        onUpdateReaderFileClear={() => {
          setUpdateReaderFile(null);
          setUpdateReaderMatchedCustomers([]);
          setUpdateReaderNotFound([]);
        }}
        updateReaderMatchedCustomers={updateReaderMatchedCustomers}
        updateReaderNotFound={updateReaderNotFound}
        updateReaderProcessing={updateReaderProcessing}
        updateReaderSaving={updateReaderSaving}
        onProcessReaderExcel={handleProcessReaderExcel}
        onSaveUpdateReader={handleSaveUpdateReader}
        updateGpsModalOpen={updateGpsModalOpen}
        onUpdateGpsClose={() => setUpdateGpsModalOpen(false)}
        updateGpsFile={updateGpsFile}
        onUpdateGpsFileChange={(file) => {
          setUpdateGpsFile(file);
          setUpdateGpsMatchedCustomers([]);
          setUpdateGpsNotFound([]);
        }}
        onUpdateGpsFileClear={() => {
          setUpdateGpsFile(null);
          setUpdateGpsMatchedCustomers([]);
          setUpdateGpsNotFound([]);
        }}
        updateGpsMatchedCustomers={updateGpsMatchedCustomers}
        updateGpsNotFound={updateGpsNotFound}
        updateGpsProcessing={updateGpsProcessing}
        updateGpsSaving={updateGpsSaving}
        onProcessGpsJson={handleProcessGpsJson}
        onSaveUpdateGps={handleSaveUpdateGps}
      />

      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const queryClient = new QueryClient();

const CustomerListPage = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <CustomerList />
    </ErrorBoundary>
  </QueryClientProvider>
);

export default CustomerListPage;
