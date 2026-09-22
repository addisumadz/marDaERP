"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Tooltip,
  IconButton,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import PersonPinIcon from "@mui/icons-material/PersonPin";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import RefreshIcon from "@mui/icons-material/Refresh";
import SpeedIcon from "@mui/icons-material/Speed";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import PaymentsIcon from "@mui/icons-material/Payments";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import LayersIcon from "@mui/icons-material/Layers";

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
  selectedCount = 0,
  onClearSelection,
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
        flexWrap: "wrap",
        gap: 1.5,
        p: 1,
        borderRadius: 1,
      }}
    >
      {/* Hidden File Inputs */}
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

      {/* Left Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          size="small"
          onClick={onCreate}
          sx={{
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
            px: 2,
          }}
        >
          New Customer
        </Button>

        {/* Data Management Operations Menu */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<LayersIcon />}
          onClick={(e) => setDataActionsAnchorEl(e.currentTarget)}
          sx={{ textTransform: "none", fontWeight: 500 }}
        >
          Data Operations
        </Button>
        <Menu
          anchorEl={dataActionsAnchorEl}
          open={Boolean(dataActionsAnchorEl)}
          onClose={() => setDataActionsAnchorEl(null)}
          transformOrigin={{ horizontal: "left", vertical: "top" }}
          anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              onImportClick();
              setDataActionsAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <UploadFileIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText primary="Import Customers (Excel)" secondary="Register new customers in bulk" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onUpdateClick();
              setDataActionsAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <SystemUpdateAltIcon fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Update Customers (Excel)" secondary="Update existing customer details" />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onUpdateReaderOpen();
              setDataActionsAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <PersonPinIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText primary="Update Customer Reader" secondary="Assign readers via Excel sheet" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onUpdateGpsOpen();
              setDataActionsAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <LocationOnIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText primary="Update Customer GPS" secondary="Upload GPS coordinates" />
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              onExportExcel();
              setDataActionsAnchorEl(null);
            }}
          >
            <ListItemIcon>
              <DownloadIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText primary="Export to Excel" secondary="Export current filtered list" />
          </MenuItem>
        </Menu>

        {/* Bulk Operations Menu */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<MoreVertIcon />}
          onClick={(e) => setBulkActionsAnchorEl(e.currentTarget)}
          sx={{ textTransform: "none", fontWeight: 500 }}
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
            <ListItemIcon>
              <AssignmentIndIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Assign Mobile Reader"
              secondary={selectedCount > 0 ? `Apply to ${selectedCount} selected` : "Apply to selected/scope"}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onOpenBulkPayment();
              setBulkActionsAnchorEl(null);
            }}
            disabled={!canUpdateDryWaste}
          >
            <ListItemIcon>
              <CleaningServicesIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText
              primary="Update Dry Waste Fee"
              secondary={canUpdateDryWaste ? "Set monthly dry waste fee" : "Select rows or scope first"}
            />
          </MenuItem>
          <MenuItem
            onClick={() => {
              onOpenBulkTechemari();
              setBulkActionsAnchorEl(null);
            }}
            disabled={!canUpdateDryWaste}
          >
            <ListItemIcon>
              <PaymentsIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText
              primary="Update Additional Fee (Techemari)"
              secondary={canUpdateDryWaste ? "Set custom fee name & amount" : "Select rows or scope first"}
            />
          </MenuItem>
        </Menu>

        {/* Selection Badge & Clear */}
        {selectedCount > 0 && (
          <Chip
            color="primary"
            variant="outlined"
            size="small"
            label={`${selectedCount} Selected`}
            onDelete={onClearSelection}
            deleteIcon={<DeleteSweepIcon fontSize="small" />}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>

      {/* Right Action Buttons */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Tooltip
          title={
            selectedCustomerId
              ? "View and manage meter records for selected customer"
              : "Select exactly 1 customer row below to manage meters"
          }
        >
          <span>
            <Button
              variant={selectedCustomerId ? "contained" : "outlined"}
              color="info"
              size="small"
              startIcon={<SpeedIcon />}
              onClick={onOpenMeters}
              disabled={!selectedCustomerId}
              sx={{ textTransform: "none", fontWeight: 500 }}
            >
              Meters
            </Button>
          </span>
        </Tooltip>

        <Tooltip title="Export current filtered view to Excel">
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={onExportExcel}
            sx={{ textTransform: "none" }}
          >
            Export
          </Button>
        </Tooltip>

        <Tooltip title="Refresh Customer Data">
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={isFetching}
            color="primary"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 0.75,
            }}
          >
            <RefreshIcon
              fontSize="small"
              sx={{
                animation: isFetching ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default CustomerToolbar;
