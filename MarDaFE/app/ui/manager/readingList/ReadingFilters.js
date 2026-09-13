"use client";
import { memo } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  LinearProgress,
} from "@mui/material";

import ProPeriodPicker from "./ProPeriodPicker";

/**
 * ReadingFilters — Month/Year selector + dropdown filters for readings.
 *
 * Props:
 *   selectedKifyaWerMonth, selectedKifyaWerYear — current period
 *   onMonthChange, onYearChange, onPeriodChange — period setters
 *   currentCycleMonth, currentCycleYear — system active billing period
 *   dbPeriods — list of distinct kifya_wer from database
 *   monthOptions (ETH_MONTHS_AM), yearOptions — dropdown data (legacy support)
 *   onFilter — callback to trigger fetch
 *   isFetching — true while loading
 *
 *   selectedCustomerTypeId..selectedReaderId — dropdown filter values
 *   onFilterChange(name, value) — unified handler
 *   onClearAll — reset all dropdown filters
 *
 *   wuzifMonthsOp, wuzifMonthsVal — wuzif filter
 *   onWuzifOpChange, onWuzifValChange
 *
 *   customerTypes, kebeles, ketenas, branches, readers — lookup data
 *   isCustomerTypesLoading..isReadersLoading — loading flags
 *   anyDropdownLoading — aggregated loading flag
 */
const ReadingFilters = memo(function ReadingFilters({
  // Period
  selectedKifyaWerMonth,
  selectedKifyaWerYear,
  onMonthChange,
  onYearChange,
  onPeriodChange,
  currentCycleMonth,
  currentCycleYear,
  dbPeriods = [],
  monthOptions,
  yearOptions,
  onFilter,
  isFetching,
  disablePeriodSelect,

  // Dropdown filters
  selectedCustomerTypeId,
  selectedKebeleId,
  selectedKetenaId,
  selectedBranchId,
  selectedReaderId,
  onFilterChange,
  onClearAll,

  // Wuzif filter
  wuzifMonthsOp,
  wuzifMonthsVal,
  onWuzifOpChange,
  onWuzifValChange,

  // Lookup data
  customerTypes = [],
  kebeles = [],
  ketenas = [],
  branches = [],
  readers = [],

  // Loading flags
  isCustomerTypesLoading,
  isKebelesLoading,
  isKetenasLoading,
  isBranchesLoading,
  isReadersLoading,
  anyDropdownLoading,
}) {
  const anyFilterSet =
    selectedCustomerTypeId || selectedKebeleId || selectedKetenaId ||
    selectedBranchId || selectedReaderId;

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Pro Period Picker (1-Click Steppers + Ethiopian Month Popover Grid) */}
        <ProPeriodPicker
          selectedMonth={selectedKifyaWerMonth}
          selectedYear={selectedKifyaWerYear}
          onPeriodChange={(newMonth, newYear) => {
            if (onPeriodChange) {
              onPeriodChange(newMonth, newYear);
            } else {
              onMonthChange?.(newMonth);
              onYearChange?.(newYear);
            }
          }}
          currentCycleMonth={currentCycleMonth}
          currentCycleYear={currentCycleYear}
          dbPeriods={dbPeriods}
          disabled={disablePeriodSelect}
        />

        {/* Filter Button */}
        <Button
          variant="contained"
          onClick={onFilter}
          disabled={!selectedKifyaWerMonth || !selectedKifyaWerYear || isFetching}
          sx={{ borderRadius: 2.5, height: 42, px: 2.5, fontWeight: 700 }}
        >
          {isFetching ? <CircularProgress size={22} color="inherit" /> : "Filter"}
        </Button>

        {/* Wuzif Months Filter */}
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel id="wuzif-operator-label">Wuzif Op</InputLabel>
          <Select
            labelId="wuzif-operator-label"
            value={wuzifMonthsOp}
            label="Wuzif Op"
            onChange={(e) => onWuzifOpChange(e.target.value)}
          >
            <MenuItem value="eq">=</MenuItem>
            <MenuItem value="lt">{"<"}</MenuItem>
            <MenuItem value="gte">≥</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          type="number"
          label="Wuzif Months"
          value={wuzifMonthsVal}
          onChange={(e) => onWuzifValChange(e.target.value)}
          inputProps={{ min: 0 }}
          sx={{ width: 140 }}
        />

        {/* Customer Type */}
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Customer Type</InputLabel>
          <Select
            value={selectedCustomerTypeId}
            label="Customer Type"
            onChange={(e) => onFilterChange("selectedCustomerTypeId", e.target.value)}
            disabled={isCustomerTypesLoading}
          >
            <MenuItem value=""><em>All Types</em></MenuItem>
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

        {/* Kebele */}
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
            <MenuItem value=""><em>All Kebeles</em></MenuItem>
            {isKebelesLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : kebeles?.length > 0 ? (
              kebeles.map((kebele) => (
                <MenuItem key={kebele.id} value={kebele.id}>
                  {kebele.name || kebele.streetsName || `Kebele ${kebele.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No kebeles found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Ketena */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Ketena</InputLabel>
          <Select
            value={selectedKetenaId}
            label="Ketena"
            onChange={(e) => onFilterChange("selectedKetenaId", e.target.value)}
            disabled={isKetenasLoading}
          >
            <MenuItem value=""><em>All Ketenas</em></MenuItem>
            {isKetenasLoading ? (
              <MenuItem disabled>Loading...</MenuItem>
            ) : ketenas?.length > 0 ? (
              ketenas.map((ketena) => (
                <MenuItem key={ketena.id} value={ketena.id}>
                  {ketena.name || ketena.ketenaName || `Ketena ${ketena.id}`}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>No ketenas found</MenuItem>
            )}
          </Select>
        </FormControl>

        {/* Branch */}
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
            <MenuItem value=""><em>All Branches</em></MenuItem>
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

        {/* Reader */}
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={!selectedBranchId}>
          <InputLabel>Assigned Reader</InputLabel>
          <Select
            value={selectedReaderId}
            label="Assigned Reader"
            onChange={(e) => onFilterChange("selectedReaderId", e.target.value)}
            disabled={isReadersLoading || !selectedBranchId}
          >
            <MenuItem value=""><em>All Readers</em></MenuItem>
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

        {/* Clear Filters */}
        {anyFilterSet && (
          <Button variant="outlined" size="small" onClick={onClearAll}>
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Loading indicator */}
      {anyDropdownLoading && <LinearProgress sx={{ width: "100%", mb: 1 }} />}
    </>
  );
});

export default ReadingFilters;
