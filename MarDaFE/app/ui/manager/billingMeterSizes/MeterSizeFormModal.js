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
} from "@mui/material";

const MeterSizeFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  meterSize, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    meterCode: "",
    meterSize: "",
  });
  
  const [errors, setErrors] = useState({});
  const isEditMode = !!meterSize;

  // Reset form when modal opens/closes or meterSize changes
  useEffect(() => {
    if (open) {
      if (isEditMode && meterSize) {
        setFormData({
          meterCode: meterSize.meterCode || "",
          meterSize: meterSize.meterSize?.toString() || "",
        });
      } else {
        setFormData({
          meterCode: "",
          meterSize: "",
        });
      }
      setErrors({});
    }
  }, [open, meterSize, isEditMode]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.meterCode.trim()) {
      newErrors.meterCode = "Meter code is required";
    }

    if (!formData.meterSize.trim()) {
      newErrors.meterSize = "Meter size is required";
    } else {
      const sizeValue = parseFloat(formData.meterSize);
      if (isNaN(sizeValue) || sizeValue <= 0) {
        newErrors.meterSize = "Meter size must be a positive number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = {
      meterCode: formData.meterCode.trim(),
      meterSize: parseFloat(formData.meterSize),
    };

    try {
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      meterCode: "",
      meterSize: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isEditMode ? "Edit Meter Size" : "Create New Meter Size"}
        </Typography>
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
              label="Meter Code"
              value={formData.meterCode}
              onChange={handleInputChange("meterCode")}
              error={!!errors.meterCode}
              helperText={errors.meterCode}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Meter Size"
              type="number"
              value={formData.meterSize}
              onChange={handleInputChange("meterSize")}
              error={!!errors.meterSize}
              helperText={errors.meterSize}
              margin="normal"
              required
              inputProps={{
                step: "0.01",
                min: "0"
              }}
            />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          color="primary" 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={20} />
          ) : (
            isEditMode ? "Update" : "Create"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeterSizeFormModal;
