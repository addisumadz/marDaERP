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
import addressKetenaService from "../../../lib/addressKetenaService";
import { AddressStreetsService } from "../../../lib/addressStreetsService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewAddressKetenaModal from "./ViewAddressKetenaModal";
import AddressKetenaFormModal from "./AddressKetenaFormModal";
import AddressKetenaStatusModal from "./AddressKetenaStatusModal";

const addressStreetsService = new AddressStreetsService();

const AddressKetenaList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressKetenaId, setViewedAddressKetenaId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressKetenaId, setSelectedAddressKetenaId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStreets, setSelectedStreets] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressKetenaId, setEditingAddressKetenaId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressKetenaId, setStatusAddressKetenaId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressKetenaId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debug authentication
  useEffect(() => {
    const debugAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem('user_token');
        console.log('Debug - Raw token from localStorage:', token);
        
        if (token) {
          try {
            const parsed = JSON.parse(token);
            console.log('Debug - Parsed token object:', parsed);
          } catch (e) {
            console.error('Debug - Error parsing token:', e);
          }
        } else {
          console.warn('Debug - No token found in localStorage');
        }
      }
    };
    
    debugAuth();
  }, []);

  // Fetch all address ketenas once, then client-filter + paginate
  const {
    data: allAddressKetenas = [],
    isError: isAddressKetenasError,
    isFetching,
    isLoading: isAddressKetenasLoading,
    refetch: refetchAddressKetenasAll,
    error: addressKetenasError,
  } = useQuery({
    queryKey: ["address-ketenas-all"],
    queryFn: () => addressKetenaService.getAllAddressKetenas(),
    refetchOnWindowFocus: false,
    retry: false, // Don't retry on auth errors
  });

  // Fetch all streets for dropdown
  const {
    data: allStreets = [],
    isLoading: isStreetsLoading,
  } = useQuery({
    queryKey: ["address-streets-all"],
    queryFn: () => addressStreetsService.getAllAddressStreets(),
    refetchOnWindowFocus: false,
  });

  // Fetch address ketena details for viewing
  const {
    data: viewedAddressKetena,
    isLoading: isAddressKetenaDetailsFetching,
  } = useQuery({
    queryKey: ["address-ketena-details", viewedAddressKetenaId],
    queryFn: () => addressKetenaService.getAddressKetenaById(viewedAddressKetenaId),
    enabled: !!viewedAddressKetenaId,
    refetchOnWindowFocus: false,
  });

  // Fetch address ketena details for editing
  const {
    data: editingAddressKetena,
    isLoading: isEditingAddressKetenaFetching,
  } = useQuery({
    queryKey: ["address-ketena-details", editingAddressKetenaId],
    queryFn: () => addressKetenaService.getAddressKetenaById(editingAddressKetenaId),
    enabled: !!editingAddressKetenaId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredAddressKetenas = useMemo(() => {
    if (!allAddressKetenas) return [];
    
    let filtered = allAddressKetenas;
    
    // Filter by tab (deleted field)
    if (activeTab === 0) {
      filtered = filtered.filter(ketena => ketena.deleted === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(ketena => ketena.deleted === "deleted");
    }
    
    // Filter by streets
    if (selectedStreets) {
      filtered = filtered.filter(ketena => ketena.streetsId === parseInt(selectedStreets));
    }
    
    return filtered;
  }, [allAddressKetenas, activeTab, selectedStreets]);

  // Get unique streets for filter
  const uniqueStreets = useMemo(() => {
    if (!allStreets) return [];
    return allStreets.filter(street => street.deleted === "active");
  }, [allStreets]);

  // CREATE AddressKetena
  const { mutateAsync: createAddressKetena, isLoading: isCreating } = useMutation({
    mutationFn: addressKetenaService.createAddressKetena,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-ketenas-all"]);
      toast.success("Address Ketena created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressKetena
  const { mutateAsync: updateAddressKetena, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressKetenaService.updateAddressKetena(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-ketenas-all"]);
      toast.success("Address Ketena updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressKetena
  const { mutateAsync: deactivateAddressKetena, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressKetenaService.deactivateAddressKetena,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-ketenas-all"]);
        toast.success("Address Ketena deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressKetena
  const { mutateAsync: activateAddressKetena, isLoading: isActivating } = useMutation({
    mutationFn: addressKetenaService.activateAddressKetena,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-ketenas-all"]);
      toast.success("Address Ketena activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createAddressKetena(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressKetenaId) return;
    await updateAddressKetena({ id: editingAddressKetenaId, data });
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
        accessorKey: "ketenaCode",
        header: "Ketena Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "ketenaName",
        header: "Ketena Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "populationSize",
        header: "Population",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString() || "-",
      },
      {
        accessorKey: "streetsName",
        header: "Kebele",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "cityName",
        header: "City",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "zoneName",
        header: "Zone",
        filterFn: amharicFuzzyFilter,
      },
    ],
    [amharicFuzzyFilter]
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredAddressKetenas,
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
      isLoading: isAddressKetenasLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressKetenasError,
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
        <Tooltip title="View Address Ketena Details">
          <IconButton onClick={() => setViewedAddressKetenaId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address Ketena">
          <IconButton onClick={() => setEditingAddressKetenaId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.deleted === "active" ? (
          <Tooltip title="Deactivate Address Ketena">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressKetenaId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address Ketena">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressKetenaId(row.original.id);
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
              setEditingAddressKetenaId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressKetenasAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressKetenasError
      ? { 
          color: "error", 
          children: addressKetenasError?.response?.status === 401 
            ? "Authentication failed. Please log in again." 
            : `Error loading data: ${addressKetenasError?.message || 'Unknown error'}`
        }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressKetenaId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressKetena({
          id: statusAddressKetenaId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateAddressKetena(statusAddressKetenaId);
      }
      setStatusModalOpen(false);
      setStatusAddressKetenaId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address Ketena List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address ketena status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Streets Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Kebele</InputLabel>
                <Select
                  value={selectedStreets}
                  label="Kebele"
                  onChange={(e) => setSelectedStreets(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Kebeles</em>
                  </MenuItem>
                  {uniqueStreets.map((street) => (
                    <MenuItem key={street.id} value={street.id}>
                      {street.streetsName} ({street.cityName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedStreets) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedStreets("");
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
      <ViewAddressKetenaModal
        addressKetena={viewedAddressKetena}
        open={!!viewedAddressKetenaId}
        onClose={() => setViewedAddressKetenaId(null)}
        isLoading={isAddressKetenaDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressKetenaFormModal
        open={isCreateModalOpen || !!editingAddressKetenaId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressKetenaId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        addressKetena={editingAddressKetena}
        isLoading={isEditingAddressKetenaFetching || isCreating || isUpdating}
        streets={uniqueStreets}
      />

      {/* Status Modal */}
      <AddressKetenaStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressKetenaId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressKetenaId={statusAddressKetenaId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressKetenaListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressKetenaList />
  </QueryClientProvider>
);

export default AddressKetenaListPage;