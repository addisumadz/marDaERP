"use client";
import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Collapse,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EtDatePicker from "mui-ethiopian-datepicker";

const CustomerFilters = ({
  // Filter values
  selectedCustomerTypeId,
  selectedKebeleId,
  selectedKetenaId,
  selectedBranchId,
  selectedReaderId,
  filterOldPenalty,
  filterRegistrationDateFrom,
  filterRegistrationDateTo,
  filterHasPrepaid,
  filterMeterChanged,
  filterHasDryWaste,
  filterHasAdditionalPayment,
  assignScope,
  // Callbacks
  onFilterChange,
  onClearAll,
  onAssignScopeChange,
  // Lookup data
  customerTypes = [],
  kebeles = [],
  ketenas = [],
  branches = [],
  readers = [],
  // Loading states
  isCustomerTypesLoading,
  isKebelesLoading,
  isKetenasLoading,
  isBranchesLoading,
  isReadersLoading,
  // Helper
  formatEthiopianDateForPicker,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Compute active filters count
  const activeFiltersCount = [
    selectedCustomerTypeId,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
    filterOldPenalty,
    filterRegistrationDateFrom,
    filterRegistrationDateTo,
    filterHasPrepaid,
    filterMeterChanged,
    filterHasDryWaste,
    filterHasAdditionalPayment,
  ].filter(Boolean).length;

  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Primary Filters Row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          alignItems: "center",
        }}
      >
        {/* Customer Type Filter */}
        <FormControl size="small" sx={{ minWidth: 170, flex: "1 1 160px" }}>
          <InputLabel>Customer Type</InputLabel>
          <Select
            value={selectedCustomerTypeId}
            label="Customer Type"
            onChange={(e) => onFilterChange("selectedCustomerTypeId", e.target.value)}
            disabled={isCustomerTypesLoading}
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {customerTypes?.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.name || `Type ${type.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Kebele Filter */}
        <FormControl size="small" sx={{ minWidth: 160, flex: "1 1 150px" }}>
          <InputLabel>Kebele</InputLabel>
          <Select
            value={selectedKebeleId}
            label="Kebele"
            onChange={(e) => {
              onFilterChange("selectedKebeleId", e.target.value);
              onFilterChange("selectedKetenaId", "");
            }}
            disabled={isKebelesLoading}
          >
            <MenuItem value="">
              <em>All Kebeles</em>
            </MenuItem>
            {kebeles?.map((kebele) => (
              <MenuItem key={kebele.id} value={kebele.id}>
                {kebele.name || `Kebele ${kebele.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ketena Filter */}
        <FormControl
          size="small"
          sx={{ minWidth: 160, flex: "1 1 150px" }}
          disabled={!selectedKebeleId || isKetenasLoading}
        >
          <InputLabel>Ketena</InputLabel>
          <Select
            value={selectedKetenaId}
            label="Ketena"
            onChange={(e) => onFilterChange("selectedKetenaId", e.target.value)}
          >
            <MenuItem value="">
              <em>All Ketenas</em>
            </MenuItem>
            {ketenas?.map((ketena) => (
              <MenuItem key={ketena.id} value={ketena.id}>
                {ketena.name || `Ketena ${ketena.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Branch Filter */}
        <FormControl size="small" sx={{ minWidth: 160, flex: "1 1 150px" }}>
          <InputLabel>Branch</InputLabel>
          <Select
            value={selectedBranchId}
            label="Branch"
            onChange={(e) => {
              onFilterChange("selectedBranchId", e.target.value);
              onFilterChange("selectedReaderId", "");
            }}
            disabled={isBranchesLoading}
          >
            <MenuItem value="">
              <em>All Branches</em>
            </MenuItem>
            {branches?.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name || `Branch ${branch.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reader Filter */}
        <FormControl
          size="small"
          sx={{ minWidth: 170, flex: "1 1 160px" }}
          disabled={!selectedBranchId || isReadersLoading}
        >
          <InputLabel>Assigned Reader</InputLabel>
          <Select
            value={selectedReaderId}
            label="Assigned Reader"
            onChange={(e) => onFilterChange("selectedReaderId", e.target.value)}
          >
            <MenuItem value="">
              <em>All Readers</em>
            </MenuItem>
            {readers?.map((reader) => (
              <MenuItem key={reader.id} value={reader.id}>
                {reader.name || `Reader ${reader.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Scope selector */}
        <FormControl size="small" sx={{ minWidth: 150, flex: "1 1 140px" }}>
          <InputLabel>Scope</InputLabel>
          <Select
            value={assignScope}
            label="Scope"
            onChange={(e) => onAssignScopeChange(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="visible">Select All Visible</MenuItem>
            <MenuItem value="all">Select All Filtered</MenuItem>
          </Select>
        </FormControl>

        {/* Toggle Advanced Filters Button */}
        <Button
          variant="outlined"
          size="small"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          startIcon={<FilterListIcon />}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {advancedOpen ? "Fewer Filters" : "More Filters"}
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              color="primary"
              sx={{ ml: 0.75, height: 20, fontSize: "0.75rem" }}
            />
          )}
        </Button>

        {/* Clear All Filters Button */}
        {activeFiltersCount > 0 && (
          <Tooltip title="Reset all active filters">
            <Button
              variant="text"
              color="error"
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={onClearAll}
              sx={{ textTransform: "none" }}
            >
              Clear All
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Advanced Filters (Collapsible Drawer) */}
      <Collapse in={advancedOpen} timeout="auto" unmountOnExit>
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px dashed",
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            gap: 1.5,
            alignItems: "center",
          }}
        >
          {/* Old Penalty Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: "1 1 140px" }}>
            <InputLabel>Old Penalty</InputLabel>
            <Select
              value={filterOldPenalty}
              label="Old Penalty"
              onChange={(e) => onFilterChange("filterOldPenalty", e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Has Old Penalty</MenuItem>
              <MenuItem value="false">No Old Penalty</MenuItem>
            </Select>
          </FormControl>

          {/* Prepaid Balance Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: "1 1 140px" }}>
            <InputLabel>Prepaid Balance</InputLabel>
            <Select
              value={filterHasPrepaid}
              label="Prepaid Balance"
              onChange={(e) => onFilterChange("filterHasPrepaid", e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Has Prepaid (&gt;0)</MenuItem>
              <MenuItem value="false">No Prepaid (&lt;=0)</MenuItem>
            </Select>
          </FormControl>

          {/* Meter Changed Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: "1 1 140px" }}>
            <InputLabel>Meter Status</InputLabel>
            <Select
              value={filterMeterChanged}
              label="Meter Status"
              onChange={(e) => onFilterChange("filterMeterChanged", e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Meter Replaced/Changed</MenuItem>
              <MenuItem value="false">Original Meter</MenuItem>
            </Select>
          </FormControl>

          {/* Dry Waste Payment Filter */}
          <FormControl size="small" sx={{ minWidth: 150, flex: "1 1 140px" }}>
            <InputLabel>Dry Waste</InputLabel>
            <Select
              value={filterHasDryWaste}
              label="Dry Waste"
              onChange={(e) => onFilterChange("filterHasDryWaste", e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Has Dry Waste (&gt;0)</MenuItem>
              <MenuItem value="false">No Dry Waste (0)</MenuItem>
            </Select>
          </FormControl>

          {/* Additional Payment Filter */}
          <FormControl size="small" sx={{ minWidth: 160, flex: "1 1 150px" }}>
            <InputLabel>Additional Fee</InputLabel>
            <Select
              value={filterHasAdditionalPayment}
              label="Additional Fee"
              onChange={(e) => onFilterChange("filterHasAdditionalPayment", e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              <MenuItem value="true">Has Fee (&gt;0)</MenuItem>
              <MenuItem value="false">No Additional Fee</MenuItem>
            </Select>
          </FormControl>

          {/* Ethiopian Registration Date From */}
          <Box sx={{ flex: "1 1 170px", minWidth: 170 }}>
            <EtDatePicker
              label="Reg. Date From (EC)"
              value={formatEthiopianDateForPicker(filterRegistrationDateFrom)}
              onChange={(date) => onFilterChange("filterRegistrationDateFrom", date || "")}
              size="small"
              placeholder="dd/MM/yyyy"
            />
          </Box>

          {/* Ethiopian Registration Date To */}
          <Box sx={{ flex: "1 1 170px", minWidth: 170 }}>
            <EtDatePicker
              label="Reg. Date To (EC)"
              value={formatEthiopianDateForPicker(filterRegistrationDateTo)}
              onChange={(date) => onFilterChange("filterRegistrationDateTo", date || "")}
              size="small"
              placeholder="dd/MM/yyyy"
            />
          </Box>
        </Box>

        {/* Quick Filter Chips */}
        <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>
            Quick Presets:
          </Typography>

          <Chip
            label="Has Old Arrears"
            size="small"
            clickable
            color={filterOldPenalty === "true" ? "error" : "default"}
            variant={filterOldPenalty === "true" ? "filled" : "outlined"}
            onClick={() => onFilterChange("filterOldPenalty", filterOldPenalty === "true" ? "" : "true")}
          />

          <Chip
            label="Prepaid Deposit > 0"
            size="small"
            clickable
            color={filterHasPrepaid === "true" ? "success" : "default"}
            variant={filterHasPrepaid === "true" ? "filled" : "outlined"}
            onClick={() => onFilterChange("filterHasPrepaid", filterHasPrepaid === "true" ? "" : "true")}
          />

          <Chip
            label="Meter Replaced"
            size="small"
            clickable
            color={filterMeterChanged === "true" ? "info" : "default"}
            variant={filterMeterChanged === "true" ? "filled" : "outlined"}
            onClick={() => onFilterChange("filterMeterChanged", filterMeterChanged === "true" ? "" : "true")}
          />

          <Chip
            label="Has Dry Waste Fee"
            size="small"
            clickable
            color={filterHasDryWaste === "true" ? "warning" : "default"}
            variant={filterHasDryWaste === "true" ? "filled" : "outlined"}
            onClick={() => onFilterChange("filterHasDryWaste", filterHasDryWaste === "true" ? "" : "true")}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

export default CustomerFilters;
