package com.wbill.home.dto;

import java.util.List;

/**
 * DTO for bulk bank payment update request
 */
public class BulkBankPaymentUpdateRequestDTO {
    private List<BankPaymentUpdateItemDTO> updates;

    // Default constructor
    public BulkBankPaymentUpdateRequestDTO() {}

    // Constructor
    public BulkBankPaymentUpdateRequestDTO(List<BankPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    // Getters and Setters
    public List<BankPaymentUpdateItemDTO> getUpdates() {
        return updates;
    }

    public void setUpdates(List<BankPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    @Override
    public String toString() {
        return "BulkBankPaymentUpdateRequestDTO{" +
                "updates=" + updates +
                '}';
    }

    /**
     * Inner class for individual update items
     */
    public static class BankPaymentUpdateItemDTO {
        private Integer id;
        private BankPaymentUpdateDTO updates;

        // Default constructor
        public BankPaymentUpdateItemDTO() {}

        // Constructor
        public BankPaymentUpdateItemDTO(Integer id, BankPaymentUpdateDTO updates) {
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

        public BankPaymentUpdateDTO getUpdates() {
            return updates;
        }

        public void setUpdates(BankPaymentUpdateDTO updates) {
            this.updates = updates;
        }

        @Override
        public String toString() {
            return "BankPaymentUpdateItemDTO{" +
                    "id=" + id +
                    ", updates=" + updates +
                    '}';
        }
    }
}
