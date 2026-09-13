"use client";
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

const ViewMeterSizeModal = ({ meterSize, open, onClose, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Meter Size Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : meterSize ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                ID
              </Typography>
              <Typography variant="body1">{meterSize.id}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Meter Code
              </Typography>
              <Typography variant="body1">{meterSize.meterCode}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Meter Size
              </Typography>
              <Typography variant="body1">
                {typeof meterSize.meterSize === 'number' 
                  ? meterSize.meterSize.toFixed(2) 
                  : meterSize.meterSize}
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
                  color: meterSize.deleted === "active" ? "success.main" : "error.main",
                  fontWeight: "medium"
                }}
              >
                {meterSize.deleted === "active" ? "Active" : "Deleted"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography>No meter size data available</Typography>
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

export default ViewMeterSizeModal;
