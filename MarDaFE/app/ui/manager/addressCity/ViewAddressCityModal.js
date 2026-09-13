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

const ViewAddressCityModal = ({
  open,
  onClose,
  addressCity,
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
        return "Inactive";
      default:
        return status || "Unknown";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Address City Details
      </DialogTitle>
      
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : addressCity ? (
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="City Code"
                value={addressCity.cityCode || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="City Name"
                value={addressCity.cityName || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Zone"
                value={addressCity.zoneName ? `${addressCity.zoneName} (${addressCity.zoneCode})` : "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={addressCity.stateName ? `${addressCity.stateName} (${addressCity.stateCode})` : "-"}
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
                  label={getStatusLabel(addressCity.status)}
                  color={getStatusColor(addressCity.status)}
                  variant="filled"
                />
              </Box>
            </Grid>

            {/* Geographic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Geographic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Center Latitude"
                value={addressCity.centerLatitude?.toFixed(6) || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Center Longitude"
                value={addressCity.centerLongitude?.toFixed(6) || "-"}
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

            <Grid item xs={12} sm={4}>
              <TextField
                label="Population Size"
                value={addressCity.populationSize?.toLocaleString() || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Public Tap Users"
                value={addressCity.publicTapUser?.toLocaleString() || "-"}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Average Household Size"
                value={addressCity.averageHouseHoldSize || "-"}
                fullWidth
                disabled
                variant="filled"
              />
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
                value={formatEthiopianDate(addressCity.registeredDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Modified Date"
                value={formatEthiopianDate(addressCity.modifiedDate)}
                fullWidth
                disabled
                variant="filled"
              />
            </Grid>

            {/* Additional Details */}
            {addressCity.id && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    System Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City ID"
                    value={addressCity.id || "-"}
                    fullWidth
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Zone ID"
                    value={addressCity.zoneId || "-"}
                    fullWidth
                    disabled
                    variant="filled"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="State ID"
                    value={addressCity.stateId || "-"}
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
              No address city data available.
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

export default ViewAddressCityModal;
