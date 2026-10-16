package com.wbill.home.service;

import com.wbill.home.dto.CashierPaymentUpdateDTO;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.util.EthiopianCalendarConverter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Service
public class FrontOfficePaymentService {

    private final BillingReadingRepository readingRepository;
    private final UserAccountRepository userRepo;
    private final BankPaymentImportService bankPaymentImportService;
    private final CompanyProfileService companyProfileService;

    public FrontOfficePaymentService(BillingReadingRepository readingRepository,
                                     UserAccountRepository userRepo,
                                     BankPaymentImportService bankPaymentImportService,
                                     CompanyProfileService companyProfileService) {
        this.readingRepository = readingRepository;
        this.userRepo = userRepo;
        this.bankPaymentImportService = bankPaymentImportService;
        this.companyProfileService = companyProfileService;
    }

    @Transactional
    public BillingReading applyCashierPayment(Integer id, CashierPaymentUpdateDTO dto) {
        if (id == null) throw new IllegalArgumentException("Reading ID cannot be null");
        Optional<BillingReading> opt = readingRepository.findById(id);
        if (opt.isEmpty()) throw new IllegalArgumentException("BillingReading not found with ID: " + id);

        BillingReading reading = opt.get();

        // Validation
        if (!reading.isBillGenerated()) {
            throw new IllegalStateException("Bill not generated for record with ID " + id);
        }
        if (reading.isPaidOnFrontOffice() || reading.isDerashPaid() || reading.isPaidThroughBank() || reading.isUnicashPaid()) {
            throw new IllegalStateException("Record with ID " + id + " is already paid");
        }

        // Validate payment is allowed ONLY for the active billing month
        if (companyProfileService != null) {
            try {
                CompanyProfile profile = companyProfileService.getLatestProfile();
                if (profile != null && profile.getActiveBillingMonth() != null) {
                    EthiopianCalendarConverter.EthiopianDate ethDate =
                            EthiopianCalendarConverter.gregorianToEthiopian(profile.getActiveBillingMonth());
                    String monthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth());
                    String activeKifyaWer = monthName + ", " + ethDate.getYear();

                    String billKifyaWer = reading.getKifyaWer();
                    if (billKifyaWer != null && !billKifyaWer.trim().isEmpty()) {
                        String normActive = activeKifyaWer.trim().replaceAll("\\s*,\\s*", ", ");
                        String normBill = billKifyaWer.trim().replaceAll("\\s*,\\s*", ", ");
                        if (!normActive.equalsIgnoreCase(normBill)) {
                            throw new IllegalStateException("ክፍያ የሚፈቀደው ለአሁኑ ንቁ ወር ብቻ ነው (" + activeKifyaWer + ")። የዚህ ቢል ክፍያ ወር " + billKifyaWer + " ነው።");
                        }
                    }
                }
            } catch (IllegalStateException e) {
                throw e;
            } catch (Exception ex) {
                // Ignore unexpected calendar conversion error so legitimate payment isn't blocked if profile is malformed
            }
        }

        Double amount = dto.getAmount();
        if (amount == null) throw new IllegalArgumentException("Amount is required");
        double expected = reading.getTekilalaTekefay();
        if (Math.abs(expected - amount) > 0.01d) {
            throw new IllegalArgumentException("Payment mismatch: amount " + amount + " != bill " + expected);
        }

        // Set payment flags and fields
        reading.setPaidOnFrontOffice(true);
        reading.setMoneyCollected(true);
        Date collectDate = dto.getMoneyCollectedDate() != null ? dto.getMoneyCollectedDate() : new Date();
        reading.setMoneyCollectedDate(collectDate);
        reading.setTekilalaYetekefele(reading.getKecreditYetekefele() + amount);
        reading.setModifiedDate(new Date());
        if (dto.getRemark() != null && !dto.getRemark().trim().isEmpty()) {
            String r = reading.getRemark();
            reading.setRemark((r != null && !r.isEmpty() ? (r + "\n") : "") + dto.getRemark().trim());
        }

        // Link cashier user if provided, or fallback to authenticated principal
        if (dto.getCashierUserId() != null) {
            Optional<UserAccount> u = userRepo.findById(dto.getCashierUserId());
            u.ifPresent(reading::setCashierUser);
        } else {
            try {
                org.springframework.security.core.Authentication auth =
                        org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && !"anonymousUser".equalsIgnoreCase(auth.getName())) {
                    userRepo.findByUserNameAndStatusAndDeleted(auth.getName(), "active", "active")
                            .ifPresent(reading::setCashierUser);
                }
            } catch (Exception ignored) {
            }
        }

        BillingReading saved = readingRepository.save(reading);

        // Reuse bank payment post-processing to ensure identical Wuzif/Penalty updates
        bankPaymentImportService.processPaymentRelatedUpdates(saved);

        return saved;
    }
}
