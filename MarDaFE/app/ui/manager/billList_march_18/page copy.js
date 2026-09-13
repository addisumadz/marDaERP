"use client";
import { useMemo, useState, useEffect } from "react";
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
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "../../../lib/ReadingService";
import ViewBillDetailModal from "./ViewBillDetailModal";
var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();

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

// >>> Unified helper function to get bank name from any code
const getBankName = (code) => {
  if (!code) {
    return null; // Ignore if the code is empty or null
  }

  // This map contains all your provided bank codes and names.
  const bankMap = {
    "Abay Bank": "አባይ ባንክ",
    "Bunna Bank": "ቡና ባንክ",
    "Awash Bank": "አዋሽ ባንክ",
    "Enat Bank": "እናት ባንክ",
    "Hibret Bank": "ሕብረት ባንክ",
    128025: "ንግድ ባንክ",
    117270: "አቢሲኒያ ባንክ",

    138341: "ቴሌ ብር",
    116347: "አማራ ባንክ",
    111871: "ንብ ባንክ",
    113595: "ብርሃን ባንክ",
    116601: "ጸደይ ባንክ",
    112852: "አዋሽ ባንክ",
    "አባይ ባንክ": "አባይ ባንክ",
    "ቡና ባንክ": "ቡና ባንክ",
    "አዋሽ ባንክ": "አዋሽ ባንክ",
    "ንግድ ባንክ": "ንግድ ባንክ",
    "አቢሲኒያ ባንክ": "አቢሲኒያ ባንክ",
    "ቴሌ ብር": "ቴሌ ብር",
    "አማራ ባንክ": "አማራ ባንክ",
    "Nib Bank": "ንብ ባንክ",
    "Birhan Bank": "ብርሃን ባንክ",
    "Tsedey Bank": "ጸደይ ባንክ",
    113120: "አባይ ባንክ ደራሽ",
    114584: "ቡና ባንክ ደራሽ",
    119673: "ዳሽን ባንክ ደራሽ",
  };

  const name = bankMap[code.toString()];

  if (name) {
    return name;
  } else {
    // >>> ADDED: This will log the specific code that is not found
    console.log("Unknown bank code found:", code);
    return "Unknown Bank"; // If not found, categorize as 'Unknown Bank'
  }
};

