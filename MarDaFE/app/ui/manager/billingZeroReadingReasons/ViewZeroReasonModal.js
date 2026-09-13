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

const ViewZeroReasonModal = ({ reason, open, onClose, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Zero Reading Reason Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : reason ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">ID</Typography>
              <Typography variant="body1">{reason.id}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Reason Code</Typography>
              <Typography variant="body1">{reason.reasonCode}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Reason Name</Typography>
              <Typography variant="body1">{reason.reasonName}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Zero Reading Reason</Typography>
              <Typography variant="body1">{reason.isZeroReadingReason ? "Yes" : "No"}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Door Close Reason</Typography>
              <Typography variant="body1">{reason.isDoorCloseReason ? "Yes" : "No"}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="body1" sx={{ color: reason.deleted === "active" ? "success.main" : "error.main", fontWeight: "medium" }}>
                {reason.deleted === "active" ? "Active" : "Deleted"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography>No data available</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewZeroReasonModal;
