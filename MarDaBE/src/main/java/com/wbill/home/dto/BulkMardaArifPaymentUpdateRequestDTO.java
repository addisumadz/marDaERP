package com.wbill.home.dto;

import java.util.List;

/**
 * DTO for bulk MardaArif payment update request
 */
public class BulkMardaArifPaymentUpdateRequestDTO {
    private List<MardaArifPaymentUpdateItemDTO> updates;

    // Default constructor
    public BulkMardaArifPaymentUpdateRequestDTO() {}

    // Constructor
    public BulkMardaArifPaymentUpdateRequestDTO(List<MardaArifPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    // Getters and Setters
    public List<MardaArifPaymentUpdateItemDTO> getUpdates() {
        return updates;
    }

    public void setUpdates(List<MardaArifPaymentUpdateItemDTO> updates) {
        this.updates = updates;
    }

    @Override
    public String toString() {
        return "BulkMardaArifPaymentUpdateRequestDTO{" +
                "updates=" + updates +
                '}';
    }

    /**
     * Inner class for individual update items
     */
    public static class MardaArifPaymentUpdateItemDTO {
        private Integer id;
        private MardaArifPaymentUpdateDTO updates;

        // Default constructor
        public MardaArifPaymentUpdateItemDTO() {}

        // Constructor
        public MardaArifPaymentUpdateItemDTO(Integer id, MardaArifPaymentUpdateDTO updates) {
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

        public MardaArifPaymentUpdateDTO getUpdates() {
            return updates;
        }

        public void setUpdates(MardaArifPaymentUpdateDTO updates) {
            this.updates = updates;
        }

        @Override
        public String toString() {
            return "MardaArifPaymentUpdateItemDTO{" +
                    "id=" + id +
                    ", updates=" + updates +
                    '}';
        }
    }
}
