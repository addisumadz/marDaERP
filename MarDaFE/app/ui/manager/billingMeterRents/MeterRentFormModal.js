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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { BillingMeterRentService } from "../../../lib/billingMeterRentService";

const meterRentService = new BillingMeterRentService();

const MeterRentFormModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  meterRent, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    billingCustomerTypeId: "",
    meterSizeId: "",
    rentBirr: 0,
  });

  const [errors, setErrors] = useState({});

  // Fetch customer types for dropdown
  const { data: customerTypes = [] } = useQuery({
    queryKey: ["active-customer-types"],
    queryFn: () => meterRentService.getActiveCustomerTypes(),
    enabled: open,
    refetchOnWindowFocus: false,
  });

  // Fetch meter sizes for dropdown
  const { data: meterSizes = [] } = useQuery({
    queryKey: ["active-meter-sizes"],
    queryFn: () => meterRentService.getActiveMeterSizes(),
    enabled: open,
    refetchOnWindowFocus: false,
  });

  // Reset form when modal opens/closes or meterRent changes
  useEffect(() => {
    if (open) {
      if (meterRent) {
        // Edit mode
        setFormData({
          billingCustomerTypeId: meterRent.billingCustomerTypeId || "",
          meterSizeId: meterRent.meterSizeId || "",
          rentBirr: meterRent.rentBirr || 0,
        });
      } else {
        // Create mode
        setFormData({
          billingCustomerTypeId: "",
          meterSizeId: "",
          rentBirr: 0,
        });
      }
      setErrors({});
    }
  }, [open, meterRent]);

  const handleInputChange = (field) => (event) => {
    let value = event.target.value;
    
    // Convert to appropriate types
    if (field === 'rentBirr') {
      value = parseFloat(value) || 0;
    } else if (field === 'billingCustomerTypeId' || field === 'meterSizeId') {
      value = value === "" ? "" : parseInt(value);
    }
    
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

    if (!formData.billingCustomerTypeId) {
      newErrors.billingCustomerTypeId = "Customer type is required";
    }

    if (!formData.meterSizeId) {
      newErrors.meterSizeId = "Meter size is required";
    }

    if (formData.rentBirr < 0) {
      newErrors.rentBirr = "Rent amount must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Ensure IDs are integers, not empty strings
      const submitData = {
        ...formData,
        billingCustomerTypeId: parseInt(formData.billingCustomerTypeId),
        meterSizeId: parseInt(formData.meterSizeId),
        rentBirr: parseFloat(formData.rentBirr) || 0
      };
      
      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const isEditMode = !!meterRent;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          {isEditMode ? "Edit Meter Rent" : "Create New Meter Rent"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl 
            fullWidth 
            margin="normal" 
            error={!!errors.billingCustomerTypeId}
            disabled={isLoading}
          >
            <InputLabel>Customer Type</InputLabel>
            <Select
              value={formData.billingCustomerTypeId}
              onChange={handleInputChange("billingCustomerTypeId")}
              label="Customer Type"
            >
              {customerTypes.map((customerType) => (
                <MenuItem key={customerType.id} value={customerType.id}>
                  {customerType.customerType}
                </MenuItem>
              ))}
            </Select>
            {errors.billingCustomerTypeId && (
              <FormHelperText>{errors.billingCustomerTypeId}</FormHelperText>
            )}
          </FormControl>

          <FormControl 
            fullWidth 
            margin="normal" 
            error={!!errors.meterSizeId}
            disabled={isLoading}
          >
            <InputLabel>Meter Size</InputLabel>
            <Select
              value={formData.meterSizeId}
              onChange={handleInputChange("meterSizeId")}
              label="Meter Size"
            >
              {meterSizes.map((meterSize) => (
                <MenuItem key={meterSize.id} value={meterSize.id}>
                  {meterSize.meterCode} - {meterSize.meterSize}
                </MenuItem>
              ))}
            </Select>
            {errors.meterSizeId && (
              <FormHelperText>{errors.meterSizeId}</FormHelperText>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Rent Amount (Birr)"
            type="number"
            value={formData.rentBirr}
            onChange={handleInputChange("rentBirr")}
            error={!!errors.rentBirr}
            helperText={errors.rentBirr}
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

export default MeterRentFormModal;
