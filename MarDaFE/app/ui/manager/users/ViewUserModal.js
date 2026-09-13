"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField } from "@mui/material";
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
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open) load();
    return () => { mounted = false; };
  }, [open, userId]);

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent dividers>
        {loading ? "Loading..." : (
          user ? (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid item xs={12} md={6}><TextField label="Username" value={user.userName || "-"} fullWidth disabled /></Grid>
              <Grid item xs={12} md={6}><TextField label="Full Name" value={user.fullName || "-"} fullWidth disabled /></Grid>
              <Grid item xs={12} md={6}><TextField label="Role" value={user.roleName || "-"} fullWidth disabled /></Grid>
              <Grid item xs={12} md={6}><TextField label="Branch" value={user.branchName || "-"} fullWidth disabled /></Grid>
              <Grid item xs={12} md={6}><TextField label="Status" value={user.status || "-"} fullWidth disabled /></Grid>
            </Grid>
          ) : "No data"
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
