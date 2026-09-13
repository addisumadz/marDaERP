"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { CompanyProfileService } from "../../../lib/companyProfileService";
import EtDatePicker from "habesha-datepicker";

// Icons
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DateRangeIcon from "@mui/icons-material/DateRange";
import PaymentIcon from "@mui/icons-material/Payment";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";

const svc = new CompanyProfileService();

// Ethiopian Date Picker using habesha-datepicker directly
const EthiopianDatePicker = ({ value, onChange, label }) => {
  const handleDateChange = (newDate) => {
    if (newDate) {
      onChange(newDate.toISOString().split("T")[0]);
    } else {
      onChange(null);
    }
  };

  return (
    <EtDatePicker
      label={label}
      value={value ? new Date(value) : null}
      onChange={handleDateChange}
    />
  );
};

const BillingSetting = () => {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState({
    activeReadingDate: null,
    activeBillingMonth: null,
    officePaymentOpen: false,
    restrictWithSystemSettingDay: false,
  });

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["company-profile-latest"],
    queryFn: async () => {
      const latest = await svc.getLatest();
      const hasLatest = latest && typeof latest === "object" && Object.keys(latest).length > 0;
      if (hasLatest) return latest;
      try {
        return await svc.getById(9);
      } catch (e) {
        return latest;
      }
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data) {
      const payload = data && typeof data === "object" && "data" in data && data.data && typeof data.data === "object"
        ? data.data
        : data;
      const plain = payload ? { ...payload } : null;
      setProfile(plain);
      if (plain) {
        setDraft({
          activeReadingDate: plain.activeReadingDate || null,
          activeBillingMonth: plain.activeBillingMonth || null,
          officePaymentOpen: !!plain.officePaymentOpen,
          restrictWithSystemSettingDay: plain.filename3 === "1",
        });
      }
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => svc.update(id, payload),
    onSuccess: () => {
      toast.success("Billing settings updated successfully!");
      queryClient.invalidateQueries(["company-profile-latest"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update billing settings");
    },
  });

  const handleFieldChange = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!profile?.id) {
      toast.error("No company profile was resolved to update.");
      return;
    }

    // Merge the draft values into the complete profile payload to preserve other fields
    const payload = {
      ...profile,
      activeReadingDate: draft.activeReadingDate,
      activeBillingMonth: draft.activeBillingMonth,
      officePaymentOpen: draft.officePaymentOpen,
      filename3: draft.restrictWithSystemSettingDay ? "1" : "0",
    };

    updateMutation.mutate({ id: profile.id, payload });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="error" variant="h6" gutterBottom>
            Error Resolving Billing Settings
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Could not retrieve active billing records from the company profile.
          </Typography>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => refetch()}>
            Retry
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 2 }}>
      <Breadcrumb pageName="Billing Setting" />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Header Section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Billing & System Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update billing months, target reading calendar date ranges, and office collections access.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
              disabled={isFetching}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              {isFetching ? "Syncing..." : "Sync"}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={updateMutation.isPending}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
                boxShadow: "0 4px 14px 0 rgba(79, 70, 229, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca 0%, #2563eb 100%)",
                  boxShadow: "0 6px 20px 0 rgba(79, 70, 229, 0.4)",
                },
              }}
            >
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Active Billing Period Card */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <CalendarMonthIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Active Billing Period Settings
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Configure active months and calendar dates for billing runs and collections. 
                  These target dates align reader registration dates and bills calculations.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                          Active Billing Month
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                          The current month segment for active bills preparation and generation.
                        </Typography>
                      </Box>
                      <Box sx={{ "& .MuiTextField-root": { width: "100%" } }}>
                        <EthiopianDatePicker
                          value={draft.activeBillingMonth}
                          onChange={(newValue) => handleFieldChange("activeBillingMonth", newValue)}
                          label="Ethiopian Billing Month"
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                          Active Reading Date
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                          The current reading date segment for registered reader logs.
                        </Typography>
                      </Box>
                      <Box sx={{ "& .MuiTextField-root": { width: "100%" } }}>
                        <EthiopianDatePicker
                          value={draft.activeReadingDate}
                          onChange={(newValue) => handleFieldChange("activeReadingDate", newValue)}
                          label="Ethiopian Reading Date"
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Authorization Card */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <PaymentIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Collections & Payment Access
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enable or disable standard cashier manual bill collections inside the physical office branch.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    border: "1px solid",
                    borderColor: draft.officePaymentOpen ? "rgba(16, 185, 129, 0.2)" : "grey.200",
                    bgcolor: draft.officePaymentOpen ? "rgba(16, 185, 129, 0.02)" : "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                      Office Payment Authorization
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      When enabled, cashier roles are permitted to receive payments and process manual entries.
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={draft.officePaymentOpen}
                        onChange={(e) => handleFieldChange("officePaymentOpen", e.target.checked)}
                        color="success"
                      />
                    }
                    label={draft.officePaymentOpen ? "Open" : "Closed"}
                    labelPlacement="start"
                    sx={{
                      m: 0,
                      "& .MuiTypography-root": {
                        fontWeight: 700,
                        mr: 1,
                        color: draft.officePaymentOpen ? "success.dark" : "text.secondary",
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Restrict with System Setting Day Card */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <EventRepeatIcon color="primary" sx={{ fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    System Day Restriction
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Control whether billing operations are restricted to the system-configured setting day.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    border: "1px solid",
                    borderColor: draft.restrictWithSystemSettingDay ? "rgba(16, 185, 129, 0.2)" : "grey.200",
                    bgcolor: draft.restrictWithSystemSettingDay ? "rgba(16, 185, 129, 0.02)" : "grey.50",
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ pr: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}>
                      Restrict with System Setting Day
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      When enabled, billing day operations are restricted to the configured system setting day only.
                    </Typography>
                  </Box>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={draft.restrictWithSystemSettingDay}
                        onChange={(e) => handleFieldChange("restrictWithSystemSettingDay", e.target.checked)}
                        color="success"
                      />
                    }
                    label={draft.restrictWithSystemSettingDay ? "On" : "Off"}
                    labelPlacement="start"
                    sx={{
                      m: 0,
                      "& .MuiTypography-root": {
                        fontWeight: 700,
                        mr: 1,
                        color: draft.restrictWithSystemSettingDay ? "success.dark" : "text.secondary",
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
    </Box>
  );
};

const queryClient = new QueryClient();

const BillingSettingWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <BillingSetting />
  </QueryClientProvider>
);

export default BillingSettingWrapper;
