"use client";
import { useMemo } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Grid, Paper } from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb"; // Assuming this path is correct
import { ReadingService } from "../../../lib/ReadingService"; // Path to your ReadingService

// Initialize the service
const readingService = new ReadingService();

const BillListActive = () => {
  // Query to fetch readings with status 'ACTIVE'
  const {
    data: readings = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["activeReadings"], // Unique key for this specific query
    queryFn: async () => {
      // Call the new service method to fetch by status only
      const data = await readingService.getReadingsByStatus("active");
      return data;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    onError: (error) => {
      toast.error("Failed to load active bills: " + error.message);
    },
  });

  // Define columns for Material React Table
  const columns = useMemo(
    () => [
      {
        header: "#",
        size: 20,
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "invoiceNumber",
        header: "Invoice Number",
      },
      {
        accessorKey: "lastReading",
        header: "Last Reading",
        Cell: ({ cell }) => cell.getValue()?.toLocaleString(), // Format numbers
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
        Cell: ({ cell }) => cell.getValue()?.toFixed(2), // Format to 2 decimal places
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
        accessorKey: "isMoneyCollected",
        header: "Money Collected",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : "No"),
      },
      // Add more columns as needed from your BillingReadingDTO
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: readings,
    state: {
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isLoading,
    },
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Failed to load active bills." }
      : undefined,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enablePagination: true,
    enableSorting: true,
  });

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Active Bill List" />

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
            ></Box>

            <MaterialReactTable table={table} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

const queryClient = new QueryClient();

const BillListActivePage = () => (
  <QueryClientProvider client={queryClient}>
    <BillListActive />
  </QueryClientProvider>
);

export default BillListActivePage;
