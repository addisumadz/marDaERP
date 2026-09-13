import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  ToggleOn as ActivateIcon,
  ToggleOff as DeactivateIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

const PenaltyTarifStatusModal = ({ open, onClose, mode, penaltyTarifId, onConfirm, isLoading }) => {
  const isActivate = mode === "activate";
  const actionText = isActivate ? "Activate" : "Deactivate";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isActivate ? (
            <ActivateIcon color="success" />
          ) : (
            <DeactivateIcon color="warning" />
          )}
          <Typography variant="h6" component="div">
            {actionText} Penalty Tarif
          </Typography>
        </Box>
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{ minWidth: "auto", p: 1 }}
          disabled={isLoading}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Warning Alert */}
          <Alert
            severity={isActivate ? "info" : "warning"}
            icon={<WarningIcon />}
          >
            <Typography variant="body2">
              Are you sure you want to {actionText.toLowerCase()} this penalty tarif?
              {!isActivate && " This will make it unavailable for new billing calculations."}
            </Typography>
          </Alert>
          {/* Confirmation Text */}
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            This action will be logged and can be tracked in the system audit trail.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm?.()}
          variant="contained"
          color={isActivate ? "success" : "warning"}
          disabled={isLoading}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} />
            ) : isActivate ? (
              <ActivateIcon />
            ) : (
              <DeactivateIcon />
            )
          }
        >
          {isLoading ? "Processing..." : actionText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PenaltyTarifStatusModal;
