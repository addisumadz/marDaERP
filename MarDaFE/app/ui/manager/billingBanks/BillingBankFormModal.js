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
  Typography,
  Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

const BillingBankFormModal = ({
  open,
  onClose,
  onSubmit,
  billingBank,
  isLoading,
}) => {
  const isEditMode = !!billingBank;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      gatewayCode: "",
      bankCode: "",
      bankName: "",
      bankColor: "#000000",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditMode && billingBank) {
        reset({
          gatewayCode: billingBank.gatewayCode || "",
          bankCode: billingBank.bankCode || "",
          bankName: billingBank.bankName || "",
          bankColor: billingBank.bankColor || "#000000",
        });
      } else {
        reset({
          gatewayCode: "",
          bankCode: "",
          bankName: "",
          bankColor: "#000000",
        });
      }
    }
  }, [open, isEditMode, billingBank, reset]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
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
        {isEditMode ? "Edit Billing Bank" : "Create Billing Bank"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          {isLoading && !billingBank && isEditMode ? (
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
                  name="gatewayCode"
                  control={control}
                  rules={{
                    required: "Gateway code is required",
                    maxLength: {
                      value: 50,
                      message: "Gateway code must be at most 50 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Gateway Code"
                      fullWidth
                      error={!!errors.gatewayCode}
                      helperText={errors.gatewayCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="bankCode"
                  control={control}
                  rules={{
                    required: "Bank code is required",
                    maxLength: {
                      value: 100,
                      message: "Bank code must be at most 100 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bank Code"
                      fullWidth
                      error={!!errors.bankCode}
                      helperText={errors.bankCode?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="bankName"
                  control={control}
                  rules={{
                    required: "Bank name is required",
                    maxLength: {
                      value: 100,
                      message: "Bank name must be at most 100 characters"
                    }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bank Name"
                      fullWidth
                      error={!!errors.bankName}
                      helperText={errors.bankName?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="bankColor"
                  control={control}
                  rules={{
                    required: "Bank color is required",
                    maxLength: {
                      value: 100,
                      message: "Bank color must be at most 100 characters"
                    }
                  }}
                  render={({ field }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <TextField
                        {...field}
                        label="Bank Color"
                        fullWidth
                        error={!!errors.bankColor}
                        helperText={errors.bankColor?.message}
                        disabled={isSubmitting}
                        placeholder="#000000 or color name"
                      />
                      <input
                        type="color"
                        value={field.value.startsWith('#') ? field.value : '#000000'}
                        onChange={(e) => field.onChange(e.target.value)}
                        style={{
                          width: '50px',
                          height: '40px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        disabled={isSubmitting}
                      />
                    </Box>
                  )}
                />
              </Grid>

              {/* Additional Information (Edit Mode Only) */}
              {isEditMode && billingBank && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Additional Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Status"
                      value={billingBank.deleted === "no" ? "Active" : "Deleted"}
                      fullWidth
                      disabled
                      variant="filled"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Bank ID"
                      value={billingBank.id || "-"}
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
            disabled={isSubmitting || (isLoading && !billingBank && isEditMode)}
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

export default BillingBankFormModal;
