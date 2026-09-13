// package com.wbill.home.service;

// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.wbill.home.model.BillingCustomerInfo;
// import com.wbill.home.model.BillingCustomerType;
// import com.wbill.home.model.BillingInvoiceNumbers;
// import com.wbill.home.model.BillingInvoiceNumbersReference;
// import com.wbill.home.model.BillingMeterRent;
// import com.wbill.home.model.BillingPenaltyTarif;
// import com.wbill.home.model.BillingReading;
// import com.wbill.home.model.BillingReadingConsumption;
// import com.wbill.home.model.BillingReadingWuzif;
// import com.wbill.home.model.BillingTariff;
// import com.wbill.home.model.CompanyProfile;
// import com.wbill.home.repository.BillingInvoiceNumbersReferenceRepository;
// import com.wbill.home.repository.BillingInvoiceNumbersRepository;
// import com.wbill.home.repository.BillingMeterRentRepository;
// import com.wbill.home.repository.BillingPenaltyTarifRepository;
// import com.wbill.home.repository.BillingReadingConsumptionRepository;
// import com.wbill.home.repository.BillingReadingRepository;
// import com.wbill.home.repository.BillingReadingWuzifRepository;
// import com.wbill.home.repository.BillingTariffRepository;
// import com.wbill.home.repository.CompanyProfileRepository;
// import com.wbill.home.util.EthiopianCalendarUtil;

// import java.util.ArrayList;
// import java.util.Date;
// import java.util.List;
// import java.util.UUID;
// import java.util.Objects; 

// @Service
// public class BillingService {

// 	private final BillingReadingRepository readingRepo;
//     private final BillingTariffRepository tariffRepo;
//     private final BillingMeterRentRepository meterRentRepo;
//     private final BillingInvoiceNumbersRepository invoiceRepo;
//     private final BillingReadingWuzifRepository wuzifRepo;
//     private final BillingPenaltyTarifRepository penaltyTarifRepo;
//     private final BillingReadingConsumptionRepository readingConsumptionRepo;
//     private final CompanyProfileRepository companyProfileRepository;
//     private final BillingInvoiceNumbersReferenceRepository invoiceNumbersReferenceRepository;

//     // Corrected constructor with all dependencies
//     public BillingService(BillingReadingRepository readingRepo,
//                           BillingTariffRepository tariffRepo,
//                           BillingMeterRentRepository meterRentRepo,
//                           BillingInvoiceNumbersRepository invoiceRepo,
//                           BillingReadingWuzifRepository wuzifRepo, 
//                           BillingPenaltyTarifRepository penaltyTarifRepo,
//                           BillingReadingConsumptionRepository readingConsumptionRepo,
//                           CompanyProfileRepository companyProfileRepository,
//                           BillingInvoiceNumbersReferenceRepository invoiceNumbersReferenceRepository
//     		) { 
//         this.readingRepo = readingRepo;
//         this.tariffRepo = tariffRepo;
//         this.meterRentRepo = meterRentRepo;
//         this.invoiceRepo = invoiceRepo;
//         this.wuzifRepo = wuzifRepo; 
//         this.penaltyTarifRepo = penaltyTarifRepo; 
//         this.readingConsumptionRepo = readingConsumptionRepo; 
//         this.companyProfileRepository=companyProfileRepository;
//         this.invoiceNumbersReferenceRepository=invoiceNumbersReferenceRepository;
//     }

//     public void generateBillsForSelectedReadings(List<Integer> readingIds) {
//         // Phase 1: Formalize last month's unpaid bills into 'Wuzif' records.
    	
//     	System.out.println("bill gen 2"+readingIds);
//        //send privous bill if not money collected send to wuzif 
//         formalizeArrearsFor(readingIds);

//         // Phase 2: Generate the new bill for each reading.
//         for (Integer id : readingIds) {
//             processSingleBill(id);
//         }
//     }
   
    
//     @Transactional
//     public void formalizeArrearsFor(List<Integer> currentReadingIds) {
//     	System.out.println("bill gen 3"+currentReadingIds);
//         for (Integer id : currentReadingIds) {
//             BillingReading currentReading = readingRepo.findById(id).orElse(null);
//             if (currentReading == null) continue;

