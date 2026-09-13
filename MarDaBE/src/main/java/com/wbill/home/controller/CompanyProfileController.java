package com.wbill.home.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wbill.home.dto.CompanyProfileDTO;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.service.CompanyProfileService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//// This Class is REST API
//@CrossOrigin(origins = "*", maxAge = 3600)
@CrossOrigin(origins = "http://192.168.100.106:9000")

@RestController
@RequestMapping("/api/card_managenment")
public class CompanyProfileController {

	@Autowired
	private CompanyProfileService CompanyProfileService;

	@GetMapping("/CompanyProfileByStatus/{status}")
	public List<CompanyProfile> getAllCompanyProfileByStatus(@PathVariable String status) {
		return CompanyProfileService.getAllCompanyProfile(status);
	}

	// @GetMapping("/CompanyProfileByStatusAndIsCard/{status}/{IsCard}")
	// public List<PaymentCatagory>
	// getAllPaymentCatagoryByStatusAndIsCard(@PathVariable String
	// status,@PathVariable String IsCard){
	// return
	// paymentCatagoryService.getAllPaymentCatagoryByStatusAndIsCard(status,IsCard);
	// }
	// create Customer REST API
	@PostMapping("/CompanyProfile")
	public ResponseEntity<CompanyProfile> createCompanyProfile(@RequestBody CompanyProfile CompanyProfile) {

		CompanyProfile _CompanyProfile = CompanyProfileService.createCompanyProfile(CompanyProfile);
		return new ResponseEntity<>(_CompanyProfile, HttpStatus.CREATED);
	}

	// Update customer REST API
	// @PutMapping("/CompanyProfile/{id}")
	// public ResponseEntity<CompanyProfile> updateCompanyProfileById(@PathVariable
	// Integer id,
	// @RequestBody CompanyProfile CompanyProfileDetials) {
	//
	// CompanyProfile CompanyProfile =
	// CompanyProfileService.getCompanyProfileById(id);
	// CompanyProfile.setCode(CompanyProfileDetials.getCode());
	// CompanyProfile.setName(CompanyProfileDetials.getName());
	// CompanyProfile
	// updateCompanyProfile=CompanyProfileService.updateCompanyProfile(CompanyProfile);
	// return ResponseEntity.ok(updateCompanyProfile);
	// }
	@PutMapping("/deactivateCompanyProfile")
	public ResponseEntity<Object> deactivateCompanyProfile(@RequestBody CompanyProfile CompanyProfileDetials) {

		CompanyProfile CompanyProfile = CompanyProfileService.getCompanyProfileById(CompanyProfileDetials.getId());

		CompanyProfile.setStatus("Deactive");
		CompanyProfileService.updateCompanyProfile(CompanyProfile);
		Map<String, Object> data = new HashMap<>();
		data.put("status", 1);
		data.put("message", "Successfuly Deactivated !");
		return new ResponseEntity<>(data, HttpStatus.OK);

	}

	@GetMapping("/settings")
	public ResponseEntity<CompanyProfileDTO> getCompanySettings() {
		return ResponseEntity.ok(CompanyProfileService.getSettings());
	}

	// Fetch the latest (single) company profile row for update-only UI
	@GetMapping("/company-profile/latest")
	public ResponseEntity<CompanyProfile> getLatestCompanyProfile() {
		CompanyProfile latest = CompanyProfileService.getLatestProfile();
		if (latest == null) {
			return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
		}
		return ResponseEntity.ok(latest);
	}

	// Fetch specific company profile by id
	@GetMapping("/company-profile/{id}")
	public ResponseEntity<CompanyProfile> getCompanyProfileById(@PathVariable Integer id) {
		try {
			CompanyProfile cp = CompanyProfileService.getCompanyProfileById(id);
			return ResponseEntity.ok(cp);
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
		}
	}

	// Update the company profile by id (update-only semantics)
	@PutMapping("/company-profile/{id}")
	public ResponseEntity<CompanyProfile> updateCompanyProfile(@PathVariable Integer id,
			@RequestBody CompanyProfile incoming) {
		CompanyProfile existing = CompanyProfileService.getCompanyProfileById(id);
		// Copy mutable fields from incoming to existing (for brevity, replace all
		// simple fields)
		// In a real app, consider a DTO and explicit mapping.
		incoming.setId(existing.getId());
		CompanyProfile updated = CompanyProfileService.updateCompanyProfile(incoming);
		return ResponseEntity.ok(updated);
	}

	// Initialize a default company profile if none exists
	@PostMapping("/company-profile/initialize")
	public ResponseEntity<CompanyProfile> initializeCompanyProfile() {
		CompanyProfile initialized = CompanyProfileService.initializeIfMissing();
		return ResponseEntity.status(HttpStatus.CREATED).body(initialized);
	}

}
