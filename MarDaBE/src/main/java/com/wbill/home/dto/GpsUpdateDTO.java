package com.wbill.home.dto;

import java.util.List;

public class GpsUpdateDTO {

    private List<GpsUpdateEntry> entries;

    public GpsUpdateDTO() {}

    public GpsUpdateDTO(List<GpsUpdateEntry> entries) {
        this.entries = entries;
    }

    public List<GpsUpdateEntry> getEntries() {
        return entries;
    }

    public void setEntries(List<GpsUpdateEntry> entries) {
        this.entries = entries;
    }

    public static class GpsUpdateEntry {
        private Integer customerId;
        private String locationCoordination;

        public GpsUpdateEntry() {}

        public GpsUpdateEntry(Integer customerId, String locationCoordination) {
            this.customerId = customerId;
            this.locationCoordination = locationCoordination;
        }

        public Integer getCustomerId() {
            return customerId;
        }

        public void setCustomerId(Integer customerId) {
            this.customerId = customerId;
        }

        public String getLocationCoordination() {
            return locationCoordination;
        }

        public void setLocationCoordination(String locationCoordination) {
            this.locationCoordination = locationCoordination;
        }
    }
}
