"use client";
import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  LinearProgress,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  Close as CloseIcon, 
  Check as CheckIcon, 
  Error as ErrorIcon,
  Info as InfoIcon,
  Save as SaveIcon 
} from '@mui/icons-material';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { BillingBanksService } from '../../../lib/billingBanksService';
import { UnicashPaymentImportService } from '../../../lib/unicashPaymentImportService';

const unicashPaymentImportService = new UnicashPaymentImportService();
const billingBanksService = new BillingBanksService();

const UnicashPaymentImportModal = ({ 
  open, 
  onClose, 
  filteredData = [], 
  selectedKifyaWerMonth, 
  selectedKifyaWerYear,
  onSaveSuccess 
}) => {
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [validatedData, setValidatedData] = useState({ paidList: [], errors: [], alreadyPaidList: [] });
  const [activeTab, setActiveTab] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState(0);
  const [processedRecords, setProcessedRecords] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  
  // Pagination states
  const [validPaymentsPage, setValidPaymentsPage] = useState(0);
  const [errorsPage, setErrorsPage] = useState(0);
  const [alreadyPaidPage, setAlreadyPaidPage] = useState(0);
  const rowsPerPage = 10;

  // Load banks when modal opens
  React.useEffect(() => {
    if (open && banks.length === 0) {
      loadBanks();
    }
  }, [open]);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      setCsvFile(null);
      setValidatedData({ paidList: [], errors: [], alreadyPaidList: [] });
      setActiveTab(0);
      setSavingProgress(0);
      setProcessedRecords(0);
      setTotalRecords(0);
      setIsSaving(false);
    }
  }, [open]);

  // Load banks from database
  const loadBanks = async () => {
    setBanksLoading(true);
    try {
      const banksData = await billingBanksService.getAllBillingBanks();
      setBanks(banksData || []);
      console.log("Loaded banks:", banksData?.length || 0);
    } catch (error) {
      console.error("Failed to load banks:", error);
      toast.error("Failed to load bank information");
    } finally {
      setBanksLoading(false);
    }
  };

  // Lookup bank object from bankName - returns bank object or null
  const lookupBank = (bankName) => {
    if (!bankName || banks.length === 0) return null;
    
    // Try to find by bank name (case insensitive)
    let bank = banks.find(b => b.bankName && b.bankName.toLowerCase().includes(bankName.toLowerCase()));
    if (bank) return bank;
    
    // Try to find by bank code
    bank = banks.find(b => b.bankCode === bankName);
    if (bank) return bank;
    
    // Try to find by gateway code
    bank = banks.find(b => b.gatewayCode === bankName);
    if (bank) return bank;
    
    // Return null if no match found
    return null;
  };

  // Lookup bank name from bankName - returns bank name or original bank name
  const lookupBankName = (bankName) => {
    const bank = lookupBank(bankName);
    return bank ? bank.bankName : bankName;
  };

  // Create lookup map for faster searching using billingInvoiceNumbers
  const billLookup = useMemo(() => {
    const lookup = {};
    filteredData.forEach(bill => {
      const invoiceNumber = bill.billingInvoiceNumber;  // Maps to CSV billIds
      
      if (invoiceNumber) {
        // For Unicash, we use only invoice number since there's no account number in CSV
        lookup[invoiceNumber] = bill;
      }
    });
    return lookup;
  }, [filteredData]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);

    // Read file as text first
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        
        // Debug: Log the CSV content
        console.log("Unicash CSV preview:", csvText.substring(0, 500));
        
        // Parse the CSV directly (Unicash format is expected to be properly formatted)
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log("Unicash Parse results:", {
              data: results.data?.slice(0, 3), // First 3 rows for debugging
              errors: results.errors,
              meta: results.meta
            });
            
            if (results.errors.length > 0) {
              console.warn("CSV parsing warnings:", results.errors);
              // Don't fail on minor parsing warnings, continue if we have data
              if (results.data && results.data.length > 0) {
                toast.success(`Parsed ${results.data.length} records with ${results.errors.length} warnings`);
                setCsvData(results.data);
                validateCsvData(results.data);
                setIsProcessing(false);
                return;
              }
            }

            if (!results.data || results.data.length === 0) {
              toast.error("No data found in CSV file. Check console for details.");
              setIsProcessing(false);
              return;
            }

            toast.success(`Successfully parsed ${results.data.length} records`);
            setCsvData(results.data);
            validateCsvData(results.data);
            setIsProcessing(false);
          },
          error: (error) => {
            toast.error("Failed to parse CSV file");
            console.error("CSV parsing error:", error);
            setIsProcessing(false);
          }
        });
      } catch (error) {
        toast.error("Failed to read CSV file");
        console.error("File reading error:", error);
        setIsProcessing(false);
      }
    };
    
    reader.onerror = () => {
      toast.error("Failed to read file");
      setIsProcessing(false);
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const validateCsvData = (data) => {
    const paidList = [];
    const errors = [];
    const alreadyPaidList = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because index starts at 0 and we skip header
      
      // Unicash CSV field mappings (expected fields):
      // billIds, paidOn, bankTransactionReference, bankName
      const {
        billIds,           // Maps to reading.billingInvoiceNumbers
        paidOn,           // Payment date
        bankTransactionReference, // Confirmation code
        bankName          // Bank name
      } = row;

      // Validate required fields
      if (!billIds || !paidOn || !bankTransactionReference || !bankName) {
        errors.push({
          rowNumber,
          error: "Missing required fields (billIds, paidOn, bankTransactionReference, bankName)",
          data: row,
          type: "validation"
        });
        return;
      }

      // Validate date format
      const paidDate = new Date(paidOn);
      if (isNaN(paidDate.getTime())) {
        errors.push({
          rowNumber,
          error: "Invalid date format in paidOn field",
          data: row,
          type: "validation"
        });
        return;
      }

      // Look up bill in filtered data using billIds
      const matchingBill = billLookup[billIds.trim()];

      if (!matchingBill) {
        errors.push({
          rowNumber,
          error: "Bill not found for billIds: " + billIds,
          data: row,
          type: "bill_not_found"
        });
        return;
      }

      // Check if bank exists in database (validate bankName)
      const bankFound = lookupBank(bankName);
      if (!bankFound) {
        errors.push({
          rowNumber,
          error: `Bank not found: "${bankName}" does not match any bank in database`,
          data: row,
          type: "bank_not_found"
        });
        console.log(`Bank lookup failed for: ${bankName}`);
        return;
      }

      // Check if already paid through Unicash
      const isUnicashPaid = matchingBill.isUnicashPaid || matchingBill.unicashPaid;
      
      if (isUnicashPaid) {
        alreadyPaidList.push({
          rowNumber,
          csvData: row,
          billData: matchingBill,
          paidDate,
          reason: "Already paid through Unicash"
        });
        console.log("Bill moved to already paid list:", matchingBill.id);
        return;
      }

      // Valid record - add to paid list
      paidList.push({
        rowNumber,
        csvData: row,
        billData: matchingBill,
        paidDate
      });
    });

    setValidatedData({ paidList, errors, alreadyPaidList });
    
    // Switch to appropriate tab and show summary
    if (paidList.length > 0) {
      setActiveTab(0); // Show valid payments first
      toast.success(`Found ${paidList.length} valid payments to import`);
    } else if (alreadyPaidList.length > 0) {
      setActiveTab(2); // Show already paid if no valid payments
      toast.info("No new payments found - all bills already paid");
    } else {
      setActiveTab(1); // Show errors if no valid payments
      toast.warning("No valid payments found in CSV");
    }

    // Show summary of all categories
    const totalProcessed = paidList.length + errors.length + alreadyPaidList.length;
    let summaryMessage = `Processed ${totalProcessed} records: `;
    if (paidList.length > 0) summaryMessage += `${paidList.length} valid, `;
    if (alreadyPaidList.length > 0) summaryMessage += `${alreadyPaidList.length} already paid, `;
    if (errors.length > 0) summaryMessage += `${errors.length} errors`;
    
    console.log(summaryMessage);
  };

  const handleSave = async () => {
    if (validatedData.paidList.length === 0) {
      toast.warning("No valid payments to save");
      return;
    }

    setIsSaving(true);
    setSavingProgress(0);
    setProcessedRecords(0);

    try {
      // Prepare update requests for Unicash
      const updateRequests = validatedData.paidList.map(item => {
        const { billData, csvData, paidDate } = item;
        
        return {
          id: billData.id,
          updates: {
            // Unicash-specific field mappings based on requirements:
            // 1. tekilalaYetekefele = tekilalaTekefay + kecreditYetekefele
            tekilalaYetekefele: (billData.tekilalaTekefay || 0) + (billData.kecreditYetekefele || 0),
            // 2. tekilalaBankYetekefele = tekilalaTekefay
            tekilalaBankYetekefele: billData.tekilalaTekefay || 0,
            // 4. isUnicashPaid = true
            isUnicashPaid: true,
            // 5. moneyCollectedDate = csv paidOn
            moneyCollectedDate: paidDate.toISOString(),
            // 6. BankPaidConfirmationCode = csv bankTransactionReference
            uBankPaidConfirmationCode: csvData.bankTransactionReference,
            // 7. bankPaidAgentId = csv bankName
            uBankPaidAgentId: csvData.bankName
          }
        };
      });

      const totalCount = updateRequests.length;
      setTotalRecords(totalCount);
      const batchSize = Math.max(1, Math.min(10, Math.ceil(totalCount / 10))); // Process in batches of 10 or smaller
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      console.log(`Processing ${totalCount} Unicash records in batches of ${batchSize}`);
      
      // Process records in batches for real-time progress
      for (let i = 0; i < updateRequests.length; i += batchSize) {
        const batch = updateRequests.slice(i, i + batchSize);
        
        try {
          console.log(`Processing Unicash batch ${Math.floor(i / batchSize) + 1}: records ${i + 1}-${Math.min(i + batchSize, totalCount)}`);
          
          // Process batch
          const response = await unicashPaymentImportService.updateUnicashPayments(batch);
          
          processedCount += batch.length;
          successCount += response?.updatedCount || batch.length;
          
          // Update progress based on actual completion
          const progress = Math.round((processedCount / totalCount) * 100);
          setSavingProgress(progress);
          setProcessedRecords(processedCount);
          
          console.log(`Unicash batch completed: ${processedCount}/${totalCount} (${progress}%)`);
          
          // Small delay to show progress visually
          if (i + batchSize < updateRequests.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (batchError) {
          console.error(`Error processing Unicash batch ${Math.floor(i / batchSize) + 1}:`, batchError);
          errorCount += batch.length;
          processedCount += batch.length;
          
          // Continue with next batch even if this one fails
          const progress = Math.round((processedCount / totalCount) * 100);
          setSavingProgress(progress);
          setProcessedRecords(processedCount);
        }
      }

      // Final progress update
      setSavingProgress(100);

      // Show results
      if (errorCount > 0) {
        toast.warning(`Completed with ${successCount} successful, ${errorCount} failed out of ${totalCount} records`);
      } else {
        toast.success(`Successfully updated all ${successCount} Unicash payment records`);
      }
      
      // Call success callback to refresh data
      if (onSaveSuccess) {
        onSaveSuccess();
      }
      
      // Close modal after a brief delay to show 100% progress
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error saving Unicash payments:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.data?.message) {
        toast.error(`Failed to save: ${error.response.data.message}`);
      } else {
        toast.error("Failed to save Unicash payment updates");
      }
    } finally {
      setIsSaving(false);
      setSavingProgress(0);
      setProcessedRecords(0);
      setTotalRecords(0);
    }
  };

  const getErrorTypeColor = (type) => {
    switch (type) {
      case "bill_not_found": return "error";
      case "bank_not_found": return "error";
      case "already_paid": return "info";
      case "validation": return "error";
      default: return "default";
    }
  };

  // Pagination helper functions
  const getPaginatedData = (data, page) => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const handleChangePage = (event, newPage, type) => {
    switch (type) {
      case 'validPayments':
        setValidPaymentsPage(newPage);
        break;
      case 'errors':
        setErrorsPage(newPage);
        break;
      case 'alreadyPaid':
        setAlreadyPaidPage(newPage);
        break;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Import Unicash Payments - {selectedKifyaWerMonth} {selectedKifyaWerYear}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Upload a CSV file with Unicash payment information. Expected columns: 
            billIds, paidOn, bankTransactionReference, bankName
            <br />
            <strong>Note:</strong> Unicash CSV format uses billIds (invoice numbers) instead of account numbers.
          </Typography>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="unicash-csv-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="unicash-csv-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={isProcessing}
            >
              {csvFile ? csvFile.name : "Choose Unicash CSV File"}
            </Button>
          </label>

          {isProcessing && (
            <Box mt={2}>
              <LinearProgress />
              <Typography variant="body2" mt={1}>Processing Unicash CSV file...</Typography>
            </Box>
          )}
        </Box>

        {csvData.length > 0 && (
          <>
            <Box mb={2}>
              <Alert severity="info">
                Processed {csvData.length} rows from Unicash CSV. 
                Found {validatedData.paidList.length} valid payments, {validatedData.alreadyPaidList.length} already paid, and {validatedData.errors.length} errors.
              </Alert>
            </Box>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckIcon color="success" />
                    Valid Payments ({validatedData.paidList.length})
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <ErrorIcon color="error" />
                    Errors ({validatedData.errors.length})
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box display="flex" alignItems="center" gap={1}>
                    <InfoIcon color="info" />
                    Already Paid ({validatedData.alreadyPaidList.length})
                  </Box>
                } 
              />
            </Tabs>

            <Box mt={2} maxHeight={400} overflow="auto">
              {activeTab === 0 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Bill IDs</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Paid Date</TableCell>
                        <TableCell>Bank Name</TableCell>
                        <TableCell>Transaction Ref</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedData(validatedData.paidList, validPaymentsPage).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.rowNumber}</TableCell>
                          <TableCell>{item.csvData.billIds}</TableCell>
                          <TableCell>{item.billData.customerFullName || item.billData.customerName || 'N/A'}</TableCell>
                          <TableCell>{item.billData.customerAccountNumber || 'N/A'}</TableCell>
                          <TableCell>{item.paidDate.toLocaleDateString()}</TableCell>
                          <TableCell>{lookupBankName(item.csvData.bankName)}</TableCell>
                          <TableCell>{item.csvData.bankTransactionReference}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={validatedData.paidList.length}
                    page={validPaymentsPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'validPayments')}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                  />
                </TableContainer>
              )}

              {activeTab === 1 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Error Type</TableCell>
                        <TableCell>Bill IDs</TableCell>
                        <TableCell>Bank Name</TableCell>
                        <TableCell>Error Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedData(validatedData.errors, errorsPage).map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.rowNumber}</TableCell>
                          <TableCell>
                            <Chip 
                              label={error.type} 
                              color={getErrorTypeColor(error.type)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{error.data.billIds}</TableCell>
                          <TableCell>{error.data.bankName}</TableCell>
                          <TableCell>{error.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={validatedData.errors.length}
                    page={errorsPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'errors')}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                  />
                </TableContainer>
              )}

              {activeTab === 2 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Row</TableCell>
                        <TableCell>Bill IDs</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Account Number</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedData(validatedData.alreadyPaidList, alreadyPaidPage).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.rowNumber}</TableCell>
                          <TableCell>{item.csvData.billIds}</TableCell>
                          <TableCell>{item.billData.customerFullName || item.billData.customerName || 'N/A'}</TableCell>
                          <TableCell>{item.billData.customerAccountNumber || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label="Already Paid" 
                              color="info"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{item.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    component="div"
                    count={validatedData.alreadyPaidList.length}
                    page={alreadyPaidPage}
                    onPageChange={(event, newPage) => handleChangePage(event, newPage, 'alreadyPaid')}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[]}
                  />
                </TableContainer>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        {validatedData.paidList.length > 0 && (
          <Box position="relative">
            <Button
              variant="contained"
              startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving 
                ? `Saving... ${processedRecords}/${totalRecords} (${savingProgress}%)` 
                : `Save ${validatedData.paidList.length} Unicash Payments`
              }
            </Button>
            {isSaving && (
              <LinearProgress 
                variant="determinate" 
                value={savingProgress} 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  height: 2 
                }} 
              />
            )}
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UnicashPaymentImportModal;
