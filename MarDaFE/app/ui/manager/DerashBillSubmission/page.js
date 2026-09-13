"use client";
import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  TextField,
  Alert,
  Chip,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "@/app/lib/ReadingService";
import { CustomerService } from "@/app/lib/customerService";
import derashService from "@/app/lib/derashService";

// Instantiate services (files export classes, not default instances)
const readingService = new ReadingService();
const customerService = new CustomerService();

const DerashBillSubmission = () => {
  // State for customer and bill selection
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedBillId, setSelectedBillId] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Fetch customers
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAllCustomers(),
  });

  // Fetch bills for selected customer
  const { data: customerBills, isLoading: billsLoading } = useQuery({
    queryKey: ["customerBills", selectedCustomerId],
    queryFn: () => readingService.getReadingsByCustomerId(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    setSelectedBillId("");
    setSelectedBill(null);
  };

  // Handle bill selection
  const handleBillChange = (billId) => {
    setSelectedBillId(billId);
    const bill = customerBills?.find(b => b.id === parseInt(billId));
    setSelectedBill(bill || null);
  };

  // Prepare bill data for Derash submission
  const prepareDerashBillData = (bill) => {
    if (!bill) return null;

    const customer = bill.billingCustomerInfo || {};

    return {
      bill_id: bill.billingInvoiceNumbers?.invoiceNumbers || `BILL-${bill.id}`,
      bill_desc: `Water bill for ${bill.kifyaWer} - Consumption: ${bill.consumption || 0} m³`,
      reason: `WATER_BILL_${bill.kifyaWer.replace(/[^a-zA-Z0-9]/g, '_')}`,
      amount_due: (bill.tekilalaTekefay || 0).toString(),
      due_date: bill.dueDate || new Date().toISOString().split('T')[0],
      partial_pay_allowed: false,
      customer_id: customer.accountNumber || customer.id?.toString(),
      name: customer.customerName || "Unknown Customer",
      mobile: customer.phoneNumber || "",
      email: customer.email || ""
    };
  };

  // Handle bill submission to Derash
  const handleSubmitToDerash = async () => {
    if (!selectedBill) {
      toast.error("Please select a bill to submit");
      return;
    }

    const billData = prepareDerashBillData(selectedBill);
    if (!billData) {
      toast.error("Failed to prepare bill data");
      return;
    }

    try {
      setSubmissionLoading(true);
      const result = await derashService.submitBillToDerash(billData);

      if (result?.success) {
        setSubmissionResult({
          success: true,
          bill_id: result.bill_id,
          confirmation_code: result.confirmation_code,
          message: "Bill successfully submitted to Derash"
        });
        toast.success("Bill submitted to Derash successfully");
      } else {
        setSubmissionResult({
          success: false,
          error: result?.message || "Submission failed"
        });
        toast.error(result?.message || "Failed to submit bill to Derash");
      }
    } catch (error) {
      setSubmissionResult({
        success: false,
        error: error?.response?.data?.message || error.message || "Unknown error occurred"
      });
      toast.error("Error submitting bill to Derash");
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Reset submission results
  const handleResetSubmission = () => {
    setSubmissionResult(null);
    setSubmissionDialogOpen(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb pageName="Derash Bill Submission" />
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Submit Customer Bill to Derash
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Select a customer and bill to submit to Derash payment gateway for online payment processing.
          </Typography>

          {/* Customer Selection */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Select Customer
            </Typography>
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel>Customer</InputLabel>
              <Select
                value={selectedCustomerId}
                label="Customer"
                onChange={(e) => handleCustomerChange(e.target.value)}
                disabled={customersLoading}
              >
                <MenuItem value="">
                  <em>Select a customer</em>
                </MenuItem>
                {customersLoading ? (
                  <MenuItem disabled>Loading customers...</MenuItem>
                ) : customers?.length > 0 ? (
                  customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.customerName || `Customer ${customer.id}`} - {customer.accountNumber}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No customers found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Bill Selection */}
          {selectedCustomerId && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Step 2: Select Bill
              </Typography>
              <FormControl fullWidth sx={{ maxWidth: 400 }}>
                <InputLabel>Bill</InputLabel>
                <Select
                  value={selectedBillId}
                  label="Bill"
                  onChange={(e) => handleBillChange(e.target.value)}
                  disabled={billsLoading}
                >
                  <MenuItem value="">
                    <em>Select a bill</em>
                  </MenuItem>
                  {billsLoading ? (
                    <MenuItem disabled>Loading bills...</MenuItem>
                  ) : customerBills?.length > 0 ? (
                    customerBills.map((bill) => (
                      <MenuItem key={bill.id} value={bill.id}>
                        {bill.billingInvoiceNumbers?.invoiceNumbers || `Bill ${bill.id}`} - {bill.kifyaWer} - {bill.tekilalaTekefay?.toFixed(2)} ETB
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No bills found for selected customer</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Bill Details */}
          {selectedBill && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bill Details
              </Typography>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Customer Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Name:</strong> {selectedBill.billingCustomerInfo?.customerName || "Unknown"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Account:</strong> {selectedBill.billingCustomerInfo?.accountNumber || "Unknown"}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Phone:</strong> {selectedBill.billingCustomerInfo?.phoneNumber || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Bill Information
                      </Typography>
                      <Typography variant="body1">
                        <strong>Bill ID:</strong> {selectedBill.billingInvoiceNumbers?.invoiceNumbers || `BILL-${selectedBill.id}`}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Period:</strong> {selectedBill.kifyaWer}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Amount Due:</strong> {selectedBill.tekilalaTekefay?.toFixed(2)} ETB
                      </Typography>
                      <Typography variant="body1">
                        <strong>Due Date:</strong> {selectedBill.dueDate || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Submit Button */}
          {selectedBill && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setSubmissionDialogOpen(true)}
                sx={{ minWidth: 200 }}
              >
                Submit Bill to Derash
              </Button>
            </Box>
          )}

          {/* Submission Results */}
          {submissionResult && (
            <Box sx={{ mt: 3 }}>
              <Alert
                severity={submissionResult.success ? "success" : "error"}
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle2">
                  {submissionResult.success ? "Success!" : "Error:"}
                </Typography>
                {submissionResult.success ? (
                  <Box>
                    <Typography variant="body2">
                      Bill ID: {submissionResult.bill_id}
                    </Typography>
                    <Typography variant="body2">
                      Confirmation Code: {submissionResult.confirmation_code}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">
                    {submissionResult.error}
                  </Typography>
                )}
              </Alert>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Submission Confirmation Dialog */}
      <Dialog
        open={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Bill Submission</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bill Details to Submit
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Bill ID:</strong> {prepareDerashBillData(selectedBill)?.bill_id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Customer:</strong> {prepareDerashBillData(selectedBill)?.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {prepareDerashBillData(selectedBill)?.amount_due} ETB
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Reason:</strong> {prepareDerashBillData(selectedBill)?.reason}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Due Date:</strong> {prepareDerashBillData(selectedBill)?.due_date}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Description:</strong> {prepareDerashBillData(selectedBill)?.bill_desc}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmissionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitToDerash}
            disabled={submissionLoading}
          >
            {submissionLoading ? <CircularProgress size={20} /> : "Submit to Derash"}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Grid>
  );
};

// Wrap with QueryClient
const DerashBillSubmissionWithProvider = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <DerashBillSubmission />
    </QueryClientProvider>
  );
};

export default DerashBillSubmissionWithProvider;
