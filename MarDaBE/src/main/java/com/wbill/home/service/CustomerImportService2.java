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
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Service
public class CustomerImportService2 {

    // Inject all necessary repositories using constructor injection
    private final BillingCustomerInfoRepository customerRepo;
    private final BillingCustomerInfoMeterRepository meterRepo;
    private final BillingCustomerTypeRepository customerTypeRepo;
    private final BillingMeterSizeRepository meterSizeRepo;
    private final BranchRepository branchRepo;
    private final AddressStreetsRepository kebeleRepo;
    private final AddressKetenaRepository ketenaRepo;
    private final UserAccountRepository userRepo; // Needed for meter creation

    public CustomerImportService2(BillingCustomerInfoRepository customerRepo,
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
    	  System.out.println("import l 1");
        CustomerImportReport report = new CustomerImportReport();
        try (InputStream is = file.getInputStream()) {
            Workbook workbook = WorkbookFactory.create(is);
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                rowIterator.next(); // Skip Header
            }

            while (rowIterator.hasNext()) {
                Row currentRow = rowIterator.next();
                int rowNum = currentRow.getRowNum() + 1;
                CellHelper helper = new CellHelper(currentRow);
                String accountNumber = helper.getStringValue(5);
                String meterNumber = helper.getStringValue(6);

                try {
                    // Rule 4: Uniqueness Checks
                    if (customerRepo.existsByAccountNumber(accountNumber)) {
                        throw new IllegalStateException("Account Number '" + accountNumber + "' already exists.");
                    }
                    if (customerRepo.existsByMeterNumber(meterNumber)) {
                        throw new IllegalStateException("Meter Number '" + meterNumber + "' already exists.");
                    }

                    
                    String customerTypeName = helper.getStringValue(3);
                    System.out.println("import l 2 "+customerTypeName);
                    List<BillingCustomerType> customerTypes = customerTypeRepo.findByExactDescription(customerTypeName);
                    if (customerTypes.isEmpty()) throw new IllegalStateException("Customer Type not found: " + customerTypeName);
                    if (customerTypes.size() > 1) throw new IllegalStateException("Ambiguous Customer Type: " + customerTypeName);
                    BillingCustomerType customerType = customerTypes.get(0);
                    System.out.println("import  2 2 customerType id "+customerType.getId());
                    System.out.println("import  2 2 customerType CT "+customerType.getCustomerType());

                    double meterSizeValue = helper.getDoubleValue(7);
                    List<BillingMeterSize> meterSizes = meterSizeRepo.findByMeterSize(meterSizeValue);
                    if (meterSizes.isEmpty()) throw new IllegalStateException("Meter Size not found for value: " + meterSizeValue);
                    if (meterSizes.size() > 1) throw new IllegalStateException("Ambiguous Meter Size for value: " + meterSizeValue);
                    BillingMeterSize meterSize = meterSizes.get(0);

                    String branchName = helper.getStringValue(8);
                    List<Branch> branches = branchRepo.findByExactBranchDescription(branchName);
                    if (branches.isEmpty()) throw new IllegalStateException("Branch not found: " + branchName);
                    if (branches.size() > 1) throw new IllegalStateException("Ambiguous Branch: " + branchName);
                    Branch branch = branches.get(0);

                    String kebeleName = helper.getStringValue(9);
                    List<AddressStreets> kebeles = kebeleRepo.findByExactStreetName(kebeleName);
                    if (kebeles.isEmpty()) throw new IllegalStateException("Kebele not found: " + kebeleName);
                    if (kebeles.size() > 1) throw new IllegalStateException("Ambiguous Kebele: " + kebeleName);
                    AddressStreets kebele = kebeles.get(0);
                    
                    
                    String ketenaName = helper.getStringValue(10);
                 // Assuming you've already retrieved the kebele earlier in your code
                 int kebeleId = kebele.getId(); // Get the kebele ID

                 List<AddressKetena> ketenas = ketenaRepo.findByExactKetenaNameAndKebele(ketenaName, kebeleId);

                 if (ketenas.isEmpty()) {
                     throw new IllegalStateException(
                         String.format("Ketena '%s' not found for kebele ID %d", ketenaName, kebeleId)
                     );
                 }
                 if (ketenas.size() > 1) {
                     throw new IllegalStateException(
                         String.format("Ambiguous Ketena: Found %d active ketenas with name '%s' in kebele ID %d", 
                         ketenas.size(), ketenaName, kebeleId)
                     );
                 }
                 AddressKetena ketena = ketenas.get(0);
                 System.out.println("import l 3 ketena  "+ketenas.get(0));

//                    String ketenaName = helper.getStringValue(10);
//                    List<AddressKetena> ketenas = ketenaRepo.findByExactKetenaName(ketenaName);
//                    if (ketenas.isEmpty()) throw new IllegalStateException("Ketena not found: " + ketenaName);
//                    if (ketenas.size() > 1) throw new IllegalStateException("Ambiguous Ketena: " + ketenaName);
//                    AddressKetena ketena = ketenas.get(0);
             	boolean isActive = true; 
            	Boolean isdisabled = false;
                    // --- Customer creation logic remains the same ---
                    BillingCustomerInfo newCustomer = new BillingCustomerInfo();
                    newCustomer.setFullName(helper.getStringValue(1));
                    newCustomer.setFullNameEng(helper.getStringValue(2));
                    
                    
                    newCustomer.setPhoneNumber(helper.getStringValue(4));
                    newCustomer.setNationalIdNumber(null);
                    newCustomer.setAccountNumber(helper.getStringValue(5));
                    newCustomer.setHouseNumber(null);
                    newCustomer.setMeterNumber(helper.getStringValue(6));
                    newCustomer.setStatus(helper.getStringValue(14));
                    newCustomer.setCountNumber(0);
                    
                    // Financial & Meter Information
                    newCustomer.setCustomerBalanceBirr(0);
                    newCustomer.setInitialReading(helper.getDoubleValue(11));
                    newCustomer.setInitialConsumption(5);
                    newCustomer.setMaxReference(10000);
                    newCustomer.setAdditionalMonthlyPayment(helper.getDoubleValue(15));
                    newCustomer.setTekemachKfya(0);
                    newCustomer.setTechemariKfya(0);
                    newCustomer.setPrepaidBirrCurrentBalance(0);
                   // newCustomer.setTechemariFieldName(dto.getTechemariFieldName());
                    if(helper.getDoubleValue(17) > 0 || helper.getDoubleValue(18) > 0  ) {
                    	
                    // Arrears Information                     
                    newCustomer.setOldHasPenalty(isActive);
                    newCustomer.setOldIfPenaltyPaid(isdisabled);
                    newCustomer.setOldPenlityNumberOfMonths(helper.getIntValue(17));
                    newCustomer.setOldMonthsList(helper.getStringValue(16));
                    newCustomer.setOldKfyaAndPenaltyTotal(helper.getDoubleValue(18));
                    newCustomer.setOldKfyaEachMonth(null);
                    }
                    else
                    {
                    	 // Arrears Information
                    	
                    newCustomer.setOldHasPenalty(isdisabled);
                    newCustomer.setOldIfPenaltyPaid(isdisabled);
                    newCustomer.setOldPenlityNumberOfMonths(helper.getIntValue(17));
                    newCustomer.setOldMonthsList(helper.getStringValue(16));
                    newCustomer.setOldKfyaAndPenaltyTotal(helper.getDoubleValue(17));
                    newCustomer.setOldKfyaEachMonth("");
                    }
                    // Address & Locality Information (fetching and setting nested entities)
                    newCustomer.setAddressDescription(null);
                    newCustomer.setCityId(null);
                    newCustomer.setZoneId(null);
                    
                    
                    newCustomer.setBillingCustomerType(customerType);
                    newCustomer.setBillingMeterSize(meterSize);
                    newCustomer.setBranch(branch);
                    newCustomer.setAddressStreet(kebele);
                    newCustomer.setAddressKetena(ketena);
                    
                    
                    // Date and Flags
                  //  newCustomer.setMeterLifeStart(dto.getMeterLifeStart());
                   // newCustomer.setMeterLifeLimit(dto.getMeterLifeLimit());
                    newCustomer.setIsInitialized(isActive);
                    newCustomer.setIsInitializedSecondTime(isdisabled);
                    newCustomer.setRegisteredDate(new Date());
                   // newCustomer.setRegisteredYear(dto.getRegisteredYear());
                   // newCustomer.setRegisteredMonth(dto.getRegisteredMonth());
                   // newCustomer.setCanceledDate(dto.getCanceledDate());
                   // newCustomer.setCanceledYear(dto.getCanceledYear());
                    //newCustomer.setCanceledMonth(dto.getCanceledMonth());
                   // newCustomer.setWasCanceled(dto.isWasCanceled());
                   // newCustomer.setIsJustReturnFromPenality(dto.isIsJustReturnFromPenality());
                   // newCustomer.setCanceledActivatedDate(dto.getCanceledActivatedDate());
                   // newCustomer.setCompleteDeleted(dto.getCompleteDeleted());
                  //  newCustomer.setCompleteDeletedDate(dto.getCompleteDeletedDate());

                    // Additional Fields
                   // newCustomer.setTerminationRemark(dto.getTerminationRemark());
                    newCustomer.setLocationCoordination(helper.getStringValue(12)+","+helper.getStringValue(13));
                    ///newCustomer.setKdmeKfyaReasons(dto.getKdmeKfyaReasons());
                    
                    System.out.println("import l 3 acN "+newCustomer.getAccountNumber());
                    System.out.println("import l 3 kebele "+newCustomer.getAddressStreet());

                    BillingCustomerInfo savedCustomer = customerRepo.save(newCustomer);
                    createMeterForCustomer(savedCustomer, meterSize);
                   // report.addSuccess(savedCustomer.getFullName() + " (" + savedCustomer.getAccountNumber() + ")");
                    report.addSuccess("Account: " + savedCustomer.getAccountNumber() + " - " + savedCustomer.getFullName());
                } catch (Exception e) {
                    report.addSkipped(new SkippedRowInfo(rowNum, helper.getStringValue(5), e.getMessage()));
                    
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read Excel file. Error: " + e.getMessage());
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
    
    // Helper class for safely reading cell values
    private static class CellHelper {
        private final Row row;
        private final DataFormatter dataFormatter = new DataFormatter();

        public CellHelper(Row row) { this.row = row; }

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