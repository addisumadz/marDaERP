package com.wbill.home.service;

import com.wbill.home.exception.ResourseNotFoundException;
import com.wbill.home.model.Setting;
import com.wbill.home.repository.SettingRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SettingService {

    @Autowired
    private SettingRepository settingRepository;

    // Fetch all settings
    public List<Setting> getAllSettings() {
        return settingRepository.findAll();
    }

    // Create a new setting
    public Setting createSetting(Setting setting) {
        return settingRepository.save(setting);
    }

    // Fetch a setting by ID
    public Setting getSettingById(int id) {
        return settingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Setting not found with id: " + id));
    }

    // Update an existing setting
    public Setting updateSetting(int id, Setting settingDetails) {
        Setting existingSetting = settingRepository.findById(id)
                .orElseThrow(() -> new ResourseNotFoundException("Setting not found with id: " + id));
        
        existingSetting.setName(settingDetails.getName());
        existingSetting.setIsAllDocumentToAttari(settingDetails.getIsAllDocumentToAttari());
        existingSetting.setStatus(settingDetails.getStatus());

        return settingRepository.save(existingSetting);
    }

    // Delete a setting by ID
    public void deleteSetting(int id) {
        if (settingRepository.existsById(id)) {
            settingRepository.deleteById(id);
        } else {
            throw new EntityNotFoundException("Setting with ID " + id + " not found.");
        }
    }

    // Fetch settings by status
    public List<Setting> getSettingsByStatus(String status) {
        return settingRepository.findAll().stream()
                .filter(setting -> status.equals(setting.getStatus()))
                .toList();
    }
}
