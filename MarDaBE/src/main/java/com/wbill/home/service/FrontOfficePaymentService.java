package com.wbill.home.service;

import com.wbill.home.dto.CashierPaymentUpdateDTO;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.UserAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Optional;

@Service
public class FrontOfficePaymentService {

    private final BillingReadingRepository readingRepository;
    private final UserAccountRepository userRepo;
    private final BankPaymentImportService bankPaymentImportService;

    public FrontOfficePaymentService(BillingReadingRepository readingRepository,
                                     UserAccountRepository userRepo,
                                     BankPaymentImportService bankPaymentImportService) {
        this.readingRepository = readingRepository;
        this.userRepo = userRepo;
        this.bankPaymentImportService = bankPaymentImportService;
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

        // Link cashier user if provided
        if (dto.getCashierUserId() != null) {
            Optional<UserAccount> u = userRepo.findById(dto.getCashierUserId());
            u.ifPresent(reading::setCashierUser);
        }

        BillingReading saved = readingRepository.save(reading);

        // Reuse bank payment post-processing to ensure identical Wuzif/Penalty updates
        bankPaymentImportService.processPaymentRelatedUpdates(saved);

        return saved;
    }
}
