import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Box,
} from "@mui/material";

const AddressCountryStatusModal = ({ open, onClose, onConfirm, mode, addressCountryId }) => {

  const handleConfirm = () => {
    if (mode === "deactivate") {
      onConfirm({
        status: "deleted",
        data: {},
      });
    } else if (mode === "activate") {
      onConfirm({
        status: "active",
        data: {},
      });
    }
  };

  const handleClose = () => {
    onClose();
  };

  const isDeactivate = mode === "deactivate";
  const isActivate = mode === "activate";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isDeactivate ? "Deactivate Address Country" : "Activate Address Country"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {isDeactivate
              ? "Are you sure you want to deactivate this address country? This action will mark it as deleted."
              : "Are you sure you want to activate this address country? This will restore it to active status."}
          </Typography>
        </Box>


        {addressCountryId && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            Address Country ID: {addressCountryId}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={isDeactivate ? "error" : "primary"}
        >
          {isDeactivate ? "Deactivate" : "Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressCountryStatusModal;
