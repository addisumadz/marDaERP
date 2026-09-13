"use client";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Button,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery } from "@tanstack/react-query";
import { ReadingService } from "@/app/lib/ReadingService";
import { formatNumber } from "@/app/helpers/formatting";

const readingService = new ReadingService();

export default function ReadingDetailModal({ open, onClose, readingId, isPreview = false }) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: [isPreview ? "reading-preview" : "reading-detail", readingId],
    queryFn: () => isPreview ? readingService.getBillPreview(readingId) : readingService.getReadingDetailWithConsumption(readingId),
    enabled: open && !!readingId,
    staleTime: 0,
    cacheTime: 0,
  });

  // Normalize payload: backend might sometimes return a JSON string
  let payload = data;
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch (e) {
      // leave as-is; render will show raw payload
    }
  }

  const reading = payload?.reading;
  const consumption = payload?.consumption || [];

  // Debug logs to diagnose "no data" issue
  // if (typeof window !== 'undefined') {
  //   // eslint-disable-next-line no-console
  //   console.debug('[ReadingDetailModal] state', { open, readingId, isLoading, isFetching, isError, dataType: typeof data, data, error });
  //   // eslint-disable-next-line no-console
  //   console.log('[ReadingDetailModal] normalized payload', {
  //     type: typeof payload,
  //     payload,
  //     readingKeys: reading ? Object.keys(reading) : null,
  //     consumptionLen: Array.isArray(consumption) ? consumption.length : null,
  //   });
  // }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          pr: 6,
          py: 1.5,
          background: isPreview ? 'linear-gradient(135deg, #FF8008 0%, #FFC837 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '8px 8px 0 0'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {isPreview ? "Bill Preview" : "📊 Reading Details"}
          </Typography>
          <Chip
            label={isPreview ? "Preview Mode" : "Enhanced View"}
            size="small"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 500
            }}
          />
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 1.5,
          backgroundColor: '#fafafa'
        }}
      >
        {isLoading || isFetching ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ color: "error.main", py: 2 }}>
            <Typography variant="body2">
              Failed to load details: {error?.message || "Unknown error"}
            </Typography>
            <Button onClick={() => refetch()} size="small" sx={{ mt: 1 }}>
              Retry
            </Button>
          </Box>
        ) : !reading ? (
          <Box>
            <Typography variant="body2">No data</Typography>
            {data && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Raw payload:
                </Typography>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {/* Two-column tabular layout */}
            <Grid container spacing={0.25}>
              {/* Left: Customer & Meter + Payment */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    👤 Customer & Meter
                  </Typography>
                </Box>
                <Paper elevation={1} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, transition: 'all 200ms ease', '&:hover': { boxShadow: 6, borderColor: 'primary.light', transform: 'translateY(-2px)' } }}>
                  <Table size="small" sx={{ '& tbody tr:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '& .MuiTableCell-root': { fontSize: '1.04rem' } }}>
                    <TableBody>
                      <TableRow><TableCell>የደንበኛ ስም</TableCell><TableCell>{reading?.customerName ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>ክፍያ ወር</TableCell><TableCell>{reading?.kifyaWer ?? '-'}</TableCell></TableRow>
                      <TableRow>
                        <TableCell>ደረሰኝ ቁጥር</TableCell>
                        <TableCell>
                          {(() => {
                            const isBillGenerated = !!reading?.isBillGenerated;
                            if (!isBillGenerated) return '-';
                            const direct = (reading?.invoiceNumber || '').trim();
                            if (direct) return direct;
                            const fallback = (reading?.billingInvoiceNumbers || '').trim();
                            return fallback || '-';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow><TableCell>ቆጣሪ አንባቢ</TableCell><TableCell>{reading?.mobileReaderUser ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>የቆጣሪ ቁጥር</TableCell><TableCell>{reading?.meterNumber ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>የቆጣሪ መጠን</TableCell><TableCell>{reading?.meterSize ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>ያሁን ንባብ</TableCell><TableCell>{reading?.lastReading ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>የቀድሞ ንባብ</TableCell><TableCell>{reading?.previousReading ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>ፍጆታ</TableCell><TableCell>{reading?.consumption ?? '-'}</TableCell></TableRow>
                      <TableRow><TableCell>ውዝፍ ፍጆታ</TableCell><TableCell>{reading?.wuzifFjota ?? '-'}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </Paper>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5, mb: 0.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    💳 Payment Info
                  </Typography>
                </Box>
                <Paper
                  elevation={2}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 0.5,
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      borderColor: 'success.main',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      '& tbody tr:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0,0,0,0.02)'
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                        py: 0.5,
                        pl: 1,
                        pr: 0.5,
                        fontSize: '1.04rem'
                      },
                      '& .MuiTableCell-root:first-of-type': {
                        fontWeight: 600,
                        color: 'text.secondary',
                        minWidth: 100,
                        pr: 0.5,
                        fontSize: '1.04rem'
                      },
                      '& .MuiTableCell-root:last-of-type': {
                        pr: 1,
                        fontSize: '1.04rem'
                      }
                    }}
                  >
                    <TableBody>
                      <TableRow>
                        <TableCell>ጠቅላላ የተከፈለ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                          {reading?.tekilalaYetekefele && !isNaN(reading.tekilalaYetekefele)
                            ? formatNumber(Number(reading.tekilalaYetekefele))
                            : (reading?.tekilalaYetekefele ?? '0.00')}
                        </TableCell>
                      </TableRow>

                      {!!reading?.isDerashPaid && (
                        <TableRow>
                          <TableCell>ደራሽ</TableCell>
                          <TableCell>
                            {(() => {
                              const bankFromRelation =
                                reading?.billingBanks?.bankName ||
                                reading?.billingBank?.bankName ||
                                reading?.bankName ||
                                null;
                              const fallbackAgent =
                                reading?.bankPaidAgentId &&
                                String(reading.bankPaidAgentId).trim();
                              const location =
                                (bankFromRelation && String(bankFromRelation).trim()) ||
                                fallbackAgent ||
                                null;
                              const date = reading?.moneyCollectedDate ?? null;

                              if (!location && !date) return '-';

                              return `${location ?? '-'}, ${date ?? 'null'}`;
                            })()}
                          </TableCell>
                        </TableRow>
                      )}

                      {!!reading?.isUnicashPaid && (
                        <TableRow>
                          <TableCell>ዩኒ ካሽ</TableCell>
                          <TableCell>
                            {(() => {
                              // Unicash: prefer bank name from DTO, then fall back to agent id
                              // DTO fields may be serialized with different casing (uBankName, UBankName, ubankName)
                              const bankFromDto =
                                reading?.uBankName ??
                                reading?.UBankName ??
                                reading?.ubankName ??
                                null;

                              const agent =
                                reading?.uBankPaidAgentId ??
                                reading?.UBankPaidAgentId ??
                                null;

                              const location =
                                (bankFromDto && String(bankFromDto).trim()) ||
                                (agent && String(agent).trim()) ||
                                null;

                              const date =
                                reading?.uMoneyCollectedDate ??
                                reading?.UMoneyCollectedDate ??
                                reading?.moneyCollectedDate ??
                                null;

                              if (!location && !date) return '-';

                              return `${location ?? '-'}, ${date ?? 'null'}`;
                            })()}
                          </TableCell>
                        </TableRow>
                      )}

                      {!!reading?.isPaidOnFrontOffice && (
                        <TableRow>
                          <TableCell>ቢሮ የተከፈለ</TableCell>
                          <TableCell>
                            {`ቢሮ, ${reading?.moneyCollectedDate ?? 'null'}`}
                          </TableCell>
                        </TableRow>
                      )}

                      {!!reading?.isPaidOnFrontOffice && (
                        <TableRow>
                          <TableCell>ካሸር</TableCell>
                          <TableCell>{reading?.cashierUser ?? '-'}</TableCell>
                        </TableRow>
                      )}

                      <TableRow>
                        <TableCell>ዜሮ ንባብ ምክንያት</TableCell>
                        <TableCell>{reading?.billingZeroReadingReason ?? '-'}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              {/* Right: Reading Summary */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'secondary.main' }}>
                    📈 Reading Summary
                  </Typography>
                </Box>
                <Paper
                  elevation={2}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 0.5,
                    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                    '&:hover': {
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      borderColor: 'secondary.main',
                      transform: 'translateY(-4px)'
                    }
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      '& tbody tr:nth-of-type(odd)': {
                        backgroundColor: 'rgba(0,0,0,0.02)'
                      },
                      '& .MuiTableCell-root': {
                        borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                        py: 0.5,
                        pl: 1,
                        pr: 0.5,
                        fontSize: '1.04rem'
                      },
                      '& .MuiTableCell-root:first-of-type': {
                        fontWeight: 600,
                        color: 'text.secondary',
                        minWidth: 100,
                        pr: 0.5,
                        fontSize: '1.04rem'
                      },
                      '& .MuiTableCell-root:last-of-type': {
                        pr: 1,
                        fontSize: '1.04rem'
                      }
                    }}
                  >
                    <TableBody>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>የቆጣሪ ኪራይ</TableCell><TableCell>{reading?.kotariKiray && !isNaN(reading.kotariKiray) ? formatNumber(Number(reading.kotariKiray)) : (reading?.kotariKiray ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>የዚህ ወር ፍጆታ</TableCell><TableCell>{reading?.yezihWerFjotaKfya && !isNaN(reading.yezihWerFjotaKfya) ? formatNumber(Number(reading.yezihWerFjotaKfya)) : (reading?.yezihWerFjotaKfya ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>የደረቅ ቆሻሻ ክፍያ</TableCell><TableCell>{reading?.additionalHisab && !isNaN(reading.additionalHisab) ? formatNumber(Number(reading.additionalHisab)) : (reading?.additionalHisab ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', fontSize: '1.43rem', color: '#2196f3' } }}>
                        <TableCell>የዚህ ወር ድምር</TableCell>
                        <TableCell>
                          {(() => {
                            const currentValue = reading?.yezihWer && !isNaN(reading.yezihWer) ? Number(reading.yezihWer) : 0;
                            const additionalValue = reading?.additionalHisab && !isNaN(reading.additionalHisab) ? Number(reading.additionalHisab) : 0;
                            const total = currentValue + additionalValue;
                            return total > 0 ? formatNumber(total) : '-';
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ተጨማሪ ክፍያ({reading?.techemariFieldName ? `${reading?.techemariFieldName}` : ''})</TableCell><TableCell>{reading?.techemariKfya && !isNaN(reading.techemariKfya) ? formatNumber(Number(reading.techemariKfya)) : (reading?.techemariKfya ?? '-')}</TableCell></TableRow>
                      {reading?.mBillingAdditionalPayment1Value != null && reading.mBillingAdditionalPayment1Value > 0 && (
                        <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>{reading?.mBillingAdditionalPayment1ValueLable || 'Service Charge 1'}</TableCell><TableCell>{formatNumber(Number(reading.mBillingAdditionalPayment1Value))}</TableCell></TableRow>
                      )}
                      {reading?.mBillingAdditionalPayment2Value != null && reading.mBillingAdditionalPayment2Value > 0 && (
                        <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>{reading?.mBillingAdditionalPayment2ValueLable || 'Service Charge 2'}</TableCell><TableCell>{formatNumber(Number(reading.mBillingAdditionalPayment2Value))}</TableCell></TableRow>
                      )}

                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ ኪራይ</TableCell><TableCell>{reading?.wuzifKotariKiray && !isNaN(reading.wuzifKotariKiray) ? formatNumber(Number(reading.wuzifKotariKiray)) : (reading?.wuzifKotariKiray ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ ፍጆታ ክፍያ </TableCell><TableCell>{reading?.wuzifFjotaKfya && !isNaN(reading.wuzifFjotaKfya) ? formatNumber(Number(reading.wuzifFjotaKfya)) : (reading?.wuzifFjotaKfya ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ የደረቅ ቆሻሻ ክፍያ</TableCell><TableCell>{reading?.wuzifDerekKoshasha && !isNaN(reading.wuzifDerekKoshasha) ? formatNumber(Number(reading.wuzifDerekKoshasha)) : (reading?.wuzifDerekKoshasha ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ ተጨማሪ ክፍያ</TableCell><TableCell>{reading?.wuzifTechemariKfya && !isNaN(reading.wuzifTechemariKfya) ? formatNumber(Number(reading.wuzifTechemariKfya)) : (reading?.wuzifTechemariKfya ?? '-')}</TableCell></TableRow>
                      {reading?.mBillingAdditionalPayment1Wuzif != null && reading.mBillingAdditionalPayment1Wuzif > 0 && (
                        <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ {reading?.mBillingAdditionalPayment1ValueLable || 'Service Charge 1'}</TableCell><TableCell>{formatNumber(Number(reading.mBillingAdditionalPayment1Wuzif))}</TableCell></TableRow>
                      )}
                      {reading?.mBillingAdditionalPayment2Wuzif != null && reading.mBillingAdditionalPayment2Wuzif > 0 && (
                        <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ {reading?.mBillingAdditionalPayment2ValueLable || 'Service Charge 2'}</TableCell><TableCell>{formatNumber(Number(reading.mBillingAdditionalPayment2Wuzif))}</TableCell></TableRow>
                      )}
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ ወር ብዛት</TableCell><TableCell>{reading?.wuzifWorBzat && !isNaN(reading.wuzifWorBzat) ? formatNumber(Number(reading.wuzifWorBzat)) : (reading?.wuzifWorBzat ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}><TableCell>ውዝፍ መግለጫ</TableCell><TableCell sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap', maxWidth: '200px' }}>{reading?.wuzifKezihEske ?? '-'}</TableCell></TableRow>
                      <TableRow sx={{ '&:nth-of-type(odd)': { backgroundColor: 'grey.50' } }}>
                        <TableCell>ውዝፍ ቅድመ ክፍያ</TableCell>
                        <TableCell sx={{ color: '#e57373' }}>
                          {(() => {
                            const display = (reading?.temelashBirr !== null && reading?.temelashBirr !== undefined && !isNaN(Number(reading.temelashBirr)))
                              ? formatNumber(Number(reading.temelashBirr))
                              : (reading?.temelashBirr ?? '-');
                            return `(${display})`;
                          })()}
                        </TableCell>
                      </TableRow>

                      <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', fontSize: '1.43rem', color: '#2196f3' } }}><TableCell>ውዝፍ ድምር</TableCell><TableCell>{reading?.wuzifHisab && !isNaN(reading.wuzifHisab) ? formatNumber(Number(reading.wuzifHisab)) : (reading?.wuzifHisab ?? '-')}</TableCell></TableRow>
                      <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', fontSize: '1.43rem', color: '#2196f3' } }}><TableCell>ቅጣት</TableCell><TableCell>{reading?.kitat && !isNaN(reading.kitat) ? formatNumber(Number(reading.kitat)) : (reading?.kitat ?? '-')}</TableCell></TableRow>

                      <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', fontSize: '1.43rem', color: '#2196f3' } }}>
                        <TableCell>ቅድመ ክፍያ</TableCell>
                        <TableCell sx={{ color: '#e57373' }}>
                          {(() => {
                            const display = (reading?.kecreditYetekefele !== null && reading?.kecreditYetekefele !== undefined && !isNaN(Number(reading.kecreditYetekefele)))
                              ? formatNumber(Number(reading.kecreditYetekefele))
                              : (reading?.kecreditYetekefele ?? '-');
                            return `(${display})`;
                          })()}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: 'bold', fontSize: '1.2rem', color: '#2196f3', borderTop: '2px solid', borderColor: 'primary.main' } }}><TableCell>ጠቅላላ ተከፋይ</TableCell><TableCell>{reading?.tekilalaTekefay && !isNaN(reading.tekilalaTekefay) ? formatNumber(Number(reading.tekilalaTekefay)) : (reading?.tekilalaTekefay ?? '-')}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>

            {/* Consumption breakdown table */}
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  📊 Consumption Breakdown
                </Typography>
              </Box>
              <Paper
                elevation={2}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2,
                  transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  '&:hover': {
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    borderColor: 'warning.main',
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <Table
                  size="small"
                  sx={{
                    '& tbody tr:nth-of-type(odd)': {
                      backgroundColor: 'rgba(0,0,0,0.02)'
                    },
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                      py: 1.5,
                      fontSize: '1.04rem'
                    },
                    '& .MuiTableHead-root .MuiTableCell-root': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      fontWeight: 600,
                      color: 'text.primary',
                      py: 0.75,
                      pl: 1,
                      pr: 0.5,
                      fontSize: '1.04rem'
                    },
                    '& .MuiTableHead-root .MuiTableCell-root:last-of-type': {
                      pr: 1,
                      fontSize: '1.04rem'
                    }
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Block</TableCell>
                      <TableCell align="right">Consumption</TableCell>
                      <TableCell align="right">Tariff</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {consumption?.length ? (
                      <>
                        {consumption.map((c, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>{c.blockName}</TableCell>
                            <TableCell align="right">{c.consumption}</TableCell>
                            <TableCell align="right">{c.tariff}</TableCell>
                            <TableCell align="right">{c.totalAmount}</TableCell>
                          </TableRow>
                        ))}
                        {/* Summation Row */}
                        <TableRow
                          sx={{
                            borderTop: '2px solid',
                            borderColor: 'warning.main',
                            backgroundColor: 'warning.light',
                            '& .MuiTableCell-root': {
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              color: 'warning.dark',
                              borderBottom: '2px solid',
                              borderColor: 'warning.main'
                            }
                          }}
                        >
                          <TableCell colSpan={2} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              📊 TOTAL
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {consumption.reduce((sum, c) => sum + (Number(c.consumption) || 0), 0)}
                          </TableCell>
                          <TableCell align="right">-</TableCell>
                          <TableCell align="right">
                            {formatNumber(consumption.reduce((sum, c) => sum + (Number(c.totalAmount) || 0), 0))}
                          </TableCell>
                        </TableRow>
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="body2">No consumption items</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: 1.5,
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 2.5,
            py: 0.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DetailLine({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
      <Typography variant="body2" sx={{ minWidth: 160, color: "text.secondary" }}>
        {label}:
      </Typography>
      <Typography variant="body2">{value ?? "-"}</Typography>
    </Box>
  );
}
