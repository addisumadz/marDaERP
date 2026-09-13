"use client";
import { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
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
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import { ReadingService } from "@/app/lib/ReadingService";
import bankUnicashService from "@/app/lib/bankUnicashService";
import { DropdownService } from "@/app/lib/dropdownService";
import EtDatePicker from "mui-ethiopian-datepicker";
var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const dropdownService = new DropdownService();

const ethiopianMonthsAmh = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
];
const ethiopianMonthsEng = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit", "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehasse", "Pagumen"
];

const getEnglishEthMonth = (kifyaWerVal) => {
  if (!kifyaWerVal || typeof kifyaWerVal !== "string") return null;
  for (let i = 0; i < ethiopianMonthsAmh.length; i++) {
    if (kifyaWerVal.includes(ethiopianMonthsAmh[i])) return ethiopianMonthsEng[i];
  }
  for (let i = 0; i < ethiopianMonthsEng.length; i++) {
    if (kifyaWerVal.toLowerCase().includes(ethiopianMonthsEng[i].toLowerCase())) return ethiopianMonthsEng[i];
  }
  return null;
};

const normalizeUnicashMobile = (rawPhone) => {
  if (!rawPhone) rawPhone = "0900000000";
  let phone = String(rawPhone).replace(/\D/g, ""); // Strip non-digits

  // 09... -> 2519...
  if (phone.startsWith("09") && phone.length === 10) {
    return "251" + phone.substring(1);
  }
  // 2519... -> 2519...
  if (phone.startsWith("251") && phone.length === 12) {
    return phone;
  }
  // 9... -> 2519...
  if (phone.startsWith("9") && phone.length === 9) {
    return "251" + phone;
  }
  return ""; // Invalid or unknown format
};

const escapeCSV = (val) => {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes("\n") || s.includes("\"")) {
    return '"' + s.replace(/\"/g, '""') + '"';
  }
  return s;
};