//             // Assumes a utility gives you the string for the previous month, e.g., "2016-10"
//             String previousMonthPeriod = EthiopianCalendarUtil.getPreviousKifyaWer(currentReading.getKifyaWer());
//         	System.out.println("bill gen 3 pm "+previousMonthPeriod);
// //                .findByBillingCustomerInfoAndKifyaWer(currentReading.getBillingCustomerInfo(), previousMonthPeriod,"active")

//             BillingReading prevReading = readingRepo
//                 .findByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(currentReading.getBillingCustomerInfo(), previousMonthPeriod,"active")
//                 .orElse(null);
//         	System.out.println("bill gen 3 pr "+prevReading);

//             // Check if the previous month's bill is generated but unpaid
//             if (prevReading != null && !prevReading.isVoid() && prevReading.isBillGenerated() && !prevReading.isMoneyCollected()) {
//                 // Check if a wuzif record for this unpaid bill already exists
//                 if (wuzifRepo.findByBillingReadingActualPaymentCheck(prevReading).isEmpty()) {
//                     BillingReadingWuzif newWuzif = new BillingReadingWuzif();
//                     newWuzif.setBillingReadingPenalized(currentReading); // The bill that is now an arrear
//                     newWuzif.setBillingReadingActualPayment(prevReading); // The bill this arrear will be attached to
//                     newWuzif.setDeleted("active");
//                     newWuzif.setIsMoneyCollected(false);
                    
//                 	System.out.println("bill gen 3 newWuzif "+newWuzif);

//                     wuzifRepo.save(newWuzif);

//                     // Flag the current reading as having a penalty
//                     currentReading.setKitat(true);
//                     readingRepo.save(currentReading);
//                 }
//             }
//         }
//     }
    

//     @Transactional
//     public void processSingleBill(Integer readingId) {
//     	System.out.println("bill gen 4 "+readingId);

//         BillingReading reading = readingRepo.findById(readingId)
//                 .orElseThrow(() -> new RuntimeException("Reading not found: " + readingId));
        
//     	System.out.println("bill gen 4 reading cons  "+reading.getConsumption());

//         // Perform initial checks
//         if (reading.isBillGenerated()) return;
//         BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        
//     	System.out.println("bill gen 4 customer Acn "+customer.getAccountNumber());

//         if (customer.getCustomerBalanceBirr() > 0.0) return; // Skip customers with credit

//         // 1. Calculate Current Month's Charges
//         double consumptionCharge = calculateConsumptionChargeAndSaveDetails(reading.getConsumption(), customer.getBillingCustomerType(),reading);
        
        
//         double meterRent = meterRentRepo.findActiveByCustomerTypeAndMeterSize(customer.getBillingCustomerType(), customer.getBillingMeterSize())
//                 .map(BillingMeterRent::getRentBirr).orElse(0.0);
        
        
//     	System.out.println("bill gen 4 consumptionCharge  "+consumptionCharge);

//         reading.setYezihWerFjotaKfya(consumptionCharge);
//         reading.setKotariKiray(meterRent);
//         reading.setYezihWer(consumptionCharge + meterRent); // Total for the current month

//         // 2. Calculate Arrears (Wuzif) and Penalties (Kitat)
//         calculateWuzifAndKitat(reading);

//         // 3. Set Additional Payments
//         reading.setAdditionalText("የደረቅ ቆሻሻ ክፍያ"); // Dry waste payment
//         reading.setAdditionalHisab(customer.getAdditionalMonthlyPayment());
//         reading.setTechemariFieldName(customer.getTechemariFieldName());
//         reading.setTechemariKfya(customer.getTechemariKfya());

//         // 4. Calculate Final Total
//         double totalPayable = reading.getYezihWer() 
//                             + reading.getWuzifHisab() 
//                             + reading.getKitat() 
//                             + reading.getAdditionalHisab() 
//                             + reading.getTechemariKfya();
//         reading.setTekilalaTekefay(totalPayable);
        
