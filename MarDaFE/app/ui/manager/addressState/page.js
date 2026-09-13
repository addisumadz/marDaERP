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
import { AddressStateService } from "../../../lib/addressStateService";
import { AddressCountryService } from "../../../lib/addressCountryService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewAddressStateModal from "./ViewAddressStateModal";
import AddressStateFormModal from "./AddressStateFormModal";
import AddressStateStatusModal from "./AddressStateStatusModal";

const addressStateService = new AddressStateService();
const addressCountryService = new AddressCountryService();

const AddressStateList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressStateId, setViewedAddressStateId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressStateId, setSelectedAddressStateId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressStateId, setEditingAddressStateId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressStateId, setStatusAddressStateId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressStateId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all address states once, then client-filter + paginate
  const {
    data: allAddressStates = [],
    isError: isAddressStatesError,
    isFetching,
    isLoading: isAddressStatesLoading,
    refetch: refetchAddressStatesAll,
  } = useQuery({
    queryKey: ["address-states-all"],
    queryFn: () => addressStateService.getAllAddressStates(),
    refetchOnWindowFocus: false,
  });

  // Fetch all countries for dropdown
  const {
    data: allCountries = [],
    isLoading: isCountriesLoading,
  } = useQuery({
    queryKey: ["address-countries-all"],
    queryFn: () => addressCountryService.getAllAddressCountries(),
    refetchOnWindowFocus: false,
  });

  // Fetch address state details for viewing
  const {
    data: viewedAddressState,
    isLoading: isAddressStateDetailsFetching,
  } = useQuery({
    queryKey: ["address-state-details", viewedAddressStateId],
    queryFn: () => addressStateService.getAddressStateById(viewedAddressStateId),
    enabled: !!viewedAddressStateId,
    refetchOnWindowFocus: false,
  });

  // Fetch address state details for editing
  const {
    data: editingAddressState,
    isLoading: isEditingAddressStateFetching,
  } = useQuery({
    queryKey: ["address-state-details", editingAddressStateId],
    queryFn: () => addressStateService.getAddressStateById(editingAddressStateId),
    enabled: !!editingAddressStateId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredAddressStates = useMemo(() => {
    if (!allAddressStates) return [];
    
    let filtered = allAddressStates;
    
    // Filter by tab (status)
    if (activeTab === 0) {
      filtered = filtered.filter(state => state.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(state => state.status === "deleted");
    }
    
    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter(state => state.countryId === parseInt(selectedCountry));
    }
    
    return filtered;
  }, [allAddressStates, activeTab, selectedCountry]);

  // CREATE AddressState
  const { mutateAsync: createAddressState, isLoading: isCreating } = useMutation({
    mutationFn: addressStateService.createAddressState,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-states-all"]);
      toast.success("Address State created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressState
  const { mutateAsync: updateAddressState, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressStateService.updateAddressState(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-states-all"]);
      toast.success("Address State updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressState
  const { mutateAsync: deactivateAddressState, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressStateService.deactivateAddressState,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-states-all"]);
        toast.success("Address State deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressState
  const { mutateAsync: activateAddressState, isLoading: isActivating } = useMutation({
    mutationFn: addressStateService.activateAddressState,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-states-all"]);
      toast.success("Address State activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createAddressState(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressStateId) return;
    await updateAddressState({ id: editingAddressStateId, data });
  };

  // Get unique countries for filter
  const uniqueCountries = useMemo(() => {
    if (!allCountries) return [];
    return allCountries.filter(country => country.status === "active");
  }, [allCountries]);

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
        accessorKey: "stateCode",
        header: "State Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "stateName",
        header: "State Name",
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
    data: filteredAddressStates,
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
      isLoading: isAddressStatesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressStatesError,
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
        <Tooltip title="View Address State Details">
          <IconButton onClick={() => setViewedAddressStateId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address State">
          <IconButton onClick={() => setEditingAddressStateId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Address State">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressStateId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address State">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressStateId(row.original.id);
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
              setEditingAddressStateId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressStatesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressStatesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressStateId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressState({
          id: statusAddressStateId,
          data: payload.data || {},
        });
      } else if (payload.status === "active") {
        await activateAddressState(statusAddressStateId);
      }
      setStatusModalOpen(false);
      setStatusAddressStateId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address State List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address state status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Country Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Country</InputLabel>
                <Select
                  value={selectedCountry}
                  label="Country"
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Countries</em>
                  </MenuItem>
                  {uniqueCountries.map((country) => (
                    <MenuItem key={country.id} value={country.id}>
                      {country.countryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedCountry) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedCountry("");
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
      <ViewAddressStateModal
        addressState={viewedAddressState}
        open={!!viewedAddressStateId}
        onClose={() => setViewedAddressStateId(null)}
        isLoading={isAddressStateDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressStateFormModal
        open={isCreateModalOpen || !!editingAddressStateId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressStateId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        addressState={editingAddressState}
        isLoading={isEditingAddressStateFetching || isCreating || isUpdating}
        countries={uniqueCountries}
      />

      {/* Status Modal */}
      <AddressStateStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressStateId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressStateId={statusAddressStateId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressStateListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressStateList />
  </QueryClientProvider>
);

export default AddressStateListPage;