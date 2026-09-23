package com.wbill.home.controller;

import com.wbill.home.dto.BillingCustomerInfoDTO;
import com.wbill.home.dto.CustomerImportReport;

import com.wbill.home.dto.CompanyProfileDTO;
import com.wbill.home.dto.CustomerDeactivateDTO;
import com.wbill.home.dto.CustomerListDTO;
import com.wbill.home.dto.MeterCreateUpdateDTO;
import com.wbill.home.dto.AssignReaderDTO;
import com.wbill.home.dto.AdditionalMonthlyPaymentBulkUpdateDTO;

import com.wbill.home.mapper.CustomerMapper;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.service.BillingCustomerInfoService;
import com.wbill.home.service.CompanyProfileService;
import com.wbill.home.service.CustomerImportService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/mardaerp/customer")
public class BillingCustomerInfoController {
    // System.out.println("Finding customer with id: ");

    @Autowired
    private CompanyProfileService companyProfileService;
    @Autowired
    private CustomerImportService customerImportService;

    @Autowired
    private BillingCustomerInfoService billingCustomerInfoService;

    public BillingCustomerInfoController(BillingCustomerInfoService billingCustomerInfoService) { // CORRECT NAME
        this.billingCustomerInfoService = billingCustomerInfoService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<BillingCustomerInfoDTO>> getAllCustomers() {
        System.out.println("customer list");
        List<BillingCustomerInfoDTO> customers = billingCustomerInfoService.getAllCustomers();
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/customers/paginated/{status}")
    public ResponseEntity<Page<CustomerListDTO>> findByStatusPaginated(
            @PathVariable String status,
            Pageable pageable) {
        System.out.println("customer list");

        Page<CustomerListDTO> page = billingCustomerInfoService.findByStatusPaginated(status, pageable);
        return new ResponseEntity<>(page, HttpStatus.OK);
    }

    @GetMapping("/customers/paginated-filtered")
    public ResponseEntity<Page<CustomerListDTO>> findFilteredByStatus(
            @RequestParam String status,
            @RequestParam(required = false) Integer customerTypeId,
            @RequestParam(required = false) Integer kebeleId,
            @RequestParam(required = false) Integer ketenaId,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) Integer readerId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        Page<CustomerListDTO> page = billingCustomerInfoService.findFilteredByStatus(
                status, customerTypeId, kebeleId, ketenaId, branchId, readerId, search, pageable);
        return new ResponseEntity<>(page, HttpStatus.OK);
    }


    @GetMapping("/customer/{id}")
    public ResponseEntity<BillingCustomerInfoDTO> findCustomerById(@PathVariable Integer id) {
        System.out.println("Finding customer with id: " + id);

        return billingCustomerInfoService.findById(id)
                .map(customerDto -> new ResponseEntity<>(customerDto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/withoutReading")
    public ResponseEntity<List<CustomerListDTO>> getCustomersWithoutReading(@RequestParam String kifyaWer) {
        List<CustomerListDTO> customers = billingCustomerInfoService.getCustomersWithoutReading(kifyaWer);
        return ResponseEntity.ok(customers);
    }

    /**
     * Find a customer by account number.
     */
    @GetMapping("/by-account-number")
    public ResponseEntity<BillingCustomerInfoDTO> findByAccountNumber(@RequestParam String accountNumber) {
        System.out.println("Finding customer with account number: " + accountNumber);
        return billingCustomerInfoService.findByAccountNumber(accountNumber)
                .map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // CREATE a new customer
    // @PostMapping
    // public ResponseEntity<BillingCustomerInfo> createCustomer(@RequestBody
    // BillingCustomerInfoDTO customerDTO) {
    // BillingCustomerInfo newCustomer =
    // billingCustomerInfoService.createCustomer(customerDTO);
    // return new ResponseEntity<>(newCustomer, HttpStatus.CREATED);
    // }

    @PostMapping
    public ResponseEntity<BillingCustomerInfoDTO> createCustomer(@RequestBody BillingCustomerInfoDTO customerDTO) {
        BillingCustomerInfo newCustomer = billingCustomerInfoService.createCustomer(customerDTO);
        return new ResponseEntity<>(CustomerMapper.toDto(newCustomer), HttpStatus.CREATED);
    }

    // UPDATE an existing customer
    @PutMapping("/{id}")
    public ResponseEntity<BillingCustomerInfo> updateCustomer(@PathVariable Integer id,
            @RequestBody BillingCustomerInfoDTO customerDTO) {
        BillingCustomerInfo updatedCustomer = billingCustomerInfoService.updateCustomer(id, customerDTO);
        return ResponseEntity.ok(updatedCustomer);
    }

    // DEACTIVATE a customer (Soft Delete)
    // @PutMapping("/{id}/deactivate")
    // public ResponseEntity<Void> deactivateCustomer(@PathVariable Integer id) {
    // billingCustomerInfoService.deactivateCustomer(id);
    // return ResponseEntity.noContent().build();
    // }

    @GetMapping("/next-account-number")
    public ResponseEntity<String> getNextAccountNumber(@RequestParam Integer kebeleId) {
        String nextAccountNumber = billingCustomerInfoService.generateNextAccountNumber(kebeleId);
        System.out.println("next Account Number" + nextAccountNumber);

        return ResponseEntity.ok(nextAccountNumber);
    }

    @GetMapping("/settings")
    public ResponseEntity<CompanyProfileDTO> getCompanySettings() {
        return ResponseEntity.ok(companyProfileService.getSettings());
    }

    // ================meter no CRUD ================

    @GetMapping("/{customerId}/meters")
    public ResponseEntity<List<MeterCreateUpdateDTO>> getMetersByCustomer(@PathVariable Integer customerId) {
        List<MeterCreateUpdateDTO> meters = billingCustomerInfoService.getMetersByCustomer(customerId);
        return new ResponseEntity<>(meters, HttpStatus.OK);
    }

    @PostMapping("/{customerId}/meters")
    public ResponseEntity<MeterCreateUpdateDTO> createMeter(@PathVariable Integer customerId,
            @RequestBody MeterCreateUpdateDTO dto) {
        MeterCreateUpdateDTO created = billingCustomerInfoService.createMeter(customerId, dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/meters/{meterId}")
    public ResponseEntity<MeterCreateUpdateDTO> updateMeter(@PathVariable Integer meterId,
            @RequestBody MeterCreateUpdateDTO dto) {
        MeterCreateUpdateDTO updated = billingCustomerInfoService.updateMeter(meterId, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/meters/{meterId}")
    public ResponseEntity<Void> deleteMeter(@PathVariable Integer meterId) {
        billingCustomerInfoService.deleteMeter(meterId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ==========================================================
    /**
     * PUT endpoint to activate a customer.
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateCustomer(@PathVariable Integer id) {
        billingCustomerInfoService.activateCustomer(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Handles the request to deactivate a customer.
     * 
     * @param id            The ID of the customer to deactivate.
     * @param deactivateDTO The request body containing the reason and remark.
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateCustomer(
            @PathVariable Integer id,
            @RequestBody CustomerDeactivateDTO deactivateDTO) {

        billingCustomerInfoService.deactivateCustomer(id, deactivateDTO);
        return ResponseEntity.noContent().build();
    }

    /**
     * Completely delete (finalize deletion) of a customer.
     * This marks the record as permanently deleted without removing it from the
     * database.
     */
    @PutMapping("/{id}/complete-delete")
    public ResponseEntity<Void> completeDeleteCustomer(@PathVariable Integer id) {
        billingCustomerInfoService.completeDeleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // // IMPORT customers from an Excel file
    // @PostMapping("/import")
    // public ResponseEntity<String> importCustomers(@RequestParam("file")
    // MultipartFile file) {
    // try {
    // billingCustomerInfoService.importCustomersFromExcel(file.getInputStream());
    // return ResponseEntity.ok("Customers imported successfully.");
    // } catch (IOException e) {
    // return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed
    // to import customers: " + e.getMessage());
    // }
    // }
    // ===================================================
    // @GetMapping("/customer/{id}")
    // public ResponseEntity<BillingCustomerInfo> findCustomerById(@PathVariable
    // Integer id) {
    // System.out.println("test id "+id);
    //
    // return billingCustomerInfoService.findById(id)
    // .map(customer -> new ResponseEntity<>(customer, HttpStatus.OK))
    // .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    // }

    //
    // @GetMapping
    // public ResponseEntity<List<BillingCustomerInfo>> getAllBillingCustomerInfo()
    // {
    // List<BillingCustomerInfo> customerInfoList =
    // billingCustomerInfoService.getAllBillingCustomerInfo();
    // return new ResponseEntity<>(customerInfoList, HttpStatus.OK);
    // }
    //
    // @GetMapping("/{id}")
    // public ResponseEntity<BillingCustomerInfo>
    // getBillingCustomerInfoById(@PathVariable int id) {
    // Optional<BillingCustomerInfo> customerInfo =
    // billingCustomerInfoService.getBillingCustomerInfoById(id);
    // return customerInfo.map(info -> new ResponseEntity<>(info, HttpStatus.OK))
    // .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    // }
    //
    // @PostMapping
    // public ResponseEntity<BillingCustomerInfo>
    // createBillingCustomerInfo(@RequestBody BillingCustomerInfo
    // billingCustomerInfo) {
    // BillingCustomerInfo savedCustomerInfo =
    // billingCustomerInfoService.saveBillingCustomerInfo(billingCustomerInfo);
    // return new ResponseEntity<>(savedCustomerInfo, HttpStatus.CREATED);
    // }
    //
    // @PutMapping("/{id}")
    // public ResponseEntity<BillingCustomerInfo>
    // updateBillingCustomerInfo(@PathVariable int id, @RequestBody
    // BillingCustomerInfo billingCustomerInfo) {
    // Optional<BillingCustomerInfo> existingCustomerInfo =
    // billingCustomerInfoService.getBillingCustomerInfoById(id);
    // if (existingCustomerInfo.isPresent()) {
    // billingCustomerInfo.setId(id); // Ensure the ID is set for update
    // BillingCustomerInfo updatedCustomerInfo =
    // billingCustomerInfoService.saveBillingCustomerInfo(billingCustomerInfo);
    // return new ResponseEntity<>(updatedCustomerInfo, HttpStatus.OK);
    // } else {
    // return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    // }
    // }
    //
    // @DeleteMapping("/{id}")
    // public ResponseEntity<Void> deleteBillingCustomerInfo(@PathVariable int id) {
    // if (billingCustomerInfoService.getBillingCustomerInfoById(id).isPresent()) {
    // billingCustomerInfoService.deleteBillingCustomerInfo(id);
    // return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    // } else {
    // return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    // }
    // }
    //
    // // Controller endpoints for NamedQueries
    //
    // @GetMapping("/all-ordered-by-id")
    // public ResponseEntity<List<BillingCustomerInfo>> findAllOrderedById() {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findAllOrderedById();
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    //// @GetMapping("/latest-id")
    //// public ResponseEntity<List<BillingCustomerInfo>> findLatestId() {
    //// List<BillingCustomerInfo> list = billingCustomerInfoService.findLatestId();
    //// return new ResponseEntity<>(list, HttpStatus.OK);
    //// }
    // @GetMapping("/latest-id")
    // public ResponseEntity<BillingCustomerInfo> findLatestId() {
    // BillingCustomerInfo list = billingCustomerInfoService.findLatestId();
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    // @GetMapping("/latest-id-by-account-number")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findLatestIdOrderByAccountNumber() {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findLatestIdOrderByAccountNumber();
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/latest-id-by-account-number-and-street/{addressStreetsId}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findLatestIdOrderByAccountNumberAndStreet(@PathVariable int addressStreetsId)
    // {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findLatestIdOrderByAccountNumberAndStreet(addressStreetsId);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    //// @GetMapping("/latest-id-by-count-number")
    //// public ResponseEntity<List<BillingCustomerInfo>>
    // findLatestIdOrderByCountNumber() {
    //// List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByLatestIdOBCounN();
    //// return new ResponseEntity<>(list, HttpStatus.OK);
    //// }
    //
    // @GetMapping("/by-full-name")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByFullNameAndStatus(@RequestParam String fullName, @RequestParam String
    // status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByFullNameAndStatus(fullName, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-account-number")
    // public ResponseEntity<BillingCustomerInfo>
    // findByAccountNumberAndStatus(@RequestParam String accountNumber,
    // @RequestParam String status) {
    // Optional<BillingCustomerInfo> customerInfo =
    // billingCustomerInfoService.findByAccountNumberAndStatus(accountNumber,
    // status);
    // return customerInfo.map(info -> new ResponseEntity<>(info, HttpStatus.OK))
    // .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    // }
    //
    // @GetMapping("/by-house-number/{houseNumber}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByHouseNumber(@PathVariable String houseNumber) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByHouseNumber(houseNumber);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-meter-number")
    // public ResponseEntity<BillingCustomerInfo>
    // findByMeterNumberAndStatus(@RequestParam String meterNumber, @RequestParam
    // String status) {
    // Optional<BillingCustomerInfo> customerInfo =
    // billingCustomerInfoService.findByMeterNumberAndStatus(meterNumber, status);
    // return customerInfo.map(info -> new ResponseEntity<>(info, HttpStatus.OK))
    // .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    // }
    //
    // @GetMapping("/by-meter-size/{meterSizeId}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByMeterSize(@PathVariable int meterSizeId) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByMeterSize(meterSizeId);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-count-number/{countNumber}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByCountNumber(@PathVariable String countNumber) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByCountNumber(countNumber);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }

    //
    // @GetMapping("/by-status-yekoye")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByStatusYekoye(@RequestParam boolean oldHasPenalty, @RequestParam String
    // status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByStatusYekoye(oldHasPenalty, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    //// @GetMapping("/count-by-status/{status}")
    //// public ResponseEntity<Long> getCountByStatus(@PathVariable String status) {
    //// Long count = billingCustomerInfoService.getCountByStatus(status);
    //// return new ResponseEntity<>(count, HttpStatus.OK);
    //// }
    //
    // @GetMapping("/count-by-year-month-status")
    // public ResponseEntity<Long> getCountByYearMonthAndStatus(@RequestParam int
    // canceledYear, @RequestParam int canceledMonth, @RequestParam String status) {
    // Long count =
    // billingCustomerInfoService.getCountByYearMonthAndStatus(canceledYear,
    // canceledMonth, status);
    // return new ResponseEntity<>(count, HttpStatus.OK);
    // }
    //
    // @GetMapping("/count-by-branch-status")
    // public ResponseEntity<Long> getCountByBranchAndStatus(@RequestParam int
    // branchsId, @RequestParam String status) {
    // Long count = billingCustomerInfoService.getCountByBranchAndStatus(branchsId,
    // status);
    // return new ResponseEntity<>(count, HttpStatus.OK);
    // }
    //
    // @GetMapping("/count-by-type-status")
    // public ResponseEntity<Long> getCountByTypeAndStatus(@RequestParam int
    // customerTypeId, @RequestParam String status) {
    // Long count =
    // billingCustomerInfoService.getCountByTypeAndStatus(customerTypeId, status);
    // return new ResponseEntity<>(count, HttpStatus.OK);
    // }
    //
    // @GetMapping("/count-by-meter-size-status")
    // public ResponseEntity<Long> getCountByMeterSizeAndStatus(@RequestParam int
    // meterSizeId, @RequestParam String status) {
    // Long count =
    // billingCustomerInfoService.getCountByMeterSizeAndStatus(meterSizeId, status);
    // return new ResponseEntity<>(count, HttpStatus.OK);
    // }
    //
    // @GetMapping("/count-by-registered-year-month-status")
    // public ResponseEntity<Long>
    // getCountByRegisteredYearMonthAndStatus(@RequestParam int registeredYear,
    // @RequestParam int registeredMonth, @RequestParam String status) {
    // Long count =
    // billingCustomerInfoService.getCountByRegisteredYearMonthAndStatus(registeredYear,
    // registeredMonth, status);
    // return new ResponseEntity<>(count, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-status-assigned/{status}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByStatusAssigned(@PathVariable String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByStatusAssigned(status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/users-by-status-grouped/{status}")
    // public ResponseEntity<List<UserAccount>>
    // findUsersByStatusGrouped(@PathVariable String status) {
    // List<UserAccount> list =
    // billingCustomerInfoService.findUsersByStatusGrouped(status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-zone")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByZoneAndStatus(@RequestParam int zoneId, @RequestParam String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByZoneAndStatus(zoneId, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-city")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByCityAndStatus(@RequestParam int cityId, @RequestParam String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByCityAndStatus(cityId, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-city-user-a")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByCityUserA(@RequestParam int assignedReaderId, @RequestParam String
    // status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByCityUserA(assignedReaderId, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-city-user-init")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByCityUserInit(@RequestParam int assignedReaderId, @RequestParam boolean
    // isInitialized, @RequestParam String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByCityUserInit(assignedReaderId,
    // isInitialized, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-streets")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByStreetsAndStatus(@RequestParam int addressStreetsId, @RequestParam
    // String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByStreetsAndStatus(addressStreetsId, status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-streets-all/{addressStreetsId}")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByStreetsAll(@PathVariable int addressStreetsId) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByStreetsAll(addressStreetsId);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }
    //
    // @GetMapping("/total-customer-balance/{status}")
    // public ResponseEntity<Double> getTotalCustomerBalanceByStatus(@PathVariable
    // String status) {
    // Double total =
    // billingCustomerInfoService.getTotalCustomerBalanceByStatus(status);
    // return new ResponseEntity<>(total != null ? total : 0.0, HttpStatus.OK);
    // }
    //
    // @GetMapping("/by-status-type")
    // public ResponseEntity<List<BillingCustomerInfo>>
    // findByStatusAndCustomerType(@RequestParam int customerTypeId, @RequestParam
    // String status) {
    // List<BillingCustomerInfo> list =
    // billingCustomerInfoService.findByStatusAndCustomerType(customerTypeId,
    // status);
    // return new ResponseEntity<>(list, HttpStatus.OK);
    // }

    // Bulk assign reader to customers
    @PostMapping("/assign-reader")
    public ResponseEntity<Void> assignReader(@RequestBody AssignReaderDTO dto) {

        if (dto == null || dto.getReaderId() == null || dto.getCustomerIds() == null
                || dto.getCustomerIds().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        billingCustomerInfoService.assignReaderToCustomers(dto.getReaderId(), dto.getCustomerIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/additional-monthly-payment/bulk-update")
    public ResponseEntity<Void> updateAdditionalMonthlyPaymentBulk(
            @RequestBody AdditionalMonthlyPaymentBulkUpdateDTO dto) {
        if (dto == null || dto.getAmount() == null || dto.getCustomerIds() == null || dto.getCustomerIds().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        billingCustomerInfoService.updateAdditionalMonthlyPaymentForCustomers(dto.getAmount(), dto.getCustomerIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/techemari/bulk-update")
    public ResponseEntity<Void> updateTechemariBulk(@RequestBody com.wbill.home.dto.TechemariBulkUpdateDTO dto) {
        System.out.println("Received /techemari/bulk-update request.");
        if (dto != null) {
            System.out.println("DTO payload: amount=" + dto.getAmount() + ", fieldName=" + dto.getFieldName() + ", ids="
                    + (dto.getCustomerIds() != null ? dto.getCustomerIds().size() : "null"));
        }

        // Validate inputs: customerIds is required. amount is required (but can be 0).
        // fieldName can be anything.
        if (dto == null || dto.getAmount() == null || dto.getCustomerIds() == null || dto.getCustomerIds().isEmpty()) {
            System.out.println("Validation failed for Techemari update.");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        billingCustomerInfoService.updateTechemariForCustomers(dto.getFieldName(), dto.getAmount(),
                dto.getCustomerIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/update-gps-bulk")
    public ResponseEntity<Void> updateGpsBulk(@RequestBody com.wbill.home.dto.GpsUpdateDTO dto) {
        if (dto == null || dto.getEntries() == null || dto.getEntries().isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        billingCustomerInfoService.updateLocationCoordinationBulk(dto.getEntries());
        return ResponseEntity.noContent().build();
    }
}
