"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, TextField } from "@mui/material";

const BranchStatusModal = ({ open, onClose, onConfirm, mode, branchId }) => {
  const [remark, setRemark] = useState("");
  const isDeactivateMode = mode === "deactivate";
  const isActivateMode = mode === "activate";

  useEffect(() => { if (open) setRemark(""); }, [open]);

  const handleConfirm = () => {
    const payload = { status: isDeactivateMode ? "deleted" : "active", remark: remark.trim() };
    onConfirm(payload);
  };

  const handleClose = () => { onClose(); };

  const getTitle = () => (isDeactivateMode ? "Deactivate Branch" : isActivateMode ? "Activate Branch" : "Confirm Action");
  const getMessage = () => (isDeactivateMode ? "Are you sure you want to deactivate this branch?" : isActivateMode ? "Are you sure you want to activate this branch?" : "Are you sure?");
  const getConfirmText = () => (isDeactivateMode ? "Deactivate" : isActivateMode ? "Activate" : "Confirm");
  const getConfirmColor = () => (isDeactivateMode ? "error" : isActivateMode ? "success" : "primary");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle><Typography variant="h6">{getTitle()}</Typography></DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" color="textSecondary">{getMessage()}</Typography>
        </Box>
        {isDeactivateMode && (
          <TextField fullWidth label="Remark (Optional)" multiline rows={3} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Enter a reason..." margin="normal" />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleConfirm} color={getConfirmColor()} variant="contained">{getConfirmText()}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BranchStatusModal;
