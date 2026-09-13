"use client";
import { useMemo, useState, useEffect } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Button, Grid, Paper, Tabs, Tab } from "@mui/material";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { BillingCompanyInformationService } from "../../../lib/billingCompanyInformationService";
import ViewCompanyInfoModal from "./ViewCompanyInfoModal";
import CompanyInfoFormModal from "./CompanyInfoFormModal";
import CompanyInfoStatusModal from "./CompanyInfoStatusModal";

const api = new BillingCompanyInformationService();

const CompanyInfoList = () => {
  const queryClient = useQueryClient();
  const [viewId, setViewId] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusId, setStatusId] = useState(null);

  const handleTabChange = (_, v) => {
    setActiveTab(v);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const { data: allItems = [], isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["company-info-all"],
    queryFn: () => api.getAll(),
    refetchOnWindowFocus: false,
  });

  const { data: viewed, isLoading: isViewLoading } = useQuery({
    queryKey: ["company-info", viewId],
    queryFn: () => api.getById(viewId),
    enabled: !!viewId,
    refetchOnWindowFocus: false,
  });

  const { data: editing, isLoading: isEditingLoading } = useQuery({
    queryKey: ["company-info", editingId],
    queryFn: () => api.getById(editingId),
    enabled: !!editingId,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!allItems) return [];
    let list = allItems;
    if (activeTab === 0) list = list.filter((x) => x.status === "active");
    else if (activeTab === 1) list = list.filter((x) => x.status === "deleted");
    return list;
  }, [allItems, activeTab]);

  const { mutateAsync: createItem, isLoading: isCreating } = useMutation({
    mutationFn: api.create,
    onSuccess: () => { queryClient.invalidateQueries(["company-info-all"]); toast.success("Company info created!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: updateItem, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => api.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["company-info-all"]); toast.success("Company info updated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: deactivateItem, isLoading: isDeactivating } = useMutation({
    mutationFn: api.deactivate,
    onSuccess: () => { queryClient.invalidateQueries(["company-info-all"]); toast.success("Company info deactivated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: activateItem, isLoading: isActivating } = useMutation({
    mutationFn: api.activate,
    onSuccess: () => { queryClient.invalidateQueries(["company-info-all"]); toast.success("Company info activated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const handleCreateSubmit = async (data) => { await createItem(data); };
  const handleUpdateSubmit = async (data) => { if (!editingId) return; await updateItem({ id: editingId, data }); };

  const columns = useMemo(() => ([
    { header: "#", size: 20, Cell: ({ row, table }) => { const p = table.getState().pagination; return p.pageIndex * p.pageSize + row.index + 1; } },
    { accessorKey: "companyName", header: "Company Name" },
    { accessorKey: "motto", header: "Motto" },
    { accessorKey: "message", header: "Message" },
    { accessorKey: "deresegnSebsabiLabel", header: "Deresegn Sebsabi Label" },
    { accessorKey: "deresegnYemiaregagtLabel", header: "Deresegn Yemiaregagt Label" },
    { accessorKey: "yeteganenePercent", header: "Yeteganene %" },
  ]), []);

  const table = useMaterialReactTable({
    columns,
    data: filtered,
    initialState: { showColumnFilters: false, showGlobalFilter: false, pagination: { pageIndex: 0, pageSize: 10 } },
    manualPagination: false,
    enableRowNumbers: true,
    rowNumberMode: "original",
    state: { pagination, isLoading, showProgressBars: isFetching, showAlertBanner: isError },
    onPaginationChange: setPagination,
    enableRowActions: true,
    positionActionsColumn: "first",
    getRowId: (row) => row.id,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Button size="small" onClick={() => setViewId(row.original.id)} title="View"><VisibilityIcon fontSize="small"/></Button>
        <Button size="small" onClick={() => setEditingId(row.original.id)} title="Edit"><EditIcon fontSize="small"/></Button>
        {/* Delete/Activate actions hidden as requested */}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px" }}>
        {/* Create button hidden as requested */}
        <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>{isFetching ? "Refreshing..." : "Refresh"}</Button>
      </Box>
    ),
    muiToolbarAlertBannerProps: isError ? { color: "error", children: "Error loading data" } : undefined,
  });

  const handleStatusConfirm = async (payload) => {
    if (!statusId) return;
    try {
      if (payload.status === "deleted") await deactivateItem(statusId);
      else if (payload.status === "active") await activateItem(statusId);
      setStatusModalOpen(false); setStatusId(null); setStatusModalMode(null);
    } catch {}
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Company Information" />
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="company info status tabs">
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      <ViewCompanyInfoModal info={viewed} open={!!viewId} onClose={() => setViewId(null)} isLoading={isViewLoading} />

      <CompanyInfoFormModal
        open={isCreateModalOpen || !!editingId}
        onClose={() => { setCreateModalOpen(false); setEditingId(null); }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        info={editing}
        isLoading={isEditingLoading || isCreating || isUpdating}
      />

      <CompanyInfoStatusModal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusId(null); setStatusModalMode(null); }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        infoId={statusId}
      />
    </>
  );
};

const queryClient = new QueryClient();
const CompanyInfoListPage = () => (<QueryClientProvider client={queryClient}><CompanyInfoList /></QueryClientProvider>);
export default CompanyInfoListPage;
