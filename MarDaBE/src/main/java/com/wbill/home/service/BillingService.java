package com.wbill.home.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingInvoiceNumbers;
import com.wbill.home.model.BillingInvoiceNumbersReference;
import com.wbill.home.model.BillingMeterRent;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.model.BillingPenaltyTarif;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingReadingConsumption;
import com.wbill.home.model.BillingReadingWuzif;
import com.wbill.home.model.BillingTariff;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingInvoiceNumbersReferenceRepository;
import com.wbill.home.repository.BillingInvoiceNumbersRepository;
import com.wbill.home.repository.BillingMeterRentRepository;
import com.wbill.home.repository.BillingPenaltyTarifRepository;
import com.wbill.home.repository.BillingReadingConsumptionRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.BillingReadingWuzifRepository;
import com.wbill.home.repository.BillingTariffRepository;
import com.wbill.home.repository.CompanyProfileRepository;
import com.wbill.home.util.EthiopianCalendarUtil;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.Objects;

@Service
public class BillingService {

    private static final Logger log = LoggerFactory.getLogger(BillingService.class);

    private final BillingReadingRepository readingRepo;
    private final BillingTariffRepository tariffRepo;
    private final BillingMeterRentRepository meterRentRepo;
    private final BillingInvoiceNumbersRepository invoiceRepo;
    private final BillingReadingWuzifRepository wuzifRepo;
    private final BillingPenaltyTarifRepository penaltyTarifRepo;
    private final BillingReadingConsumptionRepository readingConsumptionRepo;
    private final CompanyProfileRepository companyProfileRepository;
    private final BillingInvoiceNumbersReferenceRepository invoiceNumbersReferenceRepository;
    private final BillingCustomerInfoRepository customerRepo;
    private final ProgressService progressService;
    private final org.springframework.context.ApplicationContext applicationContext;

    @PersistenceContext
    private EntityManager entityManager;

    public BillingService(BillingReadingRepository readingRepo,
            BillingTariffRepository tariffRepo,
            BillingMeterRentRepository meterRentRepo,
            BillingInvoiceNumbersRepository invoiceRepo,
            BillingReadingWuzifRepository wuzifRepo,
            BillingPenaltyTarifRepository penaltyTarifRepo,
            BillingReadingConsumptionRepository readingConsumptionRepo,
            CompanyProfileRepository companyProfileRepository,
            BillingInvoiceNumbersReferenceRepository invoiceNumbersReferenceRepository,
            BillingCustomerInfoRepository customerRepo,
            ProgressService progressService,
            org.springframework.context.ApplicationContext applicationContext) {
        this.readingRepo = readingRepo;
        this.tariffRepo = tariffRepo;
        this.meterRentRepo = meterRentRepo;
        this.invoiceRepo = invoiceRepo;
        this.wuzifRepo = wuzifRepo;
        this.penaltyTarifRepo = penaltyTarifRepo;
        this.readingConsumptionRepo = readingConsumptionRepo;
        this.companyProfileRepository = companyProfileRepository;
        this.invoiceNumbersReferenceRepository = invoiceNumbersReferenceRepository;
        this.customerRepo = customerRepo;
        this.progressService = progressService;
        this.applicationContext = applicationContext;
    }

    /**
     * Finds the active company profile dynamically without hardcoded IDs.
     */
    public CompanyProfile getActiveCompanyProfile() {
        try {
            List<CompanyProfile> activeProfiles = companyProfileRepository.findByStatus("active");
            if (activeProfiles != null && !activeProfiles.isEmpty()) {
                return activeProfiles.get(0);
            }
            CompanyProfile latest = companyProfileRepository.findFirstByOrderByIdDesc();
            if (latest != null) {
                return latest;
            }
        } catch (Exception ex) {
            log.warn("Error fetching dynamic company profile: {}", ex.getMessage());
        }
        return companyProfileRepository.findById(9).orElse(null);
    }

    /**
     * In-memory cache context for tariffs, rents, and penalties during batch execution.
     */
    public static class BillingCacheContext {
        private final CompanyProfile companyProfile;
        private final Map<Integer, List<BillingTariff>> tariffsByCustomerType;
        private final Map<String, Double> meterRentCache;
        private final Map<Integer, List<BillingPenaltyTarif>> penaltyTariffsByCustomerType;

        public BillingCacheContext(
                CompanyProfile companyProfile,
                Map<Integer, List<BillingTariff>> tariffsByCustomerType,
                Map<String, Double> meterRentCache,
                Map<Integer, List<BillingPenaltyTarif>> penaltyTariffsByCustomerType) {
            this.companyProfile = companyProfile;
            this.tariffsByCustomerType = tariffsByCustomerType;
            this.meterRentCache = meterRentCache;
            this.penaltyTariffsByCustomerType = penaltyTariffsByCustomerType;
        }

        public CompanyProfile getCompanyProfile() {
            return companyProfile;
        }

        public List<BillingTariff> getTariffs(BillingCustomerType customerType) {
            if (customerType == null) {
                return Collections.emptyList();
            }
            return tariffsByCustomerType.getOrDefault(customerType.getId(), Collections.emptyList());
        }

        public Double getMeterRent(BillingCustomerType customerType, BillingMeterSize meterSize) {
            if (customerType == null || meterSize == null) {
                return null;
            }
            String key = customerType.getId() + "_" + meterSize.getId();
            return meterRentCache.get(key);
        }

        public List<BillingPenaltyTarif> getPenaltyTariffs(BillingCustomerType customerType) {
            if (customerType == null) {
                return Collections.emptyList();
            }
            return penaltyTariffsByCustomerType.getOrDefault(customerType.getId(), Collections.emptyList());
        }
    }

