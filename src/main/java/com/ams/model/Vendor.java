package com.ams.model;

import java.util.Date;

public class Vendor {
    private long id;
    private String vendorName;
    private String contactEmail;
    private String contactPhone;
    private Date createdAt;

    public Vendor() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
