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
var ethiopianDate = require("ethiopian-date");

const ViewAddressStateModal = ({
  open,
  onClose,
  addressState,
  isLoading,
}) => {
  const formatEthiopianDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      const ethiopianFormatedDateArray = ethiopianDate.toEthiopian(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      return `${ethiopianFormatedDateArray[2]}/${ethiopianFormatedDateArray[1]}/${ethiopianFormatedDateArray[0]}`;
    } catch (error) {
      return "-";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "deleted":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "deleted":
        return "Deleted";
      default:
        return status || "Unknown";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Address State Details
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : addressState ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State Code"
                value={addressState.stateCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State Name"
                value={addressState.stateName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={addressState.countryName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={getStatusLabel(addressState.status)}
                  color={getStatusColor(addressState.status)}
                  variant="filled"
                />
              </Box>
            </Grid>

            {/* Audit Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Audit Information
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
                value={formatEthiopianDate(addressState.registeredDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Modified Date"
                value={formatEthiopianDate(addressState.modifiedDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            {/* Additional Details */}
            {addressState.id && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    System Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="State ID"
                    value={addressState.id || "-"}
                    fullWidth
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Country ID"
                    value={addressState.countryId || "-"}
                    fullWidth
                    disabled
                    variant="filled"
                  />
                </Grid>
              </>
            )}
          </Grid>
        ) : (
          <Box p={3}>
            <Typography variant="body1" color="textSecondary">
              No address state data available.
            </Typography>
          </Box>
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

export default ViewAddressStateModal;
