package com.wbill.home.dto;

import lombok.Data;
import java.util.List;

@Data
public class GenerateBillWithReadingsRequest {
    private List<Integer> readingIds;
    private Integer previousReading;
    private Integer currentReading;
	public List<Integer> getReadingIds() {
		return readingIds;
	}
	public void setReadingIds(List<Integer> readingIds) {
		this.readingIds = readingIds;
	}
	public Integer getPreviousReading() {
		return previousReading;
	}
	public void setPreviousReading(Integer previousReading) {
		this.previousReading = previousReading;
	}
	public Integer getCurrentReading() {
		return currentReading;
	}
	public void setCurrentReading(Integer currentReading) {
		this.currentReading = currentReading;
	}
    
}
