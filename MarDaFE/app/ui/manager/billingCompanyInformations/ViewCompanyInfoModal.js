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

const ViewCompanyInfoModal = ({ info, open, onClose, isLoading }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">Company Information Details</Typography>
      </DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : info ? (
          <Box>
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">ID</Typography>
              <Typography variant="body1">{info.id}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Company Name</Typography>
              <Typography variant="body1">{info.companyName}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Company Logo</Typography>
              <Typography variant="body1">{info.companyLogo}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Motto</Typography>
              <Typography variant="body1">{info.motto}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Message</Typography>
              <Typography variant="body1">{info.message}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Additional Information</Typography>
              <Typography variant="body1">{info.additionalInformation}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Genzeb Sebsabe</Typography>
              <Typography variant="body1">{info.genzebSebsabe}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Deresegn Yemiaregagt</Typography>
              <Typography variant="body1">{info.deresegnYemiaregagt}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Deresegn Sebsabi Label</Typography>
              <Typography variant="body1">{info.deresegnSebsabiLabel || '-'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Deresegn Yemiaregagt Label</Typography>
              <Typography variant="body1">{info.deresegnYemiaregagtLabel || '-'}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Yeteganene Percent</Typography>
              <Typography variant="body1">{info.yeteganenePercent}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box mb={2}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Typography variant="body1" sx={{ color: info.status === "active" ? "success.main" : "error.main", fontWeight: "medium" }}>
                {info.status === "active" ? "Active" : "Deleted"}
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

export default ViewCompanyInfoModal;
