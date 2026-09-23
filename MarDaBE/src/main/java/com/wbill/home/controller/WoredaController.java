package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.service.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

 
@RestController
@RequestMapping("/api/mardaerp/")
public class WoredaController {

    @Autowired
    private WoredaService woredaService;

    @GetMapping("/woredaByStatus/{status}")
    public List<Woreda> getAllWoredas(@PathVariable String status) {
        List<Woreda> woredas = woredaService.getAllWoredas(status);
        return (woredas);
    }

    @PostMapping("/woreda/{zone_id}")
    public ResponseEntity<Woreda> createWoreda(@RequestBody Woreda woreda, @PathVariable Integer zone_id) {

    	
    	Woreda createdWoreda = woredaService.createWoreda(woreda,zone_id);
        return ResponseEntity.ok(createdWoreda);
    }

    @GetMapping("/woredaByStatusAndId/{status}/{woredaId}")
    public ResponseEntity<Woreda> getZoneByStatusAndId(@PathVariable String status, @PathVariable int woredaId) {
        Optional<Woreda> woreda = woredaService.getWoredaByStatusAndId(status, woredaId);
        return woreda.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/woreda/{woreda_id}/{zone_id}")
    public ResponseEntity<Woreda> updateWoreda(@RequestBody Woreda woreda, @PathVariable int woreda_id,@PathVariable int zone_id) {
    	Woreda updatedWoreda = woredaService.updateWoreda(woreda, woreda_id,zone_id);
        return ResponseEntity.ok(updatedWoreda);
    }

    @DeleteMapping("/deleteWoreda/{woredaId}")
    public ResponseEntity<Void> deleteWoreda(@PathVariable int woredaId) {
    	woredaService.deleteWoreda(woredaId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/deactivateWoreda")
    public ResponseEntity<Woreda> deactivateWoreda(@RequestBody Woreda woreda) {
    	Woreda deactivatedWoreda = woredaService.deactivateWoreda(woreda);
        return ResponseEntity.ok(deactivatedWoreda);
    }
    @GetMapping("/woredaByStatusAndZoneId/{status}/{zoneId}")
    public ResponseEntity<List<Woreda>> getZonesByStatusAndWoredaId(@PathVariable String status, @PathVariable int zoneId) {
        List<Woreda> woreda = woredaService.getZonesByStatusAndZoneId(status, zoneId);
        return ResponseEntity.ok(woreda);
    }
}
