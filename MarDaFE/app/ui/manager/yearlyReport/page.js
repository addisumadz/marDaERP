"use client";

import { useMemo, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
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
  Card,
  CardContent,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "../../../lib/ReadingService";
import { CampanyProfileService } from "../../../lib/campanyProfileService";
import { DropdownService } from "../../../lib/dropdownService";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./nyala-normal"; // register Nyala font for Amharic

var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const campanyProfileService = new CampanyProfileService();
const dropdownService = new DropdownService();

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
];

const yearOptions = [2014, 2015, 2016, 2017, 2018, 2019, 2020];

const fmt = (v) => {
  if (v == null) return "0";
  return Number(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const fmtInt = (v) => {
  if (v == null) return "0";
  return Number(v).toLocaleString("en-US");
};

const YearlyReport = () => {
  const currentGregorianDate = new Date();
  const [ethYear] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const [fromYear, setFromYear] = useState(String(ethYear) || "");
  const [fromMonth, setFromMonth] = useState(1); // 1-based index
  const [toYear, setToYear] = useState(String(ethYear) || "");
  const [toMonth, setToMonth] = useState(12);
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  // Fetch dropdown data for filters
  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
  });

  // Fetch company profile
  const { data: companyProfile } = useQuery({
    queryKey: ["companyProfileByStatus", "Active"],
    queryFn: async () => {
      try {
        const res = await campanyProfileService.getCompanyProfileByStatus("Active");
        const payload = res?.data || res;
        const list = Array.isArray(payload) ? payload : payload?.data || [];
        return Array.isArray(list) && list.length > 0 ? list[0] : null;
      } catch (e) {
        console.error("Failed to fetch company profile:", e);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch report data
  const {
    data: reportData = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["yearlyConsumption", fromYear, fromMonth, toYear, toMonth, selectedCustomerTypeId, selectedBranchId],
    queryFn: async () => {
      const resp = await readingService.getYearlyConsumptionReport(
        Number(fromYear),
        fromMonth,
        Number(toYear),
        toMonth,
        selectedCustomerTypeId || null,
        selectedBranchId || null
      );
      return resp?.data || [];
    },
    enabled: shouldFetch && !!fromYear && !!toYear,
    staleTime: 5 * 60 * 1000,
    onError: (error) => toast.error("Failed to load report: " + error.message),
  });

  // Compute grand totals
  const grandTotals = useMemo(() => {
    const totals = {
      totalConsumption: 0,
      billCount: 0,
      totalYezihWerFjotaKfya: 0,
      totalKitat: 0,
      totalWuzifHisab: 0,
      totalTekilalaTekefay: 0,
      totalTekilalaYetekefele: 0,
      totalKecreditYetekefele: 0,
    };
    (reportData || []).forEach((row) => {
      totals.totalConsumption += Number(row.totalConsumption || 0);
      totals.billCount += Number(row.billCount || 0);
      totals.totalYezihWerFjotaKfya += Number(row.totalYezihWerFjotaKfya || 0);
      totals.totalKitat += Number(row.totalKitat || 0);
      totals.totalWuzifHisab += Number(row.totalWuzifHisab || 0);
      totals.totalTekilalaTekefay += Number(row.totalTekilalaTekefay || 0);
      totals.totalTekilalaYetekefele += Number(row.totalTekilalaYetekefele || 0);
      totals.totalKecreditYetekefele += Number(row.totalKecreditYetekefele || 0);
    });
    return totals;
  }, [reportData]);

  const handleFilter = () => {
    if (!fromYear || !toYear) {
      toast.info("Please select both years.");
      return;
    }
    if (Number(fromYear) > Number(toYear) || (fromYear === toYear && fromMonth > toMonth)) {
      toast.info("Start date must be before or equal to end date.");
      return;
    }
    setShouldFetch(true);
    refetch();
  };

  // ── Table columns ──
  const columns = useMemo(
    () => [
      {
        accessorKey: "kifyaWer",
        header: "ክፍያ ወር",
        size: 150,
      },
      {
        accessorKey: "billCount",
        header: "ደረሰኝ ብዛት",
        size: 110,
        Cell: ({ cell }) => fmtInt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmtInt(grandTotals.billCount)}</Typography>
        ),
      },
      {
        accessorKey: "totalConsumption",
        header: "ፍጆታ (ኪ.ሜ³)",
        size: 130,
        Cell: ({ cell }) => fmtInt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmtInt(grandTotals.totalConsumption)}</Typography>
        ),
      },
      {
        accessorKey: "totalYezihWerFjotaKfya",
        header: "የዚህ ወር ፍ.ክፍያ",
        size: 140,
        Cell: ({ cell }) => fmt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmt(grandTotals.totalYezihWerFjotaKfya)}</Typography>
        ),
      },
      {
        accessorKey: "totalKitat",
        header: "ቅጣት",
        size: 110,
        Cell: ({ cell }) => fmt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmt(grandTotals.totalKitat)}</Typography>
        ),
      },
      {
        accessorKey: "totalWuzifHisab",
        header: "ውዝፍ ሂሳብ",
        size: 120,
        Cell: ({ cell }) => fmt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmt(grandTotals.totalWuzifHisab)}</Typography>
        ),
      },
      {
        id: "tekilalaTekefayCombined",
        header: "ጠቅላላ ተከፋይ",
        size: 140,
        accessorFn: (row) => Number(row.totalTekilalaTekefay || 0) + Number(row.totalKecreditYetekefele || 0),
        Cell: ({ cell }) => fmt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmt(grandTotals.totalTekilalaTekefay + grandTotals.totalKecreditYetekefele)}</Typography>
        ),
      },
      {
        id: "tekilalaYetekefeleCombined",
        header: "ጠቅላላ የተከፈለ",
        size: 140,
        accessorFn: (row) => Number(row.totalTekilalaYetekefele || 0) + Number(row.totalKecreditYetekefele || 0),
        Cell: ({ cell }) => fmt(cell.getValue()),
        Footer: () => (
          <Typography fontWeight="bold">{fmt(grandTotals.totalTekilalaYetekefele + grandTotals.totalKecreditYetekefele)}</Typography>
        ),
      },
    ],
    [grandTotals]
  );

  const table = useMaterialReactTable({
    columns,
    data: reportData || [],
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enablePagination: false,
    enableBottomToolbar: true,
    enableSorting: false,
    muiTableContainerProps: { sx: { maxHeight: "60vh" } },
    muiTableBodyCellProps: { sx: { py: 0.5, fontSize: "0.85rem" } },
    muiTableHeadCellProps: {
      sx: { fontWeight: "bold", fontSize: "0.8rem", py: 1 },
    },
    muiTableFooterCellProps: {
      sx: { fontWeight: "bold", fontSize: "0.85rem", py: 1, backgroundColor: "#f5f5f5" },
    },
    initialState: { density: "compact" },
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          color="success"
          onClick={handleExportExcel}
          disabled={!reportData?.length}
        >
          Export Excel
        </Button>
        <Button
          variant="contained"
          size="small"
          color="error"
          onClick={handleExportPDF}
          disabled={!reportData?.length}
        >
          Export PDF
        </Button>
      </Box>
    ),
  });

  // ── Load logo for PDF ──
  const loadImageAsBase64 = async (path) => {
    try {
      const res = await fetch(path);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Logo load failed:", e);
      return null;
    }
  };

  // ── Excel Export ──
  const handleExportExcel = () => {
    if (!reportData?.length) return;

    const rows = reportData.map((r, idx) => ({
      "ተ.ቁ": idx + 1,
      "ክፍያ ወር": r.kifyaWer || "",
      "ደረሰኝ ብዛት": r.billCount || 0,
      "ፍጆታ (ሜ³)": r.totalConsumption || 0,
      "የዚህ ወር ፍ.ክፍያ": r.totalYezihWerFjotaKfya || 0,
      "ቅጣት": r.totalKitat || 0,
      "ውዝፍ ሂሳብ": r.totalWuzifHisab || 0,
      "ጠቅላላ ተከፋይ": (Number(r.totalTekilalaTekefay || 0) + Number(r.totalKecreditYetekefele || 0)),
      "ጠቅላላ የተከፈለ": (Number(r.totalTekilalaYetekefele || 0) + Number(r.totalKecreditYetekefele || 0)),
    }));

    // Add totals row
    rows.push({
      "ተ.ቁ": "",
      "ክፍያ ወር": "ድምር",
      "ደረሰኝ ብዛት": grandTotals.billCount,
      "ፍጆታ (ሜ³)": grandTotals.totalConsumption,
      "የዚህ ወር ፍ.ክፍያ": grandTotals.totalYezihWerFjotaKfya,
      "ቅጣት": grandTotals.totalKitat,
      "ውዝፍ ሂሳብ": grandTotals.totalWuzifHisab,
      "ጠቅላላ ተከፋይ": grandTotals.totalTekilalaTekefay + grandTotals.totalKecreditYetekefele,
      "ጠቅላላ የተከፈለ": grandTotals.totalTekilalaYetekefele + grandTotals.totalKecreditYetekefele,
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set auto-spaced column widths for Excel
    ws["!cols"] = [
      { wch: 8 },  // ተ.ቁ
      { wch: 18 }, // ክፍያ ወር
      { wch: 15 }, // ደረሰኝ ብዛት
      { wch: 16 }, // ፍጆታ (ሜ³)
      { wch: 20 }, // የዚህ ወር ፍ.ክፍያ
      { wch: 16 }, // ቅጣት
      { wch: 20 }, // ውዝፍ ሂሳብ
      { wch: 22 }, // ጠቅላላ ተከፋይ
      { wch: 22 }, // ጠቅላላ የተከፈለ
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Yearly Report");
    const filename = `Yearly_Report_${ethiopianMonths[fromMonth - 1]}_${fromYear}_to_${ethiopianMonths[toMonth - 1]}_${toYear}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success("Excel exported successfully!");
  };

  // ── PDF Export (Printer-friendly, No Colors / Monochrome) ──
  const handleExportPDF = async () => {
    if (!reportData?.length) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    // Always use registered "normal" style for Nyala font to ensure proper Amharic rendering
    doc.setFont("nyala", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const MARGIN = 10;
    let yPos = 12;

    // Optional Logo
    const logoBase64 = await loadImageAsBase64("/images/logo/logo.png");
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", MARGIN, yPos - 3, 16, 16);
    }

    // Company Name
    doc.setFontSize(15);
    doc.setFont("nyala", "normal");
    const companyName = companyProfile?.companyName || "የውሃ እና ፍሳሽ አገልግሎት";
    doc.text(companyName, pageWidth / 2, yPos, { align: "center" });
    yPos += 7;

    // Report Title
    doc.setFontSize(13);
    doc.setFont("nyala", "normal");
    doc.text("ዓመታዊ የውሃ ፍጆታ እና የክፍያ ሪፖርት", pageWidth / 2, yPos, { align: "center" });
    yPos += 6;

    // Subtitle: Date range and filter criteria
    doc.setFontSize(9.5);
    doc.setFont("nyala", "normal");
    const rangeText = `የሪፖርት ጊዜ: ${ethiopianMonths[fromMonth - 1]} ${fromYear} - ${ethiopianMonths[toMonth - 1]} ${toYear}`;
    
    const selectedCustTypeObj = customerTypes.find((c) => String(c.id) === String(selectedCustomerTypeId));
    const selectedCustTypeName = selectedCustTypeObj ? (selectedCustTypeObj.name || `Type ${selectedCustTypeObj.id}`) : "ሁሉም";

    const selectedBranchObj = branches.find((b) => String(b.id) === String(selectedBranchId));
    const selectedBranchName = selectedBranchObj ? (selectedBranchObj.name || selectedBranchObj.branchDescription || `Branch ${selectedBranchObj.id}`) : "ሁሉም";

    const filterText = `${rangeText}   |   ቅርንጫፍ: ${selectedBranchName}   |   የደንበኛ ዓይነት: ${selectedCustTypeName}`;
    doc.text(filterText, pageWidth / 2, yPos, { align: "center" });
    yPos += 4;

    // Divider Line
    doc.setLineWidth(0.4);
    doc.line(MARGIN, yPos, pageWidth - MARGIN, yPos);
    yPos += 4;

    const tableHeaders = [
      "ተ.ቁ",
      "ክፍያ ወር",
      "ደረሰኝ ብዛት",
      "ፍጆታ (ሜ³)",
      "የዚህ ወር ፍ.ክፍያ",
      "ቅጣት",
      "ውዝፍ ሂሳብ",
      "ጠቅላላ ተከፋይ",
      "ጠቅላላ የተከፈለ",
    ];

    const tableRows = reportData.map((r, idx) => [
      idx + 1,
      r.kifyaWer || "",
      fmtInt(r.billCount),
      fmtInt(r.totalConsumption),
      fmt(r.totalYezihWerFjotaKfya),
      fmt(r.totalKitat),
      fmt(r.totalWuzifHisab),
      fmt(Number(r.totalTekilalaTekefay || 0) + Number(r.totalKecreditYetekefele || 0)),
      fmt(Number(r.totalTekilalaYetekefele || 0) + Number(r.totalKecreditYetekefele || 0)),
    ]);

    // Add Totals row
    tableRows.push([
      "",
      "ድምር",
      fmtInt(grandTotals.billCount),
      fmtInt(grandTotals.totalConsumption),
      fmt(grandTotals.totalYezihWerFjotaKfya),
      fmt(grandTotals.totalKitat),
      fmt(grandTotals.totalWuzifHisab),
      fmt(grandTotals.totalTekilalaTekefay + grandTotals.totalKecreditYetekefele),
      fmt(grandTotals.totalTekilalaYetekefele + grandTotals.totalKecreditYetekefele),
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableRows,
      startY: yPos,
      theme: "grid",
      margin: { left: MARGIN, right: MARGIN },
      tableWidth: pageWidth - 2 * MARGIN,
      styles: {
        font: "nyala",
        fontStyle: "normal",
        fontSize: 11.5,
        cellPadding: { top: 3.5, bottom: 3.5, left: 3, right: 3 },
        overflow: "linebreak",
        lineColor: [0, 0, 0],
        lineWidth: 0.3,
        textColor: [0, 0, 0],
        valign: "middle",
      },
      headStyles: {
        font: "nyala",
        fontStyle: "normal",
        fontSize: 12,
        fillColor: [240, 240, 240], // Clean light gray for print contrast, no bright colors
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.4,
        halign: "center",
        cellPadding: { top: 4, bottom: 4, left: 2, right: 2 },
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255], // Pure white rows, no alternating colors
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 14 },  // ተ.ቁ
        1: { halign: "center", cellWidth: 30 },  // ክፍያ ወር
        2: { halign: "right",  cellWidth: 26 },  // ደረሰኝ ብዛት
        3: { halign: "right",  cellWidth: 27 },  // ፍጆታ (ሜ³)
        4: { halign: "right",  cellWidth: 36 },  // የዚህ ወር ፍ.ክፍያ
        5: { halign: "right",  cellWidth: 28 },  // ቅጣት
        6: { halign: "right",  cellWidth: 36 },  // ውዝፍ ሂሳብ
        7: { halign: "right",  cellWidth: 40 },  // ጠቅላላ ተከፋይ
        8: { halign: "right",  cellWidth: 40 },  // ጠቅላላ የተከፈለ
      },
      didParseCell: (data) => {
        // Frame the totals row at the bottom
        if (data.section === "body" && data.row.index === tableRows.length - 1) {
          data.cell.styles.font = "nyala";
          data.cell.styles.fontStyle = "normal";
          data.cell.styles.fontSize = 11.5;
          data.cell.styles.fillColor = [240, 240, 240]; // Light gray background for totals row
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.lineWidth = 0.4;
          data.cell.styles.lineColor = [0, 0, 0];
        }
      },
    });

    // Signature / Approval section for official printable reports
    const finalY = doc.lastAutoTable?.finalY || yPos + 100;
    const signY = Math.min(finalY + 14, pageHeight - 22);

    if (signY < pageHeight - 15) {
      doc.setFontSize(10);
      doc.setFont("nyala", "normal");
      doc.setTextColor(0, 0, 0);

      const col1X = MARGIN + 10;
      const col2X = pageWidth / 2 + 15;

      doc.text("ያዘጋጀው: ___________________________", col1X, signY);
      doc.text("ያረጋገጠው: ___________________________", col2X, signY);

      doc.text("ፊርማ: _________   ቀን: _________", col1X, signY + 6);
      doc.text("ፊርማ: _________   ቀን: _________", col2X, signY + 6);
    }

    // Print timestamp and page number at footer bottom
    const printDateY = pageHeight - 6;
    doc.setFontSize(7.5);
    doc.setFont("nyala", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(
      `የታተመበት ቀን: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      MARGIN,
      printDateY
    );
    doc.text(
      "ገጽ 1 / 1",
      pageWidth - MARGIN,
      printDateY,
      { align: "right" }
    );

    const filename = `Yearly_Report_${ethiopianMonths[fromMonth - 1]}_${fromYear}_to_${ethiopianMonths[toMonth - 1]}_${toYear}.pdf`;
    doc.save(filename);
    toast.success("PDF exported successfully!");
  };

  return (
    <>
      <Breadcrumb pageName="ዓመታዊ ፍጆታ ሪፖርት" />
      <ToastContainer position="top-right" autoClose={4000} />

      {/* ── Filter Controls ── */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          {/* From Year */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>ከዓመት</InputLabel>
              <Select
                value={fromYear}
                label="ከዓመት"
                onChange={(e) => {
                  setFromYear(e.target.value);
                  setShouldFetch(false);
                }}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* From Month */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>ከወር</InputLabel>
              <Select
                value={fromMonth}
                label="ከወር"
                onChange={(e) => {
                  setFromMonth(Number(e.target.value));
                  setShouldFetch(false);
                }}
              >
                {ethiopianMonths.map((m, idx) => (
                  <MenuItem key={idx} value={idx + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* To Year */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>እስከ ዓመት</InputLabel>
              <Select
                value={toYear}
                label="እስከ ዓመት"
                onChange={(e) => {
                  setToYear(e.target.value);
                  setShouldFetch(false);
                }}
              >
                {yearOptions.map((y) => (
                  <MenuItem key={y} value={String(y)}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* To Month */}
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>እስከ ወር</InputLabel>
              <Select
                value={toMonth}
                label="እስከ ወር"
                onChange={(e) => {
                  setToMonth(Number(e.target.value));
                  setShouldFetch(false);
                }}
              >
                {ethiopianMonths.map((m, idx) => (
                  <MenuItem key={idx} value={idx + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Customer Type */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>የደንበኛ ዓይነት</InputLabel>
              <Select
                value={selectedCustomerTypeId}
                label="የደንበኛ ዓይነት"
                onChange={(e) => {
                  setSelectedCustomerTypeId(e.target.value);
                  setShouldFetch(false);
                }}
                disabled={isCustomerTypesLoading}
              >
                <MenuItem value="">
                  <em>ሁሉም</em>
                </MenuItem>
                {isCustomerTypesLoading ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : customerTypes?.length > 0 ? (
                  customerTypes.map((ct) => (
                    <MenuItem key={ct.id} value={ct.id}>
                      {ct.name || `Type ${ct.id}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No types found</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Branch */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ቅርንጫፍ</InputLabel>
              <Select
                value={selectedBranchId}
                label="ቅርንጫፍ"
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setShouldFetch(false);
                }}
                disabled={isBranchesLoading}
              >
                <MenuItem value="">
                  <em>ሁሉም</em>
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
          </Grid>

          {/* Filter Button */}
          <Grid item xs={12} sm={3} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleFilter}
              disabled={isLoading}
              sx={{ height: 40 }}
            >
              {isLoading ? <CircularProgress size={22} /> : "ፈልግ"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ── Summary Cards ── */}
      {reportData?.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ጠቅላላ ፍጆታ (ኪ.ሜ³)
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmtInt(grandTotals.totalConsumption)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ደረሰኝ ብዛት
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmtInt(grandTotals.billCount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ጠቅላላ ተከፋይ
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmt(grandTotals.totalTekilalaTekefay)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ጠቅላላ የተከፈለ
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmt(grandTotals.totalTekilalaYetekefele)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ውዝፍ ሂሳብ
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmt(grandTotals.totalWuzifHisab)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
                color: "#fff",
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ቅጣት
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {fmt(grandTotals.totalKitat)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Data Table ── */}
      <Paper sx={{ p: 1 }}>
        {isError && (
          <Typography color="error" sx={{ p: 2 }}>
            Failed to load report data. Please try again.
          </Typography>
        )}
        <MaterialReactTable table={table} />
      </Paper>
    </>
  );
};

const queryClient = new QueryClient();

const YearlyReportPage = () => (
  <QueryClientProvider client={queryClient}>
    <YearlyReport />
  </QueryClientProvider>
);

export default YearlyReportPage;
