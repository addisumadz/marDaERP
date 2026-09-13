"use client";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

const AddressKetenaFormModal = ({
  open,
  onClose,
  onSubmit,
  addressKetena,
  isLoading,
  streets = [],
}) => {
  const isEditMode = !!addressKetena;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ketenaCode: "",
      ketenaName: "",
      populationSize: "",
      streetsId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && addressKetena) {
        reset({
          ketenaCode: addressKetena.ketenaCode || "",
          ketenaName: addressKetena.ketenaName || "",
          populationSize: addressKetena.populationSize?.toString() || "",
          streetsId: addressKetena.streetsId || "",
        });
      } else {
        reset({
          ketenaCode: "",
          ketenaName: "",
          populationSize: "",
          streetsId: "",
        });
      }
    }
  }, [open, isEditMode, addressKetena, reset]);

  const handleFormSubmit = async (data) => {
    try {
      // Convert string numbers to actual numbers
      const formattedData = {
        ...data,
        populationSize: data.populationSize ? parseInt(data.populationSize) : 0,
        streetsId: parseInt(data.streetsId),
      };
      
      await onSubmit(formattedData);
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEditMode ? "Edit Address Ketena" : "Create Address Ketena"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !addressKetena && isEditMode ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="ketenaCode"
                  control={control}
                  rules={{
                    required: "Ketena code is required",
                    maxLength: {
                      value: 20,
                      message: "Ketena code must be at most 20 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ketena Code"
                      fullWidth
                      error={!!errors.ketenaCode}
                      helperText={errors.ketenaCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="ketenaName"
                  control={control}
                  rules={{
                    required: "Ketena name is required",
                    maxLength: {
                      value: 150,
                      message: "Ketena name must be at most 150 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Ketena Name"
                      fullWidth
                      error={!!errors.ketenaName}
                      helperText={errors.ketenaName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="populationSize"
                  control={control}
                  rules={{
                    required: "Population size is required",
                    min: {
                      value: 0,
                      message: "Population size must be non-negative"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Population Size"
                      type="number"
                      fullWidth
                      error={!!errors.populationSize}
                      helperText={errors.populationSize?.message}
                      disabled={isSubmitting}
                      inputProps={{
                        min: "0"
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="streetsId"
                  control={control}
                  rules={{
                    required: "Kebele is required",
                    validate: value => value !== "" || "Please select a valid kebele"
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.streetsId}>
                      <InputLabel>Kebele</InputLabel>
                      <Select
                        {...field}
                        label="Kebele"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Select a kebele</em>
                        </MenuItem>
                        {streets.map((street) => (
                          <MenuItem key={street.id} value={street.id}>
                            {street.streetsName} ({street.streetsCode}) - {street.cityName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.streetsId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.streetsId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && addressKetena && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Kebele"
                      value={addressKetena.streetsName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      value={addressKetena.cityName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Zone"
                      value={addressKetena.zoneName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={addressKetena.deleted === "active" ? "Active" : "Inactive"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || (isLoading && !addressKetena && isEditMode)}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditMode ? "Update" : "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddressKetenaFormModal;
