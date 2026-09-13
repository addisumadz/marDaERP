package com.wbill.home.service;

import com.wbill.home.dto.BillingCustomerInfoDTO;
import com.wbill.home.dto.CustomerDeactivateDTO;
import com.wbill.home.dto.CustomerListDTO;
import com.wbill.home.dto.MeterCreateUpdateDTO;
import com.wbill.home.dto.PreviousReadingDTO;
import com.wbill.home.mapper.CustomerMapper;
import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import com.wbill.home.util.EthiopianCalendarUtil; // Assuming you have this utility
import org.apache.poi.EncryptedDocumentException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional // Ensures all database operations in a method succeed or fail together
public class BillingCustomerInfoService {

    // All repositories are declared final and injected via the constructor
    private final BillingCustomerInfoRepository billingCustomerInfoRepository;
    private final BillingReadingRepository billingReadingRepository;
    private final UserAccountRepository userAccountRepository;
    private final BillingMeterSizeRepository billingMeterSizeRepository;
    private final BillingCustomerTypeRepository billingCustomerTypeRepository;
    private final BranchRepository branchRepository;
    private final AddressStreetsRepository kebeleRepository;
    private final AddressKetenaRepository addressKetenaRepository;
    private final BillingCustomerInfoMeterRepository billingCustomerInfoMeterRepository;
    private final CompanyProfileRepository companyProfileRepository;
    // private final BillingTerminationReasonRepository terminationReasonRepository;
    private BillingTerminationReasonRepository billingTerminationReasonRepository;

    // A single constructor for all dependencies (Spring Best Practice)
    public BillingCustomerInfoService(BillingCustomerInfoRepository billingCustomerInfoRepository,
            BillingReadingRepository billingReadingRepository,
            UserAccountRepository userAccountRepository,
            BillingMeterSizeRepository billingMeterSizeRepository,
            BillingCustomerTypeRepository billingCustomerTypeRepository,
            BranchRepository branchRepository,
            AddressStreetsRepository kebeleRepository,
            AddressKetenaRepository addressKetenaRepository,
            BillingCustomerInfoMeterRepository billingCustomerInfoMeterRepository,
            CompanyProfileRepository companyProfileRepository,
            BillingTerminationReasonRepository terminationReasonRepository) {
        this.billingCustomerInfoRepository = billingCustomerInfoRepository;
        this.billingReadingRepository = billingReadingRepository;
        this.userAccountRepository = userAccountRepository;
        this.billingMeterSizeRepository = billingMeterSizeRepository;
        this.billingCustomerTypeRepository = billingCustomerTypeRepository;
        this.branchRepository = branchRepository;
        this.kebeleRepository = kebeleRepository;
        this.addressKetenaRepository = addressKetenaRepository;
        this.billingCustomerInfoMeterRepository = billingCustomerInfoMeterRepository;
        this.companyProfileRepository = companyProfileRepository;
        this.billingTerminationReasonRepository = terminationReasonRepository;
    }

    // === Bulk assign reader ===
    public void assignReaderToCustomers(Integer readerId, List<Integer> customerIds) {
        if (readerId == null || customerIds == null || customerIds.isEmpty())
            return;
        UserAccount reader = userAccountRepository.findById(readerId)
                .orElseThrow(() -> new EntityNotFoundException("UserAccount (reader) not found: " + readerId));
        List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findAllById(customerIds);
        for (BillingCustomerInfo c : customers) {
            c.setUserAccount(reader);
        }
        billingCustomerInfoRepository.saveAll(customers);
    }

