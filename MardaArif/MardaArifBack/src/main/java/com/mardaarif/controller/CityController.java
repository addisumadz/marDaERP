package com.mardaarif.controller;

import com.mardaarif.model.City;
import com.mardaarif.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    @Autowired
    private CityRepository cityRepository;

    @GetMapping
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<City>> getActiveCities() {
        return ResponseEntity.ok(cityRepository.findByActiveTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<City> getCity(@PathVariable Integer id) {
        return cityRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCity(@RequestBody City city) {
        if (cityRepository.existsByCityCode(city.getCityCode())) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "City code already exists: " + city.getCityCode()));
        }
        City saved = cityRepository.save(city);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCity(@PathVariable Integer id, @RequestBody City cityData) {
        return cityRepository.findById(id)
            .map(city -> {
                city.setCityName(cityData.getCityName());
                city.setCityCode(cityData.getCityCode());
                city.setWbmsBaseUrl(cityData.getWbmsBaseUrl());
                city.setContactPhone(cityData.getContactPhone());
                city.setContactEmail(cityData.getContactEmail());
                city.setActive(cityData.isActive());
                return ResponseEntity.ok(cityRepository.save(city));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deactivateCity(@PathVariable Integer id) {
        return cityRepository.findById(id)
            .map(city -> {
                city.setActive(false);
                cityRepository.save(city);
                return ResponseEntity.ok(Map.of("message", "City deactivated"));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/generate-key")
    public ResponseEntity<?> generateApiKey(@PathVariable Integer id) {
        return cityRepository.findById(id)
            .map(city -> {
                city.regenerateApiKey();
                cityRepository.save(city);
                return ResponseEntity.ok(Map.of(
                    "apiKey", city.getApiKey(),
                    "message", "New API key generated"));
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
