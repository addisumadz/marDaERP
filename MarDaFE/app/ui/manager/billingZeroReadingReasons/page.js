"use client";
import { useMemo, useState, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Box,
  Button,
  Grid,
  Paper,
  Tabs,
  Tab,
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
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";

import { BillingZeroReadingReasonService } from "../../../lib/billingZeroReadingReasonService";
import ViewZeroReasonModal from "./ViewZeroReasonModal";
import ZeroReasonFormModal from "./ZeroReasonFormModal";
import ZeroReasonStatusModal from "./ZeroReasonStatusModal";

const api = new BillingZeroReadingReasonService();

const ZeroReasonsList = () => {
  const queryClient = useQueryClient();
  const [viewId, setViewId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // modals
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null); // 'deactivate' | 'activate'
  const [statusId, setStatusId] = useState(null);

  const handleTabChange = (e, newValue) => {
    setActiveTab(newValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  useEffect(() => {
    const selectedIds = Object.keys(rowSelection);
    setSelectedId(selectedIds.length === 1 ? selectedIds[0] : null);
  }, [rowSelection]);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // Fetch all once
  const {
    data: allItems = [],
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["zero-reasons-all"],
    queryFn: () => api.getAllReasons(),
    refetchOnWindowFocus: false,
  });

  // view details
  const { data: viewed, isLoading: isViewLoading } = useQuery({
    queryKey: ["zero-reason-details", viewId],
    queryFn: () => api.getReasonById(viewId),
    enabled: !!viewId,
    refetchOnWindowFocus: false,
  });

  // edit details
  const { data: editing, isLoading: isEditingLoading } = useQuery({
    queryKey: ["zero-reason-details", editingId],
    queryFn: () => api.getReasonById(editingId),
    enabled: !!editingId,
    refetchOnWindowFocus: false,
  });

  // Client-side tab filter
  const filtered = useMemo(() => {
    if (!allItems) return [];
    let list = allItems;
    if (activeTab === 0) list = list.filter((x) => x.deleted === "active");
    else if (activeTab === 1) list = list.filter((x) => x.deleted === "deleted");
    return list;
  }, [allItems, activeTab]);

  // Mutations
  const { mutateAsync: createItem, isLoading: isCreating } = useMutation({
    mutationFn: api.createReason,
    onSuccess: () => {
      queryClient.invalidateQueries(["zero-reasons-all"]);
      toast.success("Reason created successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: updateItem, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => api.updateReason(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["zero-reasons-all"]);
      toast.success("Reason updated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: deactivateItem, isLoading: isDeactivating } = useMutation({
    mutationFn: api.deactivateReason,
    onSuccess: () => {
      queryClient.invalidateQueries(["zero-reasons-all"]);
      toast.success("Reason deactivated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const { mutateAsync: activateItem, isLoading: isActivating } = useMutation({
    mutationFn: api.activateReason,
    onSuccess: () => {
      queryClient.invalidateQueries(["zero-reasons-all"]);
      toast.success("Reason activated successfully!");
    },
    onError: (error) => toast.error(`Error: ${error.response?.data?.message || error.message}`),
  });

  const handleCreateSubmit = async (data) => {
    await createItem(data);
  };

  const handleUpdateSubmit = async (data) => {
    if (!editingId) return;
    await updateItem({ id: editingId, data });
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
      { accessorKey: "reasonCode", header: "Reason Code", filterFn: amharicFuzzyFilter },
      { accessorKey: "reasonName", header: "Reason Name", filterFn: amharicFuzzyFilter },
      {
        accessorKey: "isZeroReadingReason",
        header: "Zero Reading?",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
      {
        accessorKey: "isDoorCloseReason",
        header: "Door Close?",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filtered,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    manualPagination: false,
    enableRowNumbers: true,
    rowNumberMode: "original",
    state: {
      pagination,
      isLoading,
      showProgressBars: isFetching,
      showAlertBanner: isError,
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
        <Button size="small" onClick={() => setViewId(row.original.id)} title="View"><VisibilityIcon fontSize="small"/></Button>
        <Button size="small" onClick={() => setEditingId(row.original.id)} title="Edit"><EditIcon fontSize="small"/></Button>
        {row.original.deleted === "active" ? (
          <Button size="small" color="error" onClick={() => { setStatusId(row.original.id); setStatusModalMode("deactivate"); setStatusModalOpen(true); }} title="Deactivate"><DeleteIcon fontSize="small"/></Button>
        ) : (
          <Button size="small" color="primary" onClick={() => { setStatusId(row.original.id); setStatusModalMode("activate"); setStatusModalOpen(true); }} title="Activate"><AddIcon fontSize="small"/></Button>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setCreateModalOpen(true); }}>Create</Button>
        </Box>
        <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isError ? { color: "error", children: "Error loading data" } : undefined,
  });

  const handleStatusConfirm = async (payload) => {
    if (!statusId) return;
    try {
      if (payload.status === "deleted") {
        await deactivateItem({ id: statusId, remark: payload.remark || "" });
      } else if (payload.status === "active") {
        await activateItem(statusId);
      }
      setStatusModalOpen(false);
      setStatusId(null);
      setStatusModalMode(null);
    } catch (e) {}
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Zero Reading Reasons" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="zero reading reasons status tabs">
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>

            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      <ViewZeroReasonModal reason={viewed} open={!!viewId} onClose={() => setViewId(null)} isLoading={isViewLoading} />

      <ZeroReasonFormModal
        open={isCreateModalOpen || !!editingId}
        onClose={() => { setCreateModalOpen(false); setEditingId(null); }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        reason={editing}
        isLoading={isEditingLoading || isCreating || isUpdating}
      />

      <ZeroReasonStatusModal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusId(null); setStatusModalMode(null); }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        reasonId={statusId}
      />
    </>
  );
};

const queryClient = new QueryClient();

const ZeroReasonsListPage = () => (
  <QueryClientProvider client={queryClient}>
    <ZeroReasonsList />
  </QueryClientProvider>
);

export default ZeroReasonsListPage;