//     	System.out.println("dereke koshasha  "+reading.getAdditionalHisab());
//     	System.out.println("kotarikiray   "+reading.getKotariKiray());

//     	System.out.println("yezihwere   "+reading.getYezihWer());

//     	System.out.println("getKitat   "+reading.getKitat());

//     	System.out.println("bill gen 4 consumptionCharge  "+totalPayable);

        
//         // 5. Finalize with Invoice Number
//         BillingInvoiceNumbers savedInvoice = generateInvoice();
//         reading.setInvoiceNumber(savedInvoice.getInvoiceNumbers());
//         reading.setBillingInvoiceNumbers(savedInvoice);
//         reading.setBillGenerated(true);
//         reading.setModifiedDate(new Date());

//         readingRepo.save(reading);
//     }
    
//     // This is the detailed Wuzif and Kitat logic ported from your code.
//     private void calculateWuzifAndKitat(BillingReading reading) {
//         BillingCustomerInfo customer = reading.getBillingCustomerInfo();
//         List<BillingReadingWuzif> unpaidWuzifList = wuzifRepo.findUnpaidWuzifForCustomer(customer);

        
//         System.out.println("========================================================================");
//         System.out.println("DEBUG: Wuzif Details for Customer Account: " + customer.getAccountNumber());

//         if (unpaidWuzifList.isEmpty()) {
//             System.out.println("  -> No unpaid wuzif records found.");
//         } else {
//             System.out.println("  -> Found " + unpaidWuzifList.size() + " unpaid wuzif record(s):");
//             int count = 1;
//             for (BillingReadingWuzif wuzif : unpaidWuzifList) {
//                 BillingReading penalizedBill = wuzif.getBillingReadingActualPayment();
//                 System.out.println("  ------------------------------------");
//                 System.out.println("  Record " + (count++) + ":");
//                 System.out.println("    - Wuzif Record ID: " + wuzif.getId());

//                 if (penalizedBill == null) {
//                     // This highlights the problematic record directly in the logs
//                     System.out.println("    - Penalized Bill: !!! NULL !!! <--- THIS IS THE SOURCE OF THE ERROR");
//                 } else {
//                     System.out.println("    - Penalized Bill ID: " + penalizedBill.getId());
//                     System.out.println("    - Penalized Bill Period (KifyaWer): " + penalizedBill.getKifyaWer());
//                     System.out.println("    - Penalized Bill Amount (YezihWer): " + penalizedBill.getYezihWer());
//                 }
//             }
//         }
//         System.out.println("========================================================================");
        
        
//       //  System.out.println("unpaidWuzifList "+unpaidWuzifList.iterator().toString());
//         int penaltyMonths = unpaidWuzifList.size();
//         System.out.println("penaltyMonths "+penaltyMonths);

//         // Add legacy penalty months if they exist and are unpaid
//         if (customer.getOldHasPenalty() && !customer.getOldIfPenaltyPaid()) {
//             penaltyMonths += customer.getOldPenlityNumberOfMonths();
//         }
        
//         // --- Penalty (Kitat) Calculation ---
//         double kitatAmount = 0;
//         if (penaltyMonths >= 1) {
//             List<BillingPenaltyTarif> penaltyTariffs = penaltyTarifRepo.findByBillingCustomerTypeOrderByNumberOfMonthAsc(customer.getBillingCustomerType());
           
// //            double baseAmountForPercent = unpaidWuzifList.stream()
// //                .mapToDouble(w -> w.getBillingReadingPenalized().getYezihWer()).sum();

