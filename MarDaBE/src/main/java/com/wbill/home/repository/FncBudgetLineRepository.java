package com.wbill.home.repository;

import com.wbill.home.model.FncBudgetLine;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FncBudgetLineRepository extends JpaRepository<FncBudgetLine, Long> {
    List<FncBudgetLine> findByBudgetId(int budgetId);
    void deleteByBudgetId(int budgetId);
}
