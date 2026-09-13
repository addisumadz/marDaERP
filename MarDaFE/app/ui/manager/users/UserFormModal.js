"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import { UserAccountService } from "@/app/lib/userAccountService";

const userService = new UserAccountService();

export default function UserFormModal({ open, onClose, onSubmit, userId, branches = [], roles = [], isSubmitting }) {
  const isCreate = !userId;
  const [form, setForm] = useState({
    userName: "",
    password: "",
    firstName: "",
    midleName: "",
    lastName: "",
    sex: "",
    branchId: "",
    roleId: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pwdStrength, setPwdStrength] = useState({ label: "", color: "text.secondary" });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const u = await userService.getUserById(userId);
        if (!mounted) return;
        setForm({
          userName: u.userName || "",
          password: "", // never show password on edit
          firstName: u.firstName || "",
          midleName: u.midleName || "",
          lastName: u.lastName || "",
          sex: u.sex || "",
          branchId: u.branchId || "",
          roleId: u.roleId || "",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open && userId) load();
    if (open && !userId) {
      setForm({ userName: "", password: "", firstName: "", midleName: "", lastName: "", sex: "", branchId: "", roleId: "" });
    }
    return () => { mounted = false; };
  }, [open, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (name === "password") {
      const s = computePasswordStrength(value || "");
      setPwdStrength(s);
    }
  };

  const computePasswordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "text.secondary" };
    let score = 0;
    const hasDigit = /\d/.test(pwd);
    const hasNonDigit = /[^\d]/.test(pwd); // any character that is not a digit
    if (pwd.length >= 6) score++;
    if (hasDigit) score++;
    if (hasNonDigit) score++;
    if (score <= 1) return { label: "Weak", color: "error.main" };
    if (score === 2) return { label: "Medium", color: "warning.main" };
    return { label: "Strong", color: "success.main" };
  };

  const validate = () => {
    const err = {};
    if (isCreate && !form.userName?.trim()) err.userName = "Username is required";
    if (isCreate) {
      if (!form.password?.trim()) {
        err.password = "Password is required";
      } else {
        const hasDigit = /\d/.test(form.password);
        const hasNonDigit = /[^\d]/.test(form.password);
        if (form.password.length < 6 || !hasDigit || !hasNonDigit) {
          err.password = "Min 6 chars, include at least one digit and one non-digit";
        }
      }
    }
    if (!form.branchId) err.branchId = "Branch is required";
    if (!form.roleId) err.roleId = "Role is required";
    return err;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length > 0) {
      setErrors(err);
      return;
    }
    const payload = { ...form };
    if (!isCreate) {
      // remove immutable / server-managed fields for update
      delete payload.userName;
      delete payload.password;
    }
    await onSubmit(payload);
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isCreate ? "Create User" : "Edit User"}</DialogTitle>
      <DialogContent dividers>
        {loading ? "Loading..." : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="userName"
                label="Username"
                value={form.userName}
                onChange={handleChange}
                fullWidth
                disabled={!isCreate}
                required={isCreate}
                error={!!errors.userName}
                helperText={errors.userName}
              />
            </Grid>
            {isCreate && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.password}
                  helperText={errors.password}
                />
                {!!form.password && !errors.password && (
                  <Typography variant="caption" sx={{ color: pwdStrength.color }}>
                    Password strength: {pwdStrength.label}
                  </Typography>
                )}
              </Grid>
            )}
            <Grid item xs={12} md={4}><TextField name="firstName" label="First Name" value={form.firstName} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField name="midleName" label="Middle Name" value={form.midleName} onChange={handleChange} fullWidth /></Grid>
            <Grid item xs={12} md={4}><TextField name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} fullWidth /></Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sex</InputLabel>
                <Select label="Sex" name="sex" value={form.sex} onChange={handleChange}>
                  <MenuItem value=""><em>--</em></MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={branches || []}
                getOptionLabel={(option) => option?.branchDescription || option?.name || String(option?.id || "")}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                value={branches?.find((b) => b.id === form.branchId) || null}
                onChange={(e, newVal) => {
                  setForm((f) => ({ ...f, branchId: newVal?.id || "" }));
                  setErrors((prev) => ({ ...prev, branchId: undefined }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Branch"
                    placeholder="Search branch..."
                    fullWidth
                    required
                    error={!!errors.branchId}
                    helperText={errors.branchId}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={roles || []}
                getOptionLabel={(option) => option?.roleName || option?.name || String(option?.id || "")}
                isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                value={roles?.find((r) => r.id === form.roleId) || null}
                onChange={(e, newVal) => {
                  setForm((f) => ({ ...f, roleId: newVal?.id || "" }));
                  setErrors((prev) => ({ ...prev, roleId: undefined }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role"
                    placeholder="Search role..."
                    fullWidth
                    required
                    error={!!errors.roleId}
                    helperText={errors.roleId}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || (isCreate && Object.keys(validate()).length > 0)}
        >
          {isCreate ? "Create" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
