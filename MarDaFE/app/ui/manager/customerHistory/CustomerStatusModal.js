"use client";
import React from "react";
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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { DropdownService } from "../../../lib/dropdownService";

const dropdownService = new DropdownService();

/**
 * CustomerStatusModal
 * mode: "deactivate" | "activate"
 * onConfirm(payload) -> for deactivate: { status: 'deleted', billingTerminationReasonId, terminationRemark }
 *                      for activate:   { status: 'active' }
 */
export default function CustomerStatusModal({ open, mode, onClose, onConfirm }) {
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

  const [reasonId, setReasonId] = React.useState("");
  const [remark, setRemark] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setReasonId("");
      setRemark("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (isDeactivate) {
      if (!reasonId) return; // simple guard
      onConfirm({ status: "deleted", billingTerminationReasonId: reasonId, terminationRemark: remark });
    } else {
      onConfirm({ status: "active" });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isDeactivate ? "Deactivate Customer" : "Activate Customer"}
      </DialogTitle>
      <DialogContent>
        {isDeactivate ? (
          isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Typography color="error">Failed to load termination reasons.</Typography>
          ) : (
            <Box sx={{ mt: 1, display: "grid", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Termination Reason</InputLabel>
                <Select
                  value={reasonId}
                  label="Termination Reason"
                  onChange={(e) => setReasonId(e.target.value)}
                >
                  {reasons.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name || `Reason ${r.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Remark (optional)"
                multiline
                minRows={2}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                fullWidth
              />
            </Box>
          )
        ) : (
          <Typography sx={{ mt: 1 }}>
            This will reactivate the customer and set activation date to today.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isDeactivate && (isLoading || !reasonId)}
          color={isDeactivate ? "error" : "primary"}
        >
          {isDeactivate ? "Deactivate" : "Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
