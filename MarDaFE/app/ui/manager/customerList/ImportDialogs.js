"use client";
import { useRef, useState, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TableSortLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import * as XLSX from "xlsx";

// Calculate Great-Circle distance between two coordinates in "lat,lng" format using Haversine formula
const calculateDistance = (gps1, gps2) => {
  if (!gps1 || !gps2 || gps1 === "-" || gps2 === "-") return null;
  const parts1 = gps1.split(",");
  const parts2 = gps2.split(",");
  if (parts1.length !== 2 || parts2.length !== 2) return null;

  const lat1 = parseFloat(parts1[0].trim());
  const lon1 = parseFloat(parts1[1].trim());
  const lat2 = parseFloat(parts2[0].trim());
  const lon2 = parseFloat(parts2[1].trim());

  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return null;

  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return "-";
  if (meters < 0.1) return "0 m";
  if (meters < 1000) {
    return `${meters.toFixed(1)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
};

const ImportDialogs = ({
  // Import New Customers
  confirmImportOpen,
  onCancelImport,
  onConfirmImport,
  selectedFile,
  importDialogOpen,
  onCloseImportDialog,
  importResult,
  // Update Existing Customers
  confirmUpdateOpen,
  onCancelUpdate,
  onConfirmUpdate,
  selectedUpdateFile,
  updateDialogOpen,
  onCloseUpdateDialog,
  updateResult,
  // Update Customer Reader
  updateReaderModalOpen,
  onUpdateReaderClose,
  branches,
  isBranchesLoading,
  updateReaderBranchId,
  onUpdateReaderBranchIdChange,
  updateReaderReaderId,
  onUpdateReaderReaderIdChange,
  updateReaderReaders,
  isUpdateReaderReadersLoading,
  updateReaderFile,
  onUpdateReaderFileChange,
  onUpdateReaderFileClear,
  updateReaderMatchedCustomers,
  updateReaderNotFound,
  updateReaderProcessing,
  updateReaderSaving,
  onProcessReaderExcel,
  onSaveUpdateReader,
  // Update GPS
  updateGpsModalOpen,
  onUpdateGpsClose,
  updateGpsFile,
  onUpdateGpsFileChange,
  onUpdateGpsFileClear,
  updateGpsMatchedCustomers,
  updateGpsNotFound,
  updateGpsProcessing,
  updateGpsSaving,
  onProcessGpsJson,
  onSaveUpdateGps,
  // Deactivation Confirmation (legacy inline)
  deactivatingCustomerId,
  onCancelDeactivation,
  onConfirmDeactivation,
  isDeactivating,
}) => {
  const updateReaderFileInputRef = useRef(null);
  const updateGpsFileInputRef = useRef(null);

  const [gpsSortField, setGpsSortField] = useState(null);
  const [gpsSortOrder, setGpsSortOrder] = useState("asc"); // "asc" or "desc"

  const handleGpsSort = (field) => {
    if (gpsSortField === field) {
      setGpsSortOrder(gpsSortOrder === "asc" ? "desc" : "asc");
    } else {
      setGpsSortField(field);
      setGpsSortOrder("asc");
    }
  };

  const sortedGpsMatchedCustomers = useMemo(() => {
    if (!updateGpsMatchedCustomers) return [];
    if (!gpsSortField) return updateGpsMatchedCustomers;

    return [...updateGpsMatchedCustomers].sort((a, b) => {
      let valA, valB;
      if (gpsSortField === "isSame") {
        valA = a.oldGps === a.newGps ? 1 : 0;
        valB = b.oldGps === b.newGps ? 1 : 0;
      } else if (gpsSortField === "distance") {
        valA = calculateDistance(a.oldGps, a.newGps) ?? -1;
        valB = calculateDistance(b.oldGps, b.newGps) ?? -1;
      } else {
        valA = a[gpsSortField];
        valB = b[gpsSortField];
      }

      if (valA === undefined || valA === null) valA = "";
      if (valB === undefined || valB === null) valB = "";

      if (typeof valA === "string" && typeof valB === "string") {
        return gpsSortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        // Numeric sort
        return gpsSortOrder === "asc" ? valA - valB : valB - valA;
      }
    });
  }, [updateGpsMatchedCustomers, gpsSortField, gpsSortOrder]);

  // Helper to render skipped rows table
  const renderSkippedRows = (skippedRows) => {
    if (!skippedRows?.length) return null;
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Skipped Rows
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Account Number</TableCell>
                <TableCell>Error Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {skippedRows.map((row, index) => {
                let errorMessage = "Unknown error occurred";
                if (row.message) {
                  errorMessage = row.message;
                } else if (row.reason) {
                  errorMessage = row.reason;
                } else if (row.error) {
                  errorMessage =
                    typeof row.error === "string"
                      ? row.error
                      : JSON.stringify(row.error);
                }

                return (
                  <TableRow
                    key={`${row.rowNum}-${index}`}
                    sx={{
                      "&:nth-of-type(odd)": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <TableCell>{row.rowNum || index + 1}</TableCell>
                    <TableCell>{row.accountNumber || "N/A"}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {errorMessage}
                        </Typography>
                        {row.accountNumber &&
                          row.accountNumber !== "N/A" && (
                            <Typography variant="caption" color="textSecondary">
                              Account: {row.accountNumber}
                            </Typography>
                          )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  // Helper to render result summary
  const renderResultSummary = (result, label) => {
    if (!result) return null;
    return (
      <Box>
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Typography>
            Successfully {label}: {result.importedCount || 0} customers
          </Typography>
          {result.importedCustomerSummaries?.length > 0 && (
            <Box mt={2} mb={2}>
              <Typography variant="subtitle2">
                {label === "imported" ? "Imported" : "Updated"} Accounts:
              </Typography>
              <Box
                sx={{
                  maxHeight: "150px",
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                  p: 1,
                  borderRadius: 1,
                  mt: 1,
                }}
              >
                {result.importedCustomerSummaries.map((summary, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    component="div"
                    sx={{ py: 0.5 }}
                  >
                    {summary}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
          <Typography>Skipped: {result.skippedCount || 0} rows</Typography>
        </Box>
        {renderSkippedRows(result.skippedRows)}
      </Box>
    );
  };

  return (
    <>
      {/* Confirm Import Dialog */}
      <Dialog
        open={confirmImportOpen}
        onClose={onCancelImport}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Import</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to import customers from this file?
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            File: {selectedFile?.name}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            display="block"
            sx={{ mt: 1 }}
          >
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelImport} color="primary">
            Cancel
          </Button>
          <Button
            onClick={onConfirmImport}
            color="primary"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Confirm Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Results Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={onCloseImportDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Results</DialogTitle>
        <DialogContent>
          {renderResultSummary(importResult, "imported")}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseImportDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Update Dialog */}
      <Dialog
        open={confirmUpdateOpen}
        onClose={onCancelUpdate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to update customers from this file?
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            File: {selectedUpdateFile?.name}
          </Typography>
          <Typography
            variant="caption"
            color="textSecondary"
            display="block"
            sx={{ mt: 1 }}
          >
            This will update existing customer records based on account numbers.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancelUpdate} color="primary">
            Cancel
          </Button>
          <Button
            onClick={onConfirmUpdate}
            color="primary"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Confirm Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Results Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={onCloseUpdateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Results</DialogTitle>
        <DialogContent>
          {renderResultSummary(updateResult, "updated")}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseUpdateDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Customer Reader Modal */}
      <Dialog
        open={updateReaderModalOpen}
        onClose={onUpdateReaderClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Customer Reader</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step 1: Branch & Reader Selection */}
            <Typography variant="subtitle2" color="text.secondary">
              Step 1: Select Branch &amp; Reader
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <FormControl size="small" sx={{ minWidth: 220 }}>
                <InputLabel>Branch</InputLabel>
                <Select
                  label="Branch"
                  value={updateReaderBranchId}
                  onChange={(e) => onUpdateReaderBranchIdChange(e.target.value)}
                  disabled={isBranchesLoading}
                >
                  <MenuItem value="">
                    <em>Select Branch</em>
                  </MenuItem>
                  {isBranchesLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : branches?.length > 0 ? (
                    branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.id}>
                        {branch.name || `Branch ${branch.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No branches found</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl
                size="small"
                sx={{ minWidth: 220 }}
                disabled={!updateReaderBranchId}
              >
                <InputLabel>Mobile Reader</InputLabel>
                <Select
                  label="Mobile Reader"
                  value={updateReaderReaderId}
                  onChange={(e) => onUpdateReaderReaderIdChange(e.target.value)}
                  disabled={isUpdateReaderReadersLoading || !updateReaderBranchId}
                >
                  <MenuItem value="">
                    <em>Select Reader</em>
                  </MenuItem>
                  {isUpdateReaderReadersLoading ? (
                    <MenuItem disabled>Loading...</MenuItem>
                  ) : updateReaderReaders?.length > 0 ? (
                    updateReaderReaders.map((r) => (
                      <MenuItem key={r.id} value={r.id}>
                        {r.name || `Reader ${r.id}`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No readers found</MenuItem>
                  )}
                </Select>
              </FormControl>
            </Box>

            {/* Step 2: Upload Excel */}
            <Typography variant="subtitle2" color="text.secondary">
              Step 2: Upload Excel File (Account Numbers in Column B)
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <input
                type="file"
                ref={updateReaderFileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    onUpdateReaderFileChange(file);
                  }
                  e.target.value = "";
                }}
                accept=".xlsx,.xls"
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => updateReaderFileInputRef.current?.click()}
                size="small"
              >
                Choose File
              </Button>
              {updateReaderFile && (
                <Chip
                  label={updateReaderFile.name}
                  onDelete={onUpdateReaderFileClear}
                  size="small"
                />
              )}
            </Box>

            {/* Step 3: Process */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={onProcessReaderExcel}
                disabled={!updateReaderFile || updateReaderProcessing}
                size="small"
              >
                {updateReaderProcessing ? "Processing..." : "Process"}
              </Button>
              {updateReaderProcessing && <CircularProgress size={20} />}
            </Box>

            {/* Results */}
            {(updateReaderMatchedCustomers.length > 0 ||
              updateReaderNotFound.length > 0) && (
              <Box>
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Matched: {updateReaderMatchedCustomers.length}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Not Found: {updateReaderNotFound.length}
                  </Typography>
                </Box>

                {updateReaderMatchedCustomers.length > 0 && (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ maxHeight: 300, mb: 2 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Account Number</TableCell>
                          <TableCell>Full Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {updateReaderMatchedCustomers.map((customer, idx) => (
                          <TableRow
                            key={customer.id}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{customer.accountNumber}</TableCell>
                            <TableCell>
                              {customer.fullName ||
                                customer.fullNameEng ||
                                "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {updateReaderNotFound.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="error"
                      gutterBottom
                    >
                      Not Found Account Numbers:
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 120,
                        overflow: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {updateReaderNotFound.map((acc, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          component="div"
                          sx={{ py: 0.25 }}
                        >
                          {idx + 1}. {acc}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {updateReaderSaving && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onUpdateReaderClose} disabled={updateReaderSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSaveUpdateReader}
            disabled={
              !updateReaderReaderId ||
              updateReaderMatchedCustomers.length === 0 ||
              updateReaderSaving
            }
          >
            {updateReaderSaving
              ? "Saving..."
              : `Save (Assign ${updateReaderMatchedCustomers.length} Customers)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update GPS Modal */}
      <Dialog
        open={updateGpsModalOpen}
        onClose={onUpdateGpsClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Update Customer GPS</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Step 1: Upload JSON */}
            <Typography variant="subtitle2" color="text.secondary">
              Step 1: Upload JSON File
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Format: [{"{"}"customer_info_id": 123, "latitude": "11.56", "longitude": "36.49"{"}"},...]
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <input
                type="file"
                ref={updateGpsFileInputRef}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    onUpdateGpsFileChange(file);
                  }
                  e.target.value = "";
                }}
                accept=".json"
                style={{ display: "none" }}
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => updateGpsFileInputRef.current?.click()}
                size="small"
              >
                Choose File
              </Button>
              {updateGpsFile && (
                <Chip
                  label={updateGpsFile.name}
                  onDelete={onUpdateGpsFileClear}
                  size="small"
                />
              )}
            </Box>

            {/* Step 2: Process */}
            <Typography variant="subtitle2" color="text.secondary">
              Step 2: Process &amp; Preview
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                onClick={onProcessGpsJson}
                disabled={!updateGpsFile || updateGpsProcessing}
                size="small"
              >
                {updateGpsProcessing ? "Processing..." : "Process"}
              </Button>
              {updateGpsProcessing && <CircularProgress size={20} />}
            </Box>

            {/* Results */}
            {(updateGpsMatchedCustomers.length > 0 ||
              updateGpsNotFound.length > 0) && (
              <Box>
                <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Matched: {updateGpsMatchedCustomers.length}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Not Found: {updateGpsNotFound.length}
                  </Typography>
                </Box>

                {updateGpsMatchedCustomers.length > 0 && (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ maxHeight: 350, mb: 2 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "customerId"}
                              direction={gpsSortField === "customerId" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("customerId")}
                            >
                              Customer ID
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "accountNumber"}
                              direction={gpsSortField === "accountNumber" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("accountNumber")}
                            >
                              Account Number
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "fullName"}
                              direction={gpsSortField === "fullName" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("fullName")}
                            >
                              Full Name
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "oldGps"}
                              direction={gpsSortField === "oldGps" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("oldGps")}
                            >
                              Old GPS
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "newGps"}
                              direction={gpsSortField === "newGps" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("newGps")}
                            >
                              New GPS
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "isSame"}
                              direction={gpsSortField === "isSame" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("isSame")}
                            >
                              Diff
                            </TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel
                              active={gpsSortField === "distance"}
                              direction={gpsSortField === "distance" ? gpsSortOrder : "asc"}
                              onClick={() => handleGpsSort("distance")}
                            >
                              Distance
                            </TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedGpsMatchedCustomers.map((entry, idx) => {
                          const isSame = entry.oldGps === entry.newGps;
                          const distance = calculateDistance(entry.oldGps, entry.newGps);
                          return (
                          <TableRow
                            key={entry.customerId}
                            sx={{
                              "&:nth-of-type(odd)": {
                                backgroundColor: "action.hover",
                              },
                            }}
                          >
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{entry.customerId}</TableCell>
                            <TableCell>{entry.accountNumber}</TableCell>
                            <TableCell>{entry.fullName}</TableCell>
                            <TableCell>{entry.oldGps}</TableCell>
                            <TableCell
                              sx={{ color: "primary.main", fontWeight: "bold" }}
                            >
                              {entry.newGps}
                            </TableCell>
                            <TableCell
                              sx={{
                                color: isSame ? "success.main" : "warning.main",
                                fontWeight: "bold",
                              }}
                            >
                              {isSame ? "Same" : "Diff"}
                            </TableCell>
                            <TableCell sx={{ fontWeight: "medium" }}>
                              {formatDistance(distance)}
                            </TableCell>
                          </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                {updateGpsNotFound.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      color="error"
                      gutterBottom
                    >
                      Not Found Customer IDs:
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 120,
                        overflow: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 1,
                      }}
                    >
                      {updateGpsNotFound.map((id, idx) => (
                        <Typography
                          key={idx}
                          variant="body2"
                          component="div"
                          sx={{ py: 0.25 }}
                        >
                          {idx + 1}. ID: {id}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {updateGpsSaving && <LinearProgress />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onUpdateGpsClose} disabled={updateGpsSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSaveUpdateGps}
            disabled={
              updateGpsMatchedCustomers.length === 0 ||
              updateGpsSaving
            }
          >
            {updateGpsSaving
              ? "Saving..."
              : `Save (Update ${updateGpsMatchedCustomers.length} Customers)`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Basic Deactivation Confirmation (legacy) */}
      {deactivatingCustomerId && (
        <Dialog
          open={!!deactivatingCustomerId}
          onClose={onCancelDeactivation}
        >
          <DialogTitle>Confirm Deactivation</DialogTitle>
          <DialogContent>
            Are you sure you want to deactivate this customer?
          </DialogContent>
          <DialogActions>
            <Button onClick={onCancelDeactivation}>Cancel</Button>
            <Button
              color="error"
              onClick={onConfirmDeactivation}
              disabled={isDeactivating}
            >
              Deactivate
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ImportDialogs;
