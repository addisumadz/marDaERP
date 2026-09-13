"use client";
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirmColor?: "primary" | "secondary" | "error" | "warning" | "success" | "info";
};

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm",
  content = "Are you sure you want to proceed?",
  confirmText = "OK",
  cancelText = "Cancel",
  onClose,
  onConfirm,
  confirmColor = "primary",
}) => {
  const [submitting, setSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    // Guard against very fast double-clicks triggering onConfirm twice
    if (submitting) return;
    try {
      setSubmitting(true);
      await onConfirm();
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      {content && (
        <DialogContent>
          {typeof content === "string" ? (
            <DialogContentText>{content}</DialogContentText>
          ) : (
            content
          )}
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {cancelText}
        </Button>
        <Button onClick={handleConfirm} color={confirmColor} variant="contained" disabled={submitting}>
          {submitting ? "Processing..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