    /**
     * Builds pre-calculated lookup cache in memory once before batch processing.
     */
    public BillingCacheContext buildCacheContext() {
        CompanyProfile cp = getActiveCompanyProfile();

        List<BillingTariff> allTariffs = tariffRepo.findAll();
        Map<Integer, List<BillingTariff>> tariffsMap = new HashMap<>();
        if (allTariffs != null) {
            for (BillingTariff t : allTariffs) {
                if ("active".equalsIgnoreCase(t.getStatus()) && t.getBillingCustomerType() != null) {
                    tariffsMap.computeIfAbsent(t.getBillingCustomerType().getId(), k -> new ArrayList<>()).add(t);
                }
            }
            for (List<BillingTariff> list : tariffsMap.values()) {
                list.sort((a, b) -> {
                    if (Boolean.TRUE.equals(a.getIsLast())) return 1;
                    if (Boolean.TRUE.equals(b.getIsLast())) return -1;
                    return Integer.compare(a.getId(), b.getId());
                });
            }
        }

        List<BillingMeterRent> allRents = meterRentRepo.findAll();
        Map<String, Double> rentsMap = new HashMap<>();
        if (allRents != null) {
            for (BillingMeterRent r : allRents) {
                if ("active".equalsIgnoreCase(r.getStatus()) && r.getBillingCustomerType() != null && r.getBillingMeterSize() != null) {
                    String key = r.getBillingCustomerType().getId() + "_" + r.getBillingMeterSize().getId();
                    rentsMap.put(key, r.getRentBirr());
                }
            }
        }

        List<BillingPenaltyTarif> allPenalties = penaltyTarifRepo.findAll();
        Map<Integer, List<BillingPenaltyTarif>> penaltiesMap = new HashMap<>();
        if (allPenalties != null) {
            for (BillingPenaltyTarif p : allPenalties) {
                if (p.getBillingCustomerType() != null) {
                    penaltiesMap.computeIfAbsent(p.getBillingCustomerType().getId(), k -> new ArrayList<>()).add(p);
                }
            }
            for (List<BillingPenaltyTarif> list : penaltiesMap.values()) {
                list.sort((a, b) -> Integer.compare(a.getNumberOfMonth(), b.getNumberOfMonth()));
            }
        }

        return new BillingCacheContext(cp, tariffsMap, rentsMap, penaltiesMap);
    }

    /**
     * Allocates a contiguous block of unique invoice numbers in a single transaction.
     */
    public static class InvoiceBlockAllocation {
        private final String prefix;
        private final int startNumber;
        private final int totalCount;
        private int currentOffset = 0;

        public InvoiceBlockAllocation(String prefix, int startNumber, int totalCount) {
            this.prefix = prefix;
            this.startNumber = startNumber;
            this.totalCount = totalCount;
        }

        public synchronized String nextInvoiceNumber() {
            if (currentOffset >= totalCount) {
                throw new IllegalStateException("Invoice block exhausted: allocated " + totalCount);
            }
            int number = startNumber + currentOffset;
            currentOffset++;
            return String.format("%s-%08d", prefix, number);
        }

        public int getRemaining() {
            return totalCount - currentOffset;
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public synchronized InvoiceBlockAllocation reserveInvoiceNumberBlock(int count) {
        if (count <= 0) {
            throw new IllegalArgumentException("Count must be positive");
        }
        CompanyProfile companyProfile = getActiveCompanyProfile();
        String invoicePrefix = (companyProfile != null && companyProfile.getAccountNumberCompanyShortCode() != null)
                ? companyProfile.getAccountNumberCompanyShortCode()
                : "INV";

        BillingInvoiceNumbersReference reference = invoiceNumbersReferenceRepository.findByIdWithLock(1)
                .orElseGet(() -> {
                    BillingInvoiceNumbersReference newReference = new BillingInvoiceNumbersReference();
                    newReference.setNextBillingInvoice(1);
                    newReference.setPreviousBillingInvoice(0);
                    return invoiceNumbersReferenceRepository.save(newReference);
                });

        int startInvoiceNumber = reference.getNextBillingInvoice();
        int nextInvoiceNumber = startInvoiceNumber + count;
        reference.setPreviousBillingInvoice(startInvoiceNumber);
        reference.setNextBillingInvoice(nextInvoiceNumber);
        invoiceNumbersReferenceRepository.save(reference);

        return new InvoiceBlockAllocation(invoicePrefix, startInvoiceNumber, count);
    }

    /**
     * High-speed synchronous batch generation with caching and chunking.
     */
    public BillingProcessResult generateBillsForSelectedReadings(List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            return new BillingProcessResult();
        }

        BillingProcessResult result = new BillingProcessResult();
        result.setRequested(readingIds.size());

        BillingService self = applicationContext.getBean(BillingService.class);

        // Phase 1: Formalize last month's unpaid bills into 'Wuzif' records in chunks
        self.formalizeArrearsBatch(readingIds);

        // Phase 2: Identify unbilled readings
        List<Integer> unbilled = new ArrayList<>();
        for (Integer id : readingIds) {
            BillingReading reading = readingRepo.findById(id).orElse(null);
            if (reading == null) {
                result.addSkipReason("Reading not found: " + id);
            } else if (reading.isBillGenerated()) {
                result.addSkipReason("Already billed: readingId=" + id);
            } else {
                unbilled.add(id);
            }
        }

        if (unbilled.isEmpty()) {
            return result;
        }

        // Phase 3: Block reservation + in-memory cached calculation
        BillingCacheContext cache = buildCacheContext();
        InvoiceBlockAllocation invoiceBlock = self.reserveInvoiceNumberBlock(unbilled.size());

        int chunkSize = 250;
        for (int i = 0; i < unbilled.size(); i += chunkSize) {
            List<Integer> chunk = unbilled.subList(i, Math.min(i + chunkSize, unbilled.size()));
            try {
                int count = self.processChunk(chunk, invoiceBlock, cache);
                for (int c = 0; c < count; c++) {
                    result.incrementProcessed();
                }
            } catch (Exception ex) {
                log.error("Error processing chunk: {}", ex.getMessage(), ex);
                result.addSkipReason("Chunk error: " + ex.getMessage());
            }
        }
        return result;
    }

    /**
     * Starts bill generation asynchronously and tracks progress with ProgressService.
     */
    public String startAsyncGeneration(List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            throw new IllegalArgumentException("readingIds cannot be null or empty");
        }
        final String jobId = progressService.createJob(readingIds.size());
        final BillingService self = applicationContext.getBean(BillingService.class);
        new Thread(() -> {
            try {
                self.processBulkGenerationWithProgress(jobId, readingIds);
            } catch (Exception ex) {
                log.error("Batch generation failed for job {}", jobId, ex);
                progressService.markError(jobId, ex.getMessage());
            }
        }, "bill-gen-" + jobId).start();
        return jobId;
    }

