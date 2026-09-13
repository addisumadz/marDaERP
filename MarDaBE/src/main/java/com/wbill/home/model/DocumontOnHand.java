package com.wbill.home.model;

import java.io.Serializable;

import jakarta.persistence.*;

/**
 * The persistent class for the documontonhand database table.
 */
@Entity
@Table(name = "documontonhand")
@NamedQuery(name = "DocumontOnHand.findAll", query = "SELECT d FROM DocumontOnHand d")
public class DocumontOnHand implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@Column(length = 100)
	private String id;

	@Column(name = "Mezigabe", length = 100)
	private String mezigabe;

	@Column(name = "Total")
	private Integer total;

	@Column(name = "status", length = 25)
	private String status;

	public DocumontOnHand() {
	}

	public String getId() {
		return this.id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getMezigabe() {
		return mezigabe;
	}

	public void setMezigabe(String mezigabe) {
		this.mezigabe = mezigabe;
	}

	public Integer getTotal() {
		return total;
	}

	public void setTotal(Integer total) {
		this.total = total;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}
}
