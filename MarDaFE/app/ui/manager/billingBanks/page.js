"use client";
import { useMemo, useState, useRef } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { 
  Box, 
  Button, 
  Grid, 
  Paper, 
  Typography, 
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
  Snackbar, 
  Alert 
} from "@mui/material";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BillingBanksService } from "../../../lib/billingBanksService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewBillingBankModal from "./ViewBillingBankModal";
import BillingBankFormModal from "./BillingBankFormModal";
import BillingBankStatusModal from "./BillingBankStatusModal";

import { usePathname } from "next/navigation";

const billingBanksService = new BillingBanksService();

const BillingBanksList = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Derive pageCode from the URL path (last segment of /ui/manager/xxx)
  const pageCode = useMemo(() => {
    if (!pathname) return "billingBanks";
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "billingBanks";
  }, [pathname]);

  // Page-level permissions (driven from backend user_records via PagePermissionService)
  const {
    data: pagePermissions,
    isLoading: isPermLoading,
    isError: isPermError,
  } = useQuery({
    queryKey: ["billing-banks-permissions", pageCode],
    queryFn: () => billingBanksService.getPagePermissions(pageCode),
    refetchOnWindowFocus: false,
  });

  const canCreate = !!pagePermissions?.canCreate;
  const canEdit = !!pagePermissions?.canEdit;
  const canDelete = !!pagePermissions?.canDelete;
  const canApprove = !!pagePermissions?.canApprove;
  const canManageAny = canCreate || canEdit || canDelete || canApprove;

  const queryClient = useQueryClient();
  const [viewedBillingBankId, setViewedBillingBankId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedBillingBankId, setSelectedBillingBankId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Start with deleted tab

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingBillingBankId, setEditingBillingBankId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusBillingBankId, setStatusBillingBankId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedBillingBankId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all billing banks once, then client-filter + paginate
  const {
    data: allBillingBanks = [],
    isError: isBillingBanksError,
    isFetching,
    isLoading: isBillingBanksLoading,
    refetch: refetchBillingBanksAll,
  } = useQuery({
    queryKey: ["billing-banks-all"],
    queryFn: () => billingBanksService.getAllBillingBanks(),
    refetchOnWindowFocus: false,
  });

  // Fetch billing bank details for viewing
  const {
    data: viewedBillingBank,
    isLoading: isBillingBankDetailsFetching,
  } = useQuery({
    queryKey: ["billing-bank-details", viewedBillingBankId],
    queryFn: () => billingBanksService.getBillingBankById(viewedBillingBankId),
    enabled: !!viewedBillingBankId,
    refetchOnWindowFocus: false,
  });

  // Fetch billing bank details for editing
  const {
    data: editingBillingBank,
    isLoading: isEditingBillingBankFetching,
  } = useQuery({
    queryKey: ["billing-bank-details", editingBillingBankId],
    queryFn: () => billingBanksService.getBillingBankById(editingBillingBankId),
    enabled: !!editingBillingBankId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab
  const filteredBillingBanks = useMemo(() => {
    if (!allBillingBanks) return [];
    
    let filtered = allBillingBanks;
    
    // Filter by tab (status) - using "active"/"deleted" values
    if (activeTab === 0) {
      filtered = filtered.filter(bank => bank.deleted === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(bank => bank.deleted === "deleted");
    }
    
    return filtered;
  }, [allBillingBanks, activeTab]);

  // CREATE BillingBank
  const { mutateAsync: createBillingBank, isLoading: isCreating } = useMutation({
    mutationFn: billingBanksService.createBillingBank,
    onSuccess: () => {
      queryClient.invalidateQueries(["billing-banks-all"]);
      toast.success("Billing Bank created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE BillingBank
  const { mutateAsync: updateBillingBank, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => billingBanksService.updateBillingBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["billing-banks-all"]);
      toast.success("Billing Bank updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE BillingBank
  const { mutateAsync: deactivateBillingBank, isLoading: isDeactivating } =
    useMutation({
      mutationFn: billingBanksService.deactivateBillingBank,
      onSuccess: () => {
        queryClient.invalidateQueries(["billing-banks-all"]);
        toast.success("Billing Bank deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE BillingBank
  const { mutateAsync: activateBillingBank, isLoading: isActivating } = useMutation({
    mutationFn: billingBanksService.activateBillingBank,
    onSuccess: () => {
      queryClient.invalidateQueries(["billing-banks-all"]);
      toast.success("Billing Bank activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createBillingBank(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingBillingBankId) return;
    await updateBillingBank({ id: editingBillingBankId, data });
  };

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
      {
        accessorKey: "gatewayCode",
        header: "Gateway Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "bankCode",
        header: "Bank Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "bankName",
        header: "Bank Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "bankColor",
        header: "Bank Color",
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 20, 
                height: 20, 
                backgroundColor: cell.getValue(), 
                border: '1px solid #ccc',
                borderRadius: '4px'
              }} 
            />
            {cell.getValue()}
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredBillingBanks,
    initialState: { 
      showColumnFilters: false, 
      showGlobalFilter: false,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    manualPagination: false,
    enableRowNumbers: true,
    rowNumberMode: 'original',
    state: {
      pagination,
      isLoading: isBillingBanksLoading,
      showProgressBars: isFetching,
      showAlertBanner: isBillingBanksError,
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
        <Tooltip title="View Billing Bank Details">
          <IconButton onClick={() => setViewedBillingBankId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        {canEdit && (
          <Tooltip title="Edit Billing Bank">
            <IconButton onClick={() => setEditingBillingBankId(row.original.id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {row.original.deleted === "active" && canDelete && (
          <Tooltip title="Deactivate Billing Bank">
            <IconButton
              color="error"
              onClick={() => {
                setStatusBillingBankId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        {row.original.deleted === "deleted" && canApprove && (
          <Tooltip title="Activate Billing Bank">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusBillingBankId(row.original.id);
                setStatusModalMode("activate");
                setStatusModalOpen(true);
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingBillingBankId(null);
                setCreateModalOpen(true);
              }}
            >
              Create
            </Button>
          )}
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchBillingBanksAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isBillingBanksError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusBillingBankId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateBillingBank({
          id: statusBillingBankId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateBillingBank(statusBillingBankId);
      }
      setStatusModalOpen(false);
      setStatusBillingBankId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Billing Banks List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="billing banks status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>

            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      {/* View Modal */}
      <ViewBillingBankModal
        billingBank={viewedBillingBank}
        open={!!viewedBillingBankId}
        onClose={() => setViewedBillingBankId(null)}
        isLoading={isBillingBankDetailsFetching}
      />

      {/* Create/Edit Modal */}
      {canManageAny && (
        <>
          {/* Create/Edit Modal */}
          <BillingBankFormModal
            open={isCreateModalOpen || !!editingBillingBankId}
            onClose={() => {
              setCreateModalOpen(false);
              setEditingBillingBankId(null);
            }}
            onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
            billingBank={editingBillingBank}
            isLoading={isEditingBillingBankFetching || isCreating || isUpdating}
          />

          {/* Status Modal */}
          <BillingBankStatusModal
            open={statusModalOpen}
            onClose={() => {
              setStatusModalOpen(false);
              setStatusBillingBankId(null);
              setStatusModalMode(null);
            }}
            onConfirm={handleStatusConfirm}
            mode={statusModalMode}
            billingBankId={statusBillingBankId}
          />
        </>
      )}

    </>
  );
};

const queryClient = new QueryClient();

const BillingBanksListPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillingBanksList />
  </QueryClientProvider>
);

export default BillingBanksListPage;