    /**
     * Fetches customers for the current user and maps them to
     * BillingCustomerInfoDTOs.
     *
     * Rules:
     * - Cashier: only customers from their own branch, unless branch description is
     * "Main Office" (then all branches).
     * - FNC: same rule as Cashier (own branch only, except "Main Office" can see
     * all).
     * - All other roles: all customers.
     */
    public List<BillingCustomerInfoDTO> getAllCustomers() {
        UserAccount currentUser = getCurrentUser();

        String roleCode = null;
        if (currentUser.getUserRole() != null && currentUser.getUserRole().getRoleCode() != null) {
            roleCode = currentUser.getUserRole().getRoleCode().trim();
        }

        Branch userBranch = currentUser.getBranch();
        Integer branchId = (userBranch != null ? userBranch.getId() : null);
        String branchDescription = (userBranch != null ? userBranch.getBranchDescription() : null);

        List<BillingCustomerInfo> customers;

        // Branch-scoped roles: Cashier and FNC
        if ("Cashier".equals(roleCode) || "FNC".equals(roleCode)) {
            boolean isMainOffice = branchDescription != null
                    && branchDescription.trim().equalsIgnoreCase("Main Office");

            if (isMainOffice || branchId == null) {
                // Main Office (or no branch assigned): can see all branches
                customers = billingCustomerInfoRepository.findAllByOrderByIdAsc();
            } else {
                // Regular branch: restrict to that branch
                customers = billingCustomerInfoRepository.findByBranch_IdOrderByIdAsc(branchId);
            }
        } else {
            // Other roles (e.g., billzgjt, systemadmin, mobileanbabi, etc.) can see all
            customers = billingCustomerInfoRepository.findAllByOrderByIdAsc();
        }

        return customers.stream()
                .map(CustomerMapper::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Creates a new customer and their initial meter record from a DTO.
     */
    public BillingCustomerInfo createCustomer(BillingCustomerInfoDTO dto) {
        // 1. Perform uniqueness checks
        if (billingCustomerInfoRepository.existsByAccountNumber(dto.getAccountNumber())) {
            throw new IllegalArgumentException("Account Number " + dto.getAccountNumber() + " already exists.");
        }
        if (billingCustomerInfoRepository.existsByMeterNumber(dto.getMeterNumber())) {
            throw new IllegalArgumentException("Meter Number " + dto.getMeterNumber() + " already exists.");
        }

        // 2. Create and map the main customer entity
        BillingCustomerInfo newCustomer = new BillingCustomerInfo();
        mapDtoToEntity(dto, newCustomer);
        newCustomer.setRegisteredDate(new Date());
        newCustomer.setStatus("active");
        // Set Ethiopian registration year and month (billing-safe: skip Pagume)
        int[] ethYm = EthiopianCalendarUtil.getEthiopianYearMonthForBilling(LocalDate.now());
        newCustomer.setRegisteredYear(ethYm[0]);
        newCustomer.setRegisteredMonth(ethYm[1]);

        // 3. Save the customer FIRST to get a generated ID
        BillingCustomerInfo savedCustomer = billingCustomerInfoRepository.save(newCustomer);

        // 4. *** NEW: Create and save the associated meter record ***
        createAndSaveMeterForCustomer(dto, savedCustomer);

        return savedCustomer;
    }

    /**
     * Private helper to create and save a new meter record for a customer.
     */
    private void createAndSaveMeterForCustomer(BillingCustomerInfoDTO dto, BillingCustomerInfo customer) {
        // System.out.println("mr 1");

        BillingCustomerInfoMeter newMeter = new BillingCustomerInfoMeter();

        // Link to the parent customer
        newMeter.setBillingCustomerInfo(customer);

        // Set simple fields from the DTO
        newMeter.setMeterNumber(dto.getMeterNumber());
        newMeter.setInitialReading((int) dto.getInitialReading()); // Cast double to int
        newMeter.setMaxReference(dto.getMaxReference());

        // Set default/system-generated values
        newMeter.setActiveMeter(true);
        newMeter.setDeleted("active");
        newMeter.setRegisteredDate(new Date());

        // Fetch and set the Meter Size entity
        if (dto.getMeterSizeId() != null) {
            BillingMeterSize meterSize = billingMeterSizeRepository.findById(dto.getMeterSizeId())
                    .orElseThrow(() -> new EntityNotFoundException("Invalid Meter Size ID: " + dto.getMeterSizeId()));
            newMeter.setBillingMeterSize(meterSize);
        }

        // Fetch and set the currently logged-in user
        newMeter.setUserAccount(getCurrentUser());

        // Save the new meter record to the database
        billingCustomerInfoMeterRepository.save(newMeter);
        deactivateOtherMeters(customer.getId(), newMeter.getId());
    }

    /**
     * Helper method to get the currently logged-in user entity from Spring Security
     * context.
     */
    private UserAccount getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userAccountRepository.findByUserName(username)
                .orElseThrow(() -> new EntityNotFoundException("Logged in user not found in database: " + username));
    }

    /**
     * Updates an existing customer record from a DTO.
     */
    public BillingCustomerInfo updateCustomer(Integer id, BillingCustomerInfoDTO dto) {
        BillingCustomerInfo existingCustomer = billingCustomerInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        // You might need to add uniqueness checks here as well, excluding the current
        // customer

        mapDtoToEntity(dto, existingCustomer);
        return billingCustomerInfoRepository.save(existingCustomer);
    }

    public void updateAdditionalMonthlyPaymentForCustomers(double amount, List<Integer> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) {
            return;
        }
        List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findAllById(customerIds);
        for (BillingCustomerInfo customer : customers) {
            customer.setAdditionalMonthlyPayment(amount);
        }
        billingCustomerInfoRepository.saveAll(customers);
    }

