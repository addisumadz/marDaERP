import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Speed as SpeedIcon,
  MonetizationOn as MoneyIcon,
  Assignment as BlockIcon,
} from "@mui/icons-material";

const ViewTariffModal = ({ open, onClose, tariff, isLoading }) => {
  if (isLoading || !tariff) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6">Tariff Details {tariff?.id ? `(ID: ${tariff.id})` : ""}</Typography>
        <Button onClick={onClose} color="inherit" size="small" sx={{ minWidth: "auto", p: 1 }}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Chip
              label={tariff.status === "active" ? "Active" : "Deleted"}
              color={tariff.status === "active" ? "success" : "error"}
              variant="outlined"
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", mb: 2, fontWeight: 600 }}>
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} /> Customer Type
            </Typography>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Tariff ID:</strong> {tariff.id}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Customer Type:</strong> {tariff.customerTypeName || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Customer Type ID:</strong> {tariff.customerTypeId || "N/A"}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Tariff Configuration</Typography>
            <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BlockIcon sx={{ color: "secondary.main", fontSize: 20 }} />
                <Typography variant="body1"><strong>Block Name:</strong> {tariff.blockName}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <SpeedIcon sx={{ color: "info.main", fontSize: 20 }} />
                <Typography variant="body1"><strong>Consumption:</strong> {tariff.consumption}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MoneyIcon sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="body1"><strong>Tariff (Birr):</strong> {tariff.tarrifBirr}</Typography>
              </Box>
              <Box>
                <Chip label={tariff.isLast ? "Last Block" : "Not Last Block"} color={tariff.isLast ? "info" : "default"} size="small" />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewTariffModal;
