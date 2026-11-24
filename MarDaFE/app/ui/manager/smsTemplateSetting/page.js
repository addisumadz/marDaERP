"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  TextField,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Tooltip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MessageIcon from "@mui/icons-material/Message";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import { SmsTemplateService } from "@/app/lib/smsTemplateService";

const smsTemplateService = new SmsTemplateService();
const queryClient = new QueryClient();

const PLACEHOLDERS = [
  { tag: "{customerName}", label: "የደንበኛ ስም (አማርኛ)", desc: "Customer Full Name (Amharic)", sample: "አበበ ከበደ" },
  { tag: "{customerNameEng}", label: "የደንበኛ ስም (እንግሊዝኛ)", desc: "Customer Full Name (English)", sample: "Abebe Kebede" },
  { tag: "{accountNumber}", label: "የውል ቁጥር", desc: "Contract / Account No", sample: "01-0023" },
  { tag: "{billMonth}", label: "የክፍያ ወር", desc: "Billing Month & Year", sample: "ጥር-2018 " },
  { tag: "{consumption}", label: "ፍጆታ (m³)", desc: "Water Consumption", sample: "12" },
  { tag: "{previousReading}", label: "ቀድሞ ንባብ", desc: "Previous Meter Reading", sample: "100" },
  { tag: "{currentReading}", label: "አሁን ንባብ", desc: "Current Meter Reading", sample: "112" },
  { tag: "{kotariKiray}", label: "የቆጣሪ ኪራይ", desc: "Meter Rent (kotariKiray)", sample: "10.00" },
  { tag: "{yezihWer}", label: "የዚህ ወር ሂሳብ", desc: "Current Month Charge (yezihWer)", sample: "150.00" },
  { tag: "{arrears}", label: "ውዝፍ ሂሳብ", desc: "Arrears / Outstanding (arrears)", sample: "0.00" },
  { tag: "{wuzifHisab}", label: "ውዝፍ ሂሳብ (wuzifHisab)", desc: "Arrears Amount (wuzifHisab)", sample: "0.00" },
  { tag: "{wuzifKezihEske}", label: "የውዝፍ ጊዜ", desc: "Arrears Period (wuzifKezihEske)", sample: "መስከረም-ጥቅምት" },
  { tag: "{wuzifWorBzat}", label: "የውዝፍ ወራት ብዛት", desc: "Arrears Months Count (wuzifWorBzat)", sample: "2" },
  { tag: "{kitat}", label: "ቅጣት", desc: "Penalty / Kitat (kitat)", sample: "0.00" },
  { tag: "{totalPayable}", label: "ጠቅላላ ክፍያ", desc: "Total Amount Payable", sample: "180.50" },
  { tag: "{dueDate}", label: "የክፍያ ቀን", desc: "Payment Deadline Date", sample: "30/05/2018" },
  { tag: "{companyName}", label: "የተቋሙ ስም (እንግሊዝኛ)", desc: "Water Utility / Company Name (English)", sample: "Merawi Water Utility" },
  { tag: "{companyNameAmharic}", label: "የተቋሙ ስም (አማርኛ)", desc: "Water Utility / Company Name (Amharic)", sample: "የመራዊ ውኃና ፍሳሽ አገልግሎት" },
];

const getSmsSegmentsInfo = (text) => {
  const len = (text || "").length;
  if (len === 0) return { len: 0, parts: 0, label: "0 SMS" };
  if (len <= 70) return { len, parts: 1, label: "1 SMS" };
  const parts = Math.ceil(len / 67);
  return { len, parts, label: `${parts} SMS parts (Multi-part SMPP)` };
};

