"use client";
import React from "react";
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
  Chip,
} from "@mui/material";

const ViewBillingBankModal = ({
  open,
  onClose,
  billingBank,
  isLoading,
}) => {
  const getStatusChip = (deleted) => {
    if (deleted === "yes") {
      return <Chip label="Deleted" color="error" size="small" />;
    }
    
    return <Chip label="Active" color="success" size="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Billing Bank Details
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : billingBank ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Gateway Code"
                value={billingBank.gatewayCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bank Code"
                value={billingBank.bankCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bank Name"
                value={billingBank.bankName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                {getStatusChip(billingBank.deleted)}
              </Box>
            </Grid>

            {/* Visual Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Visual Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Bank Color"
                value={billingBank.bankColor || "-"}
                fullWidth
                disabled
                variant="filled"
                InputProps={{
                  startAdornment: billingBank.bankColor && (
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: billingBank.bankColor, 
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        mr: 1
                      }} 
                    />
                  ),
                }}
              />
            </Grid>

            {/* ID Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                ID Information
              </Typography>
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
          </Grid>
        ) : (
          <Typography>No bank data available</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewBillingBankModal;
