"use client";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import ProPeriodPicker from "@/app/ui/components/ProPeriodPicker";
import { ETH_MONTHS_AM } from "@/app/helpers/constants";
import { ReadingService } from "@/app/lib/ReadingService";
import { CampanyProfileService } from "@/app/lib/campanyProfileService";
import bankInvoiceCompareService from "@/app/lib/bankInvoiceCompareService";
import {
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCcw,
  UploadCloud,
  FileSpreadsheet,
  Search,
  Filter,
  ExternalLink,
} from "lucide-react";
var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const companyProfileService = new CampanyProfileService();

const BankImportCompare = () => {
  const router = useRouter();

  // Period states
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [currentCycleMonth, setCurrentCycleMonth] = useState("");
  const [currentCycleYear, setCurrentCycleYear] = useState("");

  // Upload and comparison states
  const [selectedFile, setSelectedFile] = useState(null);
  const [comparing, setComparing] = useState(false);
  const [exportingCorrected, setExportingCorrected] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [activeFilter, setActiveFilter] = useState("ALL"); // ALL, INVOICE_DIFF_YES, INVOICE_DIFF_NO, AMOUNT_DIFF, NOT_FOUND
  const fileInputRef = useRef(null);

  // Ethiopian calendar baseline
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  // Company Profile for active cycle
  const { data: companyProfile } = useQuery({
    queryKey: ["bank_compare_companyProfile"],
    queryFn: () => companyProfileService.getCampanyProfile(),
    staleTime: 15 * 60 * 1000,
  });

  // Billing periods list
  const { data: dbPeriods = [] } = useQuery({
    queryKey: ["bank_compare_distinctKifyaWer"],
    queryFn: () => readingService.getDistinctKifyaWerList(),
    staleTime: 15 * 60 * 1000,
  });

  const handlePeriodChange = useCallback((newMonth, newYear) => {
    setSelectedKifyaWerMonth(newMonth);
    setSelectedKifyaWerYear(String(newYear));
  }, []);

  // Initialize period from company profile or system date
  useEffect(() => {
    if (companyProfile && companyProfile.activeReadingDate) {
      try {
        const activeDate = new Date(companyProfile.activeReadingDate);
        if (!isNaN(activeDate.getTime())) {
          const [eYear, eMonth] = ethiopianDate.toEthiopian(
            activeDate.getFullYear(),
            activeDate.getMonth() + 1,
            activeDate.getDate()
          );
          const monthIndex = Math.min(eMonth, 12) - 1;
          const cycleMonth = ETH_MONTHS_AM[monthIndex];
          setCurrentCycleMonth(cycleMonth);
          setCurrentCycleYear(String(eYear));
          setSelectedKifyaWerMonth((prev) => prev || cycleMonth);
          setSelectedKifyaWerYear((prev) => prev || String(eYear));
          return;
        }
      } catch (e) {
        console.error("Error parsing activeReadingDate:", e);
      }
    }

    const monthIndex = Math.min(ethMonth || 1, 12) - 1;
    const cycleMonth = ETH_MONTHS_AM[monthIndex];
    setCurrentCycleMonth(cycleMonth);
    setCurrentCycleYear(String(ethYear));
    setSelectedKifyaWerMonth((prev) => prev || cycleMonth);
    setSelectedKifyaWerYear((prev) => prev || String(ethYear));
  }, [companyProfile, ethYear, ethMonth]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".csv")) {
        toast.error("Please select a valid .csv file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCompare = async () => {
    if (!selectedFile) {
      toast.error("Please choose a CSV file first");
      return;
    }
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error("Please select a billing period (month and year)");
      return;
    }

    try {
      setComparing(true);
      const kifyaWer = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      const res = await bankInvoiceCompareService.compareCsv(selectedFile, kifyaWer);
      setCompareResult(res);
      setActiveFilter("ALL");

      if (res?.invoiceMismatchCount > 0) {
        toast.warning(
          `Comparison complete: Found ${res.invoiceMismatchCount} invoice number discrepancies!`,
          { autoClose: 6000 }
        );
      } else {
        toast.success(
          `Processed ${res?.totalCsvRows || 0} rows. All invoice numbers match!`,
          { autoClose: 4000 }
        );
      }
    } catch (err) {
      console.error("Comparison error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to compare CSV file"
      );
    } finally {
      setComparing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCompareResult(null);
    setActiveFilter("ALL");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Filtered rows based on quick filter selection
  const filteredRows = useMemo(() => {
    if (!compareResult?.rows) return [];
    switch (activeFilter) {
      case "INVOICE_DIFF_YES":
        return compareResult.rows.filter((r) => r.invoiceDifference === "Yes");
      case "INVOICE_DIFF_NO":
        return compareResult.rows.filter((r) => r.invoiceDifference === "No");
      case "AMOUNT_DIFF":
        return compareResult.rows.filter((r) => r.amountMismatch === true);
      case "NOT_FOUND":
        return compareResult.rows.filter(
          (r) =>
            r.matchStatus === "READING_NOT_FOUND_FOR_MONTH" ||
            r.matchStatus === "CUSTOMER_NOT_FOUND" ||
            r.isVoid
        );
      default:
        return compareResult.rows;
    }
  }, [compareResult, activeFilter]);

  // Export comparison table to CSV
  const handleExportCsv = () => {
    if (!filteredRows || filteredRows.length === 0) {
      toast.info("No data available to export");
      return;
    }

    const headers = [
      "Row #",
      "Account Number",
      "Customer Name",
      "System Invoice #",
      "CSV Invoice #",
      "Invoice Diff (Yes/No)",
      "System Amount Due (ETB)",
      "CSV Amount Due (ETB)",
      "Amount Diff (ETB)",
      "Status",
      "Status Details",
      "Payment Date",
      "Agent/Bank ID",
      "Confirmation Code",
    ];

    const csvLines = [
      headers.join(","),
      ...filteredRows.map((r) =>
        [
          r.rowIndex ?? "",
          `"${r.accountNumber || ""}"`,
          `"${(r.customerName || "").replace(/"/g, '""')}"`,
          `"${r.systemInvoiceNumber || ""}"`,
          `"${r.csvInvoiceNumber || ""}"`,
          `"${r.invoiceDifference || ""}"`,
          r.tekilalaTekefay ?? 0,
          r.csvAmountDue ?? 0,
          r.amountDifference ?? 0,
          `"${r.matchStatus || ""}"`,
          `"${(r.statusMessage || "").replace(/"/g, '""')}"`,
          `"${r.paidDate || ""}"`,
          `"${r.agentId || ""}"`,
          `"${r.confirmationCode || ""}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob(["\uFEFF" + csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bank_invoice_compare_${selectedKifyaWerMonth}_${selectedKifyaWerYear}_${activeFilter}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Comparison table exported successfully");
  };

  // Export corrected CSV file with only bill_id updated from system
  const handleExportCorrectedCsv = async () => {
    if (!selectedFile) {
      toast.error("Please choose a CSV file first");
      return;
    }
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error("Please select a billing period (month and year)");
      return;
    }

    try {
      setExportingCorrected(true);
      const kifyaWer = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      const res = await bankInvoiceCompareService.exportCorrectedCsv(selectedFile, kifyaWer);
      toast.success(
        `Corrected CSV downloaded as "${res.filename}"! Only bill_id was updated to match system database invoice numbers.`,
        { autoClose: 7000 }
      );
    } catch (err) {
      console.error("Export corrected CSV error:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to export corrected CSV"
      );
    } finally {
      setExportingCorrected(false);
    }
  };

  // Columns for the comparison table
  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "rowIndex",
        size: 60,
      },
      {
        accessorKey: "accountNumber",
        header: "Account Number",
        size: 140,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, fontFamily: "monospace" }}
          >
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        size: 220,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
      {
        accessorKey: "systemInvoiceNumber",
        header: "System Invoice #",
        size: 160,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              label={val || "N/A"}
              size="small"
              variant={val && val !== "N/A" ? "outlined" : "filled"}
              color={val && val !== "N/A" ? "primary" : "default"}
              sx={{ fontFamily: "monospace", fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: "csvInvoiceNumber",
        header: "CSV Invoice #",
        size: 160,
        Cell: ({ cell }) => {
          const val = cell.getValue();
          return (
            <Chip
              label={val || "Missing"}
              size="small"
              variant="outlined"
              color="default"
              sx={{ fontFamily: "monospace", fontWeight: 600 }}
            />
          );
        },
      },
      {
        accessorKey: "invoiceDifference",
        header: "Invoice Diff?",
        size: 130,
        Cell: ({ cell, row }) => {
          const val = cell.getValue();
          const isDiff = val === "Yes";
          return (
            <Chip
              label={isDiff ? "Yes (Mismatch)" : "No (Match)"}
              size="small"
              color={isDiff ? "error" : "success"}
              variant="filled"
              sx={{
                fontWeight: 700,
                letterSpacing: 0.5,
              }}
            />
          );
        },
      },
      {
        accessorKey: "tekilalaTekefay",
        header: "System Amount Due",
        size: 150,
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() ?? 0);
          return (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {val.toFixed(2)} ETB
            </Typography>
          );
        },
      },
      {
        accessorKey: "csvAmountDue",
        header: "CSV Amount Due",
        size: 150,
        Cell: ({ cell }) => {
          const val = Number(cell.getValue() ?? 0);
          return (
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {val.toFixed(2)} ETB
            </Typography>
          );
        },
      },
      {
        accessorKey: "amountDifference",
        header: "Amount Diff",
        size: 140,
        Cell: ({ cell }) => {
          const diff = Number(cell.getValue() ?? 0);
          const hasDiff = Math.abs(diff) > 0.01;
          const sign = diff > 0 ? "+" : "";
          return (
            <Chip
              label={`${sign}${diff.toFixed(2)} ETB`}
              size="small"
              color={hasDiff ? "warning" : "default"}
              variant={hasDiff ? "filled" : "outlined"}
              sx={{
                fontWeight: hasDiff ? 700 : 500,
              }}
            />
          );
        },
      },
      {
        accessorKey: "matchStatus",
        header: "Status",
        size: 170,
        Cell: ({ cell, row }) => {
          const status = cell.getValue();
          const msg = row.original?.statusMessage || status;
          let color = "default";
          let label = status;

          switch (status) {
            case "MATCHED":
              color = "success";
              label = "Matched";
              break;
            case "INVOICE_MISMATCH":
              color = "error";
              label = "Invoice Mismatch";
              break;
            case "AMOUNT_MISMATCH":
              color = "warning";
              label = "Amount Mismatch";
              break;
            case "BOTH_MISMATCH":
              color = "error";
              label = "Both Mismatched";
              break;
            case "READING_NOT_FOUND_FOR_MONTH":
              color = "warning";
              label = "No Reading in Month";
              break;
            case "CUSTOMER_NOT_FOUND":
              color = "default";
              label = "Customer Not Found";
              break;
            case "VOID_BILL":
              color = "secondary";
              label = "Void Bill";
              break;
            default:
              label = status || "Unknown";
          }

          return (
            <Tooltip title={msg} arrow>
              <Chip
                label={label}
                size="small"
                color={color}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "paidDate",
        header: "Payment Date",
        size: 130,
        Cell: ({ cell }) => cell.getValue() || "—",
      },
      {
        accessorKey: "confirmationCode",
        header: "Confirmation Code",
        size: 170,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
            {cell.getValue() || "—"}
          </Typography>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredRows,
    enableRowSelection: false,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    muiTableContainerProps: {
      sx: {
        minHeight: "400px",
        maxHeight: "650px",
      },
    },
    initialState: {
      pagination: {
        pageSize: 15,
      },
      density: "compact",
    },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb pageName="Bank Import Invoice & Amount Verification" />
      </Grid>

      {/* Control Card */}
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <FileCheck size={28} color="#1976d2" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Bank Import CSV Comparison & Audit
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload a bank payment CSV file to compare customer accounts, invoice numbers,
            and total amounts due against the system database for the selected billing month.
            Detect manipulated or altered invoice numbers before processing payments.
          </Typography>

          <Grid container spacing={2} alignItems="center">
            {/* Period Picker */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Step 1: Select Billing Month
                </Typography>
                <ProPeriodPicker
                  selectedMonth={selectedKifyaWerMonth}
                  selectedYear={selectedKifyaWerYear}
                  onPeriodChange={handlePeriodChange}
                  currentCycleMonth={currentCycleMonth}
                  currentCycleYear={currentCycleYear}
                  dbPeriods={dbPeriods}
                  disabled={comparing}
                />
              </Box>
            </Grid>

            {/* CSV File Input & Actions */}
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 1.5, border: "1px solid #e2e8f0" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Step 2: Choose CSV File
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={comparing}
                    style={{ fontSize: "0.9rem" }}
                  />
                  {selectedFile && (
                    <Typography variant="caption" color="text.secondary">
                      Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1 }} flexWrap="wrap">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCompare}
                      disabled={comparing || exportingCorrected || !selectedFile || !selectedKifyaWerMonth || !selectedKifyaWerYear}
                      startIcon={comparing ? <CircularProgress size={18} color="inherit" /> : <UploadCloud size={18} />}
                      sx={{ px: 3, fontWeight: 600 }}
                    >
                      {comparing ? "Comparing..." : "Compare CSV"}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleExportCorrectedCsv}
                      disabled={comparing || exportingCorrected || !selectedFile || !selectedKifyaWerMonth || !selectedKifyaWerYear}
                      startIcon={exportingCorrected ? <CircularProgress size={18} color="inherit" /> : <FileSpreadsheet size={18} />}
                      sx={{ px: 2.5, fontWeight: 700, bgcolor: "#15803d", "&:hover": { bgcolor: "#166534" } }}
                    >
                      {exportingCorrected ? "Exporting..." : "Export Corrected CSV"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleReset}
                      disabled={comparing || exportingCorrected || (!selectedFile && !compareResult)}
                      startIcon={<RotateCcw size={16} />}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* KPI Summary Cards */}
      {compareResult && (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Total CSV Rows */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                    Total CSV Rows
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#1e293b" }}>
                    {compareResult.totalCsvRows}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total: {Number(compareResult.totalCsvAmount || 0).toFixed(2)} ETB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Invoices Matched */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: "#166534", fontWeight: 600, textTransform: "uppercase" }}>
                    Invoices Matched (No Diff)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#15803d" }}>
                    {(compareResult.totalCsvRows || 0) - (compareResult.invoiceMismatchCount || 0)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#166534" }}>
                    Exact invoice match in DB
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Invoices Mismatched (Alert!) */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card
                sx={{
                  bgcolor: (compareResult.invoiceMismatchCount || 0) > 0 ? "#fef2f2" : "#f8f9fa",
                  border: (compareResult.invoiceMismatchCount || 0) > 0 ? "1px solid #fecaca" : "1px solid #e2e8f0",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>
                    Invoice Diff: YES (Mismatch)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#dc2626" }}>
                    {compareResult.invoiceMismatchCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#991b1b" }}>
                    {(compareResult.invoiceMismatchCount || 0) > 0 ? "⚠️ Manipulated / Discrepancy" : "None detected"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Amount Discrepancies */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card
                sx={{
                  bgcolor: (compareResult.amountMismatchCount || 0) > 0 ? "#fffbeb" : "#f8f9fa",
                  border: (compareResult.amountMismatchCount || 0) > 0 ? "1px solid #fef3c7" : "1px solid #e2e8f0",
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="caption" sx={{ color: "#92400e", fontWeight: 600, textTransform: "uppercase" }}>
                    Amount Discrepancies
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#d97706" }}>
                    {compareResult.amountMismatchCount}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#92400e" }}>
                    CSV amount != System due
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Not Found / Missing in Month */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: "#f8f9fa", border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase" }}>
                    Not Found / Void
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: "#475569" }}>
                    {(compareResult.notFoundCount || 0) + (compareResult.voidCount || 0)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Not found: {compareResult.notFoundCount} | Void: {compareResult.voidCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Discrepancy Warning Alert if Invoice Mismatches Detected */}
      {compareResult && compareResult.invoiceMismatchCount > 0 && (
        <Grid item xs={12}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Attention: {compareResult.invoiceMismatchCount} rows have different invoice numbers between the CSV and the system!
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              The customer account number was matched in the system database, but the CSV <code>bill_id</code> does not match the database invoice number.
              You can export the corrected CSV below (replacing only <code>bill_id</code>) and import it directly into Bank Import Derash.
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={exportingCorrected ? <CircularProgress size={14} color="inherit" /> : <FileSpreadsheet size={16} />}
                onClick={handleExportCorrectedCsv}
                disabled={exportingCorrected}
                sx={{ fontWeight: 700, bgcolor: "#15803d", "&:hover": { bgcolor: "#166534" } }}
              >
                {exportingCorrected ? "Exporting..." : `Export Corrected CSV (${compareResult.invoiceMismatchCount} Corrected)`}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={() => router.push("/ui/manager/BankImportDerash")}
                endIcon={<ExternalLink size={14} />}
                sx={{ fontWeight: 600 }}
              >
                Go to Bank Import Derash
              </Button>
            </Stack>
          </Alert>
        </Grid>
      )}

      {/* Comparison Table Section */}
      {compareResult && (
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2 }}>
            {/* Filter Chips & Export Bar */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 2.5,
                pb: 2,
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {/* Quick Filters */}
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mr: 1, color: "text.secondary" }}>
                  <Filter size={16} style={{ verticalAlign: "middle", marginRight: 4 }} />
                  Filter Rows:
                </Typography>
                <Chip
                  label={`All Records (${compareResult.totalCsvRows})`}
                  clickable
                  color={activeFilter === "ALL" ? "primary" : "default"}
                  variant={activeFilter === "ALL" ? "filled" : "outlined"}
                  onClick={() => setActiveFilter("ALL")}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Invoice Mismatch: YES (${compareResult.invoiceMismatchCount})`}
                  clickable
                  color={activeFilter === "INVOICE_DIFF_YES" ? "error" : "default"}
                  variant={activeFilter === "INVOICE_DIFF_YES" ? "filled" : "outlined"}
                  onClick={() => setActiveFilter("INVOICE_DIFF_YES")}
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`Invoice Match: NO (${(compareResult.totalCsvRows || 0) - (compareResult.invoiceMismatchCount || 0)})`}
                  clickable
                  color={activeFilter === "INVOICE_DIFF_NO" ? "success" : "default"}
                  variant={activeFilter === "INVOICE_DIFF_NO" ? "filled" : "outlined"}
                  onClick={() => setActiveFilter("INVOICE_DIFF_NO")}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Amount Discrepancy (${compareResult.amountMismatchCount})`}
                  clickable
                  color={activeFilter === "AMOUNT_DIFF" ? "warning" : "default"}
                  variant={activeFilter === "AMOUNT_DIFF" ? "filled" : "outlined"}
                  onClick={() => setActiveFilter("AMOUNT_DIFF")}
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={`Not Found / Void (${(compareResult.notFoundCount || 0) + (compareResult.voidCount || 0)})`}
                  clickable
                  color={activeFilter === "NOT_FOUND" ? "secondary" : "default"}
                  variant={activeFilter === "NOT_FOUND" ? "filled" : "outlined"}
                  onClick={() => setActiveFilter("NOT_FOUND")}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Export Buttons */}
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  color="success"
                  startIcon={exportingCorrected ? <CircularProgress size={16} color="inherit" /> : <FileSpreadsheet size={18} />}
                  onClick={handleExportCorrectedCsv}
                  disabled={exportingCorrected || !selectedFile}
                  sx={{ fontWeight: 700, bgcolor: "#15803d", "&:hover": { bgcolor: "#166534" } }}
                >
                  {exportingCorrected
                    ? "Exporting..."
                    : compareResult?.invoiceMismatchCount > 0
                    ? `Export Corrected CSV (${compareResult.invoiceMismatchCount} Corrected)`
                    : "Export Corrected CSV"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Download size={18} />}
                  onClick={handleExportCsv}
                  sx={{ fontWeight: 600 }}
                >
                  Export Audit Table ({filteredRows.length})
                </Button>
              </Stack>
            </Box>

            {/* Table */}
            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      )}

      <ToastContainer position="top-right" />
    </Grid>
  );
};

// Wrap with React Query Provider
const BankImportCompareWithProvider = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BankImportCompare />
    </QueryClientProvider>
  );
};

export default BankImportCompareWithProvider;
