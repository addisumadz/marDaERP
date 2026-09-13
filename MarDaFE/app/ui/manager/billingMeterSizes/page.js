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
import { BillingMeterSizeService } from "../../../lib/billingMeterSizeService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewMeterSizeModal from "./ViewMeterSizeModal";
import MeterSizeFormModal from "./MeterSizeFormModal";
import MeterSizeStatusModal from "./MeterSizeStatusModal";

const meterSizeService = new BillingMeterSizeService();

const MeterSizesList = () => {
  const queryClient = useQueryClient();
  const [viewedMeterSizeId, setViewedMeterSizeId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedMeterSizeId, setSelectedMeterSizeId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // Start with active tab

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingMeterSizeId, setEditingMeterSizeId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusMeterSizeId, setStatusMeterSizeId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedMeterSizeId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all meter sizes once, then client-filter + paginate
  const {
    data: allMeterSizes = [],
    isError: isMeterSizesError,
    isFetching,
    isLoading: isMeterSizesLoading,
    refetch: refetchMeterSizesAll,
  } = useQuery({
    queryKey: ["meter-sizes-all"],
    queryFn: () => meterSizeService.getAllMeterSizes(),
    refetchOnWindowFocus: false,
  });

  // Fetch meter size details for viewing
  const {
    data: viewedMeterSize,
    isLoading: isMeterSizeDetailsFetching,
  } = useQuery({
    queryKey: ["meter-size-details", viewedMeterSizeId],
    queryFn: () => meterSizeService.getMeterSizeById(viewedMeterSizeId),
    enabled: !!viewedMeterSizeId,
    refetchOnWindowFocus: false,
  });

  // Fetch meter size details for editing
  const {
    data: editingMeterSize,
    isLoading: isEditingMeterSizeFetching,
  } = useQuery({
    queryKey: ["meter-size-details", editingMeterSizeId],
    queryFn: () => meterSizeService.getMeterSizeById(editingMeterSizeId),
    enabled: !!editingMeterSizeId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab
  const filteredMeterSizes = useMemo(() => {
    if (!allMeterSizes) return [];
    
    let filtered = allMeterSizes;
    
    // Filter by tab (deleted field) - using "active"/"deleted" values
    if (activeTab === 0) {
      filtered = filtered.filter(size => size.deleted === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(size => size.deleted === "deleted");
    }
    
    return filtered;
  }, [allMeterSizes, activeTab]);

  // CREATE MeterSize
  const { mutateAsync: createMeterSize, isLoading: isCreating } = useMutation({
    mutationFn: meterSizeService.createMeterSize,
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-sizes-all"]);
      toast.success("Meter Size created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE MeterSize
  const { mutateAsync: updateMeterSize, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => meterSizeService.updateMeterSize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-sizes-all"]);
      toast.success("Meter Size updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE MeterSize
  const { mutateAsync: deactivateMeterSize, isLoading: isDeactivating } =
    useMutation({
      mutationFn: meterSizeService.deactivateMeterSize,
      onSuccess: () => {
        queryClient.invalidateQueries(["meter-sizes-all"]);
        toast.success("Meter Size deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE MeterSize
  const { mutateAsync: activateMeterSize, isLoading: isActivating } = useMutation({
    mutationFn: meterSizeService.activateMeterSize,
    onSuccess: () => {
      queryClient.invalidateQueries(["meter-sizes-all"]);
      toast.success("Meter Size activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createMeterSize(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingMeterSizeId) return;
    await updateMeterSize({ id: editingMeterSizeId, data });
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
        accessorKey: "meterCode",
        header: "Meter Code",
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
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredMeterSizes,
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
      isLoading: isMeterSizesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isMeterSizesError,
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
        <Tooltip title="View Meter Size Details">
          <IconButton onClick={() => setViewedMeterSizeId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Meter Size">
          <IconButton onClick={() => setEditingMeterSizeId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.deleted === "active" ? (
          <Tooltip title="Deactivate Meter Size">
            <IconButton
              color="error"
              onClick={() => {
                setStatusMeterSizeId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Meter Size">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusMeterSizeId(row.original.id);
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
              setEditingMeterSizeId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchMeterSizesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isMeterSizesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusMeterSizeId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateMeterSize({
          id: statusMeterSizeId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateMeterSize(statusMeterSizeId);
      }
      setStatusModalOpen(false);
      setStatusMeterSizeId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Meter Sizes List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="meter sizes status tabs"
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
      <ViewMeterSizeModal
        meterSize={viewedMeterSize}
        open={!!viewedMeterSizeId}
        onClose={() => setViewedMeterSizeId(null)}
        isLoading={isMeterSizeDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <MeterSizeFormModal
        open={isCreateModalOpen || !!editingMeterSizeId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingMeterSizeId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        meterSize={editingMeterSize}
        isLoading={isEditingMeterSizeFetching || isCreating || isUpdating}
      />

      {/* Status Modal */}
      <MeterSizeStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusMeterSizeId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        meterSizeId={statusMeterSizeId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const MeterSizesListPage = () => (
  <QueryClientProvider client={queryClient}>
    <MeterSizesList />
  </QueryClientProvider>
);

export default MeterSizesListPage;
