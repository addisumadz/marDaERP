package com.wbill.home.service;

import com.wbill.home.model.Region;
import com.wbill.home.repository.RegionRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RegionService {

    @Autowired
    private RegionRepository regionRepository;

    public List<Region> getAllRegions(String status) {
        return regionRepository.findByStatus(status);
    }

    public Region createRegion(Region region) {
        return regionRepository.save(region);
    }

    public Optional<Region> getRegionByStatusAndId(String status, int regionId) {
        return regionRepository.findByStatusAndId(status, regionId);
    }

    public Region updateRegion(Region region, int regionId) {
        region.setId(regionId);
        return regionRepository.save(region);
    }

    public Region deactivateRegion(Region region) {
        region.setStatus("inactive");
        return regionRepository.save(region);
    }
}
