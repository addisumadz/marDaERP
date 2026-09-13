package com.wbill.home.controller;

import com.wbill.home.dto.MobileReadingInitDTO;
import com.wbill.home.dto.PreviousReadingBillDTO;
import com.wbill.home.dto.ReadingUpdateDTO;
import com.wbill.home.model.BillingReading;
import com.wbill.home.service.BillingCustomerInfoService;
import com.wbill.home.service.BillingReadingImportService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mobile-reader")
public class MobileReadingController {

    @Autowired
    private BillingCustomerInfoService billingCustomerInfoService;

    @Autowired
    private BillingReadingImportService billingReadingImportService;

    @GetMapping("/init")
    public ResponseEntity<?> getInitData(
            @RequestParam String accountNumber,
            @RequestParam("kifyaWer") String currentKifyaWer) {

        try {
            return billingCustomerInfoService.findByAccountNumber(accountNumber)
                    .map(customerDto -> {
                        PreviousReadingBillDTO prev = billingReadingImportService
                                .getPreviousReadingForCustomerOnlybill(accountNumber, currentKifyaWer);

                        Integer avgConsumption = customerDto.getInitialConsumption();

                        MobileReadingInitDTO dto = new MobileReadingInitDTO();
                        dto.setAccountNumber(customerDto.getAccountNumber());
                        dto.setCustomerName(customerDto.getFullName());
                        dto.setMeterNumber(customerDto.getMeterNumber());
                        dto.setKifyaWer(currentKifyaWer);
                        if (prev != null) {
                            dto.setPreviousReading(prev.getPreviousReading());
                            dto.setPreviousConsumption(prev.getConsumption());
                            dto.setMeterChanged(prev.getMeterChanged());
                        }
                        dto.setAverageConsumption(avgConsumption);

                        return new ResponseEntity<>(dto, HttpStatus.OK);
                    })
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (EntityNotFoundException ex) {
            ReadingController.ErrorResponse error = new ReadingController.ErrorResponse(ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception ex) {
            ReadingController.ErrorResponse error = new ReadingController.ErrorResponse(
                    "Failed to load init data: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/reading")
    public ResponseEntity<?> submitReading(@RequestBody ReadingUpdateDTO request) {
        try {
            BillingReading created = billingReadingImportService.createReading(request);
            ReadingUpdateDTO responseDto = ReadingUpdateDTO.from(created);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException ex) {
            ReadingController.ErrorResponse error = new ReadingController.ErrorResponse(ex.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception ex) {
            ReadingController.ErrorResponse error = new ReadingController.ErrorResponse(
                    "Failed to create reading: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
