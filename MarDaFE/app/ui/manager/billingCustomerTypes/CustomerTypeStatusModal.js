import React, { useState, useEffect } from "react";
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

const CustomerTypeStatusModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  mode, 
  customerTypeId 
}) => {
  const [remark, setRemark] = useState("");

  useEffect(() => {
    if (open) {
      setRemark("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (mode === "deactivate") {
      onConfirm({
        status: "deleted",
        remark: remark.trim(),
      });
    } else if (mode === "activate") {
      onConfirm({
        status: "active",
        remark: "",
      });
    }
  };

  const isDeactivateMode = mode === "deactivate";
  const isActivateMode = mode === "activate";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isDeactivateMode ? "Deactivate Customer Type" : "Activate Customer Type"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {isDeactivateMode && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Are you sure you want to deactivate this customer type? This action will mark it as deleted.
              </Alert>
              <TextField
                fullWidth
                label="Remark (Optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                margin="normal"
                multiline
                rows={3}
                placeholder="Enter a reason for deactivation..."
              />
            </>
          )}
          
          {isActivateMode && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Are you sure you want to activate this customer type? This will make it available for use again.
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={isDeactivateMode ? "error" : "primary"}
        >
          {isDeactivateMode ? "Deactivate" : "Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerTypeStatusModal;
