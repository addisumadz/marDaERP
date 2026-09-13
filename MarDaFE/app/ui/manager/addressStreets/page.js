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
import { AddressStreetsService } from "../../../lib/addressStreetsService";
import { AddressCityService } from "../../../lib/addressCityService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewAddressStreetModal from "./ViewAddressStreetModal";
import AddressStreetFormModal from "./AddressStreetFormModal";
import AddressStreetStatusModal from "./AddressStreetStatusModal";

const addressStreetsService = new AddressStreetsService();
const addressCityService = new AddressCityService();

const AddressStreetsList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressStreetId, setViewedAddressStreetId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressStreetId, setSelectedAddressStreetId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressStreetId, setEditingAddressStreetId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressStreetId, setStatusAddressStreetId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressStreetId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all address streets once, then client-filter + paginate
  const {
    data: allAddressStreets = [],
    isError: isAddressStreetsError,
    isFetching,
    isLoading: isAddressStreetsLoading,
    refetch: refetchAddressStreetsAll,
  } = useQuery({
    queryKey: ["address-streets-all"],
    queryFn: () => addressStreetsService.getAllAddressStreets(),
    refetchOnWindowFocus: false,
  });

  // Fetch all cities for dropdown
  const {
    data: allCities = [],
    isLoading: isCitiesLoading,
  } = useQuery({
    queryKey: ["address-cities-all"],
    queryFn: () => addressCityService.getAllAddressCities(),
    refetchOnWindowFocus: false,
  });

  // Fetch address street details for viewing
  const {
    data: viewedAddressStreet,
    isLoading: isAddressStreetDetailsFetching,
  } = useQuery({
    queryKey: ["address-street-details", viewedAddressStreetId],
    queryFn: () => addressStreetsService.getAddressStreetById(viewedAddressStreetId),
    enabled: !!viewedAddressStreetId,
    refetchOnWindowFocus: false,
  });

  // Fetch address street details for editing
  const {
    data: editingAddressStreet,
    isLoading: isEditingAddressStreetFetching,
  } = useQuery({
    queryKey: ["address-street-details", editingAddressStreetId],
    queryFn: () => addressStreetsService.getAddressStreetById(editingAddressStreetId),
    enabled: !!editingAddressStreetId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredAddressStreets = useMemo(() => {
    if (!allAddressStreets) return [];
    
    let filtered = allAddressStreets;
    
    // Filter by tab (status)
    if (activeTab === 0) {
      filtered = filtered.filter(street => street.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(street => street.status === "deleted");
    }
    
    // Filter by city
    if (selectedCity) {
      filtered = filtered.filter(street => street.cityId === parseInt(selectedCity));
    }
    
    return filtered;
  }, [allAddressStreets, activeTab, selectedCity]);

  // Get unique cities for filter
  const uniqueCities = useMemo(() => {
    if (!allCities) return [];
    return allCities.filter(city => city.status === "active");
  }, [allCities]);

  // CREATE AddressStreet
  const { mutateAsync: createAddressStreet, isLoading: isCreating } = useMutation({
    mutationFn: addressStreetsService.createAddressStreet,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-streets-all"]);
      toast.success("Address Kebele created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressStreet
  const { mutateAsync: updateAddressStreet, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressStreetsService.updateAddressStreet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-streets-all"]);
      toast.success("Address Kebele updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressStreet
  const { mutateAsync: deactivateAddressStreet, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressStreetsService.deactivateAddressStreet,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-streets-all"]);
        toast.success("Address Kebele deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressStreet
  const { mutateAsync: activateAddressStreet, isLoading: isActivating } = useMutation({
    mutationFn: addressStreetsService.activateAddressStreet,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-streets-all"]);
      toast.success("Address Kebele activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createAddressStreet(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressStreetId) return;
    await updateAddressStreet({ id: editingAddressStreetId, data });
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
        accessorKey: "streetsCode",
        header: "Kebele Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "streetsName",
        header: "Kebele Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "addressStreetsNumber",
        header: "Kebele Number",
        Cell: ({ cell }) => cell.getValue() || "-",
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
      {
        accessorKey: "populationSize",
        header: "Population",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString() || "-",
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
    data: filteredAddressStreets,
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
      isLoading: isAddressStreetsLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressStreetsError,
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
        <Tooltip title="View Address Kebele Details">
          <IconButton onClick={() => setViewedAddressStreetId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address Kebele">
          <IconButton onClick={() => setEditingAddressStreetId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Address Kebele">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressStreetId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address Kebele">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressStreetId(row.original.id);
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
              setEditingAddressStreetId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressStreetsAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressStreetsError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressStreetId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressStreet({
          id: statusAddressStreetId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateAddressStreet(statusAddressStreetId);
      }
      setStatusModalOpen(false);
      setStatusAddressStreetId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address Kebele List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address kebele status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* City Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>City</InputLabel>
                <Select
                  value={selectedCity}
                  label="City"
                  onChange={(e) => setSelectedCity(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Cities</em>
                  </MenuItem>
                  {uniqueCities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.cityName} ({city.zoneName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedCity) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedCity("");
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
      <ViewAddressStreetModal
        addressStreet={viewedAddressStreet}
        open={!!viewedAddressStreetId}
        onClose={() => setViewedAddressStreetId(null)}
        isLoading={isAddressStreetDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressStreetFormModal
        open={isCreateModalOpen || !!editingAddressStreetId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressStreetId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        addressStreet={editingAddressStreet}
        isLoading={isEditingAddressStreetFetching || isCreating || isUpdating}
        cities={uniqueCities}
      />

      {/* Status Modal */}
      <AddressStreetStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressStreetId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressStreetId={statusAddressStreetId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressStreetsListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressStreetsList />
  </QueryClientProvider>
);

export default AddressStreetsListPage;