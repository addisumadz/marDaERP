"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Alert,
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PaymentsIcon from "@mui/icons-material/Payments";

const BulkActionsDialogs = ({
  // Assign Reader Dialog
  assignDialogOpen,
  onAssignClose,
  onAssignConfirm,
  assignReaderId,
  onAssignReaderIdChange,
  readers = [],
  isReadersLoading = false,
  selectedBranchId = "",
  branches = [],
  onBranchChange,
  targetCustomerCount = 0,
  // Bulk Additional Monthly Payment Dialog
  bulkPaymentOpen,
  onPaymentClose,
  onPaymentConfirm,
  paymentValue,
  onPaymentValueChange,
  // Bulk Techemari (Additional Fee) Dialog
  bulkTechemariOpen,
  onTechemariClose,
  onTechemariConfirm,
  techemariName,
  onTechemariNameChange,
  techemariAmount,
  onTechemariAmountChange,
}) => {
  return (
    <>
      {/* Assign Reader Dialog */}
      <Dialog open={assignDialogOpen} onClose={onAssignClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AssignmentIndIcon color="primary" />
          <span>Assign Mobile Reader to Customers</span>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="info">
              Assigning mobile meter reader to <strong>{targetCustomerCount}</strong> selected customer(s).
            </Alert>

            {/* Branch Selector if not pre-filtered */}
            {branches?.length > 0 && onBranchChange && (
              <FormControl size="small" fullWidth>
                <InputLabel>Branch (Select to load readers)</InputLabel>
                <Select
                  label="Branch (Select to load readers)"
                  value={selectedBranchId || ""}
                  onChange={(e) => onBranchChange(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select Branch</em>
                  </MenuItem>
                  {branches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name || `Branch ${b.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Reader Selector */}
            <FormControl size="small" fullWidth disabled={!selectedBranchId || isReadersLoading}>
              <InputLabel>Mobile Meter Reader *</InputLabel>
              <Select
                label="Mobile Meter Reader *"
                value={assignReaderId}
                onChange={(e) => onAssignReaderIdChange(e.target.value)}
              >
                <MenuItem value="">
                  <em>Select Reader</em>
                </MenuItem>
                {isReadersLoading ? (
                  <MenuItem disabled>Loading readers...</MenuItem>
                ) : readers?.length > 0 ? (
                  readers.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name || `Reader ${r.id}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No readers found for this branch</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onAssignClose}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onAssignConfirm}
            disabled={!assignReaderId || targetCustomerCount === 0}
          >
            Assign ({targetCustomerCount})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Additional Monthly Payment (Dry Waste) Dialog */}
      <Dialog open={bulkPaymentOpen} onClose={onPaymentClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CleaningServicesIcon color="warning" />
          <span>Update Dry Waste Monthly Fee</span>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="warning">
              Updating dry waste fee for <strong>{targetCustomerCount}</strong> selected customer(s).
            </Alert>
            <TextField
              autoFocus
              label="Monthly Fee Amount (ETB) *"
              type="number"
              fullWidth
              size="small"
              value={paymentValue}
              onChange={(e) => onPaymentValueChange(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">ETB</InputAdornment>,
              }}
              helperText="Set to 0 to remove monthly dry waste fee"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onPaymentClose}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={onPaymentConfirm}
            disabled={paymentValue === "" || targetCustomerCount === 0}
          >
            Apply to {targetCustomerCount} Customers
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Techemari (Additional Fee) Dialog */}
      <Dialog open={bulkTechemariOpen} onClose={onTechemariClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PaymentsIcon color="success" />
          <span>Update Additional Fee (Techemari)</span>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Alert severity="info">
              Updating custom additional fee for <strong>{targetCustomerCount}</strong> selected customer(s).
            </Alert>
            <TextField
              autoFocus
              label="Fee Name (e.g. Maintenance Fee)"
              type="text"
              fullWidth
              size="small"
              value={techemariName}
              onChange={(e) => onTechemariNameChange(e.target.value)}
            />
            <TextField
              label="Fee Amount (ETB) *"
              type="number"
              fullWidth
              size="small"
              value={techemariAmount}
              onChange={(e) => onTechemariAmountChange(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">ETB</InputAdornment>,
              }}
              helperText="Set to 0 to clear fee amount"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onTechemariClose}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={onTechemariConfirm}
            disabled={techemariAmount === "" || targetCustomerCount === 0}
          >
            Apply to {targetCustomerCount} Customers
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActionsDialogs;
