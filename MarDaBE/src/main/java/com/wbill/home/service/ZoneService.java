package com.wbill.home.service;

import com.wbill.home.model.Zone;
import com.wbill.home.repository.RegionRepository;
import com.wbill.home.repository.ZoneRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ZoneService {

    @Autowired
    private ZoneRepository zoneRepository;
    @Autowired
    private RegionRepository regionRepository;

    public List<Zone> getAllZones(String status) {
        return zoneRepository.findByStatus(status);
    }

    public Zone createZone(Zone zone,Integer region_id) {
    	regionRepository.findById(region_id).map(regionData -> {
    		zone.setRegion(regionData);
	           return 0;
	        }).orElseThrow();
        return zoneRepository.save(zone);
    }

    public Optional<Zone> getZoneByStatusAndId(String status, int zoneId) {
        return zoneRepository.findByStatusAndId(status, zoneId);
    }

    public Zone updateZone(Zone zone, int zoneId, int regionId) {
    	
      	regionRepository.findById(regionId).map(regionData -> {
    		zone.setRegion(regionData);
	           return 0;
	        }).orElseThrow();
        zone.setId(zoneId);
        return zoneRepository.save(zone);
    }

    public void deleteZone(int zoneId) {
        zoneRepository.deleteById(zoneId);
    }

    public Zone deactivateZone(Zone zone) {
        zone.setStatus("inactive");
        return zoneRepository.save(zone);
    }
    
    public List<Zone> getZonesByStatusAndRegionId(String status, int regionId) {
        return zoneRepository.findByStatusAndRegionId(status, regionId);
    }
}
