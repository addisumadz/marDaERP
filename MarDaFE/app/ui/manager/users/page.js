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
  Tooltip,
  IconButton,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { UserAccountService } from "@/app/lib/userAccountService";
import { DropdownService } from "@/app/lib/dropdownService";

import ViewUserModal from "./ViewUserModal";
import UserFormModal from "./UserFormModal";
import UserStatusModal from "./UserStatusModal";
import ChangePasswordModal from "./ChangePasswordModal";

const userService = new UserAccountService();
const dropdownService = new DropdownService();

const UsersList = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0); // 0 active, 1 deactivated
  const [rowSelection, setRowSelection] = useState({});
  const [roleFilter, setRoleFilter] = useState(null);
  const [branchFilter, setBranchFilter] = useState(null);

  // Modals state
  const [viewId, setViewId] = useState(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusModalMode, setStatusModalMode] = useState(null);
  const [statusUserId, setStatusUserId] = useState(null);
  const [passwordUserId, setPasswordUserId] = useState(null);

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const handleTabChange = (e, v) => {
    setActiveTab(v);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // Data fetch
  const { data: allUsers = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["users-all"],
    queryFn: () => userService.getAllUsers(),
    refetchOnWindowFocus: false,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["dropdown-active-branches"],
    queryFn: () => dropdownService.getActiveBranches(),
    refetchOnWindowFocus: false,
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["dropdown-active-roles"],
    queryFn: () => dropdownService.getActiveRoles(),
    refetchOnWindowFocus: false,
  });

  // Mutations
  const { mutateAsync: createUser, isLoading: isCreating } = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries(["users-all"]);
    },
    onError: (e) => toast.error(e.response?.data || e.message),
  });

  const { mutateAsync: updateUser, isLoading: isUpdating } = useMutation({
    mutationFn: ({ id, data }) => userService.updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries(["users-all"]);
    },
    onError: (e) => toast.error(e.response?.data || e.message),
  });

  const { mutateAsync: deactivateUser, isLoading: isDeactivating } = useMutation({
    mutationFn: ({ id }) => userService.deactivateUser({ id }),
    onSuccess: () => {
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries(["users-all"]);
    },
    onError: (e) => toast.error(e.response?.data || e.message),
  });

  const { mutateAsync: activateUser, isLoading: isActivating } = useMutation({
    mutationFn: (id) => userService.activateUser(id),
    onSuccess: () => {
      toast.success("User activated successfully");
      queryClient.invalidateQueries(["users-all"]);
    },
    onError: (e) => toast.error(e.response?.data || e.message),
  });

  const handleCreateSubmit = async (data) => {
    await createUser(data);
    setCreateOpen(false);
  };
  const handleUpdateSubmit = async (data) => {
    if (!editId) return;
    await updateUser({ id: editId, data });
    setEditId(null);
  };

  // Client filtering
  const filteredUsers = useMemo(() => {
    let arr = allUsers || [];
    if (activeTab === 0) {
      arr = arr.filter((u) => u.status === "active");
    } else {
      arr = arr.filter((u) => u.status === "deactivated");
    }
    if (roleFilter?.id) {
      arr = arr.filter((u) => String(u.roleId) === String(roleFilter.id));
    }
    if (branchFilter?.id) {
      arr = arr.filter((u) => String(u.branchId) === String(branchFilter.id));
    }
    return arr;
  }, [allUsers, activeTab, roleFilter, branchFilter]);

  const columns = useMemo(() => [
    { header: "#", size: 20, Cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    }},
    { accessorKey: "userName", header: "Username" },
    { accessorKey: "fullName", header: "Full Name" },
    { accessorKey: "roleName", header: "Role" },
    { accessorKey: "branchName", header: "Branch" },
    { 
      accessorKey: "previousMonthCsvFileName", 
      header: "Prev Month CSV",
      Cell: ({ cell }) => cell.getValue() || "----"
    },
  ], []);

  const table = useMaterialReactTable({
    columns,
    data: filteredUsers,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    manualPagination: false,
    state: { pagination, isLoading, showProgressBars: isFetching, showAlertBanner: isError, rowSelection },
    onPaginationChange: setPagination,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row.id,
    enableRowActions: true,
    positionActionsColumn: "first",
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="View User">
          <IconButton onClick={() => setViewId(row.original.id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit User">
          <IconButton onClick={() => setEditId(row.original.id)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Change Password">
          <IconButton color="secondary" onClick={() => setPasswordUserId(row.original.id)}>
            <VpnKeyIcon />
          </IconButton>
        </Tooltip>
        {row.original.status === "active" ? (
          <Tooltip title="Deactivate User">
            <IconButton color="error" onClick={() => { setStatusUserId(row.original.id); setStatusModalMode("deactivate"); setStatusModalOpen(true); }}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Activate User">
            <IconButton color="primary" onClick={() => { setStatusUserId(row.original.id); setStatusModalMode("activate"); setStatusModalOpen(true); }}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: "1rem", p: "4px", alignItems: "center", flexWrap: "wrap" }}>
        <Autocomplete
          sx={{ minWidth: 220 }}
          options={roles || []}
          getOptionLabel={(option) => option?.roleName || option?.name || String(option?.id || "")}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          value={roleFilter}
          onChange={(e, newVal) => {
            setRoleFilter(newVal);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          renderInput={(params) => <TextField {...params} label="Filter by Role" placeholder="Select role" />}
          clearOnEscape
        />
        <Autocomplete
          sx={{ minWidth: 220 }}
          options={branches || []}
          getOptionLabel={(option) => option?.branchDescription || option?.name || String(option?.id || "")}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          value={branchFilter}
          onChange={(e, newVal) => {
            setBranchFilter(newVal);
            setPagination((p) => ({ ...p, pageIndex: 0 }));
          }}
          renderInput={(params) => <TextField {...params} label="Filter by Branch" placeholder="Select branch" />}
          clearOnEscape
        />
        <Button
          variant="text"
          onClick={() => { setRoleFilter(null); setBranchFilter(null); setPagination((p) => ({ ...p, pageIndex: 0 })); }}
          disabled={!roleFilter && !branchFilter}
        >
          Clear Filters
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditId(null); setCreateOpen(true); }}>Create</Button>
        <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>{isFetching ? "Refreshing..." : "Refresh"}</Button>
      </Box>
    ),
  });

  const handleStatusConfirm = async () => {
    if (!statusUserId) return;
    try {
      if (statusModalMode === "deactivate") {
        await deactivateUser({ id: statusUserId });
      } else {
        await activateUser(statusUserId);
      }
      setStatusModalOpen(false);
      setStatusUserId(null);
      setStatusModalMode(null);
    } catch {}
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Users" />
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Active" />
                <Tab label="Deactivated" />
              </Tabs>
            </Box>
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>

      {/* View Modal */}
      <ViewUserModal open={!!viewId} onClose={() => setViewId(null)} userId={viewId} />

      {/* Create/Edit Modal */}
      <UserFormModal
        open={isCreateOpen || !!editId}
        onClose={() => { setCreateOpen(false); setEditId(null); }}
        onSubmit={isCreateOpen ? handleCreateSubmit : handleUpdateSubmit}
        userId={editId}
        branches={branches}
        roles={roles}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Status Modal */}
      <UserStatusModal
        open={statusModalOpen}
        mode={statusModalMode}
        onClose={() => { setStatusModalOpen(false); setStatusUserId(null); setStatusModalMode(null); }}
        onConfirm={handleStatusConfirm}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={!!passwordUserId}
        userId={passwordUserId}
        onClose={() => setPasswordUserId(null)}
      />
    </>
  );
};

const queryClient = new QueryClient();
const UsersPage = () => (
  <QueryClientProvider client={queryClient}>
    <UsersList />
  </QueryClientProvider>
);

export default UsersPage;
