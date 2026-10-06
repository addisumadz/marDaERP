"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import WorkIcon from "@mui/icons-material/Work";
import { UserAccountService } from "@/app/lib/userAccountService";

const userService = new UserAccountService();

export default function ViewUserModal({ open, onClose, userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const u = await userService.getUserById(userId);
        if (mounted) setUser(u);
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open) load();
    return () => {
      mounted = false;
    };
  }, [open, userId]);

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <PersonIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {user ? user.fullName || user.userName : "User Details"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            User Account & HRMS Employee Linkage
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={36} />
          </Box>
        ) : user ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Account Details Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Account Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" label="Username" value={user.userName || "-"} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" label="Full Name" value={user.fullName || "-"} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" label="Role" value={user.roleName || "-"} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" label="Branch" value={user.branchName || "-"} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField size="small" label="Gender" value={user.sex || "-"} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", height: "100%", pt: 0.5 }}>
                    <Chip
                      label={user.status ? user.status.toUpperCase() : "UNKNOWN"}
                      color={user.status === "active" ? "success" : "default"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Linked HRMS Employee Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary", mb: 1.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                HRMS Employee Profile
              </Typography>

              {user.employeeId ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    borderColor: "primary.light",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <BadgeIcon color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "primary.main" }}>
                        {user.employeeCode || `EMP #${user.employeeId}`}
                      </Typography>
                    </Box>
                    <Chip label="Linked to HRMS" color="primary" size="small" variant="filled" />
                  </Box>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">Employee Name:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.employeeFullName || "-"}{" "}
                        {user.employeeFullNameAm ? (
                          <span style={{ color: "#666", fontWeight: "normal" }}>({user.employeeFullNameAm})</span>
                        ) : null}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <CorporateFareIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                            Department
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.departmentName || "None"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1 }}>
                            Position
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.positionTitle || "None"}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "grey.50",
                    borderColor: "grey.300",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <LinkOffIcon color="action" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                      Standalone Account (No HRMS Employee Linked)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      This user account is not connected to any HRMS employee dossier. You can link an employee anytime using Edit User or Quick Link.
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        ) : (
          <Typography color="text.secondary">No user data found.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
