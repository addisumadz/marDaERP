"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, CircularProgress, Divider } from "@mui/material";

const ViewUserRoleModal = ({ roleItem, open, onClose, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">User Role Details</Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : roleItem ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">ID</Typography>
              <Typography variant="body1">{roleItem.id}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Role Code</Typography>
              <Typography variant="body1">{roleItem.roleCode}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Role Name</Typography>
              <Typography variant="body1">{roleItem.roleName}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Store</Typography>
              <Typography variant="body1">{roleItem.isStore ? "Yes" : "No"}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Forman Expert</Typography>
              <Typography variant="body1">{roleItem.isFormanExpert ? "Yes" : "No"}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Water Meter Reader</Typography>
              <Typography variant="body1">{roleItem.isWaterMeterReader ? "Yes" : "No"}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="body1" sx={{ color: roleItem.deleted === "active" ? "success.main" : "error.main", fontWeight: "medium" }}>
                {roleItem.deleted === "active" ? "Active" : "Deleted"}
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

export default ViewUserRoleModal;
