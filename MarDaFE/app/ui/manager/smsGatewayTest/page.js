"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Chip,
  Stack,
  Alert,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";

// Icons
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MessageIcon from "@mui/icons-material/Message";
import PhoneIcon from "@mui/icons-material/Phone";
import HistoryIcon from "@mui/icons-material/History";
import SpeedIcon from "@mui/icons-material/Speed";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close";
import RouterIcon from "@mui/icons-material/Router";

import { SmsService } from "@/app/lib/smsService";
import addressCityService from "@/app/lib/addressCityService";
import { CampanyProfileService } from "@/app/lib/campanyProfileService";

const smsService = new SmsService();
const companyProfileService = new CampanyProfileService();

const modernSelectSx = {
  borderRadius: 2,
  bgcolor: "#f8fafc",
  "& .MuiSelect-select": {
    color: "#1e293b !important",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  "& .MuiSelect-select em": {
    fontStyle: "normal",
    color: "#64748b !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#cbd5e1",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#94a3b8",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#3b82f6",
  },
  "& .MuiInputLabel-root": {
    color: "#475569 !important",
    fontWeight: 600,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#2563eb !important",
  },
  "& .MuiSvgIcon-root": {
    color: "#64748b",
  },
};

const modernMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 340,
      borderRadius: 2.5,
      bgcolor: "#ffffff !important",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
      border: "1px solid #e2e8f0",
      "& .MuiList-root": {
        py: 0.5,
      },
      "& .MuiMenuItem-root": {
        fontSize: "0.875rem",
        color: "#1e293b !important",
        fontWeight: 500,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        mx: 0.5,
        my: 0.2,
        "& em": {
          fontStyle: "normal",
          color: "#64748b !important",
        },
        "&:hover": {
          bgcolor: "#f1f5f9 !important",
          color: "#0f172a !important",
        },
        "&.Mui-selected": {
          bgcolor: "#eff6ff !important",
          color: "#2563eb !important",
          fontWeight: 700,
          "&:hover": {
            bgcolor: "#dbeafe !important",
          },
        },
      },
    },
  },
};

