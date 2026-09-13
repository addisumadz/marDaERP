

package com.wbill.home.repository;

import com.wbill.home.model.BillingTerminationReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BillingTerminationReasonRepository extends JpaRepository<BillingTerminationReason, Integer> {
    //("SELECT s FROM BillingTerminationReason s WHERE s.deleted = 'active' ORDER BY s.id ASC")

    // You can also use the derived method name: findAllByOrderByTerminationReasonAsc()
    @Query("SELECT r FROM BillingTerminationReason r WHERE r.deleted = 'active'  ORDER BY r.terminationReason ASC")
    List<BillingTerminationReason> findAllActive();
}