import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";

const ViewMeterRentModal = ({ meterRent, open, onClose, isLoading }) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Meter Rent Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : meterRent ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                ID
              </Typography>
              <Typography variant="body1">{meterRent.id}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer Type
              </Typography>
              <Typography variant="body1">{meterRent.customerTypeName}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Meter Code
              </Typography>
              <Typography variant="body1">{meterRent.meterCode}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Meter Size
              </Typography>
              <Typography variant="body1">
                {typeof meterRent.meterSize === 'number' 
                  ? meterRent.meterSize.toFixed(2) 
                  : meterRent.meterSize}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Rent Amount (Birr)
              </Typography>
              <Typography variant="body1">
                {typeof meterRent.rentBirr === 'number' 
                  ? meterRent.rentBirr.toFixed(2) 
                  : meterRent.rentBirr}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Status
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: meterRent.status === "active" ? "success.main" : "error.main",
                  fontWeight: "medium"
                }}
              >
                {meterRent.status === "active" ? "Active" : "Deleted"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography>No meter rent data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewMeterRentModal;
