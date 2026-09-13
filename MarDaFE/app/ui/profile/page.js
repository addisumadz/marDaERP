"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, Button, Grid, MenuItem, Paper, TextField, Typography } from "@mui/material";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { UserAccountService } from "@/app/lib/userAccountService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const userService = new UserAccountService();

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState({ firstName: "", midleName: "", lastName: "", sex: "", branchName: "", roleName: "" });
  const [loading, setLoading] = useState(false);

  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdStrength, setPwdStrength] = useState({ label: "", color: "text.secondary" });
  const computeStrength = (pwd) => {
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
      return;
    }
    if (status === "authenticated") {
      const sid = session?.user?.id || session?.id || null;
      if (sid) setUserId(sid);
    }
  }, [status, session, router]);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const u = await userService.getUserById(userId);
        setProfile({
          firstName: u.firstName || "",
          midleName: u.midleName || "",
          lastName: u.lastName || "",
          sex: u.sex || "",
          branchName: u.branchName || "",
          roleName: u.roleName || "",
        });
      } catch (e) {
        toast.error(e.response?.data || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwdForm((f) => ({ ...f, [name]: value }));
    if (name === "newPassword") setPwdStrength(computeStrength(value));
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      toast.error("User ID is missing. Please enter your User ID.");
      return;
    }
    try {
      const payload = {
        firstName: profile.firstName,
        midleName: profile.midleName,
        lastName: profile.lastName,
        sex: profile.sex,
      };
      await userService.updateUser(userId, payload);
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error(e.response?.data || e.message);
    }
  };

  const handleChangePassword = async () => {
    if (!userId) {
      toast.error("User ID is missing. Please enter your User ID.");
      return;
    }
    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const hasDigit = /\d/.test(pwdForm.newPassword);
    const hasNonDigit = /[^\d]/.test(pwdForm.newPassword);
    if (pwdForm.newPassword.length < 6 || !hasDigit || !hasNonDigit) {
      toast.error("Password must be at least 6 chars with at least one digit and one non-digit");
      return;
    }
    try {
      await userService.changePassword(userId, { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success("Password changed successfully");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwdStrength({ label: "", color: "text.secondary" });
    } catch (e) {
      toast.error(e.response?.data || e.message);
    }
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="My Profile" />
      <Grid container spacing={3} mt={1}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            {/* User ID comes from session; no manual override */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}><TextField name="firstName" label="First Name" value={profile.firstName} onChange={handleProfileChange} fullWidth /></Grid>
              <Grid item xs={12} md={4}><TextField name="midleName" label="Middle Name" value={profile.midleName} onChange={handleProfileChange} fullWidth /></Grid>
              <Grid item xs={12} md={4}><TextField name="lastName" label="Last Name" value={profile.lastName} onChange={handleProfileChange} fullWidth /></Grid>
              <Grid item xs={12} md={6}>
                <TextField select label="Sex" name="sex" value={profile.sex} onChange={handleProfileChange} fullWidth>
                  <MenuItem value=""><em>--</em></MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Branch" value={profile.branchName} fullWidth disabled />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Role" value={profile.roleName} fullWidth disabled />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={handleSaveProfile} disabled={loading}>Save Changes</Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}><TextField name="currentPassword" label="Current Password" type="password" value={pwdForm.currentPassword} onChange={handlePwdChange} fullWidth /></Grid>
              <Grid item xs={12}><TextField name="newPassword" label="New Password" type="password" value={pwdForm.newPassword} onChange={handlePwdChange} fullWidth /></Grid>
              {pwdForm.newPassword && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: pwdStrength.color }}>Password strength: {pwdStrength.label}</Typography>
                </Grid>
              )}
              <Grid item xs={12}><TextField name="confirmPassword" label="Confirm New Password" type="password" value={pwdForm.confirmPassword} onChange={handlePwdChange} fullWidth /></Grid>
              <Grid item xs={12}><Button variant="contained" onClick={handleChangePassword}>Change Password</Button></Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
