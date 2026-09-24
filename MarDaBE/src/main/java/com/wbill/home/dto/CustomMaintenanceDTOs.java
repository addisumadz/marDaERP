package com.wbill.home.dto;

import java.math.BigDecimal;
import java.util.List;

public class CustomMaintenanceDTOs {

    // 1. Initial Maintenance Intake DTO (Customer Service - Registered Customer Search/Select)
    public static class CreateMaintenanceRequestDTO {
        private Integer customerId;
        private Long maintenanceTypeId;
        private String problemDescription;
        private String customerFullName;
        private String customerFullNameEng;
        private String phoneNumber;
        private String nationalIdNumber;
        private String houseNumber;
        private String accountNumber;
        private String meterNumber;
        private Integer branchId;
        private Integer kebeleId;
        private Integer ketenaId;
        private Integer customerTypeId;
        private String addressDescription;

        public Integer getCustomerId() { return customerId; }
        public void setCustomerId(Integer customerId) { this.customerId = customerId; }

        public Long getMaintenanceTypeId() { return maintenanceTypeId; }
        public void setMaintenanceTypeId(Long maintenanceTypeId) { this.maintenanceTypeId = maintenanceTypeId; }

        public String getProblemDescription() { return problemDescription; }
        public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

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

        public String getAccountNumber() { return accountNumber; }
        public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

        public String getMeterNumber() { return meterNumber; }
        public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

        public Integer getBranchId() { return branchId; }
        public void setBranchId(Integer branchId) { this.branchId = branchId; }

        public Integer getKebeleId() { return kebeleId; }
        public void setKebeleId(Integer kebeleId) { this.kebeleId = kebeleId; }

        public Integer getKetenaId() { return ketenaId; }
        public void setKetenaId(Integer ketenaId) { this.ketenaId = ketenaId; }

        public Integer getCustomerTypeId() { return customerTypeId; }
        public void setCustomerTypeId(Integer customerTypeId) { this.customerTypeId = customerTypeId; }

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

    // 3. Maintenance Survey Item DTO
    public static class SurveyItemDTO {
        private Long maintenanceCommonMaterialId;
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

        public Long getMaintenanceCommonMaterialId() { return maintenanceCommonMaterialId; }
        public void setMaintenanceCommonMaterialId(Long maintenanceCommonMaterialId) { this.maintenanceCommonMaterialId = maintenanceCommonMaterialId; }
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
        private Long maintenanceTypeId;
        private String plumberNotes;
        private List<SurveyItemDTO> items;
        private List<SurveyFeeDTO> fees;

        public Long getMaintenanceTypeId() { return maintenanceTypeId; }
        public void setMaintenanceTypeId(Long maintenanceTypeId) { this.maintenanceTypeId = maintenanceTypeId; }
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

    // 8. Maintenance Completion DTO (Technical / Field Plumber Department)
    public static class MaintenanceCompletionDTO {
        private String notes;
        private Double finalMeterReading;

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Double getFinalMeterReading() { return finalMeterReading; }
        public void setFinalMeterReading(Double finalMeterReading) { this.finalMeterReading = finalMeterReading; }
    }

    // 9. Reassign Plumber DTO (Supervisory / Technical Lead)
    public static class ReassignPlumberDTO {
        private Integer plumberId;
        private String mode; // "survey" | "maintenance"
        private String reason;

        public Integer getPlumberId() { return plumberId; }
        public void setPlumberId(Integer plumberId) { this.plumberId = plumberId; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // 10. Reject / Cancel DTO (Feasibility failure / Customer cancellation)
    public static class RejectCancelDTO {
        private String actionType; // "REJECT_SURVEY_UNFEASIBLE" | "CANCEL_APPLICATION"
        private String reason;

        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    // 11. Return for Revision DTO (Revenue -> Technical)
    public static class ReturnRevisionDTO {
        private String remarks;

        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}

