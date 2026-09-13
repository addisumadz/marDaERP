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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DropdownService } from "../../../lib/dropdownService";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
// Lookup data is provided by parent page to avoid duplicate fetching

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      py: 1.5,
      borderBottom: "1px solid #eee",
    }}
  >
    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
      {label}:
    </Typography>
    <Typography variant="body1" align="right">
      {value || "—"}
    </Typography>
  </Box>
);

const ViewCustomerModal = ({ customer, open, onClose, isLoading, lookupData = {} }) => {
  const { customerTypes, meterSizes, kebeles, branches } = lookupData || {};
  const dropdownService = useMemo(() => new DropdownService(), []);

  const findNameById = (list, id) => {
    if (!list) return '...';
    const item = (list || []).find((i) => String(i.id) === String(id));
    return item?.name || item?.sizeName || 'N/A';
  };

  // Resolve Ketena name: prefer populated relation; otherwise fetch by kebele and map ketenaId
  const kebeleId = customer?.addressStreetsId;
  const ketenaId = customer?.addressKetenaId;
  const hasKetenaRelation = !!customer?.addressKetena?.name;
  const shouldFetchKetenas = open && !isLoading && !hasKetenaRelation && !!kebeleId && !!ketenaId;

  const { data: ketenasForKebele = [], isLoading: isKetenaLookupLoading } = useQuery({
    queryKey: ["ketenas", kebeleId],
    queryFn: () => dropdownService.getKetenasByKebele(kebeleId),
    enabled: shouldFetchKetenas,
    staleTime: Infinity,
  });

  const ketenaName = hasKetenaRelation
    ? customer.addressKetena.name
    : shouldFetchKetenas
      ? ((ketenasForKebele || []).find(k => String(k.id) === String(ketenaId))?.name || 'N/A')
      : 'N/A';

  // Resolve Assigned Reader name: prefer populated relation; otherwise fetch user by ID
  const assignedReaderId = customer?.assignedReaderId;
  const hasAssignedReaderRelation = !!customer?.assignedReader?.fullName || (!!customer?.assignedReader?.firstName);
  const shouldFetchReader = open && !isLoading && !!assignedReaderId && !hasAssignedReaderRelation;

  const { data: readerUser, isLoading: isReaderLookupLoading } = useQuery({
    queryKey: ["user", assignedReaderId],
    queryFn: () => dropdownService.getUserById(assignedReaderId),
    enabled: shouldFetchReader,
    staleTime: Infinity,
  });

  const readerFullNameFromRelation = customer?.assignedReader?.fullName
    || [customer?.assignedReader?.firstName, customer?.assignedReader?.midleName, customer?.assignedReader?.lastName]
      .filter(Boolean)
      .join(' ');

  const readerFullName = readerFullNameFromRelation
    || (readerUser ? [readerUser.firstName, readerUser.midleName, readerUser.lastName].filter(Boolean).join(' ') : null)
    || 'N/A';

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Customer Details
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : !customer ? (
          <Typography>No customer data available.</Typography>
        ) : (
          <Grid container spacing={4}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Basic Information</Typography>
              <DetailItem label="Full Name" value={customer.fullName} />
              <DetailItem label="Full Name (English)" value={customer.fullNameEng} />
              <DetailItem label="Phone Number" value={customer.phoneNumber} />
              <DetailItem label="National ID Number" value={customer.nationalIdNumber} />
              <DetailItem label="Customer Type" value={findNameById(customerTypes, customer.customerTypeId)} />
              <DetailItem label="Kebele" value={findNameById(kebeles, customer.addressStreetsId)} />
              <DetailItem label="Ketena" value={isKetenaLookupLoading ? '...' : ketenaName} />
              <DetailItem label="Account Number" value={customer.accountNumber} />
              <DetailItem label="House Number" value={customer.houseNumber} />
              <DetailItem label="Branch" value={findNameById(branches, customer.branchsId)} />
              <DetailItem label="Assigned Reader" value={isReaderLookupLoading ? '...' : readerFullName} />
              <DetailItem label="Additional Address" value={customer.addressDescription} />
              <DetailItem label="Status" value={customer.status} />
              <DetailItem label="Customer Balance (Birr)" value={customer.customerBalanceBirr} />
              <DetailItem label="Count Number" value={customer.countNumber} />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Meter Information</Typography>
              <DetailItem label="Meter Number" value={customer.meterNumber} />
              <DetailItem label="Meter Size" value={findNameById(meterSizes, customer.meterSizeId)} />
              <DetailItem label="Initial Reading" value={customer.initialReading} />
              <DetailItem label="Initial Consumption" value={customer.initialConsumption} />
              <DetailItem label="Max Consumption" value={customer.maxReference} />
              <DetailItem label="Location Coordination" value={customer.locationCoordination} />
              <DetailItem label="Meter Life Start" value={customer.meterLifeStart} />
              <DetailItem label="Meter Life Limit" value={customer.meterLifeLimit} />
              <DetailItem label="Is Initialized" value={customer.isInitialized ? 'Yes' : 'No'} />
              <DetailItem label="Is Initialized Second Time" value={customer.isInitializedSecondTime ? 'Yes' : 'No'} />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Payment Information</Typography>
              <DetailItem label="Prepaid Birr Balance" value={customer.prepaidBirrCurrentBalance} />
              <DetailItem label="Dry Waste" value={customer.additionalMonthlyPayment} />
              <DetailItem label="Pre Payment" value={customer.tekemachKfya} />
              <DetailItem label="Additional Fee Name" value={customer.techemariFieldName} />
              <DetailItem label="Additional Fee" value={customer.techemariKfya} />
              <DetailItem label="Has Old Arrears" value={customer.oldHasPenalty ? 'Yes' : 'No'} />
              <DetailItem label="Old Penalty Paid" value={customer.oldIfPenaltyPaid ? 'Yes' : 'No'} />
              {customer.oldHasPenalty && (
                <>
                  <DetailItem label="Number of Arrears Months" value={customer.oldPenlityNumberOfMonths} />
                  <DetailItem label="Arrears Months List" value={customer.oldMonthsList} />
                  <DetailItem label="Total Arrears Amount" value={customer.oldKfyaAndPenaltyTotal} />
                  <DetailItem label="Old Kfya Each Month" value={customer.oldKfyaEachMonth} />
                </>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Registration & Status</Typography>
              <DetailItem 
                label="Registered Date (Ethiopian)" 
                value={customer.registeredDate ? 
                  EthiopianCalendarConverterPure.formatEthiopianDate(
                    EthiopianCalendarConverterPure.gregorianToEthiopian(customer.registeredDate), 
                    'dd/mm/yyyy'
                  ) : 
                  'N/A'
                } 
              />
              <DetailItem label="Registered Year" value={customer.registeredYear} />
              <DetailItem label="Registered Month" value={customer.registeredMonth} />
              <DetailItem label="Was Canceled" value={customer.wasCanceled ? 'Yes' : 'No'} />
              {customer.wasCanceled && (
                <>
                  <DetailItem label="Canceled Date" value={customer.canceledDate} />
                  <DetailItem label="Canceled Year" value={customer.canceledYear} />
                  <DetailItem label="Canceled Month" value={customer.canceledMonth} />
                  <DetailItem label="Canceled Activated Date" value={customer.canceledActivatedDate} />
                </>
              )}
              <DetailItem label="Termination Remark" value={customer.terminationRemark} />
              <DetailItem label="QR Code" value={customer.qrCode} />
              <DetailItem label="Just Return From Penalty" value={customer.isJustReturnFromPenality ? 'Yes' : 'No'} />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewCustomerModal;
