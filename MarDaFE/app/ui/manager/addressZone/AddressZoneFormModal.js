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

const AddressZoneFormModal = ({
  open,
  onClose,
  onSubmit,
  addressZone,
  isLoading,
  states = [],
}) => {
  const isEditMode = !!addressZone;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      zoneCode: "",
      zoneName: "",
      stateId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && addressZone) {
        reset({
          zoneCode: addressZone.zoneCode || "",
          zoneName: addressZone.zoneName || "",
          stateId: addressZone.stateId || "",
        });
      } else {
        reset({
          zoneCode: "",
          zoneName: "",
          stateId: "",
        });
      }
    }
  }, [open, isEditMode, addressZone, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
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
        {isEditMode ? "Edit Address Zone" : "Create Address Zone"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !addressZone && isEditMode ? (
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

              <Grid item xs={12}>
                <Controller
                  name="zoneCode"
                  control={control}
                  rules={{
                    required: "Zone code is required",
                    maxLength: {
                      value: 10,
                      message: "Zone code must be at most 10 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zone Code"
                      fullWidth
                      error={!!errors.zoneCode}
                      helperText={errors.zoneCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="zoneName"
                  control={control}
                  rules={{
                    required: "Zone name is required",
                    maxLength: {
                      value: 100,
                      message: "Zone name must be at most 100 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zone Name"
                      fullWidth
                      error={!!errors.zoneName}
                      helperText={errors.zoneName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="stateId"
                  control={control}
                  rules={{
                    required: "State is required",
                    validate: value => value !== "" || "Please select a valid state"
                  }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.stateId}>
                      <InputLabel>State</InputLabel>
                      <Select
                        {...field}
                        label="State"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Select a state</em>
                        </MenuItem>
                        {states.map((state) => (
                          <MenuItem key={state.id} value={state.id}>
                            {state.stateName} ({state.stateCode})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.stateId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.stateId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && addressZone && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="State"
                      value={addressZone.stateName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={addressZone.status === 1 ? "Active" : "Inactive"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered By"
                      value={addressZone.registeredByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Modified By"
                      value={addressZone.modifiedByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered Date"
                      value={
                        addressZone.registeredDate
                          ? new Date(addressZone.registeredDate).toLocaleDateString()
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
                        addressZone.modifiedDate
                          ? new Date(addressZone.modifiedDate).toLocaleDateString()
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
            disabled={isSubmitting || (isLoading && !addressZone && isEditMode)}
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

export default AddressZoneFormModal;
