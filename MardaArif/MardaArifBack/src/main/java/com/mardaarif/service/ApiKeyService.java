package com.mardaarif.service;

import com.mardaarif.model.City;
import com.mardaarif.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ApiKeyService {
    @Autowired
    private CityRepository cityRepository;

    /**
     * Validates the API key and returns the associated city.
     * This is the main authentication mechanism for Unicash-mirror endpoints.
     */
    public City validateApiKey(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return null;
        }
        Optional<City> city = cityRepository.findByApiKey(apiKey.trim());
        if (city.isPresent() && city.get().isActive()) {
            return city.get();
        }
        return null;
    }
}