const SmsTemplateSettingInner = () => {
  const queryClientInstance = useQueryClient();
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("BILL_SMS");
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [currentId, setCurrentId] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [templateContent, setTemplateContent] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const textAreaRef = useRef(null);

  // Fetch all templates
  const { data: templates = [], isLoading, refetch } = useQuery({
    queryKey: ["sms_templates_all"],
    queryFn: async () => {
      try {
        const list = await smsTemplateService.getAllTemplates();
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error("Error fetching templates:", err);
        return [];
      }
    },
  });

  // When templates load or selected template changes, populate the form
  useEffect(() => {
    if (isCreatingNew) return;

    if (templates && templates.length > 0) {
      let target = templates.find((t) => t.templateCode === selectedTemplateCode);
      if (!target) {
        target = templates.find((t) => t.templateCode === "BILL_SMS") || templates[0];
      }
      if (target) {
        setSelectedTemplateCode(target.templateCode);
        setCurrentId(target.id);
        setTemplateName(target.templateName || "");
        setTemplateContent(target.templateContent || "");
        setDescription(target.description || "");
        const activeFlag = target.isActive !== undefined ? target.isActive : target.active;
        setIsActive(activeFlag !== false);
        setIsModified(false);
      }
    }
  }, [templates, selectedTemplateCode, isCreatingNew]);

  // Handle switching dropdown selection
  const handleSelectTemplate = (code) => {
    if (code === "__NEW__") {
      handleStartNew();
      return;
    }
    setIsCreatingNew(false);
    setSelectedTemplateCode(code);
  };

  // Handle "+ New Template" action
  const handleStartNew = () => {
    setIsCreatingNew(true);
    setSelectedTemplateCode("__NEW__");
    setCurrentId(null);
    setTemplateName("");
    setTemplateContent(
      "ውድ ደንበኛችን {customerName} የውል ቁጥር {accountNumber} የ{billMonth}ወር ፍጆታ {consumption}m³ ውዝፍ {arrears}፣ጠቅላላ ክፍያ {totalPayable} ብር እስከ {dueDate} ድረስ ይክፈሉ፡፡ ({companyName})"
    );
    setDescription("");
    setIsActive(true);
    setIsModified(true);
  };

  // Insert placeholder tag at cursor position
  const handleInsertTag = (tag) => {
    const textarea = textAreaRef.current;
    if (!textarea) {
      setTemplateContent((prev) => prev + tag);
      setIsModified(true);
      return;
    }

    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const newText = templateContent.substring(0, start) + tag + templateContent.substring(end);
    setTemplateContent(newText);
    setIsModified(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  // Live sample preview calculation
  const samplePreviewText = useMemo(() => {
    if (!templateContent) return "";
    let rendered = templateContent;
    PLACEHOLDERS.forEach((p) => {
      rendered = rendered.split(p.tag).join(p.sample);
    });
    return rendered;
  }, [templateContent]);

  const templateMetrics = useMemo(() => getSmsSegmentsInfo(templateContent), [templateContent]);
  const previewMetrics = useMemo(() => getSmsSegmentsInfo(samplePreviewText), [samplePreviewText]);

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (payload) => smsTemplateService.saveTemplate(payload),
    onSuccess: (saved) => {
      toast.success("የSMS ፎርማቱ በተሳካ ሁኔታ ተቀምጧል! (Template saved successfully)");
      setIsModified(false);
      setIsCreatingNew(false);
      if (saved && saved.templateCode) {
        setSelectedTemplateCode(saved.templateCode);
      }
      queryClientInstance.invalidateQueries({ queryKey: ["sms_templates_all"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to save template");
    },
  });

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.warning("እባክዎ የፎርማቱን ስም (Template Name) ያስገቡ።");
      return;
    }
    if (!templateContent.trim()) {
      toast.warning("እባክዎ የSMS ጽሑፉን (Template Content) ያስገቡ።");
      return;
    }

    const payload = {
      id: isCreatingNew ? null : currentId,
      templateCode: isCreatingNew ? null : (selectedTemplateCode !== "__NEW__" ? selectedTemplateCode : null),
      templateName: templateName.trim(),
      templateContent: templateContent.trim(),
      description: description.trim(),
      isActive: Boolean(isActive),
      active: Boolean(isActive),
    };

    saveMutation.mutate(payload);
  };

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (code) => smsTemplateService.deleteTemplate(code),
    onSuccess: () => {
      toast.info("የSMS ፎርማቱ ተሰርዟል! (Template deleted)");
      setIsCreatingNew(false);
      setSelectedTemplateCode("BILL_SMS");
      queryClientInstance.invalidateQueries({ queryKey: ["sms_templates_all"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to delete template");
    },
  });

  const handleDelete = () => {
    if (selectedTemplateCode === "BILL_SMS" || selectedTemplateCode === "__NEW__") {
      toast.warning("ዋናው ነባሪ ፎርማት (BILL_SMS) ሊሰረዝ አይችልም።");
      return;
    }
    if (window.confirm(`እርግጠኛ ነዎት "${templateName}" የሚለውን ፎርማት መሰረዝ ይፈልጋሉ?`)) {
      deleteMutation.mutate(selectedTemplateCode);
    }
  };

  // Reset to default
  const resetMutation = useMutation({
    mutationFn: () => smsTemplateService.resetTemplate("BILL_SMS"),
    onSuccess: (reset) => {
      toast.info("ፎርማቱ ወደ ሲስተሙ ነባሪ ተመልሷል! (Template reset to system default)");
      setTemplateContent(reset.templateContent || "");
      if (reset.templateName) setTemplateName(reset.templateName);
      setIsModified(false);
      queryClientInstance.invalidateQueries({ queryKey: ["sms_templates_all"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err.message || "Failed to reset template");
    },
  });

  const handleReset = () => {
    if (window.confirm("እርግጠኛ ነዎት የቢል SMS ፎርማቱን ወደ ሲስተሙ መጀመሪያ ነባሪ መመለስ ይፈልጋሉ?")) {
      resetMutation.mutate();
    }
  };

  const isDefaultTemplate = selectedTemplateCode === "BILL_SMS";

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <ToastContainer position="top-right" autoClose={3500} />
      <Breadcrumb pageName="የSMS ፎርማት ማስተካከያ (SMS Template Settings)" />

      {/* Header Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #e2e8f0",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#ffffff",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <MessageIcon sx={{ fontSize: 32, color: "#38bdf8" }} />
              <Typography variant="h5" fontWeight={700}>
                የቢል SMS ፎርማት ማስተካከያ (SMS Templates)
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
              የተለያዩ የቢል ማሳወቂያ ፎርማቶችን እዚህ ይመዝግቡ፣ ያቀናብሩ ወይም ይምረጡ።
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <Button
              component={Link}
              href="/ui/manager/SendBillSms"
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: "#e2e8f0",
                borderColor: "#475569",
                textTransform: "none",
                "&:hover": { borderColor: "#94a3b8", bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              ወደ ቢል SMS መላኪያ
            </Button>
            {isDefaultTemplate && !isCreatingNew && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                disabled={resetMutation.isPending}
                sx={{ textTransform: "none" }}
              >
                ነባሪውን መልስ (Reset)
              </Button>
            )}
            {!isDefaultTemplate && !isCreatingNew && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                sx={{ textTransform: "none" }}
              >
                ሰርዝ (Delete)
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={saveMutation.isPending ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saveMutation.isPending || isLoading}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              }}
            >
              {saveMutation.isPending ? "በማስቀመጥ ላይ..." : "ፎርማቱን መዝግብ (Save)"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Template Selection & Creation Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{ minWidth: { xs: "100%", sm: 360 } }}>
            <FormControl fullWidth size="small">
              <InputLabel id="template-select-label">የተመዘገቡ ፎርማቶች (Select Template)</InputLabel>
              <Select
                labelId="template-select-label"
                value={isCreatingNew ? "__NEW__" : selectedTemplateCode}
                label="የተመዘገቡ ፎርማቶች (Select Template)"
                onChange={(e) => handleSelectTemplate(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {templates.map((t) => (
                  <MenuItem key={t.templateCode} value={t.templateCode}>
                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="space-between" width="100%">
                      <Typography variant="body2" fontWeight={600}>
                        {t.templateName || t.templateCode}
                      </Typography>
                      {t.templateCode === "BILL_SMS" && (
                        <Chip size="small" label="Default" color="primary" sx={{ height: 20, fontSize: "0.7rem" }} />
                      )}
                    </Stack>
                  </MenuItem>
                ))}
                <Divider sx={{ my: 0.5 }} />
                <MenuItem value="__NEW__" sx={{ color: "#2563eb", fontWeight: 700 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>+ አዲስ ፎርማት መዝግብ (+ New Template)</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant={isCreatingNew ? "contained" : "outlined"}
              color="primary"
              startIcon={<AddCircleOutlineIcon />}
              onClick={handleStartNew}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              + አዲስ ፎርማት (New Template)
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {isLoading ? (
        <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px solid #e2e8f0" }}>
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            የSMS ፎርማቶች ከዳታቤዝ በመጫን ላይ...
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {/* Left Column: Template Editor & Placeholder Bank */}
          <Grid item xs={12} lg={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                  {isCreatingNew ? "አዲስ የSMS ፎርማት መመዝገቢያ" : "የSMS ጽሑፍ ፎርማት አርታዒ (Template Editor)"}
                </Typography>
                {isDefaultTemplate && (
                  <Chip label="System Default Template" size="small" color="primary" variant="outlined" />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                የፎርማት ስም ይስጡ፣ ተለዋዋጭ ቃላትን (Placeholders) በመጠቀም የሚላከውን መልዕክት ያዘጋጁ።
              </Typography>

              {/* Template Name & Status Bar */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    label="የፎርማት ስም (Template Name)"
                    placeholder="ለምሳሌ፡ መደበኛ የውሃ ቢል ማሳወቂያ ወይም የቅጣት ማስጠንቀቂያ"
                    value={templateName}
                    onChange={(e) => {
                      setTemplateName(e.target.value);
                      setIsModified(true);
                    }}
                    required
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={(e) => {
                          setIsActive(e.target.checked);
                          setIsModified(true);
                        }}
                        color="success"
                      />
                    }
                    label={isActive ? "ንቁ (Active)" : "ያልነቃ (Inactive)"}
                    sx={{ height: "100%", m: 0 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ማብራሪያ (Description - Optional)"
                    placeholder="ስለዚህ ፎርማት አጭር መግለጫ"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setIsModified(true);
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
              </Grid>

              {/* Placeholder Chip Bank */}
              <Box sx={{ mb: 2.5, p: 2, bgcolor: "#f1f5f9", borderRadius: 2, border: "1px dashed #cbd5e1" }}>
                <Typography variant="caption" fontWeight={700} color="#475569" sx={{ display: "block", mb: 1 }}>
                  ለመጨመር የሚጫኑ ተለዋዋጭ ቃላት (Click chip to insert at cursor):
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {PLACEHOLDERS.map((p) => (
                    <Tooltip key={p.tag} title={`${p.desc} (Example: ${p.sample})`} arrow>
                      <Chip
                        label={`${p.label} ${p.tag}`}
                        size="small"
                        clickable
                        onClick={() => handleInsertTag(p.tag)}
                        sx={{
                          bgcolor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          "&:hover": { bgcolor: "#e2e8f0", borderColor: "#94a3b8" },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Box>

              {/* Template Editor TextArea */}
              <TextField
                inputRef={textAreaRef}
                fullWidth
                multiline
                rows={6}
                value={templateContent}
                onChange={(e) => {
                  setTemplateContent(e.target.value);
                  setIsModified(true);
                }}
                label="የSMS መልዕክት ፎርማት (Template Content)"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "1rem",
                    lineHeight: 1.7,
                    fontFamily: "Nyala, 'Noto Sans Ethiopic', sans-serif",
                    bgcolor: "#fafafa",
                    borderRadius: 2,
                  },
                }}
              />

              {/* Character & Segment Counter Bar */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mt: 1.5, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}
              >
                <Typography variant="body2" color="text.secondary">
                  የፎርማቱ ርዝመት: <strong>{templateMetrics.len}</strong> ፊደላት
                </Typography>
                <Chip
                  size="small"
                  label={`ግምታዊ ክፍሎች: ${templateMetrics.label}`}
                  color={templateMetrics.parts <= 1 ? "success" : templateMetrics.parts === 2 ? "primary" : "warning"}
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              {isModified && (
                <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                  ለውጦች ተደርገዋል! ፎርማቱ በሁሉም ገጾች እንዲሠራ <strong>"ፎርማቱን መዝግብ (Save)"</strong> የሚለውን ይጫኑ።
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Right Column: Live Sample Preview & Helper Info */}
          <Grid item xs={12} lg={5}>
            <Stack spacing={3}>
              {/* Live Preview Card */}
              <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #93c5fd", bgcolor: "#eff6ff" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <VisibilityIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700} color="#1e3a8a">
                      የቀጥታ ቅድመ-ዕይታ (Live Message Preview)
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    ደንበኛው የሚደርሰው መልዕክት በናሙና መረጃ እንዲህ ይታያል:
                  </Typography>

                  {/* Phone Simulator Display */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#ffffff",
                      borderRadius: 2,
                      border: "1px solid #bfdbfe",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.7,
                        fontSize: "0.95rem",
                        color: "#0f172a",
                        fontFamily: "Nyala, 'Noto Sans Ethiopic', sans-serif",
                      }}
                    >
                      {samplePreviewText || "(ምንም ጽሑፍ አልተጻፈም)"}
                    </Typography>
                  </Box>

                  {/* Preview Metrics */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                    <Typography variant="caption" fontWeight={600} color="#1e40af">
                      ጠቅላላ ፊደላት: {previewMetrics.len}
                    </Typography>
                    <Chip
                      size="small"
                      label={previewMetrics.label}
                      color={previewMetrics.parts <= 1 ? "success" : previewMetrics.parts === 2 ? "primary" : "warning"}
                      sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Explanatory Guide Card */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <InfoOutlinedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                    ስለ ኢትዮ ቴሌኮም SMS መመሪያ
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: "0.85rem" }}>
                  • <strong>1 SMS ክፍል:</strong> እስከ 70 የአማርኛ (UCS-2) ፊደላት።
                  <br />
                  • <strong>2 SMS ክፍሎች:</strong> ከ 71 እስከ 134 ፊደላት (በቀጥታ SMPP UDH ተቀናጅቶ ይላካል)።
                  <br />
                  • <strong>3 SMS ክፍሎች:</strong> ከ 135 እስከ 201 ፊደላት።
                  <br />
                  • ሲስተሙ እስከ 3 ክፍሎች በራስ-ሰር ደንበኛው ጋር እንደ 1 መልዕክት ተጣምሮ እንዲደርስ ያደርጋል።
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default function SmsTemplateSettingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SmsTemplateSettingInner />
    </QueryClientProvider>
  );
}
