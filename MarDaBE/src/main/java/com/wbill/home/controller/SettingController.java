package com.wbill.home.controller;

import com.wbill.home.model.Setting;
import com.wbill.home.service.SettingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

 
@RestController
@RequestMapping("/api/mardaerp")
public class SettingController {

    @Autowired
    private SettingService settingService;

    // Get all settings (optionally filtered by status)
    @GetMapping("/settingsByStatus/{status}")
    public ResponseEntity<List<Setting>> getAllSettings(@PathVariable String status) {
     
        List<Setting> settings = settingService.getSettingsByStatus(status);
        return ResponseEntity.ok(settings);
    }

    // Create a new setting
    @PostMapping("/createSetting")
    public ResponseEntity<Setting> createSetting(@RequestBody Setting setting) {
        Setting newSetting = settingService.createSetting(setting);
        return new ResponseEntity<>(newSetting, HttpStatus.CREATED);
    }

    // Update setting
    @PutMapping("/updateSetting/{id}")
    public ResponseEntity<Setting> updateSetting(@PathVariable int id, @RequestBody Setting settingDetails) {
        Setting updatedSetting = settingService.updateSetting(id, settingDetails);
        return ResponseEntity.ok(updatedSetting);
    }

    // Delete a setting by ID
    @DeleteMapping("/setting/{id}")
    public ResponseEntity<String> deleteSetting(@PathVariable int id) {
        try {
            settingService.deleteSetting(id);
            return ResponseEntity.ok("Setting deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    // Get a specific setting by ID
    @GetMapping("/setting/{id}")
    public ResponseEntity<Setting> getSettingById(@PathVariable int id) {
        Setting setting = settingService.getSettingById(id);
        return ResponseEntity.ok(setting);
    }
}
