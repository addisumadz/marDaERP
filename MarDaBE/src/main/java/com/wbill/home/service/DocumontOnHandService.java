package com.wbill.home.service;

import com.wbill.home.model.DocumontOnHand;
import com.wbill.home.repository.DocumontOnHandRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DocumontOnHandService {

    @Autowired
    private DocumontOnHandRepository documontOnHandRepository;

    public List<DocumontOnHand> getAllByStatus(String status) {
        return documontOnHandRepository.findByStatus(status);
    }

    public DocumontOnHand createDocumontOnHand(DocumontOnHand doc) {
        return documontOnHandRepository.save(doc);
    }

    public Optional<DocumontOnHand> getByIdAndStatus(String id, String status) {
        return documontOnHandRepository.findByIdAndStatus(id, status);
    }

    public DocumontOnHand updateDocumontOnHand(DocumontOnHand doc, String id) {
        doc.setId(id);
        return documontOnHandRepository.save(doc);
    }

    public void deleteDocumontOnHand(String id) {
        documontOnHandRepository.deleteById(id);
    }

    public DocumontOnHand deactivateDocumontOnHand(DocumontOnHand doc) {
        doc.setStatus("inactive");
        return documontOnHandRepository.save(doc);
    }
}
