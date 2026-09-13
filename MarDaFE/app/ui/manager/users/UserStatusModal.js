"use client";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export default function UserStatusModal({ open, mode, onClose, onConfirm }) {
  const isDeactivate = mode === "deactivate";
  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{isDeactivate ? "Deactivate User" : "Activate User"}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {isDeactivate
            ? "Are you sure you want to deactivate this user? They will be marked as deactivated."
            : "Are you sure you want to activate this user?"}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color={isDeactivate ? "error" : "primary"} variant="contained" onClick={onConfirm}>
          {isDeactivate ? "Deactivate" : "Activate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