    public void processBulkGenerationWithProgress(String jobId, List<Integer> readingIds) {
        BillingService self = applicationContext.getBean(BillingService.class);
        progressService.updateMessage(jobId, "Formalizing arrears...");
        self.formalizeArrearsBatch(readingIds);

        progressService.updateMessage(jobId, "Filtering eligible readings...");
        List<Integer> eligible = new ArrayList<>();
        for (Integer id : readingIds) {
            BillingReading r = readingRepo.findById(id).orElse(null);
            if (r != null && !r.isBillGenerated()) {
                eligible.add(id);
            } else {
                progressService.incrementProcessed(jobId);
            }
        }

        if (eligible.isEmpty()) {
            progressService.markDone(jobId, "All selected readings are already billed.");
            return;
        }

        progressService.updateMessage(jobId, "Reserving invoice numbers & loading tariffs...");
        InvoiceBlockAllocation invoiceBlock = self.reserveInvoiceNumberBlock(eligible.size());
        BillingCacheContext cache = buildCacheContext();

        int chunkSize = 250;
        int totalProcessed = 0;
        for (int i = 0; i < eligible.size(); i += chunkSize) {
            List<Integer> chunk = eligible.subList(i, Math.min(i + chunkSize, eligible.size()));
            try {
                int done = self.processChunk(chunk, invoiceBlock, cache, jobId, progressService);
                totalProcessed += done;
                progressService.updateMessage(jobId, "Processed " + totalProcessed + "/" + eligible.size() + " bills...");
            } catch (Exception ex) {
                log.error("Failed processing chunk for job {}: {}", jobId, ex.getMessage(), ex);
                progressService.addLog(jobId, "Chunk error: " + ex.getMessage());
                progressService.incrementProcessedBy(jobId, chunk.size());
            }
        }
        progressService.markDone(jobId, "Successfully generated " + totalProcessed + " bills.");
    }

    @Transactional
    public void formalizeArrearsFor(List<Integer> currentReadingIds) {
        formalizeArrearsBatch(currentReadingIds);
    }

    @Transactional
    public void formalizeArrearsBatch(List<Integer> currentReadingIds) {
        if (currentReadingIds == null || currentReadingIds.isEmpty()) return;

        int chunkSize = 500;
        for (int i = 0; i < currentReadingIds.size(); i += chunkSize) {
            List<Integer> subList = currentReadingIds.subList(i, Math.min(i + chunkSize, currentReadingIds.size()));
            List<BillingReading> readings = readingRepo.findAllById(subList);
            List<BillingReadingWuzif> newWuzifs = new ArrayList<>();
            List<BillingReading> modifiedReadings = new ArrayList<>();

            for (BillingReading currentReading : readings) {
                if (currentReading == null || currentReading.getBillingCustomerInfo() == null) continue;
                String previousMonthPeriod = EthiopianCalendarUtil.getPreviousKifyaWer(currentReading.getKifyaWer());
                if (previousMonthPeriod == null) continue;

                BillingReading prevReading = readingRepo
                        .findFirstByBillingCustomerInfoAndKifyaWerAndStatusOrderByCollectionDateDesc(
                                currentReading.getBillingCustomerInfo(), previousMonthPeriod, "active")
                        .orElse(null);

                if (prevReading != null && !prevReading.isVoid() && prevReading.isBillGenerated()
                        && !prevReading.isMoneyCollected()) {
                    if (wuzifRepo.findByBillingReadingActualPaymentAll(prevReading).isEmpty()) {
                        BillingReadingWuzif newWuzif = new BillingReadingWuzif();
                        newWuzif.setBillingReadingPenalized(currentReading);
                        newWuzif.setBillingReadingActualPayment(prevReading);
                        newWuzif.setDeleted("active");
                        newWuzif.setIsMoneyCollected(false);
                        newWuzifs.add(newWuzif);

                        currentReading.setKitat(true);
                        modifiedReadings.add(currentReading);
                    }
                }
            }

            if (!newWuzifs.isEmpty()) {
                wuzifRepo.saveAll(newWuzifs);
            }
            if (!modifiedReadings.isEmpty()) {
                readingRepo.saveAll(modifiedReadings);
            }
            if (entityManager != null) {
                entityManager.flush();
                entityManager.clear();
            }
        }
    }

    @Transactional
    public void processSingleBill(Integer readingId) {
        if (readingId == null) return;
        BillingReading reading = readingRepo.findById(readingId).orElse(null);
        if (reading == null || reading.isBillGenerated()) return;

        BillingCacheContext cache = buildCacheContext();
        BillingService self = applicationContext.getBean(BillingService.class);
        InvoiceBlockAllocation singleBlock = self.reserveInvoiceNumberBlock(1);
        self.processChunk(List.of(readingId), singleBlock, cache);
    }

    /**
     * Processes a chunk of readings in a single transaction using cache and pre-allocated invoices.
     */
    @Transactional
    public int processChunk(List<Integer> readingIds, InvoiceBlockAllocation invoiceBlock, BillingCacheContext cache) {
        return processChunk(readingIds, invoiceBlock, cache, null, null);
    }

