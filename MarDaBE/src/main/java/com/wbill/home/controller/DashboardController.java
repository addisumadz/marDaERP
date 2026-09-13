package com.wbill.home.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.wbill.home.model.DashboardSummary;
import com.wbill.home.service.DashboardService;

@RestController
@RequestMapping("/api/card_managenment/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary() {
        DashboardSummary summary = dashboardService.getLatestSummary();
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/refresh")
    public ResponseEntity<DashboardSummary> refreshSummary(
            @RequestParam(value = "user", defaultValue = "System") String user) {
        DashboardSummary summary = dashboardService.refreshSummary(user);
        return ResponseEntity.ok(summary);
    }
}
