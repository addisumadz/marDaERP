"use client";
import { useMemo, useState, useEffect } from "react";
import {
  Box, Button, Paper, Typography, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert, AlertTitle
} from "@mui/material";
import {
  QueryClient, QueryClientProvider, useQuery, useMutation
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ReadingService } from "../../../lib/ReadingService";
import { BillingBanksService } from "../../../lib/billingBanksService";
import fncJournalEntryService from "../../../lib/fncJournalEntryService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
var ethiopianDate = require("ethiopian-date");

const readingService = new ReadingService();
const billingBanksService = new BillingBanksService();

const ethiopianMonths = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት", "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ",
];

const BillToJournal = () => {
  const currentGregorianDate = new Date();
  const [ethYear, ethMonth] = ethiopianDate.toEthiopian(
    currentGregorianDate.getFullYear(), currentGregorianDate.getMonth() + 1, currentGregorianDate.getDate()
  );

  const [selectedMonth, setSelectedMonth] = useState(ethiopianMonths[ethMonth - 1] || "");
  const [selectedYear, setSelectedYear] = useState(String(ethYear) || "");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPaymentLocation, setSelectedPaymentLocation] = useState(null); // which row to push
  const [accountMappings, setAccountMappings] = useState({});
  const [bpMappings, setBpMappings] = useState({});  // Bill Preparation mappings (BP_ prefix)
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFiscalYear, setSelectedFiscalYear] = useState("");
  const [existingRefs, setExistingRefs] = useState(new Set());
  const [draftRefs, setDraftRefs] = useState(new Set()); // Track DRAFT status refs
  const [loadingMappings, setLoadingMappings] = useState(true);
  const [billPrepDialogOpen, setBillPrepDialogOpen] = useState(false);
  const [supPrepDialogOpen, setSupPrepDialogOpen] = useState(false); // supplemental push dialog
  const [plSupDialogOpen, setPlSupDialogOpen] = useState(false); // payment location supplemental push dialog
  const [selectedSupLocation, setSelectedSupLocation] = useState(null); // which PL location's supplemental push

  // ── Section 3: Unpaid Bills Summary state ──
  const [unpaidSectionVisible, setUnpaidSectionVisible] = useState(false);
  const [unpaidSummary, setUnpaidSummary] = useState(null);   // charge-level breakdown from backend
  const [journalBalance, setJournalBalance] = useState(null); // reconciliation data from backend
  const [loadingUnpaid, setLoadingUnpaid] = useState(false);
  const [unpaidDialogOpen, setUnpaidDialogOpen] = useState(false); // confirm dialog for reversal

  const yearOptions = [2014, 2015, 2016, 2017, 2018, 2019, 2020];

  // Load account mappings and fiscal years
  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setLoadingMappings(true);
    try {
      const [mappingsData, fyData] = await Promise.all([
        fncBillingAccountMapService.getAllMappings().catch(() => []),
        fncFiscalYearService.getOpenFiscalYears().catch(() => []),
      ]);
      const map = {};
      const bpMap = {};
      if (Array.isArray(mappingsData)) {
        mappingsData.forEach(m => {
          if (m.mappingKey && m.mappingKey.startsWith("BP_")) {
            bpMap[m.mappingKey] = m.accountId;
          } else {
            map[m.mappingKey] = m.accountId;
          }
        });
      }
      setAccountMappings(map);
      setBpMappings(bpMap);
      setFiscalYears(Array.isArray(fyData) ? fyData : []);
      if (Array.isArray(fyData) && fyData.length > 0) {
        setSelectedFiscalYear(fyData[0].id);
      }
    } catch (e) {
      toast.error("Failed to load support data");
    }
    setLoadingMappings(false);
  };

  // Load banks for mapping codes to full bank names
  const { data: banks = [] } = useQuery({
    queryKey: ["billingBanksAll"],
    queryFn: async () => {
      try {
        const res = await billingBanksService.getAllBillingBanks();
        return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      } catch (e) { return []; }
    },
    staleTime: 10 * 60 * 1000,
  });

  const lookupBankName = (agentName) => {
    if (!agentName || !Array.isArray(banks) || banks.length === 0) return agentName;
    let bank =
      banks.find((b) => b.bankCode === agentName) ||
      banks.find((b) => b.gatewayCode === agentName) ||
      banks.find((b) => (b.bankName || "").toLowerCase().includes(String(agentName).toLowerCase()));
    return bank ? bank.bankName : agentName;
  };

  // Find bank id from agent name for mapping lookup
  const lookupBankId = (agentName) => {
    if (!agentName || !Array.isArray(banks) || banks.length === 0) return null;
    let bank =
      banks.find((b) => b.bankCode === agentName) ||
      banks.find((b) => b.gatewayCode === agentName) ||
      banks.find((b) => (b.bankName || "").toLowerCase().includes(String(agentName).toLowerCase()));
    return bank ? (bank.id || bank.bankCode) : null;
  };

  // Fetch bills for selected month/year (mirrored from billList)
  const { data: readings = [], isLoading, refetch } = useQuery({
    queryKey: ["billToJournalReadings", selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedMonth && selectedYear) {
        const kifyaWerFormatted = `${selectedMonth}, ${selectedYear}`;
        const [activeList, deletedBillFiltered, deletedFiltered] = await Promise.all([
          readingService.getBillFilteredReadings("ACTIVE", kifyaWerFormatted).catch(() => []),
          readingService.getBillFilteredReadings("DELETED", kifyaWerFormatted).catch(() => []),
          readingService.getFilteredReadings("DELETED", kifyaWerFormatted).catch(() => []),
        ]);
        const merged = [...(activeList || []), ...(deletedBillFiltered || []), ...(deletedFiltered || [])];
        const byId = new Map();
        merged.forEach((it) => {
          const key = it?.id ?? it?.billingInvoiceNumber ?? it?.invoiceNumber ?? Math.random();
          if (!byId.has(key)) byId.set(key, it);
        });
        const arr = Array.from(byId.values());
        return arr.map((it) => {
          const isVoid = !!(it?.isVoid || it?.void || String(it?.status).toLowerCase() === "deleted");
          return { ...it, isVoid, void: isVoid || it?.void };
        });
      }
      return [];
    },
    enabled: !!selectedMonth && !!selectedYear,
    staleTime: 5 * 60 * 1000,
  });

  // Filter to non-void only (same as billList filteredData base)
  const filteredData = useMemo(() => {
    return readings.filter(b => !b?.isVoid && !b?.void);
  }, [readings]);

  // Check for existing journal entries for this month to prevent duplicates
  useEffect(() => {
    if (selectedMonth && selectedYear && selectedFiscalYear) {
      checkExistingEntries();
    }
  }, [selectedMonth, selectedYear, selectedFiscalYear]);

  const checkExistingEntries = async () => {
    if (!selectedMonth || !selectedYear) return;
    try {
      const kifyaWer = `${selectedMonth}, ${selectedYear}`;
      
      const [monthEntries, fyEntries] = await Promise.all([
        fncJournalEntryService.getEntriesByBillingMonth(kifyaWer).catch(() => []),
        selectedFiscalYear 
          ? fncJournalEntryService.getAllEntries({ page: 0, size: 500, fiscalYearId: selectedFiscalYear }).catch(() => null)
          : Promise.resolve(null),
      ]);

      const list1 = Array.isArray(monthEntries) ? monthEntries : (monthEntries?.content || monthEntries?.data || []);
      const list2 = fyEntries?.content || fyEntries?.data || (Array.isArray(fyEntries) ? fyEntries : []);
      
      const mergedMap = new Map();
      list1.forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });
      list2.forEach(e => { if (e && e.id) mergedMap.set(e.id, e); });
      const allEntries = Array.from(mergedMap.values());

      const refs = new Set();
      const drafts = new Set();
      allEntries.forEach(e => {
        // Exclude VOID entries so voided journals can be re-pushed
        if (e.referenceNumber && e.status !== "VOID") refs.add(e.referenceNumber);
        // Track DRAFT entries for notification
        if (e.referenceNumber && e.status === "DRAFT") drafts.add(e.referenceNumber);
      });
      setExistingRefs(refs);
      setDraftRefs(drafts);
    } catch (e) {
      console.error("[checkExistingEntries] Error checking entries:", e);
    }
  };

  // Query unpushed bill count from backend
  const kifyaWerFormatted = selectedMonth && selectedYear ? `${selectedMonth}, ${selectedYear}` : "";
  const { data: unpushedInfo, refetch: refetchUnpushed } = useQuery({
    queryKey: ["unpushedBillCount", kifyaWerFormatted],
    queryFn: async () => {
      if (!kifyaWerFormatted) return null;
      return await fncJournalEntryService.getUnpushedBillCount(kifyaWerFormatted);
    },
    enabled: !!kifyaWerFormatted,
    staleTime: 30 * 1000,
  });

  // Query unpushed PAID bill count from backend (separate tracking from Bill Preparation)
  const { data: unpushedPaidInfo, refetch: refetchUnpushedPaid } = useQuery({
    queryKey: ["unpushedPaidBillCount", kifyaWerFormatted],
    queryFn: async () => {
      if (!kifyaWerFormatted) return null;
      return await fncJournalEntryService.getUnpushedPaidBillCount(kifyaWerFormatted);
    },
    enabled: !!kifyaWerFormatted,
    staleTime: 30 * 1000,
  });

  // ─── Summations (mirrored from billList) ────────────────────────
  const summations = useMemo(() => {
    const initialSums = {
      yezihWerFjotaKfya: 0, kotariKiray: 0, additionalHisab: 0, techemariKfya: 0, yezihWer: 0,
      billingAdditionalPayment1Value: 0, billingAdditionalPayment2Value: 0,
      billingAdditionalPayment1Wuzif: 0, billingAdditionalPayment2Wuzif: 0,
      wuzifKotariKiray: 0, wuzifFjota: 0, wuzifDerekKoshasha: 0, wuzifTechemariKfya: 0,
      kitat: 0, wuzifHisab: 0, wuzifFjotaKfya: 0,
      temelashBirr: 0, kecreditYetekefele: 0, tekilalaYetekefele: 0, tekilalaTekefay: 0,
      consumption: 0,
      prepaid: 0, paidAtOffice: 0, paidByBank: {},
      duplicatePayments: 0, duplicatePaymentCount: 0,
      duplicateAdditionalHisab: 0, duplicateWuzifDerekKoshasha: 0, duplicateTekilalaTekefay: 0, duplicateCheck: 0,
      totalPaidLocationSum: 0, totaladditionalHisab: 0, totalwuzifDerekKoshasha: 0, totaltekelalaTekefay: 0,
      prepaidCount: 0, paidAtOfficeCount: 0, paidByBankCount: {},
      prepaidAdditionalHisab: 0, prepaidWuzifDerekKoshasha: 0, prepaidTekilalaTekefay: 0,
      officeAdditionalHisab: 0, officeWuzifDerekKoshasha: 0, officeTekilalaTekefay: 0,
      bankAdditionalHisab: {}, bankWuzifDerekKoshasha: {}, bankTekilalaTekefay: {},
      prepaidTotalDerekKoshasha: 0, officeTotalDerekKoshasha: 0, bankTotalDerekKoshasha: {},
      prepaidCheck: 0, officeCheck: 0, bankCheck: {},
    };

    if (!filteredData || filteredData.length === 0) return initialSums;

    const calculatedSums = filteredData.reduce((acc, bill) => {
      if (!bill.isVoid) {
        acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
        acc.kotariKiray += bill.kotariKiray || 0;
        acc.additionalHisab += bill.additionalHisab || 0;
        acc.techemariKfya += bill.techemariKfya || 0;
        acc.billingAdditionalPayment1Value += bill.billingAdditionalPayment1Value || 0;
        acc.billingAdditionalPayment2Value += bill.billingAdditionalPayment2Value || 0;
        acc.billingAdditionalPayment1Wuzif += bill.billingAdditionalPayment1Wuzif || 0;
        acc.billingAdditionalPayment2Wuzif += bill.billingAdditionalPayment2Wuzif || 0;
        acc.yezihWer += bill.yezihWer || 0;
        acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
        acc.wuzifFjota += bill.wuzifFjota || 0;
        acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
        acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
        acc.kitat += bill.kitat || 0;
        acc.wuzifHisab += bill.wuzifHisab || 0;
        acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
        acc.temelashBirr += bill.temelashBirr || 0;
        acc.kecreditYetekefele += bill.kecreditYetekefele || 0;
        acc.tekilalaYetekefele += bill.tekilalaYetekefele || 0;
        acc.tekilalaTekefay += bill.tekilalaTekefay || 0;
        acc.consumption += bill.consumption || 0;

        const getBankName = (key) => key;
        const totalPaidAmount = bill.tekilalaYetekefele || 0;
        let duplicatePaymentsIterator = 0;
        const bankKeysHandled = new Set();

        // Prepaid
        if (bill.kecreditYetekefele) {
          acc.prepaid += bill.kecreditYetekefele;
          acc.prepaidCount += 1;
          acc.prepaidAdditionalHisab += bill.additionalHisab || 0;
          acc.prepaidWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.prepaidTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.prepaidTotalDerekKoshasha += (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.prepaidCheck += (bill.tekilalaTekefay || 0) - (bill.kecreditYetekefele || 0);
        }
        // Office
        if (bill.paidOnFrontOffice) {
          duplicatePaymentsIterator++;
          acc.paidAtOffice += totalPaidAmount;
          acc.paidAtOfficeCount += 1;
          acc.officeAdditionalHisab += bill.additionalHisab || 0;
          acc.officeWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.officeTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.officeTotalDerekKoshasha += (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
          acc.officeCheck += (bill.tekilalaTekefay || 0) - totalPaidAmount;
        }
        // Bank Derash
        if (bill.derashPaid) {
          duplicatePaymentsIterator++;
          const rawKey = bill.bankPaidAgentId ?? bill.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          const lookupName = normKey ? getBankName(normKey) : null;
          const bankKeyForSum = lookupName && lookupName !== "Unknown Bank" ? lookupName : normKey;
          if (bankKeyForSum && !bankKeysHandled.has(bankKeyForSum)) {
            bankKeysHandled.add(bankKeyForSum);
            const bankPaid = bill.tekilalaBankYetekefele || 0;
            acc.paidByBank[bankKeyForSum] = (acc.paidByBank[bankKeyForSum] || 0) + bankPaid;
            acc.paidByBankCount[bankKeyForSum] = (acc.paidByBankCount[bankKeyForSum] || 0) + 1;
            acc.bankAdditionalHisab[bankKeyForSum] = (acc.bankAdditionalHisab[bankKeyForSum] || 0) + (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankKeyForSum] = (acc.bankWuzifDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankKeyForSum] = (acc.bankTekilalaTekefay[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0);
            acc.bankTotalDerekKoshasha[bankKeyForSum] = (acc.bankTotalDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
            acc.bankCheck[bankKeyForSum] = (acc.bankCheck[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0) - bankPaid;
          }
        }
        // Bank Unicash
        if (bill.unicashPaid) {
          duplicatePaymentsIterator++;
          const rawKey = bill.uBankPaidAgentId ?? bill.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          const lookupName = normKey ? getBankName(normKey) : null;
          const bankKeyForSum = lookupName && lookupName !== "Unknown Bank" ? lookupName : normKey;
          if (bankKeyForSum && !bankKeysHandled.has(bankKeyForSum)) {
            bankKeysHandled.add(bankKeyForSum);
            let bankPaid = Number(bill.tekilalaBankYetekefele) || 0;
            if (bankPaid === 0) {
              bankPaid = Math.max(0, (Number(bill.tekilalaYetekefele) || 0) - (Number(bill.kecreditYetekefele) || 0));
            }
            acc.paidByBank[bankKeyForSum] = (acc.paidByBank[bankKeyForSum] || 0) + bankPaid;
            acc.paidByBankCount[bankKeyForSum] = (acc.paidByBankCount[bankKeyForSum] || 0) + 1;
            acc.bankAdditionalHisab[bankKeyForSum] = (acc.bankAdditionalHisab[bankKeyForSum] || 0) + (bill.additionalHisab || 0);
            acc.bankWuzifDerekKoshasha[bankKeyForSum] = (acc.bankWuzifDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0);
            acc.bankTekilalaTekefay[bankKeyForSum] = (acc.bankTekilalaTekefay[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0);
            acc.bankTotalDerekKoshasha[bankKeyForSum] = (acc.bankTotalDerekKoshasha[bankKeyForSum] || 0) + (bill.wuzifDerekKoshasha || 0) + (bill.additionalHisab || 0);
            acc.bankCheck[bankKeyForSum] = (acc.bankCheck[bankKeyForSum] || 0) + (bill.tekilalaTekefay || 0) - bankPaid;
          }
        }
        // Duplicate
        if (duplicatePaymentsIterator > 1) {
          acc.duplicatePayments += totalPaidAmount;
          acc.duplicatePaymentCount += 1;
          acc.duplicateAdditionalHisab += bill.additionalHisab || 0;
          acc.duplicateWuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
          acc.duplicateTekilalaTekefay += bill.tekilalaTekefay || 0;
          acc.duplicateCheck += (bill.tekilalaTekefay || 0) - totalPaidAmount;
        }
      }
      return acc;
    }, initialSums);

    // Grand totals
    const totalBankPayments = Object.values(calculatedSums.paidByBank).reduce((s, a) => s + a, 0);
    const totalBankAddl = Object.values(calculatedSums.bankAdditionalHisab).reduce((s, a) => s + a, 0);
    const totalBankWuzif = Object.values(calculatedSums.bankWuzifDerekKoshasha).reduce((s, a) => s + a, 0);
    const totalBankTekilala = Object.values(calculatedSums.bankTekilalaTekefay).reduce((s, a) => s + a, 0);

    calculatedSums.totalPaidLocationSum = calculatedSums.paidAtOffice + totalBankPayments + calculatedSums.prepaid;
    calculatedSums.totaladditionalHisab = calculatedSums.officeAdditionalHisab + totalBankAddl + calculatedSums.prepaidAdditionalHisab;
    calculatedSums.totalwuzifDerekKoshasha = calculatedSums.officeWuzifDerekKoshasha + totalBankWuzif + calculatedSums.prepaidWuzifDerekKoshasha;
    calculatedSums.totaltekelalaTekefay = calculatedSums.officeTekilalaTekefay + totalBankTekilala + calculatedSums.prepaidTekilalaTekefay;

    return calculatedSums;
  }, [filteredData]);

  // ─── Build journal entry lines for a payment location ──────────
  const buildJournalLines = (locationType, bankKey = null) => {
    const lines = [];
    let debitAccountId = null;
    let totalDebit = 0;
    let locationLabel = "";

    // Determine debit account and amounts based on location type
    if (locationType === "PREPAID") {
      debitAccountId = accountMappings["PREPAID_ACCOUNT"];
      totalDebit = summations.prepaid;
      locationLabel = "Prepaid";
    } else if (locationType === "OFFICE") {
      debitAccountId = accountMappings["OFFICE_CASH"];
      totalDebit = summations.paidAtOffice;
      locationLabel = "Office (ቢሮ)";
    } else if (locationType === "BANK" && bankKey) {
      const bankId = lookupBankId(bankKey);
      debitAccountId = accountMappings[`BANK_${bankId}`] || accountMappings[`BANK_${bankKey}`];
      totalDebit = summations.paidByBank[bankKey] || 0;
      locationLabel = `Bank: ${lookupBankName(bankKey)}`;
    }

    totalDebit = Math.round(Number(totalDebit || 0) * 100) / 100;

    if (!debitAccountId) return { lines: [], error: `No account mapped for ${locationLabel}. Configure in Billing Account Map settings.` };
    if (totalDebit <= 0) return { lines: [], error: `No amount to push for ${locationLabel}.` };

    // DEBIT line: the payment location asset account
    lines.push({
      accountId: Number(debitAccountId),
      description: `${locationLabel} — Collection ${selectedMonth} ${selectedYear}`,
      debitAmount: totalDebit,
      creditAmount: 0,
    });

    // Filter bills that belong to this specific payment location
    let locationBills = [];
    if (locationType === "PREPAID") {
      locationBills = filteredData.filter(b => !b.isVoid && (b.kecreditYetekefele > 0 || b.isPaidFromTekemach));
    } else if (locationType === "OFFICE") {
      locationBills = filteredData.filter(b => !b.isVoid && (b.paidOnFrontOffice || b.isPaidOnFrontOffice));
    } else if (locationType === "BANK" && bankKey) {
      locationBills = filteredData.filter(b => {
        if (b.isVoid) return false;
        if (b.derashPaid || b.isDerashPaid) {
          const rawKey = b.bankPaidAgentId ?? b.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          if (normKey === bankKey) return true;
        }
        if (b.unicashPaid || b.isUnicashPaid) {
          const rawKey = b.uBankPaidAgentId ?? b.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          if (normKey === bankKey) return true;
        }
        return false;
      });
    }

    // Sum charge fields directly from the location's bills
    const locSums = locationBills.reduce((acc, bill) => {
      acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
      acc.kotariKiray += bill.kotariKiray || 0;
      acc.techemariKfya += bill.techemariKfya || 0;
      acc.billingAdditionalPayment1Value += bill.billingAdditionalPayment1Value || 0;
      acc.additionalHisab += bill.additionalHisab || 0;
      acc.billingAdditionalPayment2Value += bill.billingAdditionalPayment2Value || 0;
      acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
      acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
      acc.billingAdditionalPayment1Wuzif += bill.billingAdditionalPayment1Wuzif || 0;
      acc.kitat += bill.kitat || 0;
      acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
      acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
      acc.billingAdditionalPayment2Wuzif += bill.billingAdditionalPayment2Wuzif || 0;
      acc.wuzifHisab += bill.wuzifHisab || 0;
      return acc;
    }, {
      yezihWerFjotaKfya: 0, kotariKiray: 0, techemariKfya: 0, billingAdditionalPayment1Value: 0,
      additionalHisab: 0, billingAdditionalPayment2Value: 0,
      wuzifKotariKiray: 0, wuzifTechemariKfya: 0, billingAdditionalPayment1Wuzif: 0,
      kitat: 0, wuzifFjotaKfya: 0, wuzifDerekKoshasha: 0, billingAdditionalPayment2Wuzif: 0,
      wuzifHisab: 0,
    });

    // Calculated: የተላለፈ(ነባር) ውዝፍ — from this location's bills only
    const carriedForward = (locSums.wuzifHisab || 0) - (
      (locSums.wuzifKotariKiray || 0) + (locSums.wuzifFjotaKfya || 0) +
      (locSums.wuzifDerekKoshasha || 0) + (locSums.wuzifTechemariKfya || 0)
    );

    // CREDIT lines: Receivable accounts (clears A/R from Step 1 Bill Preparation)
    const creditItems = [
      // Group 1: የዚህ ወር — Receivable
      { key: "BP_DR_WATER_CONSUMPTION", amount: locSums.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ — Receivable" },
      { key: "BP_DR_METER_RENT", amount: locSums.kotariKiray, desc: "ቆጣሪ ኪራይ — Receivable" },
      { key: "BP_DR_ADDITIONAL_CHARGE", amount: locSums.techemariKfya, desc: "ተጨማሪ ክፍያ — Receivable" },
      { key: "BP_DR_SERVICE_CHARGE", amount: locSums.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ — Receivable" },
      { key: "BP_DR_WASTE_CHARGE", amount: locSums.additionalHisab, desc: "ደረቅ ቆሻሻ — Receivable" },
      { key: "BP_DR_SCHOOL_FEEDING", amount: locSums.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ — Receivable" },
      // Group 2: ውዝፍ — Receivable
      { key: "BP_DR_WUZIF_CONSUMPTION", amount: locSums.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ — Receivable" },
      { key: "BP_DR_WUZIF_METER_RENT", amount: locSums.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ — Receivable" },
      { key: "BP_DR_WUZIF_ADDITIONAL", amount: locSums.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ — Receivable" },
      { key: "BP_DR_WUZIF_SERVICE_CHARGE", amount: locSums.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት — Receivable" },
      { key: "BP_DR_PENALTY", amount: locSums.kitat, desc: "ቅጣት — Receivable" },
      { key: "BP_DR_WUZIF_WASTE", amount: locSums.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ — Receivable" },
      { key: "BP_DR_WUZIF_SCHOOL_FEEDING", amount: locSums.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት — Receivable" },
      { key: "BP_DR_CARRIED_FORWARD", amount: carriedForward > 0 ? carriedForward : 0, desc: "የተላለፈ(ነባር) ውዝፍ — Receivable" },
    ];

    const missingAccounts = [];
    const positiveItems = creditItems.filter(item => (item.amount || 0) > 0);
    const totalBilled = positiveItems.reduce((s, it) => s + (it.amount || 0), 0);

    if (positiveItems.length === 0 || totalBilled <= 0) {
      // Fallback: Credit the primary Water Consumption Receivable account with totalDebit
      const fallbackAccId = bpMappings["BP_DR_WATER_CONSUMPTION"];
      if (!fallbackAccId) {
        missingAccounts.push("የውሃ ፍጆታ — Receivable");
      } else {
        lines.push({
          accountId: Number(fallbackAccId),
          description: `የውሃ ፍጆታ — Receivable — ${selectedMonth} ${selectedYear}`,
          debitAmount: 0,
          creditAmount: totalDebit,
        });
      }
    } else {
      let assignedCredits = 0;
      positiveItems.forEach((item, idx) => {
        const accId = bpMappings[item.key];
        if (!accId) {
          missingAccounts.push(item.desc);
          return;
        }
        let lineAmount = 0;
        if (idx === positiveItems.length - 1) {
          // Last item absorbs exact penny remainder to ensure totalCredits === totalDebit
          lineAmount = Math.round((totalDebit - assignedCredits) * 100) / 100;
        } else {
          lineAmount = Math.round(((item.amount / totalBilled) * totalDebit) * 100) / 100;
          assignedCredits += lineAmount;
        }

        if (lineAmount > 0) {
          lines.push({
            accountId: Number(accId),
            description: `${item.desc} — ${selectedMonth} ${selectedYear}`,
            debitAmount: 0,
            creditAmount: lineAmount,
          });
        }
      });
    }

    if (missingAccounts.length > 0) {
      return { lines: [], error: `Missing Bill Prep account mapping for: ${missingAccounts.join(", ")}. Configure in Bill Prep Account Map settings.` };
    }

    return { lines, error: null, locationLabel };
  };

  // ─── Build Bill Preparation journal lines (Step 1: DR Receivable / CR Revenue) ───
  const buildBillPrepJournalLines = () => {
    const lines = [];
    const missingAccounts = [];

    const carriedForward = (summations.wuzifHisab || 0) - (
      (summations.wuzifKotariKiray || 0) + (summations.wuzifFjotaKfya || 0) +
      (summations.wuzifDerekKoshasha || 0) + (summations.wuzifTechemariKfya || 0)
    );

    const chargeItems = [
      { drKey: "BP_DR_WATER_CONSUMPTION", crKey: "BP_CR_WATER_CONSUMPTION", amount: summations.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ ብር" },
      { drKey: "BP_DR_METER_RENT", crKey: "BP_CR_METER_RENT", amount: summations.kotariKiray, desc: "ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_ADDITIONAL_CHARGE", crKey: "BP_CR_ADDITIONAL_CHARGE", amount: summations.techemariKfya, desc: "ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_SERVICE_CHARGE", crKey: "BP_CR_SERVICE_CHARGE", amount: summations.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_WASTE_CHARGE", crKey: "BP_CR_WASTE_CHARGE", amount: summations.additionalHisab, desc: "ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_SCHOOL_FEEDING", crKey: "BP_CR_SCHOOL_FEEDING", amount: summations.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_WUZIF_CONSUMPTION", crKey: "BP_CR_WUZIF_CONSUMPTION", amount: summations.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ ክፍያ" },
      { drKey: "BP_DR_WUZIF_METER_RENT", crKey: "BP_CR_WUZIF_METER_RENT", amount: summations.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_WUZIF_ADDITIONAL", crKey: "BP_CR_WUZIF_ADDITIONAL", amount: summations.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_WUZIF_SERVICE_CHARGE", crKey: "BP_CR_WUZIF_SERVICE_CHARGE", amount: summations.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_PENALTY", crKey: "BP_CR_PENALTY", amount: summations.kitat, desc: "ቅጣት" },
      { drKey: "BP_DR_WUZIF_WASTE", crKey: "BP_CR_WUZIF_WASTE", amount: summations.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_WUZIF_SCHOOL_FEEDING", crKey: "BP_CR_WUZIF_SCHOOL_FEEDING", amount: summations.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_CARRIED_FORWARD", crKey: "BP_CR_CARRIED_FORWARD", amount: carriedForward > 0 ? carriedForward : 0, desc: "የተላለፈ(ነባር) ውዝፍ" },
    ];

    chargeItems.forEach(item => {
      const rounded = Math.round((item.amount || 0) * 100) / 100;
      if (rounded > 0) {
        const drAccId = bpMappings[item.drKey];
        const crAccId = bpMappings[item.crKey];
        if (!drAccId) missingAccounts.push(`DR: ${item.desc}`);
        if (!crAccId) missingAccounts.push(`CR: ${item.desc}`);
        if (drAccId && crAccId) {
          lines.push({
            accountId: Number(drAccId),
            description: `${item.desc} — Receivable — ${selectedMonth} ${selectedYear}`,
            debitAmount: rounded,
            creditAmount: 0,
          });
          lines.push({
            accountId: Number(crAccId),
            description: `${item.desc} — ${selectedMonth} ${selectedYear}`,
            debitAmount: 0,
            creditAmount: rounded,
          });
        }
      }
    });

    if (missingAccounts.length > 0) {
      return { lines: [], error: `Missing Bill Preparation account mapping for: ${missingAccounts.join(", ")}. Configure in Bill Prep Account Map settings.` };
    }
    return { lines, error: null, locationLabel: "Bill Preparation" };
  };

  // ─── Build SUPPLEMENTAL Bill Preparation journal lines (only unpushed bills) ───
  const buildSupBillPrepJournalLines = () => {
    // Filter to only bills NOT yet pushed to journal
    const unpushedBills = filteredData.filter(b => !b.isVoid && !b.void && !b.isJournalPushed && !b.journalPushed);
    if (unpushedBills.length === 0) {
      return { lines: [], error: `No unpushed bills found for ${selectedMonth} ${selectedYear}. All bills have already been pushed.`, locationLabel: "Supplemental Bill Preparation" };
    }

    const lines = [];
    const missingAccounts = [];

    // Compute sums from ONLY the unpushed bills
    const sums = unpushedBills.reduce((acc, bill) => {
      acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
      acc.kotariKiray += bill.kotariKiray || 0;
      acc.techemariKfya += bill.techemariKfya || 0;
      acc.billingAdditionalPayment1Value += bill.billingAdditionalPayment1Value || 0;
      acc.additionalHisab += bill.additionalHisab || 0;
      acc.billingAdditionalPayment2Value += bill.billingAdditionalPayment2Value || 0;
      acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
      acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
      acc.billingAdditionalPayment1Wuzif += bill.billingAdditionalPayment1Wuzif || 0;
      acc.kitat += bill.kitat || 0;
      acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
      acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
      acc.billingAdditionalPayment2Wuzif += bill.billingAdditionalPayment2Wuzif || 0;
      acc.wuzifHisab += bill.wuzifHisab || 0;
      return acc;
    }, {
      yezihWerFjotaKfya: 0, kotariKiray: 0, techemariKfya: 0, billingAdditionalPayment1Value: 0,
      additionalHisab: 0, billingAdditionalPayment2Value: 0,
      wuzifKotariKiray: 0, wuzifTechemariKfya: 0, billingAdditionalPayment1Wuzif: 0,
      kitat: 0, wuzifFjotaKfya: 0, wuzifDerekKoshasha: 0, billingAdditionalPayment2Wuzif: 0,
      wuzifHisab: 0,
    });

    const carriedForward = (sums.wuzifHisab || 0) - (
      (sums.wuzifKotariKiray || 0) + (sums.wuzifFjotaKfya || 0) +
      (sums.wuzifDerekKoshasha || 0) + (sums.wuzifTechemariKfya || 0)
    );

    const chargeItems = [
      { drKey: "BP_DR_WATER_CONSUMPTION", crKey: "BP_CR_WATER_CONSUMPTION", amount: sums.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ ብር" },
      { drKey: "BP_DR_METER_RENT", crKey: "BP_CR_METER_RENT", amount: sums.kotariKiray, desc: "ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_ADDITIONAL_CHARGE", crKey: "BP_CR_ADDITIONAL_CHARGE", amount: sums.techemariKfya, desc: "ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_SERVICE_CHARGE", crKey: "BP_CR_SERVICE_CHARGE", amount: sums.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_WASTE_CHARGE", crKey: "BP_CR_WASTE_CHARGE", amount: sums.additionalHisab, desc: "ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_SCHOOL_FEEDING", crKey: "BP_CR_SCHOOL_FEEDING", amount: sums.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_WUZIF_CONSUMPTION", crKey: "BP_CR_WUZIF_CONSUMPTION", amount: sums.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ ክፍያ" },
      { drKey: "BP_DR_WUZIF_METER_RENT", crKey: "BP_CR_WUZIF_METER_RENT", amount: sums.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_WUZIF_ADDITIONAL", crKey: "BP_CR_WUZIF_ADDITIONAL", amount: sums.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_WUZIF_SERVICE_CHARGE", crKey: "BP_CR_WUZIF_SERVICE_CHARGE", amount: sums.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_PENALTY", crKey: "BP_CR_PENALTY", amount: sums.kitat, desc: "ቅጣት" },
      { drKey: "BP_DR_WUZIF_WASTE", crKey: "BP_CR_WUZIF_WASTE", amount: sums.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_WUZIF_SCHOOL_FEEDING", crKey: "BP_CR_WUZIF_SCHOOL_FEEDING", amount: sums.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_CARRIED_FORWARD", crKey: "BP_CR_CARRIED_FORWARD", amount: carriedForward > 0 ? carriedForward : 0, desc: "የተላለፈ(ነባር) ውዝፍ" },
    ];

    chargeItems.forEach(item => {
      const rounded = Math.round((item.amount || 0) * 100) / 100;
      if (rounded > 0) {
        const drAccId = bpMappings[item.drKey];
        const crAccId = bpMappings[item.crKey];
        if (!drAccId) missingAccounts.push(`DR: ${item.desc}`);
        if (!crAccId) missingAccounts.push(`CR: ${item.desc}`);
        if (drAccId && crAccId) {
          lines.push({
            accountId: Number(drAccId),
            description: `${item.desc} — Receivable (Supplemental) — ${selectedMonth} ${selectedYear}`,
            debitAmount: rounded,
            creditAmount: 0,
          });
          lines.push({
            accountId: Number(crAccId),
            description: `${item.desc} (Supplemental) — ${selectedMonth} ${selectedYear}`,
            debitAmount: 0,
            creditAmount: rounded,
          });
        }
      }
    });

    if (missingAccounts.length > 0) {
      return { lines: [], error: `Missing Bill Preparation account mapping for: ${missingAccounts.join(", ")}. Configure in Bill Prep Account Map settings.` };
    }
    if (lines.length === 0) {
      return { lines: [], error: `All charge amounts for unpushed bills are zero.`, locationLabel: "Supplemental Bill Preparation" };
    }
    return { lines, error: null, locationLabel: "Supplemental Bill Preparation", unpushedCount: unpushedBills.length };
  };

  // ─── Build SUPPLEMENTAL Payment Location journal lines (only unpushed paid bills for a location) ───
  const buildSupPayLocJournalLines = (locationType, bankKey = null) => {
    // Filter to only paid bills for this specific payment location that are NOT yet pushed
    let locationBills = [];
    if (locationType === "PREPAID") {
      locationBills = filteredData.filter(b => !b.isVoid && !b.void && (b.kecreditYetekefele > 0 || b.isPaidFromTekemach) && !b.isPaidJournalPushed && !b.paidJournalPushed);
    } else if (locationType === "OFFICE") {
      locationBills = filteredData.filter(b => !b.isVoid && !b.void && (b.paidOnFrontOffice || b.isPaidOnFrontOffice) && !b.isPaidJournalPushed && !b.paidJournalPushed);
    } else if (locationType === "BANK" && bankKey) {
      locationBills = filteredData.filter(b => {
        if (b.isVoid || b.void) return false;
        if (b.isPaidJournalPushed || b.paidJournalPushed) return false;
        if (b.derashPaid || b.isDerashPaid) {
          const rawKey = b.bankPaidAgentId ?? b.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          if (normKey === bankKey) return true;
        }
        if (b.unicashPaid || b.isUnicashPaid) {
          const rawKey = b.uBankPaidAgentId ?? b.bankName ?? null;
          const normKey = rawKey !== null && rawKey !== undefined ? String(rawKey) : null;
          if (normKey === bankKey) return true;
        }
        return false;
      });
    }

    if (locationBills.length === 0) {
      const locationLabel = locationType === "PREPAID" ? "Prepaid" : locationType === "OFFICE" ? "Office (ቢሮ)" : `Bank: ${lookupBankName(bankKey)}`;
      return { lines: [], error: `No unpushed paid bills found for ${locationLabel}.`, locationLabel };
    }

    const lines = [];
    let debitAccountId = null;
    let locationLabel = "";

    // Determine debit account
    if (locationType === "PREPAID") {
      debitAccountId = accountMappings["PREPAID_ACCOUNT"];
      locationLabel = "Prepaid";
    } else if (locationType === "OFFICE") {
      debitAccountId = accountMappings["OFFICE_CASH"];
      locationLabel = "Office (ቢሮ)";
    } else if (locationType === "BANK" && bankKey) {
      const bankId = lookupBankId(bankKey);
      debitAccountId = accountMappings[`BANK_${bankId}`] || accountMappings[`BANK_${bankKey}`];
      locationLabel = `Bank: ${lookupBankName(bankKey)}`;
    }

    if (!debitAccountId) return { lines: [], error: `No account mapped for ${locationLabel}. Configure in Billing Account Map settings.` };

    // Compute sums from ONLY unpushed paid bills for this location
    const locSums = locationBills.reduce((acc, bill) => {
      acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
      acc.kotariKiray += bill.kotariKiray || 0;
      acc.techemariKfya += bill.techemariKfya || 0;
      acc.billingAdditionalPayment1Value += bill.billingAdditionalPayment1Value || 0;
      acc.additionalHisab += bill.additionalHisab || 0;
      acc.billingAdditionalPayment2Value += bill.billingAdditionalPayment2Value || 0;
      acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
      acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
      acc.billingAdditionalPayment1Wuzif += bill.billingAdditionalPayment1Wuzif || 0;
      acc.kitat += bill.kitat || 0;
      acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
      acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
      acc.billingAdditionalPayment2Wuzif += bill.billingAdditionalPayment2Wuzif || 0;
      acc.wuzifHisab += bill.wuzifHisab || 0;
      // Compute total debit based on location type
      if (locationType === "PREPAID") acc.totalDebit += bill.kecreditYetekefele || 0;
      else if (locationType === "OFFICE") acc.totalDebit += bill.tekilalaYetekefele || 0;
      else if (locationType === "BANK") acc.totalDebit += bill.tekilalaBankYetekefele || (Math.max(0, (Number(bill.tekilalaYetekefele) || 0) - (Number(bill.kecreditYetekefele) || 0)));
      return acc;
    }, {
      yezihWerFjotaKfya: 0, kotariKiray: 0, techemariKfya: 0, billingAdditionalPayment1Value: 0,
      additionalHisab: 0, billingAdditionalPayment2Value: 0,
      wuzifKotariKiray: 0, wuzifTechemariKfya: 0, billingAdditionalPayment1Wuzif: 0,
      kitat: 0, wuzifFjotaKfya: 0, wuzifDerekKoshasha: 0, billingAdditionalPayment2Wuzif: 0,
      wuzifHisab: 0, totalDebit: 0,
    });

    const totalDebit = Math.round(Number(locSums.totalDebit || 0) * 100) / 100;
    if (totalDebit <= 0) return { lines: [], error: `No amount to push for ${locationLabel} supplemental.` };

    // DEBIT line
    lines.push({
      accountId: Number(debitAccountId),
      description: `${locationLabel} — Supplemental Collection ${selectedMonth} ${selectedYear}`,
      debitAmount: totalDebit,
      creditAmount: 0,
    });

    // Carried forward
    const carriedForward = (locSums.wuzifHisab || 0) - (
      (locSums.wuzifKotariKiray || 0) + (locSums.wuzifFjotaKfya || 0) +
      (locSums.wuzifDerekKoshasha || 0) + (locSums.wuzifTechemariKfya || 0)
    );

    // CREDIT lines
    const creditItems = [
      { key: "BP_DR_WATER_CONSUMPTION", amount: locSums.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ — Receivable" },
      { key: "BP_DR_METER_RENT", amount: locSums.kotariKiray, desc: "ቆጣሪ ኪራይ — Receivable" },
      { key: "BP_DR_ADDITIONAL_CHARGE", amount: locSums.techemariKfya, desc: "ተጨማሪ ክፍያ — Receivable" },
      { key: "BP_DR_SERVICE_CHARGE", amount: locSums.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ — Receivable" },
      { key: "BP_DR_WASTE_CHARGE", amount: locSums.additionalHisab, desc: "ደረቅ ቆሻሻ — Receivable" },
      { key: "BP_DR_SCHOOL_FEEDING", amount: locSums.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ — Receivable" },
      { key: "BP_DR_WUZIF_CONSUMPTION", amount: locSums.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ — Receivable" },
      { key: "BP_DR_WUZIF_METER_RENT", amount: locSums.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ — Receivable" },
      { key: "BP_DR_WUZIF_ADDITIONAL", amount: locSums.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ — Receivable" },
      { key: "BP_DR_WUZIF_SERVICE_CHARGE", amount: locSums.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት — Receivable" },
      { key: "BP_DR_PENALTY", amount: locSums.kitat, desc: "ቅጣት — Receivable" },
      { key: "BP_DR_WUZIF_WASTE", amount: locSums.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ — Receivable" },
      { key: "BP_DR_WUZIF_SCHOOL_FEEDING", amount: locSums.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት — Receivable" },
      { key: "BP_DR_CARRIED_FORWARD", amount: carriedForward > 0 ? carriedForward : 0, desc: "የተላለፈ(ነባር) ውዝፍ — Receivable" },
    ];

    const missingAccounts = [];
    const positiveItems = creditItems.filter(item => (item.amount || 0) > 0);
    const totalBilled = positiveItems.reduce((s, it) => s + (it.amount || 0), 0);

    if (positiveItems.length === 0 || totalBilled <= 0) {
      // Fallback: Credit primary Water Consumption Receivable account with totalDebit
      const fallbackAccId = bpMappings["BP_DR_WATER_CONSUMPTION"];
      if (!fallbackAccId) {
        missingAccounts.push("የውሃ ፍጆታ — Receivable");
      } else {
        lines.push({
          accountId: Number(fallbackAccId),
          description: `የውሃ ፍጆታ — Receivable (Supplemental) — ${selectedMonth} ${selectedYear}`,
          debitAmount: 0,
          creditAmount: totalDebit,
        });
      }
    } else {
      let assignedCredits = 0;
      positiveItems.forEach((item, idx) => {
        const accId = bpMappings[item.key];
        if (!accId) {
          missingAccounts.push(item.desc);
          return;
        }
        let lineAmount = 0;
        if (idx === positiveItems.length - 1) {
          lineAmount = Math.round((totalDebit - assignedCredits) * 100) / 100;
        } else {
          lineAmount = Math.round(((item.amount / totalBilled) * totalDebit) * 100) / 100;
          assignedCredits += lineAmount;
        }

        if (lineAmount > 0) {
          lines.push({
            accountId: Number(accId),
            description: `${item.desc} — Supplemental ${selectedMonth} ${selectedYear}`,
            debitAmount: 0,
            creditAmount: lineAmount,
          });
        }
      });
    }

    if (missingAccounts.length > 0) {
      return { lines: [], error: `Missing account mapping for: ${missingAccounts.join(", ")}.` };
    }

    return { lines, error: null, locationLabel, unpushedCount: locationBills.length };
  };

  // ─── Generate reference number ─────────────────────────────────
  const makeRef = (locationType, bankKey = null, supIndex = null) => {
    const base = `BILL-${selectedMonth}-${selectedYear}`;
    let ref = base;
    if (locationType === "BILL_PREP") ref = `BILL-PREP-${selectedMonth}-${selectedYear}`;
    else if (locationType === "PREPAID") ref = `${base}-PREPAID`;
    else if (locationType === "OFFICE") ref = `${base}-OFFICE`;
    else if (locationType === "BANK" && bankKey) ref = `${base}-BANK-${bankKey}`;
    if (supIndex != null) ref += `-SUP-${supIndex}`;
    return ref;
  };

  // Find next supplemental index for a ref prefix
  const nextSupIndex = (locationType, bankKey = null) => {
    let idx = 1;
    while (existingRefs.has(makeRef(locationType, bankKey, idx))) idx++;
    return idx;
  };

  const isDuplicate = (ref) => existingRefs.has(ref);

  // ─── Push journal entry ─────────────────────────────────────────
  const pushMutation = useMutation({
    mutationFn: async ({ locationType, bankKey }) => {
      if (!selectedFiscalYear) throw new Error("Please select an active Fiscal Year");

      const { lines, error, locationLabel } = buildJournalLines(locationType, bankKey);
      if (error) throw new Error(error);
      if (lines.length === 0) throw new Error("No journal lines to create");

      const ref = makeRef(locationType, bankKey);
      if (isDuplicate(ref)) throw new Error(`Journal entry with reference "${ref}" already exists for this month. Duplicate not allowed.`);

      const entryData = {
        entryDate: new Date().toISOString().split("T")[0],
        fiscalYearId: Number(selectedFiscalYear),
        referenceNumber: ref,
        sourceType: "BILL_COLLECTION",
        billingPeriod: `${selectedMonth}, ${selectedYear}`,
        billingMonth: `${selectedMonth}, ${selectedYear}`,
        description: `Water billing collection — ${locationLabel} — ${selectedMonth} ${selectedYear}`,
        lines: lines.map(l => ({
          ...l,
          accountId: Number(l.accountId),
          debitAmount: Math.round(Number(l.debitAmount || 0) * 100) / 100,
          creditAmount: Math.round(Number(l.creditAmount || 0) * 100) / 100,
        })),
      };

      return await fncJournalEntryService.createEntry(entryData);
    },
    onSuccess: (_, variables) => {
      const ref = makeRef(variables.locationType, variables.bankKey);
      setExistingRefs(prev => new Set([...prev, ref]));
      setDraftRefs(prev => new Set([...prev, ref]));
      toast.success(`Draft journal entry created successfully!`);
      setConfirmDialogOpen(false);
      setSelectedPaymentLocation(null);
      refetchUnpushedPaid();
      checkExistingEntries();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create journal entry");
    },
  });

  // ─── Bill Preparation push mutation ─────────────────────────────
  const billPrepMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFiscalYear) throw new Error("Please select an active Fiscal Year");

      const { lines, error } = buildBillPrepJournalLines();
      if (error) throw new Error(error);
      if (lines.length === 0) throw new Error("No journal lines to create");

      const ref = makeRef("BILL_PREP");
      if (isDuplicate(ref)) throw new Error(`Bill Preparation entry "${ref}" already exists.`);

      const entryData = {
        entryDate: new Date().toISOString().split("T")[0],
        fiscalYearId: Number(selectedFiscalYear),
        referenceNumber: ref,
        sourceType: "BILL_PREP",
        billingPeriod: `${selectedMonth}, ${selectedYear}`,
        billingMonth: `${selectedMonth}, ${selectedYear}`,
        description: `Bill Preparation — Revenue Recognition — ${selectedMonth} ${selectedYear}`,
        lines: lines.map(l => ({
          ...l,
          accountId: Number(l.accountId),
          debitAmount: Math.round(Number(l.debitAmount || 0) * 100) / 100,
          creditAmount: Math.round(Number(l.creditAmount || 0) * 100) / 100,
        })),
      };
      return await fncJournalEntryService.createEntry(entryData);
    },
    onSuccess: () => {
      const ref = makeRef("BILL_PREP");
      setExistingRefs(prev => new Set([...prev, ref]));
      setDraftRefs(prev => new Set([...prev, ref]));
      toast.success("Bill Preparation draft journal entry created!");
      setBillPrepDialogOpen(false);
      refetchUnpushed();
      checkExistingEntries();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create Bill Preparation entry");
    },
  });

  // ─── Supplemental Bill Preparation push mutation ──────────────────
  const supPrepMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFiscalYear) throw new Error("Please select an active Fiscal Year");

      // Build journal lines from ONLY unpushed bills
      const { lines, error, unpushedCount } = buildSupBillPrepJournalLines();
      if (error) throw new Error(error);
      if (lines.length === 0) throw new Error("No journal lines to create for unpushed bills");

      const supIdx = nextSupIndex("BILL_PREP");
      const ref = makeRef("BILL_PREP", null, supIdx);

      const entryData = {
        entryDate: new Date().toISOString().split("T")[0],
        fiscalYearId: Number(selectedFiscalYear),
        referenceNumber: ref,
        sourceType: "BILL_PREP_SUP",
        billingPeriod: `${selectedMonth}, ${selectedYear}`,
        billingMonth: `${selectedMonth}, ${selectedYear}`,
        description: `Supplemental Bill Preparation #${supIdx} — Revenue Recognition — ${selectedMonth} ${selectedYear} (${unpushedInfo?.unpushedCount || 0} new bills)`,
        lines: lines.map(l => ({
          ...l,
          accountId: Number(l.accountId),
          debitAmount: Math.round(Number(l.debitAmount || 0) * 100) / 100,
          creditAmount: Math.round(Number(l.creditAmount || 0) * 100) / 100,
        })),
      };
      return await fncJournalEntryService.createEntry(entryData);
    },
    onSuccess: () => {
      const supIdx = nextSupIndex("BILL_PREP");
      const ref = makeRef("BILL_PREP", null, supIdx);
      setExistingRefs(prev => new Set([...prev, ref]));
      setDraftRefs(prev => new Set([...prev, ref]));
      toast.success("Supplemental Bill Preparation draft created!");
      setSupPrepDialogOpen(false);
      refetchUnpushed();
      checkExistingEntries();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create supplemental entry");
    },
  });

  // ─── Supplemental Payment Location push mutation ────────────────
  const plSupMutation = useMutation({
    mutationFn: async ({ locationType, bankKey }) => {
      if (!selectedFiscalYear) throw new Error("Please select an active Fiscal Year");

      const { lines, error, locationLabel, unpushedCount } = buildSupPayLocJournalLines(locationType, bankKey);
      if (error) throw new Error(error);
      if (lines.length === 0) throw new Error("No journal lines to create for unpushed paid bills");

      const supIdx = nextSupIndex(locationType, bankKey);
      const ref = makeRef(locationType, bankKey, supIdx);

      const entryData = {
        entryDate: new Date().toISOString().split("T")[0],
        fiscalYearId: Number(selectedFiscalYear),
        referenceNumber: ref,
        sourceType: "BILL_COLLECTION",
        billingPeriod: `${selectedMonth}, ${selectedYear}`,
        billingMonth: `${selectedMonth}, ${selectedYear}`,
        description: `Supplemental ${locationLabel} Collection #${supIdx} — ${selectedMonth} ${selectedYear} (${unpushedCount} new paid bills)`,
        lines: lines.map(l => ({
          ...l,
          accountId: Number(l.accountId),
          debitAmount: Math.round(Number(l.debitAmount || 0) * 100) / 100,
          creditAmount: Math.round(Number(l.creditAmount || 0) * 100) / 100,
        })),
      };
      return await fncJournalEntryService.createEntry(entryData);
    },
    onSuccess: (_, variables) => {
      const supIdx = nextSupIndex(variables.locationType, variables.bankKey);
      const ref = makeRef(variables.locationType, variables.bankKey, supIdx);
      setExistingRefs(prev => new Set([...prev, ref]));
      setDraftRefs(prev => new Set([...prev, ref]));
      toast.success("Supplemental payment location draft created!");
      setPlSupDialogOpen(false);
      setSelectedSupLocation(null);
      refetchUnpushedPaid();
      checkExistingEntries();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error.message || "Failed to create supplemental payment location entry");
    },
  });

  const handlePushClick = (locationType, bankKey = null) => {
    const ref = makeRef(locationType, bankKey);
    if (isDuplicate(ref)) {
      toast.error(`Journal entry "${ref}" already exists. Duplicate not allowed.`);
      return;
    }
    setSelectedPaymentLocation({ locationType, bankKey });
    setConfirmDialogOpen(true);
  };

  const handleBillPrepPush = () => {
    const ref = makeRef("BILL_PREP");
    if (isDuplicate(ref)) {
      toast.error(`Bill Preparation entry "${ref}" already exists.`);
      return;
    }
    setBillPrepDialogOpen(true);
  };

  // ── Section 3: Unpaid Bills — Load, Build, and Push ──

  const loadUnpaidSummary = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Select a billing month and year first.");
      return;
    }
    const kifyaWer = `${selectedMonth}, ${selectedYear}`;
    setLoadingUnpaid(true);
    setUnpaidSectionVisible(true);
    try {
      // 1. Calculate unpaid bills directly from in-memory filteredData
      // Exactly matches billList/page.js "not collected" logic
      const unpaidBills = (filteredData || []).filter(b => {
        if (b.isVoid || b.void || String(b.status).toLowerCase() === 'deleted') return false;
        if (b.moneyCollected || b.isMoneyCollected) return false;
        if (b.kecreditYetekefele > 0 || b.isPaidFromTekemach) return false;
        if (b.paidOnFrontOffice || b.isPaidOnFrontOffice) return false;
        if (b.unicashPaid || b.isUnicashPaid) return false;
        if (b.derashPaid || b.isDerashPaid) return false;
        if (b.isAbyssiniaPaid || b.abyssiniaPaid) return false;
        if (b.isMardaArifPaid || b.mardaArifPaid) return false;
        return true;
      });

      const calculatedUnpaid = unpaidBills.reduce((acc, bill) => {
        acc.yezihWerFjotaKfya += bill.yezihWerFjotaKfya || 0;
        acc.kotariKiray += bill.kotariKiray || 0;
        acc.techemariKfya += bill.techemariKfya || 0;
        acc.billingAdditionalPayment1Value += bill.billingAdditionalPayment1Value || 0;
        acc.additionalHisab += bill.additionalHisab || 0;
        acc.billingAdditionalPayment2Value += bill.billingAdditionalPayment2Value || 0;
        acc.yezihWer += bill.yezihWer || 0;
        acc.wuzifKotariKiray += bill.wuzifKotariKiray || 0;
        acc.wuzifFjota += bill.wuzifFjota || 0;
        acc.wuzifDerekKoshasha += bill.wuzifDerekKoshasha || 0;
        acc.wuzifTechemariKfya += bill.wuzifTechemariKfya || 0;
        acc.billingAdditionalPayment1Wuzif += bill.billingAdditionalPayment1Wuzif || 0;
        acc.kitat += bill.kitat || 0;
        acc.wuzifHisab += bill.wuzifHisab || 0;
        acc.wuzifFjotaKfya += bill.wuzifFjotaKfya || 0;
        acc.billingAdditionalPayment2Wuzif += bill.billingAdditionalPayment2Wuzif || 0;
        acc.tekilalaTekefay += bill.tekilalaTekefay || 0;
        return acc;
      }, {
        yezihWerFjotaKfya: 0, kotariKiray: 0, techemariKfya: 0, billingAdditionalPayment1Value: 0,
        additionalHisab: 0, billingAdditionalPayment2Value: 0, yezihWer: 0,
        wuzifKotariKiray: 0, wuzifFjota: 0, wuzifDerekKoshasha: 0, wuzifTechemariKfya: 0,
        billingAdditionalPayment1Wuzif: 0, kitat: 0, wuzifHisab: 0, wuzifFjotaKfya: 0,
        billingAdditionalPayment2Wuzif: 0, tekilalaTekefay: 0,
        billCount: unpaidBills.length,
      });

      // 2. Fetch journal balance reconciliation from backend
      const balanceData = await fncJournalEntryService.getJournalBalanceSummary(kifyaWer).catch(() => null);

      setUnpaidSummary(calculatedUnpaid);
      setJournalBalance(balanceData);
    } catch (err) {
      console.error("[UnpaidSummary] Failed to load:", err);
      toast.error(`Failed to load unpaid summary: ${err.message}`);
    } finally {
      setLoadingUnpaid(false);
    }
  };

  const buildUnpaidReversalLines = () => {
    if (!unpaidSummary) return { lines: [], error: "No unpaid data loaded." };
    const lines = [];
    const missingAccounts = [];
    const carriedForward = (unpaidSummary.wuzifHisab || 0) - (
      (unpaidSummary.wuzifKotariKiray || 0) + (unpaidSummary.wuzifFjotaKfya || 0) +
      (unpaidSummary.wuzifDerekKoshasha || 0) + (unpaidSummary.wuzifTechemariKfya || 0)
    );
    const chargeItems = [
      { drKey: "BP_DR_WATER_CONSUMPTION", crKey: "BP_CR_WATER_CONSUMPTION", amount: unpaidSummary.yezihWerFjotaKfya, desc: "የውሃ ፍጆታ ብር" },
      { drKey: "BP_DR_METER_RENT", crKey: "BP_CR_METER_RENT", amount: unpaidSummary.kotariKiray, desc: "ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_ADDITIONAL_CHARGE", crKey: "BP_CR_ADDITIONAL_CHARGE", amount: unpaidSummary.techemariKfya, desc: "ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_SERVICE_CHARGE", crKey: "BP_CR_SERVICE_CHARGE", amount: unpaidSummary.billingAdditionalPayment1Value, desc: "የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_WASTE_CHARGE", crKey: "BP_CR_WASTE_CHARGE", amount: unpaidSummary.additionalHisab, desc: "ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_SCHOOL_FEEDING", crKey: "BP_CR_SCHOOL_FEEDING", amount: unpaidSummary.billingAdditionalPayment2Value, desc: "የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_WUZIF_CONSUMPTION", crKey: "BP_CR_WUZIF_CONSUMPTION", amount: unpaidSummary.wuzifFjotaKfya, desc: "ውዝፍ ፍጆታ ክፍያ" },
      { drKey: "BP_DR_WUZIF_METER_RENT", crKey: "BP_CR_WUZIF_METER_RENT", amount: unpaidSummary.wuzifKotariKiray, desc: "ውዝፍ ቆጣሪ ኪራይ" },
      { drKey: "BP_DR_WUZIF_ADDITIONAL", crKey: "BP_CR_WUZIF_ADDITIONAL", amount: unpaidSummary.wuzifTechemariKfya, desc: "ውዝፍ ተጨማሪ ክፍያ" },
      { drKey: "BP_DR_WUZIF_SERVICE_CHARGE", crKey: "BP_CR_WUZIF_SERVICE_CHARGE", amount: unpaidSummary.billingAdditionalPayment1Wuzif, desc: "ውዝፍ የአገልግሎት ክፍያ" },
      { drKey: "BP_DR_PENALTY", crKey: "BP_CR_PENALTY", amount: unpaidSummary.kitat, desc: "ቅጣት" },
      { drKey: "BP_DR_WUZIF_WASTE", crKey: "BP_CR_WUZIF_WASTE", amount: unpaidSummary.wuzifDerekKoshasha, desc: "ውዝፍ ደረቅ ቆሻሻ" },
      { drKey: "BP_DR_WUZIF_SCHOOL_FEEDING", crKey: "BP_CR_WUZIF_SCHOOL_FEEDING", amount: unpaidSummary.billingAdditionalPayment2Wuzif, desc: "ውዝፍ የትምህርት ቤት ምገባ" },
      { drKey: "BP_DR_CARRIED_FORWARD", crKey: "BP_CR_CARRIED_FORWARD", amount: carriedForward > 0 ? carriedForward : 0, desc: "የተላለፈ ውዝፍ" },
    ];
    // Reversed from Step 1: DR Revenue (crKey) / CR Receivable (drKey)
    chargeItems.forEach(item => {
      const rounded = Math.round((item.amount || 0) * 100) / 100;
      if (rounded > 0) {
        const drAccId = bpMappings[item.drKey];
        const crAccId = bpMappings[item.crKey];
        if (!drAccId) missingAccounts.push(`DR: ${item.desc}`);
        if (!crAccId) missingAccounts.push(`CR: ${item.desc}`);
        if (drAccId && crAccId) {
          // Reversed: CR account (Revenue) → DEBIT, DR account (Receivable) → CREDIT
          lines.push({
            accountId: Number(crAccId),
            description: `Unpaid Reversal — ${item.desc} — ${selectedMonth} ${selectedYear}`,
            debitAmount: rounded,
            creditAmount: 0,
          });
          lines.push({
            accountId: Number(drAccId),
            description: `Unpaid Reversal — ${item.desc} — ${selectedMonth} ${selectedYear}`,
            debitAmount: 0,
            creditAmount: rounded,
          });
        }
      }
    });
    if (missingAccounts.length > 0) {
      return { lines: [], error: `Missing account mappings: ${missingAccounts.join(", ")}` };
    }
    return { lines, error: null };
  };

  const unpaidReversalMutation = useMutation({
    mutationFn: async () => {
      const { lines, error } = buildUnpaidReversalLines();
      if (error) throw new Error(error);
      if (lines.length < 2) throw new Error("No unpaid amounts to reverse.");
      const ref = `UNPAID-REV-${selectedMonth}-${selectedYear}`;
      const today = new Date().toISOString().split("T")[0];
      return fncJournalEntryService.createEntry({
        fiscalYearId: Number(selectedFiscalYear),
        entryDate: today,
        referenceNumber: ref,
        description: `Unpaid Receivable Reversal — ${selectedMonth} ${selectedYear}`,
        sourceType: "UNPAID_REVERSAL",
        billingPeriod: `${selectedMonth}, ${selectedYear}`,
        billingMonth: `${selectedMonth}, ${selectedYear}`,
        lines,
      });
    },
    onSuccess: () => {
      const ref = `UNPAID-REV-${selectedMonth}-${selectedYear}`;
      toast.success(`✅ Unpaid reversal journal created (DRAFT): ${ref}`);
      setUnpaidDialogOpen(false);
      setExistingRefs(prev => new Set([...prev, ref]));
      setDraftRefs(prev => new Set([...prev, ref]));
      checkExistingEntries();
    },
    onError: (err) => {
      toast.error(`Failed to create unpaid reversal: ${err.message}`);
    },
  });

  const handleConfirmPush = () => {
    if (!selectedPaymentLocation) return;
    pushMutation.mutate(selectedPaymentLocation);
  };

  // ─── Preview lines for the confirm dialog ───────────────────────
  const previewLines = useMemo(() => {
    if (!selectedPaymentLocation) return { lines: [], error: null };
    return buildJournalLines(selectedPaymentLocation.locationType, selectedPaymentLocation.bankKey);
  }, [selectedPaymentLocation, summations, accountMappings]);

  const billPrepPreview = useMemo(() => {
    if (!billPrepDialogOpen) return { lines: [], error: null };
    return buildBillPrepJournalLines();
  }, [billPrepDialogOpen, summations, bpMappings]);

  // Preview for supplemental dialog — uses only unpushed bills
  const supPrepPreview = useMemo(() => {
    if (!supPrepDialogOpen) return { lines: [], error: null };
    return buildSupBillPrepJournalLines();
  }, [supPrepDialogOpen, filteredData, bpMappings]);

  // Preview for supplemental Payment Location dialog — uses only unpushed paid bills for a location
  const plSupPreview = useMemo(() => {
    if (!plSupDialogOpen || !selectedSupLocation) return { lines: [], error: null };
    return buildSupPayLocJournalLines(selectedSupLocation.locationType, selectedSupLocation.bankKey);
  }, [plSupDialogOpen, selectedSupLocation, filteredData, accountMappings, bpMappings]);

  const fmt = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

  const hasMappings = Object.keys(accountMappings).length > 0;
  const hasBpMappings = Object.keys(bpMappings).length > 0;

  return (
    <>
      <ToastContainer position="top-right" autoClose={4000} />

      <Box sx={{ p: { xs: 1, md: 3 } }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📒 Bill to Journal — Push Billing Data to Finance
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select a billing month/year, review the Payment Location Summary, and push each payment location as a separate draft Journal Entry.
        </Typography>

        {/* Warnings */}
        {!hasMappings && (
          <Alert severity="warning" sx={{ my: 2 }}>
            <AlertTitle>No Collection Account Mappings Configured (Step 2: Payment Locations)</AlertTitle>
            Go to <strong>Financial Settings → Billing Account Map</strong> to configure where collected money is received (Office Cash, Prepaid, and Bank Asset accounts) before pushing payment collections.
          </Alert>
        )}

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 3, mt: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Month (ወር)</InputLabel>
              <Select value={selectedMonth} label="Month (ወር)" onChange={(e) => setSelectedMonth(e.target.value)}>
                {ethiopianMonths.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year (ዓ.ም)</InputLabel>
              <Select value={selectedYear} label="Year (ዓ.ም)" onChange={(e) => setSelectedYear(e.target.value)}>
                {yearOptions.map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Fiscal Year</InputLabel>
              <Select value={selectedFiscalYear} label="Fiscal Year" onChange={(e) => setSelectedFiscalYear(e.target.value)}>
                {fiscalYears.map(fy => (
                  <MenuItem key={fy.id} value={fy.id}>{fy.yearName || fy.name || `FY ${fy.id}`} ({fy.status})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={() => refetch()} disabled={!selectedMonth || !selectedYear}>
              Load Bills
            </Button>
            <Typography variant="body2" color="text.secondary">
              {filteredData.length > 0 ? `${filteredData.length} bills loaded` : ""}
            </Typography>
          </Box>
        </Paper>

        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* ──── Bill Preparation Summary — Step 1: Revenue Recognition ──── */}
        {!isLoading && filteredData.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              📋 Bill Preparation Summary — {selectedMonth} {selectedYear}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Step 1: Revenue Recognition — Each charge creates a paired DR (Receivable) / CR (Revenue) journal line.
            </Typography>

            {!hasBpMappings && (
              <Alert severity="warning" sx={{ my: 1 }}>
                <AlertTitle>No Bill Preparation Mappings</AlertTitle>
                Go to <strong>Financial Settings → Bill Prep Account Map</strong> to configure DR/CR account pairs before pushing.
              </Alert>
            )}

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "auto", border: "2px solid #00897b" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#00897b", color: "white" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "#00897b", color: "white" }}>Charge Type</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#1565c0", color: "white" }}>DR — Receivable (A/R)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#2e7d32", color: "white" }}>CR — Revenue / Liability</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { label: "የውሃ ፍጆታ ብር (Current Month Water consumption)", amount: summations.yezihWerFjotaKfya, group: "g1" },
                    { label: "ቆጣሪ ኪራይ (Meter Rent)", amount: summations.kotariKiray, group: "g1" },
                    { label: "ተጨማሪ ክፍያ (Bill Additional Payment)", amount: summations.techemariKfya, group: "g1" },
                    { label: "የአገልግሎት ክፍያ (Bill Service Charge)", amount: summations.billingAdditionalPayment1Value, group: "g1" },
                    { label: "ደረቅ ቆሻሻ (Dry Wast)", amount: summations.additionalHisab, group: "g1" },
                    { label: "የትምህርት ቤት ምገባ (School Feeding)", amount: summations.billingAdditionalPayment2Value, group: "g1" },
                    { label: "ውዝፍ ፍጆታ ክፍያ (Arrears Water Consumption)", amount: summations.wuzifFjotaKfya, group: "g2" },
                    { label: "ውዝፍ ቆጣሪ ኪራይ (Arrears Meter rent)", amount: summations.wuzifKotariKiray, group: "g2" },
                    { label: "ውዝፍ ተጨማሪ ክፍያ (Arrears Bill Additional Payment)", amount: summations.wuzifTechemariKfya, group: "g2" },
                    { label: "ውዝፍ የአገልግሎት ክፍያ (Arrears Bill Service Charge)", amount: summations.billingAdditionalPayment1Wuzif, group: "g2" },
                    { label: "ቅጣት (Bill Penalty)", amount: summations.kitat, group: "g2" },
                    { label: "ውዝፍ ደረቅ ቆሻሻ (Arrears Dry Wast)", amount: summations.wuzifDerekKoshasha, group: "g2" },
                    { label: "ውዝፍ የትምህርት ቤት ምገባ (Arrears School Feeding)", amount: summations.billingAdditionalPayment2Wuzif, group: "g2" },
                    { label: "የተላለፈ(ነባር) ውዝፍ (Bill Old system Arrears)", amount: Math.max(0, (summations.wuzifHisab || 0) - ((summations.wuzifKotariKiray || 0) + (summations.wuzifFjotaKfya || 0) + (summations.wuzifDerekKoshasha || 0) + (summations.wuzifTechemariKfya || 0))), group: "g2" },
                  ].filter(r => (r.amount || 0) > 0).map((row, idx) => (
                    <TableRow key={idx} sx={{ bgcolor: row.group === "g1" ? "#f0f8ff" : "#fff5f5" }}>
                      <TableCell sx={{ color: "text.secondary" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontFamily: "Nyala, serif", fontWeight: "medium" }}>{row.label}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>{fmt(row.amount)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>{fmt(row.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "3px solid #333", fontSize: "1.05rem" } }}>
                    <TableCell />
                    <TableCell sx={{ fontFamily: "Nyala, serif" }}>TOTAL</TableCell>
                    <TableCell align="right" sx={{ color: "primary.main" }}>{fmt(
                      [
                        summations.yezihWerFjotaKfya, summations.kotariKiray, summations.techemariKfya,
                        summations.billingAdditionalPayment1Value, summations.additionalHisab, summations.billingAdditionalPayment2Value,
                        summations.wuzifFjotaKfya, summations.wuzifKotariKiray, summations.wuzifTechemariKfya,
                        summations.billingAdditionalPayment1Wuzif, summations.kitat, summations.wuzifDerekKoshasha,
                        summations.billingAdditionalPayment2Wuzif,
                        Math.max(0, (summations.wuzifHisab || 0) - ((summations.wuzifKotariKiray || 0) + (summations.wuzifFjotaKfya || 0) + (summations.wuzifDerekKoshasha || 0) + (summations.wuzifTechemariKfya || 0))),
                      ].filter(v => (v || 0) > 0).reduce((s, v) => s + (v || 0), 0)
                    )}</TableCell>
                    <TableCell align="right" sx={{ color: "success.main" }}>{fmt(
                      [
                        summations.yezihWerFjotaKfya, summations.kotariKiray, summations.techemariKfya,
                        summations.billingAdditionalPayment1Value, summations.additionalHisab, summations.billingAdditionalPayment2Value,
                        summations.wuzifFjotaKfya, summations.wuzifKotariKiray, summations.wuzifTechemariKfya,
                        summations.billingAdditionalPayment1Wuzif, summations.kitat, summations.wuzifDerekKoshasha,
                        summations.billingAdditionalPayment2Wuzif,
                        Math.max(0, (summations.wuzifHisab || 0) - ((summations.wuzifKotariKiray || 0) + (summations.wuzifFjotaKfya || 0) + (summations.wuzifDerekKoshasha || 0) + (summations.wuzifTechemariKfya || 0))),
                      ].filter(v => (v || 0) > 0).reduce((s, v) => s + (v || 0), 0)
                    )}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>

            {/* Bill Preparation Push Button + Unpushed Bill Alert */}
            <Box sx={{ mt: 2 }}>
              {/* Draft journal pending approval notification */}
              {(() => {
                const draftBillPrep = draftRefs.has(makeRef("BILL_PREP"));
                const draftSupRefs = [...draftRefs].filter(r => r.startsWith(`BILL-PREP-${selectedMonth}-${selectedYear}-SUP-`));
                if (draftBillPrep || draftSupRefs.length > 0) {
                  return (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <AlertTitle>📋 Draft Journal Entry Pending Approval</AlertTitle>
                      {draftBillPrep && (
                        <Typography variant="body2">• Bill Preparation <strong>{makeRef("BILL_PREP")}</strong> is in <strong>DRAFT</strong> status — needs to be reviewed and posted/approved.</Typography>
                      )}
                      {draftSupRefs.map(ref => (
                        <Typography key={ref} variant="body2">• Supplemental <strong>{ref}</strong> is in <strong>DRAFT</strong> status — needs to be reviewed and posted/approved.</Typography>
                      ))}
                      <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontStyle: "italic" }}>
                        Bills will be marked as "pushed" only after the journal entry is approved/posted.
                      </Typography>
                    </Alert>
                  );
                }
                return null;
              })()}

              {/* Unpushed bills alert */}
              {isDuplicate(makeRef("BILL_PREP")) && unpushedInfo?.unpushedCount > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>⚠️ {unpushedInfo.unpushedCount} New Bill(s) Not Yet Pushed to Journal</AlertTitle>
                  New bills were generated after the last journal push for this month.
                  {unpushedInfo.pushedCount > 0 && ` (${unpushedInfo.pushedCount} already pushed)`}
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!hasBpMappings || !selectedFiscalYear || supPrepMutation.isPending}
                      onClick={() => setSupPrepDialogOpen(true)}
                      sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" }, fontWeight: "bold" }}
                    >
                      Push Supplemental Entry for New Bills
                    </Button>
                  </Box>
                </Alert>
              )}

              {/* Bill count info */}
              {unpushedInfo && (
                <Box sx={{ mb: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {unpushedInfo.pushedCount > 0 && (
                    <Chip label={`✅ ${unpushedInfo.pushedCount} bills pushed`} color="success" size="small" variant="outlined" />
                  )}
                  {unpushedInfo.unpushedCount > 0 && (
                    <Chip label={`⏳ ${unpushedInfo.unpushedCount} bills not pushed`} color="warning" size="small" variant="outlined" />
                  )}
                  <Chip label={`📊 ${unpushedInfo.totalCount} total bills`} size="small" variant="outlined" />
                </Box>
              )}

              {/* Push button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {isDuplicate(makeRef("BILL_PREP")) ? (
                  <Chip label="✅ Bill Preparation Already Pushed" color="success" variant="outlined" sx={{ fontWeight: "bold" }} />
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    disabled={!hasBpMappings || !selectedFiscalYear}
                    onClick={handleBillPrepPush}
                    sx={{ bgcolor: "#00897b", "&:hover": { bgcolor: "#00695c" }, fontWeight: "bold", px: 4 }}
                  >
                    Push Bill Preparation to Journal (Step 1)
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {/* Payment Location Summary Table */}
        {!isLoading && filteredData.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Payment Location Summary — Push to Journal
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Step 2: Payment Collection — Each payment location creates a DR (Cash/Bank Asset) / CR (Receivable) journal entry for paid bills.
            </Typography>

            {/* Draft journal pending approval notification for Payment Locations */}
            {(() => {
              const plRefs = ["PREPAID", "OFFICE"];
              const draftPLEntries = [];
              plRefs.forEach(type => {
                const ref = makeRef(type);
                if (draftRefs.has(ref)) draftPLEntries.push({ ref, label: type === "PREPAID" ? "Prepaid" : "Office (ቢሮ)" });
                // Check supplementals
                [...draftRefs].filter(r => r.startsWith(`BILL-${selectedMonth}-${selectedYear}-${type}-SUP-`)).forEach(r => {
                  draftPLEntries.push({ ref: r, label: `${type === "PREPAID" ? "Prepaid" : "Office"} Supplemental` });
                });
              });
              // Banks
              Object.keys(summations.paidByBank).forEach(bankKey => {
                const ref = makeRef("BANK", bankKey);
                if (draftRefs.has(ref)) draftPLEntries.push({ ref, label: `Bank: ${lookupBankName(bankKey)}` });
                [...draftRefs].filter(r => r.startsWith(`BILL-${selectedMonth}-${selectedYear}-BANK-${bankKey}-SUP-`)).forEach(r => {
                  draftPLEntries.push({ ref: r, label: `Bank: ${lookupBankName(bankKey)} Supplemental` });
                });
              });

              if (draftPLEntries.length > 0) {
                return (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <AlertTitle>📋 Draft Payment Location Journal Entries Pending Approval</AlertTitle>
                    {draftPLEntries.map(e => (
                      <Typography key={e.ref} variant="body2">• {e.label} <strong>{e.ref}</strong> is in <strong>DRAFT</strong> status — needs to be reviewed and posted/approved.</Typography>
                    ))}
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", fontStyle: "italic" }}>
                      Paid bills will be marked as "pushed" only after the journal entry is approved/posted.
                    </Typography>
                  </Alert>
                );
              }
              return null;
            })()}

            {/* Unpushed paid bills alert */}
            {unpushedPaidInfo?.unpushedCount > 0 && (() => {
              // Check if at least one payment location has already been pushed
              const anyPushed = isDuplicate(makeRef("PREPAID")) || isDuplicate(makeRef("OFFICE")) ||
                Object.keys(summations.paidByBank).some(bk => isDuplicate(makeRef("BANK", bk)));
              if (!anyPushed) return null;
              return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <AlertTitle>⚠️ {unpushedPaidInfo.unpushedCount} New Paid Bill(s) Not Yet Pushed to Journal</AlertTitle>
                  New paid bills were recorded after the last payment location journal push for this month.
                  {unpushedPaidInfo.pushedCount > 0 && ` (${unpushedPaidInfo.pushedCount} already pushed)`}
                  <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                    Use the "Push Supplemental" button on each payment location row to create a supplemental journal entry for the new paid bills.
                  </Typography>
                </Alert>
              );
            })()}

            {/* Paid bill count chips */}
            {unpushedPaidInfo && (
              <Box sx={{ mb: 1, display: "flex", gap: 2, flexWrap: "wrap" }}>
                {unpushedPaidInfo.pushedCount > 0 && (
                  <Chip label={`✅ ${unpushedPaidInfo.pushedCount} paid bills pushed`} color="success" size="small" variant="outlined" />
                )}
                {unpushedPaidInfo.unpushedCount > 0 && (
                  <Chip label={`⏳ ${unpushedPaidInfo.unpushedCount} paid bills not pushed`} color="warning" size="small" variant="outlined" />
                )}
                <Chip label={`📊 ${unpushedPaidInfo.totalCount} total paid bills`} size="small" variant="outlined" />
              </Box>
            )}

            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "auto", border: "1px solid #e0e0e0" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow sx={{ bgcolor: "primary.main" }}>
                    {["Payment Location", "No. Bills", "Total Amount (ETB)", "Additional Hisab", "Wuzif Derek Koshasha", "Total Derek Koshasha", "Tekilala Tekefay", "Check", "Action"].map(h => (
                      <TableCell key={h} sx={{ fontWeight: "bold", color: "common.white", backgroundColor: "primary.main" }}
                        align={h === "Payment Location" || h === "Action" ? "left" : "right"}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Prepaid Row */}
                  {summations.prepaid > 0 && (
                    <TableRow sx={{ bgcolor: "background.paper" }}>
                      <TableCell>Prepaid</TableCell>
                      <TableCell align="right">{summations.prepaidCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(summations.prepaid)}</TableCell>
                      <TableCell align="right">{fmt(summations.prepaidAdditionalHisab)}</TableCell>
                      <TableCell align="right">{fmt(summations.prepaidWuzifDerekKoshasha)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "action.selected" }}>{fmt(summations.prepaidTotalDerekKoshasha)}</TableCell>
                      <TableCell align="right">{fmt(summations.prepaidTekilalaTekefay)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: summations.prepaidCheck < 0 ? "error.main" : "success.main" }}>
                        {fmt(summations.prepaidCheck)}
                      </TableCell>
                      <TableCell>
                        {isDuplicate(makeRef("PREPAID")) ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {draftRefs.has(makeRef("PREPAID")) ? (
                              <Chip label="📋 Draft — Pending" size="small" color="info" variant="outlined" />
                            ) : (
                              <Chip label="✅ Pushed" size="small" color="success" variant="outlined" />
                            )}
                            {unpushedPaidInfo?.unpushedCount > 0 && (
                              <Button size="small" variant="outlined" color="warning"
                                disabled={!hasMappings || !hasBpMappings || !selectedFiscalYear || plSupMutation.isPending}
                                onClick={() => { setSelectedSupLocation({ locationType: "PREPAID", bankKey: null }); setPlSupDialogOpen(true); }}
                                sx={{ fontSize: "0.7rem" }}>
                                Push Supplemental
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Button size="small" variant="contained" color="primary" disabled={!hasMappings || !selectedFiscalYear}
                            onClick={() => handlePushClick("PREPAID")}>
                            Push
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Office Row */}
                  {summations.paidAtOffice > 0 && (
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell>ቢሮ የተከፈለ</TableCell>
                      <TableCell align="right">{summations.paidAtOfficeCount}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(summations.paidAtOffice)}</TableCell>
                      <TableCell align="right">{fmt(summations.officeAdditionalHisab)}</TableCell>
                      <TableCell align="right">{fmt(summations.officeWuzifDerekKoshasha)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "action.selected" }}>{fmt(summations.officeTotalDerekKoshasha)}</TableCell>
                      <TableCell align="right">{fmt(summations.officeTekilalaTekefay)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: summations.officeCheck < 0 ? "error.main" : "success.main" }}>
                        {fmt(summations.officeCheck)}
                      </TableCell>
                      <TableCell>
                        {isDuplicate(makeRef("OFFICE")) ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {draftRefs.has(makeRef("OFFICE")) ? (
                              <Chip label="📋 Draft — Pending" size="small" color="info" variant="outlined" />
                            ) : (
                              <Chip label="✅ Pushed" size="small" color="success" variant="outlined" />
                            )}
                            {unpushedPaidInfo?.unpushedCount > 0 && (
                              <Button size="small" variant="outlined" color="warning"
                                disabled={!hasMappings || !hasBpMappings || !selectedFiscalYear || plSupMutation.isPending}
                                onClick={() => { setSelectedSupLocation({ locationType: "OFFICE", bankKey: null }); setPlSupDialogOpen(true); }}
                                sx={{ fontSize: "0.7rem" }}>
                                Push Supplemental
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Button size="small" variant="contained" color="primary" disabled={!hasMappings || !selectedFiscalYear}
                            onClick={() => handlePushClick("OFFICE")}>
                            Push
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Bank Rows */}
                  {Object.entries(summations.paidByBank).map(([bankName, amount], index) => (
                    <TableRow key={bankName} sx={{ bgcolor: index % 2 === 0 ? "background.paper" : "action.hover" }}>
                      <TableCell>{lookupBankName(bankName)}</TableCell>
                      <TableCell align="right">{summations.paidByBankCount[bankName] || 0}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(amount)}</TableCell>
                      <TableCell align="right">{fmt(summations.bankAdditionalHisab[bankName])}</TableCell>
                      <TableCell align="right">{fmt(summations.bankWuzifDerekKoshasha[bankName])}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "action.selected" }}>{fmt(summations.bankTotalDerekKoshasha[bankName])}</TableCell>
                      <TableCell align="right">{fmt(summations.bankTekilalaTekefay[bankName])}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: (summations.bankCheck[bankName] || 0) < 0 ? "error.main" : "success.main" }}>
                        {fmt(summations.bankCheck[bankName])}
                      </TableCell>
                      <TableCell>
                        {isDuplicate(makeRef("BANK", bankName)) ? (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                            {draftRefs.has(makeRef("BANK", bankName)) ? (
                              <Chip label="📋 Draft — Pending" size="small" color="info" variant="outlined" />
                            ) : (
                              <Chip label="✅ Pushed" size="small" color="success" variant="outlined" />
                            )}
                            {unpushedPaidInfo?.unpushedCount > 0 && (
                              <Button size="small" variant="outlined" color="warning"
                                disabled={!hasMappings || !hasBpMappings || !selectedFiscalYear || plSupMutation.isPending}
                                onClick={() => { setSelectedSupLocation({ locationType: "BANK", bankKey: bankName }); setPlSupDialogOpen(true); }}
                                sx={{ fontSize: "0.7rem" }}>
                                Push Supplemental
                              </Button>
                            )}
                          </Box>
                        ) : (
                          <Button size="small" variant="contained" color="primary" disabled={!hasMappings || !selectedFiscalYear}
                            onClick={() => handlePushClick("BANK", bankName)}>
                            Push
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

                <TableFooter>
                  <TableRow sx={{ "& td": { fontWeight: "bold", bgcolor: "#e8f5e9", color: "#1b5e20" } }}>
                    <TableCell>Grand Total</TableCell>
                    <TableCell align="right"></TableCell>
                    <TableCell align="right">{fmt(summations.totalPaidLocationSum)}</TableCell>
                    <TableCell align="right">{fmt(summations.totaladditionalHisab)}</TableCell>
                    <TableCell align="right">{fmt(summations.totalwuzifDerekKoshasha)}</TableCell>
                    <TableCell align="right" sx={{ bgcolor: "action.selected" }}>
                      {fmt(summations.totalwuzifDerekKoshasha + summations.totaladditionalHisab)}
                    </TableCell>
                    <TableCell align="right">{fmt(summations.totaltekelalaTekefay)}</TableCell>
                    <TableCell align="right" sx={{ color: (summations.totaltekelalaTekefay - summations.totalPaidLocationSum) < 0 ? "error.main" : "success.main" }}>
                      {fmt(summations.totaltekelalaTekefay - summations.totalPaidLocationSum)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {/* Duplicates */}
                  {summations.duplicatePaymentCount > 0 && (
                    <TableRow sx={{ "& td, & th": { border: "none" } }}>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }}>Duplicate Payments</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{summations.duplicatePaymentCount}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{fmt(summations.duplicatePayments)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{fmt(summations.duplicateAdditionalHisab)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{fmt(summations.duplicateWuzifDerekKoshasha)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main", bgcolor: "action.selected" }} align="right">
                        {fmt((summations.duplicateWuzifDerekKoshasha || 0) + (summations.duplicateAdditionalHisab || 0))}
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{fmt(summations.duplicateTekilalaTekefay)}</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "error.main" }} align="right">{fmt(summations.duplicateCheck)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableFooter>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* ──── Section 3: Unpaid Bills Summary — Step 3: Unpaid Receivable Reversal ──── */}
        {!isLoading && filteredData.length > 0 && (
          <Box mt={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h6">
                📋 Unpaid Bills Summary — {selectedMonth} {selectedYear}
              </Typography>
              <Button
                variant="contained"
                onClick={loadUnpaidSummary}
                disabled={loadingUnpaid || !selectedMonth || !selectedYear}
                startIcon={loadingUnpaid ? <CircularProgress size={16} /> : null}
                sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
              >
                {loadingUnpaid ? "Loading..." : unpaidSectionVisible ? "Refresh Unpaid Summary" : "Load Unpaid Summary"}
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Step 3: Unpaid Receivable Reversal — Reverses the Step 1 journal for bills that remain unpaid after the billing period closes.
            </Typography>

            {unpaidSectionVisible && (
              <>
                {loadingUnpaid ? (
                  <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>
                ) : unpaidSummary ? (
                  <>
                    {/* 2.1 — Unpaid Bills by Charge Type */}
                    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflow: "auto", border: "2px solid #e65100", mb: 3 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: "#e65100", color: "white" }}>#</TableCell>
                            <TableCell sx={{ fontWeight: "bold", bgcolor: "#e65100", color: "white" }}>Charge Type</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#c62828", color: "white" }}>DR — Revenue / Liability (Reversal)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold", bgcolor: "#2e7d32", color: "white" }}>CR — Receivable (Reversal)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(() => {
                            const carriedFwd = (unpaidSummary.wuzifHisab || 0) - (
                              (unpaidSummary.wuzifKotariKiray || 0) + (unpaidSummary.wuzifFjotaKfya || 0) +
                              (unpaidSummary.wuzifDerekKoshasha || 0) + (unpaidSummary.wuzifTechemariKfya || 0)
                            );
                            return [
                              { label: "የውሃ ፍጆታ ብር (Current Month Water consumption)", amount: unpaidSummary.yezihWerFjotaKfya, group: "g1" },
                              { label: "ቆጣሪ ኪራይ (Meter Rent)", amount: unpaidSummary.kotariKiray, group: "g1" },
                              { label: "ተጨማሪ ክፍያ (Bill Additional Payment)", amount: unpaidSummary.techemariKfya, group: "g1" },
                              { label: "የአገልግሎት ክፍያ (Bill Service Charge)", amount: unpaidSummary.billingAdditionalPayment1Value, group: "g1" },
                              { label: "ደረቅ ቆሻሻ (Dry Wast)", amount: unpaidSummary.additionalHisab, group: "g1" },
                              { label: "የትምህርት ቤት ምገባ (School Feeding)", amount: unpaidSummary.billingAdditionalPayment2Value, group: "g1" },
                              { label: "ውዝፍ ፍጆታ ክፍያ (Arrears Water Consumption)", amount: unpaidSummary.wuzifFjotaKfya, group: "g2" },
                              { label: "ውዝፍ ቆጣሪ ኪራይ (Arrears Meter rent)", amount: unpaidSummary.wuzifKotariKiray, group: "g2" },
                              { label: "ውዝፍ ተጨማሪ ክፍያ (Arrears Bill Additional Payment)", amount: unpaidSummary.wuzifTechemariKfya, group: "g2" },
                              { label: "ውዝፍ የአገልግሎት ክፍያ (Arrears Bill Service Charge)", amount: unpaidSummary.billingAdditionalPayment1Wuzif, group: "g2" },
                              { label: "ቅጣት (Bill Penalty)", amount: unpaidSummary.kitat, group: "g2" },
                              { label: "ውዝፍ ደረቅ ቆሻሻ (Arrears Dry Wast)", amount: unpaidSummary.wuzifDerekKoshasha, group: "g2" },
                              { label: "ውዝፍ የትምህርት ቤት ምገባ (Arrears School Feeding)", amount: unpaidSummary.billingAdditionalPayment2Wuzif, group: "g2" },
                              { label: "የተላለፈ(ነባር) ውዝፍ (Bill Old system Arrears)", amount: Math.max(0, carriedFwd), group: "g2" },
                            ].filter(r => (r.amount || 0) > 0).map((row, idx) => (
                              <TableRow key={idx} sx={{ bgcolor: row.group === "g1" ? "#fff3e0" : "#fce4ec" }}>
                                <TableCell sx={{ color: "text.secondary" }}>{idx + 1}</TableCell>
                                <TableCell sx={{ fontFamily: "Nyala, serif", fontWeight: "medium" }}>{row.label}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "#c62828" }}>{fmt(row.amount)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>{fmt(row.amount)}</TableCell>
                              </TableRow>
                            ));
                          })()}
                        </TableBody>
                        <TableFooter>
                          {(() => {
                            const carriedFwd2 = (unpaidSummary.wuzifHisab || 0) - (
                              (unpaidSummary.wuzifKotariKiray || 0) + (unpaidSummary.wuzifFjotaKfya || 0) +
                              (unpaidSummary.wuzifDerekKoshasha || 0) + (unpaidSummary.wuzifTechemariKfya || 0)
                            );
                            const totalUnpaid = [
                              unpaidSummary.yezihWerFjotaKfya, unpaidSummary.kotariKiray, unpaidSummary.techemariKfya,
                              unpaidSummary.billingAdditionalPayment1Value, unpaidSummary.additionalHisab, unpaidSummary.billingAdditionalPayment2Value,
                              unpaidSummary.wuzifFjotaKfya, unpaidSummary.wuzifKotariKiray, unpaidSummary.wuzifTechemariKfya,
                              unpaidSummary.billingAdditionalPayment1Wuzif, unpaidSummary.kitat, unpaidSummary.wuzifDerekKoshasha,
                              unpaidSummary.billingAdditionalPayment2Wuzif,
                              Math.max(0, carriedFwd2),
                            ].filter(v => (v || 0) > 0).reduce((s, v) => s + (v || 0), 0);
                            return (
                              <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "3px solid #333", fontSize: "1.05rem" } }}>
                                <TableCell />
                                <TableCell sx={{ fontFamily: "Nyala, serif" }}>TOTAL ({unpaidSummary.billCount || 0} bills)</TableCell>
                                <TableCell align="right" sx={{ color: "#c62828" }}>{fmt(totalUnpaid)}</TableCell>
                                <TableCell align="right" sx={{ color: "success.main" }}>{fmt(totalUnpaid)}</TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableFooter>
                      </Table>
                    </TableContainer>

                    {/* 2.2 — Journal Balance Reconciliation */}
                    {journalBalance && (
                      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: "2px solid #5c6bc0" }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#283593" }}>
                          📊 Journal Balance Reconciliation — {selectedMonth} {selectedYear}
                        </Typography>
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "medium" }}>Initial Billed (Step 1 — Bill Prep)</TableCell>
                              <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>{fmt(journalBalance.billPrepTotal)}</TableCell>
                            </TableRow>
                            {(journalBalance.billPrepSupTotal || 0) > 0 && (
                              <TableRow>
                                <TableCell sx={{ fontWeight: "medium" }}>Supplemental Billed (BILL_PREP_SUP)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.dark" }}>+{fmt(journalBalance.billPrepSupTotal)}</TableCell>
                              </TableRow>
                            )}
                            {(journalBalance.billPrepSupTotal || 0) > 0 && (
                              <TableRow sx={{ bgcolor: "action.hover" }}>
                                <TableCell sx={{ fontWeight: "bold", pl: 3 }}>↳ Total Billed</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>{fmt(journalBalance.totalBilled)}</TableCell>
                              </TableRow>
                            )}
                            <TableRow>
                              <TableCell sx={{ fontWeight: "medium" }}>Bill Adjustments (Edits/Voids)</TableCell>
                              <TableCell align="right" sx={{ fontWeight: "bold", color: journalBalance.adjustmentTotal > 0 ? "warning.main" : "text.secondary" }}>
                                {journalBalance.adjustmentTotal > 0 ? `-${fmt(journalBalance.adjustmentTotal)}` : fmt(0)}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell sx={{ fontWeight: "medium" }}>Total Collected (Step 2 — Payment)</TableCell>
                              <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>-{fmt(journalBalance.collectionTotal)}</TableCell>
                            </TableRow>
                            {journalBalance.unpaidReversalTotal > 0 && (
                              <TableRow>
                                <TableCell sx={{ fontWeight: "medium" }}>Previous Unpaid Reversals</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: "#e65100" }}>-{fmt(journalBalance.unpaidReversalTotal)}</TableCell>
                              </TableRow>
                            )}
                            <TableRow sx={{ "& td": { borderTop: "3px double #333", fontWeight: "bold", fontSize: "1.05rem" } }}>
                              <TableCell>Expected Unpaid Receivable</TableCell>
                              <TableCell align="right" sx={{ color: "#283593" }}>{fmt(journalBalance.expectedUnpaid)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </Paper>
                    )}

                    {/* 2.3 — Difference & Push Button */}
                    {journalBalance && unpaidSummary && (() => {
                      const carriedFwd3 = (unpaidSummary.wuzifHisab || 0) - (
                        (unpaidSummary.wuzifKotariKiray || 0) + (unpaidSummary.wuzifFjotaKfya || 0) +
                        (unpaidSummary.wuzifDerekKoshasha || 0) + (unpaidSummary.wuzifTechemariKfya || 0)
                      );
                      const actualUnpaid = [
                        unpaidSummary.yezihWerFjotaKfya, unpaidSummary.kotariKiray, unpaidSummary.techemariKfya,
                        unpaidSummary.billingAdditionalPayment1Value, unpaidSummary.additionalHisab, unpaidSummary.billingAdditionalPayment2Value,
                        unpaidSummary.wuzifFjotaKfya, unpaidSummary.wuzifKotariKiray, unpaidSummary.wuzifTechemariKfya,
                        unpaidSummary.billingAdditionalPayment1Wuzif, unpaidSummary.kitat, unpaidSummary.wuzifDerekKoshasha,
                        unpaidSummary.billingAdditionalPayment2Wuzif,
                        Math.max(0, carriedFwd3),
                      ].filter(v => (v || 0) > 0).reduce((s, v) => s + (v || 0), 0);
                      const expectedUnpaid = journalBalance.expectedUnpaid || 0;
                      const difference = actualUnpaid - expectedUnpaid;
                      const unpaidRef = `UNPAID-REV-${selectedMonth}-${selectedYear}`;
                      const alreadyExists = existingRefs.has(unpaidRef);

                      return (
                        <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2, border: `2px solid ${Math.abs(difference) < 0.01 ? "#2e7d32" : "#e65100"}` }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            🔍 Comparison
                          </Typography>
                          <Table size="small">
                            <TableBody>
                              <TableRow>
                                <TableCell>Actual Unpaid (from bills)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(actualUnpaid)}</TableCell>
                              </TableRow>
                              <TableRow>
                                <TableCell>Expected Unpaid (from journal)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold" }}>{fmt(expectedUnpaid)}</TableCell>
                              </TableRow>
                              <TableRow sx={{ "& td": { borderTop: "2px solid #333" } }}>
                                <TableCell sx={{ fontWeight: "bold" }}>Difference</TableCell>
                                <TableCell align="right" sx={{ fontWeight: "bold", color: Math.abs(difference) < 0.01 ? "success.main" : "error.main" }}>
                                  {fmt(difference)} {Math.abs(difference) < 0.01 ? "✅" : "⚠️"}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>

                          <Box sx={{ mt: 2, display: "flex", gap: 2, alignItems: "center" }}>
                            {alreadyExists ? (
                              <Alert severity="info" sx={{ flex: 1 }}>
                                Unpaid reversal journal <strong>{unpaidRef}</strong> already exists.
                                {draftRefs.has(unpaidRef) && " Status: DRAFT — review and post from Journal Entries."}
                              </Alert>
                            ) : actualUnpaid > 0 ? (
                              <Button
                                variant="contained"
                                onClick={() => setUnpaidDialogOpen(true)}
                                disabled={!hasBpMappings || !selectedFiscalYear || unpaidReversalMutation.isPending}
                                startIcon={unpaidReversalMutation.isPending ? <CircularProgress size={16} /> : null}
                                sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
                              >
                                {unpaidReversalMutation.isPending ? "Creating..." : "🔄 Create Unpaid Reversal Journal (DRAFT)"}
                              </Button>
                            ) : (
                              <Alert severity="success" sx={{ flex: 1 }}>No unpaid bills to reverse — all bills are paid! 🎉</Alert>
                            )}
                          </Box>
                        </Paper>
                      );
                    })()}
                  </>
                ) : (
                  <Alert severity="info">Click "Load Unpaid Summary" to view unpaid bills data.</Alert>
                )}
              </>
            )}
          </Box>
        )}

        {/* No data message */}
        {!isLoading && filteredData.length === 0 && selectedMonth && selectedYear && (
          <Paper sx={{ p: 4, mt: 3, textAlign: "center" }}>
            <Typography color="text.secondary">No bills found for {selectedMonth} {selectedYear}. Click "Load Bills" to fetch data.</Typography>
          </Paper>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Confirm Journal Entry — {previewLines.locationLabel || ""}
        </DialogTitle>
        <DialogContent dividers>
          {previewLines.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{previewLines.error}</Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                This will create a <strong>DRAFT</strong> journal entry. You must review and post it from the Journal Entries page.
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Reference:</strong> {selectedPaymentLocation ? makeRef(selectedPaymentLocation.locationType, selectedPaymentLocation.bankKey) : ""}</Typography>
                <Typography variant="body2"><strong>Fiscal Year:</strong> {fiscalYears.find(f => f.id === selectedFiscalYear)?.yearName || selectedFiscalYear}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {selectedMonth} {selectedYear}</Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Debit (DR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Credit (CR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewLines.lines.map((line, i) => (
                      <TableRow key={i} sx={{ bgcolor: line.debitAmount > 0 ? "blue.50" : "green.50" }}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.debitAmount > 0 ? "bold" : "normal", color: line.debitAmount > 0 ? "primary.main" : "text.disabled" }}>
                          {line.debitAmount > 0 ? fmt(line.debitAmount) : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.creditAmount > 0 ? "bold" : "normal", color: line.creditAmount > 0 ? "success.main" : "text.disabled" }}>
                          {line.creditAmount > 0 ? fmt(line.creditAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid #333" } }}>
                      <TableCell>TOTAL</TableCell>
                      <TableCell align="right">{fmt(previewLines.lines.reduce((s, l) => s + l.debitAmount, 0))}</TableCell>
                      <TableCell align="right">{fmt(previewLines.lines.reduce((s, l) => s + l.creditAmount, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleConfirmPush}
            variant="contained"
            color="primary"
            disabled={!!previewLines.error || pushMutation.isPending}
            startIcon={pushMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {pushMutation.isPending ? "Creating..." : "Create Draft Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ──── Bill Preparation Confirmation Dialog ──── */}
      <Dialog open={billPrepDialogOpen} onClose={() => setBillPrepDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#00897b" }}>
          Confirm Bill Preparation — Step 1: Revenue Recognition
        </DialogTitle>
        <DialogContent dividers>
          {billPrepPreview.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{billPrepPreview.error}</Alert>
          ) : (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                This will create a <strong>DRAFT</strong> journal entry with paired DR (Receivable) / CR (Revenue) lines for each charge type.
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Reference:</strong> {makeRef("BILL_PREP")}</Typography>
                <Typography variant="body2"><strong>Fiscal Year:</strong> {fiscalYears.find(f => f.id === selectedFiscalYear)?.yearName || selectedFiscalYear}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {selectedMonth} {selectedYear}</Typography>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>Debit (DR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>Credit (CR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {billPrepPreview.lines.map((line, i) => (
                      <TableRow key={i} sx={{ bgcolor: line.debitAmount > 0 ? "#e3f2fd" : "#e8f5e9" }}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.debitAmount > 0 ? "bold" : "normal", color: line.debitAmount > 0 ? "primary.main" : "text.disabled" }}>
                          {line.debitAmount > 0 ? fmt(line.debitAmount) : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.creditAmount > 0 ? "bold" : "normal", color: line.creditAmount > 0 ? "success.main" : "text.disabled" }}>
                          {line.creditAmount > 0 ? fmt(line.creditAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid #333" } }}>
                      <TableCell>TOTAL</TableCell>
                      <TableCell align="right">{fmt(billPrepPreview.lines.reduce((s, l) => s + l.debitAmount, 0))}</TableCell>
                      <TableCell align="right">{fmt(billPrepPreview.lines.reduce((s, l) => s + l.creditAmount, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBillPrepDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={() => billPrepMutation.mutate()}
            variant="contained"
            disabled={!!billPrepPreview.error || billPrepMutation.isPending}
            startIcon={billPrepMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#00897b", "&:hover": { bgcolor: "#00695c" } }}
          >
            {billPrepMutation.isPending ? "Creating..." : "Create Draft Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ──── Supplemental Bill Preparation Dialog ──── */}
      <Dialog open={supPrepDialogOpen} onClose={() => setSupPrepDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#e65100" }}>
          Supplemental Bill Preparation — New Bills ({unpushedInfo?.unpushedCount || 0})
        </DialogTitle>
        <DialogContent dividers>
          {supPrepPreview.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{supPrepPreview.error}</Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This will create a <strong>SUPPLEMENTAL DRAFT</strong> journal entry for bills that were generated after the initial push.
                When this entry is posted/approved, the <strong>{unpushedInfo?.unpushedCount || 0}</strong> new bill(s) will be marked as pushed.
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Reference:</strong> {makeRef("BILL_PREP", null, nextSupIndex("BILL_PREP"))}</Typography>
                <Typography variant="body2"><strong>Fiscal Year:</strong> {fiscalYears.find(f => f.id === selectedFiscalYear)?.yearName || selectedFiscalYear}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {selectedMonth} {selectedYear}</Typography>
                <Typography variant="body2"><strong>New Bills:</strong> {unpushedInfo?.unpushedCount || 0} (not yet pushed)</Typography>
                <Typography variant="body2"><strong>Already Pushed:</strong> {unpushedInfo?.pushedCount || 0}</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                The journal lines below reflect the totals for <strong>only the new/unpushed bills</strong>.
              </Alert>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>Debit (DR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>Credit (CR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supPrepPreview.lines.map((line, i) => (
                      <TableRow key={i} sx={{ bgcolor: line.debitAmount > 0 ? "#fff3e0" : "#e8f5e9" }}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.debitAmount > 0 ? "bold" : "normal", color: line.debitAmount > 0 ? "#e65100" : "text.disabled" }}>
                          {line.debitAmount > 0 ? fmt(line.debitAmount) : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.creditAmount > 0 ? "bold" : "normal", color: line.creditAmount > 0 ? "success.main" : "text.disabled" }}>
                          {line.creditAmount > 0 ? fmt(line.creditAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid #333" } }}>
                      <TableCell>TOTAL</TableCell>
                      <TableCell align="right">{fmt(supPrepPreview.lines.reduce((s, l) => s + l.debitAmount, 0))}</TableCell>
                      <TableCell align="right">{fmt(supPrepPreview.lines.reduce((s, l) => s + l.creditAmount, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSupPrepDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={() => supPrepMutation.mutate()}
            variant="contained"
            disabled={!!supPrepPreview.error || supPrepMutation.isPending}
            startIcon={supPrepMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
          >
            {supPrepMutation.isPending ? "Creating..." : "Create Supplemental Draft Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ──── Supplemental Payment Location Dialog ──── */}
      <Dialog open={plSupDialogOpen} onClose={() => { setPlSupDialogOpen(false); setSelectedSupLocation(null); }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#1565c0" }}>
          Supplemental Payment Location — {plSupPreview.locationLabel || (selectedSupLocation ? (selectedSupLocation.locationType === "PREPAID" ? "Prepaid" : selectedSupLocation.locationType === "OFFICE" ? "Office (ቢሮ)" : `Bank: ${lookupBankName(selectedSupLocation.bankKey)}`) : "")}
        </DialogTitle>
        <DialogContent dividers>
          {plSupPreview.error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{plSupPreview.error}</Alert>
          ) : (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                This will create a <strong>SUPPLEMENTAL DRAFT</strong> journal entry for paid bills in this payment location that were recorded after the initial push.
                When this entry is posted/approved, the new paid bills will be marked as pushed.
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2"><strong>Reference:</strong> {selectedSupLocation ? makeRef(selectedSupLocation.locationType, selectedSupLocation.bankKey, nextSupIndex(selectedSupLocation.locationType, selectedSupLocation.bankKey)) : ""}</Typography>
                <Typography variant="body2"><strong>Fiscal Year:</strong> {fiscalYears.find(f => f.id === selectedFiscalYear)?.yearName || selectedFiscalYear}</Typography>
                <Typography variant="body2"><strong>Period:</strong> {selectedMonth} {selectedYear}</Typography>
                <Typography variant="body2"><strong>Unpushed Paid Bills:</strong> {plSupPreview.unpushedCount || 0}</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                The journal lines below reflect the totals for <strong>only the new/unpushed paid bills</strong> in this payment location.
              </Alert>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "primary.main" }}>Debit (DR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>Credit (CR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {plSupPreview.lines.map((line, i) => (
                      <TableRow key={i} sx={{ bgcolor: line.debitAmount > 0 ? "#e3f2fd" : "#e8f5e9" }}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.debitAmount > 0 ? "bold" : "normal", color: line.debitAmount > 0 ? "#1565c0" : "text.disabled" }}>
                          {line.debitAmount > 0 ? fmt(line.debitAmount) : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.creditAmount > 0 ? "bold" : "normal", color: line.creditAmount > 0 ? "success.main" : "text.disabled" }}>
                          {line.creditAmount > 0 ? fmt(line.creditAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid #333" } }}>
                      <TableCell>TOTAL</TableCell>
                      <TableCell align="right">{fmt(plSupPreview.lines.reduce((s, l) => s + l.debitAmount, 0))}</TableCell>
                      <TableCell align="right">{fmt(plSupPreview.lines.reduce((s, l) => s + l.creditAmount, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setPlSupDialogOpen(false); setSelectedSupLocation(null); }} color="inherit">Cancel</Button>
          <Button
            onClick={() => selectedSupLocation && plSupMutation.mutate(selectedSupLocation)}
            variant="contained"
            disabled={!!plSupPreview.error || plSupMutation.isPending || !selectedSupLocation}
            startIcon={plSupMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#1565c0", "&:hover": { bgcolor: "#0d47a1" } }}
          >
            {plSupMutation.isPending ? "Creating..." : "Create Supplemental Draft Entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unpaid Reversal Confirmation Dialog */}
      <Dialog open={unpaidDialogOpen} onClose={() => setUnpaidDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold", color: "#e65100" }}>
          Confirm Unpaid Receivable Reversal
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will create a <strong>DRAFT</strong> journal entry that reverses the Step 1 receivable for all unpaid bills.
            You must review and post it from the Journal Entries page.
          </Alert>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2"><strong>Reference:</strong> UNPAID-REV-{selectedMonth}-{selectedYear}</Typography>
            <Typography variant="body2"><strong>Source Type:</strong> UNPAID_REVERSAL</Typography>
            <Typography variant="body2"><strong>Period:</strong> {selectedMonth} {selectedYear}</Typography>
            <Typography variant="body2"><strong>Effect:</strong> DR Revenue / CR Receivable (reversal of Step 1)</Typography>
          </Box>
          {(() => {
            const { lines, error } = buildUnpaidReversalLines();
            if (error) return <Alert severity="error">{error}</Alert>;
            return (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: "grey.100" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>Debit (DR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold", color: "success.main" }}>Credit (CR)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lines.map((line, i) => (
                      <TableRow key={i} sx={{ bgcolor: line.debitAmount > 0 ? "#fff3e0" : "#e8f5e9" }}>
                        <TableCell>{line.description}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.debitAmount > 0 ? "bold" : "normal", color: line.debitAmount > 0 ? "#c62828" : "text.disabled" }}>
                          {line.debitAmount > 0 ? fmt(line.debitAmount) : "—"}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: line.creditAmount > 0 ? "bold" : "normal", color: line.creditAmount > 0 ? "success.main" : "text.disabled" }}>
                          {line.creditAmount > 0 ? fmt(line.creditAmount) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid #333" } }}>
                      <TableCell>TOTAL</TableCell>
                      <TableCell align="right">{fmt(lines.reduce((s, l) => s + l.debitAmount, 0))}</TableCell>
                      <TableCell align="right">{fmt(lines.reduce((s, l) => s + l.creditAmount, 0))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TableContainer>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUnpaidDialogOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={() => unpaidReversalMutation.mutate()}
            variant="contained"
            disabled={unpaidReversalMutation.isPending}
            startIcon={unpaidReversalMutation.isPending ? <CircularProgress size={16} /> : null}
            sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
          >
            {unpaidReversalMutation.isPending ? "Creating..." : "Create Unpaid Reversal (DRAFT)"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const queryClient = new QueryClient();

const BillToJournalPage = () => (
  <QueryClientProvider client={queryClient}>
    <BillToJournal />
  </QueryClientProvider>
);

export default BillToJournalPage;