    @Transactional
    public int processChunk(List<Integer> readingIds, InvoiceBlockAllocation invoiceBlock, BillingCacheContext cache, String jobId, ProgressService progressService) {
        List<BillingReading> readings = readingRepo.findAllById(readingIds);
        List<BillingReadingConsumption> consumptionsToSave = new ArrayList<>();
        List<BillingReading> readingsToSave = new ArrayList<>();
        int processedCount = 0;
        int loopCount = 0;

        for (BillingReading reading : readings) {
            loopCount++;
            if (reading == null) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                }
                continue;
            }
            if (reading.isBillGenerated()) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                    progressService.addLog(jobId, "Reading #" + reading.getId() + " already billed. Skipped.");
                }
                continue;
            }

            BillingCustomerInfo customer = reading.getBillingCustomerInfo();
            if (customer == null) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                    progressService.addLog(jobId, "Reading #" + reading.getId() + " missing customer. Skipped.");
                }
                continue;
            }

            double consumptionCharge = calculateConsumptionChargeWithCache(
                    reading.getConsumption(),
                    customer.getBillingCustomerType(),
                    cache);

            BillingMeterSize effectiveMeterSize = (reading.getBillingCustomerInfoMeter() != null)
                    ? reading.getBillingCustomerInfoMeter().getBillingMeterSize()
                    : null;
            if (effectiveMeterSize == null) {
                effectiveMeterSize = customer.getBillingMeterSize();
            }
            if (effectiveMeterSize == null) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                    String acc = customer.getAccountNumber() != null ? customer.getAccountNumber() : "N/A";
                    progressService.addLog(jobId, "Account " + acc + " missing meter size. Skipped.");
                }
                continue;
            }

            if (reading.getConsumption() > 0 && consumptionCharge == 0.0) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                    String acc = customer.getAccountNumber() != null ? customer.getAccountNumber() : "N/A";
                    progressService.addLog(jobId, "Account " + acc + " zero consumption charge. Skipped.");
                }
                continue;
            }

            Double meterRent = cache.getMeterRent(customer.getBillingCustomerType(), effectiveMeterSize);
            if (meterRent == null) {
                if (progressService != null && jobId != null) {
                    progressService.incrementProcessed(jobId);
                    String acc = customer.getAccountNumber() != null ? customer.getAccountNumber() : "N/A";
                    progressService.addLog(jobId, "Account " + acc + " missing meter rent tariff. Skipped.");
                }
                continue;
            }

            List<BillingReadingConsumption> consumptionRecords = buildConsumptionRecords(
                    reading.getConsumption(),
                    customer.getBillingCustomerType(),
                    reading,
                    cache);
            consumptionsToSave.addAll(consumptionRecords);

            reading.setYezihWerFjotaKfya(consumptionCharge);
            reading.setKotariKiray(meterRent);
            reading.setYezihWer(consumptionCharge + meterRent);

            calculateWuzifAndKitatWithCache(reading, cache);

            reading.setAdditionalText("የደረቅ ቆሻሻ ክፍያ");
            reading.setAdditionalHisab(customer.getAdditionalMonthlyPayment());
            reading.setTechemariFieldName(customer.getTechemariFieldName());
            reading.setTechemariKfya(customer.getTechemariKfya());

            // Service Charge 1 & 2
            double svcCharge1 = 0.0;
            double svcCharge2 = 0.0;
            CompanyProfile cpForCharges = cache.getCompanyProfile();
            if (cpForCharges != null) {
                Double pct1 = cpForCharges.getmBillingAdditionalPayment1Value();
                if (pct1 != null && pct1 > 0) {
                    double base1 = "Consumption".equalsIgnoreCase(cpForCharges.getmBillingAdditionalPayment1ValueOption())
                            ? reading.getYezihWerFjotaKfya()
                            : (reading.getYezihWerFjotaKfya() + reading.getKotariKiray());
                    svcCharge1 = base1 * pct1 / 100.0;
                    reading.setmBillingAdditionalPayment1Value(svcCharge1);
                    reading.setmBillingAdditionalPayment1ValueLable(cpForCharges.getmBillingAdditionalPayment1ValueLable());
                } else {
                    reading.setmBillingAdditionalPayment1Value(0.0);
                }

                Double pct2 = cpForCharges.getmBillingAdditionalPayment2Value();
                if (pct2 != null && pct2 > 0) {
                    double base2 = "Consumption".equalsIgnoreCase(cpForCharges.getmBillingAdditionalPayment2ValueOption())
                            ? reading.getYezihWerFjotaKfya()
                            : (reading.getYezihWerFjotaKfya() + reading.getKotariKiray());
                    svcCharge2 = base2 * pct2 / 100.0;
                    reading.setmBillingAdditionalPayment2Value(svcCharge2);
                    reading.setmBillingAdditionalPayment2ValueLable(cpForCharges.getmBillingAdditionalPayment2ValueLable());
                } else {
                    reading.setmBillingAdditionalPayment2Value(0.0);
                }
            }

            double totalPayable = reading.getYezihWer()
                    + reading.getWuzifHisab()
                    + reading.getKitat()
                    + reading.getAdditionalHisab()
                    + reading.getTechemariKfya()
                    + svcCharge1
                    + svcCharge2;
            reading.setTekilalaTekefay(totalPayable);

            // Deposit / Credit logic
            double deposit = customer.getCustomerBalanceBirr();
            if (deposit > 0.0) {
                double amountUsedFromDeposit = Math.min(deposit, totalPayable);
                reading.setPaidFromTekemach(true);
                reading.setKecreditTekeflual(true);
                reading.setKecreditYetekefele(amountUsedFromDeposit);

                if (deposit >= totalPayable) {
                    reading.setTekilalaTekefay(0.0);
                    reading.setMoneyCollected(true);
                    reading.setMoneyCollectedDate(new Date());
                    customer.setCustomerBalanceBirr(deposit - totalPayable);
                } else {
                    reading.setTekilalaTekefay(totalPayable - deposit);
                    reading.setMoneyCollected(false);
                    customer.setCustomerBalanceBirr(0.0);
                }
                customerRepo.save(customer);
            } else {
                reading.setPaidFromTekemach(false);
                reading.setKecreditTekeflual(false);
                reading.setKecreditYetekefele(0.0);
            }

            // Derash bank message description
            if (reading.getBillDescriptionBank() == null || reading.getBillDescriptionBank().trim().isEmpty()) {
                String template = cpForCharges != null ? cpForCharges.getTemplateDerashMessage() : null;
                String billDesc = null;
                if (template != null && !template.trim().isEmpty()) {
                    billDesc = buildDerashMessageFromTemplate(template, reading, LocalDate.now());
                }
                if (billDesc == null || billDesc.trim().isEmpty()) {
                    billDesc = "Bill for " + (reading.getKifyaWer() != null ? reading.getKifyaWer() : "");
                }
                reading.setBillDescriptionBank(billDesc);
            }

            // Assign unique invoice number from block allocation
            String invoiceNumber = invoiceBlock.nextInvoiceNumber();
            BillingInvoiceNumbers newInvoice = new BillingInvoiceNumbers();
            newInvoice.setInvoiceNumbers(invoiceNumber);
            newInvoice.setUsedFor("Water Bill");
            newInvoice.setRegisteredDate(new Date());
            newInvoice.setStatus("active");
            newInvoice.setDeleted("active");
            newInvoice.setRegisteredBy(1);
            newInvoice = invoiceRepo.save(newInvoice);

            reading.setInvoiceNumber(invoiceNumber);
            reading.setBillingInvoiceNumbers(newInvoice);
            reading.setBillGenerated(true);
            reading.setModifiedDate(new Date());
            readingsToSave.add(reading);
            processedCount++;

            if (progressService != null && jobId != null) {
                progressService.incrementProcessed(jobId);
                String custName = customer.getFullName() != null ? customer.getFullName() : "";
                String accNum = customer.getAccountNumber() != null ? customer.getAccountNumber() : "N/A";
                progressService.addLog(jobId, "Account " + accNum + (custName.isEmpty() ? "" : " (" + custName + ")") + " -> Invoice " + invoiceNumber + " (" + String.format(java.util.Locale.US, "%.2f", reading.getTekilalaTekefay()) + " ETB)");
            }
        }

        if (progressService != null && jobId != null && loopCount < readingIds.size()) {
            progressService.incrementProcessedBy(jobId, readingIds.size() - loopCount);
        }

        if (!consumptionsToSave.isEmpty()) {
            readingConsumptionRepo.saveAll(consumptionsToSave);
        }
        if (!readingsToSave.isEmpty()) {
            readingRepo.saveAll(readingsToSave);
        }

        if (entityManager != null) {
            entityManager.flush();
            entityManager.clear();
        }

        return processedCount;
    }

    private void calculateWuzifAndKitatWithCache(BillingReading reading, BillingCacheContext cache) {
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        List<BillingReadingWuzif> unpaidWuzifList = wuzifRepo.findUnpaidWuzifForCustomer(customer);

        int penaltyMonths = (int) unpaidWuzifList.stream()
                .filter(w -> !w.getIsKitatTenestual())
                .count();

        if (customer.getOldHasPenalty() && !customer.getOldIfPenaltyPaid()) {
            penaltyMonths += customer.getOldPenlityNumberOfMonths();
        }

        double kitatAmount = 0;
        if (penaltyMonths >= 1) {
            List<BillingPenaltyTarif> penaltyTariffs = cache.getPenaltyTariffs(customer.getBillingCustomerType());
            double baseAmountForPercent = unpaidWuzifList.stream()
                    .map(BillingReadingWuzif::getBillingReadingActualPayment)
                    .filter(Objects::nonNull)
                    .mapToDouble(BillingReading::getYezihWer)
                    .sum();
            for (BillingPenaltyTarif pTarif : penaltyTariffs) {
                boolean isMatch = (pTarif.getEnaKezihBelay() && penaltyMonths >= pTarif.getNumberOfMonth())
                        || (penaltyMonths == pTarif.getNumberOfMonth());
                if (isMatch) {
                    if (pTarif.getIsPercent()) {
                        kitatAmount = (baseAmountForPercent * pTarif.getPenalityBirr() / 100)
                                + pTarif.getAdditionalPenalty();
                    } else if (pTarif.getBewerBzatYbaza()) {
                        kitatAmount = (penaltyMonths * pTarif.getPenalityBirr()) + pTarif.getAdditionalPenalty();
                    } else {
                        kitatAmount = pTarif.getPenalityBirr() + pTarif.getAdditionalPenalty();
                    }
                    break;
                }
            }
        }
        reading.setKitat(kitatAmount);

        double wuzifHisab = 0, wuzifKotariKiray = 0, wuzifFjotaKfya = 0, wuzifConsumption = 0, wuzifderekekoshaasha = 0,
                wuzifPrePayment = 0, wuzifTechemariKfya = 0;
        double wuzifAdditionalPayment1 = 0, wuzifAdditionalPayment2 = 0;
        for (BillingReadingWuzif wuzif : unpaidWuzifList) {
            BillingReading penalizedBill = wuzif.getBillingReadingActualPayment();
            if (penalizedBill == null) {
                continue;
            }
            double ap1 = penalizedBill.getmBillingAdditionalPayment1Value() != null
                    ? penalizedBill.getmBillingAdditionalPayment1Value() : 0.0;
            double ap2 = penalizedBill.getmBillingAdditionalPayment2Value() != null
                    ? penalizedBill.getmBillingAdditionalPayment2Value() : 0.0;

            wuzifHisab += penalizedBill.getYezihWer() + penalizedBill.getAdditionalHisab()
                    + penalizedBill.getTechemariKfya() + ap1 + ap2;
            wuzifKotariKiray += penalizedBill.getKotariKiray();
            wuzifFjotaKfya += penalizedBill.getYezihWerFjotaKfya();
            wuzifConsumption += penalizedBill.getConsumption();
            wuzifderekekoshaasha += penalizedBill.getAdditionalHisab();
            wuzifPrePayment += penalizedBill.getKecreditYetekefele();
            wuzifTechemariKfya += penalizedBill.getTechemariKfya();
            wuzifAdditionalPayment1 += ap1;
            wuzifAdditionalPayment2 += ap2;
        }

        if (customer.getOldHasPenalty() && !customer.getOldIfPenaltyPaid()) {
            wuzifHisab += customer.getOldKfyaAndPenaltyTotal();
        }

        reading.setWuzifHisab(wuzifHisab - wuzifPrePayment);
        reading.setWuzifKotariKiray(wuzifKotariKiray);
        reading.setWuzifFjotaKfya(wuzifFjotaKfya);
        reading.setWuzifFjota((int) wuzifConsumption);
        reading.setWuzifDerekKoshasha(wuzifderekekoshaasha);
        reading.setTemelashBirr(wuzifPrePayment);
        reading.setWuzifWorBzat(penaltyMonths);
        reading.setWuzifTechemariKfya(wuzifTechemariKfya);
        reading.setmBillingAdditionalPayment1Wuzif(wuzifAdditionalPayment1);
        reading.setmBillingAdditionalPayment2Wuzif(wuzifAdditionalPayment2);

        List<BillingReading> actualPenalizedBills = unpaidWuzifList.stream()
                .map(BillingReadingWuzif::getBillingReadingActualPayment)
                .filter(Objects::nonNull)
                .toList();
        if (!actualPenalizedBills.isEmpty()) {
            String fromWuzif = actualPenalizedBills.get(0).getKifyaWer();
            String toWuzif = actualPenalizedBills.get(actualPenalizedBills.size() - 1).getKifyaWer();
            if (fromWuzif != null && toWuzif != null) {
                reading.setWuzifKezihEske("ውዝፍ ከ " + fromWuzif + " እስከ " + toWuzif);
            }
        }
    }

    private void calculateWuzifAndKitat(BillingReading reading) {
        BillingCacheContext cache = buildCacheContext();
        calculateWuzifAndKitatWithCache(reading, cache);
    }

    private double calculateConsumptionChargeWithCache(double totalConsumption, BillingCustomerType customerType, BillingCacheContext cache) {
        List<BillingTariff> tariffs = cache.getTariffs(customerType);
        double remainingConsumption = totalConsumption;
        double totalCharge = 0.0;

        for (BillingTariff tariff : tariffs) {
            if (remainingConsumption <= 0) break;
            double consumptionInThisBlock;
            if (Boolean.TRUE.equals(tariff.getIsLast())) {
                consumptionInThisBlock = remainingConsumption;
            } else {
                consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
            }
            totalCharge += consumptionInThisBlock * tariff.getTarrifBirr();
            remainingConsumption -= consumptionInThisBlock;
        }
        return totalCharge;
    }

    private double calculateConsumptionCharge(double totalConsumption, BillingCustomerType customerType) {
        List<BillingTariff> tariffs = tariffRepo.findByBillingCustomerTypeAndStatus(customerType, "active");
        double remainingConsumption = totalConsumption;
        double totalCharge = 0.0;
        for (BillingTariff tariff : tariffs) {
            if (remainingConsumption <= 0) break;
            double consumptionInThisBlock;
            if (Boolean.TRUE.equals(tariff.getIsLast())) {
                consumptionInThisBlock = remainingConsumption;
            } else {
                consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
            }
            totalCharge += consumptionInThisBlock * tariff.getTarrifBirr();
            remainingConsumption -= consumptionInThisBlock;
        }
        return totalCharge;
    }

    private List<BillingReadingConsumption> buildConsumptionRecords(
            double totalConsumption,
            BillingCustomerType customerType,
            BillingReading currentReading,
            BillingCacheContext cache) {
        List<BillingTariff> tariffs = cache.getTariffs(customerType);
        List<BillingReadingConsumption> consumptionRecords = new ArrayList<>();
        double remainingConsumption = totalConsumption;

        for (BillingTariff tariff : tariffs) {
            double consumptionInThisBlock = 0.0;
            if (remainingConsumption > 0) {
                if (Boolean.TRUE.equals(tariff.getIsLast())) {
                    consumptionInThisBlock = remainingConsumption;
                } else {
                    consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
                }
            }

            BillingReadingConsumption consumptionRecord = new BillingReadingConsumption();
            consumptionRecord.setBillingReading(currentReading);
            consumptionRecord.setBlockName(tariff.getBlockName());
            consumptionRecord.setConsumption(consumptionInThisBlock);
            consumptionRecord.setTariff(tariff.getTarrifBirr());
            consumptionRecord.setTotalAmount(consumptionInThisBlock * tariff.getTarrifBirr());
            consumptionRecord.setStatus("active");
            consumptionRecords.add(consumptionRecord);

            if (remainingConsumption > 0) {
                remainingConsumption -= consumptionInThisBlock;
            }
        }
        return consumptionRecords;
    }

    @Transactional
    public double calculateConsumptionChargeAndSaveDetails(double totalConsumption, BillingCustomerType customerType,
            BillingReading currentReading) {
        List<BillingTariff> tariffs = tariffRepo.findByBillingCustomerTypeAndStatus(customerType, "active");
        List<BillingReadingConsumption> consumptionRecords = new ArrayList<>();
        double remainingConsumption = totalConsumption;
        double totalCharge = 0.0;

        for (BillingTariff tariff : tariffs) {
            double consumptionInThisBlock = 0.0;
            if (remainingConsumption > 0) {
                if (Boolean.TRUE.equals(tariff.getIsLast())) {
                    consumptionInThisBlock = remainingConsumption;
                } else {
                    consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
                }
            }

            BillingReadingConsumption consumptionRecord = new BillingReadingConsumption();
            consumptionRecord.setBillingReading(currentReading);
            consumptionRecord.setBlockName(tariff.getBlockName());
            consumptionRecord.setConsumption(consumptionInThisBlock);
            consumptionRecord.setTariff(tariff.getTarrifBirr());
            consumptionRecord.setTotalAmount(consumptionInThisBlock * tariff.getTarrifBirr());
            consumptionRecord.setStatus("active");
            consumptionRecords.add(consumptionRecord);

            if (remainingConsumption > 0) {
                totalCharge += consumptionRecord.getTotalAmount();
                remainingConsumption -= consumptionInThisBlock;
            }
        }
        readingConsumptionRepo.saveAll(consumptionRecords);
        return totalCharge;
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public synchronized BillingInvoiceNumbers generateInvoice() {
        CompanyProfile companyProfile = getActiveCompanyProfile();
        String invoicePrefix = (companyProfile != null && companyProfile.getAccountNumberCompanyShortCode() != null)
                ? companyProfile.getAccountNumberCompanyShortCode()
                : "INV";

        BillingInvoiceNumbersReference reference = invoiceNumbersReferenceRepository.findByIdWithLock(1)
                .orElseGet(() -> {
                    BillingInvoiceNumbersReference newReference = new BillingInvoiceNumbersReference();
                    newReference.setNextBillingInvoice(1);
                    newReference.setPreviousBillingInvoice(0);
                    return invoiceNumbersReferenceRepository.save(newReference);
                });

        int nextInvoiceNumber = reference.getNextBillingInvoice();
        reference.setNextBillingInvoice(nextInvoiceNumber + 1);
        invoiceNumbersReferenceRepository.save(reference);

        String fullInvoiceNumber = String.format("%s-%08d", invoicePrefix, nextInvoiceNumber);

        BillingInvoiceNumbers newInvoice = new BillingInvoiceNumbers();
        newInvoice.setInvoiceNumbers(fullInvoiceNumber);
        newInvoice.setUsedFor("Water Bill");
        newInvoice.setRegisteredDate(new Date());
        newInvoice.setStatus("active");
        newInvoice.setDeleted("active");
        newInvoice.setRegisteredBy(1);

        return invoiceRepo.save(newInvoice);
    }

    private String buildDerashMessageFromTemplate(String template, BillingReading reading, LocalDate dueDate) {
        if (template == null) {
            return null;
        }
        String message = template;
        try {
            String kifyaWer = reading.getKifyaWer();
            String[] kfyamonth = (kifyaWer != null) ? kifyaWer.split(",") : new String[] { "", "" };
            String monthNameRaw = kfyamonth.length > 0 ? kfyamonth[0].trim() : "";
            String yearPart = kfyamonth.length > 1 ? kfyamonth[1].trim() : "";
            String monthEn = getMonthNameFromAmharicMName(monthNameRaw);
            String periodStr;
            if (monthEn != null && !monthEn.isEmpty() && !yearPart.isEmpty()) {
                periodStr = monthEn + ", " + yearPart;
            } else {
                periodStr = kifyaWer != null ? kifyaWer : "";
            }

            String customerNameEng = null;
            if (reading.getBillingCustomerInfo() != null) {
                customerNameEng = reading.getBillingCustomerInfo().getFullNameEng();
                if (customerNameEng == null || customerNameEng.trim().isEmpty()) {
                    customerNameEng = reading.getBillingCustomerInfo().getFullName();
                }
            }
            String accountNumber = (reading.getBillingCustomerInfo() != null)
                    ? reading.getBillingCustomerInfo().getAccountNumber()
                    : "";

            String ethDueStr = formatEthiopianDate(dueDate);
            double wuzifTotal = reading.getWuzifHisab();

            message = message.replace("#11", String.valueOf(reading.getKitat()));
            message = message.replace("#10", String.valueOf(reading.getLastReading()));
            message = message.replace("#1", customerNameEng != null ? customerNameEng : "");
            message = message.replace("#2", periodStr != null ? periodStr : "");
            message = message.replace("#3", String.valueOf(reading.getConsumption()));
            message = message.replace("#4", reading.getWuzifKezihEske() != null ? reading.getWuzifKezihEske() : "");
            message = message.replace("#5", String.valueOf(wuzifTotal));
            message = message.replace("#6", String.valueOf(reading.getTekilalaTekefay()));
            message = message.replace("#7", accountNumber != null ? accountNumber : "");
            message = message.replace("#8", ethDueStr != null ? ethDueStr : "");
            message = message.replace("#9", String.valueOf(reading.getPreviousReading()));
            return message;
        } catch (Exception ex) {
            return template;
        }
    }

    private String formatEthiopianDate(LocalDate gregorianDate) {
        if (gregorianDate == null) return "";
        try {
            EthiopianCalendarUtil.EthiopianDate eth = EthiopianCalendarUtil.toEthiopian(gregorianDate);
            return eth != null ? eth.toString() : gregorianDate.toString();
        } catch (Exception ex) {
            return gregorianDate.toString();
        }
    }

    private String getMonthNameFromAmharicMName(String amh) {
        if (amh == null) return "";
        String m = amh.trim();
        switch (m) {
            case "መስከረም": return "Meskerem";
            case "ጥቅምት": return "Tikimt";
            case "ኅዳር": return "Hidar";
            case "ታህሣሥ": return "Tahsas";
            case "ጥር": return "Tir";
            case "የካቲት": return "Yekatit";
            case "መጋቢት": return "Megabit";
            case "ሚያዚያ": return "Miazia";
            case "ግንቦት": return "Ginbot";
            case "ሰኔ": return "Sene";
            case "ሐምሌ": return "Hamle";
            case "ነሐሴ": return "Nehasse";
            case "ጳጉሜ": return "Pagumen";
            default: return m;
        }
    }

    public List<com.wbill.home.dto.ReadingConsumptionItemDTO> calculateConsumptionPreview(double totalConsumption,
            BillingCustomerType customerType) {
        List<BillingTariff> tariffs = tariffRepo.findByBillingCustomerTypeAndStatus(customerType, "active");
        List<com.wbill.home.dto.ReadingConsumptionItemDTO> items = new ArrayList<>();
        double remainingConsumption = totalConsumption;

        for (BillingTariff tariff : tariffs) {
            double consumptionInThisBlock = 0.0;
            if (remainingConsumption > 0) {
                if (Boolean.TRUE.equals(tariff.getIsLast())) {
                    consumptionInThisBlock = remainingConsumption;
                } else {
                    consumptionInThisBlock = Math.min(remainingConsumption, tariff.getConsumption());
                }
            }

            if (consumptionInThisBlock > 0) {
                com.wbill.home.dto.ReadingConsumptionItemDTO item = new com.wbill.home.dto.ReadingConsumptionItemDTO();
                item.setBlockName(tariff.getBlockName());
                item.setConsumption(consumptionInThisBlock);
                item.setTariff(tariff.getTarrifBirr());
                item.setTotalAmount(consumptionInThisBlock * tariff.getTarrifBirr());
                item.setStatus("preview");
                items.add(item);
            }

            if (remainingConsumption > 0) {
                remainingConsumption -= consumptionInThisBlock;
            }
        }
        return items;
    }

    @Transactional(readOnly = true)
    public com.wbill.home.dto.ReadingDetailResponseDTO previewBill(Integer readingId) {
        BillingReading reading = readingRepo.findById(readingId)
                .orElseThrow(() -> new RuntimeException("Reading not found: " + readingId));

        BillingCustomerInfo customer = reading.getBillingCustomerInfo();

        List<com.wbill.home.dto.ReadingConsumptionItemDTO> consumptionItems = calculateConsumptionPreview(
                reading.getConsumption(),
                customer.getBillingCustomerType());
        double consumptionCharge = consumptionItems.stream().mapToDouble(com.wbill.home.dto.ReadingConsumptionItemDTO::getTotalAmount).sum();

        BillingMeterSize effectiveMeterSize = (reading.getBillingCustomerInfoMeter() != null)
                ? reading.getBillingCustomerInfoMeter().getBillingMeterSize()
                : null;
        if (effectiveMeterSize == null) {
            effectiveMeterSize = customer.getBillingMeterSize();
        }

        Double meterRent = 0.0;
        if (effectiveMeterSize != null) {
            var meterRentOpt = meterRentRepo.findFirstByBillingCustomerTypeAndBillingMeterSizeAndStatusOrderByIdDesc(
                    customer.getBillingCustomerType(), effectiveMeterSize, "active");
            if (meterRentOpt.isPresent()) {
                meterRent = meterRentOpt.get().getRentBirr();
            }
        }

        reading.setYezihWerFjotaKfya(consumptionCharge);
        reading.setKotariKiray(meterRent);
        reading.setYezihWer(consumptionCharge + meterRent);

        calculateWuzifAndKitat(reading);

        reading.setAdditionalHisab(customer.getAdditionalMonthlyPayment());
        reading.setTechemariFieldName(customer.getTechemariFieldName());
        reading.setTechemariKfya(customer.getTechemariKfya());

        double totalPayable = reading.getYezihWer()
                + reading.getWuzifHisab()
                + reading.getKitat()
                + reading.getAdditionalHisab()
                + reading.getTechemariKfya();
        reading.setTekilalaTekefay(totalPayable);

        double deposit = customer.getCustomerBalanceBirr();
        if (deposit > 0.0) {
            double used = Math.min(deposit, totalPayable);
            reading.setKecreditYetekefele(used);
            reading.setTekilalaTekefay(totalPayable - used);
        } else {
            reading.setKecreditYetekefele(0.0);
        }

        com.wbill.home.dto.BillingReadingSummaryDTO summaryDTO = new com.wbill.home.dto.BillingReadingSummaryDTO();
        summaryDTO.setId(reading.getId());
        summaryDTO.setKifyaWer(reading.getKifyaWer());
        summaryDTO.setPreviousReading(reading.getPreviousReading());
        summaryDTO.setLastReading(reading.getLastReading());
        summaryDTO.setConsumption(reading.getConsumption());
        summaryDTO.setCustomerName(customer.getFullName());
        summaryDTO.setMeterNumber(customer.getMeterNumber());
        summaryDTO.setMeterSize(effectiveMeterSize != null ? String.valueOf(effectiveMeterSize.getMeterSize()) : "");
        summaryDTO.setInvoiceNumber(reading.getInvoiceNumber());
        summaryDTO.setIsBillGenerated(false);

        summaryDTO.setKotariKiray(reading.getKotariKiray());
        summaryDTO.setYezihWerFjotaKfya(reading.getYezihWerFjotaKfya());
        summaryDTO.setAdditionalHisab(reading.getAdditionalHisab());
        summaryDTO.setTechemariFieldName(reading.getTechemariFieldName());
        summaryDTO.setTechemariKfya(reading.getTechemariKfya());
        summaryDTO.setYezihWer(reading.getYezihWer());
        summaryDTO.setKitat(reading.getKitat());

        summaryDTO.setWuzifKotariKiray(reading.getWuzifKotariKiray());
        summaryDTO.setWuzifFjotaKfya(reading.getWuzifFjotaKfya());
        summaryDTO.setWuzifDerekKoshasha(reading.getWuzifDerekKoshasha());
        summaryDTO.setWuzifTechemariKfya(reading.getWuzifTechemariKfya());
        summaryDTO.setWuzifWorBzat(reading.getWuzifWorBzat());
        summaryDTO.setWuzifKezihEske(reading.getWuzifKezihEske());
        summaryDTO.setWuzifHisab(reading.getWuzifHisab());

        summaryDTO.setTemelashBirr(reading.getTemelashBirr());
        summaryDTO.setKecreditYetekefele(reading.getKecreditYetekefele());
        summaryDTO.setTekilalaTekefay(reading.getTekilalaTekefay());

        summaryDTO.setmBillingAdditionalPayment1Value(reading.getmBillingAdditionalPayment1Value());
        summaryDTO.setmBillingAdditionalPayment2Value(reading.getmBillingAdditionalPayment2Value());
        summaryDTO.setmBillingAdditionalPayment1Wuzif(reading.getmBillingAdditionalPayment1Wuzif());
        summaryDTO.setmBillingAdditionalPayment2Wuzif(reading.getmBillingAdditionalPayment2Wuzif());
        summaryDTO.setmBillingAdditionalPayment1ValueLable(reading.getmBillingAdditionalPayment1ValueLable());
        summaryDTO.setmBillingAdditionalPayment2ValueLable(reading.getmBillingAdditionalPayment2ValueLable());

        return new com.wbill.home.dto.ReadingDetailResponseDTO(summaryDTO, consumptionItems);
    }

    @Transactional(readOnly = true)
    public List<Integer> checkWuzifOccurrence(List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            return List.of();
        }
        List<Integer> result = new ArrayList<>();
        int chunkSize = 500;
        for (int i = 0; i < readingIds.size(); i += chunkSize) {
            List<Integer> chunk = readingIds.subList(i, Math.min(i + chunkSize, readingIds.size()));
            result.addAll(wuzifRepo.findReadingIdsWithActiveWuzif(chunk));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Integer> checkForHavingWuzif(List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            return List.of();
        }
        Map<Integer, Integer> readingToCustomerMap = new HashMap<>();
        Set<Integer> allCustomerIds = new java.util.HashSet<>();

        for (Integer id : readingIds) {
            BillingReading reading = readingRepo.findById(id).orElse(null);
            if (reading == null || reading.getBillingCustomerInfo() == null)
                continue;
            int customerId = reading.getBillingCustomerInfo().getId();
            readingToCustomerMap.put(id, customerId);
            allCustomerIds.add(customerId);
        }

        if (allCustomerIds.isEmpty()) {
            return List.of();
        }

        List<Integer> customerIdList = new ArrayList<>(allCustomerIds);
        Set<Integer> customersWithWuzif = new java.util.HashSet<>();
        int chunkSize = 500;
        for (int i = 0; i < customerIdList.size(); i += chunkSize) {
            List<Integer> chunk = customerIdList.subList(i, Math.min(i + chunkSize, customerIdList.size()));
            customersWithWuzif.addAll(wuzifRepo.findCustomerIdsWithActiveUnpaidWuzif(chunk));
        }

        List<Integer> result = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : readingToCustomerMap.entrySet()) {
            if (customersWithWuzif.contains(entry.getValue())) {
                result.add(entry.getKey());
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Integer> checkWuzifList(List<Integer> readingIds) {
        if (readingIds == null || readingIds.isEmpty()) {
            return List.of();
        }
        List<Integer> result = new ArrayList<>();
        int chunkSize = 500;
        for (int i = 0; i < readingIds.size(); i += chunkSize) {
            List<Integer> chunk = readingIds.subList(i, Math.min(i + chunkSize, readingIds.size()));
            result.addAll(wuzifRepo.findReadingIdsInWuzifList(chunk));
        }
        return result;
    }

    public static class BillingProcessResult {
        private int requested;
        private int processed;
        private final List<String> skipReasons = new ArrayList<>();

        public int getRequested() {
            return requested;
        }

        public void setRequested(int requested) {
            this.requested = requested;
        }

        public int getProcessed() {
            return processed;
        }

        public void setProcessed(int processed) {
            this.processed = processed;
        }

        public int getSkipped() {
            return skipReasons.size();
        }

        public List<String> getSkipReasons() {
            return skipReasons;
        }

        public void incrementProcessed() {
            this.processed++;
        }

        public void addSkipReason(String reason) {
            if (reason != null)
                skipReasons.add(reason);
        }
    }
}
