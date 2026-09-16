"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
  Checkbox,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import EtDatePicker from "mui-ethiopian-datepicker";
import ProPeriodPicker from "@/app/ui/components/ProPeriodPicker";
import { ETH_MONTHS_AM } from "@/app/helpers/constants";
import * as XLSX from "xlsx";

// Icons
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MessageIcon from "@mui/icons-material/Message";
import PhoneIcon from "@mui/icons-material/Phone";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import FilterListIcon from "@mui/icons-material/FilterList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";

import { ReadingService } from "@/app/lib/ReadingService";
import { DropdownService } from "@/app/lib/dropdownService";
import { SmsService } from "@/app/lib/smsService";
import { CampanyProfileService } from "@/app/lib/campanyProfileService";
import addressCityService from "@/app/lib/addressCityService";

var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const dropdownService = new DropdownService();
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

const SendBillSmsInner = () => {
  // Current Ethiopian Date setup
  const currentGregorianDate = new Date();
  const [currentEthYear, currentEthMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  // Period States
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState(
    ETH_MONTHS_AM[currentEthMonth - 1] || "መስከረም"
  );
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState(String(currentEthYear));
  const [currentCycleMonth, setCurrentCycleMonth] = useState("");
  const [currentCycleYear, setCurrentCycleYear] = useState("");

  const [smsDueDateEC, setSmsDueDateEC] = useState(null);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [filterSmsSent, setFilterSmsSent] = useState("all"); // "all", "not_sent", "sent"

  // Gateway Configuration Modal State
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Database Gateway Setting Form State
  const [modalSettingId, setModalSettingId] = useState(null);
  const [modalCityId, setModalCityId] = useState(""); // "" = Default / All Cities
  const [modalCityName, setModalCityName] = useState("Default");
  const [modalProtocol, setModalProtocol] = useState("HTTP_REST"); // "HTTP_REST" or "SMPP"
  const [modalGatewayUrl, setModalGatewayUrl] = useState("https://smsethiopia.et/api/sms/send");
  const [modalApiKey, setModalApiKey] = useState("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
  const [modalSmppHost, setModalSmppHost] = useState("10.204.181.70");
  const [modalSmppPort, setModalSmppPort] = useState(5019);
  const [modalSmppSystemId, setModalSmppSystemId] = useState("8581");
  const [modalSmppPassword, setModalSmppPassword] = useState("Wtw@1921");
  const [modalSenderId, setModalSenderId] = useState("MarDa ERP");
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalDescription, setModalDescription] = useState("");
  const [isSavingDbSetting, setIsSavingDbSetting] = useState(false);
  const [isDeletingDbSetting, setIsDeletingDbSetting] = useState(false);

  // Fallback local states
  const [gatewayUrl, setGatewayUrl] = useState("https://smsethiopia.et/api/sms/send");
  const [apiKey, setApiKey] = useState("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");

  // Gateway Test State
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("የሙከራ የSMS መልዕክት ከMarDa ERP");
  const [isTestingGateway, setIsTestingGateway] = useState(false);

  // Queue State
  const [smsQueue, setSmsQueue] = useState([]);
  const [isPreparingQueue, setIsPreparingQueue] = useState(false);

  // Selection & Table State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilterTab, setStatusFilterTab] = useState("ALL"); // ALL, READY, SENT, FAILED
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sending Execution State
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [singleSendingId, setSingleSendingId] = useState(null);

  // Message Preview Modal
  const [previewItem, setPreviewItem] = useState(null);

  // Custom Direct Message Modal
  const [showCustomMsgModal, setShowCustomMsgModal] = useState(false);
  const [customMsgText, setCustomMsgText] = useState("");
  const [isSendingCustomMsg, setIsSendingCustomMsg] = useState(false);

  // Company Profile
  const { data: companyProfile } = useQuery({
    queryKey: ["sms_companyProfile"],
    queryFn: () => companyProfileService.getCampanyProfile(),
    staleTime: 30 * 60 * 1000,
  });

  // Address Cities Query
  const { data: addressCities = [] } = useQuery({
    queryKey: ["sms_addressCities"],
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
    queryKey: ["sms_db_settings"],
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
      gatewayUrl: gatewayUrl || "https://smsethiopia.et/api/sms/send",
      apiKey: apiKey || "2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027",
      senderId: "MarDa ERP",
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

  // Initialize Active Cycle from Company Profile
  useEffect(() => {
    if (companyProfile && companyProfile.activeReadingDate) {
      try {
        const activeDate = new Date(companyProfile.activeReadingDate);
        if (!isNaN(activeDate.getTime())) {
          const [eYear, eMonth] = ethiopianDate.toEthiopian(
            activeDate.getFullYear(),
            activeDate.getMonth() + 1,
            activeDate.getDate()
          );
          const monthIndex = Math.min(eMonth, 12) - 1;
          const cycleMonth = ETH_MONTHS_AM[monthIndex];
          setCurrentCycleMonth(cycleMonth);
          setCurrentCycleYear(String(eYear));
          setSelectedKifyaWerMonth(cycleMonth);
          setSelectedKifyaWerYear(String(eYear));
          return;
        }
      } catch (e) {
        console.error("Error parsing activeReadingDate:", e);
      }
    }

    const monthIndex = Math.min(currentEthMonth, 12) - 1;
    const cycleMonth = ETH_MONTHS_AM[monthIndex];
    setCurrentCycleMonth(cycleMonth);
    setCurrentCycleYear(String(currentEthYear));
  }, [companyProfile, currentEthYear, currentEthMonth]);

  // Distinct billing periods in database for ProPeriodPicker indicator dots
  const { data: dbPeriods = [] } = useQuery({
    queryKey: ["distinctKifyaWer"],
    queryFn: () => readingService.getDistinctKifyaWerList(),
    staleTime: 15 * 60 * 1000,
  });

  const handlePeriodChange = useCallback((newMonth, newYear) => {
    setSelectedKifyaWerMonth(newMonth);
    setSelectedKifyaWerYear(String(newYear));
  }, []);

  // Modal Setting Handlers
  const handleSelectCityInModal = (cityIdVal) => {
    setModalCityId(cityIdVal);
    if (!cityIdVal) {
      setModalCityName("Default");
      const defaultSetting = dbSmsSettings.find(
        (s) => !s.cityId || s.cityName?.toLowerCase() === "default"
      );
      if (defaultSetting) {
        setModalSettingId(defaultSetting.id);
        setModalProtocol(defaultSetting.protocol || "HTTP_REST");
        setModalGatewayUrl(defaultSetting.gatewayUrl || "https://smsethiopia.et/api/sms/send");
        setModalApiKey(defaultSetting.apiKey || "");
        setModalSmppHost(defaultSetting.smppHost || "10.204.181.70");
        setModalSmppPort(defaultSetting.smppPort || 5019);
        setModalSmppSystemId(defaultSetting.smppSystemId || "8581");
        setModalSmppPassword(defaultSetting.smppPassword || "Wtw@1921");
        setModalSenderId(defaultSetting.senderId || (defaultSetting.protocol === "SMPP" ? "WoldiaWater" : "MarDa ERP"));
        setModalIsActive(defaultSetting.isActive !== false);
        setModalDescription(defaultSetting.description || "");
      } else {
        setModalSettingId(null);
        setModalProtocol("HTTP_REST");
        setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
        setModalApiKey("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
        setModalSmppHost("10.204.181.70");
        setModalSmppPort(5019);
        setModalSmppSystemId("8581");
        setModalSmppPassword("Wtw@1921");
        setModalSenderId("MarDa ERP");
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
        setModalProtocol(existing.protocol || "HTTP_REST");
        setModalGatewayUrl(existing.gatewayUrl || "https://smsethiopia.et/api/sms/send");
        setModalApiKey(existing.apiKey || "");
        setModalSmppHost(existing.smppHost || "10.204.181.70");
        setModalSmppPort(existing.smppPort || 5019);
        setModalSmppSystemId(existing.smppSystemId || "8581");
        setModalSmppPassword(existing.smppPassword || "Wtw@1921");
        setModalSenderId(existing.senderId || cName);
        setModalIsActive(existing.isActive !== false);
        setModalDescription(existing.description || "");
      } else {
        setModalSettingId(null);
        setModalProtocol("HTTP_REST");
        setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
        setModalApiKey("");
        setModalSmppHost("10.204.181.70");
        setModalSmppPort(5019);
        setModalSmppSystemId("8581");
        setModalSmppPassword("Wtw@1921");
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
    setModalProtocol(setting.protocol || "HTTP_REST");
    setModalGatewayUrl(setting.gatewayUrl || "https://smsethiopia.et/api/sms/send");
    setModalApiKey(setting.apiKey || "");
    setModalSmppHost(setting.smppHost || "10.204.181.70");
    setModalSmppPort(setting.smppPort || 5019);
    setModalSmppSystemId(setting.smppSystemId || "8581");
    setModalSmppPassword(setting.smppPassword || "Wtw@1921");
    setModalSenderId(setting.senderId || (setting.protocol === "SMPP" ? "WoldiaWater" : "MarDa ERP"));
    setModalIsActive(setting.isActive !== false);
    setModalDescription(setting.description || "");
  };

  const handleResetModalForm = () => {
    setModalSettingId(null);
    setModalCityId("");
    setModalCityName("Default");
    setModalProtocol("HTTP_REST");
    setModalGatewayUrl("https://smsethiopia.et/api/sms/send");
    setModalApiKey("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");
    setModalSmppHost("10.204.181.70");
    setModalSmppPort(5019);
    setModalSmppSystemId("8581");
    setModalSmppPassword("Wtw@1921");
    setModalSenderId("MarDa ERP");
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
        protocol: modalProtocol || "HTTP_REST",
        gatewayUrl: modalGatewayUrl?.trim() || "https://smsethiopia.et/api/sms/send",
        apiKey: modalApiKey?.trim() || "",
        smppHost: modalSmppHost?.trim() || "10.204.181.70",
        smppPort: modalSmppPort ? Number(modalSmppPort) : 5019,
        smppSystemId: modalSmppSystemId?.trim() || "8581",
        smppPassword: modalSmppPassword?.trim() || "Wtw@1921",
        senderId: modalSenderId.trim() || (modalProtocol === "SMPP" ? "WoldiaWater" : "MarDa ERP"),
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

  // Dropdown Queries
  const { data: kebeles = [] } = useQuery({
    queryKey: ["sms_kebeles"],
    queryFn: () => dropdownService.getKebeles(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["sms_branches"],
    queryFn: () => dropdownService.getBranches(),
  });

  const { data: customerTypes = [] } = useQuery({
    queryKey: ["sms_customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
  });

  const { data: ketenas = [] } = useQuery({
    queryKey: ["sms_ketenas", selectedKebeleId],
    queryFn: () => (selectedKebeleId ? dropdownService.getKetenasByKebele(selectedKebeleId) : []),
    enabled: !!selectedKebeleId,
  });

  const { data: readers = [] } = useQuery({
    queryKey: ["sms_readers", selectedBranchId],
    queryFn: () => (selectedBranchId ? dropdownService.getReadersByBranch(selectedBranchId) : []),
    enabled: !!selectedBranchId,
  });

  // Query Bills for the selected Ethiopian Month & Year
  const {
    data: readings = [],
    isLoading: isReadingsLoading,
    refetch: refetchReadings,
  } = useQuery({
    queryKey: ["sms_readings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (selectedKifyaWerMonth && selectedKifyaWerYear) {
        const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
        const merged = await readingService.getBillFilteredReadingsSupportMerged(kifyaWerFormatted);
        return (merged || []).filter((b) => !b?.isVoid && !b?.void && String(b?.status).toLowerCase() !== "deleted");
      }
      return [];
    },
    enabled: !!selectedKifyaWerMonth && !!selectedKifyaWerYear,
    staleTime: 3 * 60 * 1000,
  });

  // Filter bills using dropdown options
  const filteredReadings = useMemo(() => {
    let list = [...readings];

    const matchesAnyKey = (obj, keys, value) =>
      keys.some((k) => obj?.[k] !== undefined && String(obj[k]) === String(value));

    if (selectedCityId) {
      list = list.filter((r) => matchesAnyKey(r, ["customerCityId", "cityId", "addressCityId", "city_id"], selectedCityId));
    }
    if (selectedKebeleId) {
      list = list.filter((r) => matchesAnyKey(r, ["addressStreetsId", "kebeleId", "customerKebeleId"], selectedKebeleId));
    }
    if (selectedKetenaId) {
      list = list.filter((r) => matchesAnyKey(r, ["addressKetenaId", "ketenaId"], selectedKetenaId));
    }
    if (selectedBranchId) {
      list = list.filter((r) => matchesAnyKey(r, ["branchsId", "branchId"], selectedBranchId));
    }
    if (selectedReaderId) {
      list = list.filter((r) => matchesAnyKey(r, ["assignedReaderId", "readerId"], selectedReaderId));
    }
    if (selectedCustomerTypeId) {
      list = list.filter((r) => r?.customerTypeId !== undefined && String(r.customerTypeId) === String(selectedCustomerTypeId));
    }
    if (filterSmsSent !== "all") {
      const sentBool = filterSmsSent === "sent";
      list = list.filter((b) => (sentBool ? !!b.enableEditMeneshaReading : !b.enableEditMeneshaReading));
    }

    return list;
  }, [readings, selectedCityId, selectedKebeleId, selectedKetenaId, selectedBranchId, selectedReaderId, selectedCustomerTypeId, filterSmsSent]);

  // Format Due Date Text
  const getFormattedDueDateText = useCallback(() => {
    if (smsDueDateEC instanceof Date && !isNaN(smsDueDateEC)) {
      const [ey, em, ed] = ethiopianDate.toEthiopian(
        smsDueDateEC.getFullYear(),
        smsDueDateEC.getMonth() + 1,
        smsDueDateEC.getDate()
      );
      const ecMonthName = ETH_MONTHS_AM[em - 1] || "";
      return `${ecMonthName} ${ed}`;
    }
    if (selectedKifyaWerMonth && selectedKifyaWerYear) {
      return `${selectedKifyaWerMonth} ${selectedKifyaWerYear}`;
    }
    return "";
  }, [smsDueDateEC, selectedKifyaWerMonth, selectedKifyaWerYear]);

  // Prepare SMS Queue
  const handleLoadAndPrepareQueue = async () => {
    if (!filteredReadings.length) {
      toast.info("No bills found matching current filters.");
      return;
    }

    if (!(smsDueDateEC instanceof Date) || isNaN(smsDueDateEC)) {
      toast.warning("Please select a Due Date (EC) before preparing SMS.");
      return;
    }

    const allIds = filteredReadings
      .map((b) => b.id)
      .filter((id) => typeof id === "number" || typeof id === "string");

    if (!allIds.length) {
      toast.info("No valid bill IDs found.");
      return;
    }

    const smsDueDateText = getFormattedDueDateText();
    const monthYearPart =
      selectedKifyaWerMonth && selectedKifyaWerYear
        ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear} `
        : "";

    setIsPreparingQueue(true);
    try {
      const CHUNK_SIZE = 500;
      let allItems = [];

      for (let i = 0; i < allIds.length; i += CHUNK_SIZE) {
        const chunk = allIds.slice(i, i + CHUNK_SIZE);
        const items = await smsService.prepareSmsQueue(chunk, {
          smsDueDateText,
          monthYearPart,
        });
        if (Array.isArray(items)) {
          allItems = allItems.concat(items);
        }
      }

      if (!allItems.length) {
        toast.info("No SMS queue items returned (check if phone numbers exist).");
        setSmsQueue([]);
        return;
      }

      setSmsQueue(allItems);
      setSelectedIds(new Set());
      setPage(0);
      toast.success(`Prepared ${allItems.length} SMS messages in queue!`);
    } catch (err) {
      console.error("Error preparing SMS queue", err);
      toast.error(err?.response?.data || err.message || "Failed to prepare SMS queue.");
    } finally {
      setIsPreparingQueue(false);
    }
  };

  // Test Gateway Connection
  const handleTestGateway = async () => {
    if (!testPhone.trim()) {
      toast.warning("Please enter a test phone number.");
      return;
    }
    const effUrl = modalGatewayUrl || activeGatewayConfig?.gatewayUrl || "https://smsethiopia.et/api/sms/send";
    const effKey = modalApiKey || activeGatewayConfig?.apiKey || "";
    if (!effKey.trim()) {
      toast.warning("Please enter an API Key to test the gateway.");
      return;
    }

    setIsTestingGateway(true);
    try {
      const res = await smsService.testGatewaySms({
        gatewayUrl: effUrl.trim(),
        apiKey: effKey.trim(),
        phoneNumber: testPhone.trim(),
        message: testMsg.trim(),
      });
      if (res?.success) {
        toast.success("Gateway Test SUCCESSFUL! Message delivered to gateway.");
      } else {
        toast.error(`Gateway Test FAILED: ${res?.error || "Unknown error"}`);
      }
    } catch (err) {
      toast.error(err?.response?.data || err.message || "Failed to communicate with SMS gateway.");
    } finally {
      setIsTestingGateway(false);
    }
  };

  // Filtering on the loaded SMS Queue
  const filteredQueue = useMemo(() => {
    return smsQueue.filter((item) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.accountNumber && item.accountNumber.toLowerCase().includes(q)) ||
        (item.customerName && item.customerName.toLowerCase().includes(q)) ||
        (item.phoneNumber && item.phoneNumber.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q));

      // Status Tab
      let matchStatus = true;
      if (statusFilterTab === "READY") {
        matchStatus = item.status === "READY";
      } else if (statusFilterTab === "SENT") {
        matchStatus = item.status === "SENT";
      } else if (statusFilterTab === "FAILED") {
        matchStatus = item.status === "FAILED";
      }

      return matchSearch && matchStatus;
    });
  }, [smsQueue, searchQuery, statusFilterTab]);

  // Statistics
  const statTotal = smsQueue.length;
  const statReady = smsQueue.filter((s) => s.status === "READY").length;
  const statSent = smsQueue.filter((s) => s.status === "SENT").length;
  const statFailed = smsQueue.filter((s) => s.status === "FAILED").length;
  const statSelected = selectedIds.size;

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredQueue.map((item) => item.readingId);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (readingId) => {
    const next = new Set(selectedIds);
    if (next.has(readingId)) next.delete(readingId);
    else next.add(readingId);
    setSelectedIds(next);
  };

  const handleSelectAllReady = () => {
    const readyIds = smsQueue.filter((item) => item.status === "READY").map((item) => item.readingId);
    setSelectedIds(new Set(readyIds));
    toast.info(`Selected all ${readyIds.length} ready SMS.`);
  };

  const handleSelectAllFailed = () => {
    const failedIds = smsQueue.filter((item) => item.status === "FAILED").map((item) => item.readingId);
    setSelectedIds(new Set(failedIds));
    toast.info(`Selected all ${failedIds.length} failed SMS.`);
  };

  // Single SMS Send
  const handleSendSingleSms = async (item) => {
    const effApiKey = activeGatewayConfig?.apiKey || apiKey;
    const effGatewayUrl = activeGatewayConfig?.gatewayUrl || gatewayUrl;

    if (!effApiKey || !effApiKey.trim()) {
      toast.warning("Please configure your SMS Gateway API Key first.");
      setShowConfigModal(true);
      return;
    }

    setSingleSendingId(item.readingId);
    try {
      const res = await smsService.sendGatewaySingleSms({
        readingId: item.readingId,
        phoneNumber: item.phoneNumber,
        message: item.message,
        gatewayUrl: effGatewayUrl,
        apiKey: effApiKey,
      });

      if (res?.success) {
        toast.success(`SMS sent to ${item.phoneNumber}!`);
        setSmsQueue((prev) =>
          prev.map((q) =>
            q.readingId === item.readingId
              ? { ...q, status: "SENT", alreadySent: true, error: null }
              : q
          )
        );
      } else {
        const errMsg = res?.error || "Failed to send";
        toast.error(`SMS to ${item.phoneNumber} failed: ${errMsg}`);
        setSmsQueue((prev) =>
          prev.map((q) =>
            q.readingId === item.readingId ? { ...q, status: "FAILED", error: errMsg } : q
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data || err.message || "Failed to send SMS.");
      setSmsQueue((prev) =>
        prev.map((q) =>
          q.readingId === item.readingId
            ? { ...q, status: "FAILED", error: err?.message || "Send failed" }
            : q
        )
      );
    } finally {
      setSingleSendingId(null);
    }
  };

  // Bulk SMS Send
  const handleSendSelectedSms = async () => {
    if (selectedIds.size === 0) {
      toast.warning("Please select at least one SMS to send.");
      return;
    }

    const effApiKey = activeGatewayConfig?.apiKey || apiKey;
    const effGatewayUrl = activeGatewayConfig?.gatewayUrl || gatewayUrl;

    if (!effApiKey || !effApiKey.trim()) {
      toast.warning("Please configure your SMS Gateway API Key first.");
      setShowConfigModal(true);
      return;
    }

    const targetList = smsQueue.filter((item) => selectedIds.has(item.readingId));
    if (!targetList.length) return;

    setIsSendingBulk(true);
    setSendingProgress({ current: 0, total: targetList.length, percent: 0 });

    const CHUNK_SIZE = 100;
    let totalSent = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < targetList.length; i += CHUNK_SIZE) {
        const chunk = targetList.slice(i, i + CHUNK_SIZE);
        const chunkIds = chunk.map((c) => c.readingId);

        // Mark chunk as SENDING in UI
        setSmsQueue((prev) =>
          prev.map((q) =>
            chunkIds.includes(q.readingId) ? { ...q, status: "SENDING" } : q
          )
        );

        const smsDueDateText = getFormattedDueDateText();
        const monthYearPart =
          selectedKifyaWerMonth && selectedKifyaWerYear
            ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear} `
            : "";

        try {
          const res = await smsService.sendGatewayBulkSms({
            readingIds: chunkIds,
            gatewayUrl: effGatewayUrl,
            apiKey: effApiKey,
            smsDueDateText,
            monthYearPart,
          });

          const sentCount = res?.sent || 0;
          const failedCount = res?.failed || 0;
          totalSent += sentCount;
          totalFailed += failedCount;

          // Map itemized results back to queue
          const resultMap = new Map();
          if (Array.isArray(res?.results)) {
            res.results.forEach((r) => {
              if (r.readingId) resultMap.set(r.readingId, r);
            });
          }

          setSmsQueue((prev) =>
            prev.map((q) => {
              if (chunkIds.includes(q.readingId)) {
                const itemRes = resultMap.get(q.readingId);
                const isOk = itemRes ? itemRes.success : false;
                return {
                  ...q,
                  status: isOk ? "SENT" : "FAILED",
                  alreadySent: isOk,
                  error: itemRes ? itemRes.error : "Failed in batch",
                };
              }
              return q;
            })
          );
        } catch (errChunk) {
          console.error("Chunk error:", errChunk);
          totalFailed += chunk.length;
          setSmsQueue((prev) =>
            prev.map((q) =>
              chunkIds.includes(q.readingId)
                ? { ...q, status: "FAILED", error: errChunk?.message || "Batch request failed" }
                : q
            )
          );
        }

        const processed = Math.min(i + CHUNK_SIZE, targetList.length);
        const pct = Math.round((processed / targetList.length) * 100);
        setSendingProgress({ current: processed, total: targetList.length, percent: pct });
      }

      if (totalSent > 0) {
        toast.success(`Direct SMS Finished! Sent: ${totalSent}, Failed: ${totalFailed}`);
        refetchReadings();
      } else {
        toast.error(`Direct SMS Finished. All ${totalFailed} attempts failed. Check gateway credentials.`);
      }

      // Clear selection after completion
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data || err.message || "Error executing bulk SMS dispatch.");
    } finally {
      setIsSendingBulk(false);
    }
  };

  // Custom Direct Announcement Message Send
  const handleSendCustomMessage = async () => {
    const text = customMsgText.trim();
    if (!text) {
      toast.warning("Please enter custom message text.");
      return;
    }
    if (selectedIds.size === 0) {
      toast.warning("Please select recipient customers from the table first.");
      return;
    }

    const effApiKey = activeGatewayConfig?.apiKey || apiKey;
    const effGatewayUrl = activeGatewayConfig?.gatewayUrl || gatewayUrl;

    if (!effApiKey || !effApiKey.trim()) {
      toast.warning("Please configure your SMS Gateway API Key first.");
      setShowConfigModal(true);
      return;
    }

    const targetList = smsQueue.filter((item) => selectedIds.has(item.readingId));
    setIsSendingCustomMsg(true);

    try {
      const customItems = targetList.map((item) => ({
        readingId: item.readingId,
        phoneNumber: item.phoneNumber,
        message: text,
      }));

      const res = await smsService.sendGatewayBulkSms({
        gatewayUrl: effGatewayUrl,
        apiKey: effApiKey,
        customItems,
      });

      toast.success(`Custom message sent! Sent: ${res?.sent || 0}, Failed: ${res?.failed || 0}`);
      setShowCustomMsgModal(false);
      setCustomMsgText("");
    } catch (err) {
      toast.error(err?.response?.data || err.message || "Failed to send custom messages.");
    } finally {
      setIsSendingCustomMsg(false);
    }
  };

  // Backup Export to Excel
  const handleExportBackupExcel = () => {
    if (!smsQueue.length) {
      toast.info("No SMS queue data to export.");
      return;
    }

    const cityName = companyProfile?.locationEng || "";
    const billMonth = selectedKifyaWerMonth && selectedKifyaWerYear
      ? `${selectedKifyaWerMonth}-${selectedKifyaWerYear}`
      : "";

    const exportRows = smsQueue.map((item, idx) => ({
      No: idx + 1,
      CityName: cityName,
      AccountNumber: item.accountNumber || "",
      CustomerName: item.customerName || "",
      PhoneNumber: item.phoneNumber || "",
      Message: item.message || "",
      BillMonth: item.billMonth || billMonth,
      TotalAmount: item.totalAmount || 0,
      Status: item.status,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(wb, ws, "SMS Queue");

    const now = new Date();
    const filename = `SMS_DirectQueue_${selectedKifyaWerMonth || ""}_${selectedKifyaWerYear || ""}_${now.toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
    toast.success(`Exported ${exportRows.length} rows to Excel!`);
  };

  const isAllSelected = filteredQueue.length > 0 && selectedIds.size === filteredQueue.length;

  return (
    <>
      <ToastContainer autoClose={4000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="Direct Bill SMS Management / የቢል SMS መላኪያ" />

      {/* Main Container */}
      <Box sx={{ mt: 3 }}>
        {/* Top Actions & Gateway Status Header */}
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
              <MessageIcon color="primary" /> Direct Bill SMS Gateway
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Directly prepare, preview, and dispatch Ethio Telecom bill SMS via HTTP Gateway without manual Excel management.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Chip
              icon={<LocationCityIcon />}
              label={`Active Gateway: ${activeGatewayConfig?.cityName || "Default"} (${activeGatewayConfig?.senderId || "MarDa ERP"})`}
              color={activeGatewayConfig?.apiKey ? "success" : "warning"}
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
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportBackupExcel}
              disabled={smsQueue.length === 0}
              sx={{ borderRadius: 2, textTransform: "none", borderColor: "#cbd5e1" }}
            >
              Backup Excel
            </Button>
          </Stack>
        </Paper>

        {/* Period & Filters Section */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Row 1: Executive Ethiopian Period Picker & Due Date & Load Button */}
          <Typography variant="subtitle1" fontWeight={700} color="#1e293b" mb={1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon fontSize="small" color="primary" /> የክፍያ ወር እና የመክፈያ ቀን (Billing Period & Due Date)
          </Typography>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", mb: 2.5 }}>
            <ProPeriodPicker
              selectedMonth={selectedKifyaWerMonth}
              selectedYear={selectedKifyaWerYear}
              onPeriodChange={handlePeriodChange}
              currentCycleMonth={currentCycleMonth}
              currentCycleYear={currentCycleYear}
              dbPeriods={dbPeriods}
              disabled={isReadingsLoading}
            />

            <Box sx={{ minWidth: 200 }}>
              <EtDatePicker
                label="የመክፈያ ቀን (Due Date EC)"
                value={smsDueDateEC}
                onChange={(date) => setSmsDueDateEC(date)}
              />
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={isPreparingQueue ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={handleLoadAndPrepareQueue}
              disabled={isPreparingQueue || isReadingsLoading || !selectedKifyaWerMonth || !selectedKifyaWerYear}
              sx={{
                height: 44,
                px: 3,
                borderRadius: 2.5,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              {isPreparingQueue
                ? "Preparing SMS Queue..."
                : `Load & Prepare SMS Queue (${filteredReadings.length} Bills)`}
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Row 2: Additional Geographic & Customer Filters */}
          <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterListIcon fontSize="small" color="action" /> ተጨማሪ ማጣሪያዎች (Additional Filters)
          </Typography>

          <Grid container spacing={2}>
            {/* City */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="city-label">ከተማ (City)</InputLabel>
                <Select
                  labelId="city-label"
                  value={selectedCityId}
                  label="ከተማ (City)"
                  onChange={(e) => setSelectedCityId(e.target.value)}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም ከተማ (All Cities)</em>
                  </MenuItem>
                  {addressCities?.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {c.name || c.cityName || `City ${c.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Kebele */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="kebele-label">ቀበሌ (Kebele)</InputLabel>
                <Select
                  labelId="kebele-label"
                  value={selectedKebeleId}
                  label="ቀበሌ (Kebele)"
                  onChange={(e) => {
                    setSelectedKebeleId(e.target.value);
                    setSelectedKetenaId("");
                  }}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም ቀበሌ (All Kebeles)</em>
                  </MenuItem>
                  {kebeles?.map((k) => (
                    <MenuItem key={k.id} value={k.id} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {k.name || k.streetName || `Kebele ${k.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Ketena */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="ketena-label">ቀጠና (Ketena)</InputLabel>
                <Select
                  labelId="ketena-label"
                  value={selectedKetenaId}
                  label="ቀጠና (Ketena)"
                  onChange={(e) => setSelectedKetenaId(e.target.value)}
                  disabled={!selectedKebeleId}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም ቀጠና (All Ketenas)</em>
                  </MenuItem>
                  {ketenas?.map((k) => (
                    <MenuItem key={k.id} value={k.id} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {k.name || k.ketenaName || `Ketena ${k.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Branch */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="branch-label">ቅርንጫፍ (Branch)</InputLabel>
                <Select
                  labelId="branch-label"
                  value={selectedBranchId}
                  label="ቅርንጫፍ (Branch)"
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setSelectedReaderId("");
                  }}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም ቅርንጫፍ (All Branches)</em>
                  </MenuItem>
                  {branches?.map((b) => (
                    <MenuItem key={b.id} value={b.id} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {b.name || b.branchName || `Branch ${b.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Reader */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="reader-label">አንባቢ (Reader)</InputLabel>
                <Select
                  labelId="reader-label"
                  value={selectedReaderId}
                  label="አንባቢ (Reader)"
                  onChange={(e) => setSelectedReaderId(e.target.value)}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም አንባቢ (All Readers)</em>
                  </MenuItem>
                  {readers?.map((r) => (
                    <MenuItem key={r.id} value={r.id} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {r.name || r.fullName || r.userName || `Reader ${r.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Customer Type */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="customer-type-label">የደንበኛ ዓይነት</InputLabel>
                <Select
                  labelId="customer-type-label"
                  value={selectedCustomerTypeId}
                  label="የደንበኛ ዓይነት"
                  onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="" sx={{ color: "#64748b !important" }}>
                    <em>ሁሉም ደንበኛ (All Types)</em>
                  </MenuItem>
                  {customerTypes?.map((c) => (
                    <MenuItem key={c.id} value={c.id} sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                      {c.name || c.customerType || `Type ${c.id}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* SMS Sent Status */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl size="small" fullWidth sx={modernSelectSx}>
                <InputLabel id="sms-status-label">የSMS ሁኔታ</InputLabel>
                <Select
                  labelId="sms-status-label"
                  value={filterSmsSent}
                  label="የSMS ሁኔታ"
                  onChange={(e) => setFilterSmsSent(e.target.value)}
                  MenuProps={modernMenuProps}
                >
                  <MenuItem value="all" sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                    ሁሉም (All Bills)
                  </MenuItem>
                  <MenuItem value="not_sent" sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                    ያልተላከላቸው (Not Sent)
                  </MenuItem>
                  <MenuItem value="sent" sx={{ color: "#1e293b !important", fontWeight: 500 }}>
                    የተላከላቸው (Already Sent)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Dynamic Statistics Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  TOTAL PREPARED
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#3b82f6" sx={{ mt: 0.5 }}>
                  {statTotal}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #fed7aa", bgcolor: "#fffbeb" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#b45309" fontWeight={600}>
                  READY TO SEND
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#d97706" sx={{ mt: 0.5 }}>
                  {statReady}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #bbf7d0", bgcolor: "#f0fdf4" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#15803d" fontWeight={600}>
                  SENT SUCCESSFULLY
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#16a34a" sx={{ mt: 0.5 }}>
                  {statSent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #fecaca", bgcolor: "#fef2f2" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#b91c1c" fontWeight={600}>
                  FAILED DELIVERIES
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#dc2626" sx={{ mt: 0.5 }}>
                  {statFailed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ borderRadius: 3, border: "1px solid #ddd6fe", bgcolor: "#f5f3ff" }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Typography variant="caption" color="#6d28d9" fontWeight={600}>
                  SELECTED FOR SENDING
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#7c3aed" sx={{ mt: 0.5 }}>
                  {statSelected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transmission Progress Banner */}
        {isSendingBulk && (
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 3,
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight={700} color="#1e40af" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} color="primary" /> Transmitting SMS to Gateway...
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#1e40af">
                {sendingProgress.current} / {sendingProgress.total} ({sendingProgress.percent}%)
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={sendingProgress.percent} sx={{ height: 8, borderRadius: 4 }} />
          </Paper>
        )}

        {/* Action Toolbar & Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
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
          {/* Quick Selection & Action Buttons */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            <Button
              variant="contained"
              color="success"
              startIcon={<SendIcon />}
              disabled={selectedIds.size === 0 || isSendingBulk}
              onClick={handleSendSelectedSms}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
              }}
            >
              🚀 Send Selected ({selectedIds.size})
            </Button>

            <Button
              variant="outlined"
              color="warning"
              onClick={handleSelectAllReady}
              disabled={statReady === 0 || isSendingBulk}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Select All Ready ({statReady})
            </Button>

            {statFailed > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleSelectAllFailed}
                disabled={isSendingBulk}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Select Failed ({statFailed})
              </Button>
            )}

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setShowCustomMsgModal(true)}
              disabled={selectedIds.size === 0 || isSendingBulk}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              ✍️ Custom Message
            </Button>
          </Stack>

          {/* Status Tabs & Search Field */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
            <Stack direction="row" spacing={0.5} sx={{ bgcolor: "#f1f5f9", p: 0.5, borderRadius: 2 }}>
              {["ALL", "READY", "SENT", "FAILED"].map((tab) => (
                <Chip
                  key={tab}
                  label={tab}
                  size="small"
                  clickable
                  onClick={() => {
                    setStatusFilterTab(tab);
                    setPage(0);
                  }}
                  color={statusFilterTab === tab ? "primary" : "default"}
                  variant={statusFilterTab === tab ? "filled" : "outlined"}
                  sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                />
              ))}
            </Stack>

            <TextField
              size="small"
              placeholder="Search account, name, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", sm: 260 } }}
            />
          </Stack>
        </Paper>

        {/* Queue Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            bgcolor: "#fff",
          }}
        >
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ bgcolor: "#f8fafc" }}>
                    <Checkbox
                      indeterminate={selectedIds.size > 0 && selectedIds.size < filteredQueue.length}
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>የውል ቁጥር (Account)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>የደንበኛ ስም (Customer Name)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ስልክ ቁጥር (Phone)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ወር (Month)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ጠቅላላ ክፍያ (ETB)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc", maxWidth: 300 }}>የመልዕክት ቅድመ-ዕይታ (Message Preview)</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>ሁኔታ (Status)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#f8fafc" }}>እርምጃ (Action)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <Box sx={{ color: "text.secondary" }}>
                        <HourglassEmptyIcon sx={{ fontSize: 44, color: "#94a3b8", mb: 1 }} />
                        <Typography variant="body1" fontWeight={600}>
                          {smsQueue.length === 0
                            ? "No SMS messages prepared yet. Select your billing period and click 'Load & Prepare SMS Queue'."
                            : "No records match the current filter or search criteria."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueue
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, idx) => {
                      const isSelected = selectedIds.has(row.readingId);
                      const isSingleSending = singleSendingId === row.readingId;
                      const hasPhone = Boolean(row.phoneNumber && row.phoneNumber.trim().length >= 9);

                      return (
                        <TableRow
                          key={row.readingId || idx}
                          hover
                          selected={isSelected}
                          sx={{
                            "&.Mui-selected": { bgcolor: "rgba(99,102,241,0.06)" },
                            "&:hover": { bgcolor: "#f8fafc" },
                          }}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleSelectRow(row.readingId)}
                            />
                          </TableCell>
                          <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{row.accountNumber}</TableCell>
                          <TableCell sx={{ fontWeight: 500 }}>{row.customerName || "—"}</TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <PhoneIcon fontSize="inherit" color={hasPhone ? "action" : "error"} />
                              <Typography variant="body2" fontWeight={600} color={hasPhone ? "text.primary" : "error"}>
                                {row.phoneNumber || "No Phone"}
                              </Typography>
                              {!hasPhone && (
                                <Tooltip title="Missing or invalid phone number">
                                  <WarningAmberIcon fontSize="small" color="error" />
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>{row.billMonth}</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: "#0f766e" }}>
                            {Number(row.totalAmount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 300,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                            }}
                            onClick={() => setPreviewItem(row)}
                          >
                            <Tooltip title="Click to view full message" arrow>
                              <Typography variant="body2" sx={{ textDecoration: "underline", textDecorationStyle: "dotted" }}>
                                {row.message}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {row.status === "SENT" ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleIcon />}
                                label="SENT"
                                color="success"
                                variant="filled"
                              />
                            ) : row.status === "FAILED" ? (
                              <Tooltip title={row.error || "Delivery failed"} arrow>
                                <Chip
                                  size="small"
                                  icon={<ErrorIcon />}
                                  label="FAILED"
                                  color="error"
                                  variant="filled"
                                  sx={{ cursor: "help" }}
                                />
                              </Tooltip>
                            ) : row.status === "SENDING" ? (
                              <Chip
                                size="small"
                                icon={<CircularProgress size={12} color="inherit" />}
                                label="SENDING"
                                color="info"
                                variant="outlined"
                              />
                            ) : (
                              <Chip
                                size="small"
                                icon={<HourglassEmptyIcon />}
                                label="READY"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Message">
                                <IconButton size="small" color="primary" onClick={() => setPreviewItem(row)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                startIcon={isSingleSending ? <CircularProgress size={12} color="inherit" /> : <SendIcon fontSize="small" />}
                                disabled={isSingleSending || isSendingBulk || !hasPhone}
                                onClick={() => handleSendSingleSms(row)}
                                sx={{ borderRadius: 1.5, textTransform: "none", fontSize: "0.75rem", py: 0.3 }}
                              >
                                {isSingleSending ? "..." : "Send"}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredQueue.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            SelectProps={{
              MenuProps: modernMenuProps,
            }}
            sx={{
              color: "#1e293b",
              "& .MuiTablePagination-select": {
                color: "#1e293b !important",
                fontWeight: 600,
              },
              "& .MuiTablePagination-selectIcon": {
                color: "#64748b",
              },
            }}
          />
        </Paper>
      </Box>

      {/* Database Driven Gateway Configuration Dialog */}
      <Dialog open={showConfigModal} onClose={() => setShowConfigModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SettingsIcon color="primary" />
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                SMS Gateway Settings / የከተሞች SMS ጌትዌይ መቼት
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Database Table: <code>sms_setting</code> — Configure dedicated HTTP gateways & API keys per city
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setShowConfigModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            Each city / branch can have its own dedicated SMS Gateway provider and API credentials. If a city does not have a specific configuration, the system automatically dispatches via the <strong>Default (🌐 Fallback)</strong> gateway.
          </Alert>

          {/* Section 1: Form to Add/Edit Gateway */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EditIcon fontSize="small" color="primary" />
                {modalSettingId ? `Edit Gateway Setting (ID: ${modalSettingId} - ${modalCityName})` : "Configure City SMS Gateway"}
              </Typography>
              {modalSettingId && (
                <Button
                  size="small"
                  variant="text"
                  startIcon={<AddCircleOutlineIcon />}
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
                    <MenuItem value="HTTP_REST" sx={{ color: "#1e293b !important", fontWeight: 600 }}>
                      🌐 HTTP REST Gateway (smsethiopia.et / Web API)
                    </MenuItem>
                    <MenuItem value="SMPP" sx={{ color: "#1e293b !important", fontWeight: 600 }}>
                      📡 Direct SMPP Protocol (Ethio Telecom SMSC)
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
                  {/* SMPP Host */}
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

                  {/* SMPP Port */}
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

                  {/* Active Toggle */}
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

                  {/* System ID / Username */}
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

                  {/* SMPP Password */}
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

                  {/* Sender ID */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender ID / ስም"
                      value={modalSenderId}
                      onChange={(e) => setModalSenderId(e.target.value)}
                      placeholder="e.g. WoldiaWater"
                      helperText="Sender Mask / Source Address"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  {/* Gateway Endpoint URL */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Gateway Endpoint URL"
                      value={modalGatewayUrl}
                      onChange={(e) => setModalGatewayUrl(e.target.value)}
                      helperText="Default: https://smsethiopia.et/api/sms/send"
                    />
                  </Grid>

                  {/* Active Toggle */}
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

                  {/* API Key / Token */}
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="API Key / Token"
                      value={modalApiKey}
                      onChange={(e) => setModalApiKey(e.target.value)}
                      placeholder="e.g. 2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027"
                      helperText="The API secret key or bearer token for this city gateway"
                    />
                  </Grid>

                  {/* Sender ID */}
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Sender ID / ስም"
                      value={modalSenderId}
                      onChange={(e) => setModalSenderId(e.target.value)}
                      placeholder="e.g. HAWASSA-WATER, MarDa ERP"
                      helperText="Sender identification header / mask"
                    />
                  </Grid>
                </>
              )}

              {/* Description / Remark */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Description / Remark (Optional)"
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  placeholder="e.g. Dedicated gateway configuration for city"
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 2.5 }}>
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

          {/* Section 2: Quick Gateway Test */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, bgcolor: "#fff", border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle2" fontWeight={700} color="#475569" mb={1.5} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              🧪 Test Current Credentials ({modalCityName || "Default"} — {modalProtocol})
            </Typography>
            <Grid container spacing={1.5} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Phone Number"
                  placeholder="09... or 2519..."
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Message"
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={isTestingGateway ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                  onClick={handleTestGateway}
                  disabled={isTestingGateway || !testPhone.trim()}
                  sx={{ textTransform: "none", fontWeight: 600, py: 0.9 }}
                >
                  {isTestingGateway ? "Testing..." : "Send Test"}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Section 3: Table of Configured Gateways from Database */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LocationCityIcon fontSize="small" color="primary" /> Configured City Gateways in Database (<code>sms_setting</code>)
            </Typography>
            <IconButton size="small" onClick={() => refetchDbSettings()} title="Refresh list">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: "1px solid #e2e8f0", maxHeight: 260 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f1f5f9" }}>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>City / Scope</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Protocol</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Host / Endpoint</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Key / System ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Sender ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: "#1e293b" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoadingDbSettings ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : dbSmsSettings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                      No city SMS gateways configured yet. Use the form above to add one.
                    </TableCell>
                  </TableRow>
                ) : (
                  dbSmsSettings.map((s) => {
                    const isDefault = !s.cityId || s.cityName?.toLowerCase() === "default";
                    const isSmpp = s.protocol === "SMPP";
                    const maskedKey = isSmpp
                      ? (s.smppSystemId || "8581")
                      : s.apiKey
                        ? s.apiKey.length > 10
                          ? `${s.apiKey.slice(0, 6)}...${s.apiKey.slice(-4)}`
                          : "******"
                        : "None";

                    const hostDisplay = isSmpp
                      ? `${s.smppHost || "10.204.181.70"}:${s.smppPort || 5019}`
                      : s.gatewayUrl || "https://smsethiopia.et/api/sms/send";

                    return (
                      <TableRow
                        key={s.id || s.cityName}
                        hover
                        sx={{
                          bgcolor: modalSettingId === s.id ? "#eff6ff" : "inherit",
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>
                          {isDefault ? (
                            <Chip size="small" label="🌐 Default (All Cities)" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                          ) : (
                            `${s.cityName || `City ${s.cityId}`} (ID: ${s.cityId})`
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isSmpp ? "📡 SMPP" : "🌐 HTTP"}
                            color={isSmpp ? "secondary" : "info"}
                            variant="filled"
                            sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={hostDisplay}>
                            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>{hostDisplay}</Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                          {maskedKey}
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.8rem" }}>{s.senderId || "—"}</TableCell>
                        <TableCell>
                          {s.isActive ? (
                            <Chip size="small" label="Active" color="success" sx={{ height: 20, fontSize: "0.7rem" }} />
                          ) : (
                            <Chip size="small" label="Inactive" color="default" sx={{ height: 20, fontSize: "0.7rem" }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Edit this gateway">
                              <IconButton size="small" color="primary" onClick={() => handleEditDbSetting(s)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete this gateway">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={isDeletingDbSetting}
                                onClick={() => handleDeleteDbSetting(s.id, s.cityName)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <Button onClick={() => setShowConfigModal(false)} color="inherit" sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Preview Modal */}
      <Dialog open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          💬 SMS Message Details
          <IconButton size="small" onClick={() => setPreviewItem(null)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewItem && (
            <Stack spacing={2}>
              <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  RECIPIENT
                </Typography>
                <Typography variant="body1" fontWeight={700}>
                  {previewItem.customerName || "Customer"} ({previewItem.accountNumber})
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  📱 {previewItem.phoneNumber}
                </Typography>
              </Box>

              <Box sx={{ bgcolor: "#eff6ff", p: 2, borderRadius: 2, border: "1px solid #bfdbfe" }}>
                <Typography variant="caption" color="primary" fontWeight={700}>
                  AMHARIC MESSAGE CONTENT
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, whiteSpace: "pre-wrap", lineHeight: 1.6, fontSize: "1rem" }}>
                  {previewItem.message}
                </Typography>
              </Box>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                  Length: <strong>{previewItem.message?.length || 0}</strong> characters
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: <strong>{previewItem.status}</strong>
                </Typography>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPreviewItem(null)} color="inherit" sx={{ textTransform: "none" }}>
            Close
          </Button>
          {previewItem && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => {
                handleSendSingleSms(previewItem);
                setPreviewItem(null);
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Send SMS Now
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Custom Direct Message Modal */}
      <Dialog open={showCustomMsgModal} onClose={() => setShowCustomMsgModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          ✍️ Compose Custom Direct SMS
          <IconButton size="small" onClick={() => setShowCustomMsgModal(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2 }}>
            This custom text will be delivered to <strong>{selectedIds.size}</strong> selected recipient(s) instead of the standard bill breakdown template.
          </Alert>

          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="Custom SMS Message (Amharic / English)"
            placeholder="የውሃ አገልግሎት ማቋረጥ ማስታወቂያ ወይም ሌላ መልዕክት እዚህ ይጻፉ..."
            value={customMsgText}
            onChange={(e) => setCustomMsgText(e.target.value)}
            margin="normal"
          />

          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Characters: {customMsgText.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Recipients: {selectedIds.size} customers
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowCustomMsgModal(false)} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={isSendingCustomMsg ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            disabled={isSendingCustomMsg || !customMsgText.trim()}
            onClick={handleSendCustomMessage}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isSendingCustomMsg ? "Sending..." : `Send Custom Message (${selectedIds.size})`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

export default function SendBillSmsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SendBillSmsInner />
    </QueryClientProvider>
  );
}
