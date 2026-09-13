"use client";
import { useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import bankPaymentFileService from "@/app/lib/bankPaymentFileService";
import { Download, RefreshCw, FileText, Calendar, HardDrive, Clock } from "lucide-react";

// Format file size
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Parse standard filenames: e.g., derash_2026-05-01_to_2026-05-31_20260531_192116.csv
const parseFileName = (name, type) => {
  try {
    const pattern = type === 'derash'
      ? /^derash_([\d-]+)_to_([\d-]+)_(\d{8})_(\d{6})\.csv$/
      : type === 'unicash'
        ? /^unicash_([\d-]+)_to_([\d-]+)_(\d{8})_(\d{6})\.csv$/
        : /^mardaarif_([\d-]+)_to_([\d-]+)_(\d{8})_(\d{6})\.csv$/;
    const match = name.match(pattern);
    if (match) {
      const [_, fromDate, toDate, dateStr, timeStr] = match;
      const formattedTimestamp = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)} ${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
      return {
        dateRange: `${fromDate} to ${toDate}`,
        timestamp: formattedTimestamp,
        isValid: true
      };
    }
  } catch (e) {
    console.error("Error parsing filename:", e);
  }
  return { dateRange: "N/A", timestamp: "N/A", isValid: false };
};

const BankImportFiles = () => {
  // Row selection states
  const [derashSelection, setDerashSelection] = useState({});
  const [unicashSelection, setUnicashSelection] = useState({});
  const [mardaarifSelection, setMardaarifSelection] = useState({});

  // Query to fetch all files
  const { data: allFiles = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["bank-payment-files"],
    queryFn: () => bankPaymentFileService.listFiles(),
    refetchOnWindowFocus: false,
    onError: (err) => {
      toast.error("Failed to load bank import files: " + (err.message || err));
    }
  });

  // Separate Derash and Unicash files
  const derashFiles = useMemo(() => {
    return allFiles
      .filter((file) => file.type === "derash")
      .map((file) => {
        const parsed = parseFileName(file.name, "derash");
        return {
          ...file,
          dateRange: parsed.dateRange,
          importedAt: parsed.timestamp,
          formattedSize: formatSize(file.size),
          lastModifiedFormatted: new Date(file.lastModified).toLocaleString(),
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [allFiles]);

  const unicashFiles = useMemo(() => {
    return allFiles
      .filter((file) => file.type === "unicash")
      .map((file) => {
        const parsed = parseFileName(file.name, "unicash");
        return {
          ...file,
          dateRange: parsed.dateRange,
          importedAt: parsed.timestamp,
          formattedSize: formatSize(file.size),
          lastModifiedFormatted: new Date(file.lastModified).toLocaleString(),
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [allFiles]);

  const mardaarifFiles = useMemo(() => {
    return allFiles
      .filter((file) => file.type === "mardaarif")
      .map((file) => {
        const parsed = parseFileName(file.name, "mardaarif");
        return {
          ...file,
          dateRange: parsed.dateRange,
          importedAt: parsed.timestamp,
          formattedSize: formatSize(file.size),
          lastModifiedFormatted: new Date(file.lastModified).toLocaleString(),
        };
      })
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [allFiles]);

  // Handle Download action
  const handleDownload = async (filename, type) => {
    try {
      toast.info(`Downloading ${filename}...`);
      const blob = await bankPaymentFileService.downloadFile(filename, type);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Download started successfully!");
    } catch (error) {
      toast.error("Failed to download file. Please try again.");
    }
  };

  // Extract selected filenames
  const selectedDerashFile = useMemo(() => {
    const selectedKeys = Object.keys(derashSelection);
    return selectedKeys.length > 0 ? selectedKeys[0] : null;
  }, [derashSelection]);

  const selectedUnicashFile = useMemo(() => {
    const selectedKeys = Object.keys(unicashSelection);
    return selectedKeys.length > 0 ? selectedKeys[0] : null;
  }, [unicashSelection]);

  const selectedMardaarifFile = useMemo(() => {
    const selectedKeys = Object.keys(mardaarifSelection);
    return selectedKeys.length > 0 ? selectedKeys[0] : null;
  }, [mardaarifSelection]);

  // Define columns for MaterialReactTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "File Name",
        size: 250,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileText size={18} style={{ color: "#3b82f6" }} />
            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "monospace" }}>
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "dateRange",
        header: "Date Range Covered",
        size: 180,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Calendar size={16} style={{ color: "#6b7280" }} />
            <Typography variant="body2">{cell.getValue()}</Typography>
          </Box>
        ),
      },
      {
        accessorKey: "importedAt",
        header: "Imported Timestamp",
        size: 180,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Clock size={16} style={{ color: "#6b7280" }} />
            <Typography variant="body2">{cell.getValue()}</Typography>
          </Box>
        ),
      },
      {
        accessorKey: "formattedSize",
        header: "File Size",
        size: 120,
        Cell: ({ cell }) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <HardDrive size={16} style={{ color: "#10b981" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{cell.getValue()}</Typography>
          </Box>
        ),
      },
      {
        accessorKey: "lastModifiedFormatted",
        header: "System Modification Time",
        size: 200,
      },
    ],
    []
  );

  const derashTable = useMaterialReactTable({
    columns,
    data: derashFiles,
    enableColumnActions: false,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setDerashSelection,
    getRowId: (row) => row.name,
    state: { rowSelection: derashSelection },
    enableTopToolbar: true,
    initialState: { density: "comfortable" },
  });

  const unicashTable = useMaterialReactTable({
    columns,
    data: unicashFiles,
    enableColumnActions: false,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setUnicashSelection,
    getRowId: (row) => row.name,
    state: { rowSelection: unicashSelection },
    enableTopToolbar: true,
    initialState: { density: "comfortable" },
  });

  const mardaarifTable = useMaterialReactTable({
    columns,
    data: mardaarifFiles,
    enableColumnActions: false,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setMardaarifSelection,
    getRowId: (row) => row.name,
    state: { rowSelection: mardaarifSelection },
    enableTopToolbar: true,
    initialState: { density: "comfortable" },
  });

  return (
    <Grid container spacing={3} sx={{ p: 1 }}>
      {/* Header & Breadcrumb */}
      <Grid item xs={12}>
        <Breadcrumb pageName="Bank Import Files" />
      </Grid>

      {/* Main Page Action & Status Title */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, letterSpacing: "-0.5px" }}>
              Bank Import CSV Files
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              View and download past imported bank statements for Derash, Unicash, and MardaArif integrations.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isFetching && <CircularProgress size={24} sx={{ color: "#3b82f6" }} />}
            <Tooltip title="Refresh Files">
              <IconButton
                onClick={() => {
                  setDerashSelection({});
                  setUnicashSelection({});
                  setMardaarifSelection({});
                  refetch();
                }}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#ffffff",
                  transition: "transform 0.4s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "rotate(180deg)",
                  },
                }}
              >
                <RefreshCw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Grid>

      {/* Loading Overlay */}
      {isLoading && (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", my: 10 }}>
          <CircularProgress size={60} thickness={4} />
        </Grid>
      )}

      {!isLoading && (
        <>
          {/* Derash CSV Files Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "8px",
                      backgroundColor: "#eff6ff",
                      color: "#2563eb",
                      display: "flex",
                    }}
                  >
                    <FileText size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Derash CSV Files
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Select a file from the table below to download.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={!selectedDerashFile}
                  startIcon={<Download size={16} />}
                  onClick={() => handleDownload(selectedDerashFile, "derash")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    boxShadow: selectedDerashFile ? "0 4px 12px rgba(59, 130, 246, 0.2)" : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      transform: selectedDerashFile ? "translateY(-1px)" : "none",
                      boxShadow: selectedDerashFile ? "0 6px 16px rgba(59, 130, 246, 0.3)" : "none",
                    },
                  }}
                >
                  Download Selected File
                </Button>
              </Box>
              <MaterialReactTable table={derashTable} />
            </Paper>
          </Grid>

          {/* Unicash CSV Files Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "8px",
                      backgroundColor: "#ecfdf5",
                      color: "#059669",
                      display: "flex",
                    }}
                  >
                    <FileText size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      Unicash CSV Files
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Select a file from the table below to download.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  disabled={!selectedUnicashFile}
                  startIcon={<Download size={16} />}
                  onClick={() => handleDownload(selectedUnicashFile, "unicash")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    backgroundColor: selectedUnicashFile ? "#059669" : "rgba(0,0,0,0.12)",
                    boxShadow: selectedUnicashFile ? "0 4px 12px rgba(5, 150, 105, 0.2)" : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#047857",
                      transform: selectedUnicashFile ? "translateY(-1px)" : "none",
                      boxShadow: selectedUnicashFile ? "0 6px 16px rgba(5, 150, 105, 0.3)" : "none",
                    },
                  }}
                >
                  Download Selected File
                </Button>
              </Box>
              <MaterialReactTable table={unicashTable} />
            </Paper>
          </Grid>

          {/* MardaArif CSV Files Section */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "8px",
                      backgroundColor: "#fef3c7",
                      color: "#d97706",
                      display: "flex",
                    }}
                  >
                    <FileText size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      MardaArif CSV Files
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>
                      Select a file from the table below to download.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  disabled={!selectedMardaarifFile}
                  startIcon={<Download size={16} />}
                  onClick={() => handleDownload(selectedMardaarifFile, "mardaarif")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    backgroundColor: selectedMardaarifFile ? "#d97706" : "rgba(0,0,0,0.12)",
                    color: selectedMardaarifFile ? "#ffffff" : "rgba(0,0,0,0.26)",
                    boxShadow: selectedMardaarifFile ? "0 4px 12px rgba(217, 119, 6, 0.2)" : "none",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#b45309",
                      transform: selectedMardaarifFile ? "translateY(-1px)" : "none",
                      boxShadow: selectedMardaarifFile ? "0 6px 16px rgba(217, 119, 6, 0.3)" : "none",
                    },
                  }}
                >
                  Download Selected File
                </Button>
              </Box>
              <MaterialReactTable table={mardaarifTable} />
            </Paper>
          </Grid>
        </>
      )}

      <ToastContainer position="top-right" autoClose={9000} hideProgressBar={false} />
    </Grid>
  );
};

const BankImportFilesWithProvider = () => {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BankImportFiles />
    </QueryClientProvider>
  );
};

export default BankImportFilesWithProvider;
