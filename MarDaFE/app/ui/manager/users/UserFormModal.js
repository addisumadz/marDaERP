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
  Box,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import BadgeIcon from "@mui/icons-material/Badge";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { UserAccountService } from "@/app/lib/userAccountService";
import hrmsEmployeeService from "@/app/lib/hrmsEmployeeService";

const userService = new UserAccountService();

export default function UserFormModal({ open, onClose, onSubmit, userId, branches = [], roles = [], allUsers = [], isSubmitting }) {
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
    employeeId: null,
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [pwdStrength, setPwdStrength] = useState({ label: "", color: "text.secondary" });

  // Map employee ID -> username for existing user accounts
  const existingAccountMap = useMemo(() => {
    const map = new Map();
    (allUsers || []).forEach((u) => {
      if (u.employeeId && (!userId || u.id !== userId)) {
        map.set(u.employeeId, u.userName);
      }
    });
    return map;
  }, [allUsers, userId]);

  // Load active HRMS employees on dialog open
  useEffect(() => {
    if (open) {
      hrmsEmployeeService.getAllEmployees().then((data) => {
        setEmployees(Array.isArray(data) ? data : []);
      }).catch(() => setEmployees([]));
    }
  }, [open]);

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
          employeeId: u.employeeId || null,
        });

        if (u.employeeId) {
          try {
            const emp = await hrmsEmployeeService.getEmployeeById(u.employeeId);
            if (mounted && emp) setSelectedEmployee(emp);
          } catch (_) {}
        } else {
          setSelectedEmployee(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open && userId) load();
    if (open && !userId) {
      setForm({ userName: "", password: "", firstName: "", midleName: "", lastName: "", sex: "", branchId: "", roleId: "", employeeId: null });
      setSelectedEmployee(null);
    }
    return () => { mounted = false; };
  }, [open, userId]);

  // Handle employee selection and auto-fill
  const handleEmployeeSelect = (emp) => {
    setSelectedEmployee(emp);
    if (!emp) {
      setForm((f) => ({ ...f, employeeId: null }));
      return;
    }

    const rawName = (emp.fullName || "").trim();
    const parts = rawName.split(/\s+/);
    const fName = parts[0] || "";
    const mName = parts[1] || "";
    const lName = parts.slice(2).join(" ") || "";

    const empSex = (emp.sex || "").toLowerCase();
    const normalizedSex = empSex.includes("fem") ? "female" : (empSex.includes("mal") ? "male" : "");

    const empBranchId = emp.branch?.id || emp.branchsId || "";

    // Auto-suggest role if employee position title matches a role
    let suggestedRoleId = "";
    const posTitle = (emp.position?.positionTitle || "").toLowerCase();
    if (posTitle && roles.length > 0) {
      const matched = roles.find((r) => {
        const rName = (r.roleName || "").toLowerCase();
        const rCode = (r.roleCode || "").toLowerCase();
        return rName.includes(posTitle) || posTitle.includes(rName) || rCode.includes(posTitle) || posTitle.includes(rCode);
      });
      if (matched) suggestedRoleId = matched.id;
    }

    // Auto-suggest username if creating
    let suggestedUsername = "";
    if (isCreate) {
      const codeClean = (emp.employeeId || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
      suggestedUsername = codeClean || (fName && lName ? `${fName.toLowerCase()}.${lName.toLowerCase()}` : fName.toLowerCase());
    }

    setForm((f) => ({
      ...f,
      employeeId: emp.id,
      firstName: fName || f.firstName,
      midleName: mName || f.midleName,
      lastName: lName || f.lastName,
      sex: normalizedSex || f.sex,
      branchId: empBranchId || f.branchId,
      roleId: suggestedRoleId || f.roleId,
      userName: isCreate && !f.userName ? suggestedUsername : f.userName,
    }));
  };

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
    const hasNonDigit = /[^\d]/.test(pwd);
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
      delete payload.userName;
      delete payload.password;
    }
    await onSubmit(payload);
  };

  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>{isCreate ? "Create New User Account" : "Edit User Account"}</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          "Loading..."
        ) : (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {/* HRMS Employee Selection Section */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "#f0f4ff"),
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "primary.200",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "primary.main", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <BadgeIcon fontSize="small" /> Link to HRMS Employee (Optional)
                </Typography>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => {
                    const hasAcc = existingAccountMap.has(option.id);
                    return `${option.employeeId} - ${option.fullName}${
                      option.department?.departmentName ? ` (${option.department.departmentName})` : ""
                    }${hasAcc ? ` [Account Exists: @${existingAccountMap.get(option.id)}]` : ""}`;
                  }}
                  isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
                  getOptionDisabled={(option) => isCreate && existingAccountMap.has(option.id)}
                  value={selectedEmployee}
                  onChange={(e, newVal) => handleEmployeeSelect(newVal)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select HRMS Employee"
                      placeholder="Search by Employee ID, Name, or Department..."
                      size="small"
                      helperText="Selecting an employee auto-populates names, gender, branch, and suggested username"
                    />
                  )}
                />
                {selectedEmployee && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.25,
                      bgcolor: "background.paper",
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "primary.dark" }}>
                        {selectedEmployee.fullName} ({selectedEmployee.employeeId})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Department: <strong>{selectedEmployee.department?.departmentName || "—"}</strong> • Position:{" "}
                        <strong>{selectedEmployee.position?.positionTitle || "—"}</strong>
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<LinkOffIcon />}
                      onClick={() => handleEmployeeSelect(null)}
                    >
                      Unlink
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Username & Password */}
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
                helperText={errors.userName || (isCreate && selectedEmployee ? "Auto-suggested from Employee ID (editable)" : "")}
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

            {/* Personal Details */}
            <Grid item xs={12} md={4}>
              <TextField name="firstName" label="First Name" value={form.firstName} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="midleName" label="Middle Name" value={form.midleName} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField name="lastName" label="Last Name" value={form.lastName} onChange={handleChange} fullWidth />
            </Grid>

            {/* Sex, Branch, Role */}
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
          {isCreate ? "Create User" : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
