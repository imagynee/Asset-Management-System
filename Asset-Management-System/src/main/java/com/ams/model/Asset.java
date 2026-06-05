package com.ams.model;

import java.util.Date;

public class Asset {
    private long id;
    private String assetIdTag;
    private String assetName;
    private long categoryId;
    private String categoryName; // Joined from categories table
    private long vendorId;
    private String serialNo;
    private Date purchaseDate;
    private Date warrantyExpiry;
    private int statusId;
    private String statusName; // Joined from asset_statuses table
    private String assignedTo; // Joined from asset_assignments and users

    // Constructors
    public Asset() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getAssetIdTag() { return assetIdTag; }
    public void setAssetIdTag(String assetIdTag) { this.assetIdTag = assetIdTag; }

    public String getAssetName() { return assetName; }
    public void setAssetName(String assetName) { this.assetName = assetName; }

    public long getCategoryId() { return categoryId; }
    public void setCategoryId(long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public long getVendorId() { return vendorId; }
    public void setVendorId(long vendorId) { this.vendorId = vendorId; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public Date getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(Date purchaseDate) { this.purchaseDate = purchaseDate; }

    public Date getWarrantyExpiry() { return warrantyExpiry; }
    public void setWarrantyExpiry(Date warrantyExpiry) { this.warrantyExpiry = warrantyExpiry; }

    public int getStatusId() { return statusId; }
    public void setStatusId(int statusId) { this.statusId = statusId; }

    public String getStatusName() { return statusName; }
    public void setStatusName(String statusName) { this.statusName = statusName; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
}
