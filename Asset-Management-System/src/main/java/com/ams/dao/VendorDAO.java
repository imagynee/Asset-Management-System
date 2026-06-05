package com.ams.dao;

import com.ams.model.Vendor;
import com.ams.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class VendorDAO {

    public boolean addVendor(Vendor vendor) {
        String query = "INSERT INTO vendors (vendor_name, contact_email, contact_phone) VALUES (?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            ps.setString(1, vendor.getVendorName());
            ps.setString(2, vendor.getContactEmail());
            ps.setString(3, vendor.getContactPhone());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Vendor> getAllVendors() {
        List<Vendor> vendors = new ArrayList<>();
        String query = "SELECT * FROM vendors ORDER BY vendor_name ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Vendor v = new Vendor();
                v.setId(rs.getLong("id"));
                v.setVendorName(rs.getString("vendor_name"));
                v.setContactEmail(rs.getString("contact_email"));
                v.setContactPhone(rs.getString("contact_phone"));
                v.setCreatedAt(rs.getDate("created_at"));
                vendors.add(v);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return vendors;
    }
}
