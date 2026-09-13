"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress, Typography, MenuItem, FormControl, InputLabel, Select } from "@mui/material";

const BranchFormModal = ({ open, onClose, onSubmit, branch, kebeles = [], isLoading }) => {
  const [formData, setFormData] = useState({
    branchKebeleId: "",
    branchCode: "",
    branchDescription: "",
    officeLevel: "",
    aboutOffice: "",
  });
  const [errors, setErrors] = useState({});
  const isEditMode = !!branch;

  useEffect(() => {
    if (open) {
      if (isEditMode && branch) {
        setFormData({
          branchKebeleId: branch.branchKebeleId || "",
          branchCode: branch.branchCode || "",
          branchDescription: branch.branchDescription || "",
          officeLevel: branch.officeLevel || "",
          aboutOffice: branch.aboutOffice || "",
        });
      } else {
        setFormData({ branchKebeleId: "", branchCode: "", branchDescription: "", officeLevel: "", aboutOffice: "" });
      }
      setErrors({});
    }
  }, [open, branch, isEditMode]);

  const onChange = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.branchKebeleId) e.branchKebeleId = "Kebele is required";
    if (!formData.branchCode.trim()) e.branchCode = "Branch code is required";
    if (!formData.branchDescription.trim()) e.branchDescription = "Description is required";
    if (!formData.officeLevel.trim()) e.officeLevel = "Office level is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      branchKebeleId: parseInt(formData.branchKebeleId, 10),
      branchCode: formData.branchCode.trim(),
      branchDescription: formData.branchDescription.trim(),
      officeLevel: formData.officeLevel.trim(),
      aboutOffice: formData.aboutOffice,
    };
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) { console.error("Submit error", err); }
  };

  const handleClose = () => { setErrors({}); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle><Typography variant="h6">{isEditMode ? "Edit Branch" : "Create Branch"}</Typography></DialogTitle>
      <DialogContent>
        {isLoading && isEditMode ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <Box component="form" sx={{ mt: 1 }}>
            <FormControl fullWidth margin="normal" required error={!!errors.branchKebeleId}>
              <InputLabel id="branch-kebele-label">Kebele</InputLabel>
              <Select labelId="branch-kebele-label" value={formData.branchKebeleId} label="Kebele" onChange={onChange("branchKebeleId")}>
                {kebeles.map((k) => (
                  <MenuItem key={k.id} value={k.id}>{k.streetsName || k.branchKebeleName || `Kebele #${k.id}`}</MenuItem>
                ))}
              </Select>
              {errors.branchKebeleId && <Typography color="error" variant="caption">{errors.branchKebeleId}</Typography>}
            </FormControl>

            <TextField fullWidth label="Branch Code" value={formData.branchCode} onChange={onChange("branchCode")} error={!!errors.branchCode} helperText={errors.branchCode} margin="normal" required />
            <TextField fullWidth label="Description" value={formData.branchDescription} onChange={onChange("branchDescription")} error={!!errors.branchDescription} helperText={errors.branchDescription} margin="normal" required />
            <TextField fullWidth label="Office Level" value={formData.officeLevel} onChange={onChange("officeLevel")} error={!!errors.officeLevel} helperText={errors.officeLevel} margin="normal" required />
            <TextField fullWidth label="About Office" value={formData.aboutOffice} onChange={onChange("aboutOffice")} margin="normal" multiline rows={3} />
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

export default BranchFormModal;
