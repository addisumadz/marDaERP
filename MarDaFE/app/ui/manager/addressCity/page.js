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
import { AddressCityService } from "../../../lib/addressCityService";
import { AddressZoneService } from "../../../lib/addressZoneService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import { useEffect } from "react";

// Modal components
import ViewAddressCityModal from "./ViewAddressCityModal";
import AddressCityFormModal from "./AddressCityFormModal";
import AddressCityStatusModal from "./AddressCityStatusModal";

const addressCityService = new AddressCityService();
const addressZoneService = new AddressZoneService();

const AddressCityList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressCityId, setViewedAddressCityId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressCityId, setSelectedAddressCityId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedZone, setSelectedZone] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressCityId, setEditingAddressCityId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressCityId, setStatusAddressCityId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressCityId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });


  // Fetch all address cities once, then client-filter + paginate
  const {
    data: allAddressCities = [],
    isError: isAddressCitiesError,
    isFetching,
    isLoading: isAddressCitiesLoading,
    refetch: refetchAddressCitiesAll,
  } = useQuery({
    queryKey: ["address-cities-all"],
    queryFn: () => addressCityService.getAllAddressCities(),
    refetchOnWindowFocus: false,
  });

  // Fetch all zones for dropdown
  const {
    data: allZones = [],
    isLoading: isZonesLoading,
  } = useQuery({
    queryKey: ["address-zones-all"],
    queryFn: () => addressZoneService.getAllAddressZones(),
    refetchOnWindowFocus: false,
  });

  // Fetch address city details for viewing
  const {
    data: viewedAddressCity,
    isLoading: isAddressCityDetailsFetching,
  } = useQuery({
    queryKey: ["address-city-details", viewedAddressCityId],
    queryFn: () => addressCityService.getAddressCityById(viewedAddressCityId),
    enabled: !!viewedAddressCityId,
    refetchOnWindowFocus: false,
  });

  // Fetch address city details for editing
  const {
    data: editingAddressCity,
    isLoading: isEditingAddressCityFetching,
  } = useQuery({
    queryKey: ["address-city-details", editingAddressCityId],
    queryFn: () => addressCityService.getAddressCityById(editingAddressCityId),
    enabled: !!editingAddressCityId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredAddressCities = useMemo(() => {
    if (!allAddressCities) return [];
    
    let filtered = allAddressCities;
    
    // Filter by tab (status)
    if (activeTab === 0) {
      filtered = filtered.filter(city => city.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(city => city.status === "deleted");
    }
    
    // Filter by zone
    if (selectedZone) {
      filtered = filtered.filter(city => city.zoneId === parseInt(selectedZone));
    }
    
    return filtered;
  }, [allAddressCities, activeTab, selectedZone]);

  // Get unique zones for filter
  const uniqueZones = useMemo(() => {
    if (!allZones) return [];
    return allZones.filter(zone => zone.status === "active");
  }, [allZones]);

  // CREATE AddressCity
  const { mutateAsync: createAddressCity, isLoading: isCreating } = useMutation({
    mutationFn: addressCityService.createAddressCity,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-cities-all"]);
      toast.success("Address City created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressCity
  const { mutateAsync: updateAddressCity, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressCityService.updateAddressCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-cities-all"]);
      toast.success("Address City updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressCity
  const { mutateAsync: deactivateAddressCity, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressCityService.deactivateAddressCity,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-cities-all"]);
        toast.success("Address City deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressCity
  const { mutateAsync: activateAddressCity, isLoading: isActivating } = useMutation({
    mutationFn: addressCityService.activateAddressCity,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-cities-all"]);
      toast.success("Address City activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createAddressCity(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressCityId) return;
    await updateAddressCity({ id: editingAddressCityId, data });
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
        accessorKey: "cityCode",
        header: "City Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "cityName",
        header: "City Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "zoneName",
        header: "Zone",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "stateName",
        header: "State",
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
    data: filteredAddressCities,
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
      isLoading: isAddressCitiesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressCitiesError,
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
        <Tooltip title="View Address City Details">
          <IconButton onClick={() => setViewedAddressCityId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address City">
          <IconButton onClick={() => setEditingAddressCityId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Address City">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressCityId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address City">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressCityId(row.original.id);
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
              setEditingAddressCityId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressCitiesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressCitiesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });

  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressCityId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressCity({
          id: statusAddressCityId,
          remark: payload.remark || "",
        });
      } else if (payload.status === "active") {
        await activateAddressCity(statusAddressCityId);
      }
      setStatusModalOpen(false);
      setStatusAddressCityId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address City List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address city status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Zone Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Zone</InputLabel>
                <Select
                  value={selectedZone}
                  label="Zone"
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Zones</em>
                  </MenuItem>
                  {uniqueZones.map((zone) => (
                    <MenuItem key={zone.id} value={zone.id}>
                      {zone.zoneName} ({zone.stateName})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedZone) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedZone("");
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
      <ViewAddressCityModal
        addressCity={viewedAddressCity}
        open={!!viewedAddressCityId}
        onClose={() => setViewedAddressCityId(null)}
        isLoading={isAddressCityDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressCityFormModal
        open={isCreateModalOpen || !!editingAddressCityId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressCityId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        addressCity={editingAddressCity}
        isLoading={isEditingAddressCityFetching || isCreating || isUpdating}
        zones={uniqueZones}
      />

      {/* Status Modal */}
      <AddressCityStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressCityId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressCityId={statusAddressCityId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressCityListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressCityList />
  </QueryClientProvider>
);

export default AddressCityListPage;