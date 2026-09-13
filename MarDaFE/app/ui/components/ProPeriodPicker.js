"use client";
import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Popover,
  Paper,
  Grid,
  Tooltip,
  Chip,
  Divider,
  Stack,
  Fade,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import StorageIcon from "@mui/icons-material/Storage";

import { ETH_MONTHS_AM } from "@/app/helpers/constants";

/**
 * Helper to calculate previous billing period in Ethiopian calendar.
 * Wraps Meskerem (1) -> Nehase (12) of prior year.
 */
export function getPreviousPeriod(monthName, yearVal) {
  const year = Number(yearVal) || new Date().getFullYear() - 8;
  const idx = ETH_MONTHS_AM.indexOf(monthName);
  if (idx <= 0) {
    return { month: ETH_MONTHS_AM[11], year: year - 1 };
  }
  return { month: ETH_MONTHS_AM[idx - 1], year };
}

/**
 * Helper to calculate next billing period in Ethiopian calendar.
 * Wraps Nehase (12) -> Meskerem (1) of next year.
 */
export function getNextPeriod(monthName, yearVal) {
  const year = Number(yearVal) || new Date().getFullYear() - 8;
  const idx = ETH_MONTHS_AM.indexOf(monthName);
  if (idx === -1 || idx >= 11) {
    return { month: ETH_MONTHS_AM[0], year: year + 1 };
  }
  return { month: ETH_MONTHS_AM[idx + 1], year };
}

/**
 * ProPeriodPicker — Executive Month & Year selector for Ethiopian Billing System.
 *
 * Features:
 * - 1-Click Steppers (◀ Prev Month / Next Month ▶) with year wrapping
 * - Unified 📅 Popover with full 12-Month Ethiopian calendar grid
 * - Direct DB Data indicators (● shows which months exist in DB)
 * - ⚡ Current Cycle quick jump
 * - Quick Year jumping chips
 */
