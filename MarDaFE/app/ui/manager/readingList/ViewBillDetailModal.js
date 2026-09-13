// app/ui/components/ViewBillDetailModal.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Box,
  Paper,
} from "@mui/material";

const ViewBillDetailModal = ({ open, onClose, bill }) => {
  if (!bill) {
    return null; // Don't render if no bill data is provided
  }

  // Helper function to format currency values
  const formatCurrency = (value) => {
    return value != null ? value.toFixed(2) : "N/A";
  };

  // Helper function to format boolean values
  const formatBoolean = (value) => {
    return value ? "Yes" : "No";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ backgroundColor: "#1976d2", color: "white", padding: "16px" }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Bill Details: {bill.invoiceNumber || "N/A"}
        </Typography>
        <Typography
          variant="subtitle2"
          component="div"
          sx={{ color: "rgba(255,255,255,0.8)" }}
        >
          Status: {bill.status || "N/A"} | Kifya Wer: {bill.kifyaWer || "N/A"}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: "24px" }}>
        <Grid container spacing={3}>
          {/* General Information */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#3f51b5" }}
              >
                General Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Invoice Number:</strong>{" "}
                    {bill.invoiceNumber || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {bill.status || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Kifya Wer:</strong> {bill.kifyaWer || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Last Reading:</strong>{" "}
                    {bill.lastReading != null
                      ? bill.lastReading.toLocaleString()
                      : "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Previous Reading:</strong>{" "}
                    {bill.previousReading != null
                      ? bill.previousReading.toLocaleString()
                      : "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Money Collected:</strong>{" "}
                    {formatBoolean(bill.moneyCollected)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Is Void:</strong> {formatBoolean(bill.isVoid)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bill Generated:</strong>{" "}
                    {formatBoolean(bill.isBillGenerated)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Group 1: Core Fees */}
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#4caf50" }}
              >
                Group 1: Core Fees
              </Typography>
              <Typography>
                <strong>Yezih Wer Fjota Kfya:</strong>{" "}
                {formatCurrency(bill.yezihWerFjotaKfya)}
              </Typography>
              <Typography>
                <strong>Kotari Kiray:</strong>{" "}
                {formatCurrency(bill.kotariKiray)}
              </Typography>
              <Typography>
                <strong>Additional Hisab:</strong>{" "}
                {formatCurrency(bill.additionalHisab)}
              </Typography>
              <Typography>
                <strong>Techemari Kfya:</strong>{" "}
                {formatCurrency(bill.techemariKfya)}
              </Typography>
              {bill.mBillingAdditionalPayment1Value != null && bill.mBillingAdditionalPayment1Value > 0 && (
                <Typography>
                  <strong>{bill.mBillingAdditionalPayment1ValueLable || "Service Charge 1"}:</strong>{" "}
                  {formatCurrency(bill.mBillingAdditionalPayment1Value)}
                </Typography>
              )}
              {bill.mBillingAdditionalPayment2Value != null && bill.mBillingAdditionalPayment2Value > 0 && (
                <Typography>
                  <strong>{bill.mBillingAdditionalPayment2ValueLable || "Service Charge 2"}:</strong>{" "}
                  {formatCurrency(bill.mBillingAdditionalPayment2Value)}
                </Typography>
              )}
              <Typography>
                <strong>Yezih Wer:</strong> {formatCurrency(bill.yezihWer)}
              </Typography>
            </Paper>
          </Grid>

          {/* Group 2: Wuzif & Kitat */}
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#ff9800" }}
              >
                Group 2: Wuzif & Kitat
              </Typography>
              <Typography>
                <strong>Wuzif Kotari Kiray:</strong>{" "}
                {formatCurrency(bill.wuzifKotariKiray)}
              </Typography>
              <Typography>
                <strong>Wuzif Fjota:</strong> {formatCurrency(bill.wuzifFjota)}
              </Typography>
              <Typography>
                <strong>Wuzif Derek Koshasha:</strong>{" "}
                {formatCurrency(bill.wuzifDerekKoshasha)}
              </Typography>
              <Typography>
                <strong>Wuzif Techemari Kfya:</strong>{" "}
                {formatCurrency(bill.wuzifTechemariKfya)}
              </Typography>
              {bill.mBillingAdditionalPayment1Wuzif != null && bill.mBillingAdditionalPayment1Wuzif > 0 && (
                <Typography>
                  <strong>{bill.mBillingAdditionalPayment1ValueLable ? `Wuzif ${bill.mBillingAdditionalPayment1ValueLable}` : "Wuzif Service Charge 1"}:</strong>{" "}
                  {formatCurrency(bill.mBillingAdditionalPayment1Wuzif)}
                </Typography>
              )}
              {bill.mBillingAdditionalPayment2Wuzif != null && bill.mBillingAdditionalPayment2Wuzif > 0 && (
                <Typography>
                  <strong>{bill.mBillingAdditionalPayment2ValueLable ? `Wuzif ${bill.mBillingAdditionalPayment2ValueLable}` : "Wuzif Service Charge 2"}:</strong>{" "}
                  {formatCurrency(bill.mBillingAdditionalPayment2Wuzif)}
                </Typography>
              )}
              <Typography>
                <strong>Kitat:</strong> {formatCurrency(bill.kitat)}
              </Typography>
              <Typography>
                <strong>Wuzif Hisab:</strong> {formatCurrency(bill.wuzifHisab)}
              </Typography>
              <Typography>
                <strong>ውዝፍ ፍጆታ ክፍያ:</strong>{" "}
                {formatCurrency(bill.wuzifFjotaKfya)}
              </Typography>
            </Paper>
          </Grid>

          {/* Group 3: Payments & Returns */}
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#2196f3" }}
              >
                Group 3: Payments & Returns
              </Typography>
              <Typography>
                <strong>Temelash Birr:</strong>{" "}
                {formatCurrency(bill.temelashBirr)}
              </Typography>
              <Typography>
                <strong>Kecredit Yetekefele:</strong>{" "}
                {formatCurrency(bill.kecreditYetekefele)}
              </Typography>
              <Typography>
                <strong>Tekilala Yetekefele:</strong>{" "}
                {formatCurrency(bill.tekilalaYetekefele)}
              </Typography>
              <Typography>
                <strong>Tekilala Bank Yetekefele:</strong>{" "}
                {formatCurrency(bill.tekilalaBankYetekefele)}
              </Typography>
              <Typography>
                <strong>Bank Paid Agent ID:</strong>{" "}
                {bill.bankPaidAgentId || "N/A"}
              </Typography>
              <Typography>
                <strong>U Bank Paid Agent ID:</strong>{" "}
                {bill.uBankPaidAgentId || "N/A"}
              </Typography>
            </Paper>
          </Grid>

          {/* Group 4: Consumption */}
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#9c27b0" }}
              >
                Group 4: Consumption
              </Typography>
              <Typography>
                <strong>Consumption:</strong>{" "}
                {bill.consumption != null
                  ? bill.consumption.toLocaleString()
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Consumption Wuzif:</strong>{" "}
                {bill.consumptionWuzif != null
                  ? bill.consumptionWuzif.toLocaleString()
                  : "N/A"}
              </Typography>
            </Paper>
          </Grid>

          {/* Payment Methods */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#f5f5f5" }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#607d8b" }}
              >
                Payment Methods
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Paid Through Bank:</strong>{" "}
                    {formatBoolean(bill.isPaidThroughBank)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Paid On Front Office:</strong>{" "}
                    {formatBoolean(bill.isPaidOnFrontOffice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Paid From Tekemach:</strong>{" "}
                    {formatBoolean(bill.isPaidFromTekemach)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Derash Paid:</strong>{" "}
                    {formatBoolean(bill.isDerashPaid)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Unicash Paid:</strong>{" "}
                    {formatBoolean(bill.isUnicashPaid)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Abyssinia Paid:</strong>{" "}
                    {formatBoolean(bill.isAbyssiniaPaid)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ padding: "16px", justifyContent: "flex-end" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#f44336",
            "&:hover": { backgroundColor: "#d32f2f" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewBillDetailModal;
