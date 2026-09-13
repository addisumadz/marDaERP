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

const ViewAddressKetenaModal = ({
  open,
  onClose,
  addressKetena,
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
    if (deleted === "deleted") {
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
        Address Ketena Details
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : addressKetena ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ketena Code"
                value={addressKetena.ketenaCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Ketena Name"
                value={addressKetena.ketenaName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Population Size"
                value={addressKetena.populationSize?.toLocaleString() || "-"}
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
                {getStatusChip(addressKetena.status, addressKetena.deleted)}
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
                label="Kebele"
                value={addressKetena.streetsName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kebele Code"
                value={addressKetena.streetsCode || "-"}
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
                label="City Code"
                value={addressKetena.cityCode || "-"}
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
                label="Zone Code"
                value={addressKetena.zoneCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={addressKetena.stateName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={addressKetena.countryName || "-"}
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
                value={addressKetena.registeredByUserName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Modified By"
                value={addressKetena.modifiedByUserName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Registered Date"
                value={formatEthiopianDate(addressKetena.registeredDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Modified Date"
                value={formatEthiopianDate(addressKetena.modifiedDate)}
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
                label="Ketena ID"
                value={addressKetena.id || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Kebele ID"
                value={addressKetena.streetsId || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>
          </Grid>
        ) : (
          <Typography>No ketena data available</Typography>
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

export default ViewAddressKetenaModal;
