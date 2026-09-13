package com.wbill.home.dto;

import java.util.List;

/**
 * DTO for bulk Unicash payment update request
 */
public class BulkUnicashPaymentUpdateRequestDTO {
    private List<UnicashPaymentUpdateItemDTO> updates;

    // Default constructor
    public BulkUnicashPaymentUpdateRequestDTO() {}

    // Constructor
    public BulkUnicashPaymentUpdateRequestDTO(List<UnicashPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    // Getters and Setters
    public List<UnicashPaymentUpdateItemDTO> getUpdates() {
        return updates;
    }

    public void setUpdates(List<UnicashPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    @Override
    public String toString() {
        return "BulkUnicashPaymentUpdateRequestDTO{" +
                "updates=" + updates +
                '}';
    }

    /**
     * Inner class for individual update items
     */
    public static class UnicashPaymentUpdateItemDTO {
        private Integer id;
        private UnicashPaymentUpdateDTO updates;

        // Default constructor
        public UnicashPaymentUpdateItemDTO() {}

        // Constructor
        public UnicashPaymentUpdateItemDTO(Integer id, UnicashPaymentUpdateDTO updates) {
            this.id = id;
            this.updates = updates;
        }

        // Getters and Setters
        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public UnicashPaymentUpdateDTO getUpdates() {
            return updates;
        }

        public void setUpdates(UnicashPaymentUpdateDTO updates) {
            this.updates = updates;
        }

        @Override
        public String toString() {
            return "UnicashPaymentUpdateItemDTO{" +
                    "id=" + id +
                    ", updates=" + updates +
                    '}';
        }
    }
}
