"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

const CompanyInfoStatusModal = ({ open, onClose, onConfirm, mode, infoId }) => {
  const isDeactivateMode = mode === "deactivate";
  const isActivateMode = mode === "activate";

  useEffect(() => {}, [open]);

  const handleConfirm = () => {
    const payload = {
      status: isDeactivateMode ? "deleted" : "active",
    };
    onConfirm(payload);
  };

  const handleClose = () => {
    onClose();
  };

  const getTitle = () => {
    if (isDeactivateMode) return "Deactivate Company Information";
    if (isActivateMode) return "Activate Company Information";
    return "Confirm Action";
  };

  const getMessage = () => {
    if (isDeactivateMode) {
      return "Are you sure you want to deactivate this company information? This action will mark it as deleted.";
    }
    if (isActivateMode) {
      return "Are you sure you want to activate this company information? This action will mark it as active.";
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

export default CompanyInfoStatusModal;
