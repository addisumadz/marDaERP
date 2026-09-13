import React, { useState, useEffect } from "react";
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

const CustomerTypeFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  customerType, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    customerType: "",
    description: "",
    techemariKfya: 0,
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes or customerType changes
  useEffect(() => {
    if (open) {
      if (customerType) {
        // Edit mode
        setFormData({
          customerType: customerType.customerType || "",
          description: customerType.description || "",
          techemariKfya: customerType.techemariKfya || 0,
        });
      } else {
        // Create mode
        setFormData({
          customerType: "",
          description: "",
          techemariKfya: 0,
        });
      }
      setErrors({});
    }
  }, [open, customerType]);

  const handleInputChange = (field) => (event) => {
    const value = field === 'techemariKfya' ? parseFloat(event.target.value) || 0 : event.target.value;
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

    if (!formData.customerType.trim()) {
      newErrors.customerType = "Customer type is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (formData.techemariKfya < 0) {
      newErrors.techemariKfya = "Techemari Kfya must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const isEditMode = !!customerType;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isEditMode ? "Edit Customer Type" : "Create New Customer Type"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Customer Type"
            value={formData.customerType}
            onChange={handleInputChange("customerType")}
            error={!!errors.customerType}
            helperText={errors.customerType}
            margin="normal"
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleInputChange("description")}
            error={!!errors.description}
            helperText={errors.description}
            margin="normal"
            multiline
            rows={3}
            disabled={isLoading}
          />

          <TextField
            fullWidth
            label="Techemari Kfya"
            type="number"
            value={formData.techemariKfya}
            onChange={handleInputChange("techemariKfya")}
            error={!!errors.techemariKfya}
            helperText={errors.techemariKfya}
            margin="normal"
            inputProps={{ 
              min: 0, 
              step: 0.01 
            }}
            disabled={isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? "Saving..." : (isEditMode ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerTypeFormModal;
