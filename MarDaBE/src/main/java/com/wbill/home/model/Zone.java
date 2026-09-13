package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
 

import jakarta.persistence.*; 


/**
 * The persistent class for the Patient database table.
 * 
 */
@Entity
@Table(name="zone")
@NamedQuery(name="Zone.findAll", query="SELECT b FROM Zone b")
public class Zone implements Serializable {
	private static final long serialVersionUID = 1L;

	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY )
	private int id;
	

	@Column(name="name")
	private String name;	
	
	@Column(name="code")
	private String code;

	
	@Column(name="status")
	private String status;
 
	@ManyToOne
	@JoinColumn(name="region_id")
	private Region region;
	public Zone() {
	} 
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	public String getName() {
		return name;
	}
	public String getCode() {
		return code;
	}
	public String getStatus() {
		return status;
	}
	public void setName(String name) {
		this.name = name;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Region getRegion() {
		return region;
	}
	public void setRegion(Region region) {
		this.region = region;
	}
	 
 
 
  
 
 

	 



}