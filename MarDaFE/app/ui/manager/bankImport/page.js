"use client";
import React, { useState, useEffect, useMemo } from "react";
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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Corrected typo here, was "reactify/dist/ReactToastify.css"
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import authHeader from "../../../lib/authHeader/authhheader";
import getAccesToken from "../../../lib/getToken";
var ethiopianDate = require("ethiopian-date");
import { baseURL } from "../../../lib/httpCommon/http-common";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const ImportReadingsPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadLogs, setUploadLogs] = useState([]);
  const [noPreviousReadingEntries, setNoPreviousReadingEntries] = useState([]);
  const [successCount, setSuccessCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");

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

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
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

    setUploading(true);
    setUploadLogs([]);
    setNoPreviousReadingEntries([]);
    setSuccessCount(0);
    setFailedCount(0);

    const formData = new FormData();
    formData.append("file", selectedFile);

    const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
    formData.append("kifyaWer", kifyaWerFormatted);

    try {
      //   const user_accessToken = getAccesToken();
      //   const response = await axios.post(
      //     `${commonUrl}readings/import`,
      //     formData,
      //     {
      //       headers: {
      //         ...authHeader(user_accessToken),
      //         "Content-Type": "multipart/form-data",
      //       },
      //     }
      //   );

      const user_accessToken = getAccesToken();
      const response = await axios.post(
        `${commonUrl}bankpaymentsimport`,
        formData,
        {
          headers: {
            ...authHeader(user_accessToken),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadLogs(response.data.importLogs);
      setNoPreviousReadingEntries(response.data.noPreviousReadingEntries);
      setSuccessCount(response.data.successCount);
      setFailedCount(response.data.failedCount);

      if (
        response.data.failedCount === 0 &&
        response.data.importLogs.every((log) => !log.startsWith("ERROR"))
      ) {
        toast.success("File uploaded and processed successfully!");
      } else {
        toast.warn("File processed with some issues. Check logs.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage = error.response?.data?.importLogs
        ? error.response.data.importLogs.join("\n")
        : error.message;
      setUploadLogs(["Error during upload: " + errorMessage]);
      toast.error("File upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Import Bank Payments" />

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Import Bank Payments (CSV)
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Please upload a CSV file of bank payments. Required headers:
          customer_id, bill_id (optional), paid_amount, paid_date, agent_name, agent_confirmation_code.
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxWidth: 400,
          }}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={{
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="month-select-label">Billing Month</InputLabel>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={selectedKifyaWerMonth}
              label="Billing Month"
              onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}
            >
              {ethiopianMonths.map((month, index) => (
                <MenuItem key={index} value={month}>
                  {month}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="year-select-label">Billing Year</InputLabel>
            <Select
              labelId="year-select-label"
              id="year-select"
              value={selectedKifyaWerYear}
              label="Billing Year"
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
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              uploading ||
              !selectedKifyaWerMonth ||
              !selectedKifyaWerYear
            }
            startIcon={
              uploading && <CircularProgress size={20} color="inherit" />
            }
            sx={{ mt: 2 }}
          >
            {uploading ? "Uploading..." : "Upload & Process Payments"}
          </Button>
        </Box>

        {(uploadLogs.length > 0 || noPreviousReadingEntries.length > 0) && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Import Summary:
            </Typography>
            <Typography>
              <strong>Successful Imports:</strong> {successCount}
            </Typography>
            <Typography>
              <strong>Failed Imports:</strong> {failedCount}
            </Typography>

            {uploadLogs.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mt: 2,
                  maxHeight: 300,
                  overflowY: "auto",
                  bgcolor: "#f0f0f0",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  Detailed Logs:
                </Typography>
                {uploadLogs.map((log, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      color: log.startsWith("ERROR")
                        ? "error.main"
                        : log.startsWith("WARN")
                          ? "warning.main"
                          : "text.primary",
                    }}
                  >
                    {log}
                  </Typography>
                ))}
              </Paper>
            )}

            {noPreviousReadingEntries.length > 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mt: 2,
                  maxHeight: 300,
                  overflowY: "auto",
                  bgcolor: "#fff3e0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="warning.dark"
                >
                  Customers with No Previous Reading (Assumed 0):
                </Typography>
                <List dense>
                  {noPreviousReadingEntries.map((entry, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText
                        primary={`Account: ${entry.accountNumber}`}
                        secondary={entry.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>
        )}
      </Paper>
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