const SmsGatewayTestInner = () => {
  // Target City Selection
  const [selectedCityId, setSelectedCityId] = useState("");

  // Test Message States
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("የሙከራ የSMS መልዕክት ከMarDa ERP");
  const [sendingMethod, setSendingMethod] = useState("AUTO"); // AUTO, SMPP, HTTP_REST, JASMIN
  const [isSending, setIsSending] = useState(false);

  // Live Diagnostic Result
  const [lastResult, setLastResult] = useState(null);

  // Session History Log
  const [testHistory, setTestHistory] = useState([]);

  // Gateway Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [modalSettingId, setModalSettingId] = useState(null);
  const [modalCityId, setModalCityId] = useState("");
  const [modalCityName, setModalCityName] = useState("Default");
  const [modalProtocol, setModalProtocol] = useState("SMPP");
  const [modalGatewayUrl, setModalGatewayUrl] = useState("https://smsethiopia.et/api/sms/send");
  const [modalApiKey, setModalApiKey] = useState("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
  const [modalSmppHost, setModalSmppHost] = useState("10.204.181.70");
  const [modalSmppPort, setModalSmppPort] = useState(5019);
  const [modalSmppSystemId, setModalSmppSystemId] = useState("8581");
  const [modalSmppPassword, setModalSmppPassword] = useState("pass@123");
  const [modalSenderId, setModalSenderId] = useState("testsender");
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalDescription, setModalDescription] = useState("");
  const [isSavingDbSetting, setIsSavingDbSetting] = useState(false);
  const [isDeletingDbSetting, setIsDeletingDbSetting] = useState(false);

  // Local fallback
  const [gatewayUrl, setGatewayUrl] = useState("https://smsethiopia.et/api/sms/send");
  const [apiKey, setApiKey] = useState("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");

  // Company Profile
  const { data: companyProfile } = useQuery({
    queryKey: ["sms_test_companyProfile"],
    queryFn: () => companyProfileService.getCampanyProfile(),
    staleTime: 30 * 60 * 1000,
  });

  // Address Cities Query
  const { data: addressCities = [] } = useQuery({
    queryKey: ["sms_test_addressCities"],
    queryFn: async () => {
      try {
        const res = await addressCityService.getAllAddressCities();
        return Array.isArray(res) ? res : (res?.data || []);
      } catch (err) {
        console.error("Error fetching address cities:", err);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  // Database SMS Settings Query (Table: sms_setting)
  const {
    data: dbSmsSettings = [],
    isLoading: isLoadingDbSettings,
    refetch: refetchDbSettings,
  } = useQuery({
    queryKey: ["sms_test_db_settings"],
    queryFn: async () => {
      try {
        const res = await smsService.getSmsSettings();
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error("Error fetching db SMS settings:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Active Gateway Configuration based on selected city filter or fallback
  const activeGatewayConfig = useMemo(() => {
    if (selectedCityId && Array.isArray(dbSmsSettings) && dbSmsSettings.length > 0) {
      const cityMatch = dbSmsSettings.find(
        (s) => s.isActive && String(s.cityId) === String(selectedCityId)
      );
      if (cityMatch) return cityMatch;
    }
    if (Array.isArray(dbSmsSettings) && dbSmsSettings.length > 0) {
      const defaultMatch = dbSmsSettings.find(
        (s) => s.isActive && (!s.cityId || s.cityName?.toLowerCase() === "default")
      );
      if (defaultMatch) return defaultMatch;
      const anyActive = dbSmsSettings.find((s) => s.isActive);
      if (anyActive) return anyActive;
    }
    return {
      id: null,
      cityId: null,
      cityName: "Default",
      protocol: "SMPP",
      gatewayUrl: gatewayUrl || "https://smsethiopia.et/api/sms/send",
      apiKey: apiKey || "2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027",
      smppHost: "10.204.181.70",
      smppPort: 5019,
      smppSystemId: "85819",
      senderId: "testsender",
      isActive: true,
    };
  }, [selectedCityId, dbSmsSettings, gatewayUrl, apiKey]);

  // Sync active gateway to form on initial load or city change
  useEffect(() => {
    if (activeGatewayConfig) {
      setGatewayUrl(activeGatewayConfig.gatewayUrl || "https://smsethiopia.et/api/sms/send");
      setApiKey(activeGatewayConfig.apiKey || "");
    }
  }, [activeGatewayConfig]);

  // Character Encoding & Segment Calculations
  const messageStats = useMemo(() => {
    const text = testMessage || "";
    // Check if contains non-ASCII characters (e.g. Ethiopic / Amharic)
    const isUnicode = /[^\u0000-\u007F]/.test(text);
    const length = text.length;

    // Standard SMS segment sizing
    let maxSingle = isUnicode ? 70 : 160;
    let maxConcat = isUnicode ? 67 : 153;
    let parts = 1;

    if (length > maxSingle) {
      parts = Math.ceil(length / maxConcat);
    }

    return {
      length,
      isUnicode,
      encoding: isUnicode ? "UCS-2 (Unicode / Amharic)" : "GSM 7-bit (ASCII)",
      parts,
    };
  }, [testMessage]);

  // Execute SMS Send
  const handleSendTestSms = async (forcedProtocol = null) => {
    const phone = testPhoneNumber.trim();
    const msg = testMessage.trim();

    if (!phone) {
      toast.warning("Please enter a destination phone number.");
      return;
    }
    if (!msg) {
      toast.warning("Please enter a message to send.");
      return;
    }

    const targetProtocol = forcedProtocol || (sendingMethod === "AUTO" ? (activeGatewayConfig?.protocol || "SMPP") : sendingMethod);
    const effCityId = activeGatewayConfig?.cityId ? Number(activeGatewayConfig.cityId) : null;
    const startTime = Date.now();

    setIsSending(true);
    setLastResult(null);

    try {
      let res;
      let finalProtocolUsed = targetProtocol;

      if (targetProtocol === "JASMIN") {
        // Send via Jasmin HTTP endpoint
        const rawRes = await smsService.sendTestSmsViaJasmin({
          phoneNumber: phone,
          message: msg,
        });
        const duration = Date.now() - startTime;
        res = {
          success: true,
          phoneNumber: phone,
          message: rawRes || "SMS via Jasmin dispatched successfully!",
          duration,
          protocol: "Jasmin HTTP API",
        };
        toast.success("SMS via Jasmin sent successfully!");
      } else {
        // Send via Gateway Test endpoint (SMPP or HTTP REST)
        const isSmpp = targetProtocol === "SMPP";
        const effUrl = activeGatewayConfig?.gatewayUrl || "https://smsethiopia.et/api/sms/send";
        const effKey = activeGatewayConfig?.apiKey || "";

        if (!isSmpp && !effKey.trim()) {
          toast.warning("Please configure an HTTP API Key first.");
          setShowConfigModal(true);
          setIsSending(false);
          return;
        }

        const gatewayRes = await smsService.testGatewaySms({
          protocol: isSmpp ? "SMPP" : "HTTP_REST",
          cityId: effCityId,
          gatewayUrl: effUrl,
          apiKey: effKey,
          phoneNumber: phone,
          message: msg,
        });

        const duration = Date.now() - startTime;
        res = {
          success: gatewayRes?.success !== false,
          phoneNumber: phone,
          error: gatewayRes?.error,
          message: gatewayRes?.message || (gatewayRes?.success ? "Message delivered successfully!" : "Failed to deliver"),
          duration,
          protocol: isSmpp ? "Direct SMPP (SMSC)" : "HTTP REST Gateway",
        };

        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.error || res.message || "Failed to send SMS");
        }
      }

      setLastResult(res);

      // Add to session log
      setTestHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          phoneNumber: phone,
          message: msg,
          protocol: res.protocol,
          status: res.success ? "SUCCESS" : "FAILED",
          duration: `${res.duration}ms`,
          details: res.error || res.message,
        },
        ...prev.slice(0, 49), // Keep last 50
      ]);
    } catch (err) {
      console.error("Test SMS Error:", err);
      const duration = Date.now() - startTime;
      const errMsg = err?.response?.data || err.message || "Network error while sending SMS";
      const failedResult = {
        success: false,
        phoneNumber: phone,
        error: errMsg,
        message: "Request failed: " + errMsg,
        duration,
        protocol: targetProtocol,
      };
      setLastResult(failedResult);
      toast.error(errMsg);

      setTestHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          phoneNumber: phone,
          message: msg,
          protocol: targetProtocol,
          status: "FAILED",
          duration: `${duration}ms`,
          details: errMsg,
        },
        ...prev.slice(0, 49),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Quick Message Templates
  const handleApplyTemplate = (type) => {
    if (type === "amharic_test") {
      setTestMessage("የሙከራ የSMS መልዕክት ከMarDa ERP ውሃና ፍሳሽ አስተዳደር ሲስተም።");
    } else if (type === "bill_sample") {
      setTestMessage("ውድ ደንበኛችን፡ ሒሳብ ቁጥር: ACC-001፣ የ01/2017 ወር ንባብ: 250m3፣ የፍጆታ ሂሳብ: 450.00 ብር። እባክዎ እስከ 30/01/2017 ይክፈሉ።");
    } else if (type === "clear") {
      setTestMessage("");
    }
  };

  // Modal Handlers (Replicated from SendBillSms)
  const handleSelectCityInModal = (cityIdVal) => {
    setModalCityId(cityIdVal);
    if (!cityIdVal) {
      setModalCityName("Default");
      const defaultSetting = dbSmsSettings.find(
        (s) => !s.cityId || s.cityName?.toLowerCase() === "default"
      );
      if (defaultSetting) {
        setModalSettingId(defaultSetting.id);
        setModalProtocol(defaultSetting.protocol || "SMPP");
        setModalGatewayUrl(defaultSetting.gatewayUrl || "https://smsethiopia.et/api/sms/send");
        setModalApiKey(defaultSetting.apiKey || "");
        setModalSmppHost(defaultSetting.smppHost || "10.204.181.70");
        setModalSmppPort(defaultSetting.smppPort || 5019);
        setModalSmppSystemId(defaultSetting.smppSystemId || "8581");
        setModalSmppPassword(defaultSetting.smppPassword || "pass@123");
        setModalSenderId(defaultSetting.senderId || (defaultSetting.protocol === "SMPP" ? "testsender" : "MarDa ERP"));
        setModalIsActive(defaultSetting.isActive !== false);
        setModalDescription(defaultSetting.description || "");
      } else {
        setModalSettingId(null);
        setModalProtocol("SMPP");
        setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
        setModalApiKey("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
        setModalSmppHost("10.204.181.70");
        setModalSmppPort(5019);
        setModalSmppSystemId("858122");
        setModalSmppPassword("22pass@123");
        setModalSenderId("testsender");
        setModalIsActive(true);
        setModalDescription("Default gateway fallback for all branches");
      }
    } else {
      const cityObj = addressCities.find((c) => String(c.id) === String(cityIdVal));
      const cName = cityObj?.name || cityObj?.cityName || `City ${cityIdVal}`;
      setModalCityName(cName);
      const existing = dbSmsSettings.find((s) => String(s.cityId) === String(cityIdVal));
      if (existing) {
        setModalSettingId(existing.id);
        setModalProtocol(existing.protocol || "SMPP");
        setModalGatewayUrl(existing.gatewayUrl || "https://smsethiopia.et/api/sms/send");
        setModalApiKey(existing.apiKey || "");
        setModalSmppHost(existing.smppHost || "10.204.181.70");
        setModalSmppPort(existing.smppPort || 5019);
        setModalSmppSystemId(existing.smppSystemId || "8581");
        setModalSmppPassword(existing.smppPassword || "pass@123");
        setModalSenderId(existing.senderId || cName);
        setModalIsActive(existing.isActive !== false);
        setModalDescription(existing.description || "");
      } else {
        setModalSettingId(null);
        setModalProtocol("SMPP");
        setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
        setModalApiKey("");
        setModalSmppHost("10.204.181.70");
        setModalSmppPort(5019);
        setModalSmppSystemId("8581");
        setModalSmppPassword("pass@123");
        setModalSenderId(cName);
        setModalIsActive(true);
        setModalDescription(`SMS Gateway for ${cName}`);
      }
    }
  };

  const handleEditDbSetting = (setting) => {
    setModalSettingId(setting.id);
    setModalCityId(setting.cityId ? String(setting.cityId) : "");
    setModalCityName(setting.cityName || "Default");
    setModalProtocol(setting.protocol || "SMPP");
    setModalGatewayUrl(setting.gatewayUrl || "https://smsethiopia.et/api/sms/send");
    setModalApiKey(setting.apiKey || "");
    setModalSmppHost(setting.smppHost || "10.204.181.70");
    setModalSmppPort(setting.smppPort || 5019);
    setModalSmppSystemId(setting.smppSystemId || "8581");
    setModalSmppPassword(setting.smppPassword || "pass@123");
    setModalSenderId(setting.senderId || (setting.protocol === "SMPP" ? "testsender" : "MarDa ERP"));
    setModalIsActive(setting.isActive !== false);
    setModalDescription(setting.description || "");
  };

  const handleResetModalForm = () => {
    setModalSettingId(null);
    setModalCityId("");
    setModalCityName("Default");
    setModalProtocol("SMPP");
    setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
    setModalApiKey("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
    setModalSmppHost("10.204.181.70");
    setModalSmppPort(5019);
    setModalSmppSystemId("858122");
    setModalSmppPassword("222pass@123");
    setModalSenderId("testsender");
    setModalIsActive(true);
    setModalDescription("");
  };

  const handleSaveDbSetting = async () => {
    if (modalProtocol === "SMPP") {
      if (!modalSmppHost?.trim()) {
        toast.warning("Please enter the SMPP Server Host IP.");
        return;
      }
      if (!modalSmppSystemId?.trim()) {
        toast.warning("Please enter the SMPP System ID / Username.");
        return;
      }
    } else {
      if (!modalGatewayUrl?.trim()) {
        toast.warning("Please enter a Gateway URL.");
        return;
      }
      if (!modalApiKey?.trim()) {
        toast.warning("Please enter an API Key / Token.");
        return;
      }
    }

    setIsSavingDbSetting(true);
    try {
      const payload = {
        id: modalSettingId || undefined,
        cityId: modalCityId ? Number(modalCityId) : null,
        cityName: modalCityName || (modalCityId ? `City ${modalCityId}` : "Default"),
        protocol: modalProtocol || "SMPP",
        gatewayUrl: modalGatewayUrl?.trim() || "https://smsethiopia.et/api/sms/send",
        apiKey: modalApiKey?.trim() || "",
        smppHost: modalSmppHost?.trim() || "10.204.181.70",
        smppPort: modalSmppPort ? Number(modalSmppPort) : 5019,
        smppSystemId: modalSmppSystemId?.trim() || "8581",
        smppPassword: modalSmppPassword?.trim() || "pass@123",
        senderId: modalSenderId.trim() || (modalProtocol === "SMPP" ? "testsender" : "MarDa ERP"),
        isActive: modalIsActive,
        description: modalDescription.trim(),
      };

      const saved = await smsService.saveSmsSetting(payload);
      toast.success(`SMS settings (${modalProtocol}) for '${saved?.cityName || modalCityName}' saved to database!`);
      await refetchDbSettings();
      if (saved?.id) {
        setModalSettingId(saved.id);
      }
    } catch (err) {
      console.error("Save SMS Setting Error:", err);
      toast.error(err?.response?.data || err.message || "Failed to save SMS setting to database.");
    } finally {
      setIsSavingDbSetting(false);
    }
  };

  const handleDeleteDbSetting = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete SMS setting for '${name || "this city"}'?`)) {
      return;
    }
    setIsDeletingDbSetting(true);
    try {
      await smsService.deleteSmsSetting(id);
      toast.info(`Deleted SMS setting for '${name}'`);
      await refetchDbSettings();
      if (modalSettingId === id) {
        handleResetModalForm();
      }
    } catch (err) {
      toast.error(err?.response?.data || err.message || "Failed to delete setting.");
    } finally {
      setIsDeletingDbSetting(false);
    }
  };

  const isSmpp = activeGatewayConfig?.protocol === "SMPP";

  return (
    <>
      <ToastContainer autoClose={4000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="SMS Gateway Test / የSMS ጌትዌይ መሞከሪያ" />

      <Box sx={{ mt: 3 }}>
        {/* Top Header Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px solid #e2e8f0",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <RouterIcon color="primary" /> SMS Gateway Diagnostics & Testing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Test live SMS dispatch via direct SMPP (Ethio Telecom SMSC) or HTTP REST Gateway using active database configurations.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<LocationCityIcon />}
              label={`Active: ${activeGatewayConfig?.cityName || "Default"} (${isSmpp ? "📡 SMPP" : "🌐 HTTP"} — ${activeGatewayConfig?.senderId || "testsender"})`}
              color={isSmpp ? (activeGatewayConfig?.smppHost ? "success" : "warning") : (activeGatewayConfig?.apiKey ? "success" : "warning")}
              variant="outlined"
              sx={{ fontWeight: 600, bgcolor: "#f8fafc", px: 0.5 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<SettingsIcon />}
              onClick={() => setShowConfigModal(true)}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Gateway Settings (DB)
            </Button>
            <Tooltip title="Refetch Database Configurations">
              <IconButton onClick={() => refetchDbSettings()} sx={{ border: "1px solid #cbd5e1" }}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>

        <Grid container spacing={2.5}>
          {/* Left Column: Target City & Active Gateway Spec Card */}
          <Grid item xs={12} md={4}>
            {/* Target City Selector Card */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 3, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b" mb={1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationCityIcon color="primary" fontSize="small" /> Target City / Branch
              </Typography>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="target-city-label">Select City Gateway</InputLabel>
                <Select
                  labelId="target-city-label"
                  value={selectedCityId}
                  label="Select City Gateway"
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="">
                    <em>🌐 Default / All Cities (Fallback Gateway)</em>
                  </MenuItem>
                  {addressCities.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.name || c.cityName || `City ${c.id}`} (ID: {c.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Select a specific city to test that city&apos;s custom SMS gateway settings.
              </Typography>
            </Paper>

            {/* Active Gateway Specifications Card */}
            <Card elevation={0} sx={{ borderRadius: 3, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                    Active Configuration Specs
                  </Typography>
                  <Chip
                    size="small"
                    label={isSmpp ? "📡 SMPP (SMSC)" : "🌐 HTTP REST"}
                    color={isSmpp ? "secondary" : "info"}
                    variant="filled"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>City / Scope</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">
                      {activeGatewayConfig?.cityName || "Default / Global"}
                    </Typography>
                  </Box>

                  <Divider />

                  {isSmpp ? (
                    <>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>SMSC Host IP & Port</Typography>
                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                          {activeGatewayConfig?.smppHost || "10.204.181.70"}:{activeGatewayConfig?.smppPort || 5019}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>System ID (Username)</Typography>
                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                          {activeGatewayConfig?.smppSystemId || "8581"}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Gateway URL</Typography>
                        <Typography variant="body2" fontWeight={600} color="#1e293b" sx={{ wordBreak: "break-all" }}>
                          {activeGatewayConfig?.gatewayUrl || "https://smsethiopia.et/api/sms/send"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>API Key / Token</Typography>
                        <Typography variant="body2" fontWeight={600} color="#1e293b">
                          {activeGatewayConfig?.apiKey ? `${activeGatewayConfig.apiKey.slice(0, 8)}...${activeGatewayConfig.apiKey.slice(-4)}` : "None"}
                        </Typography>
                      </Box>
                    </>
                  )}

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Sender ID / Mask</Typography>
                    <Typography variant="body2" fontWeight={600} color="#1e293b">
                      {activeGatewayConfig?.senderId || (isSmpp ? "testsender" : "MarDa ERP")}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Status</Typography>
                    <Box mt={0.5}>
                      <Chip
                        size="small"
                        label={activeGatewayConfig?.isActive !== false ? "Active & Ready" : "Inactive"}
                        color={activeGatewayConfig?.isActive !== false ? "success" : "default"}
                        variant="outlined"
                        sx={{ height: 22, fontSize: "0.75rem", fontWeight: 700 }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Send Test Form & Live Diagnostics */}
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, mb: 2.5, borderRadius: 3, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
              <Typography variant="h6" fontWeight={700} color="#1e293b" mb={2}>
                Send Test Message
              </Typography>

              {/* Recipient Phone Field */}
              <Box mb={2.5}>
                <TextField
                  fullWidth
                  label="Destination Phone Number"
                  placeholder="09... or 2519..."
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Format: 0911223344 or 251911223344"
                />
              </Box>

              {/* Quick Template Chips */}
              <Box mb={1.5}>
                <Typography variant="caption" fontWeight={700} color="#475569" mr={1.5}>
                  Quick Templates:
                </Typography>
                <Chip
                  label="የሙከራ መልዕክት (Amharic)"
                  size="small"
                  onClick={() => handleApplyTemplate("amharic_test")}
                  sx={{ mr: 1, my: 0.5, cursor: "pointer" }}
                />
                <Chip
                  label="Sample Bill Notification"
                  size="small"
                  onClick={() => handleApplyTemplate("bill_sample")}
                  sx={{ mr: 1, my: 0.5, cursor: "pointer" }}
                />
                <Chip
                  label="Clear Text"
                  size="small"
                  variant="outlined"
                  onClick={() => handleApplyTemplate("clear")}
                  sx={{ my: 0.5, cursor: "pointer" }}
                />
              </Box>

              {/* Message Multiline Field */}
              <Box mb={2}>
                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  label="Test Message Text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter message content to test delivery..."
                />
                {/* Character & Encoding Counter */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={0.8} px={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Encoding: <strong>{messageStats.encoding}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Characters: <strong>{messageStats.length}</strong> | Segments: <strong>{messageStats.parts}</strong>
                  </Typography>
                </Stack>
              </Box>

              {/* Dispatch Action Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isSending || !testPhoneNumber.trim()}
                  startIcon={isSending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  onClick={() => handleSendTestSms()}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, px: 3, flex: { sm: 1 } }}
                >
                  {isSending ? "Dispatching..." : `Send via Active (${isSmpp ? "SMPP" : "HTTP"})`}
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  disabled={isSending || !testPhoneNumber.trim()}
                  onClick={() => handleSendTestSms("SMPP")}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Force SMPP
                </Button>

                <Button
                  variant="outlined"
                  color="info"
                  disabled={isSending || !testPhoneNumber.trim()}
                  onClick={() => handleSendTestSms("HTTP_REST")}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Force HTTP
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={isSending || !testPhoneNumber.trim()}
                  onClick={() => handleSendTestSms("JASMIN")}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, borderColor: "#cbd5e1" }}
                >
                  Via Jasmin
                </Button>
              </Stack>
            </Paper>

            {/* Live Diagnostics Card */}
            {lastResult && (
              <Alert
                severity={lastResult.success ? "success" : "error"}
                icon={lastResult.success ? <CheckCircleIcon fontSize="inherit" /> : <ErrorIcon fontSize="inherit" />}
                sx={{ mb: 2.5, borderRadius: 2.5 }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {lastResult.success ? "Message Dispatched Successfully!" : "Dispatch Failed"}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {lastResult.error || lastResult.message}
                </Typography>
                <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                  <Typography variant="caption">
                    Protocol: <strong>{lastResult.protocol}</strong>
                  </Typography>
                  <Typography variant="caption">
                    Destination: <strong>{lastResult.phoneNumber}</strong>
                  </Typography>
                  <Typography variant="caption">
                    Duration: <strong>{lastResult.duration}ms</strong>
                  </Typography>
                </Stack>
              </Alert>
            )}

            {/* Session Test History Table */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <HistoryIcon color="primary" fontSize="small" /> Session Test History ({testHistory.length})
                </Typography>
                {testHistory.length > 0 && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => setTestHistory([])}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Clear History
                  </Button>
                )}
              </Stack>

              {testHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" py={3} textAlign="center">
                  No tests sent in this session yet. Run a test above to view live latency and status records.
                </Typography>
              ) : (
                <TableContainer sx={{ maxHeight: 280 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f8fafc" }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Protocol</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Message</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Latency</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem" }} align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {testHistory.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell sx={{ fontSize: "0.75rem" }}>{item.timestamp}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", fontWeight: 600 }}>{item.phoneNumber}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>{item.protocol}</TableCell>
                          <TableCell sx={{ fontSize: "0.75rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.message}
                          </TableCell>
                          <TableCell sx={{ fontSize: "0.75rem" }}>{item.duration}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={item.status}
                              color={item.status === "SUCCESS" ? "success" : "error"}
                              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Load Phone & Message">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setTestPhoneNumber(item.phoneNumber);
                                  setTestMessage(item.message);
                                }}
                              >
                                <ReplayIcon fontSize="inherit" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Database Gateway Settings Management Modal */}
      <Dialog
        open={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SettingsIcon color="primary" /> SMS Gateway Configuration (Database Table: sms_setting)
          </Box>
          <IconButton size="small" onClick={() => setShowConfigModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {/* Section 1: Create / Edit Form */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle2" fontWeight={700} color="#334155">
                {modalSettingId ? `Edit Gateway Configuration (ID: ${modalSettingId})` : "Configure Gateway for City / Default"}
              </Typography>
              {modalSettingId && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleResetModalForm}
                  sx={{ textTransform: "none", fontSize: "0.8rem" }}
                >
                  Create New Gateway
                </Button>
              )}
            </Stack>

            <Grid container spacing={2}>
              {/* Protocol Selector */}
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth sx={modernSelectSx}>
                  <InputLabel id="modal-protocol-label">ፕሮቶኮል (Communication Protocol)</InputLabel>
                  <Select
                    labelId="modal-protocol-label"
                    value={modalProtocol}
                    label="ፕሮቶኮል (Communication Protocol)"
                    onChange={(e) => setModalProtocol(e.target.value)}
                    MenuProps={modernMenuProps}
                  >
                    <MenuItem value="SMPP" sx={{ color: "#1e293b !important", fontWeight: 600 }}>
                      📡 Direct SMPP Protocol (Ethio Telecom SMSC)
                    </MenuItem>
                    <MenuItem value="HTTP_REST" sx={{ color: "#1e293b !important", fontWeight: 600 }}>
                      🌐 HTTP REST Gateway (smsethiopia.et / Web API)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* City Selector */}
              <Grid item xs={12} sm={6}>
                <FormControl size="small" fullWidth sx={modernSelectSx}>
                  <InputLabel id="modal-city-label">ከተማ (City Selection)</InputLabel>
                  <Select
                    labelId="modal-city-label"
                    value={modalCityId}
                    label="ከተማ (City Selection)"
                    onChange={(e) => handleSelectCityInModal(e.target.value)}
                    MenuProps={modernMenuProps}
                  >
                    <MenuItem value="" sx={{ color: "#2563eb !important", fontWeight: 700 }}>
                      <em>🌐 Default / All Cities (Fallback Gateway)</em>
                    </MenuItem>
                    {addressCities?.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                        {c.name || c.cityName || `City ${c.id}`} (ID: {c.id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {modalProtocol === "SMPP" ? (
                <>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="SMPP Server Host IP"
                      value={modalSmppHost}
                      onChange={(e) => setModalSmppHost(e.target.value)}
                      placeholder="e.g. 10.204.181.70"
                      helperText="SMSC IP address"
                    />
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="SMPP Port"
                      value={modalSmppPort}
                      onChange={(e) => setModalSmppPort(e.target.value)}
                      placeholder="5019"
                      helperText="Default: 5019"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", height: "100%", pt: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={modalIsActive}
                            onChange={(e) => setModalIsActive(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={600} color={modalIsActive ? "success.main" : "text.secondary"}>
                            {modalIsActive ? "Active Gateway" : "Inactive"}
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="System ID / Username"
                      value={modalSmppSystemId}
                      onChange={(e) => setModalSmppSystemId(e.target.value)}
                      placeholder="e.g. 8581"
                      helperText="SMSC System ID"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="SMPP Password"
                      value={modalSmppPassword}
                      onChange={(e) => setModalSmppPassword(e.target.value)}
                      placeholder="SMPP Password"
                      helperText="Password for SMSC binding"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender ID / ስም"
                      value={modalSenderId}
                      onChange={(e) => setModalSenderId(e.target.value)}
                      placeholder="e.g. testsender"
                      helperText="Sender Mask / Source Address"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Gateway Endpoint URL"
                      value={modalGatewayUrl}
                      onChange={(e) => setModalGatewayUrl(e.target.value)}
                      placeholder="https://smsethiopia.et/api/sms/send"
                      helperText="HTTP REST Gateway endpoint"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: "flex", alignItems: "center", height: "100%", pt: 0.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={modalIsActive}
                            onChange={(e) => setModalIsActive(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography variant="body2" fontWeight={600} color={modalIsActive ? "success.main" : "text.secondary"}>
                            {modalIsActive ? "Active Gateway" : "Inactive"}
                          </Typography>
                        }
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      type="password"
                      label="API Key / Token"
                      value={modalApiKey}
                      onChange={(e) => setModalApiKey(e.target.value)}
                      placeholder="e.g. 2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027"
                      helperText="Authorization token sent in KEY header"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender ID / ስም"
                      value={modalSenderId}
                      onChange={(e) => setModalSenderId(e.target.value)}
                      placeholder="e.g. MarDa ERP"
                      helperText="Sender Mask"
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description / Notes"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="Optional notes regarding this SMS route"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" mt={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleResetModalForm}
                sx={{ textTransform: "none" }}
              >
                Clear Form
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={isSavingDbSetting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSaveDbSetting}
                disabled={isSavingDbSetting || (modalProtocol === "SMPP" ? !modalSmppHost?.trim() || !modalSmppSystemId?.trim() : !modalGatewayUrl?.trim() || !modalApiKey?.trim())}
                sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
              >
                {isSavingDbSetting ? "Saving..." : "💾 Save to Database"}
              </Button>
            </Stack>
          </Paper>

          {/* Section 2: Table of Configured Gateways from Database */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
              Existing Database Gateways ({dbSmsSettings.length})
            </Typography>
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => refetchDbSettings()}
              sx={{ textTransform: "none" }}
            >
              Refresh
            </Button>
          </Stack>

          {isLoadingDbSettings ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : dbSmsSettings.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No custom SMS gateway settings found in the database. The system is currently using the global default fallback.
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#f1f5f9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>City / Scope</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Protocol</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Host / Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Sender ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dbSmsSettings.map((s) => {
                    const isDefault = !s.cityId || s.cityName?.toLowerCase() === "default";
                    const isRowSmpp = s.protocol === "SMPP";
                    const hostDisplay = isRowSmpp
                      ? `${s.smppHost || "10.204.181.70"}:${s.smppPort || 5019}`
                      : s.gatewayUrl || "https://smsethiopia.et/api/sms/send";

                    return (
                      <TableRow key={s.id || s.cityId || Math.random()} hover>
                        <TableCell sx={{ fontWeight: isDefault ? 700 : 500 }}>
                          {isDefault ? (
                            <Chip size="small" label="🌐 Default / All Cities" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                          ) : (
                            s.cityName || `City ${s.cityId}`
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isRowSmpp ? "📡 SMPP" : "🌐 HTTP"}
                            color={isRowSmpp ? "secondary" : "info"}
                            variant="filled"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={hostDisplay}>
                            <span>{hostDisplay}</span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{s.senderId || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={s.isActive !== false ? "Active" : "Disabled"}
                            color={s.isActive !== false ? "success" : "default"}
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit this Gateway">
                              <IconButton size="small" color="primary" onClick={() => handleEditDbSetting(s)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {s.id && (
                              <Tooltip title="Delete">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    disabled={isDeletingDbSetting}
                                    onClick={() => handleDeleteDbSetting(s.id, s.cityName)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowConfigModal(false)} variant="contained" color="primary" sx={{ textTransform: "none", fontWeight: 600 }}>
            Done / Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

const SmsGatewayTestPage = () => (
  <QueryClientProvider client={queryClient}>
    <SmsGatewayTestInner />
  </QueryClientProvider>
);

export default SmsGatewayTestPage;

