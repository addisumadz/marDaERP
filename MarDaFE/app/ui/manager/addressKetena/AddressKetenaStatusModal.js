"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from "@mui/material";

const AddressKetenaStatusModal = ({
  open,
  onClose,
  onConfirm,
  mode, // 'activate' | 'deactivate'
  addressKetenaId,
}) => {
  const [remark, setRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        status: mode === "activate" ? "active" : "deleted",
        remark: mode === "deactivate" ? remark : "",
      };
      
      await onConfirm(payload);
      setRemark("");
    } catch (error) {
      console.error("Status change error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRemark("");
    onClose();
  };

  const isActivate = mode === "activate";
  const isDeactivate = mode === "deactivate";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isActivate ? "Activate Address Ketena" : "Deactivate Address Ketena"}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          {isActivate ? (
            <Alert severity="info">
              Are you sure you want to activate this address ketena? This will make it available for use again.
            </Alert>
          ) : (
            <Alert severity="warning">
              Are you sure you want to deactivate this address ketena? This will mark it as deleted and it will no longer be available for use.
            </Alert>
          )}
        </Box>

        {isDeactivate && (
          <TextField
            label="Remark (Optional)"
            multiline
            rows={3}
            fullWidth
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter a reason for deactivation..."
            disabled={isSubmitting}
            sx={{ mt: 2 }}
          />
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Ketena ID: {addressKetenaId}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={isActivate ? "primary" : "error"}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : (isActivate ? "Activate" : "Deactivate")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressKetenaStatusModal;
