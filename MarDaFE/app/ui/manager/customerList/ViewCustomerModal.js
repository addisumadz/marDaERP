"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Button,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SpeedIcon from "@mui/icons-material/Speed";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DropdownService } from "../../../lib/dropdownService";

const StatWidget = ({ title, value, unit = "ETB", color = "primary.main", icon: Icon }) => (
  <Paper
    elevation={1}
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      border: "1px solid",
      borderColor: "divider",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flex: "1 1 180px",
    }}
  >
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, color, mt: 0.5 }}>
        {Number(value || 0).toLocaleString()} {unit}
      </Typography>
    </Box>
    {Icon && (
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon sx={{ color, fontSize: 28 }} />
      </Box>
    )}
  </Paper>
);

const DetailRow = ({ label, value, isLink = false, linkHref = "" }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.75,
      borderBottom: "1px dashed",
      borderColor: "divider",
    }}
  >
    <Typography variant="body2" color="text.secondary">
      {label}:
    </Typography>
    {isLink && linkHref ? (
      <Button
        size="small"
        href={linkHref}
        target="_blank"
        rel="noopener noreferrer"
        endIcon={<OpenInNewIcon fontSize="small" />}
        sx={{ textTransform: "none", py: 0, minHeight: 0, fontWeight: 600 }}
      >
        {value}
      </Button>
    ) : (
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "right" }}>
        {value || "—"}
      </Typography>
    )}
  </Box>
);

