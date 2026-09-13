package com.wbill.home.repository;

import com.wbill.home.model.CustomNewLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomNewLineItemRepository extends JpaRepository<CustomNewLineItem, Long> {
    List<CustomNewLineItem> findByRequestIdOrderByIdAsc(Long requestId);
    void deleteByRequestId(Long requestId);
}
