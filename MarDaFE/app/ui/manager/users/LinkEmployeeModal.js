"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import BadgeIcon from "@mui/icons-material/Badge";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import WorkIcon from "@mui/icons-material/Work";
import { toast } from "react-toastify";
import { UserAccountService } from "@/app/lib/userAccountService";
import hrmsEmployeeService from "@/app/lib/hrmsEmployeeService";

const userService = new UserAccountService();

export default function LinkEmployeeModal({ open, onClose, user, allUsers = [], onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Map employee ID -> username for existing user accounts
  const existingAccountMap = useMemo(() => {
    const map = new Map();
    (allUsers || []).forEach((u) => {
      if (u.employeeId && (!user || u.id !== user.id)) {
        map.set(u.employeeId, u.userName);
      }
    });
    return map;
  }, [allUsers, user]);

  useEffect(() => {
    if (!open) {
      setSelectedEmployee(null);
      return;
    }

    let mounted = true;
    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const res = await hrmsEmployeeService.getAllEmployees();
        const list = Array.isArray(res) ? res : res?.data || [];
        if (mounted) {
          setEmployees(list);
          if (user?.employeeId) {
            const current = list.find((e) => e.id === user.employeeId);
            if (current) setSelectedEmployee(current);
          }
        }
      } catch (err) {
        console.error("Failed to load HRMS employees:", err);
        toast.error("Failed to fetch HRMS employee list");
      } finally {
        if (mounted) setLoadingEmployees(false);
      }
    };

    fetchEmployees();
    return () => {
      mounted = false;
    };
  }, [open, user]);

  const handleLink = async () => {
    if (!user || !selectedEmployee) {
      toast.warning("Please select an employee to link");
      return;
    }
    setSubmitting(true);
    try {
      await userService.linkEmployee(user.id, selectedEmployee.id);
      toast.success(`Successfully linked ${selectedEmployee.fullName} to @${user.userName}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Link error:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Failed to link employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlink = async () => {
    if (!user) return;
    if (!confirm(`Are you sure you want to unlink HRMS employee from user @${user.userName}?`)) {
      return;
    }
    setSubmitting(true);
    try {
      await userService.unlinkEmployee(user.id);
      toast.success(`Unlinked employee from @${user.userName}`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Unlink error:", err);
      toast.error(err.response?.data?.message || err.response?.data || "Failed to unlink employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <LinkIcon color="primary" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            Link HRMS Employee
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Connect system account @{user?.userName} to an HRMS staff record
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* User Summary */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5, bgcolor: "grey.50", borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700, display: "block", mb: 0.5 }}>
            Target User Account
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                @{user?.userName}{" "}
                <span style={{ fontWeight: "normal", color: "#666" }}>({user?.fullName})</span>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Role: {user?.roleName || "N/A"} • Branch: {user?.branchName || "N/A"}
              </Typography>
            </Box>
            <Chip
              label={user?.employeeId ? "Currently Linked" : "Not Linked"}
              color={user?.employeeId ? "success" : "default"}
              size="small"
            />
          </Box>
        </Paper>

        {/* HRMS Employee Selector */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Select HRMS Employee
          </Typography>
          <Autocomplete
            options={employees}
            loading={loadingEmployees}
            value={selectedEmployee}
            onChange={(e, val) => setSelectedEmployee(val)}
            getOptionLabel={(option) => {
              if (!option) return "";
              const idPart = option.employeeId ? `[${option.employeeId}] ` : "";
              const deptPart = option.department?.name ? ` • ${option.department.name}` : "";
              return `${idPart}${option.fullName || ""}${deptPart}`;
            }}
            getOptionDisabled={(option) => {
              return existingAccountMap.has(option.id);
            }}
            renderOption={(props, option) => {
              const existingUser = existingAccountMap.get(option.id);
              const isCurrent = user?.employeeId === option.id;
              return (
                <li {...props} key={option.id}>
                  <Box sx={{ width: "100%", py: 0.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {option.employeeId ? `[${option.employeeId}] ` : ""}
                          {option.fullName}
                        </Typography>
                        {option.fullNameAm && (
                          <Typography variant="caption" color="text.secondary">
                            ({option.fullNameAm})
                          </Typography>
                        )}
                      </Box>
                      {existingUser && !isCurrent && (
                        <Chip
                          label={`Account Exists: @${existingUser}`}
                          color="warning"
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      )}
                      {isCurrent && (
                        <Chip
                          label="Current"
                          color="success"
                          size="small"
                          sx={{ fontSize: "0.7rem", height: 20 }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      Dept: {option.department?.name || "N/A"} • Position: {option.position?.title || "N/A"}
                    </Typography>
                  </Box>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Employee by Name or ID"
                placeholder="Type to search employee..."
                size="small"
                fullWidth
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingEmployees ? <CircularProgress color="inherit" size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Selected Employee Preview */}
        {selectedEmployee && (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(25, 118, 210, 0.04)",
              borderColor: "primary.light",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BadgeIcon color="primary" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "primary.main" }}>
                {selectedEmployee.employeeId} - {selectedEmployee.fullName}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <CorporateFareIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Dept: <strong>{selectedEmployee.department?.name || "N/A"}</strong>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <WorkIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  Position: <strong>{selectedEmployee.position?.title || "N/A"}</strong>
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: "space-between" }}>
        {user?.employeeId ? (
          <Button
            onClick={handleUnlink}
            color="error"
            variant="outlined"
            startIcon={<LinkOffIcon />}
            disabled={submitting}
          >
            Unlink Employee
          </Button>
        ) : (
          <Box />
        )}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            variant="contained"
            color="primary"
            startIcon={<LinkIcon />}
            disabled={submitting || !selectedEmployee || selectedEmployee.id === user?.employeeId}
          >
            {submitting ? "Linking..." : "Save Link"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
