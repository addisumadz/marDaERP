package com.wbill.home.service;

import com.wbill.home.dto.BillingReadingDTO;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingReadingWuzif;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.model.Branch;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingReadingWuzifRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WuzifService {

    @Autowired
    private BillingReadingWuzifRepository wuzifRepo;

    @Autowired
    private BillingCustomerInfoRepository customerRepo;

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    /**
     * Fetches unpaid Wuzif records for a customer and maps them to
     * BillingReadingDTO.
     */
    public List<BillingReadingDTO> findUnpaidWuzifAsBillingReadingDTO(int customerId) {
        // Find the customer entity first
        BillingCustomerInfo customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + customerId));

        // Use the repository method you provided
        List<BillingReadingWuzif> unpaidWuzifList = wuzifRepo.findUnpaidDeleteAllWuzifForCustomer(customer);
        if (unpaidWuzifList == null || unpaidWuzifList.isEmpty()) {
            return Collections.emptyList();
        }
        // System.out.println("unpaidWuzifList: size " + unpaidWuzifList.size());
        // Map each Wuzif record to a BillingReadingDTO
        return unpaidWuzifList.stream()
                .map(this::mapWuzifToBillingReadingDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to transform a BillingReadingWuzif object into a
     * BillingReadingDTO.
     */
    public List<BillingReadingDTO> getWuzifReportData(int customerId) {
        BillingCustomerInfo customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with ID: " + customerId));
        // User requested to consider only active/unpaid (isMoneyCollected=false,
        // deleted='active')
        List<BillingReadingWuzif> unpaidWuzifList = wuzifRepo.findUnpaidWuzifForCustomer(customer);

        if (unpaidWuzifList == null || unpaidWuzifList.isEmpty()) {
            return Collections.emptyList();
        }

        int wuzifCount = unpaidWuzifList.size();

        // "1 output for a customer" -> We only return one DTO with the count and
        // customer info
        // We use the first record to extract customer details
        BillingReadingWuzif firstWuzif = unpaidWuzifList.get(0);
        BillingReadingDTO summaryDto = mapWuzifToBillingReadingDTO(firstWuzif);

        if (summaryDto != null) {
            summaryDto.setWuzifWorBzat(wuzifCount);
            // "ignore Invoice Number" - we clear it to avoid confusion since this is a
            // summary
            summaryDto.setBillingInvoiceNumber(null);
            // We might want to sum up the financial amounts here if needed,
            // but for now we follow the "1 output" and "count" instruction specifically.
        }

        return Collections.singletonList(summaryDto);
    }

    public List<BillingReadingDTO> getBulkWuzifReportData(List<String> accountNumbers, String kifyaWer) {
        List<BillingReadingDTO> reportList = new java.util.ArrayList<>();
        if (accountNumbers == null || accountNumbers.isEmpty()) {
            return reportList;
        }

        int batchSize = 500;
        for (int i = 0; i < accountNumbers.size(); i += batchSize) {
            int end = Math.min(i + batchSize, accountNumbers.size());
            List<String> batchAccountNumbers = accountNumbers.subList(i, end);

            // 1. Bulk Fetch Customers
            List<BillingCustomerInfo> customers = customerRepo.findByAccountNumberIn(batchAccountNumbers);
            if (customers.isEmpty())
                continue;

            // 2. Bulk Fetch Unpaid Wuzif
            List<BillingReadingWuzif> allWuzif = wuzifRepo.findUnpaidWuzifForCustomers(customers);
            Map<Integer, List<BillingReadingWuzif>> wuzifByCustomer = allWuzif.stream()
                    .collect(Collectors
                            .groupingBy(w -> w.getBillingReadingActualPayment().getBillingCustomerInfo().getId()));

            // 3. Bulk Fetch Current Bills
            List<BillingReading> allBills = billingReadingRepository.findFullReadingsByCustomersAndKifyaWer(customers,
                    kifyaWer);
            Map<Integer, BillingReading> billByCustomer = allBills.stream()
                    .collect(Collectors.toMap(
                            b -> b.getBillingCustomerInfo().getId(),
                            b -> b,
                            (existing, replacement) -> existing));

            for (BillingCustomerInfo customer : customers) {
                // 1. Calculate Wuzif Count (active & unpaid)
                List<BillingReadingWuzif> unpaidWuzifList = wuzifByCustomer.getOrDefault(customer.getId(),
                        Collections.emptyList());
                int wuzifCount = unpaidWuzifList.size();

                // 2. Get Bill
                BillingReading bill = billByCustomer.get(customer.getId());
                BillingReadingDTO dto;

                if (bill != null) {
                    dto = new BillingReadingDTO(
                            bill.getId(),
                            bill.isBillGenerated(),
                            false, // isMoneyCollected
                            bill.getLastReading(),
                            bill.getPreviousReading(),
                            bill.getConsumption(),
                            bill.getKifyaWer(),
                            bill.getAdditionalHisab(),
                            bill.getYezihWerFjotaKfya(),
                            bill.getKotariKiray(),
                            bill.getTechemariKfya(),
                            bill.getYezihWer(),
                            bill.getWuzifHisab(),
                            bill.getWuzifDerekKoshasha(),
                            false, false, false, false, false, false, // Payment flags
                            bill.getTekilalaTekefay(),
                            0.0, 0.0, 0.0, // tekilalaBankYetekefele, tekilalaYetekefele, kecreditYetekefele
                            null, null, // bankPaidAgentId, uBankPaidAgentId
                            bill.getStatus(),
                            bill.getKitat(),
                            bill.getWuzifTechemariKfya(),
                            0, 0.0, 0, // consumptionWuzif(Integer), wuzifKotariKiray(Double), wuzifFjota(Integer)
                            bill.isVoid(),
                            bill.getTemelashBirr(),
                            bill.getWuzifFjotaKfya(),
                            (bill.getBillingInvoiceNumbers() != null
                                    ? bill.getBillingInvoiceNumbers().getInvoiceNumbers()
                                    : null), // Invoice Number
                            (bill.getCashierUser() != null ? bill.getCashierUser().getId() : null), // cashierUserId
                            null, null,
                            customer.getFullName(),
                            customer.getAccountNumber(),
                            (customer.getAddressStreet() != null ? customer.getAddressStreet().getId() : null),
                            (customer.getAddressStreet() != null ? customer.getAddressStreet().getStreetsName() : null),
                            null, null, null, null, null, null,
                            bill.getBillDescriptionBank(),
                            customer.getFullNameEng(),
                            wuzifCount, // OVERRIDE with calculated count
                            (customer.getBillingCustomerType() != null ? customer.getBillingCustomerType().getId()
                                    : null),
                            (customer.getBillingCustomerType() != null
                                    ? customer.getBillingCustomerType().getCustomerType()
                                    : null),
                            customer.getPhoneNumber(),
                            bill.isSendToBank(),
                            bill.isSendToBankUnicash(),
                            bill.isEnableEditMeneshaReading(),
                            customer.getInitialConsumption(),
                            customer.getId(),
                            bill.getZeroReadingWorBzat(),
                            // NEW FIELDS (Pass bill dates if available, or null/defaults)
                            bill.getMoneyCollectedDate(),
                            bill.getuMoneyCollectedDate(),
                            bill.getCollectionDate(),
                            bill.getModifiedDate(),
                            bill.getRegisteredDate(),
                            (bill.getuBillingBank() != null ? bill.getuBillingBank().getBankName() : null),
                            null, null, // code
                            customer.getStatus(), // customerStatus
                            bill.getWuzifKezihEske(), // wuzifKezihEske
                            bill.isJournalPushed(), // isJournalPushed
                            bill.isPaidJournalPushed(), // isPaidJournalPushed
                            // SERVICE CHARGE FIELDS
                            bill.getmBillingAdditionalPayment1Value(),
                            bill.getmBillingAdditionalPayment2Value(),
                            bill.getmBillingAdditionalPayment1Wuzif(),
                            bill.getmBillingAdditionalPayment2Wuzif(),
                            bill.getmBillingAdditionalPayment1ValueLable(),
                            bill.getmBillingAdditionalPayment2ValueLable()
                    );
                } else {
                    dto = new BillingReadingDTO(
                            0, false, false, 0, 0, 0, kifyaWer, 0.0, 0.0, 0.0, 0.0, 0.0,
                            // Important: WuzifHisab might be sum of unpaid wuzifs?
                            0.0, 0.0, false, false, false, false, false, false, 0.0, 0.0, 0.0, 0.0, null, null,
                            "No Bill", 0.0, 0.0, 0, 0.0, 0, false, 0.0, 0.0, // wuzifFjota int 0
                            null, null, null, null,
                            customer.getFullName(),
                            customer.getAccountNumber(),
                            (customer.getAddressStreet() != null ? customer.getAddressStreet().getId() : null),
                            (customer.getAddressStreet() != null ? customer.getAddressStreet().getStreetsName() : null),
                            null, null, null, null, null, null,
                            null,
                            customer.getFullNameEng(),
                            wuzifCount, // The important part
                            (customer.getBillingCustomerType() != null ? customer.getBillingCustomerType().getId()
                                    : null),
                            (customer.getBillingCustomerType() != null
                                    ? customer.getBillingCustomerType().getCustomerType()
                                    : null),
                            customer.getPhoneNumber(),
                            false, false, false, customer.getInitialConsumption(), customer.getId(), 0,
                            null, null, null, null, null, null,
                            null, null, // code
                            customer.getStatus(), // customerStatus
                            null, // wuzifKezihEske
                            false, // isJournalPushed
                            false, // isPaidJournalPushed
                            // SERVICE CHARGE FIELDS
                            null, null, null, null, null, null
                    );
                }
                dto.setBillingInvoiceNumber(null);
                reportList.add(dto);
            }
        }
        return reportList;
    }

    /**
     * Helper method to transform a BillingReadingWuzif object into a
     * BillingReadingDTO.
     * This makes the Wuzif data compatible with your existing bill table on the
     * frontend.
     */
    private BillingReadingDTO mapWuzifToBillingReadingDTO(BillingReadingWuzif wuzif) {
        // The actual bill details are in the 'billingReadingActualPayment' relation
        BillingReading actualBill = wuzif.getBillingReadingActualPayment();
        if (actualBill == null)
            return null; // Safety check
        Boolean isKitatTenestual = wuzif.getIsKitatTenestual();
        double ketatTenestual = (isKitatTenestual != null && isKitatTenestual) ? 1 : 0;

        Boolean paymentStatus = wuzif.getIsMoneyCollected();
        int paymentStatusint = (paymentStatus != null && paymentStatus) ? 1 : 0;

        String kitatstatus = wuzif.getDeleted();
        double kitatstatusint = (kitatstatus != null && kitatstatus.equals("active")) ? 1 : 0;

        // Derive customer kebele info from the customer's address street (null-safe)
        AddressStreets street = null;
        Integer customerKebeleId = null;
        String customerKebele = null;
        if (actualBill.getBillingCustomerInfo() != null) {
            street = actualBill.getBillingCustomerInfo().getAddressStreet();
            if (street != null) {
                customerKebeleId = street.getId();
                customerKebele = street.getStreetsName();
            }
        }

        // Derive ketena, branch, and assigned reader IDs (null-safe)
        Integer addressKetenaId = null;
        Integer branchsId = null;
        Integer assignedReaderId = null;
        String ketenaName = null;
        String branchDescription = null;
        String assignedReaderName = null;
        BillingCustomerInfo bci = actualBill.getBillingCustomerInfo();
        if (bci != null) {
            AddressKetena ketena = bci.getAddressKetena();
            if (ketena != null) {
                addressKetenaId = ketena.getId();
                ketenaName = ketena.getKetenaName();
            }
            Branch branch = bci.getBranch();
            if (branch != null) {
                branchsId = branch.getId();
                branchDescription = branch.getBranchDescription();
            }
            UserAccount reader = bci.getUserAccount();
            if (reader != null) {
                assignedReaderId = reader.getId();
                assignedReaderName = reader.getUserName();
            }
        }

        // Use the constructor of your BillingReadingDTO
        BillingReadingDTO dto = new BillingReadingDTO(
                actualBill.getId(),
                actualBill.isBillGenerated(),
                false, // It's a Wuzif, so money is not collected
                actualBill.getLastReading(),
                actualBill.getPreviousReading(),
                actualBill.getConsumption(),
                actualBill.getKifyaWer(),
                actualBill.getAdditionalHisab(),
                actualBill.getYezihWerFjotaKfya(),
                actualBill.getKotariKiray(),
                actualBill.getTechemariKfya(),
                actualBill.getYezihWer(),
                actualBill.getWuzifHisab(),
                actualBill.getWuzifDerekKoshasha(),
                false, // Payment flags are false
                false,
                false,
                false,
                false,
                false,
                actualBill.getTekilalaTekefay(),
                0, // No money paid via bank for this specific wuzif record
                0,
                0,
                null, // No agent IDs for unpaid bills
                null,
                actualBill.getStatus(),
                actualBill.getKitat(),
                actualBill.getWuzifTechemariKfya(),
                paymentStatusint,
                ketatTenestual,
                (int) actualBill.getWuzifFjota(), // Cast double to int if needed, or if getWuzifFjota was updated in
                                                  // BillingReading to return int, just use directly.
                                                  // Assuming BillingReading still returns double for now (unless user
                                                  // updated it too, but DTO expects int).
                                                  // Let's assume Entity field is also 'int' or we cast.
                actualBill.isVoid(),
                actualBill.getTemelashBirr(),
                actualBill.getWuzifFjotaKfya(),
                // Relational fields
                actualBill.getBillingInvoiceNumbers() != null
                        ? actualBill.getBillingInvoiceNumbers().getInvoiceNumbers()
                        : null,
                (actualBill.getCashierUser() != null ? actualBill.getCashierUser().getId() : null), // cashierUserId
                null, // No cashier name for an unpaid bill
                null, // No bank for an unpaid bill
                // Customer Info
                actualBill.getBillingCustomerInfo().getFullName(),
                actualBill.getBillingCustomerInfo().getAccountNumber(),
                // New kebele fields
                customerKebeleId,
                customerKebele,
                // New filter-aligned IDs
                addressKetenaId,
                branchsId,
                assignedReaderId,
                // Readable names
                ketenaName,
                branchDescription,
                assignedReaderName,
                // NEW: appended fields to match DTO changes
                actualBill.getBillDescriptionBank(),
                (actualBill.getBillingCustomerInfo() != null ? actualBill.getBillingCustomerInfo().getFullNameEng()
                        : null),
                actualBill.getWuzifWorBzat(),
                (actualBill.getBillingCustomerInfo() != null
                        && actualBill.getBillingCustomerInfo().getBillingCustomerType() != null
                                ? actualBill.getBillingCustomerInfo().getBillingCustomerType().getId()
                                : null),
                (actualBill.getBillingCustomerInfo() != null
                        && actualBill.getBillingCustomerInfo().getBillingCustomerType() != null
                                ? actualBill.getBillingCustomerInfo().getBillingCustomerType().getCustomerType()
                                : null),
                (actualBill.getBillingCustomerInfo() != null
                        ? actualBill.getBillingCustomerInfo().getPhoneNumber()
                        : null),
                actualBill.isSendToBank(),
                actualBill.isSendToBankUnicash(),
                actualBill.isEnableEditMeneshaReading(),
                (actualBill.getBillingCustomerInfo() != null
                        ? actualBill.getBillingCustomerInfo().getInitialConsumption()
                        : null),
                (actualBill.getBillingCustomerInfo() != null
                        ? actualBill.getBillingCustomerInfo().getId()
                        : null),
                actualBill.getZeroReadingWorBzat(),
                // NEW FIELDS for Cashier Page - not critical for Wuzif but must match
                // constructor
                actualBill.getMoneyCollectedDate(),
                actualBill.getuMoneyCollectedDate(),
                actualBill.getCollectionDate(),
                actualBill.getModifiedDate(),
                actualBill.getRegisteredDate(),
                (actualBill.getuBillingBank() != null ? actualBill.getuBillingBank().getBankName() : null),
                null, null, // code
                (actualBill.getBillingCustomerInfo() != null ? actualBill.getBillingCustomerInfo().getStatus() : null), // customerStatus
                actualBill.getWuzifKezihEske(), // wuzifKezihEske
                actualBill.isJournalPushed(), // isJournalPushed
                actualBill.isPaidJournalPushed(), // isPaidJournalPushed
                // SERVICE CHARGE FIELDS
                actualBill.getmBillingAdditionalPayment1Value(),
                actualBill.getmBillingAdditionalPayment2Value(),
                actualBill.getmBillingAdditionalPayment1Wuzif(),
                actualBill.getmBillingAdditionalPayment2Wuzif(),
                actualBill.getmBillingAdditionalPayment1ValueLable(),
                actualBill.getmBillingAdditionalPayment2ValueLable()
        );

        // Populate Wuzif-specific flags added to DTO to avoid breaking other usages
        dto.setWuzifDeleted(wuzif.getDeleted());
        dto.setWuzifIsKitatTenestual(wuzif.getIsKitatTenestual());
        dto.setWuzifIsMoneyCollected(wuzif.getIsMoneyCollected());

        return dto;
    }

    // ===================== Update actions =====================
    @Transactional
    public int updateWuzifFlagsForReading(Integer readingId, String deleted, Boolean isKitatTenestual) {
        BillingReading reading = billingReadingRepository.findById(readingId)
                .orElseThrow(() -> new EntityNotFoundException("Reading not found with id: " + readingId));
        List<BillingReadingWuzif> list = wuzifRepo.findByBillingReadingActualPaymentAll(reading);
        if (list == null || list.isEmpty())
            return 0;
        int count = 0;
        for (BillingReadingWuzif w : list) {
            if (deleted != null) {
                w.setDeleted(deleted);
            }
            if (isKitatTenestual != null) {
                w.setIsKitatTenestual(isKitatTenestual);
            }
            wuzifRepo.save(w);
            count++;
        }
        return count;
    }

    // 1. Remove wuzif: deleted = "deleted", isKitatTenestual = true
    @Transactional
    public int removeWuzif(Integer readingId) {
        return updateWuzifFlagsForReading(readingId, "deleted", true);
    }

    // 2. Return wuzif: deleted = "active", isKitatTenestual = false
    @Transactional
    public int returnWuzif(Integer readingId) {
        return updateWuzifFlagsForReading(readingId, "active", false);
    }

    // 3. Remove kitate: per user correction, isKitatTenestual = true
    @Transactional
    public int removeKitate(Integer readingId) {
        return updateWuzifFlagsForReading(readingId, null, true);
    }

    // 4. Return kitate: isKitatTenestual = false
    @Transactional
    public int returnKitate(Integer readingId) {
        return updateWuzifFlagsForReading(readingId, null, false);
    }

    /**
     * Find unpaid wuzif records by customer account number
     */
    public List<BillingReadingWuzif> findUnpaidWuzifByAccountNumber(String accountNumber) {
        Optional<BillingCustomerInfo> customerOpt = customerRepo.findByAccountNumber(accountNumber);
        if (customerOpt.isEmpty()) {
            return Collections.emptyList();
        }
        return wuzifRepo.findUnpaidDeleteAllWuzifForCustomer(customerOpt.get());
    }

    /**
     * Mark unpaid wuzif bills as paid when a bill is paid
     * Updates: deleted, billingReadingPenalized, isMoneyCollected
     */
    @Transactional
    public int markUnpaidWuzifAsPaid(String accountNumber, Integer paidBillId) {
        List<BillingReadingWuzif> unpaidWuzifList = findUnpaidWuzifByAccountNumber(accountNumber);
        if (unpaidWuzifList.isEmpty()) {
            return 0;
        }

        // Get the paid bill entity
        BillingReading paidBill = billingReadingRepository.findById(paidBillId)
                .orElseThrow(() -> new EntityNotFoundException("Paid bill not found with id: " + paidBillId));

        int updatedCount = 0;
        for (BillingReadingWuzif wuzif : unpaidWuzifList) {
            // Update the wuzif record
            wuzif.setDeleted("deleted"); // Mark as deleted (paid)
            wuzif.setBillingReadingPenalized(paidBill); // Set the bill that paid this wuzif
            wuzif.setIsMoneyCollected(true); // Mark as money collected

            wuzifRepo.save(wuzif);
            updatedCount++;
        }

        return updatedCount;
    }

    /**
     * Transfers the given totalKitat amount from current bills to the customer's
     * old arrears
     * and marks all active unpaid wuzif records as kitat transferred
     * (isKitatTenestual = true).
     *
     * Business rules for BillingCustomerInfo:
     * - If oldHasPenalty == true and oldIfPenaltyPaid == false:
     * oldPenlityNumberOfMonths = 0
     * oldKfyaAndPenaltyTotal = oldKfyaAndPenaltyTotal + totalKitat
     * oldMonthsList = "Old Kitate"
     * - Else:
     * oldPenlityNumberOfMonths = 0
     * oldKfyaAndPenaltyTotal = totalKitat
     * oldMonthsList = "Old Kitate"
     * - In both cases:
     * oldHasPenalty = true
     * oldIfPenaltyPaid = false
     *
     * Wuzif rules:
     * - For all active unpaid wuzif records (status='active', deleted='active',
     * isMoneyCollected=false)
     * mark isKitatTenestual = true.
     */
    @Transactional
    public int transferKitatToOldArrears(String accountNumber, double totalKitat) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Account number is required");
        }
        if (totalKitat <= 0) {
            throw new IllegalArgumentException("Total kitat must be greater than zero");
        }

        BillingCustomerInfo customer = customerRepo.findByAccountNumber(accountNumber.trim())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Customer not found with account number: " + accountNumber));

        if (customer.getOldHasPenalty() && !customer.getOldIfPenaltyPaid()) {
            customer.setOldKfyaAndPenaltyTotal(customer.getOldKfyaAndPenaltyTotal() + totalKitat);
        } else {
            customer.setOldKfyaAndPenaltyTotal(totalKitat);
        }
        customer.setOldPenlityNumberOfMonths(0);
        customer.setOldMonthsList("Old Kitate");
        customer.setOldHasPenalty(true);
        customer.setOldIfPenaltyPaid(false);
        customerRepo.save(customer);

        List<BillingReadingWuzif> unpaidWuzifList = wuzifRepo.findUnpaidWuzifForCustomer(customer);
        int updatedCount = 0;
        if (unpaidWuzifList != null && !unpaidWuzifList.isEmpty()) {
            for (BillingReadingWuzif wuzif : unpaidWuzifList) {
                if (!wuzif.getIsKitatTenestual()) {
                    wuzif.setIsKitatTenestual(true);
                    wuzifRepo.save(wuzif);
                    updatedCount++;
                }
            }
        }

        return updatedCount;
    }
}