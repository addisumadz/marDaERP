package com.wbill.home.service;

import com.wbill.home.model.*;
import com.wbill.home.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WoredaService {

    @Autowired
    private ZoneRepository zoneRepository;
    @Autowired
    private WoredaRepository woredaRepository;

    public List<Woreda> getAllWoredas(String status) {
        return woredaRepository.findByStatus(status);
    }

    public Woreda createWoreda(Woreda woreda,Integer zone_id) {
    	zoneRepository.findById(zone_id).map(zoneData -> {
    		woreda.setZone(zoneData);
	           return 0;
	        }).orElseThrow();
        return woredaRepository.save(woreda);
    }

    public Optional<Woreda> getWoredaByStatusAndId(String status, int woredaId) {
        return woredaRepository.findByStatusAndId(status, woredaId);
    }
    public List<Woreda> getZonesByStatusAndZoneId(String status, int zoneId) {
        return woredaRepository.findByStatusAndZoneId(status, zoneId);
    }
    public Woreda updateWoreda(Woreda woreda, int woredaId,int zone_id) {
    	zoneRepository.findById(zone_id).map(zoneData -> {
    		woreda.setZone(zoneData);
	           return 0;
	        }).orElseThrow();
    	woreda.setId(woredaId);
        return woredaRepository.save(woreda);
    }

    public void deleteWoreda(int woredaId) {
    	woredaRepository.deleteById(woredaId);
    }

    public Woreda deactivateWoreda(Woreda woreda) {
    	woreda.setStatus("inactive");
        return woredaRepository.save(woreda);
    }
}