    public void updateTechemariForCustomers(String fieldName, Double amount, List<Integer> customerIds) {
        if (customerIds == null || customerIds.isEmpty()) {
            return;
        }

        // Handle fieldName: if empty/blank, treat as NULL
        String finalFieldName = (fieldName != null && !fieldName.trim().isEmpty()) ? fieldName : null;
        // Amount: if null, treat as 0.0 or keep as is? User said enable 0. Let's assume
        // passed amount is what we set.
        // If amount is null, we shouldn't update? Or set to 0? Safety check:
        double finalAmount = (amount != null) ? amount : 0.0;

        List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findAllById(customerIds);
        for (BillingCustomerInfo customer : customers) {
            customer.setTechemariFieldName(finalFieldName);
            customer.setTechemariKfya(finalAmount);
        }
        billingCustomerInfoRepository.saveAll(customers);
    }

    /**
     * Bulk update locationCoordination (GPS) for multiple customers.
     * Each entry contains a customerId and the new locationCoordination value.
     */
    public void updateLocationCoordinationBulk(List<com.wbill.home.dto.GpsUpdateDTO.GpsUpdateEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            return;
        }
        List<Integer> customerIds = entries.stream()
                .map(com.wbill.home.dto.GpsUpdateDTO.GpsUpdateEntry::getCustomerId)
                .collect(Collectors.toList());
        List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findAllById(customerIds);

        // Build a map for quick lookup: customerId -> new locationCoordination
        java.util.Map<Integer, String> gpsMap = new java.util.HashMap<>();
        for (com.wbill.home.dto.GpsUpdateDTO.GpsUpdateEntry entry : entries) {
            gpsMap.put(entry.getCustomerId(), entry.getLocationCoordination());
        }

        List<BillingCustomerInfo> toUpdate = new java.util.ArrayList<>();
        for (BillingCustomerInfo customer : customers) {
            String newGps = gpsMap.get(customer.getId());
            if (newGps != null) {
                String oldGps = customer.getLocationCoordination();
                
                boolean isDifferent = false;
                if (oldGps == null) {
                    isDifferent = true;
                } else {
                    String cleanOld = oldGps.trim();
                    String cleanNew = newGps.trim();
                    
                    // Treat blank, "null" (case-insensitive), or dash as empty
                    boolean oldIsEmpty = cleanOld.isEmpty() || cleanOld.equalsIgnoreCase("null") || cleanOld.equals("-");
                    boolean newIsEmpty = cleanNew.isEmpty() || cleanNew.equalsIgnoreCase("null") || cleanNew.equals("-");
                    
                    if (oldIsEmpty != newIsEmpty) {
                        isDifferent = true; // One is empty, one is not
                    } else if (!oldIsEmpty && !cleanOld.equals(cleanNew)) {
                        isDifferent = true; // Both are populated but they differ
                    }
                }
                
                if (isDifferent) {
                    customer.setLocationCoordination(newGps);
                    toUpdate.add(customer);
                }
            }
        }

