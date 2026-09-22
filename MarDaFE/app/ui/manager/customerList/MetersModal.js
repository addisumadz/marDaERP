"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  Paper,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SpeedIcon from "@mui/icons-material/Speed";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { CustomerService } from "../../../lib/customerService";
import { DropdownService } from "../../../lib/dropdownService";
import ConfirmDialog from "@/app/ui/components/ConfirmDialog";

const customerService = new CustomerService();
const dropdownService = new DropdownService();

const MetersModal = ({ open, onClose, customerId, allCustomers = [], meterSizes = [] }) => {
  const [editingMeter, setEditingMeter] = useState(null);
  const [meterToDelete, setMeterToDelete] = useState(null);

  const [form, setForm] = useState({
    meterNumber: "",
    activeMeter: true,
    billingMeterTypeId: "",
    meterSizeId: "",
    initialReading: 0,
    maxReference: 10000,
  });
  const [formError, setFormError] = useState("");

  const { data: meterTypes = [] } = useQuery({
    queryKey: ["meter-types"],
    queryFn: () => dropdownService.getMeterTypes?.() || Promise.resolve([]),
    enabled: open,
    staleTime: Infinity,
  });

  const {
    data: meters = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["customer-meters", customerId],
    queryFn: () => customerService.getMetersByCustomer(customerId),
    enabled: open && !!customerId,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const { data: customer } = useQuery({
    queryKey: ["customer-details", customerId],
    queryFn: () => customerService.getCustomerById(customerId),
    enabled: open && !!customerId,
    staleTime: Infinity,
  });

  const { mutateAsync: createMeter, isLoading: isCreating } = useMutation({
    mutationFn: ({ customerId, data }) => customerService.createMeter(customerId, data),
    onSuccess: () => refetch(),
  });

  const { mutateAsync: updateMeter, isLoading: isUpdating } = useMutation({
    mutationFn: ({ meterId, data }) => customerService.updateMeter(meterId, data),
    onSuccess: () => refetch(),
  });

  const { mutateAsync: deleteMeter, isLoading: isDeleting } = useMutation({
    mutationFn: (meterId) => customerService.deleteMeter(meterId),
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (!open) {
      setEditingMeter(null);
      setMeterToDelete(null);
      setFormError("");
      setForm({
        meterNumber: "",
        activeMeter: true,
        billingMeterTypeId: "",
        meterSizeId: "",
        initialReading: 0,
        maxReference: 10000,
      });
    }
  }, [open]);

  useEffect(() => {
    if (editingMeter) {
      setForm({
        meterNumber: editingMeter.meterNumber || "",
        activeMeter: editingMeter.activeMeter !== undefined ? !!editingMeter.activeMeter : true,
        billingMeterTypeId: editingMeter.billingMeterTypeId || "",
        meterSizeId: editingMeter.meterSizeId || "",
        initialReading: editingMeter.initialReading ?? 0,
        maxReference: editingMeter.maxReference ?? 10000,
      });
      setFormError("");
    }
  }, [editingMeter]);

  // Duplicate meter number check against other customers
  const isDuplicateMeter = useMemo(() => {
    const trimmed = (form.meterNumber || "").trim().toLowerCase();
    if (!trimmed || trimmed === "-" || trimmed === "null" || trimmed === "0") return null;

    // Check against all customers other than current customer's own matching record
    const match = (allCustomers || []).find((c) => {
      if (String(c.id) === String(customerId)) {
        // If editing an existing meter belonging to current customer, allow same number
        if (editingMeter?.id && editingMeter.meterNumber?.trim().toLowerCase() === trimmed) {
          return false;
        }
      }
      return (c.meterNumber || "").trim().toLowerCase() === trimmed;
    });

    return match || null;
  }, [form.meterNumber, customerId, editingMeter, allCustomers]);

  const columns = useMemo(
    () => [
      { header: "#", size: 30, Cell: ({ row }) => row.index + 1 },
      {
        accessorKey: "meterNumber",
        header: "Meter Serial No",
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SpeedIcon fontSize="small" color="primary" />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {row.original.meterNumber || "N/A"}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "activeMeter",
        header: "Status",
        Cell: ({ cell }) => (
          <Chip
            size="small"
            icon={cell.getValue() ? <CheckCircleIcon /> : <CancelIcon />}
            label={cell.getValue() ? "Active" : "Inactive"}
            color={cell.getValue() ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
      {
        accessorKey: "meterSizeId",
        header: "Caliber / Size",
        Cell: ({ row }) => {
          const meterSize = meterSizes.find((ms) => ms.id === row.original.meterSizeId);
          return meterSize ? meterSize.sizeName || meterSize.name || "N/A" : "N/A";
        },
      },
      {
        accessorKey: "initialReading",
        header: "Initial Index",
        Cell: ({ cell }) => Number(cell.getValue() || 0).toLocaleString(),
      },
      {
        accessorKey: "maxReference",
        header: "Max Threshold",
        Cell: ({ cell }) => Number(cell.getValue() || 0).toLocaleString(),
      },
    ],
    [meterSizes]
  );

  const table = useMaterialReactTable({
    columns,
    data: meters || [],
    state: { isLoading, showProgressBars: isFetching },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: () => (
      <Button
        size="small"
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setEditingMeter({})}
        sx={{ fontWeight: 700, textTransform: "none" }}
      >
        Add New Meter
      </Button>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Tooltip title="Edit Meter">
          <IconButton size="small" onClick={() => setEditingMeter(row.original)} color="primary">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Meter">
          <IconButton
            size="small"
            color="error"
            onClick={() => setMeterToDelete(row.original)}
            disabled={isDeleting}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanMeter = form.meterNumber.trim();
    if (!cleanMeter) {
      setFormError("Meter Number is required.");
      return;
    }

    if (isDuplicateMeter) {
      setFormError(
        `Meter Number "${cleanMeter}" is already registered to ${isDuplicateMeter.fullName || "another customer"} (Account: ${isDuplicateMeter.accountNumber}). Duplicate meter numbers are not allowed.`
      );
      return;
    }

    const payload = {
      meterNumber: cleanMeter,
      activeMeter: Boolean(form.activeMeter),
      billingMeterTypeId: form.billingMeterTypeId || null,
      meterSizeId: form.meterSizeId || null,
      initialReading: Number(form.initialReading) || 0,
      maxReference: Number(form.maxReference) || 0,
    };

    try {
      if (editingMeter && editingMeter.id) {
        await updateMeter({ meterId: editingMeter.id, data: payload });
      } else {
        await createMeter({ customerId, data: payload });
      }
      setEditingMeter(null);
    } catch (err) {
      setFormError(err.message || "Failed to save meter.");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle sx={{ p: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <SpeedIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Meter Infrastructure Management
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer: <strong>{customer?.fullName || "—"}</strong> &bull; Acc: <strong>{customer?.accountNumber || "—"}</strong>
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ py: 2.5 }}>
          {/* Active Primary Meter Spotlight Card */}
          {customer && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2.5,
                bgcolor: "background.default",
                borderRadius: 2,
                borderLeft: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}>
                Primary Meter Linked to Customer Account
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Meter Number</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{customer.meterNumber || "None"}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Caliber</Typography>
                  <Typography variant="body2">{meterSizes.find((ms) => ms.id === customer.meterSizeId)?.name || customer.meterSize || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Initial Index</Typography>
                  <Typography variant="body2">{customer.initialReading ?? 0}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Replaced (2nd Init)</Typography>
                  <Typography variant="body2">{customer.isInitializedSecondTime ? "Yes" : "No"}</Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Table of Meters */}
          <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
            <MaterialReactTable table={table} />
          </Paper>

          {/* Add / Edit Form Panel */}
          {editingMeter !== null && (
            <Paper
              elevation={3}
              sx={{
                mt: 3,
                p: 2.5,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "2px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                {editingMeter.id ? `Edit Meter — ${editingMeter.meterNumber}` : "Register Additional Meter"}
              </Typography>

              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}

              {isDuplicateMeter && (
                <Alert severity="error" sx={{ mb: 2 }} icon={<WarningAmberIcon />}>
                  <strong>Duplicate Meter Number:</strong> Meter &quot;{form.meterNumber}&quot; is already registered to <strong>{isDuplicateMeter.fullName}</strong> (Account: <strong>{isDuplicateMeter.accountNumber}</strong>). Duplicate meter numbers are not allowed!
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Meter Serial Number *"
                      size="small"
                      fullWidth
                      value={form.meterNumber}
                      onChange={(e) => setForm((f) => ({ ...f, meterNumber: e.target.value }))}
                      error={Boolean(isDuplicateMeter)}
                      helperText={isDuplicateMeter ? `In use by Account ${isDuplicateMeter.accountNumber}` : "Must be unique"}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Meter Caliber / Size</InputLabel>
                      <Select
                        label="Meter Caliber / Size"
                        value={form.meterSizeId}
                        onChange={(e) => setForm((f) => ({ ...f, meterSizeId: e.target.value }))}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {meterSizes.map((ms) => (
                          <MenuItem key={ms.id} value={ms.id}>
                            {ms.name || ms.sizeName || ms.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Initial Reading"
                      type="number"
                      size="small"
                      fullWidth
                      value={form.initialReading}
                      onChange={(e) => setForm((f) => ({ ...f, initialReading: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Max Monthly Threshold"
                      type="number"
                      size="small"
                      fullWidth
                      value={form.maxReference}
                      onChange={(e) => setForm((f) => ({ ...f, maxReference: e.target.value }))}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={Boolean(form.activeMeter)}
                          onChange={(e) => setForm((f) => ({ ...f, activeMeter: e.target.checked }))}
                        />
                      }
                      label="Active Meter"
                    />
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2.5 }}>
                  <Button size="small" onClick={() => setEditingMeter(null)} disabled={isCreating || isUpdating}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    disabled={isCreating || isUpdating || Boolean(isDuplicateMeter)}
                    startIcon={isCreating || isUpdating ? <CircularProgress size={16} color="inherit" /> : null}
                    sx={{ fontWeight: 700 }}
                  >
                    {isCreating || isUpdating ? "Saving..." : editingMeter?.id ? "Update Meter" : "Create Meter"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} variant="outlined" color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Safe Meter Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(meterToDelete)}
        title="Confirm Meter Deletion"
        content={
          <Typography variant="body2">
            Are you sure you want to delete Meter <strong>{meterToDelete?.meterNumber}</strong>? This will permanently erase this meter record and cannot be undone.
          </Typography>
        }
        confirmText="Delete Meter"
        confirmColor="error"
        onClose={() => setMeterToDelete(null)}
        onConfirm={async () => {
          if (meterToDelete?.id) {
            await deleteMeter(meterToDelete.id);
            setMeterToDelete(null);
          }
        }}
      />
    </>
  );
};

export default MetersModal;
