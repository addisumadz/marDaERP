"use client";
import { useState, memo } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import Upload from "@mui/icons-material/Upload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplayIcon from "@mui/icons-material/Replay";
import TimelineIcon from "@mui/icons-material/Timeline";
import FunctionsIcon from "@mui/icons-material/Functions";
import BoltIcon from "@mui/icons-material/Bolt";

/**
 * CustomersWithoutReadingToolbar — Top toolbar for the "Customers Without Reading" table.
 * Import/Export Excel, selection management, bulk strategy preview & direct server apply buttons.
 */
const CustomersWithoutReadingToolbar = memo(function CustomersWithoutReadingToolbar({
  table,
  fileInputRef,
  onClickImportExcel,
  importingExcel,
  onExportExcel,
  onExportSelectedExcel,
  onBulkStrategy,
  onDirectBulkStrategy,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openSelectionMenu = Boolean(anchorEl);

  const hasSelection = Object.keys(table.getState().rowSelection || {}).length > 0;

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: "4px" }}>
      {/* Top Row: Primary Actions */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        {/* Import/Export Group */}
        <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
          {/*
          <Button
            size="small"
            variant="outlined"
            startIcon={<Upload />}
            onClick={onClickImportExcel}
            disabled={importingExcel}
          >
            {importingExcel ? <CircularProgress size={16} /> : "Import Excel"}
          </Button>
          */}
          <Button size="small" variant="outlined" onClick={onExportExcel}>
            Export Excel
          </Button>
        </Box>

        {/* Selection Dropdown */}
        <Button
          size="small"
          variant="outlined"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          endIcon={<MoreVertIcon />}
        >
          Selection Options
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={openSelectionMenu}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => { setAnchorEl(null); selectVisible(); }}>
            Select All (Visible)
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); selectFiltered(); }}>
            Select All (Filtered)
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
              onExportSelectedExcel(selectedRows);
            }}
            disabled={!hasSelection}
          >
            Export Selected
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => { setAnchorEl(null); clearSel(); }}
            disabled={!hasSelection}
          >
            Clear Selection
          </MenuItem>
        </Menu>

        {hasSelection && (
          <Typography variant="body2" color="primary" sx={{ ml: 1, fontWeight: "bold" }}>
            {Object.keys(table.getState().rowSelection).length} Selected
          </Typography>
        )}
      </Box>

      {/* Bottom Row: Bulk Actions (Only visible when selection exists) */}
      {hasSelection && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
            bgcolor: "primary.light",
            p: 1,
            borderRadius: 1,
            opacity: 0.95,
          }}
        >
          {/* Group 1: Preview Mode */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ color: "white", fontWeight: "bold", textTransform: "uppercase" }}>
              Preview Mode:
            </Typography>
            <Tooltip title="Preview & edit repeat previous reading before saving">
              <Button
                size="small"
                variant="contained"
                color="inherit"
                sx={{ color: "primary.main", bgcolor: "white", "&:hover": { bgcolor: "grey.100" } }}
                onClick={() => onBulkStrategy("repeat", table)}
                startIcon={<ReplayIcon />}
              >
                Repeat Previous
              </Button>
            </Tooltip>
            <Tooltip title="Preview & edit last month's consumption reading before saving">
              <Button
                size="small"
                variant="contained"
                color="inherit"
                sx={{ color: "primary.main", bgcolor: "white", "&:hover": { bgcolor: "grey.100" } }}
                onClick={() => onBulkStrategy("lastMonth", table)}
                startIcon={<TimelineIcon />}
              >
                Last Month
              </Button>
            </Tooltip>
            <Tooltip title="Preview & edit average consumption reading before saving">
              <Button
                size="small"
                variant="contained"
                color="inherit"
                sx={{ color: "primary.main", bgcolor: "white", "&:hover": { bgcolor: "grey.100" } }}
                onClick={() => onBulkStrategy("average", table)}
                startIcon={<FunctionsIcon />}
              >
                Average
              </Button>
            </Tooltip>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ bgcolor: "rgba(255,255,255,0.4)" }} />

          {/* Group 2: Direct Server Apply (Fast) */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Typography variant="caption" sx={{ color: "#fff3bf", fontWeight: "bold", textTransform: "uppercase" }}>
              ⚡ Direct Server Apply (Fast):
            </Typography>
            <Tooltip title="Directly record Repeat Previous on server asynchronously without preview">
              <Button
                size="small"
                variant="contained"
                sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                onClick={() => onDirectBulkStrategy && onDirectBulkStrategy("repeat", table)}
                startIcon={<BoltIcon />}
              >
                Direct Repeat
              </Button>
            </Tooltip>
            <Tooltip title="Directly record Last Month's Consumption on server asynchronously without preview">
              <Button
                size="small"
                variant="contained"
                sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                onClick={() => onDirectBulkStrategy && onDirectBulkStrategy("lastMonth", table)}
                startIcon={<BoltIcon />}
              >
                Direct Last Month
              </Button>
            </Tooltip>
            <Tooltip title="Directly record Average Consumption on server asynchronously without preview">
              <Button
                size="small"
                variant="contained"
                sx={{ color: "#1a202c", bgcolor: "#ffd166", fontWeight: "bold", "&:hover": { bgcolor: "#f6c343" } }}
                onClick={() => onDirectBulkStrategy && onDirectBulkStrategy("average", table)}
                startIcon={<BoltIcon />}
              >
                Direct Average
              </Button>
            </Tooltip>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default CustomersWithoutReadingToolbar;

