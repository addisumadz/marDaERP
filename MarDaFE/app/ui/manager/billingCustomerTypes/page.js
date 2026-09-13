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
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BillingCustomerTypeService } from "../../../lib/billingCustomerTypeService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewCustomerTypeModal from "./ViewCustomerTypeModal";
import CustomerTypeFormModal from "./CustomerTypeFormModal";
import CustomerTypeStatusModal from "./CustomerTypeStatusModal";

const customerTypeService = new BillingCustomerTypeService();

const CustomerTypesList = () => {
  const queryClient = useQueryClient();
  const [viewedCustomerTypeId, setViewedCustomerTypeId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Start with active tab

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingCustomerTypeId, setEditingCustomerTypeId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusCustomerTypeId, setStatusCustomerTypeId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedCustomerTypeId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all customer types once, then client-filter + paginate
  const {
    data: allCustomerTypes = [],
    isError: isCustomerTypesError,
    isFetching,
    isLoading: isCustomerTypesLoading,
    refetch: refetchCustomerTypesAll,
  } = useQuery({
    queryKey: ["customer-types-all"],
    queryFn: () => customerTypeService.getAllCustomerTypes(),
    refetchOnWindowFocus: false,
  });

  // Fetch customer type details for viewing
  const {
    data: viewedCustomerType,
    isLoading: isCustomerTypeDetailsFetching,
  } = useQuery({
    queryKey: ["customer-type-details", viewedCustomerTypeId],
    queryFn: () => customerTypeService.getCustomerTypeById(viewedCustomerTypeId),
    enabled: !!viewedCustomerTypeId,
    refetchOnWindowFocus: false,
  });

  // Fetch customer type details for editing
  const {
    data: editingCustomerType,
    isLoading: isEditingCustomerTypeFetching,
  } = useQuery({
    queryKey: ["customer-type-details", editingCustomerTypeId],
    queryFn: () => customerTypeService.getCustomerTypeById(editingCustomerTypeId),
    enabled: !!editingCustomerTypeId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab
  const filteredCustomerTypes = useMemo(() => {
    if (!allCustomerTypes) return [];
    
    let filtered = allCustomerTypes;
    
    // Filter by tab (status) - using "active"/"deleted" values
    if (activeTab === 0) {
      filtered = filtered.filter(type => type.deleted === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(type => type.deleted === "deleted");
    }
    
    return filtered;
  }, [allCustomerTypes, activeTab]);

  // CREATE CustomerType
  const { mutateAsync: createCustomerType, isLoading: isCreating } = useMutation({
    mutationFn: customerTypeService.createCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-types-all"]);
      toast.success("Customer Type created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE CustomerType
  const { mutateAsync: updateCustomerType, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => customerTypeService.updateCustomerType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-types-all"]);
      toast.success("Customer Type updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE CustomerType
  const { mutateAsync: deactivateCustomerType, isLoading: isDeactivating } =
    useMutation({
      mutationFn: customerTypeService.deactivateCustomerType,
      onSuccess: () => {
        queryClient.invalidateQueries(["customer-types-all"]);
        toast.success("Customer Type deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE CustomerType
  const { mutateAsync: activateCustomerType, isLoading: isActivating } = useMutation({
    mutationFn: customerTypeService.activateCustomerType,
    onSuccess: () => {
      queryClient.invalidateQueries(["customer-types-all"]);
      toast.success("Customer Type activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createCustomerType(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingCustomerTypeId) return;
    await updateCustomerType({ id: editingCustomerTypeId, data });
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
        accessorKey: "customerType",
        header: "Customer Type",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "description",
        header: "Description",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "techemariKfya",
        header: "Techemari Kfya",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return typeof value === 'number' ? value.toFixed(2) : value;
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredCustomerTypes,
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
      isLoading: isCustomerTypesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isCustomerTypesError,
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
        <Tooltip title="View Customer Type Details">
          <IconButton onClick={() => setViewedCustomerTypeId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Customer Type">
          <IconButton onClick={() => setEditingCustomerTypeId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.deleted === "active" ? (
          <Tooltip title="Deactivate Customer Type">
            <IconButton
              color="error"
              onClick={() => {
                setStatusCustomerTypeId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Customer Type">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusCustomerTypeId(row.original.id);
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingCustomerTypeId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchCustomerTypesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isCustomerTypesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusCustomerTypeId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateCustomerType({
          id: statusCustomerTypeId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateCustomerType(statusCustomerTypeId);
      }
      setStatusModalOpen(false);
      setStatusCustomerTypeId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Customer Types List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="customer types status tabs"
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
      <ViewCustomerTypeModal
        customerType={viewedCustomerType}
        open={!!viewedCustomerTypeId}
        onClose={() => setViewedCustomerTypeId(null)}
        isLoading={isCustomerTypeDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <CustomerTypeFormModal
        open={isCreateModalOpen || !!editingCustomerTypeId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingCustomerTypeId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        customerType={editingCustomerType}
        isLoading={isEditingCustomerTypeFetching || isCreating || isUpdating}
      />

      {/* Status Modal */}
      <CustomerTypeStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusCustomerTypeId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        customerTypeId={statusCustomerTypeId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const CustomerTypesListPage = () => (
  <QueryClientProvider client={queryClient}>
    <CustomerTypesList />
  </QueryClientProvider>
);

export default CustomerTypesListPage;
