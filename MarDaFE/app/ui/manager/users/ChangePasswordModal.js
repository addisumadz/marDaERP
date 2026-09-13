"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField } from "@mui/material";
import Typography from "@mui/material/Typography";
import { UserAccountService } from "@/app/lib/userAccountService";
import { toast } from "react-toastify";

const userService = new UserAccountService();

export default function ChangePasswordModal({ open, onClose, userId }) {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [pwdStrength, setPwdStrength] = useState({ label: "", color: "text.secondary" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "newPassword") {
      const s = computePasswordStrength(value || "");
      setPwdStrength(s);
    }
  };

  const computePasswordStrength = (pwd) => {
    if (!pwd) return { label: "", color: "text.secondary" };
    let score = 0;
    const hasDigit = /\d/.test(pwd);
    const hasNonDigit = /[^\d]/.test(pwd);
    if (pwd.length >= 6) score++;
    if (hasDigit) score++;
    if (hasNonDigit) score++;
    if (score <= 1) return { label: "Weak", color: "error.main" };
    if (score === 2) return { label: "Medium", color: "warning.main" };
    return { label: "Strong", color: "success.main" };
  };

  const handleSubmit = async () => {
    if (!userId) return;
    if (!form.newPassword || !form.confirmPassword) {
      toast.error("Please enter new password in both fields");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    // Strength rule: min 6 chars, at least 1 digit and 1 non-digit
    const hasDigit = /\d/.test(form.newPassword);
    const hasNonDigit = /[^\d]/.test(form.newPassword);
    if (form.newPassword.length < 6 || !hasDigit || !hasNonDigit) {
      toast.error("Password must be at least 6 chars with at least one digit and one non-digit");
      return;
    }
    try {
      setSubmitting(true);
      await userService.changePassword(userId, { newPassword: form.newPassword });
      toast.success("Password changed successfully");
      onClose();
    } catch (e) {
      toast.error(e.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField name="newPassword" label="New Password" type="password" value={form.newPassword} onChange={handleChange} fullWidth />
          </Grid>
          {form.newPassword && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: pwdStrength.color }}>
                Password strength: {pwdStrength.label}
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField name="confirmPassword" label="Confirm New Password" type="password" value={form.confirmPassword} onChange={handleChange} fullWidth />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={submitting}>Change</Button>
      </DialogActions>
    </Dialog>
  );
}
