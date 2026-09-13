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

const AddressCityFormModal = ({
  open,
  onClose,
  onSubmit,
  addressCity,
  isLoading,
  zones = [],
}) => {
  const isEditMode = !!addressCity;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      cityCode: "",
      cityName: "",
      centerLatitude: "",
      centerLongitude: "",
      zoneId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && addressCity) {
        reset({
          cityCode: addressCity.cityCode || "",
          cityName: addressCity.cityName || "",
          centerLatitude: addressCity.centerLatitude || "",
          centerLongitude: addressCity.centerLongitude || "",
          zoneId: addressCity.zoneId || "",
        });
      } else {
        reset({
          cityCode: "",
          cityName: "",
          centerLatitude: "",
          centerLongitude: "",
          zoneId: "",
        });
      }
    }
  }, [open, isEditMode, addressCity, reset]);

  const handleFormSubmit = async (data) => {
    try {
      // Convert string numbers to actual numbers and set default values for demographic fields
      const formattedData = {
        ...data,
        centerLatitude: data.centerLatitude ? parseFloat(data.centerLatitude) : null,
        centerLongitude: data.centerLongitude ? parseFloat(data.centerLongitude) : null,
        populationSize: 1000, // Default value
        publicTapUser: 1000, // Default value
        averageHouseHoldSize: 1000, // Default value
        zoneId: parseInt(data.zoneId),
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
        {isEditMode ? "Edit Address City" : "Create Address City"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !addressCity && isEditMode ? (
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
                  name="cityCode"
                  control={control}
                  rules={{
                    required: "City code is required",
                    maxLength: {
                      value: 50,
                      message: "City code must be at most 50 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City Code"
                      fullWidth
                      error={!!errors.cityCode}
                      helperText={errors.cityCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="cityName"
                  control={control}
                  rules={{
                    required: "City name is required",
                    maxLength: {
                      value: 150,
                      message: "City name must be at most 150 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City Name"
                      fullWidth
                      error={!!errors.cityName}
                      helperText={errors.cityName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="zoneId"
                  control={control}
                  rules={{
                    required: "Zone is required",
                    validate: value => value !== "" || "Please select a valid zone"
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.zoneId}>
                      <InputLabel>Zone</InputLabel>
                      <Select
                        {...field}
                        label="Zone"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Select a zone</em>
                        </MenuItem>
                        {zones.map((zone) => (
                          <MenuItem key={zone.id} value={zone.id}>
                            {zone.zoneName} ({zone.zoneCode}) - {zone.stateName}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.zoneId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.zoneId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Geographic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Geographic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="centerLatitude"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^-?([1-8]?[1-9]|[1-9]0)\.{1}\d{1,6}$/,
                      message: "Please enter a valid latitude"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Center Latitude (Optional)"
                      type="number"
                      fullWidth
                      error={!!errors.centerLatitude}
                      helperText={errors.centerLatitude?.message}
                      disabled={isSubmitting}
                      inputProps={{
                        step: "0.000001",
                        min: "-90",
                        max: "90"
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="centerLongitude"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^-?([1]?[1-7][1-9]|[1]?[1-8][0]|[1-9]?[0-9])\.{1}\d{1,6}$/,
                      message: "Please enter a valid longitude"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Center Longitude (Optional)"
                      type="number"
                      fullWidth
                      error={!!errors.centerLongitude}
                      helperText={errors.centerLongitude?.message}
                      disabled={isSubmitting}
                      inputProps={{
                        step: "0.000001",
                        min: "-180",
                        max: "180"
                      }}
                    />
                  )}
                />
              </Grid>


              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && addressCity && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Zone"
                      value={addressCity.zoneName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="State"
                      value={addressCity.stateName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={addressCity.status === "active" ? "Active" : "Inactive"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered By"
                      value={addressCity.registeredByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Modified By"
                      value={addressCity.modifiedByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered Date"
                      value={
                        addressCity.registeredDate
                          ? new Date(addressCity.registeredDate).toLocaleDateString()
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
                        addressCity.modifiedDate
                          ? new Date(addressCity.modifiedDate).toLocaleDateString()
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
            disabled={isSubmitting || (isLoading && !addressCity && isEditMode)}
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

export default AddressCityFormModal;
