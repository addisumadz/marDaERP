"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

const ZeroReasonFormModal = ({ open, onClose, onSubmit, reason, isLoading }) => {
  const [formData, setFormData] = useState({
    reasonCode: "",
    reasonName: "",
    isZeroReadingReason: false,
    isDoorCloseReason: false,
  });

  const [errors, setErrors] = useState({});
  const isEditMode = !!reason;

  useEffect(() => {
    if (open) {
      if (isEditMode && reason) {
        setFormData({
          reasonCode: reason.reasonCode || "",
          reasonName: reason.reasonName || "",
          isZeroReadingReason: !!reason.isZeroReadingReason,
          isDoorCloseReason: !!reason.isDoorCloseReason,
        });
      } else {
        setFormData({
          reasonCode: "",
          reasonName: "",
          isZeroReadingReason: false,
          isDoorCloseReason: false,
        });
      }
      setErrors({});
    }
  }, [open, reason, isEditMode]);

  const handleTextChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCheckChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.checked }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.reasonCode.trim()) newErrors.reasonCode = "Reason code is required";
    if (!formData.reasonName.trim()) newErrors.reasonName = "Reason name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    const submitData = {
      reasonCode: formData.reasonCode.trim(),
      reasonName: formData.reasonName.trim(),
      isZeroReadingReason: !!formData.isZeroReadingReason,
      isDoorCloseReason: !!formData.isDoorCloseReason,
    };
    try {
      await onSubmit(submitData);
      onClose();
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const handleClose = () => {
    setFormData({ reasonCode: "", reasonName: "", isZeroReadingReason: false, isDoorCloseReason: false });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{isEditMode ? "Edit Zero Reading Reason" : "Create Zero Reading Reason"}</Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading && isEditMode ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Reason Code"
              value={formData.reasonCode}
              onChange={handleTextChange("reasonCode")}
              error={!!errors.reasonCode}
              helperText={errors.reasonCode}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Reason Name"
              value={formData.reasonName}
              onChange={handleTextChange("reasonName")}
              error={!!errors.reasonName}
              helperText={errors.reasonName}
              margin="normal"
              required
            />
            <FormControlLabel
              control={<Checkbox checked={formData.isZeroReadingReason} onChange={handleCheckChange("isZeroReadingReason")} />}
              label="Zero Reading Reason"
            />
            <FormControlLabel
              control={<Checkbox checked={formData.isDoorCloseReason} onChange={handleCheckChange("isDoorCloseReason")} />}
              label="Door Close Reason"
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : (isEditMode ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZeroReasonFormModal;
