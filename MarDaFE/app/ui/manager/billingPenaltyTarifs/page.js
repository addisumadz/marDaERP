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
  Tabs, 
  Tab, 
  Chip
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
import { BillingPenaltyTarifService } from "../../../lib/billingPenaltyTarifService";
import { BillingCustomerTypeService } from "../../../lib/billingCustomerTypeService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect } from "react";

// Modal components
import ViewPenaltyTarifModal from "./ViewPenaltyTarifModal";
import PenaltyTarifFormModal from "./PenaltyTarifFormModal";
import PenaltyTarifStatusModal from "./PenaltyTarifStatusModal";

const penaltyTarifService = new BillingPenaltyTarifService();
const customerTypeService = new BillingCustomerTypeService();

const PenaltyTarifsList = () => {
  const queryClient = useQueryClient();
  const [viewedPenaltyTarifId, setViewedPenaltyTarifId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCustomerType, setSelectedCustomerType] = useState("");

  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingPenaltyTarifId, setEditingPenaltyTarifId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusPenaltyTarifId, setStatusPenaltyTarifId] = useState(null);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  // Fetch all penalty tarifs
  const {
    data: allPenaltyTarifs = [],
    isError: isPenaltyTarifsError,
    isFetching,
    isLoading: isPenaltyTarifsLoading,
    refetch: refetchPenaltyTarifsAll,
  } = useQuery({
    queryKey: ["penalty-tarifs-all"],
    queryFn: () => penaltyTarifService.getAllPenaltyTarifs(),
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

  // Fetch penalty tarif details for viewing
  const {
    data: viewedPenaltyTarif,
    isLoading: isPenaltyTarifDetailsFetching,
  } = useQuery({
    queryKey: ["penalty-tarif-details", viewedPenaltyTarifId],
    queryFn: () => penaltyTarifService.getPenaltyTarifById(viewedPenaltyTarifId),
    enabled: !!viewedPenaltyTarifId,
    refetchOnWindowFocus: false,
  });

  // Fetch penalty tarif details for editing
  const {
    data: editingPenaltyTarif,
    isLoading: isEditingPenaltyTarifFetching,
  } = useQuery({
    queryKey: ["penalty-tarif-details", editingPenaltyTarifId],
    queryFn: () => penaltyTarifService.getPenaltyTarifById(editingPenaltyTarifId),
    enabled: !!editingPenaltyTarifId,
    refetchOnWindowFocus: false,
  });

  // Client-side filtering based on tab and filters
  const filteredPenaltyTarifs = useMemo(() => {
    if (!allPenaltyTarifs) return [];
    
    let filtered = allPenaltyTarifs;
    
    // Filter by tab (status) - using "active"/"deleted" values
    if (activeTab === 0) {
      filtered = filtered.filter(tarif => tarif.deleted === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter(tarif => tarif.deleted === "deleted");
    }
    
    // Filter by customer type
    if (selectedCustomerType) {
      filtered = filtered.filter(tarif => tarif.customerTypeId === parseInt(selectedCustomerType));
    }
    
    return filtered;
  }, [allPenaltyTarifs, activeTab, selectedCustomerType]);

  // Mutations for create, update, and status changes
  const createMutation = useMutation({
    mutationFn: (data) => penaltyTarifService.createPenaltyTarif(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["penalty-tarifs-all"]);
      toast.success("Penalty tarif created successfully");
      setCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create penalty tarif");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => penaltyTarifService.updatePenaltyTarif(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["penalty-tarifs-all"]);
      toast.success("Penalty tarif updated successfully");
      setEditingPenaltyTarifId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update penalty tarif");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (payload) => penaltyTarifService.deactivatePenaltyTarif(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["penalty-tarifs-all"]);
      toast.success("Penalty tarif deactivated successfully");
      setStatusModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to deactivate penalty tarif");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id) => penaltyTarifService.activatePenaltyTarif(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["penalty-tarifs-all"]);
      toast.success("Penalty tarif activated successfully");
      setStatusModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to activate penalty tarif");
    },
  });

  // Event handlers
  const handleCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const handleUpdateSubmit = (data) => {
    updateMutation.mutate({ id: editingPenaltyTarifId, data });
  };

  const handleStatusConfirm = (remark) => {
    const safeRemark = remark || "";
    if (statusModalMode === "deactivate") {
      deactivateMutation.mutate({ id: statusPenaltyTarifId, remark: safeRemark });
    } else if (statusModalMode === "activate") {
      activateMutation.mutate(statusPenaltyTarifId);
    }
  };

  const columns = useMemo(
    () => [
      // Actions first (left side)
      {
        id: "actions",
        header: "Actions",
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() => setViewedPenaltyTarifId(row.original.id)}
                color="info"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setEditingPenaltyTarifId(row.original.id)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            {row.original.deleted === "active" ? (
              <Tooltip title="Deactivate">
                <IconButton
                  size="small"
                  onClick={() => {
                    setStatusPenaltyTarifId(row.original.id);
                    setStatusModalMode("deactivate");
                    setStatusModalOpen(true);
                  }}
                  color="warning"
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Activate">
                <IconButton
                  size="small"
                  onClick={() => {
                    setStatusPenaltyTarifId(row.original.id);
                    setStatusModalMode("activate");
                    setStatusModalOpen(true);
                  }}
                  color="success"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
      // Fields matching backend model
      {
        accessorKey: "customerTypeName",
        header: "Customer Type",
        size: 150,
      },
      {
        accessorKey: "numberOfMonth",
        header: "Months",
        size: 90,
      },
      {
        accessorKey: "isPercent",
        header: "Is Percent",
        size: 100,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() ? "Yes" : "No"} color={cell.getValue() ? "info" : "default"} size="small" />
        ),
      },
      {
        accessorKey: "bewerBzatYbaza",
        header: "Bewer Bzat Ybaza",
        size: 160,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() ? "On" : "Off"} color={cell.getValue() ? "success" : "default"} size="small" />
        ),
      },
      {
        accessorKey: "weruLayDemr",
        header: "Weru Lay Demr",
        size: 150,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() ? "On" : "Off"} color={cell.getValue() ? "success" : "default"} size="small" />
        ),
      },
      {
        accessorKey: "enaKezihBelay",
        header: "Ena Kezih Belay",
        size: 150,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() ? "On" : "Off"} color={cell.getValue() ? "secondary" : "default"} size="small" />
        ),
      },
      {
        accessorKey: "penalityBirr",
        header: "Penalty Birr",
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2">{cell.getValue() ?? 0}</Typography>
        ),
      },
      {
        accessorKey: "additionalPenalty",
        header: "Additional Penalty",
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2">{cell.getValue() ?? 0}</Typography>
        ),
      },
      {
        // remark removed as per request
        id: "_placeholder_no_remark",
        header: "",
        size: 0,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: () => null,
      },
      {
        accessorKey: "deleted",
        header: "Status",
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() === "active" ? "Active" : "Deleted"}
            color={cell.getValue() === "active" ? "success" : "error"}
            size="small"
          />
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredPenaltyTarifs,
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    enableBottomToolbar: true,
    enableTopToolbar: true,
    muiTableBodyRowProps: { hover: true },
    initialState: {
      pagination: {
        pageSize: 10,
        pageIndex: 0,
      },
      sorting: [
        {
          id: "createdDate",
          desc: true,
        },
      ],
    },
    state: {
      isLoading: isPenaltyTarifsLoading,
      pagination,
    },
    onPaginationChange: setPagination,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create
        </Button>
        <Button
          variant="outlined"
          onClick={() => refetchPenaltyTarifsAll()}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiCircularProgressProps: {
      color: "secondary",
      thickness: 5,
      size: 55,
    },
    muiSkeletonProps: {
      animation: "pulse",
      height: 28,
    },
  });

  if (isPenaltyTarifsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading penalty tarifs. Please try again.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h4" component="h1">
                Billing Penalty Tarifs
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
              >
                <Tab
                  label={`Active (${(
                    allPenaltyTarifs.filter((item) => item.deleted === "active").length
                  )})`}
                />
                <Tab
                  label={`Deleted (${(
                    allPenaltyTarifs.filter((item) => item.deleted === "deleted").length
                  )})`}
                />
              </Tabs>
            </Box>

            {/* Filters (below tabs) */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={selectedCustomerType}
                  onChange={(e) => setSelectedCustomerType(e.target.value)}
                  label="Customer Type"
                >
                  <MenuItem value="">
                    <em>All Customer Types</em>
                  </MenuItem>
                  {allCustomerTypes
                    .filter((type) => type.deleted === "active")
                    .map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.customerType}
                      </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedCustomerType && (
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
      <ViewPenaltyTarifModal
        penaltyTarif={viewedPenaltyTarif}
        open={!!viewedPenaltyTarifId}
        onClose={() => setViewedPenaltyTarifId(null)}
        isLoading={isPenaltyTarifDetailsFetching}
      />

      {/* Create/Edit Modal */}
      <PenaltyTarifFormModal
        open={isCreateModalOpen || !!editingPenaltyTarifId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingPenaltyTarifId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        penaltyTarif={editingPenaltyTarif}
        customerTypes={allCustomerTypes}
        isLoading={isEditingPenaltyTarifFetching || createMutation.isPending || updateMutation.isPending}
      />

      {/* Status Modal */}
      <PenaltyTarifStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusPenaltyTarifId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        penaltyTarifId={statusPenaltyTarifId}
        isLoading={deactivateMutation.isPending || activateMutation.isPending}
      />

      <ToastContainer />
    </>
  );
};

const queryClient = new QueryClient();

const PenaltyTarifsListPage = () => (
  <QueryClientProvider client={queryClient}>
    <PenaltyTarifsList />
  </QueryClientProvider>
);

export default PenaltyTarifsListPage;