        if (!toUpdate.isEmpty()) {
            billingCustomerInfoRepository.saveAll(toUpdate);
        }
    }

    // ... all other existing methods (deactivateCustomer, mapDtoToEntity, import,
    // etc.) remain the same ...
    // The code for those methods is omitted here for brevity but should be kept in
    // your file.

    public String generateNextAccountNumber(Integer kebeleId) {
        // Safely handle the case where no customers exist for the kebele
        Long max = billingCustomerInfoRepository.findMaxAccountNumberByKebeleNative(kebeleId);
        if (max == null) {
            max = 0L;
        }
        return String.valueOf(max + 1);
    }

    private void mapDtoToEntity(BillingCustomerInfoDTO dto, BillingCustomerInfo entity) {

        boolean isActive = true;
        Boolean isdisabled = false;
        // Basic Customer Info
        entity.setFullName(dto.getFullName());
        entity.setFullNameEng(dto.getFullNameEng());
        entity.setPhoneNumber(dto.getPhoneNumber());
        entity.setNationalIdNumber(dto.getNationalIdNumber());
        entity.setAccountNumber(dto.getAccountNumber());
        entity.setHouseNumber(dto.getHouseNumber());
        entity.setMeterNumber(dto.getMeterNumber());
        entity.setStatus(dto.getStatus());
        entity.setCountNumber(dto.getCountNumber());

        // Financial & Meter Information
        entity.setCustomerBalanceBirr(dto.getCustomerBalanceBirr());
        entity.setInitialReading(dto.getInitialReading());
        entity.setInitialConsumption(5);
        entity.setMaxReference(dto.getMaxReference());
        entity.setAdditionalMonthlyPayment(dto.getAdditionalMonthlyPayment());
        entity.setTekemachKfya(dto.getTekemachKfya());
        entity.setTechemariKfya(dto.getTechemariKfya());
        entity.setPrepaidBirrCurrentBalance(dto.getPrepaidBirrCurrentBalance());
        entity.setTechemariFieldName(dto.getTechemariFieldName());

        // Arrears Information
        entity.setOldHasPenalty(dto.isOldHasPenalty());
        entity.setOldIfPenaltyPaid(dto.isOldIfPenaltyPaid());
        entity.setOldPenlityNumberOfMonths(dto.getOldPenlityNumberOfMonths());
        entity.setOldMonthsList(dto.getOldMonthsList());
        entity.setOldKfyaAndPenaltyTotal(dto.getOldKfyaAndPenaltyTotal());
        entity.setOldKfyaEachMonth(dto.getOldKfyaEachMonth());

        // Address & Locality Information (fetching and setting nested entities)
        entity.setAddressDescription(dto.getAddressDescription());
        entity.setCityId(dto.getCityId());
        entity.setZoneId(dto.getZoneId());

        // Use null checks before fetching related entities
        if (dto.getAddressStreetsId() != null) {
            AddressStreets street = kebeleRepository.findById(dto.getAddressStreetsId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid street ID"));
            entity.setAddressStreet(street);
        }
        if (dto.getAddressKetenaId() != null) {
            AddressKetena ketena = addressKetenaRepository.findById(dto.getAddressKetenaId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid ketena ID"));
            entity.setAddressKetena(ketena);
        }
        if (dto.getBranchsId() != null) {
            Branch branch = branchRepository.findById(dto.getBranchsId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid branch ID"));
            entity.setBranch(branch);
        }

        // Document & Photo Information
        entity.setCustomerPhoto(dto.getCustomerPhoto());
        entity.setMetawokiaScanned(dto.getMetawokiaScanned());
        entity.setQrCode(dto.getQrCode());

        // Meter & Water Service Type Information
        if (dto.getCustomerTypeId() != null) {
            BillingCustomerType customerType = billingCustomerTypeRepository.findById(dto.getCustomerTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid customer type ID"));
            entity.setBillingCustomerType(customerType);
        }
        if (dto.getMeterSizeId() != null) {
            BillingMeterSize meterSize = billingMeterSizeRepository.findById(dto.getMeterSizeId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid meter size ID"));
            entity.setBillingMeterSize(meterSize);
        }
        if (dto.getBillingMeterTypeId() != null) {
            // BillingMeterType meterType =
            // meterTypeRepository.findById(dto.getBillingMeterTypeId())
            // .orElseThrow(() -> new IllegalArgumentException("Invalid meter type ID"));
            // entity.setBillingMeterType(meterType);
        }
        if (dto.getBillingModeOfWaterServiceId() != null) {
            // BillingModeOfWaterService mode =
            // modeRepository.findById(dto.getBillingModeOfWaterServiceId())
            // .orElseThrow(() -> new IllegalArgumentException("Invalid mode of water
            // service ID"));
            // entity.setBillingModeOfWaterService(mode);
        }

        // Other Associations
        if (dto.getAssignedReaderId() != null) {
            UserAccount user = userAccountRepository.findById(dto.getAssignedReaderId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid user ID"));
            entity.setUserAccount(user);
        }
        if (dto.getBillingCustomerInfoMeterId() != null) {
            BillingCustomerInfoMeter infoMeter = billingCustomerInfoMeterRepository
                    .findById(dto.getBillingCustomerInfoMeterId())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid billing customer info meter ID"));
            entity.setBillingCustomerInfoMeter(infoMeter);
        }
        if (dto.getBillingTerminationReasonId() != null) {
            // BillingTerminationReason reason =
            // reasonRepository.findById(dto.getBillingTerminationReasonId())
            // .orElseThrow(() -> new IllegalArgumentException("Invalid termination reason
            // ID"));
            // entity.setBillingTerminationReason(reason);
        }

        // Date and Flags
        entity.setMeterLifeStart(dto.getMeterLifeStart());
        entity.setMeterLifeLimit(dto.getMeterLifeLimit());
        entity.setIsInitialized(isActive);
        entity.setIsInitializedSecondTime(dto.isIsInitializedSecondTime());
        entity.setRegisteredDate(dto.getRegisteredDate());
        entity.setRegisteredYear(dto.getRegisteredYear());
        entity.setRegisteredMonth(dto.getRegisteredMonth());
        entity.setCanceledDate(dto.getCanceledDate());
        entity.setCanceledYear(dto.getCanceledYear());
        entity.setCanceledMonth(dto.getCanceledMonth());
        entity.setWasCanceled(dto.isWasCanceled());
        entity.setIsJustReturnFromPenality(dto.isIsJustReturnFromPenality());
        entity.setCanceledActivatedDate(dto.getCanceledActivatedDate());
        entity.setCompleteDeleted(dto.getCompleteDeleted());
        entity.setCompleteDeletedDate(dto.getCompleteDeletedDate());

        // Additional Fields
        entity.setTerminationRemark(dto.getTerminationRemark());
        entity.setLocationCoordination(dto.getLocationCoordination());
        entity.setKdmeKfyaReasons(dto.getKdmeKfyaReasons());

    }

    @Transactional
    public void importCustomersFromExcel(InputStream excelFileStream) throws IOException {
        Workbook workbook;
        try {
            workbook = WorkbookFactory.create(excelFileStream);
            Sheet sheet = workbook.getSheetAt(0);

            Iterator<Row> rowIterator = sheet.iterator();
            if (rowIterator.hasNext()) {
                rowIterator.next();
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                // Use a helper to avoid errors on blank cells
                CellHelper cellHelper = new CellHelper(row);

                BillingCustomerInfo customer = new BillingCustomerInfo();

                customer.setFullName(cellHelper.getStringValue(0)); // Column A
                customer.setAccountNumber(cellHelper.getStringValue(1)); // Column B
                customer.setPhoneNumber(cellHelper.getStringValue(2)); // Column C
                customer.setMeterNumber(cellHelper.getStringValue(3)); // Column D
                customer.setInitialReading(cellHelper.getDoubleValue(4)); // Column E
                customer.setRegisteredDate(new Date()); // Set current date
                customer.setStatus("active");
                // Set Ethiopian registration year and month for imports (billing-safe)
                int[] ethYmImport = EthiopianCalendarUtil.getEthiopianYearMonthForBilling(LocalDate.now());
                customer.setRegisteredYear(ethYmImport[0]);
                customer.setRegisteredMonth(ethYmImport[1]);

                // ... map other columns to fields as needed
                // Example for relations:
                // String ketenaName = cellHelper.getStringValue(5);
                // AddressKetena ketena = ketenaRepository.findByName(ketenaName).orElse(null);
                // customer.setAddressKetena(ketena);

                billingCustomerInfoRepository.save(customer);
            }
            workbook.close();
        } catch (EncryptedDocumentException | java.io.IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    // Inner or separate helper class for safe cell reading
    private static class CellHelper {
        private final Row row;
        private final DataFormatter dataFormatter = new DataFormatter();

        public CellHelper(Row row) {
            this.row = row;
        }

        public String getStringValue(int cellNum) {
            Cell cell = row.getCell(cellNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            return (cell == null) ? null : dataFormatter.formatCellValue(cell).trim();
        }

        public double getDoubleValue(int cellNum) {
            String val = getStringValue(cellNum);
            return (val == null || val.isEmpty()) ? 0.0 : Double.parseDouble(val);
        }
    }

    public void deactivateCustomer(Integer id) {
        BillingCustomerInfo customerToDeactivate = billingCustomerInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        customerToDeactivate.setStatus("deactivated");
        customerToDeactivate.setCanceledDate(new Date()); // Set the deactivation date

        billingCustomerInfoRepository.save(customerToDeactivate);
    }

    public Optional<BillingCustomerInfoDTO> findById(Integer id) {
        // 1. Fetch the entity from the repository
        // 2. Map the entity to a DTO using our mapper
        return billingCustomerInfoRepository.findById(id)
                .map(CustomerMapper::toDto);
    }

    /**
     * Find a customer by account number and return as DTO.
     */
    public Optional<BillingCustomerInfoDTO> findByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.trim().isEmpty())
            return Optional.empty();
        return billingCustomerInfoRepository.findByAccountNumber(accountNumber.trim())
                .map(CustomerMapper::toDto);
    }

    // Change the return type here
    public List<CustomerListDTO> getCustomersWithoutReading(String kifyaWer) {
        return billingCustomerInfoRepository.findActiveCustomersWithoutReadingForMonth(kifyaWer);
    }

    public Page<CustomerListDTO> findByStatusPaginated(String status, Pageable pageable) {
        return billingCustomerInfoRepository.findByStatusAsDTO(status, pageable);
    }

    public Page<CustomerListDTO> findFilteredByStatus(String status, Integer customerTypeId, Integer kebeleId, Integer ketenaId, Integer branchId, Integer readerId, String search, Pageable pageable) {
        String normalizedSearch = (search == null || search.trim().isEmpty()) ? null : search.trim();
        return billingCustomerInfoRepository.findFilteredByStatus(status, customerTypeId, kebeleId, ketenaId, branchId, readerId, normalizedSearch, pageable);
    }


    /**
     * Finds the last reading of a customer from the month prior to the given
     * kifyaWer.
     *
     * @param accountNumber         The customer's account number.
     * @param currentKifyaWerString The current billing period string.
     * @return A DTO containing the previous reading. Defaults to 0 if not found.
     */
    public PreviousReadingDTO getPreviousReadingForCustomer(String accountNumber, String currentKifyaWerString) {
        Integer previousReadingValue = 0;
        // 1. Find the customer by account number
        BillingCustomerInfo customer = billingCustomerInfoRepository.findByAccountNumber(accountNumber)
                .orElseThrow(
                        () -> new EntityNotFoundException("Customer not found with account number: " + accountNumber));

        // 2. Calculate the previous kifya Wer name
        String previousKifyaWerString = EthiopianCalendarUtil.getPreviousKifyaWer(currentKifyaWerString);

        // ** 3. Get the initial reading from that meter
        if (customer.getIsInitializedSecondTime()) {

            Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                    .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(customer,
                            "active");

            if (latestActiveMeterOpt.isPresent()) {
                previousReadingValue = latestActiveMeterOpt.get().getInitialReading();
                System.out.println("PR from New Meter" + previousReadingValue);

            } else {
                // Fallback or error if no active meter is found for the customer
                throw new EntityNotFoundException("No active meter found for customer id: " + accountNumber);
            }
        }

        // ** check previous month
        else {

            System.out.println("2nd option starting ");

            // Step 1: Try to find the reading for the IMMEDIATE previous month.
            BillingReading prevFullReading = billingReadingRepository
                    .findTopByCustomerIdAndKifyaWerOrderByIdDesc(customer.getId(), previousKifyaWerString);
            Optional<BillingReading> prevFullReadingOpt = Optional.ofNullable(prevFullReading);
            if (prevFullReadingOpt.isPresent()) {
                BillingReading readPrev = prevFullReadingOpt.get();
                previousReadingValue = readPrev.getLastReading();
                System.out.println("PR from immediate  privious month " + previousReadingValue);

            } else {
                System.out.println("3rd option starting ");
                // Step 2: Not found. Fall back to finding the ABSOLUTE LATEST reading,
                // regardless of month.
                Optional<BillingReading> absoluteLatestReadingOpt = billingReadingRepository
                        .findFirstByBillingCustomerInfoOrderByRegisteredDateDesc(customer);
                System.out.println("2rd check  option starting " + absoluteLatestReadingOpt.isPresent());
                if (absoluteLatestReadingOpt.isPresent()) {
                    // Success: Found a reading from a month before last.

                    BillingReading readPrev = absoluteLatestReadingOpt.get();
                    previousReadingValue = readPrev.getLastReading();
                    System.out.println("PR from top  privious month " + previousReadingValue);

                    // return absoluteLatestReadingOpt.get().getLastReading();
                } else {
                    // *** Final Fallback: No previous readings exist at all. Use the customer's
                    // initial reading value.

                    Optional<BillingCustomerInfoMeter> latestActiveMeterOpt = billingCustomerInfoMeterRepository
                            .findFirstByBillingCustomerInfoAndActiveMeterIsTrueAndDeletedOrderByRegisteredDateDesc(
                                    customer, "active");

                    if (latestActiveMeterOpt.isPresent()) {
                        previousReadingValue = latestActiveMeterOpt.get().getInitialReading();
                    } else {
                        // Fallback or error if no active meter is found for the customer
                        throw new EntityNotFoundException("No active meter found for customer id: " + accountNumber);
                    }

                }
            }

        }

        return new PreviousReadingDTO(previousReadingValue);
    }

    // public String generateNextAccountNumber(Integer kebeleId) {
    // // Find the max account number for the given kebele
    // // Long maxAccountNumber =
    // billingCustomerInfoRepository.findMaxAccountNumberByKebele(kebeleId).orElse(0L);
    // //return String.valueOf(maxAccountNumber + 1);
    //
    // Long max =
    // billingCustomerInfoRepository.findMaxAccountNumberByKebeleNative(kebeleId);
    // if (max == null) max = 0L;
    // return String.valueOf(max + 1);
    //
    // }

    // ============================metere no
    // =========================================

    // @Transactional(readOnly = true)
    public List<MeterCreateUpdateDTO> getMetersByCustomer(Integer customerId) {
        return billingCustomerInfoMeterRepository.findByBillingCustomerInfo_Id(customerId)
                .stream().map(this::toDTO).toList();
    }

    // public MeterCreateUpdateDTO createMeter(Integer customerId,
    // MeterCreateUpdateDTO dto) {
    // BillingCustomerInfo customer =
    // billingCustomerInfoRepository.findById(customerId)
    // .orElseThrow(() -> new IllegalArgumentException("Customer not found: " +
    // customerId));
    //
    // BillingCustomerInfoMeter m = new BillingCustomerInfoMeter();
    // m.setBillingCustomerInfo(customer);
    // applyDtoToEntity(dto, m);
    // m.setRegisteredDate(new Date());
    // m.setUserAccount(getCurrentUser());
    // return toDTO(billingCustomerInfoMeterRepository.save(m));
    // }

    // public MeterCreateUpdateDTO updateMeter(Integer meterId, MeterCreateUpdateDTO
    // dto) {
    // BillingCustomerInfoMeter m =
    // billingCustomerInfoMeterRepository.findById(meterId)
    // .orElseThrow(() -> new IllegalArgumentException("Meter not found: " +
    // meterId));
    // applyDtoToEntity(dto, m);
    // return toDTO(billingCustomerInfoMeterRepository.save(m));
    // }
    /**
     * Creates a new meter for a customer. If the new meter is active,
     * it deactivates all other meters for that same customer.
     */
    public MeterCreateUpdateDTO createMeter(Integer customerId, MeterCreateUpdateDTO dto) {
        BillingCustomerInfo customer = billingCustomerInfoRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + customerId));

        BillingCustomerInfoMeter newMeter = new BillingCustomerInfoMeter();
        newMeter.setBillingCustomerInfo(customer);
        applyDtoToEntity(dto, newMeter); // Assuming this sets activeMeter status from DTO
        newMeter.setRegisteredDate(new Date());
        newMeter.setUserAccount(getCurrentUser());

        BillingCustomerInfoMeter savedMeter = billingCustomerInfoMeterRepository.save(newMeter);

        // ✅ If the newly created meter is active, deactivate all others for this
        // customer.
        if (savedMeter.isActiveMeter()) {
            deactivateOtherMeters(customerId, savedMeter.getId());
            customer.setIsInitializedSecondTime(true);
        }

        return toDTO(savedMeter);
    }

    /**
     * Updates an existing meter. If its status is changed to active,
     * it deactivates all other meters for that same customer.
     */
    public MeterCreateUpdateDTO updateMeter(Integer meterId, MeterCreateUpdateDTO dto) {
        BillingCustomerInfoMeter existingMeter = billingCustomerInfoMeterRepository.findById(meterId)
                .orElseThrow(() -> new IllegalArgumentException("Meter not found: " + meterId));

        // Get customer ID before making changes
        Integer customerId = existingMeter.getBillingCustomerInfo().getId();

        applyDtoToEntity(dto, existingMeter);

        // ✅ If the meter is being updated to be active, deactivate all others.
        if (existingMeter.isActiveMeter()) {
            deactivateOtherMeters(customerId, existingMeter.getId());
        }

        BillingCustomerInfoMeter updatedMeter = billingCustomerInfoMeterRepository.save(existingMeter);
        return toDTO(updatedMeter);
    }

    /**
     * Helper method to deactivate all other active meters for a customer.
     *
     * @param customerId          The ID of the customer.
     * @param meterIdToKeepActive The ID of the single meter that should remain
     *                            active.
     */
    private void deactivateOtherMeters(Integer customerId, Integer meterIdToKeepActive) {
        List<BillingCustomerInfoMeter> metersToDeactivate = billingCustomerInfoMeterRepository
                .findOtherActiveMeters(customerId, meterIdToKeepActive);

        for (BillingCustomerInfoMeter meter : metersToDeactivate) {
            meter.setActiveMeter(false);
        }

        // The changes will be saved automatically when the @Transactional method
        // completes.
        if (!metersToDeactivate.isEmpty()) {
            billingCustomerInfoMeterRepository.saveAll(metersToDeactivate);
        }
    }

    public void deleteMeter(Integer meterId) {
        if (!billingCustomerInfoMeterRepository.existsById(meterId)) {
            return;
        }
        billingCustomerInfoMeterRepository.deleteById(meterId);
    }

    private void applyDtoToEntity(MeterCreateUpdateDTO dto, BillingCustomerInfoMeter m) {
        m.setMeterNumber(dto.getMeterNumber());
        m.setActiveMeter(Boolean.TRUE.equals(dto.getActiveMeter()));
        m.setInitialReading(dto.getInitialReading() == null ? 0 : dto.getInitialReading());
        m.setMaxReference(dto.getMaxReference() == null ? 0 : dto.getMaxReference());
        m.setDeleted("active");
        if (dto.getMeterSizeId() != null) {
            BillingMeterSize size = billingMeterSizeRepository.findById(dto.getMeterSizeId())
                    .orElseThrow(() -> new IllegalArgumentException("MeterSize not found: " + dto.getMeterSizeId()));
            m.setBillingMeterSize(size);
        } else {
            m.setBillingMeterSize(null);
        }
    }

    private MeterCreateUpdateDTO toDTO(BillingCustomerInfoMeter m) {
        MeterCreateUpdateDTO dto = new MeterCreateUpdateDTO();
        dto.setId(m.getId());
        dto.setMeterNumber(m.getMeterNumber());
        dto.setActiveMeter(m.isActiveMeter());
        dto.setInitialReading(m.getInitialReading());
        dto.setMaxReference(m.getMaxReference());
        dto.setRegisteredDate(m.getRegisteredDate());
        if (m.getBillingMeterType() != null) {
            dto.setBillingMeterTypeId(m.getBillingMeterType().getId());
            dto.setBillingMeterTypeName(m.getBillingMeterType().getMeterTypeName());
        }
        if (m.getBillingMeterSize() != null) {
            dto.setMeterSizeId(m.getBillingMeterSize().getId());
            // dto.setMeterSizeId(m.getBillingMeterSize().getMeterSize());
        }
        return dto;
    }
    // ================================================================================

    /**
     * Activates a customer by changing their status.
     * This is the reverse of the deactivateCustomer method.
     */
    public void activateCustomer(Integer id) {
        // Find the existing customer or throw an error if not found
        BillingCustomerInfo customerToActivate = billingCustomerInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        // Update the status and relevant fields
        customerToActivate.setStatus("active");
        customerToActivate.setCanceledDate(null); // Clear the deactivation date
        customerToActivate.setBillingTerminationReason(null); // Clear the termination reason
        customerToActivate.setCanceledActivatedDate(new Date()); // Record the activation date

        billingCustomerInfoRepository.save(customerToActivate);
    }

    /**
     * Marks a customer as completely deleted.
     * Sets completeDeleted to "deleted" and completeDeletedDate to the current
     * date.
     */
    public void completeDeleteCustomer(Integer id) {
        BillingCustomerInfo customer = billingCustomerInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        customer.setCompleteDeleted("deleted");
        customer.setCompleteDeletedDate(new Date());

        billingCustomerInfoRepository.save(customer);
    }

    /**
     * Deactivates a customer by updating their status and recording the termination
     * details.
     *
     * @param id  The ID of the customer to deactivate.
     * @param dto The DTO containing deactivation details.
     */
    public void deactivateCustomer(Integer id, CustomerDeactivateDTO dto) {
        // 1. Find the customer to be deactivated.
        BillingCustomerInfo customerToDeactivate = billingCustomerInfoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found with id: " + id));

        // 2. Find the termination reason entity using the ID from the DTO.
        BillingTerminationReason reason = billingTerminationReasonRepository
                .findById(dto.getBillingTerminationReasonId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Termination reason not found with id: " + dto.getBillingTerminationReasonId()));
        // 3. Update the customer's fields based on the DTO and system requirements.
        customerToDeactivate.setStatus("deleted"); // Should be "deleted"
        customerToDeactivate.setTerminationRemark(dto.getTerminationRemark());
        customerToDeactivate.setBillingTerminationReason(reason); // Set the full reason object
        customerToDeactivate.setCanceledDate(new Date()); // Set the cancellation date to now

        // 4. Save the updated customer record.
        billingCustomerInfoRepository.save(customerToDeactivate);
    }

    /**
     * Update customer penalty status when old penalty is paid
     * If customer has oldIfPenaltyPaid=false and oldHasPenalty=true,
     * update to oldIfPenaltyPaid=true and oldHasPenalty=false
     */
    @Transactional
    public boolean updateCustomerPenaltyStatus(String accountNumber) {
        Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository.findByAccountNumber(accountNumber);
        if (customerOpt.isEmpty()) {
            return false;
        }

        BillingCustomerInfo customer = customerOpt.get();

        // Check if customer has old penalty that needs to be marked as paid
        // Logic: oldIfPenaltyPaid=false (not paid yet) and oldHasPenalty=true (has
        // penalty)
        if (!customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            customer.setOldIfPenaltyPaid(true); // Mark penalty as paid
            customer.setOldHasPenalty(false); // Mark penalty as resolved
            billingCustomerInfoRepository.save(customer);
            return true;
        }

        return false;
    }

    /**
     * Mark a bill as having old penalty paid in this month
     * Sets isOldPenalityPaidInThisMonth=true for the specified bill
     */
    @Transactional
    public boolean markBillAsOldPenaltyPaid(Integer billId) {
        Optional<BillingReading> billOpt = billingReadingRepository.findById(billId);
        if (billOpt.isEmpty()) {
            return false;
        }

        BillingReading bill = billOpt.get();
        bill.setOldPenalityPaidInThisMonth(true);
        billingReadingRepository.save(bill);
        return true;
    }

    /**
     * Complete penalty payment process for a customer
     * This method combines all penalty-related updates when a bill is paid
     */
    @Transactional
    public void processPenaltyPayment(String accountNumber, Integer paidBillId) {
        Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository.findByAccountNumber(accountNumber);
        if (customerOpt.isEmpty()) {
            return;
        }

        BillingCustomerInfo customer = customerOpt.get();

        // Check if customer has old penalty that should be processed
        // Logic: oldIfPenaltyPaid=false (not paid yet) and oldHasPenalty=true (has
        // penalty)
        if (!customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            // Update customer penalty status
            updateCustomerPenaltyStatus(accountNumber);

            // Mark the paid bill as having old penalty paid
            markBillAsOldPenaltyPaid(paidBillId);
        }
    }
}