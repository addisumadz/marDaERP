import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

const PenaltyTarifFormModal = ({
  open,
  onClose,
  penaltyTarif,
  onSubmit,
  isLoading = false,
  customerTypes = [],
}) => {
  const [formData, setFormData] = useState({
    customerTypeId: "",
    numberOfMonth: "",
    isPercent: false,
    bewerBzatYbaza: false,
    weruLayDemr: false,
    enaKezihBelay: false,
    penalityBirr: "",
    additionalPenalty: "",
  });
  const [errors, setErrors] = useState({});
  const [isCheckingExists, setIsCheckingExists] = useState(false);

  const editMode = !!penaltyTarif;

  useEffect(() => {
    if (editMode && penaltyTarif) {
      setFormData({
        customerTypeId: penaltyTarif.customerTypeId || "",
        numberOfMonth: penaltyTarif.numberOfMonth || "",
        isPercent: !!penaltyTarif.isPercent,
        bewerBzatYbaza: !!penaltyTarif.bewerBzatYbaza,
        weruLayDemr: !!penaltyTarif.weruLayDemr,
        enaKezihBelay: !!penaltyTarif.enaKezihBelay,
        penalityBirr: penaltyTarif.penalityBirr ?? "",
        additionalPenalty: penaltyTarif.additionalPenalty ?? "",
      });
    } else {
      setFormData({
        customerTypeId: "",
        numberOfMonth: "",
        isPercent: false,
        bewerBzatYbaza: false,
        weruLayDemr: false,
        enaKezihBelay: false,
        penalityBirr: "",
        additionalPenalty: "",
      });
    }
    setErrors({});
  }, [penaltyTarif, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Ensure mutual exclusivity among isPercent, bewerBzatYbaza, weruLayDemr
  const handleExclusiveToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      isPercent: field === "isPercent" ? !prev.isPercent : false,
      bewerBzatYbaza: field === "bewerBzatYbaza" ? !prev.bewerBzatYbaza : false,
      weruLayDemr: field === "weruLayDemr" ? !prev.weruLayDemr : false,
    }));
  };

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.customerTypeId) {
      newErrors.customerTypeId = "Customer type is required";
    }

    const months = parseInt(formData.numberOfMonth);
    if (!formData.numberOfMonth) {
      newErrors.numberOfMonth = "Number of months is required";
    } else if (months < 1) {
      newErrors.numberOfMonth = "Number of months must be at least 1";
    } else if (months > 120) {
      newErrors.numberOfMonth = "Number of months cannot exceed 120";
    }

    // At least one of the three must be true
    if (!formData.isPercent && !formData.bewerBzatYbaza && !formData.weruLayDemr) {
      newErrors.exclusive = "Turn on one of: Is Percent, Bewer Bzat Ybaza, or Weru Lay Demr";
    }

    const pen = parseFloat(formData.penalityBirr);
    if (isNaN(pen)) {
      newErrors.penalityBirr = "Penalty value is required";
    } else if (pen < 0) {
      newErrors.penalityBirr = "Penalty cannot be negative";
    } else if (formData.isPercent && pen > 100) {
      newErrors.penalityBirr = "Percentage cannot exceed 100%";
    }

    const addPen = parseFloat(formData.additionalPenalty);
    if (isNaN(addPen)) {
      newErrors.additionalPenalty = "Additional penalty is required";
    } else if (addPen < 0) {
      newErrors.additionalPenalty = "Additional penalty cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    const submitData = {
      customerTypeId: parseInt(formData.customerTypeId),
      numberOfMonth: parseInt(formData.numberOfMonth),
      isPercent: !!formData.isPercent,
      bewerBzatYbaza: !!formData.bewerBzatYbaza,
      weruLayDemr: !!formData.weruLayDemr,
      enaKezihBelay: !!formData.enaKezihBelay,
      penalityBirr: parseFloat(formData.penalityBirr),
      additionalPenalty: parseFloat(formData.additionalPenalty),
      // no remark field per requirement
    };

    onSubmit?.(submitData);
  };

  const handleClose = () => {
    setFormData({
      customerTypeId: "",
      numberOfMonth: "",
      isPercent: false,
      bewerBzatYbaza: false,
      weruLayDemr: false,
      enaKezihBelay: false,
      penalityBirr: "",
      additionalPenalty: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="div">
          {editMode ? "Edit Penalty Tarif" : "Add New Penalty Tarif"}
        </Typography>
        <Button
          onClick={handleClose}
          color="inherit"
          size="small"
          sx={{ minWidth: "auto", p: 1 }}
          disabled={isLoading}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Customer Type Selection */}
          <FormControl fullWidth error={!!errors.customerTypeId}>
            <InputLabel>Customer Type *</InputLabel>
            <Select
              value={formData.customerTypeId}
              onChange={(e) => handleInputChange("customerTypeId", e.target.value)}
              label="Customer Type *"
              disabled={isLoading}
            >
              <MenuItem value="">
                <em>Select Customer Type</em>
              </MenuItem>
              {customerTypes
                .filter((type) => type.deleted === "active")
                .map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.customerType}
                  </MenuItem>
              ))}
            </Select>
            {errors.customerTypeId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.customerTypeId}
              </Typography>
            )}
          </FormControl>

          {/* Number of Months */}
          <TextField
            fullWidth
            label="Number of Months"
            type="number"
            value={formData.numberOfMonth}
            onChange={(e) => handleInputChange("numberOfMonth", e.target.value)}
            error={!!errors.numberOfMonth}
            helperText={errors.numberOfMonth}
            disabled={isLoading || isCheckingExists}
            required
            inputProps={{ min: 1, max: 120 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ScheduleIcon color="info" />
                </InputAdornment>
              ),
            }}
          />

          {/* Exclusive options */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>One of the following must be ON</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={<Switch checked={formData.isPercent} onChange={() => handleExclusiveToggle("isPercent")} />}
                  label="Is Percent"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={<Switch checked={formData.bewerBzatYbaza} onChange={() => handleExclusiveToggle("bewerBzatYbaza")} />}
                  label="Bewer Bzat Ybaza"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={<Switch checked={formData.weruLayDemr} onChange={() => handleExclusiveToggle("weruLayDemr")} />}
                  label="Weru Lay Demr"
                />
              </Grid>
            </Grid>
            {errors.exclusive && (
              <Typography variant="caption" color="error">{errors.exclusive}</Typography>
            )}
          </Box>

          {/* Ena Kezih Belay toggle */}
          <FormControlLabel
            control={<Switch checked={formData.enaKezihBelay} onChange={(e) => handleInputChange("enaKezihBelay", e.target.checked)} />}
            label="Ena Kezih Belay"
          />

          {/* Amounts */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={formData.isPercent ? "Penalty (Percent)" : "Penalty (Birr)"}
                type="number"
                value={formData.penalityBirr}
                onChange={(e) => handleInputChange("penalityBirr", e.target.value)}
                error={!!errors.penalityBirr}
                helperText={errors.penalityBirr}
                disabled={isLoading}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Additional Penalty"
                type="number"
                value={formData.additionalPenalty}
                onChange={(e) => handleInputChange("additionalPenalty", e.target.value)}
                error={!!errors.additionalPenalty}
                helperText={errors.additionalPenalty}
                disabled={isLoading}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </Grid>

          {/* Remark */}
          <TextField
            fullWidth
            label="Remark"
            multiline
            rows={3}
            value={formData.remark}
            onChange={(e) => handleInputChange("remark", e.target.value)}
            disabled={isLoading}
            placeholder="Optional remark or description..."
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || isCheckingExists}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} />
            ) : (
              <SaveIcon />
            )
          }
        >
          {isLoading
            ? "Saving..."
            : editMode
            ? "Update"
            : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PenaltyTarifFormModal;
