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
import ViewAddressCountryModal from "./ViewAddressCountryModal";
import AddressCountryFormModal from "./AddressCountryFormModal";
import AddressCountryStatusModal from "./AddressCountryStatusModal";

const addressCountryService = new AddressCountryService();

const AddressCountryList = () => {
  const queryClient = useQueryClient();
  const [viewedAddressCountryId, setViewedAddressCountryId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedAddressCountryId, setSelectedAddressCountryId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedContinent, setSelectedContinent] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingAddressCountryId, setEditingAddressCountryId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusAddressCountryId, setStatusAddressCountryId] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset pagination when switching tabs to avoid empty page
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedAddressCountryId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch all address countries once, then client-filter + paginate
  const {
    data: allAddressCountries = [],
    isError: isAddressCountriesError,
    isFetching,
    isLoading: isAddressCountriesLoading,
    refetch: refetchAddressCountriesAll,
  } = useQuery({
    queryKey: ["address-countries-all"],
    queryFn: async () => {
      const data = await addressCountryService.getAllAddressCountries();
      return data;
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const activeAddressCountries = useMemo(
    () => {
      if (!allAddressCountries) return [];
      return allAddressCountries.filter((c) => c.status === "active");
    },
    [allAddressCountries]
  );

  const deletedAddressCountries = useMemo(
    () => {
      if (!allAddressCountries) return [];
      return allAddressCountries.filter((c) => c.status === "deleted");
    },
    [allAddressCountries]
  );
  
  // Calculate total row count based on active/deleted tab
  const totalRowCount = activeTab === 0 ? activeAddressCountries.length : deletedAddressCountries.length;

  // Filter by tab (active/deleted) and all selected filters
  const filteredAddressCountries = useMemo(() => {
    let result = activeTab === 0 ? [...activeAddressCountries] : [...deletedAddressCountries];
    
    // Apply filters only if they have a value
    if (selectedStatus) {
      result = result.filter(country => 
        country.status && String(country.status) === String(selectedStatus)
      );
    }

    if (selectedContinent) {
      result = result.filter(country => 
        country.continent && String(country.continent) === String(selectedContinent)
      );
    }

    return result;
  }, [
    activeAddressCountries, 
    deletedAddressCountries, 
    activeTab, 
    selectedStatus,
    selectedContinent
  ]);

  const paginatedData = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    const end = start + pagination.pageSize;
    return {
      content: filteredAddressCountries.slice(start, end),
      totalElements: filteredAddressCountries.length,
    };
  }, [filteredAddressCountries, pagination.pageIndex, pagination.pageSize]);

  const { data: viewedAddressCountry, isFetching: isAddressCountryDetailsFetching } =
    useQuery({
      queryKey: ["address-country-details", viewedAddressCountryId],
      queryFn: () => {
        if (!viewedAddressCountryId) return null;
        return addressCountryService.getAddressCountryById(viewedAddressCountryId);
      },
      enabled: !!viewedAddressCountryId,
    });

  const { data: editingAddressCountry, isLoading: isFetchingAddressCountry, isError } = useQuery({
    queryKey: ["address-country-details", editingAddressCountryId],
    queryFn: () => {
      if (!editingAddressCountryId) return null;
      return addressCountryService.getAddressCountryById(editingAddressCountryId);
    },
    enabled: !!editingAddressCountryId,
  });

  // === MUTATIONS for CRUD operations ===

  // CREATE AddressCountry
  const { mutateAsync: createAddressCountry, isLoading: isCreating } = useMutation({
    mutationFn: addressCountryService.createAddressCountry,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-countries-all"]);
      toast.success("Address Country created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // UPDATE AddressCountry
  const { mutateAsync: updateAddressCountry, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => addressCountryService.updateAddressCountry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["address-countries-all"]);
      toast.success("Address Country updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  // DEACTIVATE AddressCountry
  const { mutateAsync: deactivateAddressCountry, isLoading: isDeactivating } =
    useMutation({
      mutationFn: addressCountryService.deactivateAddressCountry,
      onSuccess: () => {
        queryClient.invalidateQueries(["address-countries-all"]);
        toast.success("Address Country deactivated successfully!");
      },
      onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
    });

  // ACTIVATE AddressCountry
  const { mutateAsync: activateAddressCountry, isLoading: isActivating } = useMutation({
    mutationFn: addressCountryService.activateAddressCountry,
    onSuccess: () => {
      queryClient.invalidateQueries(["address-countries-all"]);
      toast.success("Address Country activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });


  const handleCreateSubmit = async (data) => {
    await createAddressCountry(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingAddressCountryId) return;
    await updateAddressCountry({ id: editingAddressCountryId, data });
  };

  // Get unique continents for filter
  const uniqueContinents = useMemo(() => {
    if (!allAddressCountries) return [];
    const continents = [...new Set(allAddressCountries.map(c => c.continent).filter(Boolean))];
    return continents.sort();
  }, [allAddressCountries]);

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
        accessorKey: "countryCode",
        header: "Country Code",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "countryName",
        header: "Country Name",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "continent",
        header: "Continent",
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
    data: filteredAddressCountries,
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
      isLoading: isAddressCountriesLoading,
      showProgressBars: isFetching,
      showAlertBanner: isAddressCountriesError,
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
        <Tooltip title="View Address Country Details">
          <IconButton onClick={() => setViewedAddressCountryId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit Address Country">
          <IconButton onClick={() => setEditingAddressCountryId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate Address Country">
            <IconButton
              color="error"
              onClick={() => {
                setStatusAddressCountryId(row.original.id);
                setStatusModalMode("deactivate");
                setStatusModalOpen(true);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate Address Country">
            <IconButton
              color="primary"
              onClick={() => {
                setStatusAddressCountryId(row.original.id);
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
              setEditingAddressCountryId(null);
              setCreateModalOpen(true);
            }}
          >
            Create
          </Button>
        </Box>
        <Button
          variant="outlined"
          onClick={() => refetchAddressCountriesAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isAddressCountriesError
      ? { color: "error", children: "Error loading data" }
      : undefined,
  });



  // Handle Activate/Deactivate confirmation from modal
  const handleStatusConfirm = async (payload) => {
    if (!statusAddressCountryId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateAddressCountry({
          id: statusAddressCountryId,
          data: payload.data || {},
        });
      } else if (payload.status === "active") {
        await activateAddressCountry(statusAddressCountryId);
      }
      setStatusModalOpen(false);
      setStatusAddressCountryId(null);
      setStatusModalMode(null);
    } catch (e) {
      // toast handled in mutation onError
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Address Country List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="address country status tabs"
              >
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            
            {/* Filters Row */}
            <Box sx={{ mb: 2, display: "flex", flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* Continent Filter */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Continent</InputLabel>
                <Select
                  value={selectedContinent}
                  label="Continent"
                  onChange={(e) => setSelectedContinent(e.target.value)}
                >
                  <MenuItem value="">
                    <em>All Continents</em>
                  </MenuItem>
                  {uniqueContinents.map((continent) => (
                    <MenuItem key={continent} value={continent}>
                      {continent}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Clear All Filters Button */}
              {(selectedContinent) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedContinent("");
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
      <ViewAddressCountryModal
        addressCountry={viewedAddressCountry}
        open={!!viewedAddressCountryId}
        onClose={() => setViewedAddressCountryId(null)}
        isLoading={isAddressCountryDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <AddressCountryFormModal
        open={isCreateModalOpen || !!editingAddressCountryId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingAddressCountryId(null);
        }}
        onSubmit={editingAddressCountryId ? handleUpdateSubmit : handleCreateSubmit}
        addressCountry={editingAddressCountry}
        isLoading={isFetchingAddressCountry}
      />

      {/* Status Change Modal */}
      <AddressCountryStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusAddressCountryId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        addressCountryId={statusAddressCountryId}
      />

    </>
  );
};

const queryClient = new QueryClient();

const AddressCountryListPage = () => (
  <QueryClientProvider client={queryClient}>
    <AddressCountryList />
  </QueryClientProvider>
);

export default AddressCountryListPage;