package com.wbill.home.controller;
 
import com.wbill.home.model.Region;
import com.wbill.home.service.RegionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

 
@RestController
@RequestMapping("/api/mardaerp/")
public class RegionController {

    @Autowired
    private RegionService regionService;

    @GetMapping("/regionByStatus/{status}") 
    public List<Region> getAllRegions(@PathVariable String status) {
        List<Region> regions = regionService.getAllRegions(status);
        return (regions);
    }

 
    @PostMapping("/region")
    public ResponseEntity<Region> createRegion(@RequestBody Region region) {
        Region createdRegion = regionService.createRegion(region);
        return ResponseEntity.ok(createdRegion);
    }

    @GetMapping("/regionByStatusAndId/{status}/{regionId}")
    public ResponseEntity<Region> getRegionByStatusAndId(@PathVariable String status, @PathVariable int regionId) {
        Optional<Region> region = regionService.getRegionByStatusAndId(status, regionId);
        return region.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/region/{regionId}")
    public ResponseEntity<Region> updateRegion(@RequestBody Region region, @PathVariable int regionId) {
        Region updatedRegion = regionService.updateRegion(region, regionId);
        return ResponseEntity.ok(updatedRegion);
    }

    @PutMapping("/deactivateRegion")
    public ResponseEntity<Region> deactivateRegion(@RequestBody Region region) {
        Region deactivatedRegion = regionService.deactivateRegion(region);
        return ResponseEntity.ok(deactivatedRegion);
    }
}
