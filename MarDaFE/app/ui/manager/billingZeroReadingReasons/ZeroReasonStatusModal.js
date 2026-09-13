"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";

const ZeroReasonStatusModal = ({ open, onClose, onConfirm, mode, reasonId }) => {
  const [remark, setRemark] = useState("");

  const isDeactivateMode = mode === "deactivate";
  const isActivateMode = mode === "activate";

  useEffect(() => {
    if (open) setRemark("");
  }, [open]);

  const handleConfirm = () => {
    const payload = {
      status: isDeactivateMode ? "deleted" : "active",
      remark: remark.trim(),
    };
    onConfirm(payload);
  };

  const handleClose = () => {
    setRemark("");
    onClose();
  };

  const getTitle = () => {
    if (isDeactivateMode) return "Deactivate Reason";
    if (isActivateMode) return "Activate Reason";
    return "Confirm Action";
  };

  const getMessage = () => {
    if (isDeactivateMode) {
      return "Are you sure you want to deactivate this reason? This action will mark it as deleted.";
    }
    if (isActivateMode) {
      return "Are you sure you want to activate this reason? This action will mark it as active.";
    }
    return "Are you sure you want to perform this action?";
  };

  const getConfirmButtonText = () => {
    if (isDeactivateMode) return "Deactivate";
    if (isActivateMode) return "Activate";
    return "Confirm";
  };

  const getConfirmButtonColor = () => {
    if (isDeactivateMode) return "error";
    if (isActivateMode) return "success";
    return "primary";
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{getTitle()}</Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="textSecondary">
            {getMessage()}
          </Typography>
        </Box>
        {isDeactivateMode && (
          <TextField
            fullWidth
            label="Remark (Optional)"
            multiline
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Enter a reason for deactivation..."
            margin="normal"
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleConfirm} color={getConfirmButtonColor()} variant="contained">
          {getConfirmButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZeroReasonStatusModal;
