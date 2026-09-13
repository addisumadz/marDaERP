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
import { useQuery } from "@tanstack/react-query";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
// Read-only modal: no edit/delete/add icons
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
  // Read-only: no local edit form state

  const { data: meterTypes = [] } = useQuery({
    queryKey: ["meter-types"],
    queryFn: () => dropdownService.getMeterTypes?.() || Promise.resolve([]),
    enabled: open,
    staleTime: Infinity,
  });

  // meterSizes are provided by parent page to avoid duplicate fetching

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

  // Read-only: no create/update/delete mutations

  useEffect(() => {
    // No-op for read-only
  }, [open]);

  // Read-only: no edit state sync

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
  
  // Read-only: no selected meter for editing

  const table = useMaterialReactTable({
    columns,
    data: meters || [],
    state: { isLoading: isLoading, showProgressBars: isFetching },
    enableRowActions: false,
  });

  // Read-only: no submit handler

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

        {/* Read-only: editing/creation form removed */}
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
