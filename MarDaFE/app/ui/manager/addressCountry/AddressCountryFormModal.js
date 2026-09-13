import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";

const AddressCountryFormModal = ({ open, onClose, onSubmit, addressCountry, isLoading }) => {
  const { control, handleSubmit, reset, formState: { isDirty } } = useForm({
    defaultValues: addressCountry || {
      countryCode: "",
      countryName: "",
      continent: "",
    },
  });

  const isEditMode = !!addressCountry;

  // Predefined continent options
  const continentOptions = [
    "Africa",
    "Antarctica", 
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America"
  ];

  // Effect 1: Reset the form whenever the modal opens or starts loading.
  useEffect(() => {
    if (open) {
      reset({
        countryCode: "",
        countryName: "",
        continent: "",
      });
    }
  }, [open, isLoading, reset]);

  // Effect 2: Populate the form with address country data once it has loaded.
  useEffect(() => {
    if (addressCountry && !isLoading) {
      reset(addressCountry);
    }
  }, [addressCountry, isLoading, reset]);

  const handleClose = () => {
    reset(); // Reset react-hook-form state
    onClose(); // Call parent onClose handler
  };

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      handleClose(); // Close modal only on successful submission and reset state
    } catch (error) {
      console.error("Failed to submit form:", error);
      // The modal will remain open, and you can add user-facing error handling here.
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {addressCountry ? "Edit Address Country" : "Create New Address Country"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ overflowY: "auto" }}>
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="countryCode"
                  control={control}
                  rules={{ 
                    required: "Country code is required",
                    maxLength: { value: 50, message: "Country code cannot exceed 50 characters" }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Country Code *"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : "Enter the country code (e.g., ET, US, GB)"}
                      placeholder="ET"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="countryName"
                  control={control}
                  rules={{ 
                    required: "Country name is required",
                    maxLength: { value: 150, message: "Country name cannot exceed 150 characters" }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      label="Country Name *"
                      variant="outlined"
                      fullWidth
                      error={!!error}
                      helperText={error ? error.message : "Enter the full country name"}
                      placeholder="Ethiopia"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="continent"
                  control={control}
                  rules={{ required: "Continent is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth variant="outlined" error={!!error}>
                      <InputLabel>Continent *</InputLabel>
                      <Select {...field} label="Continent *">
                        {continentOptions.map((continent) => (
                          <MenuItem key={continent} value={continent}>
                            {continent}
                          </MenuItem>
                        ))}
                      </Select>
                      {error && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {error.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              
              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      ID: {addressCountry?.id || "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {addressCountry?.registeredDate ? new Date(addressCountry.registeredDate).toLocaleDateString() : "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Last Modified: {addressCountry?.modifiedDate ? new Date(addressCountry.modifiedDate).toLocaleDateString() : "—"}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressCountryFormModal;
