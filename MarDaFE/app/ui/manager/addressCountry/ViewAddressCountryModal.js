"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
var ethiopianDate = require("ethiopian-date");

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 1.5,
      borderBottom: "1px solid #eee",
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
      {label}:
    </Typography>
    <Typography variant="body1" align="right">
      {value || "—"}
    </Typography>
  </Box>
);

const ViewAddressCountryModal = ({ addressCountry, open, onClose, isLoading }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    
    try {
      const ethiopianFormatedDateArray = ethiopianDate.toEthiopian(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      );
      return `${ethiopianFormatedDateArray[2]}/${ethiopianFormatedDateArray[1]}/${ethiopianFormatedDateArray[0]}`;
    } catch (error) {
      return date.toLocaleDateString();
    }
  };

  const getRegisteredByName = (registeredBy) => {
    if (!registeredBy) return "—";
    if (registeredBy.fullName) return registeredBy.fullName;
    if (registeredBy.firstName || registeredBy.lastName) {
      return [registeredBy.firstName, registeredBy.midleName, registeredBy.lastName]
        .filter(Boolean)
        .join(' ');
    }
    return "—";
  };

  const getModifiedByName = (modifiedBy) => {
    if (!modifiedBy) return "—";
    if (modifiedBy.fullName) return modifiedBy.fullName;
    if (modifiedBy.firstName || modifiedBy.lastName) {
      return [modifiedBy.firstName, modifiedBy.midleName, modifiedBy.lastName]
        .filter(Boolean)
        .join(' ');
    }
    return "—";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Address Country Details
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !addressCountry ? (
          <Typography>No address country data available.</Typography>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <DetailItem label="ID" value={addressCountry.id} />
              <DetailItem label="Country Code" value={addressCountry.countryCode} />
              <DetailItem label="Country Name" value={addressCountry.countryName} />
              <DetailItem label="Continent" value={addressCountry.continent} />
              <DetailItem label="Status" value={addressCountry.status} />
              <DetailItem label="Deleted" value={addressCountry.deleted} />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Registration & Modification</Typography>
              <DetailItem label="Registered Date" value={formatDate(addressCountry.registeredDate)} />
              <DetailItem label="Registered By" value={getRegisteredByName(addressCountry.registeredBy)} />
              <DetailItem label="Modified Date" value={formatDate(addressCountry.modifiedDate)} />
              <DetailItem label="Modified By" value={getModifiedByName(addressCountry.modifiedBy)} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewAddressCountryModal;
