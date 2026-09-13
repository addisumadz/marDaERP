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
import bankMardaArifService from "@/app/lib/bankMardaArifService";
import billingBanksService from "@/app/lib/billingBanksService";
import { MardaArifPaymentImportService } from "@/app/lib/mardaarifPaymentImportService";
import EtDatePicker from "mui-ethiopian-datepicker";
var ethiopianDate = require("ethiopian-date");

const mardaarifPaymentImportService = new MardaArifPaymentImportService();

const BankImportMardaArif = () => {
  const [processResult, setProcessResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromDateEC, setFromDateEC] = useState(null);
  const [toDateEC, setToDateEC] = useState(null);
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
    "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
    "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
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

  const formatDateGC = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const { data: allBanks = [] } = useQuery({
    queryKey: ["billing-banks-all-for-mardaarif"],
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

  useEffect(() => {
    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (logsTimerRef.current) clearInterval(logsTimerRef.current);
    };
  }, []);

  const handleFetchMardaArif = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    try {
      setProcessing(true);
      const res = await bankMardaArifService.fetchByDateRange(fromDate, toDate);
      if (res?.success) {
        toast.success("Fetched CSV successfully from MardaArif API");
        setCsvFetched(true);
        setFetchedFilePath(res.file || "");
      } else {
        toast.error(res?.message || "Fetch failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Fetch failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleUploadCsv = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (!uploadFile) {
      toast.error("Please choose a CSV file to upload");
      return;
    }
    try {
      setProcessing(true);
      const res = await bankMardaArifService.uploadCsv(uploadFile, fromDate, toDate);
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
      setProcessing(false);
    }
  };

  const handleProcessMardaArif = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }
    if (!csvFetched) {
      toast.error("Please fetch or upload CSV data first");
      return;
    }
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error("Please select kifyaWer month and year");
      return;
    }

    setProcessResult(null);
    setProgress(null);
    setProgressLogs([]);
    setJobId(null);
    setProcStartMs(null);
    setProcSpeed(null);
    setProcEtaSec(null);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    if (logsTimerRef.current) clearInterval(logsTimerRef.current);

    try {
      setProcessing(true);
      const kifyaWer = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      const start = await bankMardaArifService.startProcessAsync(fromDate, toDate, kifyaWer);
      const jid = start?.jobId;
      if (!jid) {
        throw new Error(start?.message || "Failed to start process");
      }
      setJobId(jid);
      const __procStartedAt = Date.now();
      setProcStartMs(__procStartedAt);

      progressTimerRef.current = setInterval(async () => {
        try {
          const p = await bankMardaArifService.getProgress(jid);
          setProgress(p);
          const total = p?.total || 0;
          const processedCount = p?.processed || 0;
          if (__procStartedAt != null) {
            const elapsedSec = Math.max(0.001, (Date.now() - __procStartedAt) / 1000);
            const spd = processedCount / elapsedSec;
            setProcSpeed(spd);
            if (spd > 0 && total > 0 && processedCount <= total) {
              const remaining = Math.max(0, total - processedCount);
              const eta = Math.round(remaining / spd);
              setProcEtaSec(eta);
            }
          }
          if (p?.done) {
            if (progressTimerRef.current) clearInterval(progressTimerRef.current);
            if (logsTimerRef.current) clearInterval(logsTimerRef.current);
            try {
              const res = await bankMardaArifService.getProcessResult(jid);
              if (res?.success) {
                setProcessResult(res.result);
                toast.success(`Processed ${res?.result?.totalPaidCount || 0} CSV rows. Found ${res?.result?.newPayments?.length || 0} new payments.`);
              } else {
                toast.error(res?.message || "Process failed");
              }
            } catch (err) {
              toast.error(err?.response?.data?.message || err?.message || "Process failed");
            } finally {
              setProcessing(false);
            }
          }
        } catch (err) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          if (logsTimerRef.current) clearInterval(logsTimerRef.current);
          setProcessing(false);
          toast.error(err?.response?.data?.message || err?.message || "Process failed");
        }
      }, 2500);
    } catch (e) {
      setProcessing(false);
      if (e?.response?.status === 404) {
        toast.error("CSV file not found. Please fetch or upload data first.");
      } else {
        toast.error(e?.response?.data?.message || e?.message || "Process failed");
      }
    }
  };

  const handleApplyMardaArifPayments = async () => {
    try {
      if (!processResult?.newPayments?.length) {
        toast.info("No new payments to apply");
        return;
      }

      const updates = processResult.newPayments.map((p) => ({
        id: p.id,
        updates: {
          tekilalaYetekefele: p.tekilalaYetekefele,
          tekilalaBankYetekefele: p.tekilalaBankYetekefele,
          isMardaArifPaid: true,
          moneyCollectedDate: p.moneyCollectedDate ? new Date(p.moneyCollectedDate).toISOString() : new Date().toISOString(),
          mBankPaidConfirmationCode: p.bankPaidConfirmationCode,
          mBankPaidAgentId: p.bankPaidAgentId,
        },
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
          const res = await mardaarifPaymentImportService.updateMardaArifPayments(batch);
          processedCount += batch.length;
          successCount += res?.updatedCount || batch.length;
        } catch (_) {
          errorCount += batch.length;
          processedCount += batch.length;
        }
        const prog = Math.round((processedCount / totalCount) * 100);
        setApplyProgress(prog);
        setApplyProcessed(processedCount);
        if (i + batchSize < updates.length) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }

      setApplyProgress(100);

      if (errorCount > 0) {
        toast.warning(`Completed with ${successCount} successful, ${errorCount} failed out of ${totalCount} records`);
      } else {
        toast.success(`Successfully updated all ${successCount} MardaArif payment records`);
      }

      setProcessResult(null);
      setCsvFetched(false);
      setFetchedFilePath("");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk update failed");
    } finally {
      setApplying(false);
    }
  };

  const handleReset = () => {
    setProcessResult(null);
    setCsvFetched(false);
    setFetchedFilePath("");
    setFromDate("");
    setToDate("");
    setFromDateEC(null);
    setToDateEC(null);
    setSelectedKifyaWerMonth("");
    setSelectedKifyaWerYear("");
  };

  const newPaymentsColumns = useMemo(
    () => [
      { header: "#", size: 60, Cell: ({ row }) => row.index + 1 },
      { accessorKey: "invoiceNumber", header: "Invoice Number", size: 150 },
      { accessorKey: "customerName", header: "Customer Name", size: 260 },
      { accessorKey: "customerAccountNumber", header: "Account Number", size: 180 },
      { accessorKey: "kifyaWer", header: "Kifya Wer", size: 120 },
      {
        accessorKey: "tekilalaTekefay", header: "Amount Due", size: 120,
        Cell: ({ cell }) => { const value = cell.getValue(); return value ? `${Number(value).toFixed(2)} ETB` : "0.00 ETB"; },
      },
      {
        accessorKey: "tekilalaBankYetekefele", header: "Paid Amount", size: 120,
        Cell: ({ cell }) => { const value = cell.getValue(); return value ? `${Number(value).toFixed(2)} ETB` : "0.00 ETB"; },
      },
      {
        accessorKey: "difference", header: "Difference", size: 120,
        Cell: ({ row }) => {
          const due = Number(row?.original?.tekilalaTekefay ?? 0);
          const paid = Number(row?.original?.tekilalaBankYetekefele ?? 0);
          const diff = due - paid;
          return `${diff.toFixed(2)} ETB`;
        },
      },
      {
        accessorKey: "bankName", header: "Bank", size: 200,
        Cell: ({ cell }) => { const val = cell.getValue(); return val || ""; },
      },
      { accessorKey: "bankPaidConfirmationCode", header: "Confirmation Code", size: 180 },
      {
        accessorKey: "moneyCollectedDate", header: "Payment Date", size: 120,
        Cell: ({ cell }) => { const value = cell.getValue(); return value ? new Date(value).toLocaleDateString() : ""; },
      },
    ],
    []
  );

  const newPaymentsTable = useMaterialReactTable({
    columns: newPaymentsColumns,
    data: processResult?.newPayments || [],
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: { sx: { minHeight: "300px", maxHeight: "500px" } },
    initialState: { pagination: { pageSize: 10 } },
  });

  const skippedBillsColumns = useMemo(() => [
    { header: "#", size: 60, Cell: ({ row }) => row.index + 1 },
    { accessorKey: "invoiceNumber", header: "Invoice Number", size: 150 },
    {
      accessorKey: "customerName", header: "Customer Name", size: 220,
      Cell: ({ row, cell }) => {
        const name = cell.getValue();
        const acc = row?.original?.customerAccountNumber ?? "";
        return acc ? `${name} (${acc})` : (name || "");
      },
    },
    { accessorKey: "agentId", header: "Bank Name (CSV)", size: 160 },
    {
      accessorKey: "paidAmount", header: "Paid Amount", size: 120,
      Cell: ({ cell }) => { const v = cell.getValue(); return v != null ? `${Number(v).toFixed(2)} ETB` : "0.00 ETB"; },
    },
    {
      accessorKey: "paidDate", header: "Payment Date", size: 120,
      Cell: ({ cell }) => { const v = cell.getValue(); return v ? new Date(v).toLocaleDateString() : ""; },
    },
    { accessorKey: "reason", header: "Skip Reason", size: 350 },
  ], []);

  const skippedBillsTable = useMaterialReactTable({
    columns: skippedBillsColumns,
    data: processResult?.skippedBills || [],
    enableRowSelection: false,
    enableColumnOrdering: false,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: { sx: { minHeight: "200px", maxHeight: "500px" } },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb pageName="Bank Import - MardaArif" />
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>
            MardaArif Bank Payment Import
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fetch payment data from MardaArif API or upload a CSV file, process it, and apply new payments to bills.
          </Typography>

          <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Step 1: Fetch Payment Data
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <EtDatePicker
                label="From Date (EC)"
                value={fromDateEC}
                onChange={(val) => { setFromDateEC(val); setFromDate(formatDateGC(val)); }}
                size="small"
                sx={{ width: 220 }}
              />
              <EtDatePicker
                label="To Date (EC)"
                value={toDateEC}
                onChange={(val) => { setToDateEC(val); setToDate(formatDateGC(val)); }}
                size="small"
                sx={{ width: 220 }}
              />
              <Button
                variant="contained"
                disabled={processing || !fromDate || !toDate}
                onClick={handleFetchMardaArif}
                sx={{ minWidth: 120 }}
              >
                {processing ? <CircularProgress size={20} /> : "Fetch CSV"}
              </Button>
            </Box>
            {csvFetched && (
              <Alert severity="success" sx={{ mt: 1 }}>
                CSV file ready! File: {fetchedFilePath}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 3, p: 2, border: "1px dashed #9e9e9e", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Alternative: Upload CSV File
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select the same date range as your CSV, choose the CSV file, then upload. After upload, click &quot;Process CSV&quot; above.
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                disabled={processing}
              />
              <Button
                variant="outlined"
                onClick={handleUploadCsv}
                disabled={processing || !uploadFile || !fromDate || !toDate}
              >
                {processing ? <CircularProgress size={20} /> : "Upload CSV"}
              </Button>
            </Box>
            {fetchedFilePath && (
              <Alert severity="success" sx={{ mt: 1 }}>
                CSV ready: {fetchedFilePath}
              </Alert>
            )}
          </Box>

          <Box sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Step 2: Process CSV Data
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
              <FormControl sx={{ minWidth: 180 }} size="small">
                <InputLabel id="kifyaWer-month-label-ma">Month (EC)</InputLabel>
                <Select
                  labelId="kifyaWer-month-label-ma"
                  label="Month (EC)"
                  value={selectedKifyaWerMonth}
                  onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
                >
                  {ethiopianMonths.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 140 }} size="small">
                <InputLabel id="kifyaWer-year-label-ma">Year (EC)</InputLabel>
                <Select
                  labelId="kifyaWer-year-label-ma"
                  label="Year (EC)"
                  value={selectedKifyaWerYear}
                  onChange={(e) => setSelectedKifyaWerYear(e.target.value)}
                >
                  {yearOptions.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              disabled={processing || !csvFetched}
              onClick={handleProcessMardaArif}
              sx={{ minWidth: 120 }}
            >
              {processing ? <CircularProgress size={20} /> : "Process CSV"}
            </Button>
            {!csvFetched && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Please fetch or upload CSV data first
              </Typography>
            )}
            {processing && (
              <Box sx={{ mt: 2 }}>
                {progress?.percent != null ? (
                  <>
                    <LinearProgress variant="determinate" value={progress.percent} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      {progress.percent}% ({progress.processed || 0}/{progress.total || 0}) {progress.status ? `- ${progress.status}` : ""} {progress.message ? `: ${progress.message}` : ""}
                      {procSpeed != null ? ` - Speed: ${procSpeed.toFixed(1)} rec/s` : ""}
                      {procEtaSec != null ? ` - ETA: ${Math.floor(procEtaSec / 60)}:${String((procEtaSec % 60) || 0).padStart(2, "0")}` : ""}
                    </Typography>
                  </>
                ) : (
                  <>
                    <LinearProgress />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                      Starting processing... This may take a while. Please keep this tab open.
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </Box>

          {processResult && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Processing Results
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Chip label={`New Payments: ${processResult.newPayments?.length || 0}`} color="success" variant="outlined" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`Already Paid: ${processResult.alreadyPaid?.length || 0}`} color="info" variant="outlined" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`Not Found: ${processResult.notFound?.length || 0}`} color="warning" variant="outlined" />
                </Grid>
                <Grid item xs={3}>
                  <Chip label={`Duplicates: ${processResult.duplicates?.length || 0}`} color="error" variant="outlined" />
                </Grid>
                <Grid item xs="auto">
                  <Chip label={`Skipped (Bank Not Found): ${processResult.skippedBills?.length || 0}`} color="warning" variant="filled" />
                </Grid>
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                Total CSV rows processed: {processResult.totalPaidCount || 0}
              </Typography>
            </Box>
          )}

          {processResult?.newPayments?.length > 0 && (
            <Box sx={{ mb: 3, p: 2, border: "1px solid #4caf50", borderRadius: 1, bgcolor: "#f1f8e9" }}>
              <Typography variant="h6" gutterBottom>
                Step 3: Apply New Payments
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Button
                  variant="contained"
                  color="success"
                  disabled={processing || applying}
                  onClick={handleApplyMardaArifPayments}
                  sx={{ minWidth: 150 }}
                  startIcon={processing || applying ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {applying
                    ? `Applying... ${applyProcessed}/${applyTotal} (${applyProgress}%)`
                    : `Apply ${processResult.newPayments.length} Payments`}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  This will update the bills to mark them as paid through MardaArif
                </Typography>
              </Box>
              {applying && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={applyProgress} />
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {applyProgress}% ({applyProcessed}/{applyTotal}) Applying payments...
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ mb: 3 }}>
            <Button variant="outlined" color="secondary" onClick={handleReset} disabled={processing}>
              Reset / Start Over
            </Button>
          </Box>

          {processResult?.newPayments?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                New Payments to Apply ({processResult.newPayments.length})
              </Typography>
              <MaterialReactTable table={newPaymentsTable} />
            </Box>
          )}

          {processResult?.alreadyPaid?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Already Paid Bills ({processResult.alreadyPaid.length})
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                These bills are already marked as paid and will not be updated.
              </Alert>
            </Box>
          )}

          {(processResult?.notFound?.length > 0 || processResult?.duplicates?.length > 0) && (
            <Box sx={{ mt: 3 }}>
              {processResult?.notFound?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    Bills Not Found ({processResult.notFound.length}):
                  </Typography>
                  <Typography variant="body2">
                    {processResult.notFound.slice(0, 10).join(", ")}
                    {processResult.notFound.length > 10 && "..."}
                  </Typography>
                </Alert>
              )}

              {processResult?.duplicates?.length > 0 && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">
                    Duplicate Entries ({processResult.duplicates.length}):
                  </Typography>
                  <Typography variant="body2">
                    {processResult.duplicates.slice(0, 10).join(", ")}
                    {processResult.duplicates.length > 10 && "..."}
                  </Typography>
                </Alert>
              )}
            </Box>
          )}

          {/* Skipped Bills Table (bank not found) */}
          {processResult?.skippedBills?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                Skipped Bills - Bank Not Found ({processResult.skippedBills.length})
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                These bills were skipped because the bankname from CSV does not match any bankName in the database. They will NOT be applied.
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

const BankImportMardaArifWithProvider = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BankImportMardaArif />
    </QueryClientProvider>
  );
};

export default BankImportMardaArifWithProvider;
