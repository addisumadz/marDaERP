package com.wbill.home.dto;

public class PreviousReadingDTO {
    private Integer previousReading;
    private Integer lastReading;

    public PreviousReadingDTO(Integer previousReading) {
        this.previousReading = previousReading;
    }

    public Integer getLastReading() {
		return lastReading;
	}

	public void setLastReading(Integer lastReading) {
		this.lastReading = lastReading;
	}

	// Standard getters and setters
    public Integer getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(Integer previousReading) {
        this.previousReading = previousReading;
    }
}
