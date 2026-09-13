package com.wbill.home.repository;

import com.wbill.home.model.CompanyProfile;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfile, Integer> {
    List<CompanyProfile> findByStatus(String status);
    CompanyProfile findFirstByOrderByIdDesc();
	//List<CompanyProfile> findByStatus(String status);  
//	List<CampanyProfile> findByStatusAndIsCard(String status,String IsCard);  
}