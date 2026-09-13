"use client";
import { useMemo, useState, useEffect, useRef } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import bankDerashService from "@/app/lib/bankDerashService";
import bankPaymentImportService from "@/app/lib/bankPaymentImportService";
import billingBanksService from "@/app/lib/billingBanksService";
import EtDatePicker from "mui-ethiopian-datepicker";
var ethiopianDate = require("ethiopian-date");

const BankImportDerash = () => {
  // State for Derash bank payment flow
  const [bankProcessResult, setBankProcessResult] = useState(null);
  const [bankProcessing, setBankProcessing] = useState(false);
  const [bankFromDate, setBankFromDate] = useState("");
  const [bankToDate, setBankToDate] = useState("");
  const [bankFromDateEC, setBankFromDateEC] = useState(null);
  const [bankToDateEC, setBankToDateEC] = useState(null);
  const [csvFetched, setCsvFetched] = useState(false);
  const [fetchedFilePath, setFetchedFilePath] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const progressTimerRef = useRef(null);
  const logsTimerRef = useRef(null);

  const [applying, setApplying] = useState(false);
  const [applyProgress, setApplyProgress] = useState(0);
  const [applyProcessed, setApplyProcessed] = useState(0);
  const [applyTotal, setApplyTotal] = useState(0);

  const [procStartMs, setProcStartMs] = useState(null);
  const [procSpeed, setProcSpeed] = useState(null);
  const [procEtaSec, setProcEtaSec] = useState(null);

  const ethiopianMonths = [
    "መስከረም",
    "ጥቅምት",
    "ኅዳር",
    "ታህሣሥ",
    "ጥር",
    "የካቲት",
    "መጋቢት",
    "ሚያዚያ",
    "ግንቦት",
    "ሰኔ",
    "ሐምሌ",
    "ነሐሴ",
    "ጳጉሜ",
  ];
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const currentGregorianDate = new Date();
  const [ethYear] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );
  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = ethYear - 5; i <= ethYear + 1; i++) years.push(i);
    return years;
  }, [ethYear]);

  // Format a JS Date to YYYY-MM-DD (Gregorian) for API calls
  const formatDateGC = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Banks lookup for mapping agent/bank IDs to names
  const { data: allBanks = [] } = useQuery({
    queryKey: ["billing-banks-all-for-derash"],
    queryFn: () => billingBanksService.getAllBillingBanks(),
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000,
  });
  const bankNameById = useMemo(() => {
    const m = new Map();
    for (const b of allBanks || []) {
      const name = b?.bankName || b?.gatewayCode || b?.bankCode || (b?.id != null ? String(b.id) : "");
      if (b?.id != null) m.set(String(b.id), name);
      if (b?.bankCode != null && b.bankCode !== "") m.set(String(b.bankCode), name);
      if (b?.gatewayCode != null && b.gatewayCode !== "") m.set(String(b.gatewayCode), name);
    }
    return m;
  }, [allBanks]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (logsTimerRef.current) clearInterval(logsTimerRef.current);
    };
  }, []);

  // ===== DERASH FLOW HANDLERS =====
  const handleFetchDerash = async () => {
    if (!bankFromDate || !bankToDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    try {
      setBankProcessing(true);
      const res = await bankDerashService.fetchByDateRange(bankFromDate, bankToDate);
      if (res?.success) {
        toast.success("Fetched CSV successfully from Derash API");
        setCsvFetched(true);
        setFetchedFilePath(res.file || "");
      } else {
        toast.error("Fetch failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Fetch failed");
    } finally {
      setBankProcessing(false);
    }
  };

  const handleUploadCsv = async () => {
    if (!bankFromDate || !bankToDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (!uploadFile) {
      toast.error("Please choose a CSV file to upload");
      return;
    }
    try {
      setBankProcessing(true);
      const res = await bankDerashService.uploadCsv(uploadFile, bankFromDate, bankToDate);
      if (res?.success) {
        setCsvFetched(true);
        setFetchedFilePath(res.file || res.publicUrl || "");
        toast.success("CSV uploaded successfully. You can now Process CSV.");
      } else {
        toast.error(res?.message || "Upload failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Upload failed");
    } finally {
      setBankProcessing(false);
    }
  };

  const handleProcessDerash = async () => {
    if (!bankFromDate || !bankToDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (!csvFetched) {
      toast.error("Please fetch CSV data first");
      return;
    }
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error("Please select kifyaWer month and year");
      return;
    }
    // reset state
    setBankProcessResult(null);
    setProgress(null);
    setProgressLogs([]);
    setJobId(null);
    setProcStartMs(null);
    setProcSpeed(null);
    setProcEtaSec(null);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (logsTimerRef.current) clearInterval(logsTimerRef.current);
    try {
      setBankProcessing(true);
      const kifyaWer = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      const start = await bankDerashService.startProcessAsync(bankFromDate, bankToDate, kifyaWer);
      const jid = start?.jobId;
      if (!jid) {
        throw new Error(start?.message || "Failed to start process");
      }
      setJobId(jid);
      const __procStartedAt = Date.now();
      setProcStartMs(__procStartedAt);
      // Poll progress
      progressTimerRef.current = setInterval(async () => {
        try {
          const p = await bankDerashService.getProgress(jid);
          setProgress(p);
          const total = p?.total || 0;
          const processed = p?.processed || 0;
          if (__procStartedAt != null) {
            const elapsedSec = Math.max(0.001, (Date.now() - __procStartedAt) / 1000);
            const spd = processed / elapsedSec;
            setProcSpeed(spd);
            if (spd > 0 && total > 0 && processed <= total) {
              const remaining = Math.max(0, total - processed);
              const eta = Math.round(remaining / spd);
              setProcEtaSec(eta);
            }
          }
          if (p?.done) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            if (logsTimerRef.current) clearInterval(logsTimerRef.current);
            try {
              const res = await bankDerashService.getProcessResult(jid);
              if (res?.success) {
                setBankProcessResult(res.result);
                toast.success(`Processed ${res?.result?.totalPaidCount || 0} CSV rows. Found ${res?.result?.newPayments?.length || 0} new payments.`);
              } else {
                toast.error(res?.message || "Process failed");
              }
            } catch (err) {
              toast.error(err?.response?.data?.message || err?.message || "Process failed");
            } finally {
              setBankProcessing(false);
            }
          }
        } catch (err) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          if (logsTimerRef.current) clearInterval(logsTimerRef.current);
          setBankProcessing(false);
          toast.error(err?.response?.data?.message || err?.message || "Process failed");
        }
      }, 2500);
      // Poll logs (temporarily disabled)
      // logsTimerRef.current = setInterval(async () => {
      //   try {
      //     const l = await bankDerashService.getProgressLogs(jid);
      //     if (Array.isArray(l?.logs)) setProgressLogs(l.logs);
      //   } catch (_) {
      //     // ignore transient log errors
      //   }
      // }, 2000);
    } catch (e) {
      setBankProcessing(false);
      if (e?.response?.status === 404) {
        toast.error("CSV file not found. Please fetch data first.");
      } else {
        toast.error(e?.response?.data?.message || e?.message || "Process failed");
      }
    }
  };

  const handleApplyNewPayments = async () => {
    try {
      if (!bankProcessResult?.newPayments?.length) {
        toast.info("No new payments to apply");
        return;
      }

      const updates = bankProcessResult.newPayments.map(p => ({
        id: p.id,
        updates: {
          tekilalaYetekefele: p.tekilalaYetekefele,
          tekilalaBankYetekefele: p.tekilalaBankYetekefele,
          isPaidThroughBank: true,
          isDerashPaid: true,
          moneyCollectedDate: p.moneyCollectedDate,
          bankPaidConfirmationCode: p.bankPaidConfirmationCode,
          bankPaidAgentId: p.bankPaidAgentId,
        }
      }));

      const totalCount = updates.length;
      setApplying(true);
      setApplyProgress(0);
      setApplyProcessed(0);
      setApplyTotal(totalCount);

      const batchSize = Math.max(1, Math.min(10, Math.ceil(totalCount / 10)));
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        try {
          const res = await bankPaymentImportService.updateBankPayments(batch);
          processedCount += batch.length;
          successCount += res?.updatedCount || batch.length;
        } catch (_) {
          errorCount += batch.length;
          processedCount += batch.length;
        }
        const progress = Math.round((processedCount / totalCount) * 100);
        setApplyProgress(progress);
        setApplyProcessed(processedCount);
        if (i + batchSize < updates.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      setApplyProgress(100);

      if (errorCount > 0) {
        toast.warning(`Completed with ${successCount} successful, ${errorCount} failed out of ${totalCount} records`);
      } else {
        toast.success(`Successfully updated all ${successCount} payment records`);
      }

      setBankProcessResult(null);
      setCsvFetched(false);
      setFetchedFilePath("");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk update failed");
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setBankProcessResult(null);
    setCsvFetched(false);
    setFetchedFilePath("");
    setBankFromDate("");
    setBankToDate("");
    setBankFromDateEC(null);
    setBankToDateEC(null);
    setSelectedKifyaWerMonth("");
    setSelectedKifyaWerYear("");
  };

  // Columns for new payments table
  const newPaymentsColumns = useMemo(() => [
    {
      header: "#",
      size: 60,
      Cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "invoiceNumber",
      header: "Invoice Number",
      size: 150,
    },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 260,
      Cell: ({ row, cell }) => {
        const name = cell.getValue();
        const acc = row?.original?.customerAccountNumber ?? row?.original?.accountNumber ?? "";
        return acc ? `${name} (${acc})` : name;
      },
    },
    {
      accessorKey: "kifyaWer",
      header: "Kifya Wer",
      size: 120,
    },
    {
      accessorKey: "tekilalaTekefay",
      header: "Amount Due",
      size: 120,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? `${Number(value).toFixed(2)} ETB` : "0.00 ETB";
      },
    },
    {
      accessorKey: "tekilalaBankYetekefele",
      header: "Paid Amount",
      size: 120,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? `${Number(value).toFixed(2)} ETB` : "0.00 ETB";
      },
    },
    {
      accessorKey: "difference",
      header: "Difference",
      size: 120,
      Cell: ({ row }) => {
        const due = Number(row?.original?.tekilalaTekefay ?? 0);
        const paid = Number(row?.original?.tekilalaBankYetekefele ?? 0);
        const diff = due - paid;
        return `${diff.toFixed(2)} ETB`;
      },
    },
    {
      accessorKey: "bankName",
      header: "Agent/Bank",
      size: 200,
      Cell: ({ cell }) => {
        const val = cell.getValue();
        return val || "";
      },
    },
    {
      accessorKey: "bankPaidConfirmationCode",
      header: "Confirmation Code",
      size: 180,
    },
    {
      accessorKey: "moneyCollectedDate",
      header: "Payment Date",
      size: 120,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value ? new Date(value).toLocaleDateString() : "";
      },
    },
  ], []);

  const newPaymentsTable = useMaterialReactTable({
    columns: newPaymentsColumns,
    data: bankProcessResult?.newPayments || [],
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: {
      sx: {
        minHeight: "300px",
        maxHeight: "500px",
      },
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const voidBillsTable = useMaterialReactTable({
    columns: newPaymentsColumns,
    data: bankProcessResult?.voidBills || [],
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: {
      sx: {
        minHeight: "300px",
        maxHeight: "500px",
      },
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Skipped bills columns and table (bank not found)
  const skippedBillsColumns = useMemo(() => [
    {
      header: "#",
      size: 60,
      Cell: ({ row }) => row.index + 1,
    },
    { accessorKey: "invoiceNumber", header: "Invoice Number", size: 150 },
    {
      accessorKey: "customerName",
      header: "Customer Name",
      size: 220,
      Cell: ({ row, cell }) => {
        const name = cell.getValue();
        const acc = row?.original?.customerAccountNumber ?? "";
        return acc ? `${name} (${acc})` : (name || "");
      },
    },
    { accessorKey: "agentId", header: "Agent ID (CSV)", size: 140 },
    {
      accessorKey: "paidAmount",
      header: "Paid Amount",
      size: 120,
      Cell: ({ cell }) => {
        const v = cell.getValue();
        return v != null ? `${Number(v).toFixed(2)} ETB` : "0.00 ETB";
      },
    },
    {
      accessorKey: "paidDate",
      header: "Payment Date",
      size: 120,
      Cell: ({ cell }) => {
        const v = cell.getValue();
        return v ? new Date(v).toLocaleDateString() : "";
      },
    },
    { accessorKey: "reason", header: "Skip Reason", size: 350 },
  ], []);

  const skippedBillsTable = useMaterialReactTable({
    columns: skippedBillsColumns,
    data: bankProcessResult?.skippedBills || [],
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: {
      sx: {
        minHeight: "200px",
        maxHeight: "500px",
      },
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb pageName="Bank Import - Derash" />
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            Derash Bank Payment Import
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fetch payment data from Derash API, process it, and apply new payments to bills.
          </Typography>

          {/* Step 1: Date Selection and Fetch */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Fetch Payment Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <EtDatePicker
                label="From Date (EC)"
                value={bankFromDateEC}
                onChange={(val) => {
                  setBankFromDateEC(val);
                  setBankFromDate(formatDateGC(val));
                }}
                size="small"
                sx={{ width: 220 }}
              />
              <EtDatePicker
                label="To Date (EC)"
                value={bankToDateEC}
                onChange={(val) => {
                  setBankToDateEC(val);
                  setBankToDate(formatDateGC(val));
                }}
                size="small"
                sx={{ width: 220 }}
              />
              <Button
                variant="contained"
                disabled={bankProcessing || !bankFromDate || !bankToDate}
                onClick={handleFetchDerash}
                sx={{ minWidth: 120 }}
              >
                {bankProcessing ? <CircularProgress size={20} /> : 'Fetch CSV'}
              </Button>
            </Box>
            {csvFetched && (
              <Alert severity="success" sx={{ mt: 1 }}>
                CSV file fetched successfully! File: {fetchedFilePath}
              </Alert>
            )}
          </Box>

          {/* Step 2: Process CSV */}
          <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Step 2: Process CSV Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel id="kifyaWer-month-label">Month (EC)</InputLabel>
                <Select
                  labelId="kifyaWer-month-label"
                  label="Month (EC)"
                  value={selectedKifyaWerMonth}
                  onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
                >
                  {ethiopianMonths.map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel id="kifyaWer-year-label">Year (EC)</InputLabel>
                <Select
                  labelId="kifyaWer-year-label"
                  label="Year (EC)"
                  value={selectedKifyaWerYear}
                  onChange={(e) => setSelectedKifyaWerYear(e.target.value)}
                >
                  {yearOptions.map((y) => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              disabled={bankProcessing || !csvFetched}
              onClick={handleProcessDerash}
              sx={{ minWidth: 120 }}
            >
              {bankProcessing ? <CircularProgress size={20} /> : 'Process CSV'}
            </Button>
            {!csvFetched && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Please fetch CSV data first
              </Typography>
            )}
            {bankProcessing && (
              <Box sx={{ mt: 2 }}>
                {progress?.percent != null ? (
                  <>
                    <LinearProgress variant="determinate" value={progress.percent} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {progress.percent}% ({progress.processed || 0}/{progress.total || 0}) {progress.status ? `- ${progress.status}` : ''} {progress.message ? `: ${progress.message}` : ''}
                      {procSpeed != null ? ` - Speed: ${procSpeed.toFixed(1)} rec/s` : ''}
                      {procEtaSec != null ? ` - ETA: ${Math.floor(procEtaSec / 60)}:${String((procEtaSec % 60) || 0).padStart(2, '0')}` : ''}
                    </Typography>
                  </>
                ) : (
                  <>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Starting processing... This may take a while. Please keep this tab open.
                    </Typography>
                  </>
                )}
                {/* Live logs (temporarily disabled)
                {progressLogs?.length > 0 && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', border: '1px solid #eee', borderRadius: 1, maxHeight: 220, overflow: 'auto' }}>
                    <Typography variant="subtitle2" gutterBottom>Processing logs</Typography>
                    <Box component="pre" sx={{ m: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                      {progressLogs.join('\n')}
                    </Box>
                  </Box>
                )}
                */}
              </Box>
            )}
          </Box>

          {/* Alternative: Upload CSV file instead of fetching */}
          <Box sx={{ mb: 3, p: 2, border: '1px dashed #9e9e9e', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Alternative: Upload CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select the same date range as your CSV, choose the CSV file, then upload. After upload, click "Process CSV" above.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={bankProcessing}
              />
              <Button
                variant="outlined"
                onClick={handleUploadCsv}
                disabled={bankProcessing || !uploadFile || !bankFromDate || !bankToDate}
              >
                {bankProcessing ? <CircularProgress size={20} /> : 'Upload CSV'}
              </Button>
            </Box>
            {fetchedFilePath && (
              <Alert severity="success" sx={{ mt: 1 }}>
                CSV ready: {fetchedFilePath}
              </Alert>
            )}
          </Box>

          {/* Step 3: Results Summary */}
          {bankProcessResult && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Processing Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs="auto">
                  <Chip
                    label={`New Payments: ${bankProcessResult.newPayments?.length || 0}`}
                    color="success"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs="auto">
                  <Chip
                    label={`Already Paid: ${bankProcessResult.alreadyPaid?.length || 0}`}
                    color="info"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs="auto">
                  <Chip
                    label={`Paid but Void: ${bankProcessResult.voidBills?.length || 0}`}
                    color="error"
                    variant="filled"
                  />
                </Grid>
                <Grid item xs="auto">
                  <Chip
                    label={`Not Found: ${bankProcessResult.notFound?.length || 0}`}
                    color="warning"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs="auto">
                  <Chip
                    label={`Duplicates: ${bankProcessResult.duplicates?.length || 0}`}
                    color="error"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs="auto">
                  <Chip
                    label={`Skipped (Bank Not Found): ${bankProcessResult.skippedBills?.length || 0}`}
                    color="warning"
                    variant="filled"
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Total CSV rows processed: {bankProcessResult.totalPaidCount || 0}
              </Typography>
            </Box>
          )}

          {bankProcessResult?.newPayments?.length > 0 && (
            <Box sx={{ mb: 3, p: 2, border: '1px solid #4caf50', borderRadius: 1, bgcolor: '#f1f8e9' }}>
              <Typography variant="h6" gutterBottom>
                Step 3: Apply New Payments
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={bankProcessing || applying}
                  onClick={handleApplyNewPayments}
                  sx={{ minWidth: 150 }}
                  startIcon={(bankProcessing || applying) ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {applying
                    ? `Applying... ${applyProcessed}/${applyTotal} (${applyProgress}%)`
                    : `Apply ${bankProcessResult.newPayments.length} Payments`}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  This will update the bills to mark them as paid through bank
                </Typography>
              </Box>
              {applying && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={applyProgress} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    {applyProgress}% ({applyProcessed}/{applyTotal}) Applying payments...
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Reset Button */}
          <Box sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              disabled={bankProcessing}
            >
              Reset / Start Over
            </Button>
          </Box>

          {/* New Payments Table */}
          {bankProcessResult?.newPayments?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                New Payments to Apply ({bankProcessResult.newPayments.length})
              </Typography>
              <MaterialReactTable table={newPaymentsTable} />
            </Box>
          )}

          {/* Void Bills Table */}
          {bankProcessResult?.voidBills?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="error" gutterBottom>
                Paid But Void Bills ({bankProcessResult.voidBills.length})
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                These bills were paid at the bank but are marked as VOID locally. They will NOT be updated.
              </Alert>
              <MaterialReactTable table={voidBillsTable} />
            </Box>
          )}

          {/* Already Paid Table */}
          {bankProcessResult?.alreadyPaid?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Already Paid Bills ({bankProcessResult.alreadyPaid.length})
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                These bills are already marked as paid and will not be updated.
              </Alert>
              {/* You can add another table here for already paid bills if needed */}
            </Box>
          )}

          {/* Not Found / Duplicates */}
          {(bankProcessResult?.notFound?.length > 0 || bankProcessResult?.duplicates?.length > 0) && (
            <Box sx={{ mt: 3 }}>
              {bankProcessResult?.notFound?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Bills Not Found ({bankProcessResult.notFound.length}):</Typography>
                  <Typography variant="body2">
                    {bankProcessResult.notFound.slice(0, 10).join(", ")}
                    {bankProcessResult.notFound.length > 10 && "..."}
                  </Typography>
                </Alert>
              )}

              {bankProcessResult?.duplicates?.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Duplicate Entries ({bankProcessResult.duplicates.length}):</Typography>
                  <Typography variant="body2">
                    {bankProcessResult.duplicates.slice(0, 10).join(", ")}
                    {bankProcessResult.duplicates.length > 10 && "..."}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {/* Skipped Bills Table (bank not found) */}
          {bankProcessResult?.skippedBills?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Skipped Bills - Bank Not Found ({bankProcessResult.skippedBills.length})
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                These bills were skipped because the agent_id from CSV does not match any bankCode in the database. They will NOT be applied.
              </Alert>
              <MaterialReactTable table={skippedBillsTable} />
            </Box>
          )}
        </Paper>
      </Grid>

      <ToastContainer />
    </Grid>
  );
};

// Wrap with QueryClient
const BankImportDerashWithProvider = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BankImportDerash />
    </QueryClientProvider>
  );
};

export default BankImportDerashWithProvider;
