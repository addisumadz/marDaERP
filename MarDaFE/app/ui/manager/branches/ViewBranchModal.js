"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Divider } from "@mui/material";

const ViewBranchModal = ({ branch, open, onClose, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Branch Details</Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : branch ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">ID</Typography>
              <Typography variant="body1">{branch.id}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Branch Code</Typography>
              <Typography variant="body1">{branch.branchCode}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Description</Typography>
              <Typography variant="body1">{branch.branchDescription}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Office Level</Typography>
              <Typography variant="body1">{branch.officeLevel}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Kebele</Typography>
              <Typography variant="body1">{branch.branchKebeleName || `#${branch.branchKebeleId}`}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="body1" sx={{ color: branch.deleted === "active" ? "success.main" : "error.main", fontWeight: "medium" }}>
                {branch.deleted === "active" ? "Active" : "Deleted"}
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

export default ViewBranchModal;
