"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

const AddressZoneStatusModal = ({
  open,
  onClose,
  onConfirm,
  mode, // 'activate' | 'deactivate'
  addressZoneId,
}) => {
  const isDeactivate = mode === "deactivate";
  const isActivate = mode === "activate";

  const handleConfirm = () => {
    if (isDeactivate) {
      onConfirm({
        status: "deleted",
        data: {},
      });
    } else if (isActivate) {
      onConfirm({
        status: "active",
        data: {},
      });
    }
  };

  const getTitle = () => {
    if (isDeactivate) return "Deactivate Address Zone";
    if (isActivate) return "Activate Address Zone";
    return "Confirm Action";
  };

  const getMessage = () => {
    if (isDeactivate) {
      return "Are you sure you want to deactivate this address zone? This action will make the zone unavailable for new entries.";
    }
    if (isActivate) {
      return "Are you sure you want to activate this address zone? This action will make the zone available for use.";
    }
    return "Please confirm your action.";
  };

  const getConfirmButtonText = () => {
    if (isDeactivate) return "Deactivate";
    if (isActivate) return "Activate";
    return "Confirm";
  };

  const getConfirmButtonColor = () => {
    if (isDeactivate) return "error";
    if (isActivate) return "primary";
    return "primary";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1">
            {getMessage()}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={getConfirmButtonColor()}
        >
          {getConfirmButtonText()}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressZoneStatusModal;
