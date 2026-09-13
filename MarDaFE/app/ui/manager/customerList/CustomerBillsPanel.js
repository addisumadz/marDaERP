"use client";
import { useMemo } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Typography, Paper, Tabs, Tab } from "@mui/material";

const CustomerBillsPanel = ({
  selectedCustomerId,
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

  const billColumns = useMemo(
    () => [
      { header: "#", size: 20, Cell: ({ row }) => row.index + 1 },
      { accessorKey: "billingInvoiceNumber", header: "Invoice Number" },
      { accessorKey: "kifyaWer", header: "Kifya Wer" },
      { accessorKey: "previousReading", header: "Previous Reading" },
      { accessorKey: "lastReading", header: "Last Reading" },
      { accessorKey: "consumption", header: "Consumption" },
      { accessorKey: "tekilalaTekefay", header: "ብር" },
      { accessorKey: "kecreditYetekefele", header: "ቅድመ ክፍያ" },
      {
        accessorKey: "paymentInfo",
        header: "የክፍያ ሁኔታ",
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
            const paymentLocations = [];
            if (unicashPaid) paymentLocations.push(uBankPaidAgentId);
            if (derashPaid) paymentLocations.push(bankName);
            if (PaidFromTekemach) paymentLocations.push("ቅድመ ክፍያ");
            if (paidOnFrontOffice) paymentLocations.push("ቢሮ ተከፍሏል");
            return paymentLocations.join(", ") || "ተከፍሏል";
          }
          return "አልተከፈለም";
        },
      },
    ],
    []
  );

  const billTable = useMaterialReactTable({
    columns: billColumns,
    data: activeBillTab === 0 ? activeBills : voidedBills,
    state: {
      isLoading: isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading bills" }
      : undefined,
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        backgroundColor: row.original.moneyCollected
          ? "lightgreen"
          : "lightyellow",
      },
    }),
  });

  const wuzifTable = useMaterialReactTable({
    columns: billColumns,
    data: wuzifBills,
    state: {
      isLoading: isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading Wuzif bills" }
      : undefined,
    muiTableBodyRowProps: { sx: { backgroundColor: "lightyellow" } },
  });

  if (!selectedCustomerId) return null;

  return (
    <>
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Bills for Selected Customer
        </Typography>
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeBillTab}
              onChange={onBillTabChange}
              aria-label="bill status tabs"
            >
              <Tab label="Active Bills" />
              <Tab label="Voided Bills" />
            </Tabs>
          </Box>
          <MaterialReactTable table={billTable} />
        </Paper>
      </Box>

      {wuzifBills.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            Unpaid Wuzif List
          </Typography>
          <Paper>
            <MaterialReactTable table={wuzifTable} />
          </Paper>
        </Box>
      )}
    </>
  );
};

export default CustomerBillsPanel;