//             double baseAmountForPercent = unpaidWuzifList.stream()
//                     .map(BillingReadingWuzif::getBillingReadingActualPayment) // Get the penalized bill object
//                     .filter(Objects::nonNull)                           // Filter out any that are null
//                     .mapToDouble(BillingReading::getYezihWer)           // Now it's safe to get the charge
//                     .sum();
//             for (BillingPenaltyTarif pTarif : penaltyTariffs) {
//                 boolean isMatch = (pTarif.getEnaKezihBelay() && penaltyMonths >= pTarif.getNumberOfMonth()) || (penaltyMonths == pTarif.getNumberOfMonth());
//                 if (isMatch) {
//                     if (pTarif.getIsPercent()) {
//                         kitatAmount = (baseAmountForPercent * pTarif.getPenalityBirr() / 100) + pTarif.getAdditionalPenalty();
//                     } else if (pTarif.getBewerBzatYbaza()) {
//                         kitatAmount = (penaltyMonths * pTarif.getPenalityBirr()) + pTarif.getAdditionalPenalty();
//                     } else { // Default case includes weruLayDemr
//                         kitatAmount = pTarif.getPenalityBirr() + pTarif.getAdditionalPenalty();
//                     }
//                     break; // Found the correct penalty tier
//                 }
//             }
//         }
//         reading.setKitat(kitatAmount);
//         System.out.println("kitatAmount "+kitatAmount);

//         // --- Arrears (Wuzif) Aggregation ---
//         double wuzifHisab = 0, wuzifKotariKiray = 0, wuzifFjotaKfya = 0, wuzifConsumption = 0, wuzifderekekoshaasha=0;

// //        for (BillingReadingWuzif wuzif : unpaidWuzifList) {
// //            BillingReading penalizedBill = wuzif.getBillingReadingPenalized();
// //            wuzifHisab += penalizedBill.getYezihWer() + penalizedBill.getAdditionalHisab() + penalizedBill.getTechemariKfya();
// //            wuzifKotariKiray += penalizedBill.getKotariKiray();
// //            wuzifFjotaKfya += penalizedBill.getYezihWerFjotaKfya();
// //            wuzifConsumption += penalizedBill.getConsumption();
// //        }

//         for (BillingReadingWuzif wuzif : unpaidWuzifList) {
//           //  BillingReading penalizedBill = wuzif.getBillingReadingActualPayment();
            
//              BillingReading penalizedBill = wuzif.getBillingReadingActualPayment();

//             if (penalizedBill == null) {
//                 // Log a warning to the console so you can find and fix the bad data later
//                 System.out.println("null wuzif found "+wuzif.getId());

//             	System.err.println("WARNING: Skipping Wuzif record with ID " + wuzif.getId() + " because its link to a penalized bill is null.");
//                 continue; // Skip to the next item in the loop
//             }

//             wuzifHisab += penalizedBill.getYezihWer() + penalizedBill.getAdditionalHisab() + penalizedBill.getTechemariKfya();
//             wuzifKotariKiray += penalizedBill.getKotariKiray();
//             wuzifFjotaKfya += penalizedBill.getYezihWerFjotaKfya();
//             wuzifConsumption += penalizedBill.getConsumption();
//             wuzifderekekoshaasha += penalizedBill.getAdditionalHisab();

//             System.out.println(" wuzifHisab "+wuzifHisab+" wuzifKotariKiray "+wuzifKotariKiray+" wuzifFjotaKfya "+wuzifFjotaKfya+" wuzifConsumption "+wuzifConsumption);
//         }
        
//         // Add legacy arrears if they exist
//         if (customer.getOldHasPenalty() && !customer.getOldIfPenaltyPaid()) {
//             wuzifHisab += customer.getOldKfyaAndPenaltyTotal();
//             // Assuming meter rent was same for old months
//             wuzifKotariKiray += customer.getOldPenlityNumberOfMonths() * reading.getKotariKiray();
//         }
        
