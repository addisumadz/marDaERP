package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsTaxBracket;

@Repository
public interface HrmsTaxBracketRepository extends JpaRepository<HrmsTaxBracket, Integer> {
    List<HrmsTaxBracket> findByDeletedFalseOrderByWeightAsc();
}
