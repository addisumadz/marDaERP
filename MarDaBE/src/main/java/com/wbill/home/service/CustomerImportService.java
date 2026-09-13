package com.wbill.home.service;

import com.wbill.home.dto.CustomerImportReport;
import com.wbill.home.dto.SkippedRowInfo;
import com.wbill.home.model.*;
import com.wbill.home.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerImportService {

    // Inject all necessary repositories using constructor injection
    private final BillingCustomerInfoRepository customerRepo;
    private final BillingCustomerInfoMeterRepository meterRepo;
    private final BillingCustomerTypeRepository customerTypeRepo;
    private final BillingMeterSizeRepository meterSizeRepo;
    private final BranchRepository branchRepo;
    private final AddressStreetsRepository kebeleRepo;
    private final AddressKetenaRepository ketenaRepo;
    private final UserAccountRepository userRepo; // Needed for meter creation

    public CustomerImportService(BillingCustomerInfoRepository customerRepo,
            BillingCustomerInfoMeterRepository meterRepo,
            BillingCustomerTypeRepository customerTypeRepo,
            BillingMeterSizeRepository meterSizeRepo,
            BranchRepository branchRepo,
            AddressStreetsRepository kebeleRepo,
            AddressKetenaRepository ketenaRepo,
            UserAccountRepository userRepo) {
        this.customerRepo = customerRepo;
        this.meterRepo = meterRepo;
        this.customerTypeRepo = customerTypeRepo;
        this.meterSizeRepo = meterSizeRepo;
        this.branchRepo = branchRepo;
        this.kebeleRepo = kebeleRepo;
        this.ketenaRepo = ketenaRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public CustomerImportReport importCustomers(MultipartFile file) {
        CustomerImportReport report = new CustomerImportReport();
        // This temporary list holds customers that pass validation, before they are
        // saved.
        List<BillingCustomerInfo> validatedCustomers = new ArrayList<>();

        // ===================================================================
        // PASS 1: VALIDATE THE ENTIRE FILE WITHOUT SAVING
        // ===================================================================
        try (InputStream is = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip the header row
            }

            while (rowIterator.hasNext()) {
                Row currentRow = rowIterator.next();
                int rowNum = currentRow.getRowNum() + 1;
                CellHelper helper = new CellHelper(currentRow);
                String accountNumber = helper.getStringValue(5);
                String meterNumber = helper.getStringValue(6);

                try {
                    // Rule 4: Uniqueness Checks
                    if (accountNumber.isEmpty()) {
                        throw new IllegalStateException("Account Number is missing.");
                    }
                    if (customerRepo.existsByAccountNumber(accountNumber)) {
                        throw new IllegalStateException("Account Number '" + accountNumber + "' already exists.");
                    }
                    if (meterNumber.isEmpty()) {
                        throw new IllegalStateException("Meter Number is missing.");
                    }
                    if (customerRepo.existsByMeterNumber(meterNumber)) {
                        throw new IllegalStateException("Meter Number '" + meterNumber + "' already exists.");
                    }

                    // Rule 2: Foreign Key Lookups
                    String customerTypeName = helper.getStringValue(3);
                    List<BillingCustomerType> customerTypes = customerTypeRepo.findByExactDescription(customerTypeName);
                    if (customerTypes.isEmpty())
                        throw new IllegalStateException("Customer Type not found: " + customerTypeName);
                    BillingCustomerType customerType = customerTypes.get(0);

                    double meterSizeValue = helper.getDoubleValue(7);
                    List<BillingMeterSize> meterSizes = meterSizeRepo.findByMeterSize(meterSizeValue);
                    if (meterSizes.isEmpty())
                        throw new IllegalStateException("Meter Size not found for value: " + meterSizeValue);
                    BillingMeterSize meterSize = meterSizes.get(0);

                    String branchName = helper.getStringValue(8);
                    List<Branch> branches = branchRepo.findByExactBranchDescription(branchName);
                    if (branches.isEmpty())
                        throw new IllegalStateException("Branch not found: " + branchName);
                    Branch branch = branches.get(0);

                    String kebeleName = helper.getStringValue(9);
                    List<AddressStreets> kebeles = kebeleRepo.findByExactStreetName(kebeleName);
                    if (kebeles.isEmpty())
                        throw new IllegalStateException("Kebele not found: " + kebeleName);
                    AddressStreets kebele = kebeles.get(0);

                    String ketenaName = helper.getStringValue(10);
                    List<AddressKetena> ketenas = ketenaRepo.findByExactKetenaNameAndKebele(ketenaName, kebele.getId());
                    if (ketenas.isEmpty())
                        throw new IllegalStateException(
                                String.format("Ketena '%s' not found in Kebele '%s'", ketenaName, kebeleName));
                    AddressKetena ketena = ketenas.get(0);

                    // If all checks pass, create the entity object and add it to our temporary list
                    BillingCustomerInfo newCustomer = new BillingCustomerInfo();

                    // Populate ALL fields from the Excel row
                    newCustomer.setFullName(helper.getStringValue(1));
                    newCustomer.setFullNameEng(helper.getStringValue(2));
                    newCustomer.setPhoneNumber(helper.getStringValue(4));
                    newCustomer.setAccountNumber(accountNumber);
                    newCustomer.setMeterNumber(meterNumber);
                    newCustomer.setInitialReading(helper.getDoubleValue(11));
                    newCustomer.setStatus(helper.getStringValue(14));
                    newCustomer.setAdditionalMonthlyPayment(helper.getDoubleValue(15));
                    newCustomer.setOldMonthsList(helper.getStringValue(16));
                    newCustomer.setOldPenlityNumberOfMonths(helper.getIntValue(17));
                    newCustomer.setOldKfyaAndPenaltyTotal(helper.getDoubleValue(18));

                    // Set default values and flags
                    newCustomer.setRegisteredDate(new Date());
                    newCustomer.setIsInitialized(true);
                    newCustomer.setIsInitializedSecondTime(false);
                    newCustomer.setCustomerBalanceBirr(0);
                    newCustomer.setInitialConsumption(5); // Default value
                    newCustomer.setMaxReference(10000); // Default value

                    // Handle old penalty flags based on values
                    if (helper.getDoubleValue(17) > 0 || helper.getDoubleValue(18) > 0) {
                        newCustomer.setOldHasPenalty(true);
                        newCustomer.setOldIfPenaltyPaid(false);
                    } else {
                        newCustomer.setOldHasPenalty(false);
                        newCustomer.setOldIfPenaltyPaid(false);
                    }

                    // Rule 3: Merge Coordinates
                    newCustomer.setLocationCoordination(helper.getStringValue(12) + "," + helper.getStringValue(13));

                    // Set Foreign Key objects
                    newCustomer.setBillingCustomerType(customerType);
                    newCustomer.setBillingMeterSize(meterSize);
                    newCustomer.setBranch(branch);
                    newCustomer.setAddressStreet(kebele);
                    newCustomer.setAddressKetena(ketena);

                    // Add the fully prepared, valid customer to the temporary list
                    validatedCustomers.add(newCustomer);

                } catch (Exception e) {
                    // If any error occurs for a row, add it to the report.
                    // We do not save anything yet.
                    report.addSkipped(new SkippedRowInfo(rowNum, accountNumber, e.getMessage()));
                }
            }
        } catch (Exception e) {
            // This catches errors with reading the file itself (e.g., corrupted file)
            throw new RuntimeException("Failed to read or parse Excel file: " + e.getMessage());
        }

        // ===================================================================
        // PASS 2: DECIDE AND SAVE
        // ===================================================================

        // If the report has any skipped rows, it means errors were found.
        // Abort the entire operation and return the report with error details.
        if (report.getSkippedCount() > 0) {
            return report; // Nothing will be saved to the database.
        }

        // If we reach here, the entire file is 100% valid.
        // Now, loop through the validated customers and save everything.
        for (BillingCustomerInfo customer : validatedCustomers) {
            BillingCustomerInfo savedCustomer = customerRepo.save(customer);
            createMeterForCustomer(savedCustomer, customer.getBillingMeterSize());
            report.addSuccess("Account: " + savedCustomer.getAccountNumber() + " - " + savedCustomer.getFullName());
        }

        return report;
    }

    private void createMeterForCustomer(BillingCustomerInfo customer, BillingMeterSize meterSize) {
        BillingCustomerInfoMeter newMeter = new BillingCustomerInfoMeter();
        newMeter.setBillingCustomerInfo(customer);
        newMeter.setMeterNumber(customer.getMeterNumber());
        newMeter.setInitialReading((int) customer.getInitialReading());
        newMeter.setBillingMeterSize(meterSize);
        newMeter.setActiveMeter(true);
        newMeter.setDeleted("active");
        newMeter.setRegisteredDate(new Date());

        // Assuming a default user or system user with ID 1 for import tasks
        UserAccount user = userRepo.findById(1).orElse(null);
        newMeter.setUserAccount(user);

        meterRepo.save(newMeter);
    }

    @Transactional
    public CustomerImportReport updateCustomers(MultipartFile file) {
        CustomerImportReport report = new CustomerImportReport();
        System.out.println("Starting customer update from Excel file: " + file.getOriginalFilename());

        try (InputStream is = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip the header row
            }

            int processedRows = 0;
            while (rowIterator.hasNext()) {
                Row currentRow = rowIterator.next();
                int rowNum = currentRow.getRowNum() + 1;
                CellHelper helper = new CellHelper(currentRow);

                try {
                    // Get account number from column H (index 7)
                    String accountNumber = helper.getStringValue(7);
                    System.out.println("Processing row " + rowNum + " - Account: " + accountNumber);

                    if (accountNumber.isEmpty()) {
                        throw new IllegalStateException("Account Number is missing.");
                    }

                    // Find the customer by account number
                    Optional<BillingCustomerInfo> customerOpt = customerRepo.findByAccountNumber(accountNumber);
                    if (!customerOpt.isPresent()) {
                        throw new IllegalStateException(
                                "Customer with Account Number '" + accountNumber + "' not found.");
                    }

                    BillingCustomerInfo customer = customerOpt.get();

                    // 1. Update initialReading from column O (index 14)
                    double initialReading = helper.getDoubleValue(14);
                    customer.setInitialReading(initialReading);

                    // Update the meter's initial reading as well
                    // Fetch the active meter for this customer
                    List<BillingCustomerInfoMeter> meters = meterRepo
                            .findByBillingCustomerInfoAndActiveMeterTrue(customer);
                    if (!meters.isEmpty()) {
                        BillingCustomerInfoMeter activeMeter = meters.get(0);
                        activeMeter.setInitialReading((int) initialReading);
                        meterRepo.save(activeMeter);
                    }

                    // 2. Check column U (index 20) for penalty amount
                    double penaltyAmount = helper.getDoubleValue(20);

                    if (penaltyAmount > 0) {
                        // 2.2. Set oldHasPenalty=true
                        customer.setOldHasPenalty(true);

                        // 2.3. Set oldMonthsList="የቆየ ውዝፍ"
                        customer.setOldMonthsList("የቆየ ውዝፍ");

                        // 2.4. Set oldKfyaAndPenaltyTotal=column U
                        customer.setOldKfyaAndPenaltyTotal(penaltyAmount);

                        // 2.5. Set oldPenlityNumberOfMonths=column V (index 21)
                        int penaltyMonths = helper.getIntValue(21);
                        customer.setOldPenlityNumberOfMonths(penaltyMonths);
                    }
                    // 3. If column U=0, skip penalty updates (do nothing)

                    // Save the updated customer
                    customerRepo.save(customer);
                    report.addSuccess("Updated Account: " + accountNumber + " - " + customer.getFullName());
                    processedRows++;

                } catch (Exception e) {
                    // If any error occurs for a row, add it to the report
                    String accountNumber = helper.getStringValue(7);
                    System.err.println(
                            "Error processing row " + rowNum + " (Account: " + accountNumber + "): " + e.getMessage());
                    e.printStackTrace();
                    report.addSkipped(new SkippedRowInfo(rowNum, accountNumber, e.getMessage()));
                }
            }

            System.out.println("Completed processing. Rows processed: " + processedRows);
        } catch (Exception e) {
            System.err.println("Fatal error reading Excel file: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to read or parse Excel file: " + e.getMessage());
        }

        System.out.println(
                "Update complete. Success: " + report.getImportedCount() + ", Skipped: " + report.getSkippedCount());
        return report;
    }

    // Helper class for safely reading cell values
    private static class CellHelper {
        private final Row row;
        private final DataFormatter dataFormatter = new DataFormatter();

        public CellHelper(Row row) {
            this.row = row;
        }

        public String getStringValue(int cellNum) {
            Cell cell = row.getCell(cellNum, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            return (cell == null) ? "" : dataFormatter.formatCellValue(cell).trim();
        }

        public double getDoubleValue(int cellNum) {
            String val = getStringValue(cellNum);
            return (val.isEmpty()) ? 0.0 : Double.parseDouble(val);
        }

        public int getIntValue(int cellNum) {
            String val = getStringValue(cellNum);
            return (val.isEmpty()) ? 0 : Integer.parseInt(val);
        }
    }
}