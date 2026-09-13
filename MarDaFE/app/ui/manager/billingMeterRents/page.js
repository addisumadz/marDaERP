"use client";
import { useMemo, useState, useRef } from "react";
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
import { BillingMeterRentService } from "../../../lib/billingMeterRentService";
import { BillingCustomerTypeService } from "../../../lib/billingCustomerTypeService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewMeterRentModal from "./ViewMeterRentModal";
import MeterRentFormModal from "./MeterRentFormModal";
import MeterRentStatusModal from "./MeterRentStatusModal";

const meterRentService = new BillingMeterRentService();
const customerTypeService = new BillingCustomerTypeService();

const MeterRentsList = () => {
  const queryClient = useQueryClient();
  const [viewedMeterRentId, setViewedMeterRentId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedMeterRentId, setSelectedMeterRentId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Start with active tab
  const [selectedCustomerType, setSelectedCustomerType] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingMeterRentId, setEditingMeterRentId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusMeterRentId, setStatusMeterRentId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedMeterRentId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all meter rents once, then client-filter + paginate
  const {
    data: allMeterRents = [],
    isError: isMeterRentsError,
    isFetching,
    isLoading: isMeterRentsLoading,
    refetch: refetchMeterRentsAll,
  } = useQuery({
    queryKey: ["meter-rents-all"],
    queryFn: () => meterRentService.getAllMeterRents(),
    refetchOnWindowFocus: false,
  });

  // Fetch all customer types for dropdown
  const {
    data: allCustomerTypes = [],
    isLoading: isCustomerTypesLoading,
  } = useQuery({
    queryKey: ["customer-types-all"],
    queryFn: () => customerTypeService.getAllCustomerTypes(),
    refetchOnWindowFocus: false,
  });

  // Fetch meter rent details for viewing
  const {
    data: viewedMeterRent,
    isLoading: isMeterRentDetailsFetching,
  } = useQuery({
    queryKey: ["meter-rent-details", viewedMeterRentId],
    queryFn: () => meterRentService.getMeterRentById(viewedMeterRentId),
    enabled: !!viewedMeterRentId,
    refetchOnWindowFocus: false,
  });

  // Fetch meter rent details for editing
  const {
    data: editingMeterRent,
    isLoading: isEditingMeterRentFetching,
  } = useQuery({
    queryKey: ["meter-rent-details", editingMeterRentId],
    queryFn: () => meterRentService.getMeterRentById(editingMeterRentId),
    enabled: !!editingMeterRentId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredMeterRents = useMemo(() => {
    if (!allMeterRents) return [];
    
    let filtered = allMeterRents;
    
    // Filter by tab (status) - using "active"/"deleted" values
    if (activeTab === 0) {
      filtered = filtered.filter(rent => rent.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(rent => rent.status === "deleted");
    }
    
    // Filter by customer type
    if (selectedCustomerType) {
      filtered = filtered.filter(rent => rent.billingCustomerTypeId === parseInt(selectedCustomerType));
    }
    
    return filtered;
  }, [allMeterRents, activeTab, selectedCustomerType]);

  // CREATE MeterRent
  const { mutateAsync: createMeterRent, isLoading: isCreating } = useMutation({
    mutationFn: meterRentService.createMeterRent,
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-rents-all"]);
      toast.success("Meter Rent created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE MeterRent
  const { mutateAsync: updateMeterRent, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => meterRentService.updateMeterRent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-rents-all"]);
      toast.success("Meter Rent updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE MeterRent
  const { mutateAsync: deactivateMeterRent, isLoading: isDeactivating } =
    useMutation({
      mutationFn: meterRentService.deactivateMeterRent,
      onSuccess: () => {
        queryClient.invalidateQueries(["meter-rents-all"]);
        toast.success("Meter Rent deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE MeterRent
  const { mutateAsync: activateMeterRent, isLoading: isActivating } = useMutation({
    mutationFn: meterRentService.activateMeterRent,
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-rents-all"]);
      toast.success("Meter Rent activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createMeterRent(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingMeterRentId) return;
    await updateMeterRent({ id: editingMeterRentId, data });
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
        accessorKey: "customerTypeName",
        header: "Customer Type",
        filterFn: amharicFuzzyFilter,
      },
    
      {
        accessorKey: "meterSize",
        header: "Meter Size",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return typeof value === 'number' ? value.toFixed(2) : value;
        },
      },
      {
        accessorKey: "rentBirr",
        header: "Rent (Birr)",
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
    data: filteredMeterRents,
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
      isLoading: isMeterRentsLoading,
      showProgressBars: isFetching,
      showAlertBanner: isMeterRentsError,
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
        <Tooltip title="View Meter Rent Details">
          <IconButton onClick={() => setViewedMeterRentId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Meter Rent">
          <IconButton onClick={() => setEditingMeterRentId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Meter Rent">
            <IconButton
              color="error"
              onClick={() => {
                setStatusMeterRentId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Meter Rent">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusMeterRentId(row.original.id);
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
              setEditingMeterRentId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchMeterRentsAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isMeterRentsError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusMeterRentId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateMeterRent({
          id: statusMeterRentId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateMeterRent(statusMeterRentId);
      }
      setStatusModalOpen(false);
      setStatusMeterRentId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Meter Rents List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="meter rents status tabs"
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
                  value={selectedCustomerType}
                  label="Customer Type"
                  onChange={(e) => setSelectedCustomerType(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Customer Types</em>
                  </MenuItem>
                  {allCustomerTypes
                    .filter(type => type.deleted === "active")
                    .map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.customerType}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedCustomerType) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedCustomerType("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      {/* View Modal */}
      <ViewMeterRentModal
        meterRent={viewedMeterRent}
        open={!!viewedMeterRentId}
        onClose={() => setViewedMeterRentId(null)}
        isLoading={isMeterRentDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <MeterRentFormModal
        open={isCreateModalOpen || !!editingMeterRentId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingMeterRentId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        meterRent={editingMeterRent}
        isLoading={isEditingMeterRentFetching || isCreating || isUpdating}
      />

      {/* Status Modal */}
      <MeterRentStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusMeterRentId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        meterRentId={statusMeterRentId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const MeterRentsListPage = () => (
  <QueryClientProvider client={queryClient}>
    <MeterRentsList />
  </QueryClientProvider>
);

export default MeterRentsListPage;
