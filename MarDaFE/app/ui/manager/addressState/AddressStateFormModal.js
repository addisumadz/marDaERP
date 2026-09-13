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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const validationSchema = yup.object({
  stateCode: yup
    .string()
    .required("State code is required")
    .max(10, "State code must be at most 10 characters"),
  stateName: yup
    .string()
    .required("State name is required")
    .max(100, "State name must be at most 100 characters"),
  countryId: yup
    .number()
    .required("Country is required")
    .positive("Please select a valid country"),
});

const AddressStateFormModal = ({
  open,
  onClose,
  onSubmit,
  addressState,
  isLoading,
  countries = [],
}) => {
  const isEditMode = !!addressState;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      stateCode: "",
      stateName: "",
      countryId: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && addressState) {
        reset({
          stateCode: addressState.stateCode || "",
          stateName: addressState.stateName || "",
          countryId: addressState.countryId || "",
        });
      } else {
        reset({
          stateCode: "",
          stateName: "",
          countryId: "",
        });
      }
    }
  }, [open, isEditMode, addressState, reset]);

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
        {isEditMode ? "Edit Address State" : "Create Address State"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !addressState && isEditMode ? (
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
                  name="stateCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="State Code"
                      fullWidth
                      error={!!errors.stateCode}
                      helperText={errors.stateCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="stateName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="State Name"
                      fullWidth
                      error={!!errors.stateName}
                      helperText={errors.stateName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="countryId"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.countryId}>
                      <InputLabel>Country</InputLabel>
                      <Select
                        {...field}
                        label="Country"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Select a country</em>
                        </MenuItem>
                        {countries.map((country) => (
                          <MenuItem key={country.id} value={country.id}>
                            {country.countryName} ({country.countryCode})
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.countryId && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                          {errors.countryId.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && addressState && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered By"
                      value={addressState.registeredByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Modified By"
                      value={addressState.modifiedByUserName || "-"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Registered Date"
                      value={
                        addressState.registeredDate
                          ? new Date(addressState.registeredDate).toLocaleDateString()
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
                        addressState.modifiedDate
                          ? new Date(addressState.modifiedDate).toLocaleDateString()
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
            disabled={isSubmitting || (isLoading && !addressState && isEditMode)}
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

export default AddressStateFormModal;