export default function ProPeriodPicker({
  selectedMonth,
  selectedYear,
  onPeriodChange,
  currentCycleMonth,
  currentCycleYear,
  dbPeriods = [],
  disabled = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Internal year state for browsing inside the popover
  const [viewYear, setViewYear] = useState(() => Number(selectedYear) || 2017);

  const handleOpen = (event) => {
    if (disabled) return;
    setViewYear(Number(selectedYear) || 2017);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Check if a specific (month, year) exists in DB distinct periods
  const hasDataInDB = useCallback(
    (m, y) => {
      if (!Array.isArray(dbPeriods) || dbPeriods.length === 0) return false;
      const target = `${m}, ${y}`.trim();
      return dbPeriods.some((p) => typeof p === "string" && p.trim() === target);
    },
    [dbPeriods]
  );

  // Stepping Handlers
  const handlePrev = useCallback(() => {
    if (disabled || !selectedMonth || !selectedYear) return;
    const prev = getPreviousPeriod(selectedMonth, selectedYear);
    onPeriodChange(prev.month, prev.year);
  }, [disabled, selectedMonth, selectedYear, onPeriodChange]);

  const handleNext = useCallback(() => {
    if (disabled || !selectedMonth || !selectedYear) return;
    const next = getNextPeriod(selectedMonth, selectedYear);
    onPeriodChange(next.month, next.year);
  }, [disabled, selectedMonth, selectedYear, onPeriodChange]);

  const handleJumpToCurrent = useCallback(() => {
    if (disabled || !currentCycleMonth || !currentCycleYear) return;
    onPeriodChange(currentCycleMonth, currentCycleYear);
    handleClose();
  }, [disabled, currentCycleMonth, currentCycleYear, onPeriodChange]);

  const handleSelectMonth = (month) => {
    onPeriodChange(month, viewYear);
    handleClose();
  };

  const isCurrentCycle = useMemo(() => {
    return (
      selectedMonth === currentCycleMonth &&
      Number(selectedYear) === Number(currentCycleYear)
    );
  }, [selectedMonth, selectedYear, currentCycleMonth, currentCycleYear]);

  // Generate 5 quick-year options centered around viewYear
  const quickYears = useMemo(() => {
    const y = Number(viewYear) || 2017;
    return [y - 2, y - 1, y, y + 1, y + 2];
  }, [viewYear]);

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {/* ── Main Pro Period Pill Container ── */}
      <Paper
        elevation={0}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          p: 0.5,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: open ? "primary.main" : "divider",
          boxShadow: open
            ? "0 0 0 3px rgba(25, 118, 210, 0.15)"
            : "0 1px 3px rgba(0,0,0,0.06)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {/* Previous Month Stepper */}
        <Tooltip title="Previous Month (ቀዳሚ ወር) ◀" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handlePrev}
              disabled={disabled || !selectedMonth || !selectedYear}
              sx={{
                width: 34,
                height: 34,
                color: "text.secondary",
                "&:hover": { bgcolor: "primary.lighter", color: "primary.main" },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: "auto" }} />

        {/* Central Period Trigger Button */}
        <Button
          onClick={handleOpen}
          disabled={disabled}
          sx={{
            px: 1.5,
            py: 0.5,
            textTransform: "none",
            borderRadius: 2,
            gap: 1,
            color: "text.primary",
            fontWeight: 700,
            fontSize: "0.95rem",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <CalendarMonthIcon
            sx={{
              color: open ? "primary.main" : "primary.light",
              fontSize: "1.25rem",
            }}
          />

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.6 }}>
            <Typography
              component="span"
              sx={{
                fontWeight: 800,
                color: "primary.dark",
                fontSize: "0.98rem",
                letterSpacing: 0.2,
              }}
            >
              {selectedMonth || "Select Month"}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: "0.92rem",
              }}
            >
              {selectedYear ? `${selectedYear} ዓ.ም` : ""}
            </Typography>
          </Box>

          {isCurrentCycle && (
            <Chip
              size="small"
              label="Active Cycle"
              color="primary"
              variant="filled"
              sx={{
                height: 20,
                fontSize: "0.68rem",
                fontWeight: 700,
                display: { xs: "none", sm: "inline-flex" },
              }}
            />
          )}

          <ExpandMoreIcon
            sx={{
              color: "text.secondary",
              fontSize: "1.2rem",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease-in-out",
            }}
          />
        </Button>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 20, my: "auto" }} />

        {/* Next Month Stepper */}
        <Tooltip title="Next Month (ቀጣይ ወር) ▶" arrow>
          <span>
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={disabled || !selectedMonth || !selectedYear}
              sx={{
                width: 34,
                height: 34,
                color: "text.secondary",
                "&:hover": { bgcolor: "primary.lighter", color: "primary.main" },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Paper>

      {/* Quick Jump to Current Cycle Button (if not already on it) */}
      {!isCurrentCycle && currentCycleMonth && currentCycleYear && (
        <Tooltip title={`Jump to Active Cycle: ${currentCycleMonth}, ${currentCycleYear}`} arrow>
          <Button
            size="small"
            variant="outlined"
            onClick={handleJumpToCurrent}
            disabled={disabled}
            startIcon={<BoltIcon sx={{ color: "warning.main" }} />}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.82rem",
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: "primary.lighter",
              },
            }}
          >
            Current Cycle
          </Button>
        </Tooltip>
      )}

      {/* ── Popover: Ethiopian 12-Month Calendar Grid ── */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              p: 2.5,
              mt: 1,
              width: 390,
              borderRadius: 3,
              boxShadow: "0 12px 36px -6px rgba(0, 0, 0, 0.2), 0 4px 16px -2px rgba(0,0,0,0.1)",
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        {/* Popover Header: Year Stepper */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Tooltip title="Previous Year">
            <IconButton
              size="small"
              onClick={() => setViewYear((y) => y - 1)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.2 }}>
              {viewYear} ዓ.ም
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ethiopian Billing Year
            </Typography>
          </Box>

          <Tooltip title="Next Year">
            <IconButton
              size="small"
              onClick={() => setViewYear((y) => y + 1)}
              sx={{ border: "1px solid", borderColor: "divider" }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Quick Year Jump Chips */}
        <Stack direction="row" spacing={0.8} justifyContent="center" sx={{ mb: 2 }}>
          {quickYears.map((yr) => {
            const isSelectedYr = yr === viewYear;
            return (
              <Chip
                key={yr}
                label={`${yr}`}
                size="small"
                variant={isSelectedYr ? "filled" : "outlined"}
                color={isSelectedYr ? "primary" : "default"}
                onClick={() => setViewYear(yr)}
                sx={{
                  fontWeight: isSelectedYr ? 700 : 500,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  "&:hover": { bgcolor: isSelectedYr ? "primary.dark" : "action.hover" },
                }}
              />
            );
          })}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* 12-Month Ethiopian Grid (4 columns x 3 rows) */}
        <Grid container spacing={1.2}>
          {ETH_MONTHS_AM.map((month, idx) => {
            const isSelected = selectedMonth === month && Number(selectedYear) === viewYear;
            const isCurrent = currentCycleMonth === month && Number(currentCycleYear) === viewYear;
            const inDB = hasDataInDB(month, viewYear);
            const monthNum = String(idx + 1).padStart(2, "0");

            return (
              <Grid item xs={3} key={month}>
                <Paper
                  elevation={isSelected ? 3 : 0}
                  onClick={() => handleSelectMonth(month)}
                  sx={{
                    p: 1,
                    textAlign: "center",
                    cursor: "pointer",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isSelected
                      ? "primary.main"
                      : isCurrent
                      ? "warning.main"
                      : inDB
                      ? "success.light"
                      : "divider",
                    bgcolor: isSelected
                      ? "primary.main"
                      : isCurrent
                      ? "warning.lighter"
                      : inDB
                      ? "grey.50"
                      : "background.paper",
                    color: isSelected ? "#fff" : "text.primary",
                    transition: "all 0.18s ease-in-out",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                      bgcolor: isSelected ? "primary.dark" : "primary.lighter",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {/* Month Index */}
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: isSelected ? "rgba(255,255,255,0.8)" : "text.secondary",
                      lineHeight: 1,
                      mb: 0.4,
                    }}
                  >
                    {monthNum}
                  </Typography>

                  {/* Amharic Month Name */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: isSelected ? 800 : 700,
                      fontSize: "0.85rem",
                      lineHeight: 1.2,
                    }}
                  >
                    {month}
                  </Typography>

                  {/* Indicators Footer */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.4,
                      mt: 0.5,
                      minHeight: 14,
                    }}
                  >
                    {inDB && (
                      <Tooltip title="Data recorded in database for this period" arrow>
                        <Box
                          component="span"
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: isSelected ? "#fff" : "success.main",
                            display: "inline-block",
                          }}
                        />
                      </Tooltip>
                    )}
                    {isCurrent && (
                      <Tooltip title="System Active Billing Cycle" arrow>
                        <StarIcon
                          sx={{
                            fontSize: "0.85rem",
                            color: isSelected ? "#fff" : "warning.main",
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Footer: Legend & Jump to Current */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {/* Legend */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                component="span"
                sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                In Database
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <StarIcon sx={{ fontSize: "0.8rem", color: "warning.main" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                Active Cycle
              </Typography>
            </Box>
          </Stack>

          {/* Jump Button */}
          {currentCycleMonth && currentCycleYear && (
            <Button
              size="small"
              variant="text"
              onClick={handleJumpToCurrent}
              startIcon={<BoltIcon fontSize="small" sx={{ color: "warning.main" }} />}
              sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
            >
              Active Cycle
            </Button>
          )}
        </Box>
      </Popover>
    </Box>
  );
}
