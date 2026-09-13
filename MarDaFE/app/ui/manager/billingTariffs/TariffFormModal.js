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
  Speed as SpeedIcon,
  MonetizationOn as MoneyIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";

const TariffFormModal = ({
  open,
  onClose,
  tariff,
  onSubmit,
  isLoading = false,
  customerTypes = [],
}) => {
  const [formData, setFormData] = useState({
    customerTypeId: "",
    blockName: "",
    consumption: "",
    tarrifBirr: "",
    isLast: false,
  });
  const [errors, setErrors] = useState({});

  const editMode = !!tariff;

  useEffect(() => {
    if (editMode && tariff) {
      setFormData({
        customerTypeId: tariff.customerTypeId || "",
        blockName: tariff.blockName || "",
        consumption: tariff.consumption ?? "",
        tarrifBirr: tariff.tarrifBirr ?? "",
        isLast: !!tariff.isLast,
      });
    } else {
      setFormData({
        customerTypeId: "",
        blockName: "",
        consumption: "",
        tarrifBirr: "",
        isLast: false,
      });
    }
    setErrors({});
  }, [tariff, open]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerTypeId) newErrors.customerTypeId = "Customer type is required";
    if (!formData.blockName?.trim()) newErrors.blockName = "Block name is required";

    const cons = parseFloat(formData.consumption);
    if (isNaN(cons)) newErrors.consumption = "Consumption is required";
    else if (cons < 0) newErrors.consumption = "Consumption cannot be negative";

    const birr = parseFloat(formData.tarrifBirr);
    if (isNaN(birr)) newErrors.tarrifBirr = "Tariff is required";
    else if (birr < 0) newErrors.tarrifBirr = "Tariff cannot be negative";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      customerTypeId: parseInt(formData.customerTypeId),
      blockName: formData.blockName.trim(),
      consumption: parseFloat(formData.consumption),
      tarrifBirr: parseFloat(formData.tarrifBirr),
      isLast: !!formData.isLast,
    };

    onSubmit?.(payload);
  };

  const handleClose = () => {
    setFormData({ customerTypeId: "", blockName: "", consumption: "", tarrifBirr: "", isLast: false });
    setErrors({});
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Typography variant="h6">{editMode ? `Edit Tariff${tariff?.id ? ` (ID: ${tariff.id})` : ""}` : "Add New Tariff"}</Typography>
        <Button onClick={handleClose} color="inherit" size="small" sx={{ minWidth: "auto", p: 1 }} disabled={isLoading}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
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

          <TextField
            fullWidth
            label="Block Name"
            value={formData.blockName}
            onChange={(e) => handleInputChange("blockName", e.target.value)}
            error={!!errors.blockName}
            helperText={errors.blockName || (editMode && tariff?.id ? `Tariff ID: ${tariff.id}` : "")}
            disabled={isLoading}
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Consumption"
                type="number"
                value={formData.consumption}
                onChange={(e) => handleInputChange("consumption", e.target.value)}
                error={!!errors.consumption}
                helperText={errors.consumption}
                disabled={isLoading}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><SpeedIcon color="info" /></InputAdornment>) }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tariff (Birr)"
                type="number"
                value={formData.tarrifBirr}
                onChange={(e) => handleInputChange("tarrifBirr", e.target.value)}
                error={!!errors.tarrifBirr}
                helperText={errors.tarrifBirr}
                disabled={isLoading}
                required
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ startAdornment: (<InputAdornment position="start"><MoneyIcon color="success" /></InputAdornment>) }}
              />
            </Grid>
          </Grid>

          <FormControlLabel
            control={<Switch checked={formData.isLast} onChange={(e) => handleInputChange("isLast", e.target.checked)} />}
            label="Is Last Block"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined" disabled={isLoading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}>
          {isLoading ? "Saving..." : editMode ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TariffFormModal;
