import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
  CircularProgress,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
  FormHelperText,
  Divider,
  InputAdornment,
  Alert,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";
import SpeedIcon from "@mui/icons-material/Speed";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { CustomerService } from "../../../lib/customerService";
import { transliterateToAmharic } from "../../../helpers/amharicInput";

const customerService = new CustomerService();

const CustomerFormModal = ({
  open,
  onClose,
  onSubmit,
  customer,
  isLoading,
  lookupData = {},
  existingCustomers = [],
  ketenaFetcher,
  readerFetcher,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [ketenaList, setKetenaList] = useState([]);
  const [readerOptions, setReaderOptions] = useState([]);
  const initialKebeleRef = useRef(null);
  const initialBranchRef = useRef(null);
  const [amharicInputMode, setAmharicInputMode] = useState("powerGeez");
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      addressStreetsId: "",
      addressKetenaId: "",
      branchsId: "",
      customerTypeId: "",
      meterSizeId: "",
      fullName: "",
      fullNameEng: "",
      phoneNumber: "",
      accountNumber: "",
      meterNumber: "",
      nationalIdNumber: "",
      houseNumber: "",
      addressDescription: "",
      billingCustomerInfoMeterId: "",
      locationCoordination: "",
      initialReading: 0,
      customerBalanceBirr: 0,
      maxReference: 10000,
      additionalMonthlyPayment: 0,
      oldHasPenalty: false,
      oldPenlityNumberOfMonths: 0,
      oldMonthsList: "",
      oldKfyaAndPenaltyTotal: 0,
      tekemachKfya: 0,
      techemariFieldName: "",
      techemariKfya: 0,
      assignedReaderId: "",
    },
  });

  const watchedKebeleId = useWatch({ control, name: "addressStreetsId" });
  const watchedBranchId = useWatch({ control, name: "branchsId" });
  const hasOldPenalty = useWatch({ control, name: "oldHasPenalty" });

  const watchedFullName = useWatch({ control, name: "fullName" });
  const watchedFullNameEng = useWatch({ control, name: "fullNameEng" });
  const watchedMeterNumber = useWatch({ control, name: "meterNumber" });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => customerService.getCompanySettings(),
    enabled: open,
    staleTime: Infinity,
  });

  const {
    kebeles: kebeleList = [],
    branches: branchList = [],
    customerTypes = [],
    meterSizes: meterSizeList = [],
  } = lookupData || {};

  const autoGenerateEnabled = settings?.autoGiveAccountNumber === true;
  const isEditMode = !!customer;

  // Track initial values in edit mode
  useEffect(() => {
    if (open && customer && !isLoading) {
      initialKebeleRef.current = customer.addressStreetsId || null;
      initialBranchRef.current = customer.branchsId || null;
    }
  }, [open, customer, isLoading]);

  // Reset or populate form
  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setSubmitError("");
      if (customer && !isLoading) {
        reset({
          ...customer,
          addressStreetsId: customer.addressStreetsId || "",
          addressKetenaId: customer.addressKetenaId || "",
          branchsId: customer.branchsId || "",
          customerTypeId: customer.customerTypeId || "",
          meterSizeId: customer.meterSizeId || "",
          assignedReaderId: customer.assignedReaderId || "",
          fullName: customer.fullName || "",
          fullNameEng: customer.fullNameEng || "",
          phoneNumber: customer.phoneNumber || "",
          accountNumber: customer.accountNumber || "",
          meterNumber: customer.meterNumber || "",
          nationalIdNumber: customer.nationalIdNumber || "",
          houseNumber: customer.houseNumber || "",
          addressDescription: customer.addressDescription || "",
          locationCoordination: customer.locationCoordination || "",
          initialReading: customer.initialReading ?? 0,
          customerBalanceBirr: customer.customerBalanceBirr ?? 0,
          maxReference: customer.maxReference ?? 10000,
          additionalMonthlyPayment: customer.additionalMonthlyPayment ?? 0,
          oldHasPenalty: !!customer.oldHasPenalty,
          oldPenlityNumberOfMonths: customer.oldPenlityNumberOfMonths ?? 0,
          oldMonthsList: customer.oldMonthsList || "",
          oldKfyaAndPenaltyTotal: customer.oldKfyaAndPenaltyTotal ?? 0,
          techemariFieldName: customer.techemariFieldName || "",
          techemariKfya: customer.techemariKfya ?? 0,
        });
      } else {
        reset({
          addressStreetsId: "",
          addressKetenaId: "",
          branchsId: "",
          customerTypeId: "",
          meterSizeId: "",
          fullName: "",
          fullNameEng: "",
          phoneNumber: "",
          accountNumber: "",
          meterNumber: "",
          nationalIdNumber: "",
          houseNumber: "",
          addressDescription: "",
          billingCustomerInfoMeterId: "",
          locationCoordination: "",
          initialReading: 0,
          customerBalanceBirr: 0,
          maxReference: 10000,
          additionalMonthlyPayment: 0,
          oldHasPenalty: false,
          oldPenlityNumberOfMonths: 0,
          oldMonthsList: "",
          oldKfyaAndPenaltyTotal: 0,
          tekemachKfya: 0,
          techemariFieldName: "",
          techemariKfya: 0,
          assignedReaderId: "",
        });
      }
    }
  }, [open, customer, isLoading, reset]);

  // Cascading Ketena and account number generator
  useEffect(() => {
    const handleKebeleChange = async () => {
      if (!watchedKebeleId) {
        setKetenaList([]);
        return;
      }

      const ketenas = (await ketenaFetcher?.(watchedKebeleId)) || [];
      setKetenaList(ketenas);

      // Auto-reset Ketena if not matching current Kebele
      if (customer && initialKebeleRef.current && String(initialKebeleRef.current) === String(watchedKebeleId)) {
        // Keep initial ketena on first load of edit mode
      } else if (!customer) {
        setValue("addressKetenaId", "");
      }

      if (!autoGenerateEnabled) return;

      if (!customer && !isLoading) {
        const nextAccountNumber = await customerService.getNextAccountNumber(watchedKebeleId);
        setValue("accountNumber", nextAccountNumber);
        return;
      }

      if (customer && !isLoading) {
        const initialKebele = initialKebeleRef.current;
        if (initialKebele && String(initialKebele) === String(watchedKebeleId)) {
          return;
        }
        const nextAccountNumber = await customerService.getNextAccountNumber(watchedKebeleId);
        setValue("accountNumber", nextAccountNumber);
      }
    };

    if (open) {
      handleKebeleChange();
    }
  }, [watchedKebeleId, customer, isLoading, open, autoGenerateEnabled, setValue, ketenaFetcher]);

  // Cascading Reader dropdown
  useEffect(() => {
    const fetchReaders = async () => {
      if (watchedBranchId) {
        const readers = (await readerFetcher?.(watchedBranchId)) || [];
        setReaderOptions(readers);
        if (customer && initialBranchRef.current && String(initialBranchRef.current) === String(watchedBranchId)) {
          // Keep on initial load
        } else if (!customer) {
          setValue("assignedReaderId", "");
        }
      } else {
        setReaderOptions([]);
        setValue("assignedReaderId", "");
      }
    };
    if (open) fetchReaders();
  }, [watchedBranchId, open, customer, setValue, readerFetcher]);

  // =========================================================================
  // DUPLICATE CHECKS: EXACT MATCH ON AMHARIC NAME, ENGLISH NAME, METER NUMBER
  // =========================================================================
  const duplicateStatus = useMemo(() => {
    const currentId = customer?.id;
    const otherCustomers = (existingCustomers || []).filter(
      (c) => !currentId || String(c.id) !== String(currentId)
    );

    const normAmharic = (watchedFullName || "").trim().replace(/\s+/g, " ");
    const normEnglish = (watchedFullNameEng || "").trim().replace(/\s+/g, " ").toLowerCase();
    const normMeter = (watchedMeterNumber || "").trim().toLowerCase();

    let dupAmharic = null;
    let dupEnglish = null;
    let dupMeter = null;

    if (normAmharic && normAmharic.length >= 2) {
      dupAmharic = otherCustomers.find(
        (c) => (c.fullName || "").trim().replace(/\s+/g, " ") === normAmharic
      );
    }

    if (normEnglish && normEnglish.length >= 2) {
      dupEnglish = otherCustomers.find(
        (c) =>
          (c.fullNameEng || "").trim().replace(/\s+/g, " ").toLowerCase() === normEnglish
      );
    }

    if (normMeter && normMeter !== "-" && normMeter !== "null" && normMeter !== "0") {
      dupMeter = otherCustomers.find(
        (c) => (c.meterNumber || "").trim().toLowerCase() === normMeter
      );
    }

    return { dupAmharic, dupEnglish, dupMeter };
  }, [watchedFullName, watchedFullNameEng, watchedMeterNumber, customer?.id, existingCustomers]);

  const handleClose = () => {
    setKetenaList([]);
    setReaderOptions([]);
    setSubmitError("");
    reset();
    onClose();
  };

  const handleFormSubmit = async (data) => {
    setSubmitError("");

    // Enforce Exact Duplicate Checks
    if (duplicateStatus.dupAmharic) {
      setActiveTab(0);
      setSubmitError(
        `Duplicate Amharic Name: A customer with the exact name "${duplicateStatus.dupAmharic.fullName}" already exists (Account: ${duplicateStatus.dupAmharic.accountNumber}). Exact duplicate names are not allowed.`
      );
      setError("fullName", {
        type: "manual",
        message: `Exact match with Account ${duplicateStatus.dupAmharic.accountNumber}`,
      });
      return;
    }

    if (duplicateStatus.dupEnglish) {
      setActiveTab(0);
      setSubmitError(
        `Duplicate English Name: A customer with the exact name "${duplicateStatus.dupEnglish.fullNameEng}" already exists (Account: ${duplicateStatus.dupEnglish.accountNumber}). Exact duplicate names are not allowed.`
      );
      setError("fullNameEng", {
        type: "manual",
        message: `Exact match with Account ${duplicateStatus.dupEnglish.accountNumber}`,
      });
      return;
    }

    if (!isEditMode && duplicateStatus.dupMeter) {
      setActiveTab(2);
      setSubmitError(
        `Duplicate Meter Number: Meter "${duplicateStatus.dupMeter.meterNumber}" is already registered to ${duplicateStatus.dupMeter.fullName || "another customer"} (Account: ${duplicateStatus.dupMeter.accountNumber}). Duplicate meter numbers are not allowed.`
      );
      setError("meterNumber", {
        type: "manual",
        message: `Meter already in use by Account ${duplicateStatus.dupMeter.accountNumber}`,
      });
      return;
    }

    try {
      const sanitizedData = { ...data };
      const optionalStringFields = [
        "locationCoordination",
        "addressDescription",
        "phoneNumber",
        "fullNameEng",
        "oldMonthsList",
        "techemariFieldName",
        "nationalIdNumber",
        "houseNumber",
        "countNumber",
        "terminationRemark",
        "kdmeKfyaReasons",
      ];
      for (const field of optionalStringFields) {
        if (typeof sanitizedData[field] === "string" && sanitizedData[field].trim() === "") {
          sanitizedData[field] = null;
        }
      }

      const idFields = [
        "addressStreetsId",
        "addressKetenaId",
        "branchsId",
        "customerTypeId",
        "meterSizeId",
        "assignedReaderId",
        "billingCustomerInfoMeterId",
      ];
      for (const field of idFields) {
        if (sanitizedData[field] === "" || sanitizedData[field] === undefined) {
          sanitizedData[field] = null;
        }
      }

      const numericFields = [
        "initialReading",
        "customerBalanceBirr",
        "maxReference",
        "additionalMonthlyPayment",
        "techemariKfya",
        "oldKfyaAndPenaltyTotal",
        "oldPenlityNumberOfMonths",
      ];
      for (const field of numericFields) {
        if (sanitizedData[field] !== null && sanitizedData[field] !== undefined) {
          sanitizedData[field] = Number(sanitizedData[field]) || 0;
        }
      }

      await onSubmit(sanitizedData);
      handleClose();
    } catch (error) {
      console.error("Failed to submit customer form:", error);
      setSubmitError(error?.response?.data?.message || error?.message || "Failed to save customer.");
    }
  };

  const onError = (formErrors) => {
    if (formErrors.fullName || formErrors.phoneNumber || formErrors.customerTypeId) {
      setActiveTab(0);
    } else if (formErrors.addressStreetsId || formErrors.accountNumber) {
      setActiveTab(1);
    } else {
      setActiveTab(2);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1, borderBottom: 1, borderColor: "divider" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              {customer ? `Edit Customer — ${customer.accountNumber || ""}` : "New Consumer Registration"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {customer
                ? "Update consumer profile, tariffs, and address details"
                : "Register a new water consumer (duplicate Amharic/English names & meter numbers are strictly checked)"}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Wizard Tabs */}
        <Box sx={{ mt: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              icon={<PersonIcon fontSize="small" />}
              iconPosition="start"
              label="1. Basic Information"
              sx={{ textTransform: "none", fontWeight: 700 }}
            />
            <Tab
              icon={<PlaceIcon fontSize="small" />}
              iconPosition="start"
              label="2. Location & Routing"
              sx={{ textTransform: "none", fontWeight: 700 }}
            />
            <Tab
              icon={<SpeedIcon fontSize="small" />}
              iconPosition="start"
              label="3. Meter & Billing Settings"
              sx={{ textTransform: "none", fontWeight: 700 }}
            />
          </Tabs>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit, onError)}>
        <DialogContent sx={{ minHeight: 400, py: 2.5 }}>
          {/* General Submit Error Alert */}
          {submitError && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setSubmitError("")}>
              {submitError}
            </Alert>
          )}

          {/* Live Duplicate Warning Alerts */}
          {duplicateStatus.dupAmharic && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<WarningAmberIcon />}>
              <strong>Duplicate Amharic Name:</strong> Customer <strong>{duplicateStatus.dupAmharic.fullName}</strong> already exists with Account <strong>{duplicateStatus.dupAmharic.accountNumber}</strong>. Exact duplicate Amharic names are not allowed!
            </Alert>
          )}

          {duplicateStatus.dupEnglish && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<WarningAmberIcon />}>
              <strong>Duplicate English Name:</strong> Customer <strong>{duplicateStatus.dupEnglish.fullNameEng}</strong> already exists with Account <strong>{duplicateStatus.dupEnglish.accountNumber}</strong>. Exact duplicate English names are not allowed!
            </Alert>
          )}

          {!isEditMode && duplicateStatus.dupMeter && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<WarningAmberIcon />}>
              <strong>Duplicate Meter Number:</strong> Meter <strong>{duplicateStatus.dupMeter.meterNumber}</strong> is already registered to <strong>{duplicateStatus.dupMeter.fullName}</strong> (Account: <strong>{duplicateStatus.dupMeter.accountNumber}</strong>). Duplicate meters are not allowed!
            </Alert>
          )}

          {isLoading || isLoadingSettings ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 0 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        bgcolor: "background.default",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
                        Keyboard Transliteration Mode:
                      </Typography>
                      <RadioGroup
                        row
                        value={amharicInputMode}
                        onChange={(event) => setAmharicInputMode(event.target.value)}
                      >
                        <FormControlLabel value="powerGeez" control={<Radio size="small" />} label="Power Geez" />
                        <FormControlLabel value="phonetic" control={<Radio size="small" />} label="Phonetic (English letters to Amharic)" />
                      </RadioGroup>
                    </Paper>
                  </Grid>

                  {/* Amharic Full Name */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fullName"
                      control={control}
                      rules={{
                        required: "Customer full name (Amharic) is required",
                        minLength: { value: 3, message: "Name must be at least 3 characters" },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="ሙሉ ስም (Full Name Amharic) *"
                          variant="outlined"
                          fullWidth
                          error={Boolean(error || duplicateStatus.dupAmharic)}
                          helperText={
                            duplicateStatus.dupAmharic
                              ? `Exact duplicate of Account ${duplicateStatus.dupAmharic.accountNumber}`
                              : error
                              ? error.message
                              : "Auto-transliterates to Ge'ez on blur"
                          }
                          onBlur={(event) => {
                            const raw = event.target.value;
                            const converted = transliterateToAmharic(raw, amharicInputMode);
                            field.onChange(converted);
                            if (field.onBlur) field.onBlur();
                          }}
                        />
                      )}
                    />
                  </Grid>

                  {/* English Full Name */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="fullNameEng"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="Full Name (English) *"
                          variant="outlined"
                          fullWidth
                          error={Boolean(error || duplicateStatus.dupEnglish)}
                          helperText={
                            duplicateStatus.dupEnglish
                              ? `Exact duplicate of Account ${duplicateStatus.dupEnglish.accountNumber}`
                              : "Used for bilingual search and receipts"
                          }
                          placeholder="e.g. Abebe Kebede Tadesse"
                        />
                      )}
                    />
                  </Grid>

                  {/* Phone Number */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={{
                        validate: (value) => {
                          const v = (value || "").trim();
                          if (!v) return true;
                          return (
                            /^(?:0|251|\+251)(?:9|7)\d{8}$/.test(v) ||
                            "Phone must be 09/07 or 2519/2517 (e.g. 0912345678)"
                          );
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="ስልክ ቁጥር (Phone Number)"
                          variant="outlined"
                          fullWidth
                          error={!!error}
                          helperText={error ? error.message : "Mobile number for automated bill SMS notifications"}
                        />
                      )}
                    />
                  </Grid>

                  {/* Customer Type */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customerTypeId"
                      control={control}
                      rules={{ required: "Customer type is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth variant="outlined" error={!!error}>
                          <InputLabel>የደንበኛ ዓይነት (Customer Type) *</InputLabel>
                          <Select {...field} label="የደንበኛ ዓይነት (Customer Type) *">
                            {customerTypes?.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  {/* National ID */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="nationalIdNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ብሔራዊ መታወቂያ / Fayda ID (National ID)"
                          variant="outlined"
                          fullWidth
                          placeholder="National identification or digital ID"
                        />
                      )}
                    />
                  </Grid>

                  {/* House Number */}
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="houseNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የቤት ቁጥር (House Number)"
                          variant="outlined"
                          fullWidth
                          placeholder="e.g. 1045 or New"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* TAB 2: LOCATION & ROUTING */}
              {activeTab === 1 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="addressStreetsId"
                      control={control}
                      rules={{ required: "Kebele selection is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth variant="outlined" error={!!error}>
                          <InputLabel>ቀበሌ (Kebele) *</InputLabel>
                          <Select {...field} label="ቀበሌ (Kebele) *">
                            {kebeleList?.map((kebele) => (
                              <MenuItem key={kebele.id} value={kebele.id}>
                                {kebele.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="addressKetenaId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" disabled={!watchedKebeleId}>
                          <InputLabel>ከተና (Ketena)</InputLabel>
                          <Select {...field} label="ከተና (Ketena)">
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {ketenaList.map((ketena) => (
                              <MenuItem key={ketena.id} value={ketena.id}>
                                {ketena.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="accountNumber"
                      control={control}
                      rules={{ required: "Account number is required" }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="የሂሳብ ቁጥር (Account Number) *"
                          variant="outlined"
                          fullWidth
                          error={!!error}
                          helperText={
                            error
                              ? error.message
                              : autoGenerateEnabled
                              ? "Automatically generated based on Kebele code"
                              : "Enter unique customer account number"
                          }
                          InputProps={{ readOnly: autoGenerateEnabled && !isEditMode }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="branchsId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>ቅርንጫፍ (Branch)</InputLabel>
                          <Select {...field} label="ቅርንጫፍ (Branch)">
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {branchList?.map((branch) => (
                              <MenuItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="assignedReaderId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" disabled={!watchedBranchId}>
                          <InputLabel>ላክተኛ መድብ (Assign Reader)</InputLabel>
                          <Select {...field} label="ላክተኛ መድብ (Assign Reader)">
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {readerOptions.map((reader) => (
                              <MenuItem key={reader.id} value={reader.id}>
                                {reader.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="locationCoordination"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የቦታ አቀማመጥ (GPS Coordinates)"
                          variant="outlined"
                          fullWidth
                          placeholder="latitude,longitude (e.g. 11.598,36.492)"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="addressDescription"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ተጨማሪ አድራሻ (Additional Landmark / Address Notes)"
                          variant="outlined"
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Key landmarks, specific gates, or route descriptions"
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              )}

              {/* TAB 3: METER & BILLING SETTINGS */}
              {activeTab === 2 && (
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700 }}>
                      Meter Technical Specifications {isEditMode && "(Managed via Meters Modal for existing customers)"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="meterNumber"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="የቆጣሪ ቁጥር (Meter Number)"
                          variant="outlined"
                          fullWidth
                          disabled={isEditMode}
                          error={Boolean(error || (!isEditMode && duplicateStatus.dupMeter))}
                          helperText={
                            !isEditMode && duplicateStatus.dupMeter
                              ? `Already in use by Account ${duplicateStatus.dupMeter.accountNumber}`
                              : isEditMode
                              ? "Meter number can be updated via the Meters dialog"
                              : "Physical meter serial number (must be unique)"
                          }
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="meterSizeId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined" disabled={isEditMode}>
                          <InputLabel>የቆጣሪ መጠን (Meter Size)</InputLabel>
                          <Select {...field} label="የቆጣሪ መጠን (Meter Size)">
                            <MenuItem value="">
                              <em>None</em>
                            </MenuItem>
                            {meterSizeList?.map((size) => (
                              <MenuItem key={size.id} value={size.id}>
                                {size.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="initialReading"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የመጀመሪያ ንባብ (Initial Reading)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          disabled={isEditMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="maxReference"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ከፍተኛ ፍጆታ (Max Consumption Threshold)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          disabled={isEditMode}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                      Recurring Charges & Arrears
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="additionalMonthlyPayment"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የደረቅ ቆሻሻ (Dry Waste Monthly Fee)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          InputProps={{ endAdornment: <InputAdornment position="end">ETB</InputAdornment> }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="customerBalanceBirr"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ቅድመ ክፍያ (Initial Pre-payment Deposit)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          InputProps={{ endAdornment: <InputAdornment position="end">ETB</InputAdornment> }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="techemariFieldName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ተጨማሪ ክፍያ ስም (Additional Fee Name)"
                          variant="outlined"
                          fullWidth
                          placeholder="e.g. Maintenance Fee"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="techemariKfya"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ተጨማሪ ክፍያ መጠን (Additional Fee Amount)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          InputProps={{ endAdornment: <InputAdornment position="end">ETB</InputAdornment> }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="oldHasPenalty"
                          control={control}
                          render={({ field }) => <Switch {...field} checked={field.value} />}
                        />
                      }
                      label="የድሮ እዳ አለበት (Has Historical Arrears / Unpaid Penalty)"
                    />
                  </Grid>

                  {hasOldPenalty && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name="oldPenlityNumberOfMonths"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="የወራት ብዛት (Arrears Months Count)"
                              variant="outlined"
                              type="number"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name="oldKfyaAndPenaltyTotal"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="ጠቅላላ እዳ (Total Arrears Amount)"
                              variant="outlined"
                              type="number"
                              fullWidth
                              InputProps={{ endAdornment: <InputAdornment position="end">ETB</InputAdornment> }}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name="oldMonthsList"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="የወራት ዝርዝር (Arrears Months Breakdown)"
                              variant="outlined"
                              fullWidth
                              placeholder="e.g. መስከረም, ጥቅምት"
                            />
                          )}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {activeTab > 0 && (
              <Button size="small" onClick={() => setActiveTab((t) => t - 1)} disabled={isLoading}>
                Back
              </Button>
            )}
            {activeTab < 2 && (
              <Button size="small" variant="outlined" onClick={() => setActiveTab((t) => t + 1)} disabled={isLoading}>
                Next Step
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={handleClose} color="inherit" disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                isLoading ||
                isLoadingSettings ||
                Boolean(duplicateStatus.dupAmharic) ||
                Boolean(duplicateStatus.dupEnglish) ||
                Boolean(!isEditMode && duplicateStatus.dupMeter)
              }
              startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              sx={{ px: 3, fontWeight: 700 }}
            >
              {isLoading ? "Saving..." : "Save Customer"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerFormModal;
