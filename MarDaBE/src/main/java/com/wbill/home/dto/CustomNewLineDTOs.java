package com.wbill.home.dto;

import java.math.BigDecimal;
import java.util.List;

public class CustomNewLineDTOs {

    // 1. Initial Application Intake DTO (Customer Service)
    public static class CreateApplicationDTO {
        private String applicantName;
        private String customerFullName;
        private String customerFullNameEng;
        private String phoneNumber;
        private String nationalIdNumber;
        private String houseNumber;
        private Integer kebeleId;
        private Integer ketenaId;
        private Integer customerTypeId;
        private Integer branchId;
        private String addressDescription;

        public String getApplicantName() { return applicantName; }
        public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
        public String getCustomerFullName() { return customerFullName; }
        public void setCustomerFullName(String customerFullName) { this.customerFullName = customerFullName; }
        public String getCustomerFullNameEng() { return customerFullNameEng; }
        public void setCustomerFullNameEng(String customerFullNameEng) { this.customerFullNameEng = customerFullNameEng; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getNationalIdNumber() { return nationalIdNumber; }
        public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }
        public String getHouseNumber() { return houseNumber; }
        public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
        public Integer getKebeleId() { return kebeleId; }
        public void setKebeleId(Integer kebeleId) { this.kebeleId = kebeleId; }
        public Integer getKetenaId() { return ketenaId; }
        public void setKetenaId(Integer ketenaId) { this.ketenaId = ketenaId; }
        public Integer getCustomerTypeId() { return customerTypeId; }
        public void setCustomerTypeId(Integer customerTypeId) { this.customerTypeId = customerTypeId; }
        public Integer getBranchId() { return branchId; }
        public void setBranchId(Integer branchId) { this.branchId = branchId; }
        public String getAddressDescription() { return addressDescription; }
        public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }
    }

    // 2. Assign Plumber DTO (Technical Department)
    public static class AssignPlumberDTO {
        private Integer plumberId;
        private String notes;

        public Integer getPlumberId() { return plumberId; }
        public void setPlumberId(Integer plumberId) { this.plumberId = plumberId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // 3. Survey Line Item DTO (replicates new line items.png columns)
    public static class SurveyItemDTO {
        private Long commonMaterialId;
        private Long invItemId;
        private String itemName;
        private String itemNameAm;
        private String unitOfMeasure;
        private BigDecimal surveyedQuantity;
        private BigDecimal utilityQuantity;
        private BigDecimal utilityUnitPrice;
        private BigDecimal outsideQuantity;
        private BigDecimal outsideUnitPrice;
        private String remarks;

        public Long getCommonMaterialId() { return commonMaterialId; }
        public void setCommonMaterialId(Long commonMaterialId) { this.commonMaterialId = commonMaterialId; }
        public Long getInvItemId() { return invItemId; }
        public void setInvItemId(Long invItemId) { this.invItemId = invItemId; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getItemNameAm() { return itemNameAm; }
        public void setItemNameAm(String itemNameAm) { this.itemNameAm = itemNameAm; }
        public String getUnitOfMeasure() { return unitOfMeasure; }
        public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }
        public BigDecimal getSurveyedQuantity() { return surveyedQuantity; }
        public void setSurveyedQuantity(BigDecimal surveyedQuantity) { this.surveyedQuantity = surveyedQuantity; }
        public BigDecimal getUtilityQuantity() { return utilityQuantity; }
        public void setUtilityQuantity(BigDecimal utilityQuantity) { this.utilityQuantity = utilityQuantity; }
        public BigDecimal getUtilityUnitPrice() { return utilityUnitPrice; }
        public void setUtilityUnitPrice(BigDecimal utilityUnitPrice) { this.utilityUnitPrice = utilityUnitPrice; }
        public BigDecimal getOutsideQuantity() { return outsideQuantity; }
        public void setOutsideQuantity(BigDecimal outsideQuantity) { this.outsideQuantity = outsideQuantity; }
        public BigDecimal getOutsideUnitPrice() { return outsideUnitPrice; }
        public void setOutsideUnitPrice(BigDecimal outsideUnitPrice) { this.outsideUnitPrice = outsideUnitPrice; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    // 4. Survey Fee DTO
    public static class SurveyFeeDTO {
        private Integer feeTypeId;
        private String feeName;
        private String feeNameAm;
        private String unitName;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private String remarks;

        public Integer getFeeTypeId() { return feeTypeId; }
        public void setFeeTypeId(Integer feeTypeId) { this.feeTypeId = feeTypeId; }
        public String getFeeName() { return feeName; }
        public void setFeeName(String feeName) { this.feeName = feeName; }
        public String getFeeNameAm() { return feeNameAm; }
        public void setFeeNameAm(String feeNameAm) { this.feeNameAm = feeNameAm; }
        public String getUnitName() { return unitName; }
        public void setUnitName(String unitName) { this.unitName = unitName; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    // 5. Submit Survey DTO (Technical Department submit)
    public static class SubmitSurveyDTO {
        private String plumberNotes; // የባለሙያ ሪፖርት
        private List<SurveyItemDTO> items;
        private List<SurveyFeeDTO> fees;

        public String getPlumberNotes() { return plumberNotes; }
        public void setPlumberNotes(String plumberNotes) { this.plumberNotes = plumberNotes; }
        public List<SurveyItemDTO> getItems() { return items; }
        public void setItems(List<SurveyItemDTO> items) { this.items = items; }
        public List<SurveyFeeDTO> getFees() { return fees; }
        public void setFees(List<SurveyFeeDTO> fees) { this.fees = fees; }
    }

    // 6. Payment Approval DTO (Revenue Department)
    public static class PaymentApprovalDTO {
        private String receiptNumber;
        private String referenceNumber;
        private String remarks;
        private List<SurveyItemDTO> updatedItems;
        private List<SurveyFeeDTO> updatedFees;

        public String getReceiptNumber() { return receiptNumber; }
        public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; }
        public String getReferenceNumber() { return referenceNumber; }
        public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public List<SurveyItemDTO> getUpdatedItems() { return updatedItems; }
        public void setUpdatedItems(List<SurveyItemDTO> updatedItems) { this.updatedItems = updatedItems; }
        public List<SurveyFeeDTO> getUpdatedFees() { return updatedFees; }
        public void setUpdatedFees(List<SurveyFeeDTO> updatedFees) { this.updatedFees = updatedFees; }
    }

    // 7. Store Material Dispatch DTO (Inventory Department)
    public static class StoreDispatchDTO {
        private Long storeId;
        private String remarks;

        public Long getStoreId() { return storeId; }
        public void setStoreId(Long storeId) { this.storeId = storeId; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }

    // 8. Installation Completion DTO (Technical Department)
    public static class InstallationCompletionDTO {
        private String notes;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    // 9. Final Activation DTO (Customer Service Department)
    public static class FinalActivationDTO {
        private String meterNumber;
        private Integer meterSizeId;
        private Double initialReading;
        private Integer assignedReaderId;
        private String locationCoordination;
        private Integer billingTariffId;
        private String customerFullNameEng;

        public String getMeterNumber() { return meterNumber; }
        public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
        public Integer getMeterSizeId() { return meterSizeId; }
        public void setMeterSizeId(Integer meterSizeId) { this.meterSizeId = meterSizeId; }
        public Double getInitialReading() { return initialReading; }
        public void setInitialReading(Double initialReading) { this.initialReading = initialReading; }
        public Integer getAssignedReaderId() { return assignedReaderId; }
        public void setAssignedReaderId(Integer assignedReaderId) { this.assignedReaderId = assignedReaderId; }
        public String getLocationCoordination() { return locationCoordination; }
        public void setLocationCoordination(String locationCoordination) { this.locationCoordination = locationCoordination; }
        public Integer getBillingTariffId() { return billingTariffId; }
        public void setBillingTariffId(Integer billingTariffId) { this.billingTariffId = billingTariffId; }
        public String getCustomerFullNameEng() { return customerFullNameEng; }
        public void setCustomerFullNameEng(String customerFullNameEng) { this.customerFullNameEng = customerFullNameEng; }
    }

    // 10. Reassign Plumber DTO (Supervisory / Technical Lead)
    public static class ReassignPlumberDTO {
        private Integer plumberId;
        private String mode; // "survey" | "installation"
        private String reason;

        public Integer getPlumberId() { return plumberId; }
        public void setPlumberId(Integer plumberId) { this.plumberId = plumberId; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // 11. Reject / Cancel DTO (Feasibility failure / Customer cancellation)
    public static class RejectCancelDTO {
        private String actionType; // "REJECT_SURVEY_UNFEASIBLE" | "CANCEL_APPLICATION"
        private String reason;

        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // 12. Return for Revision DTO (Revenue -> Technical)
    public static class ReturnRevisionDTO {
        private String remarks;

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
