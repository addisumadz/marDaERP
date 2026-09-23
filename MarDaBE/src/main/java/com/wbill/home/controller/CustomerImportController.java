package com.wbill.home.controller;

import com.wbill.home.dto.CustomerImportReport;
import com.wbill.home.service.CustomerImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
// @RequestMapping("/api/customers/import")
@RequestMapping("/api/mardaerp/customer/import")
public class CustomerImportController {

    private final CustomerImportService importService;

    public CustomerImportController(CustomerImportService importService) {
        this.importService = importService;
    }

    @PostMapping
    public ResponseEntity<CustomerImportReport> importCustomers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        System.out.println("import starting");
        CustomerImportReport report = importService.importCustomers(file);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/update")
    public ResponseEntity<CustomerImportReport> updateCustomers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        System.out.println("customer update starting");
        CustomerImportReport report = importService.updateCustomers(file);
        return ResponseEntity.ok(report);
    }
}
