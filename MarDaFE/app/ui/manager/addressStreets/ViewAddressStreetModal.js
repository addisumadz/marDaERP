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

const ViewAddressStreetModal = ({
  open,
  onClose,
  addressStreet,
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

  const getStatusChip = (status, deleted) => {
    if (deleted === "yes") {
      return <Chip label="Deleted" color="error" size="small" />;
    }
    
    return (
      <Chip
        label={status === "active" ? "Active" : "Inactive"}
        color={status === "active" ? "success" : "default"}
        size="small"
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Address Kebele Details
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : addressStreet ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kebele Code"
                value={addressStreet.streetsCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kebele Name"
                value={addressStreet.streetsName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kebele Number"
                value={addressStreet.addressStreetsNumber || "-"}
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
                {getStatusChip(addressStreet.status, addressStreet.deleted)}
              </Box>
            </Grid>

            {/* Location Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location Information
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
                label="City Code"
                value={addressStreet.cityCode || "-"}
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
                label="Zone Code"
                value={addressStreet.zoneCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={addressStreet.stateName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={addressStreet.countryName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            {/* Demographic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Demographic Information
              </Typography>
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

            {/* System Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                System Information
              </Typography>
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
                value={formatEthiopianDate(addressStreet.registeredDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Modified Date"
                value={formatEthiopianDate(addressStreet.modifiedDate)}
                fullWidth
                disabled
                variant="filled"
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
                label="Kebele ID"
                value={addressStreet.id || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="City ID"
                value={addressStreet.cityId || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>
          </Grid>
        ) : (
          <Typography>No kebele data available</Typography>
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

export default ViewAddressStreetModal;
