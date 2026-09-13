"use client";
import { useMemo, useState, useRef, useCallback } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Grid, Paper, Typography, Tooltip, IconButton, Tabs, Tab, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
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
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import ViewCustomerModal from "./ViewCustomerModal";
import CustomerFormModal from "./CustomerFormModal";
import MetersModal from "./MetersModal";
import CustomerStatusModal from "./CustomerStatusModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
import { ReadingService } from "../../../lib/ReadingService";
import { useEffect } from "react";

// Sub-components
import ErrorBoundary from "./ErrorBoundary";
import CustomerFilters from "./CustomerFilters";
import CustomerBillsPanel from "./CustomerBillsPanel";
import BulkActionsDialogs from "./BulkActionsDialogs";
import ImportDialogs from "./ImportDialogs";
import CustomerToolbar from "./CustomerToolbar";

// Single module-level service instances (no duplicates)
const readingService = new ReadingService();
const customerService = new CustomerService();
const dropdownService = new DropdownService();

const CustomerList = () => {
  const queryClient = useQueryClient();

  // =====================================================================
  // STATE DECLARATIONS (all grouped at top)
  // =====================================================================

  // Customer selection & tabs
  const [viewedCustomerId, setViewedCustomerId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeCustomerTab, setActiveCustomerTab] = useState(0);
  const [activeBillTab, setActiveBillTab] = useState(0);

  // Modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [deactivatingCustomerId, setDeactivatingCustomerId] = useState(null);
  const [isMetersOpen, setMetersOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusCustomerId, setStatusCustomerId] = useState(null);

  // Complete Delete confirmation (replaces window.confirm)
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

  // Import/Update
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
        return new Date(dateValue);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  // Unified filter change handler
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
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return [];
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
    enabled: !!selectedBranchId,
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

  // Cached fetchers for child modals
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
      const data = await customerService.getAllCustomers();
      return data;
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

  // Combined bill data
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
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  // =====================================================================
  // COMPUTED DATA
  // =====================================================================

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
      result = result.filter((c) => c.customerTypeId && String(c.customerTypeId) === String(selectedCustomerTypeId));
    }
    if (selectedKebeleId) {
      result = result.filter((c) => c.addressStreetsId && String(c.addressStreetsId) === String(selectedKebeleId));
    }
    if (selectedKetenaId) {
      result = result.filter((c) => c.addressKetenaId && String(c.addressKetenaId) === String(selectedKetenaId));
    }
    if (selectedBranchId) {
      result = result.filter((c) => c.branchsId && String(c.branchsId) === String(selectedBranchId));
    }
    if (selectedReaderId) {
      result = result.filter((c) => c.assignedReaderId && String(c.assignedReaderId) === String(selectedReaderId));
    }
    if (filterOldPenalty === "true") {
      result = result.filter((c) => c.oldHasPenalty === true);
    } else if (filterOldPenalty === "false") {
      result = result.filter((c) => c.oldHasPenalty === false);
    }
    if (filterRegistrationDateFrom || filterRegistrationDateTo) {
      result = result.filter((c) => {
        const regDate = c.registeredDate;
        if (!regDate) return false;
        let customerDate = typeof regDate === "string" ? new Date(regDate) : regDate instanceof Date ? regDate : null;
        if (!customerDate) return false;
        if (filterRegistrationDateFrom instanceof Date && customerDate < filterRegistrationDateFrom) return false;
        if (filterRegistrationDateTo instanceof Date && customerDate > filterRegistrationDateTo) return false;
        return true;
      });
    }
    if (filterHasPrepaid === "true") {
      result = result.filter((c) => c.prepaidBirrCurrentBalance > 0);
    } else if (filterHasPrepaid === "false") {
      result = result.filter((c) => c.prepaidBirrCurrentBalance <= 0);
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
    activeCustomers, deletedCustomers, activeCustomerTab,
    selectedCustomerTypeId, selectedKebeleId, selectedKetenaId,
    selectedBranchId, selectedReaderId, filterOldPenalty,
    filterRegistrationDateFrom, filterRegistrationDateTo,
    filterHasPrepaid, filterMeterChanged, filterHasDryWaste,
    filterHasAdditionalPayment,
  ]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return {
      content: filteredCustomers.slice(start, end),
      totalElements: filteredCustomers.length,
    };
  }, [filteredCustomers, pagination.pageIndex, pagination.pageSize]);

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

  const { mutateAsync: activateCustomer } = useMutation({
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

  const handleBillTabChange = (event, newValue) => {
    setActiveBillTab(newValue);
  };

  const handleCustomerTabChange = (event, newValue) => {
    setActiveCustomerTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setActiveBillTab(0);
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedCustomerId(selectedIds.length === 1 ? selectedIds[0] : null);
    setActiveBillTab(0);
  }, [rowSelection]);

  const handleCreateSubmit = async (data) => {
    await createCustomer(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingCustomerId) return;
    await updateCustomer({ id: editingCustomerId, data });
  };

  // --- Import handlers ---
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
      setSnackbar({ open: true, message: `Import failed: ${error.message}`, severity: "error" });
    } finally {
      setSelectedFile(null);
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleCancelImport = () => { setConfirmImportOpen(false); setSelectedFile(null); };
  const handleCloseImportDialog = () => { setImportDialogOpen(false); setImportResult(null); };

  // --- Update handlers ---
  const handleUpdateFileUpload = async (event) => {
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

  const handleUpdateClick = () => updateFileInputRef.current?.click();
  const handleCancelUpdate = () => { setConfirmUpdateOpen(false); setSelectedUpdateFile(null); };
  const handleCloseUpdateDialog = () => { setUpdateDialogOpen(false); setUpdateResult(null); };

  // --- Update Customer Reader handlers ---
  const handleUpdateReaderModalClose = () => {
    setUpdateReaderModalOpen(false);
    setUpdateReaderBranchId("");
    setUpdateReaderReaderId("");
    setUpdateReaderFile(null);
    setUpdateReaderMatchedCustomers([]);
    setUpdateReaderNotFound([]);
    setUpdateReaderProcessing(false);
    setUpdateReaderSaving(false);
  };

  const handleProcessReaderExcel = () => {
    if (!updateReaderFile) {
      setSnackbar({ open: true, message: "Please upload an Excel file first.", severity: "warning" });
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
          setSnackbar({ open: true, message: "No account numbers found in column B.", severity: "warning" });
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
      await customerService.assignReaderBulk({ readerId: Number(updateReaderReaderId), customerIds });
      setSnackbar({ open: true, message: `Successfully assigned reader to ${customerIds.length} customers.`, severity: "success" });
      handleUpdateReaderModalClose();
      refetchCustomersAll();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to assign reader to customers.", severity: "error" });
    } finally {
      setUpdateReaderSaving(false);
    }
  };

  // --- Update GPS handlers ---
  const handleUpdateGpsModalClose = () => {
    setUpdateGpsModalOpen(false);
    setUpdateGpsFile(null);
    setUpdateGpsMatchedCustomers([]);
    setUpdateGpsNotFound([]);
    setUpdateGpsProcessing(false);
    setUpdateGpsSaving(false);
  };

  const handleProcessGpsJson = () => {
    if (!updateGpsFile) {
      setSnackbar({ open: true, message: "Please upload a JSON file first.", severity: "warning" });
      return;
    }
    setUpdateGpsProcessing(true);
    setUpdateGpsMatchedCustomers([]);
    setUpdateGpsNotFound([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let parsedData = JSON.parse(e.target.result);
        // Support: array [...], single object {...}, or object with an array property { key: [...] }
        let jsonData;
        if (Array.isArray(parsedData)) {
          jsonData = parsedData;
        } else if (parsedData && typeof parsedData === "object") {
          // Check if it's a wrapper object with an array value
          const arrayProp = Object.values(parsedData).find((v) => Array.isArray(v));
          if (arrayProp) {
            jsonData = arrayProp;
          } else {
            // Single object — wrap in array
            jsonData = [parsedData];
          }
        } else {
          setSnackbar({ open: true, message: "Invalid JSON format.", severity: "error" });
          setUpdateGpsProcessing(false);
          return;
        }

        // Build a lookup map from allCustomers: id -> customer
        const customerMap = new Map();
        (allCustomers || []).forEach((c) => {
          customerMap.set(Number(c.id), c);
        });

        const matched = [];
        const notFound = [];

        jsonData.forEach((entry) => {
          const id = Number(entry.customer_info_id);
          const lat = entry.latitude;
          const lng = entry.longitude;
          if (!id || lat === undefined || lng === undefined) return;

          const customer = customerMap.get(id);
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
              customerId: id,
              accountNumber: customer.accountNumber || "-",
              fullName: customer.fullName || customer.fullNameEng || "-",
              oldGps: oldGpsFormatted,
              newGps: `${lat},${lng}`,
            });
          } else {
            notFound.push(id);
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
      setSnackbar({ open: true, message: "No GPS changes to update. All coordinates are the same.", severity: "warning" });
      return;
    }
    setUpdateGpsSaving(true);
    try {
      const entries = diffEntries.map((c) => ({
        customerId: c.customerId,
        locationCoordination: c.newGps,
      }));
      await customerService.updateGpsBulk(entries);
      setSnackbar({ open: true, message: `Successfully updated GPS for ${entries.length} customers.`, severity: "success" });
      handleUpdateGpsModalClose();
      refetchCustomersAll();
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to update GPS coordinates.", severity: "error" });
    } finally {
      setUpdateGpsSaving(false);
    }
  };

  // --- Bulk operation handlers ---
  const handleConfirmBulkAdditionalPayment = async () => {
    const explicitSelectedIds = Object.keys(rowSelection || {}).map((id) => Number(id));
    let targetIds = explicitSelectedIds;
    if (targetIds.length === 0 && assignScope) {
      targetIds = assignScope === "visible"
        ? (paginatedData.content || []).map((c) => Number(c.id))
        : (filteredCustomers || []).map((c) => Number(c.id));
    }
    if (targetIds.length === 0) {
      setSnackbar({ open: true, message: "No customers to update. Select rows or adjust Scope/filters.", severity: "warning" });
      return;
    }
    const amountNumber = parseFloat(bulkAdditionalPaymentValue);
    if (Number.isNaN(amountNumber)) {
      setSnackbar({ open: true, message: "Enter a valid amount.", severity: "warning" });
      return;
    }
    if (amountNumber < 0) {
      setSnackbar({ open: true, message: "Amount cannot be negative.", severity: "warning" });
      return;
    }
    try {
      await customerService.updateAdditionalMonthlyPaymentBulk({ amount: amountNumber, customerIds: targetIds });
      setBulkAdditionalPaymentOpen(false);
      setBulkAdditionalPaymentValue("");
      setRowSelection({});
      refetchCustomersAll();
      setSnackbar({ open: true, message: "Additional monthly payment updated.", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to update additional payment.", severity: "error" });
    }
  };

  const handleConfirmBulkTechemari = async () => {
    const explicitSelectedIds = Object.keys(rowSelection || {}).map((id) => Number(id));
    let targetIds = explicitSelectedIds;
    if (targetIds.length === 0 && assignScope) {
      targetIds = assignScope === "visible"
        ? (paginatedData.content || []).map((c) => Number(c.id))
        : (filteredCustomers || []).map((c) => Number(c.id));
    }
    if (targetIds.length === 0) {
      setSnackbar({ open: true, message: "No customers to update. Select rows or adjust Scope/filters.", severity: "warning" });
      return;
    }
    const amountNumber = parseFloat(techemariKfyaValue);
    if (Number.isNaN(amountNumber)) {
      setSnackbar({ open: true, message: "Enter a valid amount.", severity: "warning" });
      return;
    }
    if (amountNumber < 0) {
      setSnackbar({ open: true, message: "Amount cannot be negative.", severity: "warning" });
      return;
    }
    try {
      await customerService.updateTechemariBulk({ fieldName: techemariNameValue, amount: amountNumber, customerIds: targetIds });
      setBulkTechemariOpen(false);
      setTechemariNameValue("");
      setTechemariKfyaValue("");
      setRowSelection({});
      refetchCustomersAll();
      setSnackbar({ open: true, message: "Additional Fee updated.", severity: "success" });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to update additional fee.";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    }
  };

  const handleConfirmAssignReader = async () => {
    try {
      const explicitSelectedIds = Object.keys(rowSelection || {}).map((id) => Number(id));
      let targetIds = explicitSelectedIds;
      if (targetIds.length === 0 && assignScope) {
        targetIds = assignScope === "visible"
          ? (paginatedData.content || []).map((c) => Number(c.id))
          : (filteredCustomers || []).map((c) => Number(c.id));
      }
      if (!assignReaderId || targetIds.length === 0) {
        setSnackbar({ open: true, message: "Select a reader and some customers (by selecting rows or via Scope).", severity: "warning" });
        return;
      }
      await customerService.assignReaderBulk({ readerId: Number(assignReaderId), customerIds: targetIds });
      setAssignDialogOpen(false);
      setSnackbar({ open: true, message: "Assigned reader successfully.", severity: "success" });
      setRowSelection({});
      refetchCustomersAll();
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to assign reader.", severity: "error" });
    }
  };

  // --- Status change handler ---
  const handleStatusConfirm = async (payload) => {
    if (!statusCustomerId) return;
    try {
      if (payload.status === "deleted") {
        const { billingTerminationReasonId, terminationRemark } = payload;
        await deactivateCustomer({ id: statusCustomerId, data: { billingTerminationReasonId, terminationRemark } });
      } else if (payload.status === "active") {
        await activateCustomer(statusCustomerId);
      }
      setStatusModalOpen(false);
      setStatusCustomerId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  // --- Excel Export ---
  const handleExportExcel = useCallback(() => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      setSnackbar({ open: true, message: "No data to export.", severity: "warning" });
      return;
    }
    const exportData = filteredCustomers.map((c, idx) => ({
      "#": idx + 1,
      "Account Number": c.accountNumber || "",
      "Full Name": c.fullName || "",
      "English Name": c.fullNameEng || "",
      "Phone Number": c.phoneNumber || "",
      "Status": c.status || "",
      "Meter Number": c.meterNumber || "",
      "Initial Reading": c.initialReading || 0,
      "Dry Waste": c.additionalMonthlyPayment || 0,
      "Prepaid Balance": c.prepaidBirrCurrentBalance || 0,
      "Additional Fee Name": c.techemariFieldName || "",
      "Additional Fee": c.techemariKfya || 0,
      "Has Old Penalty": c.oldHasPenalty ? "Yes" : "No",
      "Old Penalty Total": c.oldKfyaAndPenaltyTotal || 0,
      "Old Penalty Months": c.oldPenlityNumberOfMonths || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    const tabName = activeCustomerTab === 0 ? "Active" : "Deleted";
    XLSX.writeFile(wb, `Customers_${tabName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setSnackbar({ open: true, message: `Exported ${exportData.length} customers.`, severity: "success" });
  }, [filteredCustomers, activeCustomerTab]);

  // --- Scope change handler ---
  const handleAssignScopeChange = useCallback((value) => {
    setAssignScope(value);
    if (!value) {
      setRowSelection({});
    }
    // Note: table-level row selection for 'visible'/'all' is handled in the table config
  }, []);

  // =====================================================================
  // TABLE CONFIGURATION
  // =====================================================================

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
      },
      { accessorKey: "accountNumber", header: "Account Number", filterFn: "amharicFuzzy" },
      { accessorKey: "fullName", header: "Full Name", filterFn: "amharicFuzzy" },
      { accessorKey: "fullNameEng", header: "English Name", filterFn: "amharicFuzzy" },
      { accessorKey: "phoneNumber", header: "Phone Number", filterFn: "amharicFuzzy" },
      {
        accessorKey: "registeredDate",
        header: "Registered Date EC",
        Cell: ({ row }) => {
          const ethiopianDate = row.original.registeredDateEthiopian;
          if (ethiopianDate) return ethiopianDate;
          const ethiopianDateAmharic = row.original.registeredDateEthiopianAmharic;
          if (ethiopianDateAmharic) return ethiopianDateAmharic;
          const gregorianDate = row.original.registeredDate;
          if (gregorianDate) {
            try {
              return EthiopianCalendarConverterPure.formatEthiopianDate(
                EthiopianCalendarConverterPure.gregorianToEthiopian(gregorianDate),
                "dd/MM/yyyy"
              );
            } catch (error) {
              return gregorianDate;
            }
          }
          const year = row.original.registeredYear;
          const month = row.original.registeredMonth;
          if (year && month) return `${month}/${year}`;
          return "-";
        },
      },
      { accessorKey: "status", header: "Status" },
    ],
    []
  );

  const hasExplicitSelection = Object.keys(rowSelection || {}).length > 0;
  const hasScopeTargets =
    assignScope === "visible"
      ? (paginatedData.content || []).length > 0
      : assignScope === "all"
        ? filteredCustomers.length > 0
        : false;
  const canUpdateDryWaste = hasExplicitSelection || hasScopeTargets;

  const table = useMaterialReactTable({
    columns,
    data: filteredCustomers,
    filterFns: { amharicFuzzy: amharicFuzzyFilter },
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true, // ENABLED: global search
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    manualPagination: false,
    enableColumnFilterModes: true,
    columnFilterModeOptions: ["contains", "startsWith", "equals", "fuzzy", "amharicFuzzy"],
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
        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          <Tooltip title="View Customer Details">
            <IconButton size="small" onClick={() => setViewedCustomerId(row.original.id)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Customer">
            <IconButton size="small" onClick={() => setEditingCustomerId(row.original.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {isActive ? (
            <Tooltip title="Deactivate Customer">
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
                <Tooltip title="Activate Customer">
                  <IconButton
                    color="primary"
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
                <Tooltip title="Complete Delete">
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
        onCreate={() => { setEditingCustomerId(null); setCreateModalOpen(true); }}
        onImportClick={handleImportClick}
        onUpdateClick={handleUpdateClick}
        onUpdateReaderOpen={() => setUpdateReaderModalOpen(true)}
        onUpdateGpsOpen={() => setUpdateGpsModalOpen(true)}
        onRefresh={() => refetchCustomersAll()}
        onExportExcel={handleExportExcel}
        isFetching={isFetching}
        selectedCustomerId={selectedCustomerId}
        onOpenMeters={() => setMetersOpen(true)}
        onOpenAssignReader={() => { setAssignReaderId(""); setAssignDialogOpen(true); }}
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
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Customer List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            {/* Active/Deleted Tabs */}
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

            {/* Filters */}
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
                  table.setRowSelection({});
                } else if (value === "visible") {
                  const next = {};
                  table.getRowModel().rows.forEach((r) => { next[r.id] = true; });
                  table.setRowSelection(next);
                } else if (value === "all") {
                  const next = {};
                  table.getFilteredRowModel().rows.forEach((r) => { next[r.id] = true; });
                  table.setRowSelection(next);
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

            {/* Counts */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Filtered: {filteredCustomers.length.toLocaleString()} (
                Active: {activeCustomers.length.toLocaleString()},
                Deleted: {deletedCustomers.length.toLocaleString()}
                )
              </Typography>
            </Box>

            {/* Customer Table */}
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      {/* Bills Panel */}
      <CustomerBillsPanel
        selectedCustomerId={selectedCustomerId}
        combinedBillData={combinedBillData}
        isLoading={isBillsLoading}
        isError={isBillsError}
        activeBillTab={activeBillTab}
        onBillTabChange={handleBillTabChange}
      />

      {/* =================== MODALS =================== */}

      <CustomerFormModal
        open={isCreateModalOpen || !!editingCustomerId}
        onClose={() => { setCreateModalOpen(false); setEditingCustomerId(null); }}
        onSubmit={editingCustomerId ? handleUpdateSubmit : handleCreateSubmit}
        customer={isFetchingCustomer ? null : editingCustomer}
        isLoading={isFetchingCustomer || isUpdating || isCreating}
        lookupData={{ kebeles, branches, customerTypes, meterSizes }}
        ketenaFetcher={getKetenasByKebeleCached}
        readerFetcher={getReadersByBranchCached}
      />

      <CustomerStatusModal
        open={statusModalOpen}
        mode={statusModalMode}
        onClose={() => { setStatusModalOpen(false); setStatusCustomerId(null); setStatusModalMode(null); }}
        onConfirm={handleStatusConfirm}
      />

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

      {/* Complete Delete Confirmation (MUI Dialog replacing window.confirm) */}
      <Dialog
        open={completeDeleteDialogOpen}
        onClose={() => { setCompleteDeleteDialogOpen(false); setCompleteDeleteCustomerId(null); }}
      >
        <DialogTitle>Confirm Complete Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to completely delete this customer? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCompleteDeleteDialogOpen(false); setCompleteDeleteCustomerId(null); }}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={isCompleteDeleting}
            onClick={async () => {
              if (completeDeleteCustomerId) {
                await completeDeleteCustomer(completeDeleteCustomerId);
              }
              setCompleteDeleteDialogOpen(false);
              setCompleteDeleteCustomerId(null);
            }}
          >
            {isCompleteDeleting ? "Deleting..." : "Complete Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Actions Dialogs */}
      <BulkActionsDialogs
        assignDialogOpen={assignDialogOpen}
        onAssignClose={() => setAssignDialogOpen(false)}
        onAssignConfirm={handleConfirmAssignReader}
        assignReaderId={assignReaderId}
        onAssignReaderIdChange={setAssignReaderId}
        readers={readers}
        isReadersLoading={isReadersLoading}
        selectedBranchId={selectedBranchId}
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

      {/* Import/Update Dialogs */}
      <ImportDialogs
        confirmImportOpen={confirmImportOpen}
        onCancelImport={handleCancelImport}
        onConfirmImport={handleConfirmImport}
        selectedFile={selectedFile}
        importDialogOpen={importDialogOpen}
        onCloseImportDialog={handleCloseImportDialog}
        importResult={importResult}
        confirmUpdateOpen={confirmUpdateOpen}
        onCancelUpdate={handleCancelUpdate}
        onConfirmUpdate={handleConfirmUpdate}
        selectedUpdateFile={selectedUpdateFile}
        updateDialogOpen={updateDialogOpen}
        onCloseUpdateDialog={handleCloseUpdateDialog}
        updateResult={updateResult}
        updateReaderModalOpen={updateReaderModalOpen}
        onUpdateReaderClose={handleUpdateReaderModalClose}
        branches={branches}
        isBranchesLoading={isBranchesLoading}
        updateReaderBranchId={updateReaderBranchId}
        onUpdateReaderBranchIdChange={(val) => { setUpdateReaderBranchId(val); setUpdateReaderReaderId(""); }}
        updateReaderReaderId={updateReaderReaderId}
        onUpdateReaderReaderIdChange={setUpdateReaderReaderId}
        updateReaderReaders={updateReaderReaders}
        isUpdateReaderReadersLoading={isUpdateReaderReadersLoading}
        updateReaderFile={updateReaderFile}
        onUpdateReaderFileChange={(file) => { setUpdateReaderFile(file); setUpdateReaderMatchedCustomers([]); setUpdateReaderNotFound([]); }}
        onUpdateReaderFileClear={() => { setUpdateReaderFile(null); setUpdateReaderMatchedCustomers([]); setUpdateReaderNotFound([]); }}
        updateReaderMatchedCustomers={updateReaderMatchedCustomers}
        updateReaderNotFound={updateReaderNotFound}
        updateReaderProcessing={updateReaderProcessing}
        updateReaderSaving={updateReaderSaving}
        onProcessReaderExcel={handleProcessReaderExcel}
        onSaveUpdateReader={handleSaveUpdateReader}
        updateGpsModalOpen={updateGpsModalOpen}
        onUpdateGpsClose={handleUpdateGpsModalClose}
        updateGpsFile={updateGpsFile}
        onUpdateGpsFileChange={(file) => { setUpdateGpsFile(file); setUpdateGpsMatchedCustomers([]); setUpdateGpsNotFound([]); }}
        onUpdateGpsFileClear={() => { setUpdateGpsFile(null); setUpdateGpsMatchedCustomers([]); setUpdateGpsNotFound([]); }}
        updateGpsMatchedCustomers={updateGpsMatchedCustomers}
        updateGpsNotFound={updateGpsNotFound}
        updateGpsProcessing={updateGpsProcessing}
        updateGpsSaving={updateGpsSaving}
        onProcessGpsJson={handleProcessGpsJson}
        onSaveUpdateGps={handleSaveUpdateGps}
        deactivatingCustomerId={deactivatingCustomerId}
        onCancelDeactivation={() => setDeactivatingCustomerId(null)}
        onConfirmDeactivation={async () => {
          await deactivateCustomer(deactivatingCustomerId);
          setDeactivatingCustomerId(null);
        }}
        isDeactivating={isDeactivating}
      />

      {/* Snackbar */}
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
