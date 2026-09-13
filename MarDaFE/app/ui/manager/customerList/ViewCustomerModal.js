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

  const assignedReaderId = customer?.assignedReaderId;
  const hasAssignedReaderRelation = !!customer?.assignedReader?.fullName || (!!customer?.assignedReader?.firstName);
  const shouldFetchReadersForBranch = open && !isLoading && !!customer?.branchsId && !!assignedReaderId && !hasAssignedReaderRelation;

  const { data: readersForBranch = [], isLoading: isReaderLookupLoading } = useQuery({
    queryKey: ["readers", customer?.branchsId],
    queryFn: () => dropdownService.getReadersByBranch(customer?.branchsId),
    enabled: shouldFetchReadersForBranch,
    staleTime: Infinity,
  });

  const readerFullNameFromRelation = customer?.assignedReader?.fullName
    || [customer?.assignedReader?.firstName, customer?.assignedReader?.midleName, customer?.assignedReader?.lastName]
      .filter(Boolean)
      .join(' ');

  const readerFullNameFromBranchList = (readersForBranch || []).find((r) => String(r.id) === String(assignedReaderId))?.name;

  const readerFullName = readerFullNameFromRelation
    || readerFullNameFromBranchList
    || 'N/A';

  const statusLabel = customer?.completeDeleted === 'deleted'
    ? 'Complete Deleted'
    : customer?.status === 'deleted'
      ? 'Deleted'
      : customer?.status === 'active'
        ? 'Active'
        : customer?.status || 'N/A';

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
              <DetailItem label="ሙሉ ስም (Full Name)" value={customer.fullName} />
              <DetailItem label="Full Name (English)" value={customer.fullNameEng} />
              <DetailItem label="ስልክ ቁጥር (Phone Number)" value={customer.phoneNumber} />
              <DetailItem label="Status" value={statusLabel} />
              <DetailItem label="የደንበኛ ዓይነት (Customer Type)" value={findNameById(customerTypes, customer.customerTypeId)} />
              <DetailItem label="ቀበሌ (Kebele)" value={findNameById(kebeles, customer.addressStreetsId)} />
              <DetailItem label="ከተና (Ketena)" value={isKetenaLookupLoading ? '...' : ketenaName} />
              <DetailItem label="የሂሳብ ቁጥር (Account Number)" value={customer.accountNumber} />
              <DetailItem label="ቅርንጫፍ (Branch)" value={findNameById(branches, customer.branchsId)} />
              <DetailItem label="ላክተኛ መድብ (Assign Reader)" value={isReaderLookupLoading ? '...' : readerFullName} />
              <DetailItem label="ተጨማሪ አድራሻ (Additional Address)" value={customer.addressDescription} />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Meter Information</Typography>
              <DetailItem label="የቆጣሪ ቁጥር (Meter Number)" value={customer.meterNumber} />
              <DetailItem label="የቆጣሪ መጠን (Meter Size)" value={findNameById(meterSizes, customer.meterSizeId)} />
              <DetailItem label="የመጀመሪያ ንባብ (Initial Reading)" value={customer.initialReading} />
              <DetailItem label="ከፍተኛ ፍጆታ (Max Consumption)" value={customer.maxReference} />
              <DetailItem label="የቦታ አቀማመጥ (Location Coordination)" value={customer.locationCoordination} />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Payment Information</Typography>
              <DetailItem label="የደረቅ ቆሻሻ (Dry Waste)" value={customer.additionalMonthlyPayment} />
              <DetailItem label="ቅድመ ክፍያ (Pre Payment)" value={customer.customerBalanceBirr} />
              <DetailItem label="ተጨማሪ ክፍያ ስም (Additional Fee Name)" value={customer.techemariFieldName} />
              <DetailItem label="ተጨማሪ ክፍያ (Additional Fee)" value={customer.techemariKfya} />
              <DetailItem label="የድሮ እዳ አለበት (Has Old Arrears)" value={customer.oldHasPenalty ? 'Yes' : 'No'} />
              {customer.oldHasPenalty && (
                <>
                  <DetailItem label="የድሮ እዳ የወራት ብዛት (Number of Arrears Months)" value={customer.oldPenlityNumberOfMonths} />
                  <DetailItem label="የድሮ እዳ ጠቅላላ ድምር (Total Arrears Amount)" value={customer.oldKfyaAndPenaltyTotal} />
                </>
              )}

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Registration & Status</Typography>
              <DetailItem 
                label="Registered Date (Ethiopian)" 
                value={customer.registeredDateEthiopianAmharic || customer.registeredDateEthiopian || 'N/A'} 
              />
              {customer?.status === 'deleted' && (
                <>
                  <DetailItem 
                    label="Deactivation Date (Ethiopian)" 
                    value={customer.canceledDateEthiopianAmharic || customer.canceledDateEthiopian || 'N/A'} 
                  />
                  <DetailItem 
                    label="Termination Reason" 
                    value={
                      customer?.terminationReason 
                      || customer?.billingTerminationReason?.terminationReason 
                      || customer?.billingTerminationReasonId 
                      || 'N/A'
                    } 
                  />
                  <DetailItem label="Termination Remark" value={customer.terminationRemark} />
                </>
              )}
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
