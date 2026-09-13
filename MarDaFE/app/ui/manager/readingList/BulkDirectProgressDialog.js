"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  LinearProgress,
  Button,
  Chip,
  Paper,
  CircularProgress,
  Collapse,
  IconButton,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BoltIcon from "@mui/icons-material/Bolt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ListAltIcon from "@mui/icons-material/ListAlt";

/**
 * BulkDirectProgressDialog
 * Displays live background processing progress for direct server-side bulk reading calculations.
 */
const BulkDirectProgressDialog = ({
  open,
  onClose,
  strategy,
  progressInfo,
  logs = [],
  isLoading = false,
}) => {
  const [showLogs, setShowLogs] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const strategyLabels = {
    repeat: "Repeat Previous Reading",
    lastMonth: "Last Month's Consumption",
    average: "Average Consumption",
  };

  const strategyName = strategyLabels[strategy] || strategy || "Bulk Strategy";

  const total = progressInfo?.total || 0;
  const processed = progressInfo?.processed || 0;
  const percent = progressInfo?.percent ?? (total > 0 ? Math.floor((processed / total) * 100) : 0);
  const isDone = progressInfo?.done || progressInfo?.status === "DONE";
  const isError = progressInfo?.status === "ERROR";
  const isRunning = !isDone && !isError;
  const message = progressInfo?.message || (isRunning ? "Processing customer readings on server..." : "");

  const statusColor = isError ? "error" : isDone ? "success" : "primary";

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent accidental dismissal while actively running
        if (isRunning && (reason === "backdropClick" || reason === "escapeKeyDown")) {
          return;
        }
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 24,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: isError ? "error.main" : isDone ? "success.main" : "primary.main",
          color: "white",
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <BoltIcon />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Direct Bulk Apply (Server)
          </Typography>
        </Box>
        <Chip
          label={isDone ? "Completed" : isError ? "Error" : isRunning ? "In Progress" : "Starting..."}
          size="small"
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
            fontWeight: "bold",
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {/* Strategy and Target Count Info */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700 }}>
              Applied Strategy
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
              {strategyName}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", textTransform: "uppercase", fontWeight: 700 }}>
              Records Count
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "primary.main" }}>
              {total > 0 ? `${total} Customers` : "Preparing..."}
            </Typography>
          </Box>
        </Box>

        {/* Progress Bar and Statistics */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 2,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: `${statusColor}.main` }}>
              {percent}%
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {processed} of {total} processed
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, percent))}
            color={statusColor}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: "grey.200",
              mb: 1.5,
            }}
          />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isRunning && <CircularProgress size={16} color="primary" />}
            {isDone && <CheckCircleOutlineIcon color="success" fontSize="small" />}
            {isError && <ErrorOutlineIcon color="error" fontSize="small" />}
            <Typography
              variant="body2"
              sx={{
                color: isError ? "error.main" : isDone ? "success.dark" : "text.secondary",
                fontWeight: isDone || isError ? 600 : 400,
              }}
            >
              {message}
            </Typography>
          </Box>
        </Paper>

        {/* Logs Accordion / Collapse */}
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            color="inherit"
            onClick={() => setShowLogs((prev) => !prev)}
            startIcon={<ListAltIcon />}
            endIcon={showLogs ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: "none", color: "text.secondary", py: 0.5 }}
          >
            {showLogs ? "Hide Server Activity Logs" : `Show Server Activity Logs (${logs.length})`}
          </Button>

          <Collapse in={showLogs}>
            <Paper
              variant="outlined"
              ref={logContainerRef}
              sx={{
                mt: 1,
                p: 1.5,
                maxHeight: 180,
                overflowY: "auto",
                bgcolor: (theme) => theme.palette.mode === "dark" ? "#1e1e1e" : "#2d3748",
                color: "#e2e8f0",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                borderRadius: 1.5,
              }}
            >
              {logs.length === 0 ? (
                <Typography variant="caption" sx={{ color: "grey.400", fontStyle: "italic" }}>
                  No logs available yet...
                </Typography>
              ) : (
                logs.map((log, index) => (
                  <Box
                    key={index}
                    sx={{
                      py: 0.25,
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      color: log.includes("Error") || log.includes("failed") ? "#fc8181" : "#a0aec0",
                    }}
                  >
                    {log}
                  </Box>
                ))
              )}
            </Paper>
          </Collapse>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
        {isRunning ? (
          <Button
            variant="outlined"
            color="inherit"
            disabled
            startIcon={<CircularProgress size={16} />}
          >
            Processing in Background...
          </Button>
        ) : (
          <Button
            variant="contained"
            color={isError ? "inherit" : "primary"}
            onClick={onClose}
            sx={{ minWidth: 100 }}
          >
            {isDone ? "Done" : "Close"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkDirectProgressDialog;
