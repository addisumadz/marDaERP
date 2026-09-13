package com.wbill.home.dto;


public class SimplifiedReadingDTO {
	 private int id;
    private String customerFullName;
    private String customerAccountNumber;
    private Integer lastReading;
    private Integer previousReading;
    private Integer consumption;
    private String kifyaWer;
    private String status;

    // Constructor
    public SimplifiedReadingDTO(int id, String customerFullName, String customerAccountNumber, 
                              Integer lastReading, Integer previousReading, 
                              Integer consumption, String kifyaWer, String status) {
    	 this.id = id;
        this.customerFullName = customerFullName;
        this.customerAccountNumber = customerAccountNumber;
        this.lastReading = lastReading;
        this.previousReading = previousReading;
        this.consumption = consumption;
        this.kifyaWer = kifyaWer;
        this.status = status;
    }
  

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCustomerFullName() {
		return customerFullName;
	}

	public void setCustomerFullName(String customerFullName) {
		this.customerFullName = customerFullName;
	}

	public String getCustomerAccountNumber() {
		return customerAccountNumber;
	}

	public void setCustomerAccountNumber(String customerAccountNumber) {
		this.customerAccountNumber = customerAccountNumber;
	}

	public Integer getLastReading() {
		return lastReading;
	}

	public void setLastReading(Integer lastReading) {
		this.lastReading = lastReading;
	}

	public Integer getPreviousReading() {
		return previousReading;
	}

	public void setPreviousReading(Integer previousReading) {
		this.previousReading = previousReading;
	}

	public Integer getConsumption() {
		return consumption;
	}

	public void setConsumption(Integer consumption) {
		this.consumption = consumption;
	}

	public String getKifyaWer() {
		return kifyaWer;
	}

	public void setKifyaWer(String kifyaWer) {
		this.kifyaWer = kifyaWer;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

  
}