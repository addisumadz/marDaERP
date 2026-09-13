"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";

/**
 * AddNewReadingModal — Dialog for adding a new reading for a customer.
 */
export const AddNewReadingModal = ({
  open,
  onClose,
  onSubmit,
  kifyaWer,
  customer,
  previousReading,
}) => {
  const [currentReading, setCurrentReading] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const prevVal = Number(previousReading ?? 0);
  const currVal = Number(currentReading);
  const hasNumbers = Number.isFinite(prevVal) && Number.isFinite(currVal);
  const liveConsumption = hasNumbers ? currVal - prevVal : 0;
  const isNegative = hasNumbers && liveConsumption < 0;

  useEffect(() => {
    setAccountNumber(customer?.accountNumber ?? "");
    setCurrentReading("");
  }, [customer, open]);

  const handleSubmit = () => {
    if (!accountNumber || !currentReading) {
      toast.error("Account Number and Current Reading are required.");
      return;
    }
    const prev = Number(previousReading ?? 0);
    const curr = Number(currentReading);
    if (Number.isFinite(prev) && Number.isFinite(curr) && curr - prev < 0) {
      toast.error("Current reading cannot be less than previous reading.");
      return;
    }
    onSubmit({
      customerAccountNumber: accountNumber,
      lastReading: Number(currentReading),
      kifyaWer,
      previousReading: Number(previousReading ?? 0),
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Reading</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Enter the new reading details for the month of {kifyaWer}.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Account Number"
          type="text"
          fullWidth
          variant="standard"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          disabled={!!customer}
        />
        <TextField
          margin="dense"
          label="Previous Reading"
          type="number"
          fullWidth
          variant="standard"
          value={previousReading ?? ""}
          disabled
        />
        <TextField
          margin="dense"
          label="Current Reading"
          type="number"
          fullWidth
          variant="standard"
          value={currentReading}
          onChange={(e) => setCurrentReading(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Consumption"
          type="number"
          fullWidth
          variant="standard"
          value={hasNumbers ? liveConsumption : ""}
          error={isNegative}
          helperText={isNegative ? "Current reading is less than previous." : ""}
          disabled
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isNegative}>Add</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * EditReadingModal — Dialog for editing an existing reading.
 */
export const EditReadingModal = ({
  open,
  onClose,
  onSubmit,
  reading = {},
}) => {
  const [currentReading, setCurrentReading] = useState("");

  useEffect(() => {
    setCurrentReading(reading?.lastReading?.toString() ?? "");
  }, [reading, open]);

  const handleSubmit = () => {
    onSubmit({
      ...reading,
      lastReading: Number(currentReading),
    });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Reading</DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        <DialogContentText>
          Update the reading for account {reading?.customerAccountNumber}.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Account Number"
          type="text"
          fullWidth
          variant="standard"
          value={reading?.customerAccountNumber ?? ""}
          disabled
        />
        <TextField
          margin="dense"
          label="Previous Reading"
          type="number"
          fullWidth
          variant="standard"
          value={reading?.previousReading ?? ""}
          disabled
        />
        <TextField
          margin="dense"
          label="Current Reading"
          type="number"
          fullWidth
          variant="standard"
          value={currentReading}
          onChange={(e) => setCurrentReading(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * DeleteReadingDialog — Confirmation dialog for deleting a reading.
 */
export const DeleteReadingDialog = ({
  open,
  onClose,
  onConfirm,
  reading,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Confirm Delete</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to delete the reading for account
        <strong> {reading?.customerAccountNumber}</strong>? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} color="error">Delete</Button>
    </DialogActions>
  </Dialog>
);

/**
 * CalcPreviewDialog — Preview dialog for calculated reading strategies.
 */
export const CalcPreviewDialog = ({
  open,
  onClose,
  onConfirm,
  previewData,
  isLoading,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Preview Calculated Reading</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Strategy: {previewData?.strategy}
      </DialogContentText>
      <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField label="Account Number" value={previewData?.accountNumber || ""} variant="standard" disabled />
        <TextField label="Customer" value={previewData?.customerName || ""} variant="standard" disabled />
        <TextField label="Kifya Wer" value={previewData?.kifyaWer || ""} variant="standard" disabled />
        <TextField label="Previous Reading" value={previewData?.previousReading ?? ""} variant="standard" disabled />
        <TextField label="Proposed Last Reading" value={previewData?.proposedLastReading ?? ""} variant="standard" disabled />
        <TextField label="Consumption" value={previewData?.consumption ?? ""} variant="standard" disabled />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" onClick={onConfirm} disabled={isLoading}>
        {isLoading ? <CircularProgress size={20} /> : "Save"}
      </Button>
    </DialogActions>
  </Dialog>
);