const BillList = () => {
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewedBill, setViewedBill] = useState(null);

  // >>> ADDED: State for new client-side filters
  //const [filteredData, setFilteredData] = useState([]);
  const [filterDerashPaid, setFilterDerashPaid] = useState(false);
  const [filterPaidOnFrontOffice, setFilterPaidOnFrontOffice] = useState(false);
  const [filterUnicashPaid, setFilterUnicashPaid] = useState(false);
  const [filterMoneyCollected, setFilterMoneyCollected] = useState("all");

  const currentGregorianDate = new Date();
  const [ethYear, ethMonth, ethDay] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const yearOptions = useMemo(() => {
    const years = [];
    for (let i = ethYear - 5; i <= ethYear + 1; i++) {
      years.push(i);
    }
    return years;
  }, [ethYear]);

  useEffect(() => {
    setSelectedKifyaWerMonth(ethiopianMonths[ethMonth - 1]);
    setSelectedKifyaWerYear(ethYear);
  }, [ethYear, ethMonth]);

  const {
    data: readings = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["filteredReadings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
        const data = await readingService.getBillFilteredReadings(
          "ACTIVE",
          kifyaWerFormatted
        );
        return data;
      }
      return [];
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      toast.error("Failed to load bills: " + error.message);
    },
  });

  // >>> ADDED: Replace useState and useEffect with a single useMemo for derived data
  const filteredData = useMemo(() => {
    let tempReadings = [...readings];

    // --- Payment Type Filters (OR logic) ---
    const paymentFiltersActive =
      filterDerashPaid || filterPaidOnFrontOffice || filterUnicashPaid;

    if (paymentFiltersActive) {
      tempReadings = tempReadings.filter(
        (bill) =>
          (filterDerashPaid && bill.derashPaid) ||
          (filterPaidOnFrontOffice && bill.paidOnFrontOffice) ||
          (filterUnicashPaid && bill.unicashPaid)
      );
    }

    // --- Money Collected Filter (applied after payment filters) ---
    if (filterMoneyCollected !== "all") {
      const moneyCollectedBool = filterMoneyCollected === "true";
      tempReadings = tempReadings.filter(
        (bill) => bill.moneyCollected === moneyCollectedBool
      );
    }

    return tempReadings; // Return the calculated array
  }, [
    readings,
    filterDerashPaid,
    filterPaidOnFrontOffice,
    filterUnicashPaid,
    filterMoneyCollected,
  ]);

  const handleFilterClick = () => {
    if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      refetch();
    } else {
      toast.info("Please select both a month and a year to filter.");
    }
  };
  // 1 sumation segment
  const summations = useMemo(() => {
    const initialSums = {
      // Group 1
      yezihWerFjotaKfya: 0,
      kotariKiray: 0,
      additionalHisab: 0,
      techemariKfya: 0,
      yezihWer: 0,
      // Group 2
      wuzifKotariKiray: 0,
      wuzifFjota: 0,
      wuzifDerekKoshasha: 0,
      wuzifTechemariKfya: 0,
      kitat: 0,
      wuzifHisab: 0,
      wuzifFjotaKfya: 0,
      // Group 3
      temelashBirr: 0,
      kecreditYetekefele: 0,
      tekilalaYetekefele: 0,
      tekilalaTekefay: 0,
      // Group 4
      consumption: 0,
      // Payment Location Summary fields
      prepaid: 0,
      paidAtOffice: 0,
      paidByBank: {},
      duplicatePayments: 0,
      duplicatePaymentCount: 0,
      totalPaidLocationSum: 0,
      totaladditionalHisab: 0,
      totalwuzifDerekKoshasha: 0,
      totaltekelalaTekefay: 0,
      // >>> ADDED: New fields for bill counts
      prepaidCount: 0,
      paidAtOfficeCount: 0,
      paidByBankCount: {},
      // >>> ADDED: New fields for additional sums by payment location
      prepaidAdditionalHisab: 0,
      prepaidWuzifDerekKoshasha: 0,
      prepaidTekilalaTekefay: 0,
      officeAdditionalHisab: 0,
      officeWuzifDerekKoshasha: 0,
      officeTekilalaTekefay: 0,
      bankAdditionalHisab: {},
      bankWuzifDerekKoshasha: {},
      bankTekilalaTekefay: {},

      // New calculated fields
      prepaidTotalDerekKoshasha: 0,
      officeTotalDerekKoshasha: 0,
      bankTotalDerekKoshasha: {},
      prepaidCheck: 0,
      officeCheck: 0,
      bankCheck: {},
    };

    // if (!readings || readings.length === 0) {
    //   return initialSums;
    // }
    // >>> MODIFIED: Use filteredData instead of readings
    if (!filteredData || filteredData.length === 0) {
      return initialSums;
    }

    // >>> MODIFIED: Use filteredData for the reduction
    const calculatedSums = filteredData.reduce((acc, bill) => {
      //if (bill.moneyCollected && !bill.isVoid) {
      if (!bill.isVoid) {
        acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
        acc.kotariKiray += bill.kotariKiray || 0;
        acc.additionalHisab += bill.additionalHisab || 0;
        acc.techemariKfya += bill.techemariKfya || 0;
        acc.yezihWer += bill.yezihWer || 0;
        acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
        acc.wuzifFjota += bill.wuzifFjota || 0;
        acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
        acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
        acc.kitat += bill.kitat || 0;
        acc.wuzifHisab += bill.wuzifHisab || 0;
        acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
        acc.temelashBirr += bill.temelashBirr || 0;
        acc.kecreditYetekefele += bill.kecreditYetekefele || 0;
        acc.tekilalaYetekefele += bill.tekilalaYetekefele || 0;
        acc.tekilalaTekefay += bill.tekilalaTekefay || 0;
        acc.consumption += bill.consumption || 0;

        const totalPaidAmount = bill.tekilalaYetekefele || 0;
        let duplicatePaymentsIterator = 0;
        const paymentMethodsFound = [];

        // 0. pre paid Payments Check
        if (bill.kecreditYetekefele) {
          paymentMethodsFound.push("Prepaid");
          acc.prepaid += bill.kecreditYetekefele;
          acc.prepaidCount += 1;
          acc.prepaidAdditionalHisab += bill.additionalHisab || 0;
          acc.prepaidWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.prepaidTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.prepaidTotalDerekKoshasha +=
            (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.prepaidCheck +=
            (bill.tekilalaTekefay || 0) - (bill.kecreditYetekefele || 0);
        }
        // 1. Office Payments Check
        if (bill.paidOnFrontOffice) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Office");
          acc.paidAtOffice += totalPaidAmount;
          acc.paidAtOfficeCount += 1;
          // Add additional sums for office
          acc.officeAdditionalHisab += bill.additionalHisab || 0;
          acc.officeWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.officeTekilalaTekefay += bill.tekilalaTekefay || 0;
          // Calculate total fields
          acc.officeTotalDerekKoshasha +=
            (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.officeCheck += (bill.tekilalaTekefay || 0) - totalPaidAmount;
        }

        // 2. Bank Payments Check (Derash)
        if (bill.derashPaid && bill.bankPaidAgentId) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Bank");
          const bankName = getBankName(bill.bankPaidAgentId);
          if (bankName) {
            acc.paidByBank[bankName] =
              (acc.paidByBank[bankName] || 0) + totalPaidAmount;
            acc.paidByBankCount[bankName] =
              (acc.paidByBankCount[bankName] || 0) + 1;

            // Add additional sums for bank
            acc.bankAdditionalHisab[bankName] =
              (acc.bankAdditionalHisab[bankName] || 0) +
              (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankName] =
              (acc.bankWuzifDerekKoshasha[bankName] || 0) +
              (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankName] =
              (acc.bankTekilalaTekefay[bankName] || 0) +
              (bill.tekilalaTekefay || 0);
            acc.bankTotalDerekKoshasha[bankName] =
              (acc.bankTotalDerekKoshasha[bankName] || 0) +
              (bill.wuzifDerekKoshasha || 0) +
              (bill.additionalHisab || 0);
            acc.bankCheck[bankName] =
              (acc.bankCheck[bankName] || 0) +
              (bill.tekilalaTekefay || 0) -
              totalPaidAmount;
          }
        }

        // 3. Bank Payments Check (Unicash)
        if (bill.unicashPaid && bill.uBankPaidAgentId) {
          duplicatePaymentsIterator++;
          paymentMethodsFound.push("Bank");
          const bankName = getBankName(bill.uBankPaidAgentId);
          if (bankName) {
            acc.paidByBank[bankName] =
              (acc.paidByBank[bankName] || 0) + totalPaidAmount;
            acc.paidByBankCount[bankName] =
              (acc.paidByBankCount[bankName] || 0) + 1;

            // Add additional sums for bank
            acc.bankAdditionalHisab[bankName] =
              (acc.bankAdditionalHisab[bankName] || 0) +
              (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankName] =
              (acc.bankWuzifDerekKoshasha[bankName] || 0) +
              (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankName] =
              (acc.bankTekilalaTekefay[bankName] || 0) +
              (bill.tekilalaTekefay || 0);

            acc.bankTotalDerekKoshasha[bankName] =
              (acc.bankTotalDerekKoshasha[bankName] || 0) +
              (bill.wuzifDerekKoshasha || 0) +
              (bill.additionalHisab || 0);
            acc.bankCheck[bankName] =
              (acc.bankCheck[bankName] || 0) +
              (bill.tekilalaTekefay || 0) -
              totalPaidAmount;
          }
        }

        // 4. Duplicate Payment Check
        if (duplicatePaymentsIterator > 1) {
          acc.duplicatePayments += totalPaidAmount;
          acc.duplicatePaymentCount += 1;
        }
      }
      return acc;
    }, initialSums);

    // Calculate Grand Total
    const totalBankPayments = Object.values(calculatedSums.paidByBank).reduce(
      (sum, amount) => sum + amount,
      0
    );

    const totaladditionalHisabs = Object.values(
      calculatedSums.bankAdditionalHisab
    ).reduce((sum, amount) => sum + amount, 0);

    const totalwuzifDerekKoshasha = Object.values(
      calculatedSums.bankWuzifDerekKoshasha
    ).reduce((sum, amount) => sum + amount, 0);

    const totaltekelalaTekefay = Object.values(
      calculatedSums.bankTekilalaTekefay
    ).reduce((sum, amount) => sum + amount, 0);

    calculatedSums.totalPaidLocationSum =
      calculatedSums.paidAtOffice + totalBankPayments + calculatedSums.prepaid;

    calculatedSums.totaladditionalHisab =
      calculatedSums.officeAdditionalHisab +
      totaladditionalHisabs +
      calculatedSums.prepaidAdditionalHisab;

    calculatedSums.totalwuzifDerekKoshasha =
      calculatedSums.officeWuzifDerekKoshasha +
      totalwuzifDerekKoshasha +
      calculatedSums.prepaidWuzifDerekKoshasha;

    calculatedSums.totaltekelalaTekefay =
      calculatedSums.officeTekilalaTekefay +
      totaltekelalaTekefay +
      calculatedSums.prepaidTekilalaTekefay;

    return calculatedSums;
  }, [filteredData]);

  const handleViewBillDetails = (billData) => {
    setViewedBill(billData);
    setViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setViewedBill(null);
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "billingInvoiceNumber",
        header: "Invoice Number",
      },
      {
        // NEW COLUMN: Customer Name
        accessorKey: "customerFullName",
        header: "Customer Name",
      },
      {
        // NEW COLUMN: Account Number
        accessorKey: "customerAccountNumber",
        header: "Account Number",
      },
      {
        accessorKey: "id",
        header: "DB ID",
      },
      {
        accessorKey: "lastReading",
        header: "Last Reading",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "previousReading",
        header: "Previous Reading",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "consumption",
        header: "Consumption",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "kifyaWer",
        header: "Kifya Wer (Month)",
      },
      {
        accessorKey: "yezihWerFjotaKfya",
        header: "Current Month Fee",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "kotariKiray",
        header: "Kotari Kiray",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "additionalHisab",
        header: "Additional Hisab",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "techemariKfya",
        header: "Techemari Kfya",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "yezihWer",
        header: "Yezih Wer",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "wuzifHisab",
        header: "Wuzif Hisab",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "wuzifDerekKoshasha",
        header: "Wuzif Derek Koshasha",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "tekilalaTekefay",
        header: "Total Payable",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "moneyCollected",
        header: "Money Collected",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
      {
        accessorKey: "isVoid",
        header: "Is Void",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
      // Existing New columns from the latest DTO
      {
        accessorKey: "kitat",
        header: "Kitat",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "wuzifTechemariKfya",
        header: "Wuzif Techemari Kfya",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "consumptionWuzif",
        header: "Consumption Wuzif",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(),
      },
      {
        accessorKey: "wuzifKotariKiray",
        header: "Wuzif Kotari Kiray",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "wuzifFjota",
        header: "Wuzif Fjota",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "temelashBirr",
        header: "Temelash Birr",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "kecreditYetekefele",
        header: "Kecredit Yetekefele",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "tekilalaYetekefele",
        header: "Tekilala Yetekefele",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        accessorKey: "tekilalaBankYetekefele",
        header: "Tekilala Bank Yetekefele",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      // NEW COLUMN
      {
        accessorKey: "wuzifFjotaKfya",
        header: "Wuzif Fjota Kfya",
        Cell: ({ cell }) => cell.getValue()?.toFixed(2),
      },
      {
        // Added isBillGenerated column
        accessorKey: "isBillGenerated",
        header: "Bill Generated",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: filteredData,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Failed to load bills." }
      : undefined,
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <Box>
        <Tooltip title="View Details">
          <IconButton onClick={() => handleViewBillDetails(row.original)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Bill List" />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="month-select-label">Month</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedKifyaWerMonth}
                  label="Month"
                  onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
                >
                  {ethiopianMonths.map((month, index) => (
                    <MenuItem key={index} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="year-select-label">Year</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedKifyaWerYear}
                  label="Year"
                  onChange={(e) => setSelectedKifyaWerYear(e.target.value)}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={handleFilterClick}
                disabled={
                  !selectedKifyaWerMonth || !selectedKifyaWerYear || isLoading
                }
              >
                Filter Bills
              </Button>

              {/* >>> ADDED: New client-side filter controls */}
              <FormControlLabel
                sx={{ ml: 1 }}
                control={
                  <Checkbox
                    checked={filterDerashPaid}
                    onChange={(e) => setFilterDerashPaid(e.target.checked)}
                    name="derashPaid"
                  />
                }
                label="Derash Paid"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterPaidOnFrontOffice}
                    onChange={(e) =>
                      setFilterPaidOnFrontOffice(e.target.checked)
                    }
                    name="paidOnFrontOffice"
                  />
                }
                label="Office Paid"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterUnicashPaid}
                    onChange={(e) => setFilterUnicashPaid(e.target.checked)}
                    name="unicashPaid"
                  />
                }
                label="Unicash Paid"
              />
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel id="money-collected-filter-label">
                  Collection Status
                </InputLabel>
                <Select
                  labelId="money-collected-filter-label"
                  value={filterMoneyCollected}
                  label="Collection Status"
                  onChange={(e) => setFilterMoneyCollected(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Money Collected</MenuItem>
                  <MenuItem value="false">Not Collected</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <MaterialReactTable table={table} />
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Summations (for Collected & Not Voided Bills){" "}
                {selectedKifyaWerMonth} - {selectedKifyaWerYear}
              </Typography>
              <TableContainer component={Paper} elevation={2} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        Group 1: የዚህ ወር
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>የውሃ ፍጆታ ብር</TableCell>
                      <TableCell>ቆጣሪ ኪራይ</TableCell>
                      <TableCell>ተጨማሪ ክፍያ</TableCell>
                      <TableCell>ጠቅላላ ድምር</TableCell>
                      <TableCell>Check ጠቅላላ ድምር</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.yezihWerFjotaKfya.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.kotariKiray.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.techemariKfya.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.yezihWer.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.yezihWerFjotaKfya +
                          summations.techemariKfya +
                          summations.kotariKiray
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper} elevation={2} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        Group 2: ውዝፍ
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ውዝፍ ቆጣሪ ኪራይ A</TableCell>
                      <TableCell>(ውዝፍ ተጨማሪ ክፍያ) B</TableCell>
                      <TableCell>ቅጣት C</TableCell>
                      <TableCell>ውዝፍ ፍጆታ ክፍያ D</TableCell>
                      <TableCell>ውዝፍ ጠቅላላ sum(A+C+D)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.wuzifKotariKiray.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.wuzifTechemariKfya.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.kitat.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.wuzifFjotaKfya.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.wuzifKotariKiray +
                          summations.kitat +
                          summations.wuzifFjotaKfya
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <TableContainer component={Paper} elevation={2} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ውዝፍ ጠቅላላ direct</TableCell>
                      <TableCell>ውዝፍ ጠቅላላ sum(A+D)</TableCell>
                      <TableCell>old ውዝፍ /diff/</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", color: "red" }}>
                        {summations.wuzifHisab.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold", color: "red" }}>
                        {(
                          summations.wuzifKotariKiray +
                          summations.wuzifFjotaKfya
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "red" }}>
                        {(
                          summations.wuzifKotariKiray +
                          summations.wuzifFjotaKfya -
                          summations.wuzifHisab
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper} elevation={2} sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        Group 3: ማጠቃለያ
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ጠቅላላ ተከፋይ expected</TableCell>
                      <TableCell>ከተቀማጭ የተከፈለ A</TableCell>
                      <TableCell>ጠቅላላ የተከፈለ B</TableCell>
                      <TableCell> ጠቅላላ ድምር A+B </TableCell>
                      <TableCell> ቀጥታ ጠቅላላ ድምር(ደረቅ ቆሻሻ ሲቀነስ)</TableCell>
                      <TableCell> ድምር ደረቅ ቆሻሻ </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.tekilalaTekefay.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.kecreditYetekefele.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.tekilalaYetekefele.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.tekilalaYetekefele +
                          summations.kecreditYetekefele
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.wuzifKotariKiray +
                          summations.kitat +
                          summations.wuzifFjotaKfya +
                          summations.yezihWerFjotaKfya +
                          summations.techemariKfya +
                          summations.kotariKiray
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.tekilalaYetekefele +
                          summations.kecreditYetekefele -
                          (summations.wuzifKotariKiray +
                            summations.kitat +
                            summations.wuzifFjotaKfya +
                            summations.yezihWerFjotaKfya +
                            summations.techemariKfya +
                            summations.kotariKiray)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <TableContainer component={Paper} elevation={2}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        align="center"
                        sx={{ fontWeight: "bold" }}
                      >
                        Group 4: ተመላሽ ፤ ፍጃታ ፤ ደረቅ ቆሻሻ
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>ተመላሽ ብር</TableCell>
                      <TableCell>የዚህ ወር ፍጆታ</TableCell>
                      <TableCell>ውዝፍ ፍጆታ</TableCell>
                      <TableCell>የዚህ ወር ደረቅ ቆሻሻ</TableCell>
                      <TableCell>ውዝፍ ደረቅ ቆሻሻ</TableCell>
                      <TableCell> ድምር ደረቅ ቆሻሻ </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.temelashBirr.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.consumption.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.wuzifFjota.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>

                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.additionalHisab.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {summations.wuzifDerekKoshasha.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        {(
                          summations.wuzifDerekKoshasha +
                          summations.additionalHisab
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
            {/* 2 summation segment */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Payment Location Summary
              </Typography>
              <TableContainer
                component={Paper}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "auto",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                      >
                        Payment Location
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="center"
                      >
                        No. of Bills
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Total Amount (ETB)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Additional Hisab
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Wuzif Derek Koshasha
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Total Derek Koshasha
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Tekilala Tekefay
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "common.white",
                          backgroundColor: "primary.main",
                        }}
                        align="right"
                      >
                        Check
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: "background.paper" }}>
                      <TableCell>Prepaid</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {summations.prepaidCount}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {summations.prepaid.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidAdditionalHisab.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidWuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", bgcolor: "action.selected" }}
                      >
                        {summations.prepaidTotalDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.prepaidTekilalaTekefay.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            summations.prepaidCheck < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {summations.prepaidCheck.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>ቢሮ የተከፈለ</TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {summations.paidAtOfficeCount}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        {summations.paidAtOffice.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeAdditionalHisab.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeWuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", bgcolor: "action.selected" }}
                      >
                        {summations.officeTotalDerekKoshasha.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {summations.officeTekilalaTekefay.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          color:
                            summations.officeCheck < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {summations.officeCheck.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>

                    {Object.entries(summations.paidByBank).map(
                      ([bankName, amount], index) => (
                        <TableRow
                          key={bankName}
                          sx={{
                            bgcolor:
                              index % 2 === 0
                                ? "background.paper"
                                : "action.hover",
                          }}
                        >
                          <TableCell>{bankName}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: "bold" }}>
                            {summations.paidByBankCount[bankName] || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            {amount.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankAdditionalHisab[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankWuzifDerekKoshasha[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "action.selected",
                            }}
                          >
                            {summations.bankTotalDerekKoshasha[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell align="right">
                            {summations.bankTekilalaTekefay[
                              bankName
                            ]?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            }) || "0.00"}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              color:
                                (summations.bankCheck[bankName] || 0) < 0
                                  ? "error.main"
                                  : "success.main",
                            }}
                          >
                            {(
                              summations.bankCheck[bankName] || 0
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow
                      sx={{
                        "& td": {
                          fontWeight: "bold",
                          bgcolor: "background.default",
                        },
                      }}
                    >
                      <TableCell>Total Bank Payments</TableCell>
                      <TableCell align="center">
                        {Object.values(summations.paidByBankCount).reduce(
                          (a, b) => a + b,
                          0
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.paidByBank)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankAdditionalHisab)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankWuzifDerekKoshasha)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ bgcolor: "action.selected" }}
                      >
                        {(
                          Object.values(
                            summations.bankWuzifDerekKoshasha
                          ).reduce((a, b) => a + b, 0) +
                          Object.values(summations.bankAdditionalHisab).reduce(
                            (a, b) => a + b,
                            0
                          )
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {Object.values(summations.bankTekilalaTekefay)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            Object.values(summations.bankCheck).reduce(
                              (a, b) => a + b,
                              0
                            ) < 0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {Object.values(summations.bankCheck)
                          .reduce((a, b) => a + b, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                      </TableCell>
                    </TableRow>

                    <TableRow
                      sx={{
                        "& td, & th": {
                          borderTop: "2px solid rgba(224, 224, 224, 1)",
                          bgcolor: "background.default",
                        },
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        Grand Total
                      </TableCell>
                      <TableCell align="center"></TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totalPaidLocationSum.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totaladditionalHisab.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totalwuzifDerekKoshasha.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.05em",
                          bgcolor: "action.selected",
                        }}
                      >
                        {(
                          summations.totalwuzifDerekKoshasha +
                          summations.totaladditionalHisab
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", fontSize: "1.05em" }}
                      >
                        {summations.totaltekelalaTekefay.toLocaleString(
                          "en-US",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: "bold",
                          fontSize: "1.05em",
                          color:
                            summations.totaltekelalaTekefay -
                              summations.totalPaidLocationSum <
                              0
                              ? "error.main"
                              : "success.main",
                        }}
                      >
                        {(
                          summations.totaltekelalaTekefay -
                          summations.totalPaidLocationSum
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        colSpan={8}
                        style={{ padding: "4px 0", border: "none" }}
                      />
                    </TableRow>

                    <TableRow
                      sx={{
                        "& td, & th": { border: "none" },
                        bgcolor: "error.light",
                      }}
                    >
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                      >
                        Duplicate Payments
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="center"
                      >
                        {summations.duplicatePaymentCount}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicatePayments.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateAdditionalHisab?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateWuzifDerekKoshasha?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: "error.main",
                          bgcolor: "action.selected",
                        }}
                        align="right"
                      >
                        {(
                          summations.duplicateWuzifDerekKoshasha ||
                          0 + summations.duplicateAdditionalHisab ||
                          0
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateTekilalaTekefay?.toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        ) || "0.00"}
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}
                        align="right"
                      >
                        {summations.duplicateCheck?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        }) || "0.00"}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <ViewBillDetailModal
        open={viewModalOpen}
        onClose={handleCloseModal}
        bill={viewedBill}
      />
    </>
  );
};

const queryClient = new QueryClient();

const BillListPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillList />
  </QueryClientProvider>
);

export default BillListPage;
