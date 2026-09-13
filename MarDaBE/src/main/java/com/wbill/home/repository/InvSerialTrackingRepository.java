package com.wbill.home.repository;

import com.wbill.home.model.InvSerialTracking;
import com.wbill.home.model.InvSerialTracking.SerialStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvSerialTrackingRepository extends JpaRepository<InvSerialTracking, Long> {
    List<InvSerialTracking> findByItemIdAndStoreIdAndStatus(long itemId, int storeId, SerialStatus status);
    List<InvSerialTracking> findByItemIdAndStatus(long itemId, SerialStatus status);
    Optional<InvSerialTracking> findBySerialNumber(String serialNumber);
    Optional<InvSerialTracking> findByMotorNumber(String motorNumber);
    Page<InvSerialTracking> findByItemId(long itemId, Pageable pageable);
    Page<InvSerialTracking> findByStoreId(int storeId, Pageable pageable);
    List<InvSerialTracking> findByExpiryDateBeforeAndStatus(LocalDate date, SerialStatus status);
    List<InvSerialTracking> findByBatchNumberAndItemId(String batchNumber, long itemId);
}
