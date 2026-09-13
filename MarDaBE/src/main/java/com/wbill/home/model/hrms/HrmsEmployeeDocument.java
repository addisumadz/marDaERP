package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_info_photo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployeeDocument implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "is_document", nullable = false)
    private boolean document = false;

    @Column(name = "is_photo", nullable = false)
    private boolean photo = false;

    @Column(name = "document_photo", nullable = false, length = 255)
    private String documentPhoto;

    @Column(name = "document_title", length = 200)
    private String documentTitle;

    @Column(name = "document_description", columnDefinition = "TEXT")
    private String documentDescription;

    @Column(name = "registered_by")
    private Integer registeredBy;

    @Column(name = "registered_date", updatable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(name = "modified_by")
    private Integer modifiedBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate = LocalDateTime.now();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsEmployeeDocument() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public boolean isDocument() { return document; }
    public void setDocument(boolean document) { this.document = document; }

    public boolean isPhoto() { return photo; }
    public void setPhoto(boolean photo) { this.photo = photo; }

    public String getDocumentPhoto() { return documentPhoto; }
    public void setDocumentPhoto(String documentPhoto) { this.documentPhoto = documentPhoto; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getDocumentDescription() { return documentDescription; }
    public void setDocumentDescription(String documentDescription) { this.documentDescription = documentDescription; }

    public Integer getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(Integer registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDateTime registeredDate) { this.registeredDate = registeredDate; }

    public Integer getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Integer modifiedBy) { this.modifiedBy = modifiedBy; }

    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
