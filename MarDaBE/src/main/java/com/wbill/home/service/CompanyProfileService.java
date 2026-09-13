package com.wbill.home.service;    
 

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wbill.home.dto.CompanyProfileDTO;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.repository.CompanyProfileRepository;

 

@Service
public class CompanyProfileService {
	@Autowired
	CompanyProfileRepository CompanyProfileRepository;
	  
 public List<CompanyProfile> getAllCompanyProfile(String status)
 {
	   List<CompanyProfile> allPaymentCatagory=new ArrayList<CompanyProfile>();
	   CompanyProfileRepository.findByStatus(status).forEach(allPaymentCatagory::add);
	   return allPaymentCatagory;

	   
 } 
// public List<PaymentCatagory> getAllPaymentCatagoryByStatusAndIsCard(String status,String IsCard)
// {
//	   List<PaymentCatagory> allPaymentCatagory=new ArrayList<PaymentCatagory>();
//	   paymentCatagoryRepository.findByStatusAndIsCard(status,IsCard).forEach(allPaymentCatagory::add);
//	   return allPaymentCatagory;
//
//	   
// }
 public CompanyProfile createCompanyProfile(CompanyProfile CompanyProfile)
 {
	  
	 return  CompanyProfileRepository.save(CompanyProfile);
 }
 
 public CompanyProfile updateCompanyProfile(CompanyProfile CompanyProfile)
 {
	  
	 CompanyProfileRepository.save(CompanyProfile);
	   return CompanyProfile;
 }
 
 public CompanyProfile getCompanyProfileById(Integer id)
 {
	 CompanyProfile CompanyProfile = CompanyProfileRepository.findById(id)
				.orElseThrow();
		return CompanyProfile; 
 }
 
 public CompanyProfileDTO getSettings() {
     CompanyProfile profile = CompanyProfileRepository.findFirstByOrderByIdDesc(); // Get the first profile
     CompanyProfileDTO dto = new CompanyProfileDTO();
     dto.setAutoGiveAccountNumber(profile.isAutoGiveAccountNumber());
     return dto;
 }

  // Get the single current profile (latest by id). This is used for single-row update UI.
  public CompanyProfile getLatestProfile() {
      return CompanyProfileRepository.findFirstByOrderByIdDesc();
  }

  // Initialize a default company profile if none exists
  public CompanyProfile initializeIfMissing() {
      CompanyProfile existing = CompanyProfileRepository.findFirstByOrderByIdDesc();
      if (existing != null) {
          return existing;
      }
      CompanyProfile p = new CompanyProfile();
      p.setCompanyName("Company");
      p.setCompanyNameAmh("ኩባንያ");
      p.setTin("");
      p.setOfficePhoneNumber("");
      p.setMobilePhoneNumber("");
      p.setEmail("");
      p.setPoBox("");
      p.setFaxNumber("");
      p.setWebsiteAddress("");
      p.setLocationEng("");
      p.setLocationAmh("");
      p.setReportHeader("");
      p.setReportFooter("");
      p.setCompanyMoto("");
      p.setDefaultPageRow(10);
      p.setSalesWithNegativeStock(false);
      p.setActivateEmail(false);
      p.setActivateSms(false);
      p.setShowImportReadingExcel(false);
      p.setActivateForceAllRecorded(false);
      p.setDefaultBillGenerateIsMoneyCollected(false);
      p.setConnectedToBank(false);
      p.setAutoGiveAccountNumber(false);
      p.setAccountNumberTagWithKebele(false);
      p.setAccountNumberKebeleLength(0);
      p.setActivateDashboardConnectToDerash(false);
      p.setNumberOfPaymentDates(0);
      p.setTemplateBillSms(null);
      p.setTemplateCustomerReplyBillSms(null);
      p.setTemplateDerashMessage(null);
      p.setActivateUser(false);
      p.setActivateSecondUser("");
      p.setAccountNumberCompanyShortCode("");
      p.setStatus("Active");
      p.setDeleted("active");
      p.setActivateManualMrn(false);
      p.setuCompanyUri("N/A");
      p.setuCompanyFileUrl("N/A");
      p.setuCompanyKey("N/A");
      p.setdCompanyUri("N/A");
      p.setdCompanyKey("N/A");
      p.setdCompanySecret("N/A");
      p.setdFileUsername("");
      p.setdFilePassword("");
      p.setdFileAuthenticationUrl("");
      p.setdFileUploadUrl("");
      p.setConnectedToDerash(false);
      p.setConnectedToUnicash(false);
      p.setNumberOfDigitsForCustomer(0);
      p.setSebsabi("");
      p.setTerekabi("");
      p.setArekakabi("");
      p.setHalafinet1("");
      p.setHalafinet2("");
      p.setHalafinet3("");
      p.setCalendarAddActiveMonthForward(0);
      p.setOverRideMobileReadingMonth(false);
      p.setAllowEnterReadingWhileOtherMonthNotSentToZgjt(false);
      p.setOnBillPreparation(false);
      p.setBillPreparationBrowserId("");
      p.setFilename1("");
      p.setFilename2("");
      p.setFilename3("");
      p.setFilename4("");
      p.setFilename5("");
      p.setActiveBudgetYearCode("");
      p.setAllowUnderReading(false);
      p.setOfficePaymentOpen(false);
      p.setAllowNegative(false);
      p.setBudgetYear(0);
      p.setPopulationSize(0);
      p.setAverageFamilySize(0);
      p.setNumberOfBonoHouseholds(0);
      p.setTotalNumberOfFullTimeStaff(0);
      p.setContextBillingWater("");
      p.setContextBaseIpAddress("");
      return CompanyProfileRepository.save(p);
  }
}
