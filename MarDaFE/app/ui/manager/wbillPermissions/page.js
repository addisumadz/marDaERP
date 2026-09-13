"use client";

import { useEffect, useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Checkbox,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import pagePermissionsService from "../../../lib/pagePermissionsService";
import { UserRoleService } from "../../../lib/userRoleService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";

const userRoleApi = new UserRoleService();

const BillingBanksPermissionsInner = () => {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [newPageCode, setNewPageCode] = useState("");
  const [newPageName, setNewPageName] = useState("");

  // Dialog State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  // Load all roles for dropdown
  const {
    data: roles = [],
    isLoading: isRolesLoading,
    isError: isRolesError,
  } = useQuery({
    queryKey: ["user-roles-all"],
    queryFn: () => userRoleApi.getAll(),
    refetchOnWindowFocus: false,
  });

  // Set default selected role once roles are loaded
  useEffect(() => {
    if (!selectedRoleId && roles && roles.length > 0) {
      const activeRoles = roles.filter((r) => r.deleted === "active");
      const first = activeRoles[0] || roles[0];
      if (first?.id) {
        setSelectedRoleId(first.id);
      }
    }
  }, [roles, selectedRoleId]);

  // Load permissions (UserRecord rows) for selected role
  const {
    data: rolePermissions = [],
    isLoading: isPermLoading,
    isError: isPermError,
  } = useQuery({
    queryKey: ["page-permissions-by-role", selectedRoleId],
    queryFn: () => pagePermissionsService.getPermissionsForRole(selectedRoleId),
    enabled: !!selectedRoleId,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: updateRolePermissions, isLoading: isSaving } = useMutation({
    mutationFn: ({ pageCode, roleId, payload }) =>
      pagePermissionsService.updateRolePermissions(pageCode, roleId, payload),
    onSuccess: () => {
      if (selectedRoleId) {
        queryClient.invalidateQueries(["page-permissions-by-role", selectedRoleId]);
      }
      toast.success("Permissions updated successfully");
      setEditDialogOpen(false);
      setEditingPermission(null);
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || error?.message || "Error updating permissions";
      toast.error(message);
    },
  });

  const handleAddPage = async () => {
    if (!selectedRoleId || !newPageCode.trim()) {
      toast.error("Role and page code are required");
      return;
    }

    const trimmedCode = newPageCode.trim();
    const trimmedName = newPageName ? newPageName.trim() : "";

    const payload = {
      pageName: trimmedName || trimmedCode,
      permissionCreate: false,
      permissionEdit: false,
      permissionDelete: false,
      permissionApprove: false,
      permissionNeedsApproval: false,
      permissionKdmekfya: false,
    };

    await updateRolePermissions({
      pageCode: trimmedCode,
      roleId: selectedRoleId,
      payload,
    });

    setNewPageCode("");
    setNewPageName("");
  };

  // Open Dialog
  const handleEditClick = (rowOriginal) => {
    setEditingPermission({ ...rowOriginal });
    setEditDialogOpen(true);
  };

  // Close Dialog
  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setEditingPermission(null);
  };

  // Toggle inside Dialog
  const handleDialogToggle = (field) => {
    setEditingPermission((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save from Dialog
  const handleDialogSave = async () => {
    if (!selectedRoleId || !editingPermission) return;

    const payload = {
      pageName: editingPermission.pageName || editingPermission.pageCode,
      permissionCreate: !!editingPermission.permissionCreate,
      permissionEdit: !!editingPermission.permissionEdit,
      permissionDelete: !!editingPermission.permissionDelete,
      permissionApprove: !!editingPermission.permissionApprove,
      permissionNeedsApproval: !!editingPermission.permissionNeedsApproval,
      permissionKdmekfya: !!editingPermission.permissionKdmekfya,
    };

    await updateRolePermissions({
      pageCode: editingPermission.pageCode,
      roleId: selectedRoleId,
      payload,
    });
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 50,
        Cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
      },
      {
        accessorKey: "pageCode",
        header: "Page Code",
      },
      {
        accessorKey: "pageName",
        header: "Page Name",
      },
      {
        accessorKey: "permissionCreate",
        header: "Create",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionCreate} disabled />
        ),
      },
      {
        accessorKey: "permissionEdit",
        header: "Edit",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionEdit} disabled />
        ),
      },
      {
        accessorKey: "permissionDelete",
        header: "Delete",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionDelete} disabled />
        ),
      },
      {
        accessorKey: "permissionApprove",
        header: "Approve",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionApprove} disabled />
        ),
      },
      {
        accessorKey: "permissionNeedsApproval",
        header: "Needs Approval",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionNeedsApproval} disabled />
        ),
      },
      {
        accessorKey: "permissionKdmekfya",
        header: "Kdmekfya",
        Cell: ({ row }) => (
          <Checkbox checked={!!row.original.permissionKdmekfya} disabled />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        Cell: ({ row }) => (
          <IconButton onClick={() => handleEditClick(row.original)} color="primary">
            <EditIcon />
          </IconButton>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: rolePermissions || [],
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    state: {
      isLoading: isRolesLoading || isPermLoading,
      showAlertBanner: isRolesError || isPermError,
    },
    getRowId: (row) => row.userRecordId ?? `${row.roleId}-${row.pageCode}`,
    enableRowActions: false,
  });

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Permissions Management" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            {isRolesLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : isRolesError ? (
              <Typography color="error">Error loading roles.</Typography>
            ) : (
              <>
                <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel id="role-select-label">Role</InputLabel>
                    <Select
                      labelId="role-select-label"
                      label="Role"
                      value={selectedRoleId ?? ""}
                      onChange={(e) => setSelectedRoleId(e.target.value || null)}
                    >
                      {roles
                        .filter((r) => r.deleted === "active")
                        .map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.roleName} ({role.roleCode})
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  {isPermError && (
                    <Typography color="error">
                      Error loading permissions. You might not have access to this page.
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    mb: 2,
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <TextField
                    size="small"
                    label="New Page Code"
                    value={newPageCode}
                    onChange={(e) => setNewPageCode(e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Page Name (optional)"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddPage}
                    disabled={!selectedRoleId || !newPageCode.trim() || isSaving}
                  >
                    Add Page
                  </Button>
                </Box>

                {selectedRoleId ? (
                  <MaterialReactTable table={table} />
                ) : (
                  <Typography>Select a role to view permissions.</Typography>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Permission Dialog */}
      <Dialog open={editDialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Permissions - {editingPermission?.pageName}</DialogTitle>
        <DialogContent dividers>
          {editingPermission && (
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionCreate}
                      onChange={() => handleDialogToggle("permissionCreate")}
                    />
                  }
                  label="Create"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionEdit}
                      onChange={() => handleDialogToggle("permissionEdit")}
                    />
                  }
                  label="Edit"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionDelete}
                      onChange={() => handleDialogToggle("permissionDelete")}
                    />
                  }
                  label="Delete"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionApprove}
                      onChange={() => handleDialogToggle("permissionApprove")}
                    />
                  }
                  label="Approve"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionNeedsApproval}
                      onChange={() => handleDialogToggle("permissionNeedsApproval")}
                    />
                  }
                  label="Needs Approval"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!editingPermission.permissionKdmekfya}
                      onChange={() => handleDialogToggle("permissionKdmekfya")}
                    />
                  }
                  label="Kdmekfya"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleDialogSave} variant="contained" disabled={isSaving}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

const BillingBanksPermissionsPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillingBanksPermissionsInner />
  </QueryClientProvider>
);

export default BillingBanksPermissionsPage;
