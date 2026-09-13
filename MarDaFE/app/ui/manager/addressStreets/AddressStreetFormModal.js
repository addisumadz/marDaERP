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

const AddressStreetFormModal = ({
  open,
  onClose,
  onSubmit,
  addressStreet,
  isLoading,
  cities = [],
}) => {
  const isEditMode = !!addressStreet;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      streetsCode: "",
      streetsName: "",
      addressStreetsNumber: "",
      cityId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && addressStreet) {
        reset({
          streetsCode: addressStreet.streetsCode || "",
          streetsName: addressStreet.streetsName || "",
          addressStreetsNumber: addressStreet.addressStreetsNumber || "",
          cityId: addressStreet.cityId || "",
        });
      } else {
        reset({
          streetsCode: "",
          streetsName: "",
          addressStreetsNumber: "",
          cityId: "",
        });
      }
    }
  }, [open, isEditMode, addressStreet, reset]);

  const handleFormSubmit = async (data) => {
    try {
      // Convert string numbers to actual numbers and set default values
      const formattedData = {
        ...data,
        addressStreetsNumber: data.addressStreetsNumber ? parseInt(data.addressStreetsNumber) : 0,
        populationSize: 1000, // Default value as per city implementation
        cityId: parseInt(data.cityId),
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
        {isEditMode ? "Edit Address Kebele" : "Create Address Kebele"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !addressStreet && isEditMode ? (
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
                  name="streetsCode"
                  control={control}
                  rules={{
                    required: "Kebele code is required",
                    maxLength: {
                      value: 20,
                      message: "Kebele code must be at most 20 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kebele Code"
                      fullWidth
                      error={!!errors.streetsCode}
                      helperText={errors.streetsCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="streetsName"
                  control={control}
                  rules={{
                    required: "Kebele name is required",
                    maxLength: {
                      value: 150,
                      message: "Kebele name must be at most 150 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kebele Name"
                      fullWidth
                      error={!!errors.streetsName}
                      helperText={errors.streetsName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="addressStreetsNumber"
                  control={control}
                  rules={{
                    min: {
                      value: 0,
                      message: "Kebele number must be non-negative"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Kebele Number (Optional)"
                      type="number"
                      fullWidth
                      error={!!errors.addressStreetsNumber}
                      helperText={errors.addressStreetsNumber?.message}
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
                  name="cityId"
                  control={control}
                  rules={{
                    required: "City is required",
                    validate: value => value !== "" || "Please select a valid city"
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.cityId}>
                      <InputLabel>City</InputLabel>
                      <Select
                        {...field}
                        label="City"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Select a city</em>
                        </MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city.id} value={city.id}>
                            {city.cityName} ({city.cityCode}) - {city.zoneName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.cityId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.cityId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && addressStreet && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="City"
                      value={addressStreet.cityName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Zone"
                      value={addressStreet.zoneName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Population Size"
                      value={addressStreet.populationSize?.toLocaleString() || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={addressStreet.status === "active" ? "Active" : "Inactive"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered By"
                      value={addressStreet.registeredByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Modified By"
                      value={addressStreet.modifiedByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered Date"
                      value={
                        addressStreet.registeredDate
                          ? new Date(addressStreet.registeredDate).toLocaleDateString()
                          : "-"
                      }
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Modified Date"
                      value={
                        addressStreet.modifiedDate
                          ? new Date(addressStreet.modifiedDate).toLocaleDateString()
                          : "-"
                      }
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
            disabled={isSubmitting || (isLoading && !addressStreet && isEditMode)}
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

export default AddressStreetFormModal;
