"use client";
import { useMemo, useState } from "react";
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
  Chip,
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
import { BillingTariffService } from "../../../lib/billingTariffService";
import { BillingCustomerTypeService } from "../../../lib/billingCustomerTypeService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

import ViewTariffModal from "./ViewTariffModal";
import TariffFormModal from "./TariffFormModal";
import TariffStatusModal from "./TariffStatusModal";

const tariffService = new BillingTariffService();
const customerTypeService = new BillingCustomerTypeService();

const TariffsList = () => {
  const queryClient = useQueryClient();
  const [viewedTariffId, setViewedTariffId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCustomerType, setSelectedCustomerType] = useState("");

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingTariffId, setEditingTariffId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusTariffId, setStatusTariffId] = useState(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const {
    data: allTariffs = [],
    isError: isTariffsError,
    isFetching,
    isLoading: isTariffsLoading,
    refetch: refetchTariffsAll,
  } = useQuery({
    queryKey: ["tariffs-all"],
    queryFn: () => tariffService.getAllTariffs(),
    refetchOnWindowFocus: false,
  });

  const {
    data: allCustomerTypes = [],
    isLoading: isCustomerTypesLoading,
  } = useQuery({
    queryKey: ["customer-types-all"],
    queryFn: () => customerTypeService.getAllCustomerTypes(),
    refetchOnWindowFocus: false,
  });

  const { data: viewedTariff, isLoading: isTariffDetailsFetching } = useQuery({
    queryKey: ["tariff-details", viewedTariffId],
    queryFn: () => tariffService.getTariffById(viewedTariffId),
    enabled: !!viewedTariffId,
    refetchOnWindowFocus: false,
  });

  const { data: editingTariff, isLoading: isEditingTariffFetching } = useQuery({
    queryKey: ["tariff-details", editingTariffId],
    queryFn: () => tariffService.getTariffById(editingTariffId),
    enabled: !!editingTariffId,
    refetchOnWindowFocus: false,
  });

  const filteredTariffs = useMemo(() => {
    if (!allTariffs) return [];
    let filtered = allTariffs;
    if (activeTab === 0) {
      filtered = filtered.filter((t) => t.status === "active");
    } else if (activeTab === 1) {
      filtered = filtered.filter((t) => t.status === "deleted");
    }
    if (selectedCustomerType) {
      filtered = filtered.filter(
        (t) => t.customerTypeId === parseInt(selectedCustomerType)
      );
    }
    return filtered;
  }, [allTariffs, activeTab, selectedCustomerType]);

  const createMutation = useMutation({
    mutationFn: (data) => tariffService.createTariff(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tariffs-all"]);
      toast.success("Tariff created successfully");
      setCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create tariff");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => tariffService.updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["tariffs-all"]);
      toast.success("Tariff updated successfully");
      setEditingTariffId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update tariff");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (payload) => tariffService.deactivateTariff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["tariffs-all"]);
      toast.success("Tariff deactivated successfully");
      setStatusModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to deactivate tariff");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id) => tariffService.activateTariff(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["tariffs-all"]);
      toast.success("Tariff activated successfully");
      setStatusModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to activate tariff");
    },
  });

  const handleCreateSubmit = (data) => createMutation.mutate(data);
  const handleUpdateSubmit = (data) => updateMutation.mutate({ id: editingTariffId, data });

  const handleStatusConfirm = (remark) => {
    const safeRemark = remark || "";
    if (statusModalMode === "deactivate") {
      deactivateMutation.mutate({ id: statusTariffId, remark: safeRemark });
    } else if (statusModalMode === "activate") {
      activateMutation.mutate(statusTariffId);
    }
  };

  const columns = useMemo(
    () => [
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
                onClick={() => setViewedTariffId(row.original.id)}
                color="info"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => setEditingTariffId(row.original.id)}
                color="primary"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            {row.original.status === "active" ? (
              <Tooltip title="Deactivate">
                <IconButton
                  size="small"
                  onClick={() => {
                    setStatusTariffId(row.original.id);
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
                    setStatusTariffId(row.original.id);
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
      { accessorKey: "id", header: "ID", size: 80 },
      { accessorKey: "customerTypeName", header: "Customer Type", size: 160 },
      { accessorKey: "blockName", header: "Block Name", size: 160 },
      { accessorKey: "consumption", header: "Consumption", size: 120 },
      { accessorKey: "tarrifBirr", header: "Tariff (Birr)", size: 120 },
      {
        accessorKey: "isLast",
        header: "Is Last Block",
        size: 120,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue() ? "Yes" : "No"} color={cell.getValue() ? "info" : "default"} size="small" />
        ),
      },
      {
        accessorKey: "status",
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
    data: filteredTariffs,
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
      pagination: { pageSize: 10, pageIndex: 0 },
      sorting: [
        { id: "id", desc: true },
      ],
    },
    state: {
      isLoading: isTariffsLoading,
      pagination,
    },
    onPaginationChange: setPagination,
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)}>
          Create
        </Button>
        <Button variant="outlined" onClick={() => refetchTariffsAll()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiCircularProgressProps: { color: "secondary", thickness: 5, size: 55 },
    muiSkeletonProps: { animation: "pulse", height: 28 },
  });

  if (isTariffsError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading tariffs. Please try again.</Typography>
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
                Billing Tariffs
              </Typography>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label={`Active (${allTariffs.filter((item) => item.status === "active").length})`} />
                <Tab label={`Deleted (${allTariffs.filter((item) => item.status === "deleted").length})`} />
              </Tabs>
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
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

      <ViewTariffModal
        tariff={viewedTariff}
        open={!!viewedTariffId}
        onClose={() => setViewedTariffId(null)}
        isLoading={isTariffDetailsFetching}
      />

      <TariffFormModal
        open={isCreateModalOpen || !!editingTariffId}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingTariffId(null);
        }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        tariff={editingTariff}
        customerTypes={allCustomerTypes}
        isLoading={isEditingTariffFetching || createMutation.isPending || updateMutation.isPending}
      />

      <TariffStatusModal
        open={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setStatusTariffId(null);
          setStatusModalMode(null);
        }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        tariffId={statusTariffId}
        isLoading={deactivateMutation.isPending || activateMutation.isPending}
      />

      <ToastContainer />
    </>
  );
};

const queryClient = new QueryClient();

const TariffsListPage = () => (
  <QueryClientProvider client={queryClient}>
    <TariffsList />
  </QueryClientProvider>
);

export default TariffsListPage;
