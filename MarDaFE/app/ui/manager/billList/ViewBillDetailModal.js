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
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import "../../../fonts/nyala-normal"; // Import Amharic font

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

  // Generate Ethiopian format receipt PDF - A5 size with Amharic font (only for paid bills)
  const generateBillReceiptPDF = (preview = true) => {
    if (!bill) return;
    
    // Check if bill is paid (moneyCollected = true)
    if (!bill.moneyCollected) {
      toast.error("Receipt can only be generated for paid bills");
      return;
    }
    
    const inv = bill.billingInvoiceNumber || bill.invoiceNumber || bill?.billingInvoiceNumbers || "-";
    const name = bill?.fullName || "-";
    const acc = bill?.accountNumber || "-";
    const period = bill?.kifyaWer || "-";
    const customerId = bill?.customerId || "-";
    const date = new Date().toLocaleDateString();
    const amount = bill.tekilalaYetekefele || bill.tekilalaTekefay || 0;
    
    // Create PDF in A4 portrait format
    const doc = new jsPDF({ 
      orientation: "portrait", 
      unit: "mm", 
      format: "a4"
    });
    
    // Set Amharic font
    try {
      doc.setFont("nyala", "normal");
    } catch (e) {
      console.warn("Nyala font not available, using default");
      doc.setFont("helvetica", "normal");
    }
    
    // Header - Company Info
    doc.setFontSize(12);
    doc.text("ፍርዴ", 10, 15);
    doc.setFontSize(8);
    doc.text("ሕ.ቁ", 10, 22);
    
    // Date and Receipt Number (top right)
    doc.setFontSize(8);
    doc.text(date, 110, 15);
    doc.text("ፍ.ቁ", 110, 22);
    
    // Company Details Box (left side)
    doc.rect(10, 28, 70, 28);
    doc.setFontSize(7);
    doc.text("ዲሲኤ ቁጥር: BD-00304644", 12, 35);
    doc.text("ብሔር ዲሲ ኮማን ውሃና ፋብሪካ ኃ/ሽ/ማ", 12, 40);
    doc.text("የኢንቮይስ ኣጥ Ba/Dar Tech Muyi Tewetet Limat", 12, 45);
    doc.text("ስልክ ቁጥር: +251975642380", 12, 50);
    doc.text("የላላ ቁጥር (Customer ID): " + customerId, 12, 55);
    
    // Consumption Table (top right corner) - Dynamic data
    const totalConsumption = bill.consumption || 0;
    const consumptionData = [
      ["ወር", "ፍጆታ", "ታሪፍ", "የገንዘብ ላክ"],
      ["h0.5 ሜ³", Math.min(totalConsumption, 5).toFixed(1), "17.0", (Math.min(totalConsumption, 5) * 17).toFixed(2)],
      ["h5.1-10 ሜ³", Math.max(0, Math.min(totalConsumption - 5, 5)).toFixed(1), "20.0", (Math.max(0, Math.min(totalConsumption - 5, 5)) * 20).toFixed(2)],
      ["h10.1-25 ሜ³", Math.max(0, Math.min(totalConsumption - 10, 15)).toFixed(1), "28.0", (Math.max(0, Math.min(totalConsumption - 10, 15)) * 28).toFixed(2)],
      ["h25.1-40ሜ³", Math.max(0, Math.min(totalConsumption - 25, 15)).toFixed(1), "32.0", (Math.max(0, Math.min(totalConsumption - 25, 15)) * 32).toFixed(2)],
      ["h40 ሜ³ በላይ", Math.max(0, totalConsumption - 40).toFixed(1), "37.0", (Math.max(0, totalConsumption - 40) * 37).toFixed(2)]
    ];
    
    // Draw consumption table manually
    let startX = 85;
    let startY = 28;
    let cellWidth = 15;
    let cellHeight = 5;
    
    // Table headers
    doc.setFontSize(6);
    for (let i = 0; i < consumptionData[0].length; i++) {
      doc.rect(startX + (i * cellWidth), startY, cellWidth, cellHeight);
      doc.text(consumptionData[0][i], startX + (i * cellWidth) + 1, startY + 3);
    }
    
    // Table data
    for (let row = 1; row < consumptionData.length; row++) {
      for (let col = 0; col < consumptionData[row].length; col++) {
        doc.rect(startX + (col * cellWidth), startY + (row * cellHeight), cellWidth, cellHeight);
        doc.text(consumptionData[row][col], startX + (col * cellWidth) + 1, startY + (row * cellHeight) + 3);
      }
    }
    
    // Meter Reading Details (left side below company info)
    doc.setFontSize(7);
    doc.text("ዋና ቁጥር: " + (bill.shedNumber || bill.shed || "N/A"), 12, 65);
    doc.text("የሜትር ቁጥር: " + (bill.meterNumber || bill.meterId || "N/A"), 12, 70);
    doc.text("የመጨረሻ ንባብ: " + (bill.lastReading || 0).toLocaleString(), 12, 80);
    doc.text("ያለፈ ንባብ: " + (bill.previousReading || 0).toLocaleString(), 12, 85);
    doc.text("ፍጆታ: " + (bill.consumption || 0).toLocaleString(), 12, 90);
    
    // Bill Period and Date
    doc.text(period, 12, 100);
    doc.text("ገንዘብ ሰብሳቢ", 12, 105);
    doc.text("ፍ", 12, 110);
    
    // Payment Summary (center-right) - Dynamic data
    const paymentSummary = [
      ["የዚህ ወር ፍጆታ", (bill.yezihWerFjotaKfya || 0).toFixed(2)],
      ["የፍጆታ ኪራይ", (bill.kotariKiray || 0).toFixed(2)],
      ["ውሃና የፍጆታ ኪራይ", (bill.wuzifKotariKiray || 0).toFixed(2)],
      ["ቅጣት", (bill.kitat || 0).toFixed(2)],
      ["የደረቅ ቆሻሻ ክፍያ", (bill.wuzifDerekKoshasha || 0).toFixed(2)],
      ["ተጨማሪ ሂሳብ", (bill.additionalHisab || 0).toFixed(2)],
      ["ከተቀማጭ ነባብ የተከፈለ", "(" + (bill.kecreditYetekefele || 0).toFixed(2) + ")"],
      ["ጠቅላላ ክፍያ", amount.toFixed(2)]
    ];
    
    let paymentStartY = 65;
    doc.setFontSize(7);
    for (let i = 0; i < paymentSummary.length; i++) {
      doc.text(paymentSummary[i][0], 85, paymentStartY + (i * 5));
      doc.text(paymentSummary[i][1], 130, paymentStartY + (i * 5));
    }
    
    // Customer and Bill Details (right side)
    doc.text("ስም: " + name, 85, 125);
    doc.text("መለያ ቁጥር: " + acc, 85, 130);
    doc.text("ክፍያ ወር: " + period, 85, 135);
    doc.text("ደረሰኝ ቁጥር: " + inv, 85, 140);
    
    // Bottom section with date and signature
    doc.line(10, 150, 138, 150); // Horizontal line
    doc.text(period, 10, 160);
    doc.text("ፍርዴ", 60, 160);
    doc.text("ፍ", 110, 160);
    
    // Payment confirmation details
    doc.text("የፍጆታ ኪራይ ገንዘብ ሰብሳቢ ወይም ወኪል", 10, 170);
    doc.text("ስም/", 10, 175);
    doc.text("ፊርማ", 10, 180);
    doc.text(date, 110, 175);
    
    // Bottom border
    doc.line(10, 185, 138, 185);
    
    if (preview) {
      // Open PDF in new window for preview
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const previewWindow = window.open(pdfUrl, "_blank", "width=800,height=600");
      
      // Clean up URL after window closes
      if (previewWindow) {
        previewWindow.onbeforeunload = () => {
          URL.revokeObjectURL(pdfUrl);
        };
      }
      toast.info("Receipt preview opened");
    } else {
      // Direct download
      const fileName = `Bill_Receipt_${bill.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      toast.success("Receipt downloaded successfully");
    }
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
      <DialogActions sx={{ padding: "16px", justifyContent: "space-between" }}>
        {bill.moneyCollected && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => generateBillReceiptPDF(true)}
              variant="outlined"
              sx={{
                color: "#2196f3",
                borderColor: "#2196f3",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              Preview Receipt
            </Button>
            <Button
              onClick={() => generateBillReceiptPDF(false)}
              variant="contained"
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
              }}
            >
              Download Receipt
            </Button>
          </Box>
        )}
        {!bill.moneyCollected && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Receipt available only for paid bills
            </Typography>
          </Box>
        )}
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
