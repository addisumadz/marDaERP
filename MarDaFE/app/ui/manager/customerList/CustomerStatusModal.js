"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Typography,
  Alert,
  Paper,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { DropdownService } from "../../../lib/dropdownService";

const dropdownService = new DropdownService();

export default function CustomerStatusModal({ open, mode, customer, onClose, onConfirm, isSubmitting = false }) {
  const isDeactivate = mode === "deactivate";

  const {
    data: reasons = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["billing-termination-reasons"],
    queryFn: () => dropdownService.getBillingTerminationReasons(),
    enabled: open && isDeactivate,
    staleTime: Infinity,
  });

  const [reasonId, setReasonId] = useState("");
  const [remark, setRemark] = useState("");
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  useEffect(() => {
    if (!open) {
      setReasonId("");
      setRemark("");
      setConfirmedCheck(false);
      setAttemptedSubmit(false);
    }
  }, [open]);

  const handleConfirm = () => {
    setAttemptedSubmit(true);
    if (isDeactivate) {
      if (!reasonId) return;
      onConfirm({ status: "deleted", billingTerminationReasonId: Number(reasonId), terminationRemark: remark });
    } else {
      onConfirm({ status: "active" });
    }
  };

  const hasArrears = Number(customer?.oldKfyaAndPenaltyTotal || 0) > 0;
  const hasPrepaid = Number(customer?.customerBalanceBirr || customer?.prepaidBirrCurrentBalance || 0) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: isDeactivate ? "error.lighter" : "success.lighter",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isDeactivate ? (
            <WarningAmberIcon color="error" sx={{ fontSize: 32 }} />
          ) : (
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 32 }} />
          )}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: isDeactivate ? "error.dark" : "success.dark" }}>
              {isDeactivate ? "Deactivate / Terminate Consumer" : "Reactivate Consumer Account"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isDeactivate
                ? "Cease active meter reading and billing schedule"
                : "Reopen account and resume meter billing cycle"}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2.5 }}>
        {/* Customer Identity Card */}
        {customer && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2.5,
              bgcolor: "background.default",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              {customer.fullName || customer.fullNameEng || "Consumer"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Account: <strong>{customer.accountNumber || "N/A"}</strong> &bull; Phone: {customer.phoneNumber || "N/A"}
            </Typography>

            {(hasArrears || hasPrepaid) && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed", borderColor: "divider", display: "flex", gap: 2 }}>
                {hasArrears && (
                  <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                    Arrears Due: {Number(customer.oldKfyaAndPenaltyTotal).toLocaleString()} ETB
                  </Typography>
                )}
                {hasPrepaid && (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                    Prepaid Deposit: {Number(customer.customerBalanceBirr || customer.prepaidBirrCurrentBalance).toLocaleString()} ETB
                  </Typography>
                )}
              </Box>
            )}
          </Paper>
        )}

        {isDeactivate ? (
          <>
            {hasArrears && (
              <Alert severity="warning" sx={{ mb: 2.5 }}>
                <strong>Outstanding Balance Warning:</strong> This consumer has unpaid arrears. Deactivation stops future monthly billing, but unpaid amounts remain on record.
              </Alert>
            )}

            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : isError ? (
              <Alert severity="error">Failed to load termination reasons. Please check your network connection.</Alert>
            ) : (
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <FormControl fullWidth error={attemptedSubmit && !reasonId}>
                  <InputLabel id="termination-reason-label">Termination Reason *</InputLabel>
                  <Select
                    labelId="termination-reason-label"
                    value={reasonId}
                    label="Termination Reason *"
                    onChange={(e) => setReasonId(e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select Termination Reason</em>
                    </MenuItem>
                    {reasons.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name || r.terminationReason || `Reason ${r.id}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {attemptedSubmit && !reasonId && (
                    <FormHelperText>Please select a mandatory termination reason.</FormHelperText>
                  )}
                </FormControl>

                <TextField
                  label="Termination Remark / Note (Optional)"
                  multiline
                  minRows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  fullWidth
                  placeholder="e.g. Disconnected per customer request, property demolished, etc."
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={confirmedCheck}
                      onChange={(e) => setConfirmedCheck(e.target.checked)}
                      color="error"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I confirm deactivation of this consumer and acknowledge cessation of meter reading.
                    </Typography>
                  }
                />
              </Box>
            )}
          </>
        ) : (
          <Box sx={{ py: 1.5 }}>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Are you sure you want to reactivate this consumer?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Reactivation restores account status to <strong>Active</strong> and enrolls the customer into active meter reading and billing routes.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider" }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={
            isSubmitting ||
            (isDeactivate && (isLoading || !reasonId || !confirmedCheck))
          }
          color={isDeactivate ? "error" : "success"}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ fontWeight: 700 }}
        >
          {isSubmitting
            ? "Processing..."
            : isDeactivate
            ? "Confirm Deactivation"
            : "Reactivate Consumer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
