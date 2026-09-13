package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.wbill.home.model.DocumontOnHand;

import java.util.List;
import java.util.Optional;

public interface DocumontOnHandRepository extends JpaRepository<DocumontOnHand, String> {

    List<DocumontOnHand> findByStatus(String status);

    @Query("SELECT d FROM DocumontOnHand d WHERE d.status = :status AND d.id = :id")
    Optional<DocumontOnHand> findByIdAndStatus(@Param("id") String id, @Param("status") String status);
}