//         reading.setWuzifHisab(wuzifHisab);
//         reading.setWuzifKotariKiray(wuzifKotariKiray);
//         reading.setWuzifFjotaKfya(wuzifFjotaKfya);
//         reading.setWuzifFjota((int) wuzifConsumption);
//         reading.setWuzifDerekKoshasha(wuzifderekekoshaasha);
//         //reading.setWuzifWorBzat(penaltyMonths + 1); // Total months including current
//         reading.setWuzifWorBzat(penaltyMonths); // corrected adz
//         // Set the descriptive wuzif period string
//         if (!unpaidWuzifList.isEmpty()) {
//             String fromWuzif = unpaidWuzifList.get(0).getBillingReadingActualPayment().getKifyaWer();
//             String toWuzif = unpaidWuzifList.get(unpaidWuzifList.size() - 1).getBillingReadingActualPayment().getKifyaWer();
//             reading.setWuzifKezihEske("ውዝፍ ከ " + fromWuzif + " እስከ " + toWuzif);
//         }
//     }

    

//     private BillingInvoiceNumbers generateInvoice2() {
//         BillingInvoiceNumbers newInvoice = new BillingInvoiceNumbers();

//         // 1. Generate a unique invoice string (e.g., "INV-" + 8 random characters)
//         String invoiceNumber = "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

//         // 2. Set all the required fields for the entity
//         newInvoice.setInvoiceNumbers(invoiceNumber);
//         newInvoice.setUsedFor("Water Bill");
//         newInvoice.setRegisteredDate(new Date()); // Sets the current timestamp
//         newInvoice.setStatus("active");
//         newInvoice.setDeleted("active"); // Or "active", depending on your convention

//         // For `registeredBy`, you would get the current user's ID from Spring Security's context.
//         // As a placeholder, we can use a system ID like 0 or 1.
//         // Example: newInvoice.setRegisteredBy(SecurityContextHolder.getContext().getAuthentication().getPrincipal().getId());
//         newInvoice.setRegisteredBy(1); // Placeholder for system/admin user ID

//         // 3. Save the new invoice record to the database and return it
//         return invoiceRepo.save(newInvoice);
//     }


//     public BillingInvoiceNumbers generateInvoice() {
//         // 1. Fetch the invoice prefix from CompanyProfile
//         CompanyProfile companyProfile = companyProfileRepository.findById(9)
//                 .orElseThrow(() -> new IllegalStateException("Company profile not found with ID 1."));
//         String invoicePrefix = companyProfile.getAccountNumberCompanyShortCode();

//         // 2. Fetch and increment the next invoice number from BillingInvoiceNumbersReference
//         // Use Optional to handle the case where the reference record doesn't exist
//         BillingInvoiceNumbersReference reference = invoiceNumbersReferenceRepository.findById(1)
//                 .orElseGet(() -> {
//                     // Create a new reference record if it doesn't exist
//                     BillingInvoiceNumbersReference newReference = new BillingInvoiceNumbersReference();
//                     newReference.setNextBillingInvoice(1);
//                     newReference.setPreviousBillingInvoice(0);
//                     return invoiceNumbersReferenceRepository.save(newReference);
//                 });

//         // Get the next invoice number and increment it for the next use
//         int nextInvoiceNumber = reference.getNextBillingInvoice();
//         reference.setNextBillingInvoice(nextInvoiceNumber + 1);
        
//         // Save the updated reference record
//         invoiceNumbersReferenceRepository.save(reference);

//         // 3. Construct the full invoice number
//         String fullInvoiceNumber = invoicePrefix + "-" + nextInvoiceNumber;

//         // 4. Create and populate the new BillingInvoiceNumbers entity
//         BillingInvoiceNumbers newInvoice = new BillingInvoiceNumbers();
//         newInvoice.setInvoiceNumbers(fullInvoiceNumber);
//         newInvoice.setUsedFor("Water Bill");
//         newInvoice.setRegisteredDate(new Date());
//         newInvoice.setStatus("active");
//         newInvoice.setDeleted("active");
//         newInvoice.setRegisteredBy(1); // Placeholder for system/admin user ID

//         // 5. Save the new invoice record to the database and return it
//         return invoiceRepo.save(newInvoice);
//     }
   
    
//     private double calculateConsumptionCharge(double totalConsumption, BillingCustomerType customerType) {
//         // Fetch tariffs for the customer type, sorted by consumption block
//     	System.out.println("bill gen 4.1 conscal customer Acn "+totalConsumption +" cutyp "+ customerType.getCustomerType());

