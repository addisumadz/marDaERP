"use client";
import { useMemo, useState } from "react";
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

import { UserRoleService } from "../../../lib/userRoleService";
import ViewUserRoleModal from "./ViewUserRoleModal";
import UserRoleFormModal from "./UserRoleFormModal";
import UserRoleStatusModal from "./UserRoleStatusModal";

const api = new UserRoleService();

const UserRolesList = () => {
  const queryClient = useQueryClient();
  const [viewId, setViewId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusId, setStatusId] = useState(null);

  const handleTabChange = (_, v) => setActiveTab(v);

  const { data: allItems = [], isError, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["user-roles-all"],
    queryFn: () => api.getAll(),
    refetchOnWindowFocus: false,
  });

  const { data: viewed, isLoading: isViewLoading } = useQuery({
    queryKey: ["user-role", viewId],
    queryFn: () => api.getById(viewId),
    enabled: !!viewId,
    refetchOnWindowFocus: false,
  });

  const { data: editing, isLoading: isEditingLoading } = useQuery({
    queryKey: ["user-role", editingId],
    queryFn: () => api.getById(editingId),
    enabled: !!editingId,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    let list = allItems || [];
    if (activeTab === 0) list = list.filter((x) => x.deleted === "active");
    else if (activeTab === 1) list = list.filter((x) => x.deleted === "deleted");
    return list;
  }, [allItems, activeTab]);

  const { mutateAsync: createItem, isLoading: isCreating } = useMutation({
    mutationFn: api.create,
    onSuccess: () => { queryClient.invalidateQueries(["user-roles-all"]); toast.success("Role created!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: updateItem, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => api.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(["user-roles-all"]); toast.success("Role updated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: deactivateItem, isLoading: isDeactivating } = useMutation({
    mutationFn: api.deactivate,
    onSuccess: () => { queryClient.invalidateQueries(["user-roles-all"]); toast.success("Role deactivated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const { mutateAsync: activateItem, isLoading: isActivating } = useMutation({
    mutationFn: api.activate,
    onSuccess: () => { queryClient.invalidateQueries(["user-roles-all"]); toast.success("Role activated!"); },
    onError: (e) => toast.error(`Error: ${e.response?.data?.message || e.message}`),
  });

  const handleCreateSubmit = async (data) => { await createItem(data); };
  const handleUpdateSubmit = async (data) => { if (!editingId) return; await updateItem({ id: editingId, data }); };

  const columns = useMemo(() => ([
    { header: "#", size: 20, Cell: ({ row, table }) => { const p = table.getState().pagination; return p.pageIndex * p.pageSize + row.index + 1; } },
    { accessorKey: "roleCode", header: "Role Code" },
    { accessorKey: "roleName", header: "Role Name" },
    { accessorKey: "isStore", header: "Store", Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No") },
    { accessorKey: "isFormanExpert", header: "Forman Expert", Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No") },
    { accessorKey: "isWaterMeterReader", header: "Water Meter Reader", Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No") },
  ]), []);

  const table = useMaterialReactTable({
    columns,
    data: filtered,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    state: { isLoading, showProgressBars: isFetching, showAlertBanner: isError },
    enableRowActions: true,
    positionActionsColumn: "first",
    getRowId: (row) => row.id,
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingId(null); setCreateModalOpen(true); }}>Create</Button>
        <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>{isFetching ? "Refreshing..." : "Refresh"}</Button>
      </Box>
    ),
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
      <Breadcrumb pageName="User Roles" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="role status tabs">
                <Tab label="Active" />
                <Tab label="Deleted" />
              </Tabs>
            </Box>
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      <ViewUserRoleModal roleItem={viewed} open={!!viewId} onClose={() => setViewId(null)} isLoading={isViewLoading} />

      <UserRoleFormModal
        open={isCreateModalOpen || !!editingId}
        onClose={() => { setCreateModalOpen(false); setEditingId(null); }}
        onSubmit={isCreateModalOpen ? handleCreateSubmit : handleUpdateSubmit}
        roleItem={editing}
        isLoading={isEditingLoading || isCreating || isUpdating}
      />

      <UserRoleStatusModal
        open={statusModalOpen}
        onClose={() => { setStatusModalOpen(false); setStatusId(null); setStatusModalMode(null); }}
        onConfirm={handleStatusConfirm}
        mode={statusModalMode}
        roleId={statusId}
      />
    </>
  );
};

const queryClient = new QueryClient();
const UserRolesListPage = () => (<QueryClientProvider client={queryClient}><UserRolesList /></QueryClientProvider>);
export default UserRolesListPage;
