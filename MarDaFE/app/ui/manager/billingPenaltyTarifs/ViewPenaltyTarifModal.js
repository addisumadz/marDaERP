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
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

const ViewPenaltyTarifModal = ({ open, onClose, penaltyTarif }) => {
  if (!penaltyTarif) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 200,
            }}
          >
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div">
          Penalty Tarif Details
        </Typography>
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{ minWidth: "auto", p: 1 }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Status */}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Chip
              label={penaltyTarif.deleted === "active" ? "Active" : "Deleted"}
              color={penaltyTarif.deleted === "active" ? "success" : "error"}
              variant="outlined"
            />
          </Box>

          {/* Customer Type Information */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", mb: 2, fontWeight: 600 }}
            >
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
              Customer Type Information
            </Typography>
            <Box sx={{ pl: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Customer Type:</strong> {penaltyTarif.customerTypeName || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Customer Type ID:</strong> {penaltyTarif.customerTypeId || "N/A"}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Configuration */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Configuration
            </Typography>
            <Box sx={{ pl: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ScheduleIcon sx={{ color: "info.main", fontSize: 20 }} />
                <Typography variant="body1">
                  <strong>Number of Months:</strong> {penaltyTarif.numberOfMonth} {penaltyTarif.numberOfMonth === 1 ? "month" : "months"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ mr: 1 }}><strong>Mode:</strong></Typography>
                <Chip label={penaltyTarif.isPercent ? "Is Percent" : "Is Percent: Off"} color={penaltyTarif.isPercent ? "info" : "default"} size="small" />
                <Chip label={penaltyTarif.bewerBzatYbaza ? "Bewer Bzat Ybaza" : "Bewer Bzat Ybaza: Off"} color={penaltyTarif.bewerBzatYbaza ? "success" : "default"} size="small" />
                <Chip label={penaltyTarif.weruLayDemr ? "Weru Lay Demr" : "Weru Lay Demr: Off"} color={penaltyTarif.weruLayDemr ? "success" : "default"} size="small" />
                <Chip label={penaltyTarif.enaKezihBelay ? "Ena Kezih Belay: On" : "Ena Kezih Belay: Off"} color={penaltyTarif.enaKezihBelay ? "secondary" : "default"} size="small" />
              </Box>

              <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Typography variant="body1">
                  <strong>Penalty:</strong> {penaltyTarif.penalityBirr}
                </Typography>
                <Typography variant="body1">
                  <strong>Additional Penalty:</strong> {penaltyTarif.additionalPenalty}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Removed remark section as per requirement */}

          <Divider />

          {/* Audit Information */}
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ display: "flex", alignItems: "center", mb: 2, fontWeight: 600 }}
            >
              <CalendarIcon sx={{ mr: 1, color: "text.secondary" }} />
              Audit Information
            </Typography>
            <Box sx={{ pl: 4, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Created Date:</strong> {formatDate(penaltyTarif.createdDate)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Created By:</strong> {penaltyTarif.createdBy || "N/A"}
              </Typography>
              {penaltyTarif.updatedDate && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Last Updated:</strong> {formatDate(penaltyTarif.updatedDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Updated By:</strong> {penaltyTarif.updatedBy || "N/A"}
                  </Typography>
                </>
              )}
              {penaltyTarif.deletedDate && (
                <>
                  <Typography variant="body2" color="error">
                    <strong>Deleted Date:</strong> {formatDate(penaltyTarif.deletedDate)}
                  </Typography>
                  <Typography variant="body2" color="error">
                    <strong>Deleted By:</strong> {penaltyTarif.deletedBy || "N/A"}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPenaltyTarifModal;
