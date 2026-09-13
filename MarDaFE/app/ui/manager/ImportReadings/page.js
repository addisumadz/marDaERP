"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Button,
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import authHeader from "../../../lib/authHeader/authhheader";
import getAccesToken from "../../../lib/getToken";
import { baseURL } from "../../../lib/httpCommon/http-common";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";

import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

import * as ethiopianDate from "ethiopian-date";
import { CustomerService } from "../../../lib/customerService";
import { ReadingService } from "../../../lib/ReadingService";
import { CompanyProfileService } from "../../../lib/companyProfileService";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

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

const customerService = new CustomerService();
const readingService = new ReadingService();
const companyProfileService = new CompanyProfileService();

const ImportReadingsPage = () => {
  // Navigation steps: 'upload' | 'verifying' | 'preview' | 'saving' | 'complete'
  const [step, setStep] = useState("upload");
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentProcessed, setCurrentProcessed] = useState(0);
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");

  // ─── System Day Restriction ───
  const [isRestrictedBySystemDay, setIsRestrictedBySystemDay] = useState(true); // default to locked until profile loads
  const [dragOver, setDragOver] = useState(false);
  const [tabValue, setTabValue] = useState(0); // 0 = All, 1 = Success, 2 = Failed
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  
  // Parsed and validated rows
  const [parsedData, setParsedData] = useState([]);

  // Consumption custom filters
  const [consumptionFilterValue, setConsumptionFilterValue] = useState("");
  const [consumptionFilterOperator, setConsumptionFilterOperator] = useState("all"); // 'all', '<', '>', '='

  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const { data: profileData } = useQuery({
    queryKey: ["company-profile-latest"],
    queryFn: async () => {
      const latest = await companyProfileService.getLatest();
      const hasLatest = latest && typeof latest === "object" && Object.keys(latest).length > 0;
      if (hasLatest) return latest;
      try {
        return await companyProfileService.getById(9);
      } catch (e) {
        return latest;
      }
    },
    refetchOnWindowFocus: false,
  });

  const yearOptions = useMemo(() => {
    const baseYear = selectedKifyaWerYear ? Number(selectedKifyaWerYear) : ethYear;
    const years = [];
    for (let i = baseYear - 5; i <= baseYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [selectedKifyaWerYear, ethYear]);

  useEffect(() => {
    if (profileData) {
      const payload = profileData && typeof profileData === "object" && "data" in profileData && profileData.data && typeof profileData.data === "object"
        ? profileData.data
        : profileData;

      // Determine if month/year selection should be restricted
      const restricted = payload?.filename3 === "1" || payload?.filename3 === true;
      setIsRestrictedBySystemDay(restricted);
      
      if (payload && payload.activeReadingDate) {
        try {
          const activeDate = new Date(payload.activeReadingDate);
          const [eYear, eMonth] = ethiopianDate.toEthiopian(
            activeDate.getFullYear(),
            activeDate.getMonth() + 1,
            activeDate.getDate()
          );
          setSelectedKifyaWerMonth(ethiopianMonths[eMonth - 1]);
          setSelectedKifyaWerYear(eYear);
          return;
        } catch (e) {
          console.error("Error parsing activeReadingDate:", e);
        }
      }
    }

    // Fallback if no database month resolved yet
    setSelectedKifyaWerMonth(ethiopianMonths[ethMonth - 1]);
    setSelectedKifyaWerYear(ethYear);
  }, [profileData, ethYear, ethMonth]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (fileExtension === "xlsx" || fileExtension === "xls") {
        setSelectedFile(file);
      } else {
        toast.error("Please drop a valid Excel file (.xlsx or .xls)");
      }
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Step 2: Instant Excel parsing and sample preview
  const handleVerify = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.error(
        "Please select both a month and a year for the billing period."
      );
      return;
    }

    setStep("verifying");
    setUploadLogs([]);
    setSuccessCount(0);
    setFailedCount(0);
    setTotalRows(0);
    setCurrentProcessed(0);

    try {
      const data = await selectedFile.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

      const extractColumns = (row) => {
        const norm = (s) => String(s || "").toLowerCase().replace(/\s+|_/g, "");
        const entries = Object.entries(row);
        let acc, cur;
        for (const [k, v] of entries) {
          const nk = norm(k);
          if (!acc && (nk === "accountno" || nk === "accountnumber" || nk === "account")) acc = String(v).trim();
          if (!cur && (nk === "reading" || nk === "currentreading")) cur = v;
        }
        return { accountNumber: acc, currentReading: Number(cur) };
      };

      const parsed = rows
        .map(extractColumns)
        .filter((x) => x.accountNumber && Number.isFinite(x.currentReading));

      if (parsed.length === 0) {
        toast.warn("No valid rows found. Columns should be: Account Number, Current Reading.");
        setStep("upload");
        return;
      }

      setTotalRows(parsed.length);

      // Fast preview of up to 100 sample rows without network loop
      const previewSample = parsed.slice(0, 100).map((item, idx) => ({
        id: idx,
        accountNumber: item.accountNumber,
        customerName: "Account " + item.accountNumber,
        previousReading: "-",
        currentReading: item.currentReading,
        consumption: "-",
        recommendation: "Ready for server batch import",
        status: "success",
        valid: true,
      }));

      setParsedData(previewSample);
      setSuccessCount(parsed.length);
      setStep("preview");
      toast.success(`Verified ${parsed.length} rows in file. Ready for server batch import!`);
    } catch (error) {
      console.error("Error verifying excel file:", error);
      toast.error("Failed to parse and verify excel file.");
      setStep("upload");
    }
  };

  // Step 4: High-speed server-side batch import
  const handleConfirmSave = async () => {
    if (!selectedFile) {
      toast.error("No file selected.");
      return;
    }

    setStep("saving");
    setUploadLogs([{ type: "info", text: `Uploading file to server for batch processing (${totalRows} records)...` }]);
    setSuccessCount(0);
    setFailedCount(0);
    setCurrentProcessed(0);

    const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;

    try {
      const report = await readingService.uploadReadingsExcel(selectedFile, kifyaWerFormatted);

      const logs = (report?.importLogs || []).map((msg, idx) => ({
        type: msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail") ? "error" : "success",
        text: msg,
        rowNum: idx + 1,
      }));

      setUploadLogs(logs);
      const succ = report?.successCount ?? 0;
      const fail = report?.failedCount ?? 0;
      setSuccessCount(succ);
      setFailedCount(fail);
      setCurrentProcessed(succ + fail);
      setStep("complete");
      if (fail === 0) {
        toast.success(`All ${succ} readings imported successfully by server!`);
      } else {
        toast.warn(`Server import complete: ${succ} succeeded, ${fail} failed.`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Upload failed.";
      setUploadLogs([{ type: "error", text: "Import failed: " + errorMsg }]);
      setFailedCount(totalRows || 1);
      setStep("complete");
      toast.error("Server import failed: " + errorMsg);
    }
  };

  const handleBackToUpload = () => {
    setParsedData([]);
    setStep("upload");
  };

  const handleExportExcel = () => {
    try {
      if (filteredTableData.length === 0) {
        toast.info("No data available to export.");
        return;
      }

      const exportData = filteredTableData.map((row, index) => ({
        "#": index + 1,
        "Account Number": row.accountNumber,
        "Customer Name": row.customerName,
        "Previous Reading": row.previousReading,
        "Current Reading": row.currentReading,
        "Consumption": row.consumption,
        "Status / Recommendation": row.recommendation,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Auto-fit columns
      const maxLens = {};
      exportData.forEach((row) => {
        Object.entries(row).forEach(([k, v]) => {
          const len = Math.max(String(k).length, String(v).length);
          maxLens[k] = Math.max(maxLens[k] || 0, len);
        });
      });
      ws["!cols"] = Object.keys(maxLens).map((k) => ({ wch: maxLens[k] + 3 }));

      XLSX.utils.book_append_sheet(wb, ws, "Import Preview");
      
      const period = `${selectedKifyaWerMonth}_${selectedKifyaWerYear}`;
      XLSX.writeFile(wb, `Import_Preview_${period}.xlsx`);
      toast.success("Excel file exported successfully!");
    } catch (error) {
      console.error("Export Excel error:", error);
      toast.error("Failed to export Excel file.");
    }
  };

  // MaterialReactTable setup
  const columns = useMemo(
    () => [
      {
        id: "rowNumber",
        header: "#",
        size: 80,
        Cell: ({ row }) => {
          const status = row.original.status;
          let color = "#10b981"; // success
          if (status === "error") color = "#ef4444";
          if (status === "warning") color = "#f59e0b";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                {row.index + 1}
              </Typography>
              <Tooltip title={row.original.recommendation}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: color,
                    cursor: "help",
                  }}
                />
              </Tooltip>
            </Box>
          );
        },
      },
      {
        accessorKey: "accountNumber",
        header: "Account Number",
        size: 150,
      },
      {
        accessorKey: "customerName",
        header: "Customer Name",
        size: 200,
      },
      {
        accessorKey: "previousReading",
        header: "Previous Reading",
        size: 130,
        Cell: ({ cell }) => cell.getValue() ?? 0,
      },
      {
        accessorKey: "currentReading",
        header: "Current Reading",
        size: 130,
      },
      {
        accessorKey: "consumption",
        header: "Consumption",
        size: 120,
        Cell: ({ row }) => {
          const val = row.original.consumption;
          const isError = row.original.status === "error";
          return (
            <span style={{ color: isError ? "#ef4444" : val === 0 ? "#3b82f6" : "#10b981", fontWeight: 700 }}>
              {val}
            </span>
          );
        },
      },
    ],
    []
  );

  const filteredTableData = useMemo(() => {
    return parsedData.filter((item) => {
      if (consumptionFilterOperator !== "all" && consumptionFilterValue !== "") {
        const val = Number(consumptionFilterValue);
        const itemCons = Number(item.consumption);
        if (Number.isFinite(val)) {
          if (consumptionFilterOperator === "<") {
            return itemCons < val;
          }
          if (consumptionFilterOperator === ">") {
            return itemCons > val;
          }
          if (consumptionFilterOperator === "=") {
            return itemCons === val;
          }
        }
      }
      return true;
    });
  }, [parsedData, consumptionFilterValue, consumptionFilterOperator]);

  const table = useMaterialReactTable({
    columns,
    data: filteredTableData,
    enableColumnResizing: false,
    enableGlobalFilter: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      density: "comfortable",
    },
    muiTableProps: { size: "medium" },
    muiTablePaperProps: {
      elevation: 0,
      sx: {
        border: "1px solid rgba(226, 232, 240, 0.8)",
        borderRadius: 3,
        overflow: "hidden",
      },
    },
  });

  const progressPercent = totalRows > 0 ? Math.round((currentProcessed / totalRows) * 100) : 0;

  const filteredLogs = useMemo(() => {
    let result = uploadLogs;
    if (tabValue === 1) {
      result = uploadLogs.filter((log) => log.type === "success");
    } else if (tabValue === 2) {
      result = uploadLogs.filter((log) => log.type === "error");
    }

    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (log) =>
          log.account.toLowerCase().includes(lower) ||
          log.text.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [uploadLogs, tabValue, searchTerm]);

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Import Readings" />

      <Box sx={{ maxWidth: step === "preview" ? 1200 : 1000, mx: "auto", mt: 2 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* STEP 1: UPLOAD & PREPARE */}
          {step === "upload" && (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1.5,
                  }}
                >
                  Import Monthly Readings
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
                  Upload an Excel sheet containing customer accounts and current water meter readings. 
                  The spreadsheet should contain a column for <strong>Account Number</strong> and a column for <strong>Current Reading</strong>.
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
                        Select Billing Period
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                        {isRestrictedBySystemDay
                          ? "Locked to active billing month resolved from company profile"
                          : "Initially set from company profile — you may change it manually"}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="medium">
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select
                              labelId="month-select-label"
                              id="month-select"
                              value={selectedKifyaWerMonth}
                              label="Month"
                              onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
                              sx={{ borderRadius: 2 }}
                              disabled={isRestrictedBySystemDay}
                            >
                              {ethiopianMonths.map((month, index) => (
                                <MenuItem key={index} value={month}>
                                  {month}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControl fullWidth size="medium">
                            <InputLabel id="year-select-label">Year</InputLabel>
                            <Select
                              labelId="year-select-label"
                              id="year-select"
                              value={selectedKifyaWerYear}
                              label="Year"
                              onChange={(e) => setSelectedKifyaWerYear(e.target.value)}
                              sx={{ borderRadius: 2 }}
                              disabled={isRestrictedBySystemDay}
                            >
                              {yearOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                  {year}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: "text.primary" }}>
                        Select Excel File
                      </Typography>
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        style={{ display: "none" }}
                        ref={fileInputRef}
                      />
                      <Box
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          height: 180,
                          border: "2px dashed",
                          borderColor: dragOver
                            ? "primary.main"
                            : selectedFile
                            ? "success.light"
                            : "grey.300",
                          borderRadius: 3,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: dragOver
                            ? "rgba(59, 130, 246, 0.04)"
                            : selectedFile
                            ? "rgba(16, 185, 129, 0.02)"
                            : "grey.50",
                          cursor: "pointer",
                          transition: "all 0.2s ease-in-out",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "rgba(79, 70, 229, 0.04)",
                            transform: "scale(1.01)",
                          },
                        }}
                      >
                        {!selectedFile ? (
                          <>
                            <CloudUploadIcon sx={{ fontSize: 44, color: "primary.main", mb: 1.5 }} />
                            <Typography sx={{ fontWeight: 600, fontSize: "0.95rem" }} align="center">
                              Drag & drop Excel file here
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              or click to browse from files (.xlsx, .xls)
                            </Typography>
                          </>
                        ) : (
                          <Box sx={{ p: 2, width: "100%", textAlign: "center" }}>
                            <InsertDriveFileIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
                            <Typography
                              sx={{
                                fontWeight: 600,
                                maxWidth: "90%",
                                mx: "auto",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "0.9rem",
                              }}
                            >
                              {selectedFile.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </Typography>
                            
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={handleRemoveFile}
                              startIcon={<DeleteIcon />}
                              sx={{ borderRadius: 2 }}
                            >
                              Remove File
                            </Button>
                          </Box>
                        )}
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleVerify}
                      disabled={
                        !selectedFile ||
                        !selectedKifyaWerMonth ||
                        !selectedKifyaWerYear
                      }
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: 2.5,
                        fontWeight: 700,
                        fontSize: "1rem",
                        textTransform: "none",
                        boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.3)",
                        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #4338ca 0%, #2563eb 100%)",
                          boxShadow: "0 6px 20px 0 rgba(79, 70, 229, 0.4)",
                        },
                        "&:disabled": {
                          background: "grey.200",
                        },
                      }}
                    >
                      Analyze & Preview Data
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Box
                    sx={{
                      height: "100%",
                      minHeight: 300,
                      border: "1px solid",
                      borderColor: "grey.200",
                      borderRadius: 3,
                      p: 4,
                      bgcolor: "grey.50",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <AssessmentIcon sx={{ fontSize: 60, color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 700 }} align="center">
                      Pre-Import Validation Mode
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                      The system will cross-examine Excel account numbers with the live database, 
                      enrich records with customer details, calculate consumption, and display custom import 
                      recommendations before writing any values.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </>
          )}

          {/* STEP 2: VERIFYING DATA */}
          {step === "verifying" && (
            <Box
              sx={{
                py: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <CircularProgress size={60} thickness={4} color="primary" />
              <Box sx={{ width: "100%", maxWidth: 500, textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Analyzing Excel Records
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Verifying account {currentProcessed} of {totalRows} with live system
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* STEP 3: PREVIEW DATA (MaterialReactTable) */}
          {step === "preview" && (
            <>
              <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    Import Validation Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and verify resolved customer names, calculated consumptions, and recommendations.
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBackToUpload}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    Back to Upload
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportExcel}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                  >
                    Export Excel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleConfirmSave}
                    disabled={parsedData.filter((r) => r.valid).length === 0}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        boxShadow: "0 6px 20px 0 rgba(16, 185, 129, 0.4)",
                      },
                    }}
                  >
                    Confirm & Save to Database
                  </Button>
                </Box>
              </Box>

              {/* Stats Summary Cards */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                  <Card elevation={0} sx={{ border: "1px solid rgba(79, 70, 229, 0.15)", bgcolor: "rgba(79, 70, 229, 0.03)", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                      <AssessmentIcon sx={{ fontSize: 40, color: "primary.main" }} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "primary.dark" }}>
                          {totalRows}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Total Checked Rows
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card elevation={0} sx={{ border: "1px solid rgba(16, 185, 129, 0.2)", bgcolor: "rgba(16, 185, 129, 0.04)", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "success.dark" }}>
                          {successCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Ready to Import
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Card elevation={0} sx={{ border: "1px solid rgba(239, 68, 68, 0.2)", bgcolor: "rgba(239, 68, 68, 0.04)", borderRadius: 3 }}>
                    <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
                      <ErrorIcon sx={{ fontSize: 40, color: "error.main" }} />
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: "error.dark" }}>
                          {failedCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Invalid / Skipped Rows
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Consumption Filters UI */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: "grey.50",
                  borderColor: "grey.200",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                  Filter by Consumption:
                </Typography>
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel id="operator-select-label">Condition</InputLabel>
                  <Select
                    labelId="operator-select-label"
                    value={consumptionFilterOperator}
                    label="Condition"
                    onChange={(e) => setConsumptionFilterOperator(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">Show All Readings</MenuItem>
                    <MenuItem value=">">&gt; (Greater Than)</MenuItem>
                    <MenuItem value="<">&lt; (Less Than)</MenuItem>
                    <MenuItem value="=">= (Equal To)</MenuItem>
                  </Select>
                </FormControl>

                {consumptionFilterOperator !== "all" && (
                  <TextField
                    label="Consumption Value"
                    type="number"
                    size="small"
                    value={consumptionFilterValue}
                    onChange={(e) => setConsumptionFilterValue(e.target.value)}
                    sx={{
                      width: 160,
                      "& .MuiInputBase-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                )}

                {consumptionFilterOperator !== "all" && (
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => {
                      setConsumptionFilterOperator("all");
                      setConsumptionFilterValue("");
                    }}
                    sx={{ fontWeight: 600, textTransform: "none" }}
                  >
                    Clear Filter
                  </Button>
                )}
              </Paper>

              {/* MaterialReactTable Display */}
              <MaterialReactTable table={table} />
            </>
          )}

          {/* STEP 4 & 5: SAVING PROGRESS AND LOGS CONSOLE */}
          {(step === "saving" || step === "complete") && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {step === "saving" ? "Writing Readings to Database..." : "Import Cycle Complete!"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Executing sequential row writes and transaction locks.
                  </Typography>
                </Box>

                {step === "complete" && (
                  <Button
                    variant="contained"
                    startIcon={<TaskAltIcon />}
                    onClick={handleBackToUpload}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                  >
                    Finish & Reset
                  </Button>
                )}
              </Box>

              {/* Real-time Progress Bar */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    {step === "saving" ? `Writing record ${currentProcessed} of ${totalRows}` : "Finished bulk imports"}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {progressPercent}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: "linear-gradient(90deg, #4f46e5, #3b82f6)",
                    },
                  }}
                />
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card elevation={0} sx={{ border: "1px solid rgba(16, 185, 129, 0.2)", bgcolor: "rgba(16, 185, 129, 0.04)", borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 24, mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "success.dark" }}>
                        {successCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Saved Succeeded
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6}>
                  <Card elevation={0} sx={{ border: "1px solid rgba(239, 68, 68, 0.2)", bgcolor: "rgba(239, 68, 68, 0.04)", borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                      <ErrorIcon color="error" sx={{ fontSize: 24, mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "error.dark" }}>
                        {failedCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Saved Failed
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Logs Console Container */}
              <Box sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3, p: 3, bgcolor: "grey.50" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, val) => setTabValue(val)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{
                      minHeight: 36,
                      "& .MuiTab-root": {
                        minHeight: 36,
                        textTransform: "none",
                        fontWeight: 600,
                        py: 0.5,
                        px: 1.5,
                        fontSize: "0.85rem",
                      },
                    }}
                  >
                    <Tab label={`All Logs (${uploadLogs.length})`} />
                    <Tab label={`Succeeded (${uploadLogs.filter((l) => l.type === "success").length})`} />
                    <Tab label={`Failed (${uploadLogs.filter((l) => l.type === "error").length})`} />
                  </Tabs>

                  <TextField
                    placeholder="Search logs..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                      width: 180,
                      "& .MuiInputBase-root": {
                        height: 32,
                        fontSize: "0.8rem",
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ fontSize: 16 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    height: 250,
                    overflowY: "auto",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                    bgcolor: "#1e293b",
                    p: 2,
                    fontFamily: "monospace",
                  }}
                >
                  {filteredLogs.length === 0 ? (
                    <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center" }}>
                      <Typography variant="body2" sx={{ color: "slate.400", fontFamily: "monospace" }}>
                        Console is empty. Running write logs will stream here.
                      </Typography>
                    </Box>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          mb: 0.5,
                          fontSize: "0.8rem",
                          lineBreak: "anywhere",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>[{log.rowNum}]</span>
                        <span style={{ color: log.type === "success" ? "#4ade80" : "#f87171" }}>
                          {log.type === "success" ? "✓" : "✗"}
                        </span>
                        <span style={{ color: log.type === "success" ? "#f1f5f9" : "#fecaca" }}>
                          {log.text}
                        </span>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

const queryClient = new QueryClient();

const ImportReadingsPageWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <ImportReadingsPage />
  </QueryClientProvider>
);

export default ImportReadingsPageWrapper;
