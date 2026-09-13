package com.mardaarif.controller;

import com.mardaarif.model.BillStatus;
import com.mardaarif.repository.BillRepository;
import com.mardaarif.repository.CityRepository;
import com.mardaarif.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalCities", cityRepository.count());
        stats.put("activeCities", cityRepository.findByActiveTrue().size());
        stats.put("totalBills", billRepository.count());
        stats.put("pendingBills", billRepository.countByStatus(BillStatus.PENDING));
        stats.put("paidBills", billRepository.countByStatus(BillStatus.PAID));
        stats.put("cancelledBills", billRepository.countByStatus(BillStatus.CANCELLED));
        stats.put("totalPaidAmount", billRepository.totalPaidAmount());
        stats.put("totalPendingAmount", billRepository.totalPendingAmount());
        stats.put("totalPayments", paymentRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/city-stats")
    public ResponseEntity<List<Map<String, Object>>> getCityStats() {
        List<Map<String, Object>> cityStats = new ArrayList<>();

        cityRepository.findAll().forEach(city -> {
            Map<String, Object> stat = new LinkedHashMap<>();
            stat.put("cityId", city.getId());
            stat.put("cityName", city.getCityName());
            stat.put("cityCode", city.getCityCode());
            stat.put("isActive", city.isActive());
            stat.put("lastSyncAt", city.getLastSyncAt());
            stat.put("totalBills", billRepository.countByCityId(city.getId()));
            stat.put("pendingBills", billRepository.countByCityIdAndStatus(city.getId(), BillStatus.PENDING));
            stat.put("paidBills", billRepository.countByCityIdAndStatus(city.getId(), BillStatus.PAID));
            stat.put("totalPaidAmount", billRepository.totalPaidAmountByCityId(city.getId()));
            stat.put("totalPayments", paymentRepository.countByCityId(city.getId()));
            cityStats.add(stat);
        });

        return ResponseEntity.ok(cityStats);
    }

    @GetMapping("/recent-payments")
    public ResponseEntity<?> getRecentPayments() {
        var payments = paymentRepository.findAllOrderByCreatedAtDesc();
        // Return max 20 recent payments
        int limit = Math.min(payments.size(), 20);
        return ResponseEntity.ok(payments.subList(0, limit));
    }
}
