"use client";
import { Box, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
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
  const hasActiveFilters =
    selectedCustomerTypeId ||
    selectedKebeleId ||
    selectedKetenaId ||
    selectedBranchId ||
    selectedReaderId ||
    filterOldPenalty ||
    filterRegistrationDateFrom ||
    filterRegistrationDateTo ||
    filterHasPrepaid ||
    filterMeterChanged ||
    filterHasDryWaste ||
    filterHasAdditionalPayment;

  return (
    <>
      {/* First Row of Filters */}
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        {/* Customer Type Filter */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
            {isCustomerTypesLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : customerTypes?.length > 0 ? (
              customerTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name || `Type ${type.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No types found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Kebele Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
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
            {isKebelesLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : kebeles?.length > 0 ? (
              kebeles.map((kebele) => (
                <MenuItem key={kebele.id} value={kebele.id}>
                  {kebele.name || `Kebele ${kebele.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No kebeles found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Ketena Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={!selectedKebeleId}>
          <InputLabel>Ketena</InputLabel>
          <Select
            value={selectedKetenaId}
            label="Ketena"
            onChange={(e) => onFilterChange("selectedKetenaId", e.target.value)}
            disabled={isKetenasLoading || !selectedKebeleId}
          >
            <MenuItem value="">
              <em>All Ketenas</em>
            </MenuItem>
            {isKetenasLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : ketenas?.length > 0 ? (
              ketenas.map((ketena) => (
                <MenuItem key={ketena.id} value={ketena.id}>
                  {ketena.name || `Ketena ${ketena.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No ketenas found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Branch Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
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
            {isBranchesLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : branches?.length > 0 ? (
              branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name || `Branch ${branch.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No branches found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Reader Filter */}
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={!selectedBranchId}>
          <InputLabel>Assigned Reader</InputLabel>
          <Select
            value={selectedReaderId}
            label="Assigned Reader"
            onChange={(e) => onFilterChange("selectedReaderId", e.target.value)}
            disabled={isReadersLoading || !selectedBranchId}
          >
            <MenuItem value="">
              <em>All Readers</em>
            </MenuItem>
            {isReadersLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : readers?.length > 0 ? (
              readers.map((reader) => (
                <MenuItem key={reader.id} value={reader.id}>
                  {reader.name || `Reader ${reader.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No readers found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Scope selector */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Scope</InputLabel>
          <Select
            value={assignScope}
            label="Scope"
            onChange={(e) => onAssignScopeChange(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            <MenuItem value="visible">Select All (visible)</MenuItem>
            <MenuItem value="all">Select All (filtered)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Second Row of Filters */}
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        {/* Old Penalty */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
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

        {/* Prepaid Balance */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Prepaid Balance</InputLabel>
          <Select
            value={filterHasPrepaid}
            label="Prepaid Balance"
            onChange={(e) => onFilterChange("filterHasPrepaid", e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="true">Has Prepaid</MenuItem>
            <MenuItem value="false">No Prepaid</MenuItem>
          </Select>
        </FormControl>

        {/* Meter Changed */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Meter Changed</InputLabel>
          <Select
            value={filterMeterChanged}
            label="Meter Changed"
            onChange={(e) => onFilterChange("filterMeterChanged", e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="true">Meter Changed</MenuItem>
            <MenuItem value="false">Meter Not Changed</MenuItem>
          </Select>
        </FormControl>

        {/* Dry Waste Payment */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Dry Waste Payment</InputLabel>
          <Select
            value={filterHasDryWaste}
            label="Dry Waste Payment"
            onChange={(e) => onFilterChange("filterHasDryWaste", e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="true">Has Dry Waste</MenuItem>
            <MenuItem value="false">No Dry Waste</MenuItem>
          </Select>
        </FormControl>

        {/* Additional Payment */}
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Additional Payment</InputLabel>
          <Select
            value={filterHasAdditionalPayment}
            label="Additional Payment"
            onChange={(e) => onFilterChange("filterHasAdditionalPayment", e.target.value)}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="true">Has Additional Payment</MenuItem>
            <MenuItem value="false">No Additional Payment</MenuItem>
          </Select>
        </FormControl>

        {/* Ethiopian Date Range Filters */}
        <EtDatePicker
          label="Registration From (Ethiopian)"
          value={formatEthiopianDateForPicker(filterRegistrationDateFrom)}
          onChange={(date) => onFilterChange("filterRegistrationDateFrom", date || "")}
          size="small"
          sx={{ minWidth: 180 }}
          placeholder="dd/MM/yyyy"
        />
        <EtDatePicker
          label="Registration To (Ethiopian)"
          value={formatEthiopianDateForPicker(filterRegistrationDateTo)}
          onChange={(date) => onFilterChange("filterRegistrationDateTo", date || "")}
          size="small"
          sx={{ minWidth: 180 }}
          placeholder="dd/MM/yyyy"
        />

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            size="small"
            onClick={onClearAll}
            sx={{ ml: "auto" }}
          >
            Clear All Filters
          </Button>
        )}
      </Box>
    </>
  );
};

export default CustomerFilters;
