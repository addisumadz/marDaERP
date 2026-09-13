"use client";
import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Paper,
} from "@mui/material";

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
  return (
    <Box component={Paper} sx={{ padding: 2, marginTop: 3 }}>
      <Typography variant="h6" gutterBottom>
        Summations
      </Typography>

      {summationGroups.map((group) => (
        <Box key={group.label} sx={{ marginBottom: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            {group.label}
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {group.fields.map((field) => (
                <TableRow key={field.key}>
                  <TableCell>{field.label}</TableCell>
                  <TableCell align="right">
                    {summations?.[field.key] ?? 0}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
}
