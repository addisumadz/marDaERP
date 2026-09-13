"use client";
import React, { useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

const summationGroups = [
  {
    label: "Group 1 - Current Period",
    fields: [
      { key: "yezihWerFjotaKfya", label: "የዚህ ወር ፎጆታ ክፍያ" },
      { key: "kotariKiray", label: "ኮታሪ ኪራይ" },
      { key: "additionalHisab", label: "ተጨማሪ ሂሳብ" },
      { key: "techemariKfya", label: "ተጀማሪ ክፍያ" },
      { key: "yezihWer", label: "የዚህ ወር" },
    ],
  },
  {
    label: "Group 2 - Wuzif",
    fields: [
      { key: "wuzifKotariKiray", label: "ውዝፍ ኮታሪ ኪራይ" },
      { key: "wuzifFjota", label: "ውዝፍ ፎጆታ" },
      { key: "wuzifDerekKoshasha", label: "ውዝፍ ድረክ ኮሻሻ" },
      { key: "wuzifTechemariKfya", label: "ውዝፍ ተጀማሪ ክፍያ" },
      { key: "kitat", label: "ክታት" },
      { key: "wuzifHisab", label: "ውዝፍ ሂሳብ" },
      { key: "wuzifFjotaKfya", label: "ውዝፍ ፎጆታ ክፍያ" },
    ],
  },
  {
    label: "Group 3 - Adjustments",
    fields: [
      { key: "temelashBirr", label: "ተመላሽ ብር" },
      { key: "kecreditYetekefele", label: "ከክሬዲት የተከፈለ" },
      { key: "tekilalaYetekefele", label: "ተኪላላ የተከፈለ" },
      { key: "tekilalaBankYetekefele", label: "ተኪላላ ባንክ የተከፈለ" },
    ],
  },
  {
    label: "Group 4 - Consumption",
    fields: [
      { key: "consumption", label: "Consumption" },
      { key: "consumptionWuzif", label: "Consumption Wuzif" },
    ],
  },
];

export default function SummationsTable({ summations }) {
  const data = useMemo(() => {
    const rows = [];
    for (const group of summationGroups) {
      for (const f of group.fields) {
        rows.push({
          group: group.label,
          field: f.label,
          key: f.key,
          amount: Number(summations?.[f.key] ?? 0),
        });
      }
    }
    return rows;
  }, [summations]);

  const columns = useMemo(
    () => [
      { accessorKey: "group", header: "Group" },
      { accessorKey: "field", header: "Field" },
      {
        accessorKey: "amount",
        header: "Amount",
        Cell: ({ cell }) => cell.getValue(),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableStickyHeader: true,
    initialState: {
      density: "compact",
      pagination: { pageSize: 10 },
      grouping: ["group"],
      expanded: true,
    },
    enableGrouping: true,
    enableColumnResizing: true,
    enableRowVirtualization: true,
    muiTableContainerProps: { sx: { maxHeight: 400 } },
  });

  return (
    <Box component={Paper} sx={{ padding: 2, marginTop: 3 }}>
      <Typography variant="h6" gutterBottom>
        Summations
      </Typography>
      <MaterialReactTable table={table} />
    </Box>
  );
}
