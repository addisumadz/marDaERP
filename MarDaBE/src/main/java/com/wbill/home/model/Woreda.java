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
@Table(name="woreda")
@NamedQuery(name="Woreda.findAll", query="SELECT b FROM Woreda b")
public class Woreda implements Serializable {
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
	@JoinColumn(name="zone_id")
	private Zone zone;
	public Woreda() {
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
	public Zone getZone() {
		return zone;
	}
	public void setZone(Zone zone) {
		this.zone = zone;
	}
	 
 
 
  
 
 

	 



}