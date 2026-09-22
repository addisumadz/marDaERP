"use client";
import { useMemo } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Typography, Paper, Tabs, Tab, Chip, Grid, Divider } from "@mui/material";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

const CustomerBillsPanel = ({
  selectedCustomerId,
  customerName = "",
  accountNumber = "",
  combinedBillData,
  isLoading,
  isError,
  activeBillTab,
  onBillTabChange,
}) => {
  const customerBills = combinedBillData?.bills ?? [];
  const wuzifBills = combinedBillData?.wuzifBills ?? [];

  const activeBills = useMemo(
    () => (customerBills || []).filter((bill) => !bill.void),
    [customerBills]
  );
  const voidedBills = useMemo(
    () => (customerBills || []).filter((bill) => bill.void),
    [customerBills]
  );

  // Financial calculations
  const totalBilled = useMemo(
    () => activeBills.reduce((acc, b) => acc + Number(b.tekilalaTekefay || 0), 0),
    [activeBills]
  );
  const totalPaid = useMemo(
    () =>
      activeBills
        .filter((b) => b.moneyCollected)
        .reduce((acc, b) => acc + Number(b.tekilalaTekefay || 0), 0),
    [activeBills]
  );
  const totalUnpaid = totalBilled - totalPaid;

  const billColumns = useMemo(
    () => [
      { header: "#", size: 30, Cell: ({ row }) => row.index + 1 },
      {
        accessorKey: "billingInvoiceNumber",
        header: "Invoice No",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {cell.getValue() || "N/A"}
          </Typography>
        ),
      },
      { accessorKey: "kifyaWer", header: "Billing Month (ክፍያ ወር)" },
      {
        accessorKey: "previousReading",
        header: "Prev Reading",
        Cell: ({ cell }) => Number(cell.getValue() || 0).toLocaleString(),
      },
      {
        accessorKey: "lastReading",
        header: "Last Reading",
        Cell: ({ cell }) => Number(cell.getValue() || 0).toLocaleString(),
      },
      {
        accessorKey: "consumption",
        header: "Consumption (m³)",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {Number(cell.getValue() || 0).toLocaleString()}
          </Typography>
        ),
      },
      {
        accessorKey: "tekilalaTekefay",
        header: "Total Bill (ETB)",
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {Number(cell.getValue() || 0).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Typography>
        ),
      },
      {
        accessorKey: "kecreditYetekefele",
        header: "Prepaid Deducted",
        Cell: ({ cell }) => Number(cell.getValue() || 0).toLocaleString(),
      },
      {
        accessorKey: "paymentInfo",
        header: "Payment Status & Channel",
        Cell: ({ row }) => {
          const {
            unicashPaid,
            uBankPaidAgentId,
            derashPaid,
            bankName,
            paidOnFrontOffice,
            PaidFromTekemach,
            moneyCollected,
          } = row.original;

          if (moneyCollected) {
            const channels = [];
            if (unicashPaid) channels.push(uBankPaidAgentId || "Unicash");
            if (derashPaid) channels.push(bankName || "Derash");
            if (PaidFromTekemach) channels.push("ቅድመ ክፍያ");
            if (paidOnFrontOffice) channels.push("ቢሮ ተከፍሏል");
            const label = channels.join(", ") || "ተከፍሏል (Paid)";

            return (
              <Chip
                size="small"
                icon={<CheckCircleIcon />}
                label={label}
                color="success"
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
            );
          }

          return (
            <Chip
              size="small"
              icon={<HourglassEmptyIcon />}
              label="አልተከፈለም (Unpaid)"
              color="warning"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          );
        },
      },
    ],
    []
  );

  const billTable = useMaterialReactTable({
    columns: billColumns,
    data: activeBillTab === 0 ? activeBills : voidedBills,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading customer bill history" }
      : undefined,
  });

  const wuzifTable = useMaterialReactTable({
    columns: billColumns,
    data: wuzifBills,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading historical Wuzif arrears" }
      : undefined,
  });

  if (!selectedCustomerId) return null;

  return (
    <Box mt={3} mb={4}>
      {/* Panel Header & Summary Metrics */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Bills & Invoice Ledger for Customer #{selectedCustomerId}
            </Typography>
            {accountNumber && (
              <Chip label={`Acc: ${accountNumber}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            )}
            {customerName && (
              <Typography variant="body2" color="text.secondary">
                ({customerName})
              </Typography>
            )}
          </Box>
        </Box>

        {/* Quick financial cards */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 1.2, textAlign: "center", bgcolor: "background.default", borderRadius: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Invoices</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{activeBills.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 1.2, textAlign: "center", bgcolor: "background.default", borderRadius: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Invoiced (ETB)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                {totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 1.2, textAlign: "center", bgcolor: "background.default", borderRadius: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Total Collected (ETB)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "success.main" }}>
                {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper variant="outlined" sx={{ p: 1.2, textAlign: "center", bgcolor: "background.default", borderRadius: 1.5 }}>
              <Typography variant="caption" color="text.secondary">Outstanding Unpaid (ETB)</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: totalUnpaid > 0 ? "error.main" : "text.secondary" }}>
                {totalUnpaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Bills Table with Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs value={activeBillTab} onChange={onBillTabChange} aria-label="bill status tabs">
            <Tab label={`Active Invoices (${activeBills.length})`} sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab label={`Voided Invoices (${voidedBills.length})`} sx={{ textTransform: "none", fontWeight: 600 }} />
          </Tabs>
        </Box>
        <MaterialReactTable table={billTable} />
      </Paper>

      {/* Unpaid Wuzif Bills Section */}
      {wuzifBills.length > 0 && (
        <Box mt={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 1.5,
              mb: 1.5,
              borderRadius: 2,
              bgcolor: "warning.lighter",
              border: "1px solid",
              borderColor: "warning.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <WarningAmberIcon color="warning" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "warning.dark" }}>
              Unpaid Historical Wuzif Arrears ({wuzifBills.length} records)
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <MaterialReactTable table={wuzifTable} />
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CustomerBillsPanel;
