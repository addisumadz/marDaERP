"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CompanyProfileService } from "../../../lib/companyProfileService";
import EtDatePicker, { EthiopianDate } from "habesha-datepicker";

const svc = new CompanyProfileService();

// Ethiopian Date Picker using habesha-datepicker directly
const EthiopianDatePicker = ({ value, onChange, label }) => {
  const handleDateChange = (newDate) => {
    if (newDate) {
      // Convert Date object to ISO string for storage
      onChange(newDate.toISOString().split('T')[0]);
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

const editableKeysBlacklist = new Set([
  // internal or immutable fields
  "id",
  "serialVersionUID",
  // fields to hide from UI
  "status",
  "deleted",
  "activateSecondUser",
  "activateManualMrn",
  "connectedToDerash",
  "connectedToUnicash",
  "billPreparationBrowserId",
  "onBillPreparation",
  "contextBaseIpAddress",
]);

const booleanKeys = new Set([
  "salesWithNegativeStock",
  "activateEmail",
  "activateSms",
  "showImportReadingExcel",
  "activateForceAllRecorded",
  "defaultBillGenerateIsMoneyCollected",
  "connectedToBank",
  "autoGiveAccountNumber",
  "accountNumberTagWithKebele",
  "activateDashboardConnectToDerash",
  "activateUser",
  "connectedToDerash",
  "connectedToUnicash",
  "allowUnderReading",
  "officePaymentOpen",
  "allowNegative",
  "activateManualMrn",
  "overRideMobileReadingMonth",
  "allowEnterReadingWhileOtherMonthNotSentToZgjt",
  "onBillPreparation",
]);

const dateKeys = new Set([
  "activeReadingDate",
  "activeBillingMonth",
]);

const numericKeys = new Set([
  "defaultPageRow",
  "accountNumberKebeleLength",
  "numberOfPaymentDates",
  "numberOfDigitsForCustomer",
  "calendarAddActiveMonthForward",
  "budgetYear",
  "populationSize",
  "averageFamilySize",
  "numberOfBonoHouseholds",
  "totalNumberOfFullTimeStaff",
  "mBillingAdditionalPayment1Value",
  "mBillingAdditionalPayment2Value",
]);

// Keys for the "Additional Bill Income" group – excluded from the generic table
const additionalBillIncomeKeys = [
  {
    labelKey: "mBillingAdditionalPayment1ValueLable",
    valueKey: "mBillingAdditionalPayment1Value",
    optionKey: "mBillingAdditionalPayment1ValueOption",
    title: "Additional Payment 1",
  },
  {
    labelKey: "mBillingAdditionalPayment2ValueLable",
    valueKey: "mBillingAdditionalPayment2Value",
    optionKey: "mBillingAdditionalPayment2ValueOption",
    title: "Additional Payment 2",
  },
];

const additionalBillIncomeKeySet = new Set(
  additionalBillIncomeKeys.flatMap((g) => [g.labelKey, g.valueKey, g.optionKey])
);

const prettyLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/\bUri\b/g, "URI")
    .replace(/\bSms\b/g, "SMS")
    .replace(/\bIp\b/g, "IP");

function CompanyProfileSingle() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);

  const { data, isLoading, isFetching, refetch, isError } = useQuery({
    queryKey: ["company-profile-latest"],
    queryFn: async () => {
      // Try latest first
      const latest = await svc.getLatest();
      const hasLatest = latest && typeof latest === "object" && Object.keys(latest).length > 0;
      if (hasLatest) return latest;
      // Fallback to known ID to preserve prior behavior if latest is missing
      try {
        return await svc.getById(9);
      } catch (e) {
        return latest;
      }
    },
    refetchOnWindowFocus: false,
  });

  // Handle data processing when data changes (replaces deprecated onSuccess)
  useEffect(() => {
    if (data) {
      // console.log("CompanyProfile loaded (raw):", data);
      // Normalize shape: support either AxiosResponse or raw entity
      const payload = data && typeof data === "object" && "data" in data && data.data && typeof data.data === "object"
        ? data.data
        : data;
      const plain = payload ? { ...payload } : null;
      // if (plain) {
      //   // eslint-disable-next-line no-console
      //   console.log("CompanyProfile normalized:", { id: plain.id, companyName: plain.companyName });
      // }
      setProfile(plain);
      setDraft(plain);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => svc.update(id, payload),
    onSuccess: () => {
      toast.success("Company profile updated successfully");
      queryClient.invalidateQueries(["company-profile-latest"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update company profile");
    },
  });

  const initMutation = useMutation({
    mutationFn: () => svc.initialize(),
    onSuccess: () => {
      toast.success("Initialized default company profile");
      queryClient.invalidateQueries(["company-profile-latest"]);
      refetch();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to initialize company profile");
    },
  });

  const handleFieldChange = (key, value) => {
    // For date fields, value is already in Gregorian format from date picker
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!draft?.id) return;
    updateMutation.mutate({ id: draft.id, payload: draft });
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!draft) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Company Profile
          </Typography>
          {isError && (
            <Typography color="error" sx={{ mb: 1 }}>
              Failed to load company profile.
            </Typography>
          )}
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No company profile record was found. This page is update-only and expects a single row in
            the <code>company_profile</code> table. Please insert one row in the database.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="contained" onClick={() => initMutation.mutate()} disabled={initMutation.isPending}>
              {initMutation.isPending ? "Initializing..." : "Initialize Default Profile"}
            </Button>
          </Box>

        </Paper>
        <ToastContainer />
      </Box>
    );
  }

  const entries = Object.entries(draft).filter(
    ([k]) => !editableKeysBlacklist.has(k) && !additionalBillIncomeKeySet.has(k)
  );
  // debug count
  // eslint-disable-next-line no-console
  // console.log("CompanyProfile fields loaded:", entries.length);

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Company Profile {draft?.id ? `(ID: ${draft.id})` : ""}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => initMutation.mutate()}
              disabled={!!draft || initMutation.isPending}
            >
              {initMutation.isPending ? "Initializing..." : "Initialize Default Profile"}
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Box>

        {/* {draft?.companyName && (
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Name: {draft.companyName} • Fields: {entries.length}
          </Typography>
        )} */}

        {/* <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">Debug: Raw JSON</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
              {JSON.stringify(draft, null, 2)}
            </pre>
          </AccordionDetails>
        </Accordion> */}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: "35%", fontWeight: 600 }}>Field</TableCell>
                <TableCell sx={{ width: "65%", fontWeight: 600 }}>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(([key, value]) => {
                // Special handling for templateBillSms to show guidance in full row
                if (key === "templateBillSms") {
                  return (
                    <>
                      <TableRow key={`${key}-guidance`}>
                        <TableCell colSpan={2} sx={{ bgcolor: "info.light", p: 3, border: "2px solid", borderColor: "info.main", borderRadius: 1 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "info.dark", textAlign: "center" }}>
                            📱 SMS Template Variables Guide
                          </Typography>
                          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 2 }}>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, boxShadow: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "success.main" }}>
                                👤 Customer & Period
                              </Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                                <strong>#1</strong> — Customer Name (English)<br/>
                                <strong>#2</strong> — Billing Period (e.g. Meskerem, 2016)<br/>
                                <strong>#7</strong> — Account Number<br/>
                                <strong>#8</strong> — Due Date (Ethiopian Calendar)
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, boxShadow: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "warning.main" }}>
                                📊 Reading & Consumption
                              </Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                                <strong>#9</strong> — Previous Reading<br/>
                                <strong>#10</strong> — Current Reading<br/>
                                <strong>#3</strong> — Consumption (m³)
                              </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: "white", borderRadius: 1, boxShadow: 1 }}>
                              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: "error.main" }}>
                                💰 Arrears & Payment
                              </Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                                <strong>#4</strong> — Arrears Period Description<br/>
                                <strong>#5</strong> — Total Arrears Amount<br/>
                                <strong>#6</strong> — Total Payable Amount<br/>
                                <strong>#11</strong> — Penalty / Kitat Amount
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" sx={{ mt: 2, textAlign: "center", fontStyle: "italic", color: "text.secondary" }}>
                            💡 Use these variables in your template. Example: &quot;Dear #1, your bill for #2 is #6 Birr. Account: #7&quot;
                          </Typography>
                        </TableCell>
                      </TableRow>
                      <TableRow key={key} hover>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>{prettyLabel(key)}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            rows={3}
                            value={value ?? ""}
                            onChange={(e) => handleFieldChange(key, e.target.value)}
                            placeholder="Enter SMS template using variables above"
                          />
                        </TableCell>
                      </TableRow>
                    </>
                  );
                }
                
                return (
                  <TableRow key={key} hover>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{prettyLabel(key)}</TableCell>
                    <TableCell>
                      {booleanKeys.has(key) ? (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!value}
                              onChange={(e) => handleFieldChange(key, e.target.checked)}
                            />
                          }
                          label={value ? "On" : "Off"}
                        />
                      ) : dateKeys.has(key) ? (
                        <EthiopianDatePicker
                          value={value}
                          onChange={(newValue) => handleFieldChange(key, newValue)}
                          label={`Ethiopian ${prettyLabel(key)}`}
                        />
                      ) : numericKeys.has(key) ? (
                        <TextField
                          type="number"
                          size="small"
                          value={value ?? ""}
                          onChange={(e) => handleFieldChange(key, e.target.value === "" ? null : Number(e.target.value))}
                          inputProps={{ step: 1 }}
                        />
                      ) : (
                        <TextField
                          size="small"
                          fullWidth
                          value={value ?? ""}
                          onChange={(e) => handleFieldChange(key, e.target.value)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Additional Bill Income Group ── */}
        <Accordion sx={{ mt: 2 }} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              💰 Additional Bill Income
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: "20%", fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ width: "30%", fontWeight: 600 }}>Label (Name)</TableCell>
                    <TableCell sx={{ width: "25%", fontWeight: 600 }}>Value (Number)</TableCell>
                    <TableCell sx={{ width: "25%", fontWeight: 600 }}>Option</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {additionalBillIncomeKeys.map(({ labelKey, valueKey, optionKey, title }) => (
                    <TableRow key={labelKey} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{title}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={draft[labelKey] ?? ""}
                          onChange={(e) => handleFieldChange(labelKey, e.target.value)}
                          placeholder="Enter label name"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={draft[valueKey] ?? ""}
                          onChange={(e) =>
                            handleFieldChange(
                              valueKey,
                              e.target.value === "" ? null : Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          inputProps={{ step: 0.01 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          select
                          size="small"
                          fullWidth
                          value={draft[optionKey] ?? ""}
                          onChange={(e) => handleFieldChange(optionKey, e.target.value)}
                        >
                          <MenuItem value="">— Select —</MenuItem>
                          <MenuItem value="Consumption">Consumption</MenuItem>
                          <MenuItem value="Current_Month">Current Month</MenuItem>
                        </TextField>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Paper>
      <ToastContainer />
    </Box>
  );
}

const queryClient = new QueryClient();

export default function CompanyProfileSinglePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CompanyProfileSingle />
    </QueryClientProvider>
  );
}
