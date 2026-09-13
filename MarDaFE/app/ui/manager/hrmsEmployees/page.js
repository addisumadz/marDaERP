"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  Avatar,
  Alert,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  CreditCard,
  Building,
  GraduationCap,
  Briefcase,
  Award,
  Heart,
  Calendar,
  CheckCircle,
  X,
} from "lucide-react";
import hrmsEmployeeService from "../../../lib/hrmsEmployeeService";

export default function HrmsEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ─── 360° Profile / Dossier State ──────────────────────────────────────────
  const [dossierOpen, setDossierOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Education State
  const [educationList, setEducationList] = useState([]);
  const [loadingEdu, setLoadingEdu] = useState(false);
  const [showAddEdu, setShowAddEdu] = useState(false);
  const [eduForm, setEduForm] = useState({
    yetmhrtDereja: "Bachelor's Degree / የመጀመሪያ ዲግሪ (BSc/BA)",
    yetmhrtbetSm: "",
    yetmhrtAynet: "",
    yetmhrtDerejaStatus: "COMPLETED",
    graduationYearEc: "2014 E.C.",
    gpa: "",
  });

  // Experience State
  const [experienceList, setExperienceList] = useState([]);
  const [loadingExp, setLoadingExp] = useState(false);
  const [showAddExp, setShowAddExp] = useState(false);
  const [expForm, setExpForm] = useState({
    organizationName: "",
    yesraMedeb: "",
    demewezMeten: 0,
    employeedFrom: "",
    employeedTo: "",
    reasonForLeaving: "",
  });

  // Skills State
  const [skillList, setSkillList] = useState([]);
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [skillForm, setSkillForm] = useState({
    chlotaSm: "",
    chlotaLabel: "",
    chlotaLevel: "INTERMEDIATE",
    chlotaRemark: "",
  });

  // Dependents State
  const [dependentList, setDependentList] = useState([]);
  const [loadingDep, setLoadingDep] = useState(false);
  const [showAddDep, setShowAddDep] = useState(false);
  const [depForm, setDepForm] = useState({
    yeljMuluSm: "",
    birthDate: "",
    tsota: "MALE",
    yeabatOrEnatMulusm: "",
  });

  const initialForm = {
    employeeId: "",
    fullName: "",
    fullNameAm: "",
    motherName: "",
    sex: "MALE",
    dateOfBirth: "",
    tinNumber: "",
    pensionNumber: "",
    faydaNationalId: "",
    phoneNumber: "",
    email: "",
    dutyStation: "Head Office",
    employmentType: "PERMANENT",
    employmentStatus: "ACTIVE",
    currentSalary: 0,
    biometricPin: "",
    primaryBankName: "Commercial Bank of Ethiopia",
    primaryBankAccount: "",
    secondaryBankName: "Abay Bank",
    secondaryBankAccount: "",
    secondaryPaymentPurpose: "Per Diem & Special Allowances",
  };

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async (query = "") => {
    setLoading(true);
    try {
      const data = await hrmsEmployeeService.getAllEmployees(query);
      setEmployees(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load employees");
    }
    setLoading(false);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    loadEmployees(val);
  };

  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingId(employee.id);
      setForm({
        employeeId: employee.employeeId || "",
        fullName: employee.fullName || "",
        fullNameAm: employee.fullNameAm || "",
        motherName: employee.motherName || "",
        sex: employee.sex || "MALE",
        dateOfBirth: employee.dateOfBirth || "",
        tinNumber: employee.tinNumber || "",
        pensionNumber: employee.pensionNumber || "",
        faydaNationalId: employee.faydaNationalId || "",
        phoneNumber: employee.phoneNumber || "",
        email: employee.email || "",
        dutyStation: employee.dutyStation || "Head Office",
        employmentType: employee.employmentType || "PERMANENT",
        employmentStatus: employee.employmentStatus || "ACTIVE",
        currentSalary: employee.currentSalary || 0,
        biometricPin: employee.biometricPin || "",
        primaryBankName: employee.primaryBankName || "Commercial Bank of Ethiopia",
        primaryBankAccount: employee.primaryBankAccount || "",
        secondaryBankName: employee.secondaryBankName || "Abay Bank",
        secondaryBankAccount: employee.secondaryBankAccount || "",
        secondaryPaymentPurpose: employee.secondaryPaymentPurpose || "Per Diem & Special Allowances",
      });
    } else {
      setEditingId(null);
      setForm(initialForm);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.fullName || !form.fullNameAm) {
      toast.error("Please fill required fields (ID, Full Name English & Amharic)");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await hrmsEmployeeService.updateEmployee(editingId, form);
        toast.success("Employee updated successfully!");
      } else {
        await hrmsEmployeeService.createEmployee(form);
        toast.success("Employee onboarded successfully!");
      }
      setModalOpen(false);
      loadEmployees(search);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to save employee");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to deactivate this employee?")) return;
    try {
      await hrmsEmployeeService.deleteEmployee(id);
      toast.success("Employee deleted successfully!");
      loadEmployees(search);
    } catch (e) {
      toast.error("Failed to delete employee");
    }
  };

  // ─── 360° Dossier Handlers ──────────────────────────────────────────────────
  const handleOpenDossier = (emp) => {
    setSelectedEmp(emp);
    setActiveTab(0);
    setDossierOpen(true);
    loadAllDossierData(emp.id);
  };

  const loadAllDossierData = (empId) => {
    loadEducation(empId);
    loadExperience(empId);
    loadSkills(empId);
    loadDependents(empId);
  };

  // Education
  const loadEducation = async (empId) => {
    setLoadingEdu(true);
    try {
      const data = await hrmsEmployeeService.getEmployeeEducation(empId);
      setEducationList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load education records");
    }
    setLoadingEdu(false);
  };

  const handleAddEducation = async () => {
    if (!eduForm.yetmhrtbetSm || !eduForm.yetmhrtAynet) {
      toast.error("Please provide Institution name and Field of study");
      return;
    }
    try {
      await hrmsEmployeeService.addEmployeeEducation(selectedEmp.id, {
        ...eduForm,
        gpa: eduForm.gpa ? parseFloat(eduForm.gpa) : null,
      });
      toast.success("Education qualification added successfully!");
      setShowAddEdu(false);
      setEduForm({
        yetmhrtDereja: "Bachelor's Degree / የመጀመሪያ ዲግሪ (BSc/BA)",
        yetmhrtbetSm: "",
        yetmhrtAynet: "",
        yetmhrtDerejaStatus: "COMPLETED",
        graduationYearEc: "2014 E.C.",
        gpa: "",
      });
      loadEducation(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to add education record");
    }
  };

  const handleDeleteEducation = async (eduId) => {
    if (!confirm("Are you sure you want to remove this education record?")) return;
    try {
      await hrmsEmployeeService.deleteEmployeeEducation(eduId);
      toast.success("Education record removed");
      loadEducation(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to delete education record");
    }
  };

  // Experience
  const loadExperience = async (empId) => {
    setLoadingExp(true);
    try {
      const data = await hrmsEmployeeService.getEmployeeExperience(empId);
      setExperienceList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load experience records");
    }
    setLoadingExp(false);
  };

  const handleAddExperience = async () => {
    if (!expForm.organizationName || !expForm.yesraMedeb || !expForm.employeedFrom) {
      toast.error("Please provide Organization, Position, and Start Date");
      return;
    }
    try {
      await hrmsEmployeeService.addEmployeeExperience(selectedEmp.id, {
        ...expForm,
        demewezMeten: Number(expForm.demewezMeten || 0),
        employeedTo: expForm.employeedTo || null,
      });
      toast.success("Work experience record added!");
      setShowAddExp(false);
      setExpForm({
        organizationName: "",
        yesraMedeb: "",
        demewezMeten: 0,
        employeedFrom: "",
        employeedTo: "",
        reasonForLeaving: "",
      });
      loadExperience(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to add experience record");
    }
  };

  const handleDeleteExperience = async (expId) => {
    if (!confirm("Are you sure you want to remove this work experience?")) return;
    try {
      await hrmsEmployeeService.deleteEmployeeExperience(expId);
      toast.success("Experience record removed");
      loadExperience(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to delete experience record");
    }
  };

  // Skills
  const loadSkills = async (empId) => {
    setLoadingSkill(true);
    try {
      const data = await hrmsEmployeeService.getEmployeeSkills(empId);
      setSkillList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load skill records");
    }
    setLoadingSkill(false);
  };

  const handleAddSkill = async () => {
    if (!skillForm.chlotaSm) {
      toast.error("Please enter skill name");
      return;
    }
    try {
      await hrmsEmployeeService.addEmployeeSkill(selectedEmp.id, skillForm);
      toast.success("Skill profile added!");
      setShowAddSkill(false);
      setSkillForm({
        chlotaSm: "",
        chlotaLabel: "",
        chlotaLevel: "INTERMEDIATE",
        chlotaRemark: "",
      });
      loadSkills(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to add skill");
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!confirm("Are you sure you want to remove this skill?")) return;
    try {
      await hrmsEmployeeService.deleteEmployeeSkill(skillId);
      toast.success("Skill removed");
      loadSkills(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to delete skill");
    }
  };

  // Dependents
  const loadDependents = async (empId) => {
    setLoadingDep(true);
    try {
      const data = await hrmsEmployeeService.getEmployeeDependents(empId);
      setDependentList(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load family/dependent records");
    }
    setLoadingDep(false);
  };

  const handleAddDependent = async () => {
    if (!depForm.yeljMuluSm || !depForm.birthDate) {
      toast.error("Please provide Dependent Full Name and Date of Birth");
      return;
    }
    try {
      await hrmsEmployeeService.addEmployeeDependent(selectedEmp.id, depForm);
      toast.success("Family dependent added!");
      setShowAddDep(false);
      setDepForm({
        yeljMuluSm: "",
        birthDate: "",
        tsota: "MALE",
        yeabatOrEnatMulusm: "",
      });
      loadDependents(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to add dependent");
    }
  };

  const handleDeleteDependent = async (depId) => {
    if (!confirm("Are you sure you want to remove this dependent record?")) return;
    try {
      await hrmsEmployeeService.deleteEmployeeDependent(depId);
      toast.success("Dependent removed");
      loadDependents(selectedEmp.id);
    } catch (e) {
      toast.error("Failed to delete dependent");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", color: "#0d47a1", display: "flex", alignItems: "center", gap: 1 }}
          >
            <Users size={28} color="#0d47a1" />
            የሠራተኞች መዝገብ (HRMS Employee Directory)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Water Utility Staff Management • Education & Dossier 360° • Dual Banking (CBE & Abay) • Biometric Integration
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenModal()}
          sx={{ bgcolor: "#0d47a1", "&:hover": { bgcolor: "#0a3880" }, fontWeight: "bold" }}
        >
          Add New Employee (አዲስ ሠራተኛ)
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Employee ID, Full Name (English or Amharic ዐበበ)..."
          value={search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search size={20} style={{ marginRight: 8, color: "#888" }} />,
          }}
        />
      </Paper>

      {/* Employee Table */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "#0d47a1" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>ሙሉ ስም (Full Name)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Duty Station</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Basic Salary</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Primary Bank (CBE)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Secondary Bank (Abay)</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>Status</TableCell>
              <TableCell align="center" sx={{ color: "white", fontWeight: "bold", minWidth: 220 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={32} />
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No employee records found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell sx={{ fontWeight: "bold" }}>{emp.employeeId}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {emp.fullName}
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: "Nyala, serif", color: "text.secondary" }}>
                      {emp.fullNameAm}
                    </Typography>
                  </TableCell>
                  <TableCell>{emp.dutyStation || "Head Office"}</TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#1565c0" }}>
                    ETB {Number(emp.currentSalary || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "#2e7d32" }}>
                      {emp.primaryBankName || "CBE"}
                    </Typography>
                    <Typography variant="caption">{emp.primaryBankAccount || "-"}</Typography>
                  </TableCell>
                  <TableCell>
                    {emp.secondaryBankAccount ? (
                      <>
                        <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "#7b1fa2" }}>
                          {emp.secondaryBankName || "Abay Bank"}
                        </Typography>
                        <Typography variant="caption">{emp.secondaryBankAccount}</Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Optional (None)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={emp.employmentStatus}
                      color={emp.employmentStatus === "ACTIVE" ? "success" : "default"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<GraduationCap size={15} />}
                        onClick={() => handleOpenDossier(emp)}
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          py: 0.3,
                          px: 1,
                          borderColor: "#0d47a1",
                          color: "#0d47a1",
                          "&:hover": { bgcolor: "#e3f2fd", borderColor: "#0d47a1" },
                        }}
                      >
                        Dossier 360°
                      </Button>
                      <IconButton size="small" color="primary" onClick={() => handleOpenModal(emp)} title="Edit Profile">
                        <Edit2 size={16} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(emp.id)} title="Delete Employee">
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ────────────────────────────────────────────────────────────────────────
          EMPLOYEE DOSSIER 360° MODAL (Education, Experience, Skills, Dependents)
         ──────────────────────────────────────────────────────────────────────── */}
      <Dialog open={dossierOpen} onClose={() => setDossierOpen(false)} maxWidth="lg" fullWidth>
        {selectedEmp && (
          <>
            <DialogTitle sx={{ bgcolor: "#0d47a1", color: "white", py: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "#1976d2", width: 48, height: 48, fontWeight: "bold" }}>
                    {selectedEmp.fullName ? selectedEmp.fullName.charAt(0) : "E"}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                      {selectedEmp.fullName} — {selectedEmp.fullNameAm}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#bbdefb", display: "flex", gap: 2 }}>
                      <span>ID: <strong>{selectedEmp.employeeId}</strong></span>
                      <span>Duty Station: <strong>{selectedEmp.dutyStation || "Head Office"}</strong></span>
                      <span>Biometric PIN: <strong>{selectedEmp.biometricPin || "N/A"}</strong></span>
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setDossierOpen(false)} sx={{ color: "white" }}>
                  <X size={20} />
                </IconButton>
              </Box>
            </DialogTitle>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "#f8f9fa", px: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(e, val) => setActiveTab(val)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label={`🎓 Education / ትምህርት (${educationList.length})`}
                  sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.9rem" }}
                />
                <Tab
                  label={`💼 Work Experience / ልምድ (${experienceList.length})`}
                  sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.9rem" }}
                />
                <Tab
                  label={`⭐ Skills & Competencies / ክህሎት (${skillList.length})`}
                  sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.9rem" }}
                />
                <Tab
                  label={`👨‍👩‍👧 Family & Dependents / ቤተሰብ (${dependentList.length})`}
                  sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.9rem" }}
                />
                <Tab
                  label={`🏦 Banking & Biometrics`}
                  sx={{ fontWeight: "bold", textTransform: "none", fontSize: "0.9rem" }}
                />
              </Tabs>
            </Box>

            <DialogContent sx={{ minHeight: 400, p: 3 }}>
              {/* ────────────────── TAB 0: EDUCATION ────────────────── */}
              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                      Academic Qualifications & Certifications (የትምህርት ማስረጃዎች)
                    </Typography>
                    <Button
                      variant={showAddEdu ? "outlined" : "contained"}
                      startIcon={showAddEdu ? <X size={16} /> : <Plus size={16} />}
                      onClick={() => setShowAddEdu(!showAddEdu)}
                      sx={{ textTransform: "none", fontWeight: "bold", bgcolor: showAddEdu ? "transparent" : "#0d47a1" }}
                    >
                      {showAddEdu ? "Cancel" : "+ Add Education Qualification (የትምህርት መረጃ ጨምር)"}
                    </Button>
                  </Box>

                  {/* Add Education Form */}
                  {showAddEdu && (
                    <Card variant="outlined" sx={{ p: 2.5, mb: 3, bgcolor: "#f1f7fe", borderColor: "#90caf9", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                        Register New Academic Degree / Qualification
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Qualification Level (የትምህርት ደረጃ)*</InputLabel>
                            <Select
                              value={eduForm.yetmhrtDereja}
                              label="Qualification Level (የትምህርት ደረጃ)*"
                              onChange={(e) => setEduForm({ ...eduForm, yetmhrtDereja: e.target.value })}
                            >
                              <MenuItem value="PhD / ዶክትሬት">PhD / ዶክትሬት</MenuItem>
                              <MenuItem value="Master's Degree / ሁለተኛ ዲግሪ (MSc/MA)">
                                Master's Degree / ሁለተኛ ዲግሪ (MSc/MA)
                              </MenuItem>
                              <MenuItem value="Bachelor's Degree / የመጀመሪያ ዲግሪ (BSc/BA)">
                                Bachelor's Degree / የመጀመሪያ ዲግሪ (BSc/BA)
                              </MenuItem>
                              <MenuItem value="TVET Level 5 / ዲፕሎማ">TVET Level 5 / ዲፕሎማ</MenuItem>
                              <MenuItem value="TVET Level 4 / ሰርተፊኬት">TVET Level 4 / ሰርተፊኬት</MenuItem>
                              <MenuItem value="TVET Level 3 / ሰርተፊኬት">TVET Level 3 / ሰርተፊኬት</MenuItem>
                              <MenuItem value="High School (10/12) / የሁለተኛ ደረጃ">
                                High School (10/12) / የሁለተኛ ደረጃ
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Institution / University (የትምህርት ተቋም ስም)*"
                            placeholder="e.g. Addis Ababa University, Arba Minch University"
                            value={eduForm.yetmhrtbetSm}
                            onChange={(e) => setEduForm({ ...eduForm, yetmhrtbetSm: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Field of Study / Major (የትምህርት መስክ)*"
                            placeholder="e.g. Hydraulic Engineering, Accounting, Water Resources"
                            value={eduForm.yetmhrtAynet}
                            onChange={(e) => setEduForm({ ...eduForm, yetmhrtAynet: e.target.value })}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Graduation Year (የተመረቀበት ዓ.ም)*"
                            placeholder="e.g. 2014 E.C."
                            value={eduForm.graduationYearEc}
                            onChange={(e) => setEduForm({ ...eduForm, graduationYearEc: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ step: "0.01", min: "0", max: "4.0" }}
                            label="Cumulative GPA / ውጤት"
                            placeholder="e.g. 3.75"
                            value={eduForm.gpa}
                            onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={eduForm.yetmhrtDerejaStatus}
                              label="Status"
                              onChange={(e) => setEduForm({ ...eduForm, yetmhrtDerejaStatus: e.target.value })}
                            >
                              <MenuItem value="COMPLETED">COMPLETED (የተመረቀ)</MenuItem>
                              <MenuItem value="IN_PROGRESS">IN_PROGRESS (በመማር ላይ)</MenuItem>
                              <MenuItem value="DISCONTINUED">DISCONTINUED (ያቋረጠ)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button size="small" onClick={() => setShowAddEdu(false)}>Cancel</Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddEducation}
                            sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}
                          >
                            Save Education Qualification
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  {/* Education Records Table */}
                  {loadingEdu ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : educationList.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No education qualifications recorded yet for this employee. Click "+ Add Education Qualification" above to add their degree, diploma, or certificate.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Qualification Level</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Institution (ተቋም)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Field of Study (የትምህርት ዓይነት)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Graduation Year (E.C.)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>GPA</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {educationList.map((edu) => (
                            <TableRow key={edu.id} hover>
                              <TableCell sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                                {edu.yetmhrtDereja}
                              </TableCell>
                              <TableCell>{edu.yetmhrtbetSm}</TableCell>
                              <TableCell>{edu.yetmhrtAynet}</TableCell>
                              <TableCell>{edu.graduationYearEc || "-"}</TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>{edu.gpa ? edu.gpa.toFixed(2) : "-"}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={edu.yetmhrtDerejaStatus || "COMPLETED"}
                                  color={edu.yetmhrtDerejaStatus === "COMPLETED" ? "success" : "default"}
                                />
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteEducation(edu.id)}
                                  title="Delete Record"
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* ────────────────── TAB 1: WORK EXPERIENCE ────────────────── */}
              {activeTab === 1 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                      Prior Professional Experience (የሥራ ልምድ መዝገብ)
                    </Typography>
                    <Button
                      variant={showAddExp ? "outlined" : "contained"}
                      startIcon={showAddExp ? <X size={16} /> : <Plus size={16} />}
                      onClick={() => setShowAddExp(!showAddExp)}
                      sx={{ textTransform: "none", fontWeight: "bold", bgcolor: showAddExp ? "transparent" : "#0d47a1" }}
                    >
                      {showAddExp ? "Cancel" : "+ Add Work Experience (የሥራ ልምድ ጨምር)"}
                    </Button>
                  </Box>

                  {/* Add Experience Form */}
                  {showAddExp && (
                    <Card variant="outlined" sx={{ p: 2.5, mb: 3, bgcolor: "#f1f7fe", borderColor: "#90caf9", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                        Register Prior Employment Experience
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Organization Name (የመሥሪያ ቤቱ ስም)*"
                            value={expForm.organizationName}
                            onChange={(e) => setExpForm({ ...expForm, organizationName: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Job Position (የሥራ መደብ)*"
                            value={expForm.yesraMedeb}
                            onChange={(e) => setExpForm({ ...expForm, yesraMedeb: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="Monthly Salary (የነበረው ደመወዝ ብር)"
                            value={expForm.demewezMeten}
                            onChange={(e) => setExpForm({ ...expForm, demewezMeten: e.target.value })}
                          />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Employed From (የተቀጠረበት ቀን)*"
                            InputLabelProps={{ shrink: true }}
                            value={expForm.employeedFrom}
                            onChange={(e) => setExpForm({ ...expForm, employeedFrom: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Employed To (የለቀቀበት ቀን)"
                            InputLabelProps={{ shrink: true }}
                            value={expForm.employeedTo}
                            onChange={(e) => setExpForm({ ...expForm, employeedTo: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Reason for Leaving (የመልቀቂያ ምክንያት)"
                            value={expForm.reasonForLeaving}
                            onChange={(e) => setExpForm({ ...expForm, reasonForLeaving: e.target.value })}
                          />
                        </Grid>

                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button size="small" onClick={() => setShowAddExp(false)}>Cancel</Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddExperience}
                            sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}
                          >
                            Save Work Experience
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  {/* Experience Table */}
                  {loadingExp ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : experienceList.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No prior work experience recorded yet for this employee.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Organization (መሥሪያ ቤት)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Position (የሥራ መደብ)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Salary</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Duration</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Reason for Leaving</TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {experienceList.map((exp) => (
                            <TableRow key={exp.id} hover>
                              <TableCell sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                                {exp.organizationName}
                              </TableCell>
                              <TableCell>{exp.yesraMedeb}</TableCell>
                              <TableCell>ETB {Number(exp.demewezMeten || 0).toLocaleString()}</TableCell>
                              <TableCell>
                                {exp.employeedFrom} → {exp.employeedTo || "Present"}
                              </TableCell>
                              <TableCell>{exp.reasonForLeaving || "-"}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteExperience(exp.id)}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* ────────────────── TAB 2: SKILLS & COMPETENCIES ──────────── */}
              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                      Specialized Skills & Competencies (የክህሎትና የብቃት መዝገብ)
                    </Typography>
                    <Button
                      variant={showAddSkill ? "outlined" : "contained"}
                      startIcon={showAddSkill ? <X size={16} /> : <Plus size={16} />}
                      onClick={() => setShowAddSkill(!showAddSkill)}
                      sx={{ textTransform: "none", fontWeight: "bold", bgcolor: showAddSkill ? "transparent" : "#0d47a1" }}
                    >
                      {showAddSkill ? "Cancel" : "+ Add Skill (ክህሎት ጨምር)"}
                    </Button>
                  </Box>

                  {/* Add Skill Form */}
                  {showAddSkill && (
                    <Card variant="outlined" sx={{ p: 2.5, mb: 3, bgcolor: "#f1f7fe", borderColor: "#90caf9", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                        Add Special Technical or Managerial Competency
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Skill Name (የክህሎት ስም)*"
                            placeholder="e.g. Water Quality Analysis, Leak Detection, SCADA"
                            value={skillForm.chlotaSm}
                            onChange={(e) => setSkillForm({ ...skillForm, chlotaSm: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Proficiency Level</InputLabel>
                            <Select
                              value={skillForm.chlotaLevel}
                              label="Proficiency Level"
                              onChange={(e) => setSkillForm({ ...skillForm, chlotaLevel: e.target.value })}
                            >
                              <MenuItem value="BASIC">BASIC (መሰረታዊ)</MenuItem>
                              <MenuItem value="INTERMEDIATE">INTERMEDIATE (መካከለኛ)</MenuItem>
                              <MenuItem value="ADVANCED">ADVANCED (ከፍተኛ)</MenuItem>
                              <MenuItem value="EXPERT">EXPERT (ባለሙያ)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Tag / Label"
                            placeholder="e.g. Laboratory, Technical, IT, Electrical"
                            value={skillForm.chlotaLabel}
                            onChange={(e) => setSkillForm({ ...skillForm, chlotaLabel: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Remark / Certification Details"
                            placeholder="Optional notes or certificate reference"
                            value={skillForm.chlotaRemark}
                            onChange={(e) => setSkillForm({ ...skillForm, chlotaRemark: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button size="small" onClick={() => setShowAddSkill(false)}>Cancel</Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddSkill}
                            sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}
                          >
                            Save Skill
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  {/* Skills Grid */}
                  {loadingSkill ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : skillList.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No skills registered yet for this employee.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {skillList.map((skill) => (
                        <Grid item xs={12} sm={6} md={4} key={skill.id}>
                          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, position: "relative" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                                  {skill.chlotaSm}
                                </Typography>
                                {skill.chlotaLabel && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                    Category: {skill.chlotaLabel}
                                  </Typography>
                                )}
                              </Box>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteSkill(skill.id)}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                size="small"
                                label={skill.chlotaLevel}
                                color={
                                  skill.chlotaLevel === "EXPERT"
                                    ? "success"
                                    : skill.chlotaLevel === "ADVANCED"
                                    ? "primary"
                                    : "default"
                                }
                                sx={{ fontWeight: "bold" }}
                              />
                            </Box>
                            {skill.chlotaRemark && (
                              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontSize: "0.8rem" }}>
                                {skill.chlotaRemark}
                              </Typography>
                            )}
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* ────────────────── TAB 3: FAMILY & DEPENDENTS ───────────── */}
              {activeTab === 3 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                      Registered Family & Dependents (የቤተሰብ እና የልጆች መዝገብ)
                    </Typography>
                    <Button
                      variant={showAddDep ? "outlined" : "contained"}
                      startIcon={showAddDep ? <X size={16} /> : <Plus size={16} />}
                      onClick={() => setShowAddDep(!showAddDep)}
                      sx={{ textTransform: "none", fontWeight: "bold", bgcolor: showAddDep ? "transparent" : "#0d47a1" }}
                    >
                      {showAddDep ? "Cancel" : "+ Add Dependent (ልጅ / ጥገኛ መዝግብ)"}
                    </Button>
                  </Box>

                  {/* Add Dependent Form */}
                  {showAddDep && (
                    <Card variant="outlined" sx={{ p: 2.5, mb: 3, bgcolor: "#f1f7fe", borderColor: "#90caf9", borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                        Register Child or Dependent for Medical & Benefits Coverage
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Dependent Full Name (የልጁ ሙሉ ስም)*"
                            value={depForm.yeljMuluSm}
                            onChange={(e) => setDepForm({ ...depForm, yeljMuluSm: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Gender (ጾታ)*</InputLabel>
                            <Select
                              value={depForm.tsota}
                              label="Gender (ጾታ)*"
                              onChange={(e) => setDepForm({ ...depForm, tsota: e.target.value })}
                            >
                              <MenuItem value="MALE">ወንድ (Male)</MenuItem>
                              <MenuItem value="FEMALE">ሴት (Female)</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label="Date of Birth (የትውልድ ቀን)*"
                            InputLabelProps={{ shrink: true }}
                            value={depForm.birthDate}
                            onChange={(e) => setDepForm({ ...depForm, birthDate: e.target.value })}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Parent / Guardian Name (የአባት ወይም የእናት ስም)"
                            value={depForm.yeabatOrEnatMulusm}
                            onChange={(e) => setDepForm({ ...depForm, yeabatOrEnatMulusm: e.target.value })}
                          />
                        </Grid>

                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <Button size="small" onClick={() => setShowAddDep(false)}>Cancel</Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleAddDependent}
                            sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}
                          >
                            Save Dependent
                          </Button>
                        </Grid>
                      </Grid>
                    </Card>
                  )}

                  {/* Dependents Table */}
                  {loadingDep ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : dependentList.length === 0 ? (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      No family dependents registered yet for this employee.
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Dependent Name (የልጁ ሙሉ ስም)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Gender (ጾታ)</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Date of Birth</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Parent / Guardian</TableCell>
                            <TableCell align="center" sx={{ fontWeight: "bold" }}>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dependentList.map((dep) => (
                            <TableRow key={dep.id} hover>
                              <TableCell sx={{ fontWeight: "bold", color: "#0d47a1" }}>
                                {dep.yeljMuluSm}
                              </TableCell>
                              <TableCell>{dep.tsota === "MALE" ? "ወንድ (Male)" : "ሴት (Female)"}</TableCell>
                              <TableCell>{dep.birthDate}</TableCell>
                              <TableCell>{dep.yeabatOrEnatMulusm || "-"}</TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteDependent(dep.id)}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* ────────────────── TAB 4: BANKING & BIOMETRICS ──────────── */}
              {activeTab === 4 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                    Disbursement Banking & Hardware Integration Summary
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f1f8e9", borderColor: "#c8e6c9" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#2e7d32", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                          <CreditCard size={20} /> Primary Bank (Monthly Net Salary)
                        </Typography>
                        <Typography variant="body2"><strong>Bank Name:</strong> {selectedEmp.primaryBankName || "Commercial Bank of Ethiopia"}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#1b5e20", mt: 1 }}>
                          Account: {selectedEmp.primaryBankAccount || "Not Configured"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Used for bulk CBE text/excel payroll electronic fund transfer.
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f3e5f5", borderColor: "#e1bee7" }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#7b1fa2", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                          <CreditCard size={20} /> Secondary Bank (Per Diem & Special)
                        </Typography>
                        <Typography variant="body2"><strong>Bank Name:</strong> {selectedEmp.secondaryBankName || "Abay Bank"}</Typography>
                        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#4a148c", mt: 1 }}>
                          Account: {selectedEmp.secondaryBankAccount || "Not Configured (Optional)"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Purpose: {selectedEmp.secondaryPaymentPurpose || "Field Allowances, Per Diem"}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0d47a1", mb: 2 }}>
                          Statutory IDs & Hardware Clocking
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">TIN Number</Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{selectedEmp.tinNumber || "N/A"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Pension Number (የጡረታ መለያ)</Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{selectedEmp.pensionNumber || "N/A"}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Biometric Device PIN</Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                              {selectedEmp.biometricPin || "Not Assigned"}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={3}>
                            <Typography variant="caption" color="text.secondary">Fayda National ID</Typography>
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>{selectedEmp.faydaNationalId || "N/A"}</Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: "#f8f9fa" }}>
              <Button onClick={() => setDossierOpen(false)} variant="contained" sx={{ bgcolor: "#0d47a1" }}>
                Close Dossier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* ────────────────────────────────────────────────────────────────────────
          ONBOARDING / BASIC PROFILE EDIT DIALOG
         ──────────────────────────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#0d47a1", color: "white", fontWeight: "bold" }}>
          {editingId ? "Edit Employee Profile" : "Onboard New Employee (አዲስ ሠራተኛ መመዝገቢያ)"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Employee ID (የሠራተኛ መለያ ቁጥር)*"
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Full Name (English)*"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="ሙሉ ስም (Amharic)*"
                value={form.fullNameAm}
                onChange={(e) => setForm({ ...form, fullNameAm: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="የእናት ስም (Mother's Name)"
                value={form.motherName}
                onChange={(e) => setForm({ ...form, motherName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>ጾታ (Gender)</InputLabel>
                <Select
                  value={form.sex}
                  label="ጾታ (Gender)"
                  onChange={(e) => setForm({ ...form, sex: e.target.value })}
                >
                  <MenuItem value="MALE">ወንድ (Male)</MenuItem>
                  <MenuItem value="FEMALE">ሴት (Female)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="የግብር ከፋይ ቁጥር (TIN Number)"
                value={form.tinNumber}
                onChange={(e) => setForm({ ...form, tinNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="የጡረታ መለያ ቁጥር (Pension Number)"
                value={form.pensionNumber}
                onChange={(e) => setForm({ ...form, pensionNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Biometric Device PIN"
                value={form.biometricPin}
                onChange={(e) => setForm({ ...form, biometricPin: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Basic Salary (መሰረታዊ ደመወዝ ብር)*"
                value={form.currentSalary}
                onChange={(e) => setForm({ ...form, currentSalary: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Duty Station (የሥራ ቦታ)"
                value={form.dutyStation}
                onChange={(e) => setForm({ ...form, dutyStation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Employment Status</InputLabel>
                <Select
                  value={form.employmentStatus}
                  label="Employment Status"
                  onChange={(e) => setForm({ ...form, employmentStatus: e.target.value })}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="PROBATION">PROBATION</MenuItem>
                  <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
                  <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Banking Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#0d47a1", mt: 1 }}>
                Dual Banking Configuration (የባንክ ሂሳቦች መረጃ)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Primary Bank Name (ዋና ባንክ)"
                value={form.primaryBankName}
                onChange={(e) => setForm({ ...form, primaryBankName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Primary Account Number (CBE)*"
                value={form.primaryBankAccount}
                onChange={(e) => setForm({ ...form, primaryBankAccount: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Secondary Bank Name (አማራጭ ባንክ)"
                value={form.secondaryBankName}
                onChange={(e) => setForm({ ...form, secondaryBankName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Secondary Account Number (Abay Bank)"
                value={form.secondaryBankAccount}
                onChange={(e) => setForm({ ...form, secondaryBankAccount: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} sx={{ bgcolor: "#0d47a1", fontWeight: "bold" }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
