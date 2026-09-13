"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Download,
  Send,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Calendar,
  Wallet,
  Settings,
} from "lucide-react";
import hrmsPayrollService from "../../../lib/hrmsPayrollService";
import hrmsPayrollAccountMapService from "../../../lib/hrmsPayrollAccountMapService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncAccountService from "../../../lib/fncAccountService";
var ethiopianDate = require("ethiopian-date");

const ethiopianMonths = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
];

const fmt = (val) =>
  Number(val || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function HrmsPayrollToJournalPage() {
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const [selectedMonth, setSelectedMonth] = useState(ethiopianMonths[ethMonth - 1] || "መስከረም");
  const [selectedYear, setSelectedYear] = useState(String(ethYear) || "2018");
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [accountMappings, setAccountMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentRun, setCurrentRun] = useState(null);
  const [journalPreview, setJournalPreview] = useState(null);
  const [pushing, setPushing] = useState(false);

  const yearOptions = [2014, 2015, 2016, 2017, 2018, 2019, 2020];

  useEffect(() => {
    loadSupportData();
  }, []);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      loadPayrollForPeriod();
    }
  }, [selectedMonth, selectedYear]);

  const loadSupportData = async () => {
    try {
      const [fyData, mapData, accData] = await Promise.all([
        fncFiscalYearService.getOpenFiscalYears().catch(() => []),
        hrmsPayrollAccountMapService.getAllMappings().catch(() => []),
        fncAccountService.getAllAccounts().catch(() => []),
      ]);

      setFiscalYears(Array.isArray(fyData) ? fyData : []);
      if (Array.isArray(fyData) && fyData.length > 0) {
        setSelectedFiscalYear(fyData[0].id);
      }
      setAccountMappings(Array.isArray(mapData) ? mapData : []);
      setAccounts(Array.isArray(accData) ? accData : []);
    } catch (e) {
      toast.error("Failed to load fiscal years and account mappings");
    }
  };

  const loadPayrollForPeriod = async () => {
    setLoading(true);
    setCurrentRun(null);
    setJournalPreview(null);
    try {
      const runs = await hrmsPayrollService.getPayrollRuns();
      const match = Array.isArray(runs)
        ? runs.find(
            (r) =>
              r.salaryMonthName === selectedMonth &&
              Number(r.salaryYear) === Number(selectedYear)
          )
        : null;

      if (match) {
        setCurrentRun(match);
        // Load journal preview
        try {
          const preview = await hrmsPayrollService.previewJournal(match.id);
          setJournalPreview(preview);
        } catch (err) {
          console.warn("Could not preview journal:", err);
        }
      }
    } catch (e) {
      console.error("Error loading payroll runs:", e);
    }
    setLoading(false);
  };

  const handleGeneratePayroll = async () => {
    if (!selectedFiscalYear) {
      toast.error("Please select an active Fiscal Year");
      return;
    }
    setLoading(true);
    try {
      const run = await hrmsPayrollService.generatePayrollRun({
        salaryMonthName: selectedMonth,
        salaryYear: Number(selectedYear),
        fiscalYearId: Number(selectedFiscalYear),
        routeExtraToAbay: true,
      });
      toast.success(`Payroll generated for ${selectedMonth}, ${selectedYear}!`);
      setCurrentRun(run);
      const preview = await hrmsPayrollService.previewJournal(run.id);
      setJournalPreview(preview);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to calculate payroll");
    }
    setLoading(false);
  };

  const handlePushToJournal = async () => {
    if (!currentRun) return;
    setPushing(true);
    try {
      const res = await hrmsPayrollService.pushPayrollToJournal(currentRun.id);
      toast.success(res.message || "Draft journal entry created in Finance General Ledger!");
      setConfirmDialogOpen(false);
      loadPayrollForPeriod();
    } catch (e) {
      toast.error(e?.response?.data?.error || e.message || "Failed to push payroll to journal");
    }
    setPushing(false);
  };

  const hasMissingMappings = useMemo(() => {
    const requiredKeys = [
      "HRMS_DR_BASIC_SALARY",
      "HRMS_DR_OVERTIME",
      "HRMS_DR_EMPLOYER_PENSION_11",
      "HRMS_CR_TAX_PAYABLE",
      "HRMS_CR_PENSION_PAYABLE_18",
      "HRMS_CR_NET_SALARY_CBE",
    ];
    const mapped = new Set(accountMappings.map((m) => m.mappingKey));
    return requiredKeys.some((k) => !mapped.has(k));
  }, [accountMappings]);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0d47a1", display: "flex", alignItems: "center", gap: 1 }}>
            <Building2 size={28} color="#0d47a1" />
            የሰው ኃይል ደመወዝ ወደ ፋይናንስ ጆርናል መመዝገቢያ (HRMS Payroll to General Ledger)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ethiopian Labour Proclamation No. 1156/2019 • Automated Balanced Debit/Credit Posting & Dual Banking (CBE / Abay)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Settings size={18} />}
          onClick={() => setMappingModalOpen(true)}
          sx={{ borderColor: "#0d47a1", color: "#0d47a1", fontWeight: "bold" }}
        >
          GL Account Mappings
        </Button>
      </Box>

      {/* Control Panel: Month, Year, Fiscal Year Selection */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>የደመወዝ ወር (Ethiopian Month)</InputLabel>
              <Select
                value={selectedMonth}
                label="የደመወዝ ወር (Ethiopian Month)"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {ethiopianMonths.map((m) => (
                  <MenuItem key={m} value={m} sx={{ fontFamily: "Nyala, serif" }}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>ዓመተ ምሕረት (Ethiopian Year)</InputLabel>
              <Select
                value={selectedYear}
                label="ዓመተ ምሕረት (Ethiopian Year)"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Active Fiscal Year</InputLabel>
              <Select
                value={selectedFiscalYear}
                label="Active Fiscal Year"
                onChange={(e) => setSelectedFiscalYear(e.target.value)}
              >
                {fiscalYears.map((fy) => (
                  <MenuItem key={fy.id} value={fy.id}>
                    {fy.fiscalYearCode || fy.yearName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              onClick={handleGeneratePayroll}
              sx={{ bgcolor: "#0d47a1", "&:hover": { bgcolor: "#0a3880" }, fontWeight: "bold" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Run Monthly Payroll"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Warnings & Alerts */}
      {hasMissingMappings && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Missing Payroll Account Mappings</AlertTitle>
          Some payroll components are not mapped to Chart of Accounts. Click <strong>GL Account Mappings</strong> above to configure debit/credit accounts before posting to journal.
        </Alert>
      )}

      {currentRun && currentRun.postedToJournal && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <AlertTitle>✅ Journal Entry Already Created</AlertTitle>
          Payroll for <strong>{selectedMonth}, {selectedYear}</strong> has already been posted to Finance Journal as{" "}
          <strong>{currentRun.payrollReference}</strong>.
        </Alert>
      )}

      {/* Payroll KPI Cards */}
      {currentRun && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: "#e3f2fd", border: "1px solid #90caf9" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  GROSS SALARY (ጠቅላላ ደመወዝ)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1565c0" }}>
                  ETB {fmt(currentRun.totalGrossSalary)}
                </Typography>
                <Typography variant="caption">Basic: {fmt(currentRun.totalBasicSalary)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: "#fff3e0", border: "1px solid #ffcc80" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  OVERTIME PAY (ትርፍ ሰዓት 1.5-2.5x)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#e65100" }}>
                  ETB {fmt(currentRun.totalOvertime)}
                </Typography>
                <Typography variant="caption">Proc. 1156/2019 rates</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: "#fbe9e7", border: "1px solid #ffab91" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  TAX & PENSION (ግብርና ጡረታ)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#c62828" }}>
                  ETB {fmt(currentRun.totalSalaryTax + currentRun.totalPensionEmployee + currentRun.totalPensionEmployer)}
                </Typography>
                <Typography variant="caption">Tax: {fmt(currentRun.totalSalaryTax)} | Pen: {fmt(currentRun.totalPensionEmployee + currentRun.totalPensionEmployer)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: "#e8f5e9", border: "1px solid #a5d6a7" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  NET PAYABLE — CBE (ንግድ ባንክ)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                  ETB {fmt(currentRun.totalNetCbe)}
                </Typography>
                <Typography variant="caption">Primary Bank</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ bgcolor: "#f3e5f5", border: "1px solid #ce93d8" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                  NET PAYABLE — ABAY BANK (አባይ ባንክ)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7b1fa2" }}>
                  ETB {fmt(currentRun.totalNetAbay)}
                </Typography>
                <Typography variant="caption">Secondary Bank</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Balanced Journal Preview Table */}
      {journalPreview && (
        <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2, border: "2px solid #0d47a1" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
              ፋይናንስ ጆርናል ቅድመ ዕይታ (Balanced GL Journal Voucher Preview)
            </Typography>
            <Chip
              icon={journalPreview.isBalanced ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              label={journalPreview.isBalanced ? "BALANCED (ዴቢት = ክሬዲት)" : "UNBALANCED"}
              color={journalPreview.isBalanced ? "success" : "error"}
              sx={{ fontWeight: "bold" }}
            />
          </Box>

          <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#0d47a1" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>#</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>የሂሳብ ቁጥር (Account Code)</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>የሂሳብ ስም (Account Name)</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>መግለጫ (Line Description)</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>DEBIT (ዴቢት - ብር)</TableCell>
                  <TableCell align="right" sx={{ color: "white", fontWeight: "bold" }}>CREDIT (ክሬዲት - ብር)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journalPreview.lines.map((l, idx) => (
                  <TableRow key={idx} sx={{ bgcolor: l.debitAmount > 0 ? "#f8fafd" : "#fbfdf9" }}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>{l.account?.accountCode || "N/A"}</TableCell>
                    <TableCell>{l.account?.accountName} ({l.account?.accountNameAm || ""})</TableCell>
                    <TableCell>{l.description}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", color: l.debitAmount > 0 ? "#1565c0" : "inherit" }}>
                      {l.debitAmount > 0 ? fmt(l.debitAmount) : "-"}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", color: l.creditAmount > 0 ? "#2e7d32" : "inherit" }}>
                      {l.creditAmount > 0 ? fmt(l.creditAmount) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow sx={{ bgcolor: "#f5f5f5", "& td": { fontWeight: "bold", fontSize: "1.05rem" } }}>
                  <TableCell colSpan={4} align="right">
                    TOTALS (ድምር)
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#1565c0", borderTop: "2px solid #333" }}>
                    ETB {fmt(journalPreview.totalDebit)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#2e7d32", borderTop: "2px solid #333" }}>
                    ETB {fmt(journalPreview.totalCredit)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>

          {/* Action Buttons: Push to GL, Download CBE, Download Abay Bank */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              href={hrmsPayrollService.getCbeExportUrl(currentRun.id)}
              download
              sx={{ borderColor: "#2e7d32", color: "#2e7d32", fontWeight: "bold" }}
            >
              Download CBE Bulk Transfer (.csv)
            </Button>

            {currentRun.totalNetAbay > 0 && (
              <Button
                variant="outlined"
                startIcon={<Download size={18} />}
                href={hrmsPayrollService.getAbayExportUrl(currentRun.id)}
                download
                sx={{ borderColor: "#7b1fa2", color: "#7b1fa2", fontWeight: "bold" }}
              >
                Download Abay Bank Transfer (.csv)
              </Button>
            )}

            <Button
              variant="contained"
              startIcon={<Send size={18} />}
              disabled={!journalPreview.isBalanced || currentRun.postedToJournal || pushing}
              onClick={() => setConfirmDialogOpen(true)}
              sx={{ bgcolor: "#0d47a1", "&:hover": { bgcolor: "#0a3880" }, fontWeight: "bold" }}
            >
              {currentRun.postedToJournal ? "Already Posted to GL" : "Push to Finance Journal (DRAFT)"}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#0d47a1", color: "white" }}>
          Confirm Monthly Payroll Journal Posting
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1">
            Are you sure you want to push the monthly payroll for <strong>{selectedMonth}, {selectedYear}</strong> to the
            Finance General Ledger?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • Reference Number: <strong>{currentRun?.payrollReference}</strong>
            <br />
            • Total Balanced Debits & Credits: <strong>ETB {fmt(journalPreview?.totalDebit)}</strong>
            <br />
            • The entry will be created in <strong>DRAFT</strong> status for Finance Director review.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} disabled={pushing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePushToJournal}
            disabled={pushing}
            sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}
          >
            {pushing ? <CircularProgress size={22} color="inherit" /> : "Confirm & Post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
