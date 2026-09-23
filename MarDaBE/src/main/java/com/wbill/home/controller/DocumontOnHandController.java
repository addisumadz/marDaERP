package com.wbill.home.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wbill.home.model.DocumontOnHand;
import com.wbill.home.service.DocumontOnHandService;

import java.util.List;
import java.util.Optional;

//@CrossOrigin(origins = "*", maxAge = 3600)
//@CrossOrigin(origins = "http://192.168.100.106:9000")
//@CrossOrigin(origins = "http://192.168.100.105:9000")
@RestController
@RequestMapping("/api/mardaerp/")
public class DocumontOnHandController {

    @Autowired
    private DocumontOnHandService documontOnHandService;

    // Get all DocumontOnHand records by status
    @GetMapping("/documontOnHandByStatus/{status}")
    public ResponseEntity<List<DocumontOnHand>> getAllByStatus(@PathVariable String status) {
        List<DocumontOnHand> docs = documontOnHandService.getAllByStatus(status);
        return ResponseEntity.ok(docs);
    }

    // Create a new DocumontOnHand
    @PostMapping("/createDocumontOnHand")
    public ResponseEntity<DocumontOnHand> createDocumontOnHand(@RequestBody DocumontOnHand doc) {
        DocumontOnHand createdDoc = documontOnHandService.createDocumontOnHand(doc);
        return ResponseEntity.ok(createdDoc);
    }

    // Get a DocumontOnHand by ID and status
    @GetMapping("/documontOnHandByIdAndStatus/{id}/{status}")
    public ResponseEntity<DocumontOnHand> getByIdAndStatus(@PathVariable String id, @PathVariable String status) {
        Optional<DocumontOnHand> doc = documontOnHandService.getByIdAndStatus(id, status);
        return doc.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Update a DocumontOnHand
    @PutMapping("/updateDocumontOnHand/{id}")
    public ResponseEntity<DocumontOnHand> updateDocumontOnHand(@RequestBody DocumontOnHand doc,
            @PathVariable String id) {
        DocumontOnHand updatedDoc = documontOnHandService.updateDocumontOnHand(doc, id);
        return ResponseEntity.ok(updatedDoc);
    }

    // Delete a DocumontOnHand by ID
    @DeleteMapping("/deleteDocumontOnHand/{id}")
    public ResponseEntity<Void> deleteDocumontOnHand(@PathVariable String id) {
        documontOnHandService.deleteDocumontOnHand(id);
        return ResponseEntity.noContent().build();
    }

    // Deactivate a DocumontOnHand (set status to inactive)
    @PutMapping("/deactivateDocumontOnHand")
    public ResponseEntity<DocumontOnHand> deactivateDocumontOnHand(@RequestBody DocumontOnHand doc) {
        DocumontOnHand deactivatedDoc = documontOnHandService.deactivateDocumontOnHand(doc);
        return ResponseEntity.ok(deactivatedDoc);
    }
}
