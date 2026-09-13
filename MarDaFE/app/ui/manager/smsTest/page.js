"use client";
import { useState } from "react";
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { SmsService } from "../../../lib/smsService";

const smsService = new SmsService();

const SmsTestForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const { mutateAsync: sendTestSms, isLoading } = useMutation({
    mutationFn: (payload) => smsService.sendTestSms(payload),
    onSuccess: () => {
      toast.success("SMS sent successfully");
    },
    onError: (error) => {
      toast.error(`Error: ${error?.response?.data || error.message}`);
    },
  });

  const { mutateAsync: sendTestSmsViaJasmin, isLoading: isLoadingJasmin } =
    useMutation({
      mutationFn: (payload) => smsService.sendTestSmsViaJasmin(payload),
      onSuccess: () => {
        toast.success("SMS via Jasmin sent successfully");
      },
      onError: (error) => {
        toast.error(`Error (Jasmin): ${error?.response?.data || error.message}`);
      },
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!phoneNumber || !message) {
      toast.error("Phone number and message are required");
      return;
    }
    await sendTestSms({ phoneNumber, message });
  };

  const handleJasminClick = async () => {
    if (!phoneNumber || !message) {
      toast.error("Phone number and message are required");
      return;
    }
    await sendTestSmsViaJasmin({ phoneNumber, message });
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="SMS Test" />
      <Grid container spacing={2} mt={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" mb={2}>
              Send Test SMS
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                margin="normal"
                multiline
                minRows={3}
              />
              <Box mt={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || isLoadingJasmin}
                >
                  {isLoading ? "Sending..." : "Send SMS"}
                </Button>
                <Button
                  sx={{ ml: 2, mt: { xs: 2, md: 0 } }}
                  type="button"
                  variant="outlined"
                  disabled={isLoading || isLoadingJasmin}
                  onClick={handleJasminClick}
                >
                  {isLoadingJasmin ? "Sending via Jasmin..." : "Send via Jasmin"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

const queryClient = new QueryClient();

const SmsTestPage = () => (
  <QueryClientProvider client={queryClient}>
    <SmsTestForm />
  </QueryClientProvider>
);

export default SmsTestPage;