const SendToUnicashInner = () => {
  const [selectedKifyaWerMonth, setSelectedKifyaWerMonth] = useState("");
  const [selectedKifyaWerYear, setSelectedKifyaWerYear] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [extraPenalty, setExtraPenalty] = useState("");
  const [processing, setProcessing] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [sendToBankFilter, setSendToBankFilter] = useState("");
  const [moneyCollectedFilter, setMoneyCollectedFilter] = useState("false");
  const [dueDateEC, setDueDateEC] = useState(null);

  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState("");
  const [selectedKebeleId, setSelectedKebeleId] = useState("");
  const [selectedKetenaId, setSelectedKetenaId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedReaderId, setSelectedReaderId] = useState("");

  const { data: kebeles = [], isLoading: isKebelesLoading } = useQuery({
    queryKey: ["kebeles"],
    queryFn: () => dropdownService.getKebeles(),
  });

  const { data: branches = [], isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => dropdownService.getBranches(),
  });

  const { data: customerTypes = [], isLoading: isCustomerTypesLoading } = useQuery({
    queryKey: ["customerTypes"],
    queryFn: () => dropdownService.getCustomerTypes(),
  });

  const { data: ketenas = [], isLoading: isKetenasLoading } = useQuery({
    queryKey: ["ketenas", selectedKebeleId],
    queryFn: () => {
      if (!selectedKebeleId) return [];
      return dropdownService.getKetenasByKebele(selectedKebeleId);
    },
    enabled: !!selectedKebeleId,
  });

  const { data: readers = [], isLoading: isReadersLoading } = useQuery({
    queryKey: ["readers", selectedBranchId],
    queryFn: () => {
      if (!selectedBranchId) return [];
      return dropdownService.getReadersByBranch(selectedBranchId);
    },
    enabled: !!selectedBranchId,
    refetchOnWindowFocus: false,
  });

  const formatDateGC = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}/${day}/${y}`;
  };

  const formatDateISO = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const currentGregorianDate = new Date();
  const [ethYear] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(),
    currentGregorianDate.getMonth() + 1,
    currentGregorianDate.getDate()
  );

  const months = [
    "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
  ];
  const years = useMemo(() => {
    const arr = [];
    for (let i = ethYear - 5; i <= ethYear + 1; i++) arr.push(i);
    return arr;
  }, [ethYear]);

  const { data: readings = [], isFetching, refetch } = useQuery({
    queryKey: ["unicash-send-readings", selectedKifyaWerMonth, selectedKifyaWerYear],
    queryFn: async () => {
      if (!selectedKifyaWerMonth || !selectedKifyaWerYear) return [];
      const kifyaWerFormatted = `${selectedKifyaWerMonth}, ${selectedKifyaWerYear}`;
      return await readingService.getBillFilteredReadings("ACTIVE", kifyaWerFormatted);
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
  });

  const filteredData = useMemo(() => {
    let base = Array.isArray(readings) ? [...readings] : [];

    if (selectedCustomerTypeId) {
      base = base.filter((r) => {
        const v = r.customerTypeId;
        return v != null && String(v) === String(selectedCustomerTypeId);
      });
    }

    if (selectedKebeleId) {
      base = base.filter((r) => {
        const v = r.customerKebeleId;
        return v != null && String(v) === String(selectedKebeleId);
      });
    }

    if (selectedKetenaId) {
      base = base.filter((r) => {
        const v = r.addressKetenaId;
        return v != null && String(v) === String(selectedKetenaId);
      });
    }

    if (selectedBranchId) {
      base = base.filter((r) => {
        const v = r.branchsId;
        return v != null && String(v) === String(selectedBranchId);
      });
    }

    if (selectedReaderId) {
      base = base.filter((r) => {
        const v = r.assignedReaderId;
        return v != null && String(v) === String(selectedReaderId);
      });
    }

    if (moneyCollectedFilter !== "all") {
      const desiredCollected = moneyCollectedFilter === "true";
      base = base.filter((r) => {
        const raw =
          r.moneyCollected !== undefined && r.moneyCollected !== null
            ? r.moneyCollected
            : r.isMoneyCollected;
        if (raw === undefined || raw === null) return false;
        if (typeof raw === "string") {
          const v = raw.toLowerCase();
          if (v === "true" || v === "1") return desiredCollected === true;
          if (v === "false" || v === "0") return desiredCollected === false;
          return false;
        }
        if (typeof raw === "number") {
          return (!!raw) === desiredCollected;
        }
        return (!!raw) === desiredCollected;
      });
    }

    if (!sendToBankFilter) return base;
    if (sendToBankFilter === "sent") {
      return base.filter(
        (r) => r.isSendToBankUnicash === true || r.sendToBankUnicash === true
      );
    }
    if (sendToBankFilter === "not_sent") {
      return base.filter(
        (r) =>
          r.isSendToBankUnicash === false ||
          r.sendToBankUnicash === false ||
          (r.isSendToBankUnicash == null && r.sendToBankUnicash == null)
      );
    }
    return base;
  }, [
    readings,
    sendToBankFilter,
    moneyCollectedFilter,
    selectedCustomerTypeId,
    selectedKebeleId,
    selectedKetenaId,
    selectedBranchId,
    selectedReaderId,
  ]);

  // Always exclude paid bills from CSV operations
  const csvEligibleData = useMemo(() => {
    return filteredData.filter((r) => {
      const raw = r.moneyCollected !== undefined && r.moneyCollected !== null
        ? r.moneyCollected
        : r.isMoneyCollected;
      if (raw === true || raw === "true" || raw === "1" || raw === 1) return false;
      return true;
    });
  }, [filteredData]);

  const table = useMaterialReactTable({
    columns: [
      { accessorKey: "billingInvoiceNumber", header: "Invoice" },
      { accessorKey: "customerAccountNumber", header: "Account" },
      { accessorKey: "customerFullName", header: "Name" },
      { accessorKey: "tekilalaTekefay", header: "Amount" },
      { accessorKey: "kifyaWer", header: "Period" },
      {
        id: "isSendToBankUnicash",
        header: "Sent to Unicash",
        accessorFn: (row) =>
          (row.isSendToBankUnicash === true || row.sendToBankUnicash === true)
            ? "Yes"
            : "No",
      },
    ],
    data: filteredData,
    state: { isLoading: isFetching, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
  });

  const handleFilter = () => {
    if (!selectedKifyaWerMonth || !selectedKifyaWerYear) {
      toast.info("Select month and year");
      return;
    }
    refetch();
  };

  const handleMarkAllSent = async () => {
    try {
      if (!Array.isArray(filteredData) || filteredData.length === 0) {
        toast.info("No bills to mark as sent");
        return;
      }
      const readingIds = filteredData
        .map((r) => r.id)
        .filter((id) => id != null);
      if (!readingIds.length) {
        toast.info("No valid bills to mark as sent");
        return;
      }
      setProcessing(true);
      const res = await bankUnicashService.markBillsSentToUnicash({ readingIds });
      if (res && res.success) {
        toast.success(res.message || `Marked ${res.updatedCount || readingIds.length} bills as sent to Unicash`);
        await refetch();
      } else if (res) {
        toast.error(res.message || "Failed to mark bills as sent");
      } else {
        toast.error("Failed to mark bills as sent");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to mark bills as sent");
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAllFiltered = () => {
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      toast.info("No bills to select");
      return;
    }
    const next = {};
    filteredData.forEach((row) => {
      if (row.id != null) {
        next[String(row.id)] = true;
      }
    });
    setRowSelection(next);
  };

  const handleSendCsv = async () => {
    try {
      if (!dueDate) {
        toast.error("Select due date");
        return;
      }
      if (!Array.isArray(csvEligibleData) || csvEligibleData.length === 0) {
        toast.info("No unpaid bills to send");
        return;
      }
      setProcessing(true);
      const headers = [
        "index",
        "bill_id",
        "bill_description",
        "bill_reason",
        "amount_due",
        "customer_id",
        "name",
        "due_date",
        "mobile",
        "email",
        "Prev_Read",
        "Curr_Read",
        "Consumtion",
      ];
      const DEFAULT_EMAIL = "mardawbms@gmail.com";
      const rows = csvEligibleData.map((row) => {
        const billId = row.billingInvoiceNumber ?? row.invoiceNumber ?? "";
        const kifya = row.kifyaWer ?? "";
        const englishEthMonth = getEnglishEthMonth(kifya);
        const yearMatch = (kifya || "").match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : "";
        const baseLabel = englishEthMonth ? `${englishEthMonth}_${year}` : kifya.replace(",", "_");
        const billDesc = (row.billDescriptionBank ?? baseLabel).replace(/,/g, " ");
        const billReason = billDesc;
        const amountDue = row.tekilalaTekefay ?? 0;
        const customerId = row.customerAccountNumber ?? row.accountNumber ?? "";
        let fullName = row.customerFullNameEng ?? row.customerFullName ?? "";
        fullName = String(fullName).replace(/,/g, " ").replace(/[^A-Za-z0-9]/g, " ");
        const mobile = normalizeUnicashMobile(row.customerPhoneNumber || row.phoneNumber);
        const email = DEFAULT_EMAIL;
        const prevRead = row.previousReading ?? 0;
        const currRead = row.lastReading ?? 0;
        const consum = row.consumption ?? 0;
        const index = row.id ?? "";
        return [
          index,
          billId,
          billDesc,
          billReason,
          amountDue,
          customerId,
          fullName,
          dueDate,
          mobile,
          email,
          prevRead,
          currRead,
          consum,
        ];
      });
      const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const file = new File([blob], "unicash_bill_data.csv", { type: "text/csv" });
      const res = await bankUnicashService.forwardCustomersBillDataFile(file);
      if (res) {
        const message = typeof res.message === "string" && res.message.trim().length > 0
          ? `CSV sent to Unicash: ${res.message}`
          : "CSV sent to Unicash";
        toast.success(message);
        // Mark all sent bills as sent to Unicash
        try {
          const readingIds = csvEligibleData
            .map((r) => r.id)
            .filter((id) => id != null);
          if (readingIds.length) {
            await bankUnicashService.markBillsSentToUnicash({ readingIds });
          }
        } catch (markErr) {
          toast.error(markErr?.response?.data?.message || markErr?.message || "Failed to mark bills as sent");
        }
        await refetch();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Send failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!dueDate) {
      toast.error("Select due date");
      return;
    }
    if (!Array.isArray(csvEligibleData) || csvEligibleData.length === 0) {
      toast.info("No unpaid bills to download");
      return;
    }
    const headers = [
      "index",
      "bill_id",
      "bill_description",
      "bill_reason",
      "amount_due",
      "customer_id",
      "name",
      "due_date",
      "mobile",
      "email",
      "Prev_Read",
      "Curr_Read",
      "Consumtion",
    ];
    const DEFAULT_EMAIL = "mardawbms@gmail.com";
    const rows = csvEligibleData.map((row) => {
      const billId = row.billingInvoiceNumber ?? row.invoiceNumber ?? "";
      const kifya = row.kifyaWer ?? "";
      const englishEthMonth = getEnglishEthMonth(kifya);
      const yearMatch = (kifya || "").match(/(\d{4})/);
      const year = yearMatch ? yearMatch[1] : "";
      const baseLabel = englishEthMonth ? `${englishEthMonth}_${year}` : kifya.replace(",", "_");
      const billDesc = (row.billDescriptionBank ?? baseLabel).replace(/,/g, " ");
      const billReason = billDesc;
      const amountDue = row.tekilalaTekefay ?? 0;
      const customerId = row.customerAccountNumber ?? row.accountNumber ?? "";
      let fullName = row.customerFullNameEng ?? row.customerFullName ?? "";
      fullName = String(fullName).replace(/,/g, " ").replace(/[^A-Za-z0-9]/g, " ");
      const mobile = normalizeUnicashMobile(row.customerPhoneNumber || row.phoneNumber);
      const email = DEFAULT_EMAIL;
      const prevRead = row.previousReading ?? 0;
      const currRead = row.lastReading ?? 0;
      const consum = row.consumption ?? 0;
      const index = row.id ?? "";
      return [
        index, billId, billDesc, billReason, amountDue, customerId, fullName,
        dueDate, mobile, email, prevRead, currRead, consum,
      ];
    });
    const csvContent = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "unicash_bill_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded CSV with ${csvEligibleData.length} bills`);
  };

  const handleSendSelected = async () => {
    try {
      if (!dueDate) {
        toast.error("Select due date");
        return;
      }
      const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
      if (!selectedIds.length) {
        toast.info("Select rows to send");
        return;
      }
      setProcessing(true);
      let ok = 0, fail = 0;
      const successIds = [];
      for (const id of selectedIds) {
        const bill = csvEligibleData.find((r) => String(r.id) === String(id));
        if (!bill) { fail++; continue; }
        const kifya = bill.kifyaWer ?? "";
        const englishEthMonth = getEnglishEthMonth(kifya);
        const yearMatch = (kifya || "").match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : "";
        const baseLabel = englishEthMonth ? `${englishEthMonth}_${year}` : kifya.replace(",", "_");

        let description = bill.billDescriptionBank ?? baseLabel;
        description = description.replace(/,/g, " "); // Sanitize comma

        let fullName = bill.customerFullNameEng ?? bill.customerFullName ?? "";
        fullName = String(fullName).replace(/,/g, " ").replace(/[^A-Za-z0-9]/g, " ");

        // DEBUG: Send empty phone number to isolate 400 cause
        // const phoneNumber = "";
        const phoneNumber = normalizeUnicashMobile(bill.customerPhoneNumber || bill.phoneNumber);

        const payload = {
          billId: bill.billingInvoiceNumber ?? bill.invoiceNumber ?? "",
          customerId: bill.customerAccountNumber ?? bill.accountNumber ?? "",
          fullName,
          phoneNumber,
          amountDue: bill.tekilalaTekefay ?? 0,
          description,
          validUntil: dueDate,
        };
        // eslint-disable-next-line no-console
        console.log("Unicash single-bill payload (client):", payload);
        console.log(`Sending bill ${payload.billId}...`);
        try {
          await bankUnicashService.submitSingleBill(payload);
          console.log(`Success sending bill ${payload.billId}`);
          ok++;
          successIds.push(bill.id);
        } catch (err) {
          console.error(`Failed sending bill ${payload.billId}`, err);
          fail++;
        }
      }
      if (successIds.length) {
        try {
          await bankUnicashService.markBillsSentToUnicash({ readingIds: successIds });
        } catch (e) {
          toast.error(e?.response?.data?.message || e?.message || "Failed to mark some bills as sent to Unicash");
        }
      }
      if (ok) toast.success(`Sent ${ok} bills to Unicash`);
      if (fail) toast.error(`${fail} failed`);
      if (successIds.length) {
        await refetch();
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Send failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBankBills = async () => {
    try {
      if (!dueDate) {
        toast.error("Select due date");
        return;
      }
      const penalty = Number(extraPenalty);
      if (!penalty || penalty <= 0) {
        toast.error("Enter extra penalty amount");
        return;
      }
      const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
      if (!selectedIds.length) {
        toast.info("Select rows to update");
        return;
      }
      setProcessing(true);
      const selectedRows = filteredData.filter((r) => selectedIds.includes(String(r.id)));
      const eligibleRows = selectedRows.filter(
        (r) => r.isSendToBankUnicash === true || r.sendToBankUnicash === true
      );
      if (!eligibleRows.length) {
        toast.error("Selected bills are not marked as sent to Unicash");
        return;
      }
      if (eligibleRows.length < selectedRows.length) {
        toast.info(`Only ${eligibleRows.length} of ${selectedRows.length} selected bills are marked as sent; updating those.`);
      }
      const readingIds = eligibleRows.map((r) => Number(r.id));
      const dueDateISO = formatDateISO(dueDateEC); // Convert to yyyy-MM-dd format
      const res = await bankUnicashService.extendBillsWithPenalty({
        readingIds,
        extraPenalty: penalty,
        dueDate: dueDateISO,
      });
      if (res && res.success) {
        toast.success(res.message || `Updated ${res.updatedCount} bills`);
        await refetch();
      } else if (res) {
        toast.error(res.message || "Update failed");
      } else {
        toast.error("Update failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Update failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateBulkCsv = async () => {
    try {
      if (!dueDate) {
        toast.error("Select due date");
        return;
      }
      const penalty = Number(extraPenalty);
      if (!penalty || penalty <= 0) {
        toast.error("Enter extra penalty amount");
        return;
      }
      const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
      if (!selectedIds.length) {
        toast.info("Select rows to update");
        return;
      }
      setProcessing(true);
      const selectedRows = filteredData.filter((r) => selectedIds.includes(String(r.id)));
      const eligibleRows = selectedRows.filter(
        (r) => r.isSendToBankUnicash === true || r.sendToBankUnicash === true
      );
      if (!eligibleRows.length) {
        toast.error("Selected bills are not marked as sent to Unicash");
        setProcessing(false);
        return;
      }
      if (eligibleRows.length < selectedRows.length) {
        toast.info(`Only ${eligibleRows.length} of ${selectedRows.length} selected bills are marked as sent; updating those.`);
      }

      // 1. Update Local DB
      const readingIds = eligibleRows.map((r) => Number(r.id));
      const dueDateISO = formatDateISO(dueDateEC); // Convert to yyyy-MM-dd format
      const updateRes = await bankUnicashService.extendBillsWithPenaltyLocal({
        readingIds,
        extraPenalty: penalty,
        dueDate: dueDateISO,
      });

      if (!updateRes || !updateRes.success) {
        toast.error(updateRes?.message || "Local DB update failed");
        setProcessing(false);
        return;
      }
      toast.success("Local DB updated. Generating CSV...");

      // 2. Generate CSV
      // We calculate new amounts based on CURRENT + PENALTY because we want to send the UPDATED amount.
      // Note: The rows in 'eligibleRows' still have old data.
      const headers = [
        "index",
        "bill_id",
        "bill_description",
        "bill_reason",
        "amount_due",
        "customer_id",
        "name",
        "due_date",
        "mobile",
        "email",
        "Prev_Read",
        "Curr_Read",
        "Consumtion",
      ];
      const DEFAULT_EMAIL = "mardawbms@gmail.com";

      const csvRows = eligibleRows.map((row) => {
        const billId = row.billingInvoiceNumber ?? row.invoiceNumber ?? "";
        const kifya = row.kifyaWer ?? "";
        const englishEthMonth = getEnglishEthMonth(kifya);
        const yearMatch = (kifya || "").match(/(\d{4})/);
        const year = yearMatch ? yearMatch[1] : "";
        const baseLabel = englishEthMonth ? `${englishEthMonth}_${year}` : kifya.replace(",", "_");
        const billDesc = (row.billDescriptionBank ?? baseLabel).replace(/,/g, " ");
        const billReason = billDesc;

        // baseTotal logic mirror backend: if it had old penalty, we should theoretically remove it,
        // but here we just assume displayed 'tekilalaTekefay' is current total.
        // Backend logic: base = current - old_penalty; new = base + new_penalty.
        // Frontend simplification: If we trust the local update just worked, we could fetch fresh data.
        // But to be fast, we can approximate:
        // current_amount + penalty_diff? 
        // Simplest safe bet: 'tekilalaTekefay' IS the current due. 
        // We add 'penalty' to it? 
        // Wait, if 'tekilalaTekefay' already includes an OLD penalty, and we add NEW penalty.
        // The backend `updateBillsLocallyWithPenalty` DOES `base = total - old; new = base + new`.
        // So effectively, the NEW TOTAL is `(total - old_penalty) + new_penalty`.
        // We don't easily know 'old_penalty' here unless we check `techemariKitat`.

        const oldPenalty = row.techemariKitat ?? 0;
        const currentTotal = row.tekilalaTekefay ?? 0;
        const baseTotal = currentTotal - oldPenalty;
        const newTotal = baseTotal + penalty;

        const customerId = row.customerAccountNumber ?? row.accountNumber ?? "";
        let fullName = row.customerFullNameEng ?? row.customerFullName ?? "";
        fullName = String(fullName).replace(/,/g, " ").replace(/[^A-Za-z0-9]/g, " ");
        const mobile = normalizeUnicashMobile(row.customerPhoneNumber || row.phoneNumber);
        const email = DEFAULT_EMAIL;
        const prevRead = row.previousReading ?? 0;
        const currRead = row.lastReading ?? 0;
        const consum = row.consumption ?? 0;
        const index = row.id ?? "";

        return [
          index,
          billId,
          billDesc,
          billReason,
          newTotal, // Use the CALCULATED new total
          customerId,
          fullName,
          dueDate,
          mobile,
          email,
          prevRead,
          currRead,
          consum,
        ];
      });

      const csvContent = [headers.join(","), ...csvRows.map((r) => r.map(escapeCSV).join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const file = new File([blob], "unicash_bulk_update.csv", { type: "text/csv" });

      // 3. Upload CSV
      const uploadRes = await bankUnicashService.forwardBulkUpdateCsvFile(file);
      if (uploadRes) {
        toast.success("Bulk update CSV sent to Unicash!");
        await refetch();
      }

    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Bulk update failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelBills = async () => {
    try {
      const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);
      if (!selectedIds.length) {
        toast.info("Select rows to cancel");
        return;
      }
      setProcessing(true);
      const selectedRows = filteredData.filter((r) => selectedIds.includes(String(r.id)));
      const eligibleRows = selectedRows.filter(
        (r) => r.isSendToBankUnicash === true || r.sendToBankUnicash === true
      );
      if (!eligibleRows.length) {
        toast.error("Selected bills are not marked as sent to Unicash");
        return;
      }
      if (eligibleRows.length < selectedRows.length) {
        toast.info(`Only ${eligibleRows.length} of ${selectedRows.length} selected bills are marked as sent; cancelling those.`);
      }
      const readingIds = eligibleRows.map((r) => Number(r.id));
      const res = await bankUnicashService.cancelBills(readingIds);
      if (res && res.success) {
        toast.success(res.message || `Cancelled ${res.updatedCount} bills`);
        await refetch();
      } else if (res) {
        toast.error(res.message || "Cancel failed");
      } else {
        toast.error("Cancel failed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Cancel failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Breadcrumb pageName="Send Bills to Unicash" />
      </Grid>
      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Header with Title and Filtered Count */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Unicash Bill Submission
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
              Filtered bills: {filteredData?.length || 0}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Period Selection & Settings - Full Row */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  1. Period & Settings
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={6} lg={4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Month</InputLabel>
                      <Select value={selectedKifyaWerMonth} label="Month" onChange={(e) => setSelectedKifyaWerMonth(e.target.value)}>
                        {months.map((m) => (<MenuItem key={m} value={m}>{m}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} lg={4}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select value={selectedKifyaWerYear} label="Year" onChange={(e) => setSelectedKifyaWerYear(e.target.value)}>
                        {years.map((y) => (<MenuItem key={y} value={y}>{y}</MenuItem>))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Button
                      variant="outlined"
                      onClick={handleFilter}
                      disabled={isFetching || processing}
                      fullWidth
                      sx={{ height: '40px' }}
                    >
                      {isFetching ? <CircularProgress size={20} /> : "Filter Bills"}
                    </Button>
                  </Grid>

                  <Grid item xs={8} lg={8}>
                    <EtDatePicker
                      label="Due Date (EC)"
                      value={dueDateEC}
                      onChange={(val) => {
                        setDueDateEC(val);
                        setDueDate(formatDateISO(val));
                      }}
                      minDate={currentGregorianDate}
                      size="small"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                  <Grid item xs={4} lg={4}>
                    <TextField
                      type="number"
                      label="Penalty"
                      InputLabelProps={{ shrink: true }}
                      value={extraPenalty}
                      onChange={(e) => setExtraPenalty(e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Filters - Full Row */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  2. Filter Bills
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Bank Sent</InputLabel>
                      <Select
                        value={sendToBankFilter}
                        label="Bank Sent"
                        onChange={(e) => setSendToBankFilter(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="sent">Sent</MenuItem>
                        <MenuItem value="not_sent">Not Sent</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Collected</InputLabel>
                      <Select
                        value={moneyCollectedFilter}
                        label="Collected"
                        onChange={(e) => setMoneyCollectedFilter(e.target.value)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="false">No</MenuItem>
                        <MenuItem value="true">Yes</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Customer Type</InputLabel>
                      <Select
                        value={selectedCustomerTypeId}
                        label="Customer Type"
                        onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
                        disabled={isCustomerTypesLoading}
                      >
                        <MenuItem value=""><em>All Types</em></MenuItem>
                        {customerTypes?.map((type) => (
                          <MenuItem key={type.id} value={type.id}>
                            {type.name || `Type ${type.id}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Kebele</InputLabel>
                      <Select
                        value={selectedKebeleId}
                        label="Kebele"
                        onChange={(e) => {
                          setSelectedKebeleId(e.target.value);
                          setSelectedKetenaId("");
                        }}
                        disabled={isKebelesLoading}
                      >
                        <MenuItem value=""><em>All</em></MenuItem>
                        {kebeles?.map((k) => (
                          <MenuItem key={k.id} value={k.id}>{k.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth disabled={!selectedKebeleId}>
                      <InputLabel>Ketena</InputLabel>
                      <Select
                        value={selectedKetenaId}
                        label="Ketena"
                        onChange={(e) => setSelectedKetenaId(e.target.value)}
                        disabled={isKetenasLoading || !selectedKebeleId}
                      >
                        <MenuItem value=""><em>All</em></MenuItem>
                        {ketenas?.map((ket) => (
                          <MenuItem key={ket.id} value={ket.id}>{ket.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Branch</InputLabel>
                      <Select
                        value={selectedBranchId}
                        label="Branch"
                        onChange={(e) => {
                          setSelectedBranchId(e.target.value);
                          setSelectedReaderId("");
                        }}
                        disabled={isBranchesLoading}
                      >
                        <MenuItem value=""><em>All</em></MenuItem>
                        {branches?.map((b) => (
                          <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <FormControl size="small" fullWidth disabled={!selectedBranchId}>
                      <InputLabel>Reader</InputLabel>
                      <Select
                        value={selectedReaderId}
                        label="Reader"
                        onChange={(e) => setSelectedReaderId(e.target.value)}
                        disabled={isReadersLoading || !selectedBranchId}
                      >
                        <MenuItem value=""><em>All</em></MenuItem>
                        {readers?.map((r) => (
                          <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  3. Actions
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={handleSelectAllFiltered}
                      disabled={processing || !filteredData?.length}
                    >
                      Select All
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleSendCsv}
                      disabled={processing || !filteredData?.length || !dueDate}
                      sx={{ color: 'white' }}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Send CSV"}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={handleDownloadCsv}
                      disabled={processing || !csvEligibleData?.length || !dueDate}
                    >
                      Download CSV
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleSendSelected}
                      disabled={processing || !Object.keys(rowSelection).some((k) => rowSelection[k]) || !dueDate}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Send Selected"}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={handleUpdateBulkCsv}
                      disabled={processing || !Object.keys(rowSelection).some((k) => rowSelection[k]) || !dueDate || !extraPenalty}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Update Bulk CSV"}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpdateBankBills}
                      disabled={processing || !Object.keys(rowSelection).some((k) => rowSelection[k]) || !dueDate || !extraPenalty}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Update Penalty"}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCancelBills}
                      disabled={processing || !Object.keys(rowSelection).some((k) => rowSelection[k])}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Cancel Bill"}
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="info"
                      onClick={handleMarkAllSent}
                      disabled={processing || !filteredData?.length}
                    >
                      {processing ? <CircularProgress size={20} color="inherit" /> : "Set All Sent"}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Table */}
            <Grid item xs={12}>
              <MaterialReactTable table={table} />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <ToastContainer />
    </Grid>
  );
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const SendToUnicashPage = () => (
  <QueryClientProvider client={queryClient}>
    <SendToUnicashInner />
  </QueryClientProvider>
);

export default SendToUnicashPage;
