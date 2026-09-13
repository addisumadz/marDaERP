"use client";
import { memo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

/**
 * ReadingToolbar — Top toolbar for the readings table (Table 1).
 * Export, selection, and Generate Bill actions.
 */
const ReadingToolbar = memo(function ReadingToolbar({
  table,
  onExportFiltered,
  onExportSelected,
  onGenerateSelected,
  isGenBusy,
  genProgress,
  genTotal,
  exportReadingsToExcel,
}) {
  const handleGenerateSelected = () => {
    const selected = table.getSelectedRowModel().rows;
    const ids = selected.map((r) => r.original.id).filter((v) => v != null);
    if (ids.length === 0) {
      // Will be caught by parent toast
      onGenerateSelected([]);
      return;
    }
    onGenerateSelected(ids);
  };

  const selectVisible = () => {
    const next = {};
    table.getRowModel().rows.forEach((r) => { next[r.id] = true; });
    table.setRowSelection(next);
  };

  const selectFiltered = () => {
    const next = {};
    table.getFilteredRowModel().rows.forEach((r) => { next[r.id] = true; });
    table.setRowSelection(next);
  };

  const clearSel = () => table.setRowSelection({});

  const handleExportFilteredClick = () => {
    const rows = table.getFilteredRowModel().rows;
    const data = rows.map((r) => r.original);
    exportReadingsToExcel(data, "Filtered_Readings");
  };

  const handleExportSelectedClick = () => {
    const allRows = table.getPrePaginationRowModel().rows;
    const selectedSortedRows = allRows.filter((row) => row.getIsSelected());
    const data = selectedSortedRows.map((r) => r.original);
    if (data.length === 0) {
      onGenerateSelected([]); // triggers toast
      return;
    }
    exportReadingsToExcel(data, "Selected_Readings");
  };

  return (
    <Box sx={{ display: "flex", gap: 1, p: "4px", alignItems: "center", flexWrap: "wrap" }}>
      <Button size="small" variant="contained" color="secondary" onClick={handleExportFilteredClick}>
        Export Filtered
      </Button>
      <Button size="small" variant="contained" color="primary" onClick={handleExportSelectedClick}>
        Export Selected
      </Button>
      <Button size="small" variant="outlined" onClick={selectVisible}>
        Select All (visible)
      </Button>
      <Button size="small" variant="outlined" onClick={selectFiltered}>
        Select All (filtered)
      </Button>
      <Button size="small" onClick={clearSel}>
        Clear
      </Button>
      <Button
        color="success"
        variant="contained"
        onClick={handleGenerateSelected}
        disabled={isGenBusy}
      >
        {isGenBusy ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} color="inherit" />
            <span>Processing...</span>
          </Box>
        ) : (
          "Generate Bill for Selected"
        )}
      </Button>
    </Box>
  );
});

export default ReadingToolbar;
