package com.wbill.home.model;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "setting")
public class Setting implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "name")
    private String name;

    @Column(name = "isAllDocumentToAttari")
    private Boolean isAllDocumentToAttari;

    
    @Column(name = "hrToUpdateDocumentInfo")
    private String hrToUpdateDocumentInfo;
    
    @Column(name = "status")
    private String status;

    // Getters and Setters
    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    

    public Boolean getIsAllDocumentToAttari() {
		return isAllDocumentToAttari;
	}

	public void setIsAllDocumentToAttari(Boolean isAllDocumentToAttari) {
		this.isAllDocumentToAttari = isAllDocumentToAttari;
	}

	public String getHrToUpdateDocumentInfo() {
		return hrToUpdateDocumentInfo;
	}

	public void setHrToUpdateDocumentInfo(String hrToUpdateDocumentInfo) {
		this.hrToUpdateDocumentInfo = hrToUpdateDocumentInfo;
	}

	public void setId(int id) {
		this.id = id;
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
