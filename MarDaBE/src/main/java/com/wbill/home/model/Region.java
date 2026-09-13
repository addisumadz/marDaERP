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
@Table(name="region")
@NamedQuery(name="Region.findAll", query="SELECT b FROM Region b")
public class Region implements Serializable {
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
 
	public Region() {
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
	 
 
 
  
 
 

	 



}