//         List<BillingTariff> tariffs = tariffRepo.findByBillingCustomerTypeAndStatus(
//             customerType, "active"
//         );

        
        
//         double remainingConsumption = totalConsumption;
//         double totalCharge = 0.0;

//         // Use a standard for-each loop to avoid the "effectively final" error
//         for (BillingTariff tariff : tariffs) {
//             if (remainingConsumption <= 0) {
//               //  System.out.println("  loop bcalc end : " + remainingConsumption);

//                 break; // Exit the loop entirely if all consumption is accounted for
//             }
//             System.out.println("  remainingConsumption: " + remainingConsumption);

//             double consumptionInThisBlock;

//             // The 'isLast' flag means this tier applies to all remaining consumption
//             if (tariff.getIsLast()) {
//                 consumptionInThisBlock = remainingConsumption;
//                 System.out.println("  last consumptionInThisBlock: " + consumptionInThisBlock);

//             } else {
//                 // Otherwise, use the smaller of the remaining amount or the block's capacity
//                 consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
                
//                 System.out.println("  middle  consumptionInThisBlock: " + consumptionInThisBlock);

//             }

//             // Calculate the charge for this block and update totals
//             totalCharge += consumptionInThisBlock * tariff.getTarrifBirr();
//             System.out.println(" totalCharge: " + totalCharge);

//             remainingConsumption -= consumptionInThisBlock;

            
//             System.out.println(" remainingConsumption out : " + remainingConsumption);

//         }
        
//         System.out.println(" out of loop last  totalCharge : " + totalCharge);

//         return totalCharge;
//     }
    
//     /**
//      * Calculates the consumption charge and saves the detailed breakdown to the database.
//      *
//      * @param totalConsumption The total consumption for the current billing period.
//      * @param customerType The customer's type, used to fetch the correct tariff.
//      * @param currentReading The BillingReading entity being processed, to which the consumption details will be linked.
//      * @return The total calculated consumption charge.
//      */
//     public double calculateConsumptionChargeAndSaveDetails(double totalConsumption, BillingCustomerType customerType, BillingReading currentReading) {
//         // Fetch tariffs for the customer type, sorted by consumption block
//         List<BillingTariff> tariffs = tariffRepo.findByBillingCustomerTypeAndStatus(
//             customerType, "active"
//         );

//         // A list to hold the consumption records before saving them in a batch
//         List<BillingReadingConsumption> consumptionRecords = new ArrayList<>();
//         double remainingConsumption = totalConsumption;
//         double totalCharge = 0.0;

//         for (BillingTariff tariff : tariffs) {
//             if (remainingConsumption <= 0) {
//                 break;
//             }

//             double consumptionInThisBlock;

//             // Determine consumption in the current block
//             if (tariff.getIsLast()) {
//                 consumptionInThisBlock = remainingConsumption;
//             } else {
//                 consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
//             }

//             // Create a new BillingReadingConsumption entity
//             BillingReadingConsumption consumptionRecord = new BillingReadingConsumption();
//             consumptionRecord.setBillingReading(currentReading); // Link to the current billing record
//             consumptionRecord.setBlockName(tariff.getBlockName());
//             consumptionRecord.setConsumption(consumptionInThisBlock);
//             consumptionRecord.setTariff(tariff.getTarrifBirr());
//             consumptionRecord.setTotalAmount(consumptionInThisBlock * tariff.getTarrifBirr());
//             consumptionRecord.setStatus("active");
            
//             // Add the record to the list for batch saving later, if needed
//             consumptionRecords.add(consumptionRecord);

//             // Update the total charge and remaining consumption
//             totalCharge += consumptionRecord.getTotalAmount();
//             remainingConsumption -= consumptionInThisBlock;
//         }

//         // Save all the consumption records to the database
//         // This should be done inside a transactional method to ensure atomicity
//         readingConsumptionRepo.saveAll(consumptionRecords);

//         return totalCharge;
//     }
    
    
// }
