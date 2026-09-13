import React, { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { CustomerService } from "../../../lib/customerService";
import { transliterateToAmharic } from "../../../helpers/amharicInput";

// Instantiate services outside the component to prevent re-creation on re-renders
const customerService = new CustomerService();

const CustomerFormModal = ({ open, onClose, onSubmit, customer, isLoading, lookupData = {}, ketenaFetcher, readerFetcher }) => {
  // State for dynamically loaded dropdown options
  const [ketenaList, setKetenaList] = useState([]);
  const [readerOptions, setReaderOptions] = useState([]);
  // Track initial kebele per modal instance
  const initialKebeleRef = useRef(null);
  const [amharicInputMode, setAmharicInputMode] = useState("powerGeez");


  const { control, handleSubmit, reset, setValue, formState: { isDirty } } = useForm({
    defaultValues: customer || {
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

  // Watch for changes in parent dropdowns to trigger dependent fetches
  const watchedKebeleId = useWatch({ control, name: "addressStreetsId" });
  const watchedBranchId = useWatch({ control, name: "branchsId" });
  const hasOldPenalty = useWatch({ control, name: "oldHasPenalty" });

  // Fetch only company settings locally; dropdowns are provided from parent via lookupData
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => customerService.getCompanySettings(),
    enabled: open,
    staleTime: Infinity,
  });

  // Destructure centralized lookupData
  const {
    kebeles: kebeleList = [],
    branches: branchList = [],
    customerTypes = [],
    meterSizes: meterSizeList = [],
  } = lookupData || {};
  const autoGenerateEnabled = settings?.autoGiveAccountNumber === true;
  const isEditMode = !!customer;

  // Track initial kebele when editing to avoid overwriting account number on first load
  useEffect(() => {
    if (open && customer && !isLoading) {
      initialKebeleRef.current = customer.addressStreetsId || null;
    }
  }, [open, customer, isLoading]);

  // Effect 1: Reset the form whenever the modal opens or starts loading.
  // This prevents displaying stale data.
  useEffect(() => {
    if (open) {
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
  }, [open, isLoading, reset]);

  // Effect 2: Populate the form with customer data once it has loaded.
  useEffect(() => {
    if (customer && !isLoading) {
      reset(customer);
    }
  }, [customer, isLoading, reset]);

  // Effect for cascading Ketena dropdown and auto-generating Account Number
  useEffect(() => {
    const handleKebeleChange = async () => {
      // Do not run if kebele not selected
      if (!watchedKebeleId) {
        setKetenaList([]);
        return;
      }

      const ketenas = (await (ketenaFetcher?.(watchedKebeleId))) || [];
      setKetenaList(ketenas);

      if (!autoGenerateEnabled) return;

      // Create mode: always generate on kebele pick
      if (!customer && !isLoading) {
        const nextAccountNumber = await customerService.getNextAccountNumber(watchedKebeleId);
        setValue("accountNumber", nextAccountNumber);
        return;
      }

      // Edit mode: generate only if kebele changed from initial
      if (customer && !isLoading) {
        const initialKebele = initialKebeleRef.current;
        if (initialKebele && String(initialKebele) === String(watchedKebeleId)) {
          // keep existing account number on initial load
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

  // Effect for dependent Reader dropdown
  useEffect(() => {
    const fetchReaders = async () => {
      if (watchedBranchId) {
        const readers = (await (readerFetcher?.(watchedBranchId))) || [];
        setReaderOptions(readers);
      } else {
        setReaderOptions([]);
      }
    };
    if (open) fetchReaders();
  }, [watchedBranchId, open, setValue, readerFetcher]);



  const handleClose = () => {
    // Reset local state before closing
    setKetenaList([]);
    setReaderOptions([]);
    reset(); // Reset react-hook-form state
    onClose(); // Call parent onClose handler
  };

  const handleFormSubmit = async (data) => {
    try {
      // Sanitize: convert empty/whitespace-only strings to null so the DB stores NULL
      // instead of empty strings for optional fields
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
      // Also convert empty-string IDs to null for foreign key fields
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

      await onSubmit(sanitizedData);
      handleClose(); // Close modal only on successful submission and reset state
    } catch (error) {
      console.error("Failed to submit form:", error);
      // The modal will remain open, and you can add user-facing error handling here.
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {customer ? "Edit Customer" : "Create New Customer"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ overflowY: "auto" }}>
          {(isLoading || isLoadingSettings) ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {/* Left Column */}
              <Grid item xs={12} md={6}>
                {/* Group 1: Basic Information */}
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <RadioGroup
                      row
                      value={amharicInputMode}
                      onChange={(event) => setAmharicInputMode(event.target.value)}
                    >
                      <FormControlLabel value="powerGeez" control={<Radio />} label="Power Geez" />
                      <FormControlLabel value="phonetic" control={<Radio />} label="Phonetic" />
                    </RadioGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="fullName"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ሙሉ ስም (Full Name)"
                          variant="outlined"
                          fullWidth
                          onChange={field.onChange}
                          onBlur={(event) => {
                            const raw = event.target.value;
                            const converted = transliterateToAmharic(raw, amharicInputMode);
                            field.onChange(converted);
                            if (field.onBlur) {
                              field.onBlur();
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="fullNameEng"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Full Name (English)"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={{
                        validate: (value) => {
                          const v = (value || "").trim();
                          if (!v) return true;
                          return /^(?:0|251|\+251)(?:9|7)\d{8}$/.test(v)
                            || "Phone number must be 0/251/+251 then 9 or 7 then 8 digits (e.g. 0935981944, 251935981944, +251935981944).";
                        },
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label="ስልክ ቁጥር (Phone Number)"
                          variant="outlined"
                          fullWidth
                          error={!!error}
                          helperText={error ? error.message : null}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="customerTypeId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>የደንበኛ ዓይነት (Customer Type)</InputLabel>
                          <Select {...field} label="የደንበኛ ዓይነት (Customer Type)">
                            {customerTypes?.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="addressStreetsId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>ቀበሌ (Kebele)</InputLabel>
                          <Select {...field} label="ቀበሌ (Kebele)">
                            {kebeleList?.map((kebele) => (
                              <MenuItem key={kebele.id} value={kebele.id}>
                                {kebele.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="addressKetenaId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>ከተና (Ketena)</InputLabel>
                          <Select
                            {...field}
                            label="ከተና (Ketena)"
                            disabled={!watchedKebeleId}
                          >
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
                  <Grid item xs={12}>
                    <Controller
                      name="accountNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የሂሳብ ቁጥር (Account Number)"
                          variant="outlined"
                          fullWidth
                          InputProps={{ readOnly: autoGenerateEnabled }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="branchsId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>ቅርንጫፍ (Branch)</InputLabel>
                          <Select {...field} label="ቅርንጫፍ (Branch)">
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
                  <Grid item xs={12}>
                    <Controller
                      name="assignedReaderId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>ላክተኛ መድብ (Assign Reader)</InputLabel>
                          <Select
                            {...field}
                            label="ላክተኛ መድብ (Assign Reader)"
                            disabled={!watchedBranchId}
                          >
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
                  <Grid item xs={12}>
                    <Controller
                      name="addressDescription"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ተጨማሪ አድራሻ (Additional Address)"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>

               
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} md={6}>

 {/* Group 2: Meter Information */}
 <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Meter Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="meterNumber"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የቆጣሪ ቁጥር (Meter Number)"
                          variant="outlined"
                          fullWidth
                          disabled={isEditMode}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="meterSizeId"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>የቆጣሪ መጠን (Meter Size)</InputLabel>
                          <Select {...field} label="የቆጣሪ መጠን (Meter Size)" disabled={isEditMode}>
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
                  <Grid item xs={12}>
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
                  <Grid item xs={12}>
                    <Controller
                      name="maxReference"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ከፍተኛ ፍጆታ (Max Consumption)"
                          variant="outlined"
                          type="number"
                          fullWidth
                          disabled={isEditMode}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Controller
                      name="locationCoordination"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የቦታ አቀማመጥ (Location Coordination)"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                {/* Group 3: Payment Information */}
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="additionalMonthlyPayment"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="የደረቅ ቆሻሻ (Dry Waste)"
                          variant="outlined"
                          type="number"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                        <Controller
                          name="customerBalanceBirr"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="ቅድመ ክፍያ (Pre Payment)"
                              variant="outlined"
                              type="number"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                  <Grid item container spacing={2} xs={12}>
                    <Grid item xs={6}>
                      <Controller
                        name="techemariFieldName"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="ተጨማሪ ክፍያ ስም (Additional Fee Name)"
                            variant="outlined"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Controller
                        name="techemariKfya"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="ተጨማሪ ክፍያ (Additional Fee)"
                            variant="outlined"
                            type="number"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>

                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Controller
                          name="oldHasPenalty"
                          control={control}
                          render={({ field }) => (
                            <Switch {...field} checked={field.value} />
                          )}
                        />
                      }
                      label="የድሮ እዳ አለበት (Has Old Arrears)"
                    />
                  </Grid>
                  {hasOldPenalty && (
                    <>
                      <Grid item xs={12}>
                        <Controller
                          name="oldPenlityNumberOfMonths"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="የድሮ እዳ የወራት ብዛት (Number of Arrears Months)"
                              variant="outlined"
                              type="number"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="oldMonthsList"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="የድሮ እዳ የወራት ዝርዝር (Arrears Months List)"
                              variant="outlined"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name="oldKfyaAndPenaltyTotal"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="የድሮ እዳ ጠቅላላ ድምር (Total Arrears Amount)"
                              variant="outlined"
                              type="number"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      
                    </>
                  )}
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={handleClose} color="secondary">
            ይቅር (Cancel)
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoadingSettings}
          >
            ያስቀምጡ (Save)
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CustomerFormModal;

