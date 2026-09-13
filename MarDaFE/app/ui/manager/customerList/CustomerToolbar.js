"use client";
import { useState } from "react";
import { Box, Button, Menu, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";

const CustomerToolbar = ({
  onCreate,
  onImportClick,
  onUpdateClick,
  onUpdateReaderOpen,
  onUpdateGpsOpen,
  onRefresh,
  onExportExcel,
  isFetching,
  selectedCustomerId,
  onOpenMeters,
  onOpenAssignReader,
  onOpenBulkPayment,
  onOpenBulkTechemari,
  canUpdateDryWaste,
  fileInputRef,
  updateFileInputRef,
  handleFileUpload,
  handleUpdateFileUpload,
}) => {
  const [bulkActionsAnchorEl, setBulkActionsAnchorEl] = useState(null);
  const [dataActionsAnchorEl, setDataActionsAnchorEl] = useState(null);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        p: "4px",
      }}
    >
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={onCreate}
        >
          Create
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls"
          style={{ display: "none" }}
        />
        <input
          type="file"
          ref={updateFileInputRef}
          onChange={handleUpdateFileUpload}
          accept=".xlsx,.xls"
          style={{ display: "none" }}
        />

        <Button
          variant="outlined"
          size="small"
          onClick={(e) => setDataActionsAnchorEl(e.currentTarget)}
        >
          Data
        </Button>
        <Menu
          anchorEl={dataActionsAnchorEl}
          open={Boolean(dataActionsAnchorEl)}
          onClose={() => setDataActionsAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              onImportClick();
              setDataActionsAnchorEl(null);
            }}
          >
            Import Customers
          </MenuItem>
          <MenuItem
            onClick={() => {
              onUpdateClick();
              setDataActionsAnchorEl(null);
            }}
          >
            Update Customers
          </MenuItem>
          <MenuItem
            onClick={() => {
              onUpdateReaderOpen();
              setDataActionsAnchorEl(null);
            }}
          >
            Update Customer Reader
          </MenuItem>
          <MenuItem
            onClick={() => {
              onUpdateGpsOpen();
              setDataActionsAnchorEl(null);
            }}
          >
            Update GPS
          </MenuItem>
          <MenuItem
            onClick={() => {
              onExportExcel();
              setDataActionsAnchorEl(null);
            }}
          >
            <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
            Export to Excel
          </MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onRefresh}
          disabled={isFetching}
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={(e) => setBulkActionsAnchorEl(e.currentTarget)}
        >
          Bulk Actions
        </Button>
        <Menu
          anchorEl={bulkActionsAnchorEl}
          open={Boolean(bulkActionsAnchorEl)}
          onClose={() => setBulkActionsAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              onOpenAssignReader();
              setBulkActionsAnchorEl(null);
            }}
          >
            Assign Reader
          </MenuItem>
          <MenuItem
            onClick={() => {
              onOpenBulkPayment();
              setBulkActionsAnchorEl(null);
            }}
            disabled={!canUpdateDryWaste}
          >
            Update Dry Waste
          </MenuItem>
          <MenuItem
            onClick={() => {
              onOpenBulkTechemari();
              setBulkActionsAnchorEl(null);
            }}
            disabled={!canUpdateDryWaste}
          >
            Update Additional Fee
          </MenuItem>
        </Menu>

        <Button
          variant="outlined"
          size="small"
          onClick={onOpenMeters}
          disabled={!selectedCustomerId}
        >
          Meters
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerToolbar;
