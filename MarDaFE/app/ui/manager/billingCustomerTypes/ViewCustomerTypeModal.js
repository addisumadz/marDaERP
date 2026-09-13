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

const ViewCustomerTypeModal = ({ customerType, open, onClose, isLoading }) => {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Customer Type Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : customerType ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                ID
              </Typography>
              <Typography variant="body1">{customerType.id}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Customer Type
              </Typography>
              <Typography variant="body1">{customerType.customerType}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Description
              </Typography>
              <Typography variant="body1">{customerType.description}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Techemari Kfya
              </Typography>
              <Typography variant="body1">
                {typeof customerType.techemariKfya === 'number' 
                  ? customerType.techemariKfya.toFixed(2) 
                  : customerType.techemariKfya}
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
                  color: customerType.deleted === "active" ? "success.main" : "error.main",
                  fontWeight: "medium"
                }}
              >
                {customerType.deleted === "active" ? "Active" : "Deleted"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography>No customer type data available</Typography>
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

export default ViewCustomerTypeModal;