const ViewCustomerModal = ({
  customer,
  open,
  onClose,
  onEdit,
  onOpenMeters,
  isLoading,
  lookupData = {},
}) => {
  const { customerTypes, meterSizes, kebeles, branches } = lookupData || {};
  const dropdownService = useMemo(() => new DropdownService(), []);

  const findNameById = (list, id) => {
    if (!list) return "...";
    const item = (list || []).find((i) => String(i.id) === String(id));
    return item?.name || item?.sizeName || "N/A";
  };

  const kebeleId = customer?.addressStreetsId;
  const ketenaId = customer?.addressKetenaId;
  const hasKetenaRelation = Boolean(customer?.addressKetena?.name);
  const shouldFetchKetenas = open && !isLoading && !hasKetenaRelation && Boolean(kebeleId) && Boolean(ketenaId);

  const { data: ketenasForKebele = [], isLoading: isKetenaLookupLoading } = useQuery({
    queryKey: ["ketenas", kebeleId],
    queryFn: () => dropdownService.getKetenasByKebele(kebeleId),
    enabled: shouldFetchKetenas,
    staleTime: Infinity,
  });

  const ketenaName = hasKetenaRelation
    ? customer.addressKetena.name
    : shouldFetchKetenas
    ? (ketenasForKebele || []).find((k) => String(k.id) === String(ketenaId))?.name || "N/A"
    : "N/A";

  const assignedReaderId = customer?.assignedReaderId;
  const hasAssignedReaderRelation =
    Boolean(customer?.assignedReader?.fullName) || Boolean(customer?.assignedReader?.firstName);
  const shouldFetchReadersForBranch =
    open && !isLoading && Boolean(customer?.branchsId) && Boolean(assignedReaderId) && !hasAssignedReaderRelation;

  const { data: readersForBranch = [], isLoading: isReaderLookupLoading } = useQuery({
    queryKey: ["readers", customer?.branchsId],
    queryFn: () => dropdownService.getReadersByBranch(customer?.branchsId),
    enabled: shouldFetchReadersForBranch,
    staleTime: Infinity,
  });

  const readerFullNameFromRelation =
    customer?.assignedReader?.fullName ||
    [
      customer?.assignedReader?.firstName,
      customer?.assignedReader?.midleName,
      customer?.assignedReader?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

  const readerFullNameFromBranchList = (readersForBranch || []).find(
    (r) => String(r.id) === String(assignedReaderId)
  )?.name;

  const readerFullName =
    readerFullNameFromRelation || readerFullNameFromBranchList || "Unassigned";

  const isDeleted = customer?.status === "deleted";
  const isCompleteDeleted = customer?.completeDeleted === "deleted";

  const statusColor = isCompleteDeleted ? "default" : isDeleted ? "error" : "success";
  const statusText = isCompleteDeleted
    ? "Complete Deleted"
    : isDeleted
    ? "Deactivated / Terminated"
    : "Active Consumer";

  // GPS link
  const gpsCoords = (customer?.locationCoordination || "").trim();
  const isValidGps = gpsCoords && gpsCoords !== "-" && gpsCoords.toLowerCase() !== "null";
  const googleMapsUrl = isValidGps ? `https://www.google.com/maps?q=${encodeURIComponent(gpsCoords)}` : null;

  const getInitials = (name) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`;
    return parts[0][0];
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ p: 0 }}>
        {/* Pro Hero Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderTopLeftRadius: "inherit",
            borderTopRightRadius: "inherit",
            background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: "white",
                color: "primary.main",
                fontWeight: 800,
                fontSize: "1.5rem",
                boxShadow: 3,
              }}
            >
              {getInitials(customer?.fullName || customer?.fullNameEng)}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {customer?.fullName || "Consumer Details"}
              </Typography>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mt: 0.25 }}>
                {customer?.fullNameEng || ""}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, alignItems: "center" }}>
                <Chip
                  label={`Acc: ${customer?.accountNumber || "—"}`}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", fontWeight: 700 }}
                />
                <Chip
                  label={statusText}
                  size="small"
                  sx={{
                    bgcolor: isDeleted ? "#f44336" : "#4caf50",
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Tooltip title="Print Customer Card">
              <IconButton
                size="small"
                onClick={() => window.print()}
                sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}
              >
                <PrintIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 6 }}>
            <CircularProgress />
          </Box>
        ) : !customer ? (
          <Typography color="text.secondary" align="center" my={4}>
            No consumer profile data available.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Financial Stat Widgets */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <StatWidget
                title="Prepaid Deposit"
                value={customer.customerBalanceBirr || customer.prepaidBirrCurrentBalance}
                color="success.main"
                icon={AccountBalanceWalletIcon}
              />
              <StatWidget
                title="Monthly Dry Waste"
                value={customer.additionalMonthlyPayment}
                color="warning.main"
                icon={CleaningServicesIcon}
              />
              <StatWidget
                title="Additional Fee"
                value={customer.techemariKfya}
                color="info.main"
                icon={PaymentsIcon}
              />
              <StatWidget
                title="Historical Arrears"
                value={customer.oldKfyaAndPenaltyTotal}
                color="error.main"
                icon={WarningAmberIcon}
              />
            </Box>

            {/* Detailed Cards Grid */}
            <Grid container spacing={3}>
              {/* Personal & Household Details */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Personal & Household Details
                  </Typography>
                  <DetailRow label="Phone Number" value={customer.phoneNumber} />
                  <DetailRow label="National / Fayda ID" value={customer.nationalIdNumber} />
                  <DetailRow label="Customer Tariff Type" value={findNameById(customerTypes, customer.customerTypeId)} />
                  <DetailRow label="House Number" value={customer.houseNumber} />
                  <DetailRow label="Kebele" value={findNameById(kebeles, customer.addressStreetsId)} />
                  <DetailRow label="Ketena" value={isKetenaLookupLoading ? "..." : ketenaName} />
                  <DetailRow label="Branch" value={findNameById(branches, customer.branchsId)} />
                  <DetailRow label="Assigned Reader" value={isReaderLookupLoading ? "..." : readerFullName} />
                  <DetailRow
                    label="GPS Coordinates"
                    value={isValidGps ? gpsCoords : "Not recorded"}
                    isLink={Boolean(googleMapsUrl)}
                    linkHref={googleMapsUrl}
                  />
                  <DetailRow label="Address Description" value={customer.addressDescription} />
                </Paper>
              </Grid>

              {/* Meter & Lifecycle Audit */}
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Meter Technical Specifications
                  </Typography>
                  <DetailRow label="Meter Serial Number" value={customer.meterNumber} />
                  <DetailRow label="Meter Caliber / Size" value={findNameById(meterSizes, customer.meterSizeId)} />
                  <DetailRow label="Initial Index Reading" value={customer.initialReading} />
                  <DetailRow label="Max Monthly Cap" value={customer.maxReference} />
                  <DetailRow
                    label="Meter Replacement Status"
                    value={customer.isInitializedSecondTime ? "Replaced (2nd Init)" : "Original Meter"}
                  />

                  <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mt: 2.5, mb: 1.5 }}>
                    Registration & Status Timeline
                  </Typography>
                  <DetailRow
                    label="Registration Date (EC)"
                    value={customer.registeredDateEthiopianAmharic || customer.registeredDateEthiopian || "—"}
                  />
                  <DetailRow
                    label="Registration Date (GC)"
                    value={customer.registeredDate ? new Date(customer.registeredDate).toLocaleDateString() : "—"}
                  />

                  {isDeleted && (
                    <>
                      <DetailRow
                        label="Deactivation Date (EC)"
                        value={customer.canceledDateEthiopianAmharic || customer.canceledDateEthiopian || "—"}
                      />
                      <DetailRow
                        label="Termination Reason"
                        value={
                          customer?.terminationReason ||
                          customer?.billingTerminationReason?.terminationReason ||
                          "Unspecified"
                        }
                      />
                      <DetailRow label="Termination Remark" value={customer.terminationRemark} />
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: "divider", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", gap: 1 }}>
          {onOpenMeters && customer && (
            <Button
              size="small"
              variant="outlined"
              color="info"
              startIcon={<SpeedIcon />}
              onClick={() => {
                onClose();
                onOpenMeters(customer.id);
              }}
            >
              Meters
            </Button>
          )}
          {onEdit && customer && (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => {
                onClose();
                onEdit(customer.id);
              }}
            >
              Edit Profile
            </Button>
          )}
        </Box>

        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCustomerModal;
