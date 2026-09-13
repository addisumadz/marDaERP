"use client";
import { useMemo } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  LinearProgress,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

/**
 * BulkPreviewDialog — Shows the bulk reading preview with editable proposed values,
 * plus missing accounts and negative consumption sub-tables.
 */
const BulkPreviewDialog = ({
  open,
  onClose,
  bulkStrategy,
  bulkComputing,
  bulkSaving,
  bulkProcessed,
  bulkItems,
  onBulkItemsChange,
  onSaveAll,
  missingExcelAccounts,
  negativeExcelItems,
}) => {
  // Update a single bulk item's proposed reading
  const updateBulkItem = (index, newProposed) => {
    onBulkItemsChange((arr) => {
      const copy = [...arr];
      const it = { ...copy[index] };
      const prev = Number(it.previousReading || 0);
      const val = Number(newProposed);
      if (!Number.isFinite(val)) return copy;
      if (val - prev < 0) return copy;
      it.proposedLastReading = val;
      it.consumption = val - prev;
      copy[index] = it;
      return copy;
    });
  };

  // Main bulk table
  const bulkColumns = useMemo(() => [
    { accessorKey: "accountNumber", header: "Account", enableEditing: false },
    { accessorKey: "customerName", header: "Customer", enableEditing: false },
    { accessorKey: "kifyaWer", header: "Kifya Wer", enableEditing: false },
    { accessorKey: "previousReading", header: "Previous", enableEditing: false },
    {
      accessorKey: "proposedLastReading",
      header: "Proposed",
      muiEditTextFieldProps: ({ row }) => ({
        type: "number",
        inputProps: { min: row.original.previousReading },
        onBlur: (e) => updateBulkItem(row.index, e.target.value),
      }),
    },
    {
      id: "consumption",
      header: "Consumption",
      accessorFn: (row) => Number(row.proposedLastReading) - Number(row.previousReading),
      enableEditing: false,
    },
    {
      id: "actions",
      header: "",
      enableEditing: false,
      Cell: ({ row }) => (
        <IconButton
          size="small"
          color="error"
          onClick={() => onBulkItemsChange((arr) => arr.filter((_, i) => i !== row.index))}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      ),
    },
  ], [onBulkItemsChange]);

  const tableBulk = useMaterialReactTable({
    columns: bulkColumns,
    data: bulkItems,
    enableEditing: true,
    editDisplayMode: "cell",
    enableRowSelection: true,
    enableColumnResizing: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      density: "compact",
      columnSizing: {
        accountNumber: 143,
        customerName: 234,
        kifyaWer: 156,
        previousReading: 117,
        proposedLastReading: 143,
        consumption: 117,
      },
    },
    muiTableProps: { size: "small" },
    muiTableHeadCellProps: { sx: { py: 0.5, px: 1 } },
    muiTableBodyCellProps: { sx: { py: 0.25, px: 1 } },
  });

  // Missing accounts table
  const missingColumns = useMemo(() => [
    { accessorKey: "accountNumber", header: "Account" },
    { accessorKey: "currentReading", header: "Reading" },
    { accessorKey: "reason", header: "Reason" },
  ], []);

  const tableMissing = useMaterialReactTable({
    columns: missingColumns,
    data: missingExcelAccounts || [],
    enablePagination: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 }, density: "compact" },
    muiTableProps: { size: "small" },
    muiTableHeadCellProps: { sx: { py: 0.5, px: 1 } },
    muiTableBodyCellProps: { sx: { py: 0.25, px: 1 } },
  });

  // Negative consumption table
  const negativeColumns = useMemo(() => [
    { accessorKey: "accountNumber", header: "Account" },
    { accessorKey: "customerName", header: "Customer" },
    { accessorKey: "previousReading", header: "Previous" },
    { accessorKey: "proposedLastReading", header: "Proposed" },
    { accessorKey: "consumption", header: "Consumption" },
  ], []);

  const tableNegative = useMaterialReactTable({
    columns: negativeColumns,
    data: negativeExcelItems || [],
    enablePagination: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 }, density: "compact" },
    muiTableProps: { size: "small" },
    muiTableHeadCellProps: { sx: { py: 0.5, px: 1 } },
    muiTableBodyCellProps: { sx: { py: 0.25, px: 1 } },
  });

  const strategyLabel =
    bulkStrategy === "repeat" ? "Repeat" :
    bulkStrategy === "lastMonth" ? "Last Month" :
    bulkStrategy === "excel" ? "From Excel" : "Average";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Bulk Apply ({strategyLabel})</DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        {bulkSaving && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Saving {bulkProcessed} / {bulkItems.length}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={bulkItems.length > 0 ? (bulkProcessed / bulkItems.length) * 100 : 0}
            />
          </Box>
        )}
        {bulkComputing ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={24} />
            <Typography>Computing preview...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Items: {bulkItems.length}
            </Typography>
            <MaterialReactTable table={tableBulk} />
            {(missingExcelAccounts || []).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Missing Accounts: {missingExcelAccounts.length}
                </Typography>
                <MaterialReactTable table={tableMissing} />
              </Box>
            )}
            {(negativeExcelItems || []).length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Negative Consumption (excluded): {negativeExcelItems.length}
                </Typography>
                <MaterialReactTable table={tableNegative} />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={bulkSaving}>Close</Button>
        <Button
          variant="contained"
          onClick={onSaveAll}
          disabled={bulkComputing || bulkSaving || bulkItems.length === 0}
        >
          {bulkSaving ? <CircularProgress size={20} /> : "Save All"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkPreviewDialog;
