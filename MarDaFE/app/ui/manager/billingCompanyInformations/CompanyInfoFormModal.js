"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

const CompanyInfoFormModal = ({ open, onClose, onSubmit, info, isLoading }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: "",
    motto: "",
    message: "",
    additionalInformation: "",
    genzebSebsabe: "",
    deresegnYemiaregagt: "",
    deresegnSebsabiLabel: "",
    deresegnYemiaregagtLabel: "",
    yeteganenePercent: 0,
  });
  const [errors, setErrors] = useState({});
  const isEditMode = !!info;

  useEffect(() => {
    if (open) {
      if (isEditMode && info) {
        setFormData({
          companyName: info.companyName || "",
          companyLogo: info.companyLogo || "",
          motto: info.motto || "",
          message: info.message || "",
          additionalInformation: info.additionalInformation || "",
          genzebSebsabe: info.genzebSebsabe || "",
          deresegnYemiaregagt: info.deresegnYemiaregagt || "",
          deresegnSebsabiLabel: info.deresegnSebsabiLabel || "",
          deresegnYemiaregagtLabel: info.deresegnYemiaregagtLabel || "",
          yeteganenePercent: Number.isFinite(info.yeteganenePercent) ? info.yeteganenePercent : 0,
        });
      } else {
        setFormData({
          companyName: "",
          companyLogo: "",
          motto: "",
          message: "",
          additionalInformation: "",
          genzebSebsabe: "",
          deresegnYemiaregagt: "",
          deresegnSebsabiLabel: "",
          deresegnYemiaregagtLabel: "",
          yeteganenePercent: 0,
        });
      }
      setErrors({});
    }
  }, [open, info, isEditMode]);

  const onText = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const onNumber = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.companyName.trim()) e.companyName = "Company name is required";
    if (!formData.companyLogo.trim()) e.companyLogo = "Company logo is required";
    if (!formData.motto.trim()) e.motto = "Motto is required";
    if (!formData.message.trim()) e.message = "Message is required";
    if (!formData.additionalInformation.trim()) e.additionalInformation = "Additional information is required";
    if (!formData.genzebSebsabe.trim()) e.genzebSebsabe = "Genzeb Sebsabe is required";
    if (!formData.deresegnYemiaregagt.trim()) e.deresegnYemiaregagt = "Deresegn Yemiaregagt is required";
    const yp = parseInt(formData.yeteganenePercent, 10);
    if (isNaN(yp) || yp < 0) e.yeteganenePercent = "Yeteganene percent must be zero or positive";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      companyName: formData.companyName.trim(),
      companyLogo: formData.companyLogo.trim(),
      motto: formData.motto.trim(),
      message: formData.message.trim(),
      additionalInformation: formData.additionalInformation.trim(),
      genzebSebsabe: formData.genzebSebsabe.trim(),
      deresegnYemiaregagt: formData.deresegnYemiaregagt.trim(),
      deresegnSebsabiLabel: formData.deresegnSebsabiLabel.trim(),
      deresegnYemiaregagtLabel: formData.deresegnYemiaregagtLabel.trim(),
      yeteganenePercent: parseInt(formData.yeteganenePercent, 10) || 0,
    };
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">{isEditMode ? "Edit Company Information" : "Create Company Information"}</Typography>
      </DialogTitle>

      <DialogContent>
        {isLoading && isEditMode ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField fullWidth label="Company Name" value={formData.companyName} onChange={onText("companyName")} error={!!errors.companyName} helperText={errors.companyName} margin="normal" required />
            <TextField fullWidth label="Company Logo" value={formData.companyLogo} onChange={onText("companyLogo")} error={!!errors.companyLogo} helperText={errors.companyLogo} margin="normal" required />
            <TextField fullWidth label="Motto" value={formData.motto} onChange={onText("motto")} error={!!errors.motto} helperText={errors.motto} margin="normal" required />
            <TextField fullWidth label="Message" value={formData.message} onChange={onText("message")} error={!!errors.message} helperText={errors.message} margin="normal" required />
            <TextField fullWidth label="Additional Information" value={formData.additionalInformation} onChange={onText("additionalInformation")} error={!!errors.additionalInformation} helperText={errors.additionalInformation} margin="normal" required />
            <TextField fullWidth label="Genzeb Sebsabe" value={formData.genzebSebsabe} onChange={onText("genzebSebsabe")} error={!!errors.genzebSebsabe} helperText={errors.genzebSebsabe} margin="normal" required />
            <TextField fullWidth label="Deresegn Yemiaregagt" value={formData.deresegnYemiaregagt} onChange={onText("deresegnYemiaregagt")} error={!!errors.deresegnYemiaregagt} helperText={errors.deresegnYemiaregagt} margin="normal" required />
            <TextField fullWidth label="Deresegn Sebsabi Label" value={formData.deresegnSebsabiLabel} onChange={onText("deresegnSebsabiLabel")} margin="normal" />
            <TextField fullWidth label="Deresegn Yemiaregagt Label" value={formData.deresegnYemiaregagtLabel} onChange={onText("deresegnYemiaregagtLabel")} margin="normal" />
            <TextField fullWidth label="Yeteganene Percent" type="number" value={formData.yeteganenePercent} onChange={onNumber("yeteganenePercent")} error={!!errors.yeteganenePercent} helperText={errors.yeteganenePercent} margin="normal" inputProps={{ min: 0 }} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={20} /> : (isEditMode ? "Update" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CompanyInfoFormModal;
