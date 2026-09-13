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
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { CustomerService } from "../../../lib/customerService";
import { DropdownService } from "../../../lib/dropdownService";

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 1.5,
      borderBottom: "1px solid #eee",
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
      {label}:
    </Typography>
    <Typography variant="body1" align="right">
      {value || "—"}
    </Typography>
  </Box>
);

const customerService = new CustomerService();
const dropdownService = new DropdownService();

const MetersModal = ({ open, onClose, customerId, meterSizes = [] }) => {
  const [editingMeter, setEditingMeter] = useState(null); // null=create, object=edit
  const [form, setForm] = useState({
    meterNumber: "",
    activeMeter: true,
    billingMeterTypeId: "",
    meterSizeId: "",
    initialReading: 0,
    maxReference: 10000,
  });

  const { data: meterTypes = [] } = useQuery({
    queryKey: ["meter-types"],
    queryFn: () => dropdownService.getMeterTypes?.() || Promise.resolve([]),
    enabled: open,
    staleTime: Infinity,
  });

  // meterSizes are provided by parent page to avoid duplicate fetching
  
  // Get selected meter size details
  const selectedMeterSize = useMemo(() => {
    return (meterSizes || []).find(ms => ms.id === form.meterSizeId) || {};
  }, [form.meterSizeId, meterSizes]);

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

  // Fetch customer details to show meter information from customer table
  const { data: customer, isLoading: isCustomerLoading } = useQuery({
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
        activeMeter: !!editingMeter.activeMeter,
        billingMeterTypeId: editingMeter.billingMeterTypeId || "",
        meterSizeId: editingMeter.meterSizeId || "",
        initialReading: editingMeter.initialReading ?? 0,
        maxReference: editingMeter.maxReference ?? 10000,
      });
    }
  }, [editingMeter]);

  const columns = useMemo(
    () => [
      { header: "#", size: 20, Cell: ({ row }) => row.index + 1 },
      { 
        accessorKey: "meterNumber", 
        header: "Meter Number",
        Cell: ({ row }) => (
          <Box>
            <div>{row.original.meterNumber || 'N/A'}</div>
            {row.original.description && (
              <Typography variant="caption" color="textSecondary">
                {row.original.description}
              </Typography>
            )}
          </Box>
        )
      },
      { 
        accessorKey: "activeMeter", 
        header: "Active", 
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No") 
      },
      {
        accessorKey: "meterSizeId",
        header: "Meter Size",
        Cell: ({ row }) => {
          const meterSize = meterSizes.find(ms => ms.id === row.original.meterSizeId);
          return meterSize ? (meterSize.sizeName || meterSize.name || 'N/A') : 'N/A';
        }
      },
      { 
        accessorKey: "initialReading", 
        header: "Initial Reading",
        Cell: ({ cell }) => cell.getValue()
      },
      { 
        accessorKey: "maxReference", 
        header: "Max Reference",
        Cell: ({ cell }) => cell.getValue()
      },
    ],
    [meterSizes]
  );
  
  // Get the currently selected meter details
  const selectedMeter = useMemo(() => {
    if (!editingMeter?.id) return null;
    return meters.find(m => m.id === editingMeter.id);
  }, [editingMeter, meters]);

  const table = useMaterialReactTable({
    columns,
    data: meters || [],
    state: { isLoading: isLoading, showProgressBars: isFetching },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setEditingMeter({})}
        >
          Add Meter
        </Button>
      </Box>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => setEditingMeter(row.original)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            color="error"
            onClick={async () => {
              await deleteMeter(row.original.id);
            }}
            disabled={isDeleting}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      meterNumber: form.meterNumber,
      activeMeter: !!form.activeMeter,
      billingMeterTypeId: form.billingMeterTypeId || null,
      meterSizeId: form.meterSizeId || null,
      initialReading: Number(form.initialReading) || 0,
      maxReference: Number(form.maxReference) || 0,
    };

    if (editingMeter && editingMeter.id) {
      await updateMeter({ meterId: editingMeter.id, data: payload });
    } else {
      await createMeter({ customerId, data: payload });
    }
    setEditingMeter(null);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Customer Meters</DialogTitle>
      <DialogContent>
        <Paper sx={{ p: 1, mb: 2 }}>
          <MaterialReactTable table={table} />
        </Paper>
        
        {/* Customer Meter Information from Customer Table */}
        {customer && !isCustomerLoading && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Meter Information From Customer</Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <DetailItem label="Meter Number" value={customer.meterNumber} />
              <DetailItem label="Meter Size" value={meterSizes.find(ms => ms.id === customer.meterSizeId)?.name || customer.meterSize} />
              <DetailItem label="Initial Reading" value={customer.initialReading} />
              <DetailItem
                label="Previous Reading From Meter"
                value={(() => {
                  const val =
                    customer.isInitializedSecondTime ??
                    customer.IsInitializedSecondTime ??
                    customer.initializedSecondTime ??
                    customer.isInitialized2ndTime;
                  return typeof val === "boolean" ? String(val) : val ?? "";
                })()}
              />
              <DetailItem label="Max Consumption" value={customer.maxReference} />
              <DetailItem label="Location Coordination" value={customer.locationCoordination} />
            </Paper>
          </Box>
        )}

        {editingMeter !== null && (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {editingMeter.id ? "Edit Meter" : "Add Meter"}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Meter Number"
                  fullWidth
                  value={form.meterNumber}
                  onChange={(e) => setForm((f) => ({ ...f, meterNumber: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="meter-size">Meter Size</InputLabel>
                  <Select
                    labelId="meter-size"
                    label="Meter Size"
                    value={form.meterSizeId}
                    onChange={(e) => setForm((f) => ({ ...f, meterSizeId: e.target.value }))}
                  >
                    {meterSizes.map((ms) => (
                      <MenuItem key={ms.id} value={ms.id}>{ms.name || ms.sizeName || ms.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Meter Type field is now hidden but still sent with the form */}
              <input type="hidden" name="billingMeterTypeId" value={form.billingMeterTypeId} />
              
              {/* Show selected meter size details */}
              {selectedMeterSize && (
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Meter Size Details"
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    value={selectedMeterSize.sizeName || selectedMeterSize.name || ''}
                    helperText={`Type: ${selectedMeterSize.meterTypeName || 'N/A'}`}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Initial Reading"
                  type="number"
                  fullWidth
                  value={form.initialReading}
                  onChange={(e) => setForm((f) => ({ ...f, initialReading: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Max Reference"
                  type="number"
                  fullWidth
                  value={form.maxReference}
                  onChange={(e) => setForm((f) => ({ ...f, maxReference: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!form.activeMeter}
                      onChange={(e) => setForm((f) => ({ ...f, activeMeter: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button onClick={() => setEditingMeter(null)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isCreating || isUpdating}>
                {editingMeter?.id ? "Update" : "Create"}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MetersModal;
