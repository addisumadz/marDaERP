"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress, Typography, FormGroup, FormControlLabel, Checkbox } from "@mui/material";

const UserRoleFormModal = ({ open, onClose, onSubmit, roleItem, isLoading }) => {
  const [formData, setFormData] = useState({
    roleCode: "",
    roleName: "",
    isStore: false,
    isFormanExpert: false,
    isWaterMeterReader: false,
  });
  const [errors, setErrors] = useState({});
  const isEditMode = !!roleItem;

  useEffect(() => {
    if (open) {
      if (isEditMode && roleItem) {
        setFormData({
          roleCode: roleItem.roleCode || "",
          roleName: roleItem.roleName || "",
          isStore: !!roleItem.isStore,
          isFormanExpert: !!roleItem.isFormanExpert,
          isWaterMeterReader: !!roleItem.isWaterMeterReader,
        });
      } else {
        setFormData({ roleCode: "", roleName: "", isStore: false, isFormanExpert: false, isWaterMeterReader: false });
      }
      setErrors({});
    }
  }, [open, roleItem, isEditMode]);

  const onText = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: "" }));
  };

  const onCheck = (field) => (e) => {
    setFormData((p) => ({ ...p, [field]: e.target.checked }));
  };

  const validate = () => {
    const e = {};
    if (!formData.roleCode.trim()) e.roleCode = "Role code is required";
    if (!formData.roleName.trim()) e.roleName = "Role name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      roleCode: formData.roleCode.trim(),
      roleName: formData.roleName.trim(),
      isStore: !!formData.isStore,
      isFormanExpert: !!formData.isFormanExpert,
      isWaterMeterReader: !!formData.isWaterMeterReader,
      // isMedical intentionally not sent (enforced false on backend)
    };
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) { console.error("Submit error", err); }
  };

  const handleClose = () => { setErrors({}); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle><Typography variant="h6">{isEditMode ? "Edit User Role" : "Create User Role"}</Typography></DialogTitle>

      <DialogContent>
        {isLoading && isEditMode ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <Box component="form" sx={{ mt: 1 }}>
            <TextField fullWidth label="Role Code" value={formData.roleCode} onChange={onText("roleCode")} error={!!errors.roleCode} helperText={errors.roleCode} margin="normal" required />
            <TextField fullWidth label="Role Name" value={formData.roleName} onChange={onText("roleName")} error={!!errors.roleName} helperText={errors.roleName} margin="normal" required />

            <FormGroup sx={{ mt: 1 }}>
              <FormControlLabel control={<Checkbox checked={formData.isStore} onChange={onCheck("isStore")} />} label="Store" />
              <FormControlLabel control={<Checkbox checked={formData.isFormanExpert} onChange={onCheck("isFormanExpert")} />} label="Forman Expert" />
              <FormControlLabel control={<Checkbox checked={formData.isWaterMeterReader} onChange={onCheck("isWaterMeterReader")} />} label="Water Meter Reader" />
            </FormGroup>
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

export default UserRoleFormModal;
