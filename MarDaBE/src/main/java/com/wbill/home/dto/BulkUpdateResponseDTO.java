package com.wbill.home.dto;

/**
 * DTO for bulk update response
 */
public class BulkUpdateResponseDTO {
    private boolean success;
    private int updatedCount;
    private String message;

    // Default constructor
    public BulkUpdateResponseDTO() {}

    // Constructor
    public BulkUpdateResponseDTO(boolean success, int updatedCount, String message) {
        this.success = success;
        this.updatedCount = updatedCount;
        this.message = message;
    }

    // Static factory methods for common responses
    public static BulkUpdateResponseDTO success(int updatedCount) {
        return new BulkUpdateResponseDTO(true, updatedCount, 
            "Successfully updated " + updatedCount + " payment records");
    }

    public static BulkUpdateResponseDTO error(String message) {
        return new BulkUpdateResponseDTO(false, 0, message);
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public int getUpdatedCount() {
        return updatedCount;
    }

    public void setUpdatedCount(int updatedCount) {
        this.updatedCount = updatedCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return "BulkUpdateResponseDTO{" +
                "success=" + success +
                ", updatedCount=" + updatedCount +
                ", message='" + message + '\'' +
                '}';
    }
}
