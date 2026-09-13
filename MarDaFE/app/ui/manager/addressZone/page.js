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
import { AddressZoneService } from "../../../lib/addressZoneService";
import { AddressStateService } from "../../../lib/addressStateService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewAddressZoneModal from "./ViewAddressZoneModal";
import AddressZoneFormModal from "./AddressZoneFormModal";
import AddressZoneStatusModal from "./AddressZoneStatusModal";

const addressZoneService = new AddressZoneService();
const addressStateService = new AddressStateService();

const AddressZoneList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressZoneId, setViewedAddressZoneId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressZoneId, setSelectedAddressZoneId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedState, setSelectedState] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressZoneId, setEditingAddressZoneId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressZoneId, setStatusAddressZoneId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressZoneId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all address zones once, then client-filter + paginate
  const {
    data: allAddressZones = [],
    isError: isAddressZonesError,
    isFetching,
    isLoading: isAddressZonesLoading,
    refetch: refetchAddressZonesAll,
  } = useQuery({
    queryKey: ["address-zones-all"],
    queryFn: () => addressZoneService.getAllAddressZones(),
    refetchOnWindowFocus: false,
  });

  // Fetch all states for dropdown
  const {
    data: allStates = [],
    isLoading: isStatesLoading,
  } = useQuery({
    queryKey: ["address-states-all"],
    queryFn: () => addressStateService.getAllAddressStates(),
    refetchOnWindowFocus: false,
  });

  // Fetch address zone details for viewing
  const {
    data: viewedAddressZone,
    isLoading: isAddressZoneDetailsFetching,
  } = useQuery({
    queryKey: ["address-zone-details", viewedAddressZoneId],
    queryFn: () => addressZoneService.getAddressZoneById(viewedAddressZoneId),
    enabled: !!viewedAddressZoneId,
    refetchOnWindowFocus: false,
  });

  // Fetch address zone details for editing
  const {
    data: editingAddressZone,
    isLoading: isEditingAddressZoneFetching,
  } = useQuery({
    queryKey: ["address-zone-details", editingAddressZoneId],
    queryFn: () => addressZoneService.getAddressZoneById(editingAddressZoneId),
    enabled: !!editingAddressZoneId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredAddressZones = useMemo(() => {
    if (!allAddressZones) return [];
    
    let filtered = allAddressZones;
    
    // Filter by tab (status)
    if (activeTab === 0) {
      filtered = filtered.filter(zone => zone.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(zone => zone.status === "deleted");
    }
    
    // Filter by state
    if (selectedState) {
      filtered = filtered.filter(zone => zone.stateId === parseInt(selectedState));
    }
    
    return filtered;
  }, [allAddressZones, activeTab, selectedState]);

  // CREATE AddressZone
  const { mutateAsync: createAddressZone, isLoading: isCreating } = useMutation({
    mutationFn: addressZoneService.createAddressZone,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-zones-all"]);
      toast.success("Address Zone created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressZone
  const { mutateAsync: updateAddressZone, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressZoneService.updateAddressZone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-zones-all"]);
      toast.success("Address Zone updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressZone
  const { mutateAsync: deactivateAddressZone, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressZoneService.deactivateAddressZone,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-zones-all"]);
        toast.success("Address Zone deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressZone
  const { mutateAsync: activateAddressZone, isLoading: isActivating } = useMutation({
    mutationFn: addressZoneService.activateAddressZone,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-zones-all"]);
      toast.success("Address Zone activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createAddressZone(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressZoneId) return;
    await updateAddressZone({ id: editingAddressZoneId, data });
  };

  // Get unique states for filter
  const uniqueStates = useMemo(() => {
    if (!allStates) return [];
    return allStates.filter(state => state.status === "active");
  }, [allStates]);

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
        accessorKey: "zoneCode",
        header: "Zone Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "zoneName",
        header: "Zone Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "stateName",
        header: "State",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "countryName",
        header: "Country",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "registeredDate",
        header: "Registered Date",
        Cell: ({ cell }) => {
          const gc = cell.getValue();
          if (!gc) return "-";
          const gcc = new Date(gc);
          if (isNaN(gcc.getTime())) return "-";
          const ethiopianFormatedDateArray = ethiopianDate.toEthiopian(
            gcc.getFullYear(),
            gcc.getMonth() + 1,
            gcc.getDate()
          );
          return `${ethiopianFormatedDateArray[2]}/${ethiopianFormatedDateArray[1]}/${ethiopianFormatedDateArray[0]}`;
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredAddressZones,
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
      isLoading: isAddressZonesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressZonesError,
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
        <Tooltip title="View Address Zone Details">
          <IconButton onClick={() => setViewedAddressZoneId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address Zone">
          <IconButton onClick={() => setEditingAddressZoneId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Address Zone">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressZoneId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address Zone">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressZoneId(row.original.id);
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
              setEditingAddressZoneId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressZonesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressZonesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressZoneId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressZone({
          id: statusAddressZoneId,
          data: payload.data || {},
        });
      } else if (payload.status === "active") {
        await activateAddressZone(statusAddressZoneId);
      }
      setStatusModalOpen(false);
      setStatusAddressZoneId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address Zone List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address zone status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* State Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>State</InputLabel>
                <Select
                  value={selectedState}
                  label="State"
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All States</em>
                  </MenuItem>
                  {uniqueStates.map((state) => (
                    <MenuItem key={state.id} value={state.id}>
                      {state.stateName} ({state.countryName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedState) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedState("");
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
      <ViewAddressZoneModal
        addressZone={viewedAddressZone}
        open={!!viewedAddressZoneId}
        onClose={() => setViewedAddressZoneId(null)}
        isLoading={isAddressZoneDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressZoneFormModal
        open={isCreateModalOpen || !!editingAddressZoneId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressZoneId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        addressZone={editingAddressZone}
        isLoading={isEditingAddressZoneFetching || isCreating || isUpdating}
        states={uniqueStates}
      />

      {/* Status Modal */}
      <AddressZoneStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressZoneId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressZoneId={statusAddressZoneId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressZoneListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressZoneList />
  </QueryClientProvider>
);

export default AddressZoneListPage;