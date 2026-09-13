"use client";
import React from "react";
import CardDataStats from "../components/CardDataStats";
import BarChartStats from "../components/BarChartStats";
import LineChartStats from "../components/LineChartStats";
import { Users, FileText, Clock, Banknote } from "lucide-react";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import dashboardService from "../../lib/dashboardService";
import { toast } from "react-toastify";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";

const Home = () => {
  const queryClient = useQueryClient();

  // Fetch Dashboard Summary
  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const res = await dashboardService.getSummary();
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  // Refresh Mutation
  const refreshMutation = useMutation({
    mutationFn: () => dashboardService.refreshSummary("Manager"), // TODO: Get actual logged in user
    onSuccess: () => {
      queryClient.invalidateQueries(["dashboardSummary"]);
      toast.success("Dashboard refreshed successfully");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to refresh dashboard");
    }
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Helper to safely format numbers
  const fmt = (val) => val ? Number(val).toLocaleString() : "0";
  const fmtMoney = (val) => val ? Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";

  // Helper to calculate percentage with Styling
  const getPercent = (val, total) => {
    if (!total || total === 0) return null;
    const pct = (Number(val) / Number(total)) * 100;
    // Condition: < 50 (Light Red), >= 50 (Dark Green)
    // Using standard project colors to ensure visibility
    const colorClass = pct < 50 ? "text-danger" : "text-success";
    return (
      <span className={`text-sm font-medium ${colorClass} ml-1`}>
        ({pct.toFixed(2)}%)
      </span>
    );
  };

  // Use summary data or defaults
  const displayData = {
    // Customer Stats
    activeCustomers: summary?.totalActiveCustomers || 0,
    deactivatedCustomers: summary?.totalDeactivatedCustomers || 0,
    deletedCustomers: summary?.totalDeletedCustomers || 0,
    customersWithoutReading: summary?.customersWithoutReading || 0,

    // Bill Stats
    billsGenerated: summary?.totalBillsGenerated || 0,

    // Financial High Level
    totalExpected: summary?.totalExpectedAmount || 0,
    totalCollected: summary?.totalPaidAmount || 0,

    // Financial Breakdown
    consumption: summary?.totalConsumptionM3 || 0,
    wuzifConsumption: summary?.totalWuzifConsumptionM3 || 0,
    additionalFees: summary?.totalAdditionalFees || 0,
    derekKoshasha: summary?.totalDerekKoshasha || 0,
    penalty: summary?.totalPenalty || 0,
    // FIX Issue 3: ውዝፍ = wuzifHisab - wuzifDerekKoshasha (matching billList "ጠቅላላ ውዝፍ" tile)
    wuzifAmount: (summary?.totalWuzifAmount || 0) - (summary?.totalWuzifDerekKoshasha || 0),
    // Raw wuzifHisab for subtotal calculations
    wuzifHisabRaw: summary?.totalWuzifAmount || 0,
    prepaid: summary?.totalPrepaid || 0,

    // Group 1 Breakdown
    g1_fjota: summary?.totalYezihWerFjotaKfya || 0,
    g1_fjota_paid: summary?.paidYezihWerFjotaKfya || 0,
    g1_rent: summary?.totalKotariKiray || 0,
    g1_rent_paid: summary?.paidKotariKiray || 0,
    g1_tech: summary?.totalTechemariKfya || 0,
    g1_tech_paid: summary?.paidTechemariKfya || 0,
    // Calculate G1 Waste from Total - G2 Waste
    g1_waste: (summary?.totalDerekKoshasha || 0) - (summary?.totalWuzifDerekKoshasha || 0),
    g1_waste_paid: summary?.paidAdditionalHisab || 0,

    // FIX Issue 4: 'This Month' (yezihWer) = fjota + rent + techemari (matching billList)
    g1_thisMonth: (summary?.totalYezihWerFjotaKfya || 0) + (summary?.totalKotariKiray || 0) + (summary?.totalTechemariKfya || 0),
    g1_thisMonth_paid: (summary?.paidYezihWerFjotaKfya || 0) + (summary?.paidKotariKiray || 0) + (summary?.paidTechemariKfya || 0),
    // "የዚህ ወር አና ደረቅ ቆሻሻ" = yezihWer + additionalHisab (matching billList)
    g1_thisMonthWithWaste: (summary?.totalYezihWerFjotaKfya || 0) + (summary?.totalKotariKiray || 0) + (summary?.totalTechemariKfya || 0)
      + ((summary?.totalDerekKoshasha || 0) - (summary?.totalWuzifDerekKoshasha || 0)),
    g1_thisMonthWithWaste_paid: (summary?.paidYezihWerFjotaKfya || 0) + (summary?.paidKotariKiray || 0) + (summary?.paidTechemariKfya || 0)
      + (summary?.paidAdditionalHisab || 0),

    // Group 2 Breakdown (Matching billList/page.js)
    // 1. ውዝፍ ቆጣሪ ኪራይ
    g2_rent: summary?.totalWuzifKotariKiray || 0,
    g2_rent_paid: summary?.paidWuzifKotariKiray || 0,

    // 2. ውዝፍ ተጨማሪ ክፍያ
    g2_tech: summary?.totalWuzifTechemariKfya || 0,
    g2_tech_paid: summary?.paidWuzifTechemariKfya || 0,

    // 3. ቅጣት (Penalty)
    g2_penalty: summary?.totalPenalty || 0,
    g2_penalty_paid: summary?.paidKitat || 0,

    // 4. ውዝፍ ፍጆታ ክፍያ
    g2_fjota: summary?.totalWuzifFjotaKfya || 0,
    g2_fjota_paid: summary?.paidWuzifFjotaKfya || 0,

    // 5. ውዝፍ ደረቅ ቆሻሻ
    g2_waste: summary?.totalWuzifDerekKoshasha || 0,
    g2_waste_paid: summary?.paidWuzifDerekKoshasha || 0,

    // 6. የተላለፈ(ነባር) ውዝፍ (Transferred Arrears)
    // FIX Issue 1: Use totalWuzifAmount (NOT totalWuzifHisab which doesn't exist)
    // Formula from billList: wuzifHisab - (wuzifKotariKiray + wuzifFjotaKfya + wuzifDerekKoshasha + wuzifTechemariKfya)
    g2_transferred: (summary?.totalWuzifAmount || 0)
      - ((summary?.totalWuzifKotariKiray || 0) + (summary?.totalWuzifFjotaKfya || 0)
        + (summary?.totalWuzifDerekKoshasha || 0) + (summary?.totalWuzifTechemariKfya || 0)),

    g2_transferred_paid: (summary?.paidWuzifHisab || 0)
      - ((summary?.paidWuzifKotariKiray || 0) + (summary?.paidWuzifFjotaKfya || 0)
        + (summary?.paidWuzifDerekKoshasha || 0) + (summary?.paidWuzifTechemariKfya || 0)),

    // FIX Issue 2: Add g2_hisab total (was undefined)
    // ውዝፍ subtotal = wuzifHisab - wuzifDerekKoshasha (matching billList)
    g2_wuzif: (summary?.totalWuzifAmount || 0) - (summary?.totalWuzifDerekKoshasha || 0),
    g2_wuzif_paid: (summary?.paidWuzifHisab || 0) - (summary?.paidWuzifDerekKoshasha || 0),
    // ውዝፍ አና ደረቅ ቆሻሻ = wuzifHisab (matching billList)
    g2_wuzifWithWaste: summary?.totalWuzifAmount || 0,
    g2_wuzifWithWaste_paid: summary?.paidWuzifHisab || 0,
    // ውዝፍ አና ቅጣት = wuzifHisab + kitat (matching billList)
    g2_hisab: (summary?.totalWuzifAmount || 0) + (summary?.totalPenalty || 0),
    g2_hisab_paid: (summary?.paidWuzifHisab || 0) + (summary?.paidKitat || 0),

    // FIX Issue 5: Separate totals matching billList
    // ጠቅላላ ክፍያ (excluding waste) = (tekilalaTekefay + prepaid) - (additionalHisab + wuzifDerekKoshasha)
    totalPayableExclWaste: ((summary?.totalExpectedAmount || 0) + (summary?.totalPrepaid || 0))
      - (summary?.totalDerekKoshasha || 0),
    // ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ (including waste) = tekilalaTekefay + prepaid
    totalPayableWithWaste: (summary?.totalExpectedAmount || 0) + (summary?.totalPrepaid || 0),

    // Payment Location Stats (Parsed from JSON)
    paymentStats: summary?.paymentLocationStats ? JSON.parse(summary.paymentLocationStats) : {},

    // Mobile Readers
    mobileReaderStats: summary?.mobileReaderStats ? JSON.parse(summary.mobileReaderStats) : [],

    // Meta
    activeMonth: summary?.activeBillingMonth || "Unknown",
    activeYear: summary?.activeBillingYear || "",
    updateTime: summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleTimeString() : "Never",
    readingDate: summary?.activeReadingDate ? new Date(summary.activeReadingDate).toLocaleDateString() : null,
  };

  // Helper for Payment Stats
  const ps = displayData.paymentStats;
  const prepaid = ps?.prepaid || {};
  const office = ps?.office || {};
  const banks = ps?.banks || [];
  const duplicates = ps?.duplicates || {};

  // Calculate Grand Totals for Payment Location Table
  // (Sum(Prepaid + Office + Banks))
  const plTotalCount = (Number(prepaid.count) || 0) + (Number(office.count) || 0) + banks.reduce((a, b) => a + (Number(b.count) || 0), 0);
  const plTotalPaid = (Number(prepaid.paidAmount) || 0) + (Number(office.paidAmount) || 0) + banks.reduce((a, b) => a + (Number(b.paidAmount) || 0), 0);
  const plTotalAddHisab = (Number(prepaid.additionalHisab) || 0) + (Number(office.additionalHisab) || 0) + banks.reduce((a, b) => a + (Number(b.additionalHisab) || 0), 0);
  const plTotalWaste = (Number(prepaid.wuzifDerekKoshasha) || 0) + (Number(office.wuzifDerekKoshasha) || 0) + banks.reduce((a, b) => a + (Number(b.wuzifDerekKoshasha) || 0), 0);
  const plTotalNet = (Number(prepaid.tekilalaTekefay) || 0) + (Number(office.tekilalaTekefay) || 0) + banks.reduce((a, b) => a + (Number(b.tekilalaTekefay) || 0), 0);

  // Calculate Duplicate Payment Alert Trigger
  const duplicateCount = Number(duplicates.count) || 0;

  // Calculate Total Customers for Reference
  const totalCustomers = displayData.activeCustomers + displayData.deactivatedCustomers + displayData.deletedCustomers;

  return (
    <>
      {/* Header with Refresh */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500">
            Active Month: <span className="font-bold text-primary">{displayData.activeMonth}</span>
            {displayData.activeYear && ` (${displayData.activeYear})`} |
            Last Updated: {displayData.updateTime}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshMutation.isLoading}
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 disabled:opacity-50 transition-all"
        >
          <RefreshCcw size={20} className={refreshMutation.isLoading ? "animate-spin" : ""} />
          {refreshMutation.isLoading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Duplicate Payment Alert */}
      {duplicateCount > 0 && (
        <div className="mb-6 rounded-md bg-danger bg-opacity-10 p-4 border border-danger">
          <div className="flex items-center gap-3">
            <div className="flex bg-danger text-white rounded-full p-1 w-6 h-6 items-center justify-center">!</div>
            <h3 className="text-lg font-bold text-danger">Duplicate Payments Detected!</h3>
          </div>
          <p className="mt-2 text-black dark:text-white">
            Found <span className="font-bold">{duplicateCount}</span> bills marked as paid through multiple channels (Total: {fmtMoney(duplicates.paidAmount)}).
            Please check the Bill List page for details.
          </p>
        </div>
      )}

      {/* Top Cards - Customer & Bill Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5 2xl:gap-7.5">
        <CardDataStats
          title="Total Customers"
          total={fmt(totalCustomers)}
          rate="Total"
          levelUp
        >
          <Users className="text-primary dark:text-white" size={24} />
        </CardDataStats>
        <CardDataStats
          title="Active Customers"
          total={<>{fmt(displayData.activeCustomers)}{getPercent(displayData.activeCustomers, totalCustomers)}</>}
          rate="Active"
          levelUp
        >
          <Users className="text-success dark:text-white" size={24} />
        </CardDataStats>
        <CardDataStats
          title="Deactivated Customers"
          total={<>{fmt(displayData.deactivatedCustomers)}{getPercent(displayData.deactivatedCustomers, totalCustomers)}</>}
          rate="Inactive"
          levelDown
        >
          <Users className="text-warning dark:text-white" size={24} />
        </CardDataStats>
        <CardDataStats
          title="Completely Deleted"
          total={<>{fmt(displayData.deletedCustomers)}{getPercent(displayData.deletedCustomers, totalCustomers)}</>}
          rate="Deleted"
          levelDown
        >
          <Users className="text-danger dark:text-white" size={24} />
        </CardDataStats>
        <CardDataStats
          title="Total Bills Generated"
          total={<>{fmt(displayData.billsGenerated)}{getPercent(displayData.billsGenerated, totalCustomers)}</>}
          rate="Bills"
          levelUp
        >
          <FileText className="text-primary dark:text-white" size={24} />
        </CardDataStats>
      </div>

      {/* Financial Breakdown Cards */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12">
          <h4 className="mb-4 text-xl font-bold text-black dark:text-white px-2 border-l-4 border-primary">
            ጥቅላላ ድምር Financial Summary
          </h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <CardDataStats title="የወሩ ፍጆታ (ሜ3)" total={fmt(displayData.consumption)} rate="Consumption" levelUp>
              <FileText className="text-primary dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ውዝፍ ፍጆታ (ሜ3)" total={fmt(displayData.wuzifConsumption)} rate="Arrears" levelDown>
              <Clock className="text-warning dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ጠቅላላ ደረቅ ቆሻሻ" total={fmtMoney(displayData.derekKoshasha)} rate="Waste" levelDown>
              <Banknote className="text-warning dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ጠቅላላ ተጨማሪ ክፍያ" total={fmtMoney(displayData.additionalFees)} rate="Fee" levelDown>
              <FileText className="text-primary dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ጠቅላላ የዚህ ወር" total={fmtMoney(displayData.g1_thisMonth)} rate="Current" levelUp>
              <FileText className="text-success dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ጠቅላላ ውዝፍ" total={fmtMoney(displayData.wuzifAmount)} rate="Arrears" levelDown>
              <Clock className="text-danger dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ቅጣት (Penalty)" total={fmtMoney(displayData.penalty)} rate="Penalty" levelDown>
              <Banknote className="text-meta-1 dark:text-white" size={20} />
            </CardDataStats>
            <CardDataStats title="ቅድሚያ የተከፈለ (Prepaid)" total={fmtMoney(displayData.prepaid)} rate="Prepaid" levelUp>
              <Banknote className="text-warning dark:text-white" size={20} />
            </CardDataStats>
          </div>
          {/* Bottom Grand Total Cards - matching billList layout */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
            <div className="rounded-lg border-2 border-blue-400 bg-blue-50 dark:bg-blue-900/20 p-4 shadow-md">
              <p className="text-sm font-bold text-black dark:text-white mb-1">ጠቅላላ ክፍያ (Excl. Waste)</p>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{fmtMoney(displayData.totalPayableExclWaste)}</p>
            </div>
            <div className="rounded-lg border-2 border-green-400 bg-green-50 dark:bg-green-900/20 p-4 shadow-md">
              <p className="text-sm font-bold text-black dark:text-white mb-1">ጠቅላላ ክፍያ እና ደረቅ ቆሻሻ (Incl. Waste)</p>
              <p className="text-2xl font-extrabold text-green-700 dark:text-green-400">{fmtMoney(displayData.totalPayableWithWaste)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Reconciliation & Visualization Section */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">

        {/* Line Chart Section - Full Width */}
        <div className="col-span-12 flex flex-col gap-6">
          <LineChartStats
            title="ጥቅላላ ድምር (Financial Trends)"
            labels={[
              'የዚህ ወር (This Month)',
              'ተጨማሪ ክፍያ (Add Fees)',
              'ደረቅ ቆሻሻ (Dry Waste)',
              'ቅጣት (Penalties)',
              'ውዝፍ አና ቅጣት (Arrears)',
            ]}
            datasets={[
              {
                label: 'Paid',
                data: [
                  displayData.g1_thisMonth_paid,
                  displayData.g1_tech_paid + displayData.g2_tech_paid,
                  displayData.g1_waste_paid + displayData.g2_waste_paid,
                  displayData.g2_penalty_paid,
                  displayData.g2_hisab_paid,
                ],
                color: '#10B981' // Success Green
              },
              {
                label: 'Unpaid',
                data: [
                  (displayData.g1_thisMonth || 0) - (displayData.g1_thisMonth_paid || 0),
                  (displayData.g1_tech + displayData.g2_tech) - (displayData.g1_tech_paid + displayData.g2_tech_paid),
                  (displayData.g1_waste + displayData.g2_waste) - (displayData.g1_waste_paid + displayData.g2_waste_paid),
                  displayData.g2_penalty - displayData.g2_penalty_paid,
                  (displayData.g2_hisab || 0) - (displayData.g2_hisab_paid || 0),
                ],
                color: '#DC3545' // Danger Red
              }
            ]}
          />
        </div>

        {/* Financial Table - Multi-Column Layout */}
        <div className="col-span-12 rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-lg dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-6">
          <h4 className="mb-6 text-xl font-extrabold text-black dark:text-white tracking-wide">
            ዝርዝር ሪፖርት (Financial Reconciliation)
          </h4>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4"> {/* Decreased gap from 8 to 4 */}
            {/* Left Column: Group 1 */}
            <div className="flex flex-col">
              <div className="p-2 font-black text-base text-black dark:text-white border-b-2 border-primary mb-2 bg-gray-50 dark:bg-gray-800 rounded">
                Group 1: የዚህ ወር
              </div>
              <div className="grid grid-cols-4 rounded-lg bg-gray-2 dark:bg-meta-4 mb-2">
                <div className="p-2"><h5 className="text-sm font-bold uppercase text-black dark:text-white">Type</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-primary">Tot</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-success">Pd</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-danger">Unpd</h5></div>
              </div>
              {[
                { label: "የውሃ ፍጆታ ብር", total: displayData.g1_fjota, paid: displayData.g1_fjota_paid },
                { label: "ቆጣሪ ኪራይ", total: displayData.g1_rent, paid: displayData.g1_rent_paid },
                { label: "ተጨማሪ ክፍያ", total: displayData.g1_tech, paid: displayData.g1_tech_paid },
                { label: "የዚህ ወር ደረቅ ቆሻሻ", total: displayData.g1_waste, paid: displayData.g1_waste_paid },
              ].map((item, idx) => (
                <div className="grid grid-cols-4 border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors p-1" key={'g1-' + idx}>
                  <div className="text-sm font-bold text-black dark:text-white truncate">{item.label}</div>
                  <div className="text-right text-sm font-bold text-black dark:text-white">{fmtMoney(item.total)}</div>
                  <div className="text-right text-sm font-bold text-success">{fmtMoney(item.paid)}</div>
                  <div className="text-right text-sm font-bold text-danger">{fmtMoney((item.total || 0) - (item.paid || 0))}</div>
                </div>
              ))}
              {/* Group 1 Subtotals - matching billList */}
              <div className="border-t-2 border-black dark:border-white mt-2 pt-2">
                <div className="grid grid-cols-4 p-1">
                  <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400">የዚህ ወር</div>
                  <div className="text-right text-sm font-extrabold text-blue-700 dark:text-blue-400">{fmtMoney(displayData.g1_thisMonth)}</div>
                  <div className="text-right text-sm font-extrabold text-success">{fmtMoney(displayData.g1_thisMonth_paid)}</div>
                  <div className="text-right text-sm font-extrabold text-danger">{fmtMoney((displayData.g1_thisMonth || 0) - (displayData.g1_thisMonth_paid || 0))}</div>
                </div>
                <div className="grid grid-cols-4 p-1">
                  <div className="text-sm font-extrabold text-blue-700 dark:text-blue-400">የዚህ ወር አና ደረቅ ቆሻሻ</div>
                  <div className="text-right text-sm font-extrabold text-blue-700 dark:text-blue-400">{fmtMoney(displayData.g1_thisMonthWithWaste)}</div>
                  <div className="text-right text-sm font-extrabold text-success">{fmtMoney(displayData.g1_thisMonthWithWaste_paid)}</div>
                  <div className="text-right text-sm font-extrabold text-danger">{fmtMoney((displayData.g1_thisMonthWithWaste || 0) - (displayData.g1_thisMonthWithWaste_paid || 0))}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Group 2 */}
            <div className="flex flex-col">
              <div className="p-2 font-black text-base text-black dark:text-white border-b-2 border-warning mb-2 bg-gray-50 dark:bg-gray-800 rounded">
                Group 2: ውዝፍ
              </div>
              <div className="grid grid-cols-4 rounded-lg bg-gray-2 dark:bg-meta-4 mb-2">
                <div className="p-2"><h5 className="text-sm font-bold uppercase text-black dark:text-white">Type</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-primary">Tot</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-success">Pd</h5></div>
                <div className="p-2 text-right"><h5 className="text-sm font-bold uppercase text-danger">Unpd</h5></div>
              </div>
              {[
                { label: "ውዝፍ ቆጣሪ ኪራይ", total: displayData.g2_rent, paid: displayData.g2_rent_paid },
                { label: "ውዝፍ ተጨማሪ ክፍያ", total: displayData.g2_tech, paid: displayData.g2_tech_paid },
                { label: "ቅጣት", total: displayData.g2_penalty, paid: displayData.g2_penalty_paid },
                { label: "ውዝፍ ፍጆታ ክፍያ", total: displayData.g2_fjota, paid: displayData.g2_fjota_paid },
                { label: "ውዝፍ ደረቅ ቆሻሻ", total: displayData.g2_waste, paid: displayData.g2_waste_paid },
                { label: "የተላለፈ(ነባር) ውዝፍ", total: displayData.g2_transferred, paid: displayData.g2_transferred_paid },
              ].map((item, idx) => (
                <div className="grid grid-cols-4 border-b border-stroke dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition-colors p-1" key={'g2-' + idx}>
                  <div className="text-sm font-bold text-black dark:text-white truncate">{item.label}</div>
                  <div className="text-right text-sm font-bold text-black dark:text-white">{fmtMoney(item.total)}</div>
                  <div className="text-right text-sm font-bold text-success">{fmtMoney(item.paid)}</div>
                  <div className="text-right text-sm font-bold text-danger">{fmtMoney((item.total || 0) - (item.paid || 0))}</div>
                </div>
              ))}
              {/* Group 2 Subtotals - matching billList (3 rows) */}
              <div className="border-t-2 border-black dark:border-white mt-2 pt-2">
                <div className="grid grid-cols-4 p-1">
                  <div className="text-sm font-extrabold text-red-700 dark:text-red-400">ውዝፍ</div>
                  <div className="text-right text-sm font-extrabold text-red-700 dark:text-red-400">{fmtMoney(displayData.g2_wuzif)}</div>
                  <div className="text-right text-sm font-extrabold text-success">{fmtMoney(displayData.g2_wuzif_paid)}</div>
                  <div className="text-right text-sm font-extrabold text-danger">{fmtMoney((displayData.g2_wuzif || 0) - (displayData.g2_wuzif_paid || 0))}</div>
                </div>
                <div className="grid grid-cols-4 p-1">
                  <div className="text-sm font-extrabold text-red-700 dark:text-red-400">ውዝፍ አና ደረቅ ቆሻሻ</div>
                  <div className="text-right text-sm font-extrabold text-red-700 dark:text-red-400">{fmtMoney(displayData.g2_wuzifWithWaste)}</div>
                  <div className="text-right text-sm font-extrabold text-success">{fmtMoney(displayData.g2_wuzifWithWaste_paid)}</div>
                  <div className="text-right text-sm font-extrabold text-danger">{fmtMoney((displayData.g2_wuzifWithWaste || 0) - (displayData.g2_wuzifWithWaste_paid || 0))}</div>
                </div>
                <div className="grid grid-cols-4 p-1">
                  <div className="text-sm font-extrabold text-red-700 dark:text-red-400">ውዝፍ አና ቅጣት</div>
                  <div className="text-right text-sm font-extrabold text-red-700 dark:text-red-400">{fmtMoney(displayData.g2_hisab)}</div>
                  <div className="text-right text-sm font-extrabold text-success">{fmtMoney(displayData.g2_hisab_paid)}</div>
                  <div className="text-right text-sm font-extrabold text-danger">{fmtMoney((displayData.g2_hisab || 0) - (displayData.g2_hisab_paid || 0))}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Totals */}
          <div className="grid grid-cols-4 bg-primary text-white font-extrabold rounded-b-lg mt-6 shadow-md">
            <div className="p-4">NET TOTAL</div>
            <div className="p-4 text-right">{fmtMoney(displayData.totalPayableWithWaste)}</div>
            <div className="p-4 text-right text-white">{fmtMoney(displayData.totalCollected)}</div>
            <div className="p-4 text-right text-white">{fmtMoney((displayData.totalPayableWithWaste || 0) - (displayData.totalCollected || 0))}</div>
          </div>
        </div>

        {/* --- NEW SECTION: Payment Location Summary --- */}
        <div className="col-span-12 rounded-lg border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-lg dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-6">
          <h4 className="mb-6 text-xl font-extrabold text-black dark:text-white tracking-wide border-l-4 border-success px-2">
            Payment Location Analysis
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Payment Location</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">No. of Bills</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-black dark:text-white">Total Amount (ETB)</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Additional Hisab</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-black dark:text-white">Wuzif Derek Koshasha</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-black dark:text-white">Total Derek Koshasha</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-black dark:text-white">Tekilala Tekefay</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Check</th>
                </tr>
              </thead>
              <tbody>
                {/* Prepaid */}
                <tr>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-medium text-black dark:text-white">Prepaid</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmt(prepaid.count)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-success font-bold">{fmtMoney(prepaid.paidAmount)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(prepaid.additionalHisab)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(prepaid.wuzifDerekKoshasha)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold">{fmtMoney((Number(prepaid.wuzifDerekKoshasha) || 0) + (Number(prepaid.additionalHisab) || 0))}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(prepaid.tekilalaTekefay)}</td>
                  <td className={`border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold ${((Number(prepaid.tekilalaTekefay) || 0) - (Number(prepaid.paidAmount) || 0)) < 0 ? 'text-danger' : 'text-success'}`}>{fmtMoney((Number(prepaid.tekilalaTekefay) || 0) - (Number(prepaid.paidAmount) || 0))}</td>
                </tr>
                {/* Office */}
                <tr>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-medium text-black dark:text-white">ቢሮ የተከፈለ</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmt(office.count)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-success font-bold">{fmtMoney(office.paidAmount)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(office.additionalHisab)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(office.wuzifDerekKoshasha)}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold">{fmtMoney((Number(office.wuzifDerekKoshasha) || 0) + (Number(office.additionalHisab) || 0))}</td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(office.tekilalaTekefay)}</td>
                  <td className={`border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold ${((Number(office.tekilalaTekefay) || 0) - (Number(office.paidAmount) || 0)) < 0 ? 'text-danger' : 'text-success'}`}>{fmtMoney((Number(office.tekilalaTekefay) || 0) - (Number(office.paidAmount) || 0))}</td>
                </tr>
                {/* Banks */}
                {banks.map((bank, i) => (
                  <tr key={i}>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-medium text-gray-600 dark:text-gray-400 pl-8">- {bank.bankName}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmt(bank.count)}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-success font-bold">{fmtMoney(bank.paidAmount)}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(bank.additionalHisab)}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(bank.wuzifDerekKoshasha)}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold">{fmtMoney((Number(bank.wuzifDerekKoshasha) || 0) + (Number(bank.additionalHisab) || 0))}</td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">{fmtMoney(bank.tekilalaTekefay)}</td>
                    <td className={`border-b border-[#eee] py-5 px-4 dark:border-strokedark font-bold ${((Number(bank.tekilalaTekefay) || 0) - (Number(bank.paidAmount) || 0)) < 0 ? 'text-danger' : 'text-success'}`}>{fmtMoney((Number(bank.tekilalaTekefay) || 0) - (Number(bank.paidAmount) || 0))}</td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-gray-2 dark:bg-meta-4 font-bold">
                  <td className="py-5 px-4 text-black dark:text-white">Grand Total</td>
                  <td className="py-5 px-4 text-black dark:text-white">{fmt(plTotalCount)}</td>
                  <td className="py-5 px-4 text-success">{fmtMoney(plTotalPaid)}</td>
                  <td className="py-5 px-4 text-black dark:text-white">{fmtMoney(plTotalAddHisab)}</td>
                  <td className="py-5 px-4 text-black dark:text-white">{fmtMoney(plTotalWaste)}</td>
                  <td className="py-5 px-4 text-black dark:text-white font-bold">{fmtMoney(plTotalWaste + plTotalAddHisab)}</td>
                  <td className="py-5 px-4 text-black dark:text-white">{fmtMoney(plTotalNet)}</td>
                  <td className={`py-5 px-4 font-bold ${(plTotalNet - plTotalPaid) < 0 ? 'text-danger' : 'text-success'}`}>{fmtMoney(plTotalNet - plTotalPaid)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <h4 className="mt-7.5 mb-4 text-xl font-bold text-black dark:text-white px-2 border-l-4 border-warning">
        Field Operations <span className="text-base font-normal ml-2 text-gray-600 dark:text-gray-400">
          (Read Month: {displayData.readingMonthName || displayData.activeMonth || "N/A"}, Start: {displayData.readingDate || "N/A"})
        </span>
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        {/* Mobile Readers Table */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
            Mobile Reader Performance
          </h4>
          <div className="flex flex-col">
            <div className="grid grid-cols-2 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-2">
              <div className="p-2.5 xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">Reader Name</h5></div>
              <div className="p-2.5 text-center xl:p-5"><h5 className="text-sm font-medium uppercase xsm:text-base">Readings Collected</h5></div>
            </div>
            {displayData.mobileReaderStats.length > 0 ? (
              displayData.mobileReaderStats.sort((a, b) => b.count - a.count).map((reader, key) => (
                <div className={`grid grid-cols-2 sm:grid-cols-2 ${key === displayData.mobileReaderStats.length - 1 ? "" : "border-b border-stroke dark:border-strokedark"}`} key={key}>
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white font-medium">{reader.name}</p>
                    {/* Username Hidden per request */}
                  </div>
                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${reader.count === 0 ? 'bg-danger text-danger' :
                      reader.count < 50 ? 'bg-warning text-warning' :
                        'bg-success text-success'
                      }`}>
                      {fmt(reader.count)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center">No reading data available.</div>
            )}
          </div>
        </div>

        {/* Customers Without Reading */}
        <div className="flex flex-col gap-4">
          <CardDataStats
            title="Customers Without Reading"
            total={fmt(displayData.customersWithoutReading)}
            rate="Missing"
            levelDown
          >
            <FileText className="text-danger dark:text-white" size={24} />
            {/* Date info moved to header */}
          </CardDataStats>

          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h5 className="text-lg font-bold mb-2">Instructions</h5>
            <p className="text-sm text-gray-600">
              Use the 'Customers Without Reading' count to identify areas that need immediate attention from field readers.
              <br />
              Check <b>Bill List</b> Group 2 for detailed Arrears breakdown.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const queryClient = new QueryClient();

const HomeWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <Home />
  </QueryClientProvider>
);

export default HomeWithProviders;
