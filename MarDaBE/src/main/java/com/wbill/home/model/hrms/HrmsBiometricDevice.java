package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_biometric_device")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsBiometricDevice implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "device_name", nullable = false, length = 150)
    private String deviceName;

    @Column(name = "device_ip", nullable = false, length = 50)
    private String deviceIp;

    @Column(name = "port", nullable = false)
    private int port = 4370;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "device_model", length = 100)
    private String deviceModel = "ZKTeco";

    @Column(name = "location_name", nullable = false, length = 150)
    private String locationName; // WTP 1, WTP 2, Reservoir Station, Head Office, Branch Store

    @Column(name = "protocol", length = 50)
    private String protocol = "ZK_TCP"; // ZK_TCP, HIK_ISAPI, PUSH_REST

    @Column(name = "last_sync_time")
    private LocalDateTime lastSyncTime;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsBiometricDevice() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getDeviceIp() { return deviceIp; }
    public void setDeviceIp(String deviceIp) { this.deviceIp = deviceIp; }

    public int getPort() { return port; }
    public void setPort(int port) { this.port = port; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getDeviceModel() { return deviceModel; }
    public void setDeviceModel(String deviceModel) { this.deviceModel = deviceModel; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getProtocol() { return protocol; }
    public void setProtocol(String protocol) { this.protocol = protocol; }

    public LocalDateTime getLastSyncTime() { return lastSyncTime; }
    public void setLastSyncTime(LocalDateTime lastSyncTime) { this.lastSyncTime = lastSyncTime; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
