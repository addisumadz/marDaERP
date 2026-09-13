package com.wbill.home.repository;

import com.wbill.home.model.CustomNewLineAdditionalFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomNewLineAdditionalFeeRepository extends JpaRepository<CustomNewLineAdditionalFee, Long> {
    List<CustomNewLineAdditionalFee> findByRequestIdOrderByIdAsc(Long requestId);
    void deleteByRequestId(Long requestId);
}
