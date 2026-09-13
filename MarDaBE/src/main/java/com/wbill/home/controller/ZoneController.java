package com.wbill.home.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wbill.home.model.Zone;
import com.wbill.home.service.ZoneService;

import java.util.List;
import java.util.Optional;
 
@RestController
@RequestMapping("/api/card_managenment/")
public class ZoneController {

    @Autowired
    private ZoneService zoneService;

    @GetMapping("/zoneByStatus/{status}")
    public List<Zone> getAllZones(@PathVariable String status) {
        List<Zone> zones = zoneService.getAllZones(status);
        return (zones);
    }

    @PostMapping("/zone/{region_id}")
    public ResponseEntity<Zone> createZone(@RequestBody Zone zone, @PathVariable int region_id) {

    	
        Zone createdZone = zoneService.createZone(zone,region_id);
        return ResponseEntity.ok(createdZone);
    }

    @GetMapping("/zoneByStatusAndId/{status}/{zoneId}")
    public ResponseEntity<Zone> getZoneByStatusAndId(@PathVariable String status, @PathVariable int zoneId) {
        Optional<Zone> zone = zoneService.getZoneByStatusAndId(status, zoneId);
        return zone.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/zone/{zone_id}/{regionId}")
    public ResponseEntity<Zone> updateZone(@RequestBody Zone zone, @PathVariable int zone_id, @PathVariable int regionId) {
        
    	Zone updatedZone = zoneService.updateZone(zone, zone_id,regionId);
        return ResponseEntity.ok(updatedZone);
    }

    @DeleteMapping("/deleteZone/{zoneId}")
    public ResponseEntity<Void> deleteZone(@PathVariable int zoneId) {
        zoneService.deleteZone(zoneId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/deactivateZone")
    public ResponseEntity<Zone> deactivateZone(@RequestBody Zone zone) {
        Zone deactivatedZone = zoneService.deactivateZone(zone);
        return ResponseEntity.ok(deactivatedZone);
    }
    @GetMapping("/zoneByStatusAndRegionId/{status}/{regionId}")
    public ResponseEntity<List<Zone>> getZonesByStatusAndRegionId(@PathVariable String status, @PathVariable int regionId) {
        List<Zone> zones = zoneService.getZonesByStatusAndRegionId(status, regionId);
        return ResponseEntity.ok(zones);
    }
}
