package com.mardaarif.service;

import com.mardaarif.model.Bill;
import com.mardaarif.model.BillStatus;
import com.mardaarif.model.Payment;
import com.mardaarif.repository.BillRepository;
import com.mardaarif.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BillRepository billRepository;

    /**
     * Record a payment for a bill (called when processing CSV sync file from bank).
     */
    public Payment recordPayment(Long billId, Double paidAmount, String paidOn,
                                  String bankName, String bankRef, String paymentMethod) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new RuntimeException("Bill not found: " + billId));

        // Update the bill status
        bill.setStatus(BillStatus.PAID);
        bill.setPaidAmount(paidAmount);
        bill.setPaidOn(paidOn);
        bill.setBankName(bankName);
        bill.setBankTransactionReference(bankRef);
        billRepository.save(bill);

        // Create payment record
        Payment payment = new Payment();
        payment.setBillId(billId);
        payment.setCityId(bill.getCityId());
        payment.setCustomerId(bill.getCustomerId());
        payment.setCustomerName(bill.getCustomerName());
        payment.setBillNumber(bill.getBillId());
        payment.setPaidAmount(paidAmount);
        payment.setPaidOn(paidOn);
        payment.setBankName(bankName);
        payment.setBankTransactionReference(bankRef);
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : "BANK");

        logger.info("[PaymentService] Recording payment for billId={}, amount={}", billId, paidAmount);
        return paymentRepository.save(payment);
    }

    /**
     * Get payments by city ID.
     */
    public List<Payment> getPaymentsByCity(Integer cityId) {
        return paymentRepository.findByCityId(cityId);
    }

    /**
     * Get payments with date range filter.
     */
    public List<Payment> getPaymentsByCityAndDateRange(Integer cityId, String fromDate, String toDate) {
        return paymentRepository.findByCityIdAndDateRange(cityId, fromDate, toDate);
    }

    /**
     * Get all payments.
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAllOrderByCreatedAtDesc();
    }

    /**
     * Search payments.
     */
    public List<Payment> searchPayments(String search, Integer cityId) {
        if (cityId != null) {
            return paymentRepository.searchPaymentsByCityId(cityId, search);
        }
        return paymentRepository.searchPayments(search);
    }

    /**
     * Reconcile a payment.
     */
    public Payment reconcilePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        payment.setReconciled(true);
        payment.setReconciledAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    /**
     * Bulk reconcile payments.
     */
    public List<Payment> bulkReconcile(List<Long> paymentIds) {
        List<Payment> payments = paymentRepository.findAllById(paymentIds);
        LocalDateTime now = LocalDateTime.now();
        payments.forEach(p -> {
            p.setReconciled(true);
            p.setReconciledAt(now);
        });
        return paymentRepository.saveAll(payments);
    }

    /**
     * Get payment by ID.
     */
    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }
}
