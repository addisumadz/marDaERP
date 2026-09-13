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
//import { billListService } from '../../../lib/billListService';
import { BillingBanksService } from '../../../lib/billingBanksService';
import { BankPaymentImportService } from '../../../lib/bankPaymentImportService';

const bankPaymentImportService = new BankPaymentImportService();
const billingBanksService = new BillingBanksService();

const BankPaymentImportModal = ({ 
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

  // Lookup bank object from agent_name (bank code) - returns bank object or null
  const lookupBank = (agentName) => {
    if (!agentName || banks.length === 0) return null;
    
    // Try to find by bank code (exact match)
    let bank = banks.find(b => b.bankCode === agentName);
    if (bank) return bank;
    
    // Try to find by gateway code
    bank = banks.find(b => b.gatewayCode === agentName);
    if (bank) return bank;
    
    // Try partial match on bank name (case insensitive)
    bank = banks.find(b => b.bankName.toLowerCase().includes(agentName.toLowerCase()));
    if (bank) return bank;
    
    // Return null if no match found
    return null;
  };

  // Lookup bank name from agent_name (bank code) - returns bank name or original agent name
  const lookupBankName = (agentName) => {
    const bank = lookupBank(agentName);
    return bank ? bank.bankName : agentName;
  };

  // Create lookup map for faster searching
  // Frontend field mappings: row.customerAccountNumber = CSV customer_id, row.billingInvoiceNumber = CSV bill_id
  const billLookup = useMemo(() => {
    const lookup = {};
    filteredData.forEach(bill => {
      const accountNumber = bill.customerAccountNumber; // Maps to CSV customer_id
      const invoiceNumber = bill.billingInvoiceNumber;  // Maps to CSV bill_id
      
      if (accountNumber && invoiceNumber) {
        const key = `${accountNumber}_${invoiceNumber}`;
        lookup[key] = bill;
      }
    });
    return lookup;
  }, [filteredData]);

  const preprocessBankCSV = (csvText) => {
    console.log("Original CSV length:", csvText.length);
    console.log("Original CSV preview:", csvText.substring(0, 200));
    
    // Handle bank CSV format where all data is on one line
    const lines = csvText.split('\n');
    console.log("Number of lines:", lines.length);
    
    if (lines.length <= 2) {
      // Likely single-line format from bank
      const fullText = lines.join('').trim();
      
      // Find the header pattern
      const headerPattern = 'bill_data_file_id,bill_id,bill_reason,customer_id,customer_name,paid_amount,paid_date,agent_name,agent_confirmation_code';
      
      if (fullText.includes(headerPattern)) {
        console.log("Found header pattern, processing...");
        
        // Split after header
        const headerEndIndex = fullText.indexOf(headerPattern) + headerPattern.length;
        const header = fullText.substring(0, headerEndIndex);
        const dataSection = fullText.substring(headerEndIndex);
        
        console.log("Data section preview:", dataSection.substring(0, 200));
        
        // Try multiple splitting strategies
        let records = [];
        
        // Strategy 1: Split by bill_data_file_id pattern
        const patterns = [
          /(?=Hy8wbsA9ex,SJ-)/g,  // Specific pattern from your data
          /(?=[A-Za-z0-9]+,SJ-\d+)/g,  // General pattern
          /(?=\w{10},SJ-)/g,  // 10-character ID pattern
          /(?=[^,]+,SJ-\d{8})/g  // Any ID followed by SJ-8digits
        ];
        
        for (const pattern of patterns) {
          records = dataSection.split(pattern).filter(record => record.trim().length > 0);
          console.log(`Pattern ${pattern} found ${records.length} records`);
          
          if (records.length > 1) {
            break;
          }
        }
        
        // If still no luck, try counting commas to estimate records
        if (records.length <= 1) {
          console.log("Trying comma-based splitting...");
          // Each record should have 8 commas (9 fields)
          const expectedCommasPerRecord = 8;
          const totalCommas = (dataSection.match(/,/g) || []).length;
          const estimatedRecords = Math.floor(totalCommas / expectedCommasPerRecord);
          
          console.log(`Total commas: ${totalCommas}, Estimated records: ${estimatedRecords}`);
          
          if (estimatedRecords > 1) {
            // Try to split by finding field patterns
            // Look for date patterns like "9/11/2025 21:00" followed by numbers
            const datePattern = /(?=\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2},\d+,)/g;
            const dateRecords = dataSection.split(datePattern);
            
            if (dateRecords.length > 1) {
              records = dateRecords.filter(record => record.trim().length > 0);
              console.log(`Date pattern found ${records.length} records`);
            }
          }
        }
        
        if (records.length > 0) {
          console.log(`Successfully split into ${records.length} records`);
          console.log("First record preview:", records[0]?.substring(0, 100));
          
          // Reconstruct proper CSV
          const properCSV = header + '\n' + records.join('\n');
          return properCSV;
        } else {
          console.warn("Could not split data into records");
        }
      }
    }
    
    // Return original if already properly formatted
    console.log("Returning original CSV");
    return csvText;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please select a CSV file");
      return;
    }

    setCsvFile(file);
    setIsProcessing(true);

    // Read file as text first to preprocess
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const processedCSV = preprocessBankCSV(csvText);
        
        // Debug: Log the processed CSV
        console.log("Processed CSV preview:", processedCSV.substring(0, 500));
        
        // Parse the processed CSV
        Papa.parse(processedCSV, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log("Parse results:", {
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
      
      // CSV field mappings:
      // customer_id (CSV) = row.customerAccountNumber (Frontend)
      // bill_id (CSV) = row.billingInvoiceNumber (Frontend)
      const {
        bill_data_file_id,
        bill_id,        // Maps to row.billingInvoiceNumber
        bill_reason,
        customer_id,    // Maps to row.customerAccountNumber
        customer_name,
        paid_amount,
        paid_date,
        agent_name,
        agent_confirmation_code
      } = row;

      // Validate required fields
      if (!customer_id || !bill_id || !paid_amount || !paid_date || !agent_name || !agent_confirmation_code) {
        errors.push({
          rowNumber,
          error: "Missing required fields",
          data: row,
          type: "validation"
        });
        return;
      }

      // Validate paid_amount is a number (handle comma-separated format like "1,376.00")
      const normalizedAmount = paid_amount.toString().replace(/,/g, ''); // Remove commas
      const paidAmountNum = parseFloat(normalizedAmount);
      
      // Debug logging for amount parsing
      if (paid_amount.includes(',')) {
        console.log(`Row ${rowNumber}: Normalized amount "${paid_amount}" -> "${normalizedAmount}" -> ${paidAmountNum}`);
      }
      
      if (isNaN(paidAmountNum) || paidAmountNum <= 0) {
        errors.push({
          rowNumber,
          error: "Invalid paid amount",
          data: row,
          type: "validation"
        });
        return;
      }

      // Validate date format
      const paidDate = new Date(paid_date);
      if (isNaN(paidDate.getTime())) {
        errors.push({
          rowNumber,
          error: "Invalid date format",
          data: row,
          type: "validation"
        });
        return;
      }

      // Look up bill in filtered data
      const lookupKey = `${customer_id}_${bill_id}`;
      const matchingBill = billLookup[lookupKey];

      if (!matchingBill) {
        // Check if customer exists but invoice number is wrong
        // Using row.customerAccountNumber which maps to CSV customer_id
        const customerExists = filteredData.some(bill => 
          bill.customerAccountNumber === customer_id
        );

        if (customerExists) {
          errors.push({
            rowNumber,
            error: "Invoice number is wrong",
            data: row,
            type: "invoice_mismatch"
          });
        } else {
          errors.push({
            rowNumber,
            error: "Account not found",
            data: row,
            type: "account_not_found"
          });
        }
        return;
      }

      // Check if CSV paid_amount matches bill's tekilalaTekefay
      const expectedAmount = matchingBill.tekilalaTekefay || 0;
      const amountDifference = Math.abs(paidAmountNum - expectedAmount);
      const tolerance = 0.01; // Allow 1 cent tolerance for rounding differences
      
      if (amountDifference > tolerance) {
        errors.push({
          rowNumber,
          error: `Bill Payment difference: CSV amount ${paidAmountNum.toFixed(2)} != Bill amount ${expectedAmount.toFixed(2)}`,
          data: row,
          type: "payment_mismatch"
        });
        console.log(`Payment amount mismatch for bill ${matchingBill.id}: CSV=${paidAmountNum}, Expected=${expectedAmount}`);
        return;
      }

      // Check if bank exists in database (validate agent_name)
      const bankFound = lookupBank(agent_name);
      if (!bankFound) {
        errors.push({
          rowNumber,
          error: `Bank not found: Agent "${agent_name}" does not match any bank in database`,
          data: row,
          type: "bank_not_found"
        });
        console.log(`Bank lookup failed for agent: ${agent_name}`);
        return;
      }

      // Check if already paid through derash (bank) - only check derashPaid status
      // This allows office payments to be updated with bank payments if needed
      const isDerashPaid = matchingBill.isDerashPaid || matchingBill.derashPaid;
      
      if (isDerashPaid) {
        alreadyPaidList.push({
          rowNumber,
          csvData: row,
          billData: matchingBill,
          paidAmountNum,
          paidDate,
          reason: "Already paid through bank"
        });
        console.log("Bill moved to already paid list:", matchingBill.id);
        return;
      }

      // Valid record - add to paid list
      paidList.push({
        rowNumber,
        csvData: row,
        billData: matchingBill,
        paidAmountNum,
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
      // Prepare update requests
      const updateRequests = validatedData.paidList.map(item => {
        const { billData, csvData, paidAmountNum, paidDate } = item;
        
        return {
          id: billData.id,
          updates: {
            tekilalaYetekefele: (billData.kecreditYetekefele || 0) + paidAmountNum,
            tekilalaBankYetekefele: paidAmountNum,
            isPaidThroughBank: true,
            isDerashPaid: true,
            moneyCollectedDate: paidDate.toISOString(),
            bankPaidConfirmationCode: csvData.agent_confirmation_code,
            bankPaidAgentId: csvData.agent_name
          }
        };
      });

      const totalCount = updateRequests.length;
      setTotalRecords(totalCount);
      const batchSize = Math.max(1, Math.min(10, Math.ceil(totalCount / 10))); // Process in batches of 10 or smaller
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      console.log(`Processing ${totalCount} records in batches of ${batchSize}`);
      
      // Process records in batches for real-time progress
      for (let i = 0; i < updateRequests.length; i += batchSize) {
        const batch = updateRequests.slice(i, i + batchSize);
        
        try {
          console.log(`Processing batch ${Math.floor(i / batchSize) + 1}: records ${i + 1}-${Math.min(i + batchSize, totalCount)}`);
          
          // Process batch
          const response = await bankPaymentImportService.updateBankPayments(batch);
          
          processedCount += batch.length;
          successCount += response?.updatedCount || batch.length;
          
          // Update progress based on actual completion
          const progress = Math.round((processedCount / totalCount) * 100);
          setSavingProgress(progress);
          setProcessedRecords(processedCount);
          
          console.log(`Batch completed: ${processedCount}/${totalCount} (${progress}%)`);
          
          // Small delay to show progress visually
          if (i + batchSize < updateRequests.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (batchError) {
          console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, batchError);
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
        toast.success(`Successfully updated all ${successCount} payment records`);
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
      console.error("Error saving payments:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      if (error.response?.data?.message) {
        toast.error(`Failed to save: ${error.response.data.message}`);
      } else {
        toast.error("Failed to save payment updates");
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
      case "account_not_found": return "error";
      case "invoice_mismatch": return "warning";
      case "payment_mismatch": return "error";
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
            Import Bank Payments - {selectedKifyaWerMonth} {selectedKifyaWerYear}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Upload a CSV file with bank payment information. Expected columns: 
            bill_data_file_id, bill_id, bill_reason, customer_id, customer_name, 
            paid_amount, paid_date, agent_name, agent_confirmation_code
          </Typography>

          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="csv-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<UploadIcon />}
              disabled={isProcessing}
            >
              {csvFile ? csvFile.name : "Choose CSV File"}
            </Button>
          </label>

          {isProcessing && (
            <Box mt={2}>
              <LinearProgress />
              <Typography variant="body2" mt={1}>Processing CSV file...</Typography>
            </Box>
          )}
        </Box>

        {csvData.length > 0 && (
          <>
            <Box mb={2}>
              <Alert severity="info">
                Processed {csvData.length} rows from CSV. 
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
                        <TableCell>Customer ID</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Bill ID</TableCell>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell>Paid Date</TableCell>
                        <TableCell>Agent</TableCell>
                        <TableCell>Confirmation Code</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedData(validatedData.paidList, validPaymentsPage).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.rowNumber}</TableCell>
                          <TableCell>{item.csvData.customer_id}</TableCell>
                          <TableCell>{item.csvData.customer_name}</TableCell>
                          <TableCell>{item.csvData.bill_id}</TableCell>
                          <TableCell>{item.paidAmountNum.toFixed(2)}</TableCell>
                          <TableCell>{item.paidDate.toLocaleDateString()}</TableCell>
                          <TableCell>{lookupBankName(item.csvData.agent_name)}</TableCell>
                          <TableCell>{item.csvData.agent_confirmation_code}</TableCell>
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
                        <TableCell>Customer ID</TableCell>
                        <TableCell>Bill ID</TableCell>
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
                          <TableCell>{error.data.customer_id}</TableCell>
                          <TableCell>{error.data.bill_id}</TableCell>
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
                        <TableCell>Customer ID</TableCell>
                        <TableCell>Customer Name</TableCell>
                        <TableCell>Bill ID</TableCell>
                        <TableCell>Paid Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getPaginatedData(validatedData.alreadyPaidList, alreadyPaidPage).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.rowNumber}</TableCell>
                          <TableCell>{item.csvData.customer_id}</TableCell>
                          <TableCell>{item.csvData.customer_name}</TableCell>
                          <TableCell>{item.csvData.bill_id}</TableCell>
                          <TableCell>{item.paidAmountNum.toFixed(2)}</TableCell>
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
                : `Save ${validatedData.paidList.length} Payments`
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

export default BankPaymentImportModal;
