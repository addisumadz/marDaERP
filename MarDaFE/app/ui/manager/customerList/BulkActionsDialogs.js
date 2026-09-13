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
} from "@mui/material";

const BulkActionsDialogs = ({
  // Assign Reader Dialog
  assignDialogOpen,
  onAssignClose,
  onAssignConfirm,
  assignReaderId,
  onAssignReaderIdChange,
  readers,
  isReadersLoading,
  selectedBranchId,
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
      <Dialog open={assignDialogOpen} onClose={onAssignClose} maxWidth="xs" fullWidth>
        <DialogTitle>Assign Reader to Customers</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Reader</InputLabel>
              <Select
                label="Reader"
                value={assignReaderId}
                onChange={(e) => onAssignReaderIdChange(e.target.value)}
                disabled={isReadersLoading || !selectedBranchId}
              >
                {isReadersLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : readers?.length > 0 ? (
                  readers.map((r) => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.name || `Reader ${r.id}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No readers found</MenuItem>
                )}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              Branch filter is required to load meter readers.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={onAssignClose}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={onAssignConfirm}
            disabled={!assignReaderId}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Additional Monthly Payment Dialog */}
      <Dialog
        open={bulkPaymentOpen}
        onClose={onPaymentClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Additional Monthly Payment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the additional monthly payment amount for all selected customers.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            value={paymentValue}
            onChange={(e) => onPaymentValueChange(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onPaymentClose}>Cancel</Button>
          <Button variant="contained" onClick={onPaymentConfirm}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Techemari (Additional Fee) Dialog */}
      <Dialog
        open={bulkTechemariOpen}
        onClose={onTechemariClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Additional Fee (Techemari)</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set the Additional Fee Name (Text) and Amount (Number) for selected customers.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Fee Name (Text)"
            type="text"
            fullWidth
            value={techemariName}
            onChange={(e) => onTechemariNameChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Amount (Number)"
            type="number"
            fullWidth
            value={techemariAmount}
            onChange={(e) => onTechemariAmountChange(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onTechemariClose}>Cancel</Button>
          <Button variant="contained" onClick={onTechemariConfirm}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActionsDialogs;
