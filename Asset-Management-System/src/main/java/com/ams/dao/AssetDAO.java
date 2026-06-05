package com.ams.dao;

import com.ams.model.Asset;
import com.ams.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

public class AssetDAO {

    /**
     * Fetches all assets with their joined category, status, and assignment data.
     */
    public List<Asset> getAllRecentAssets() {
        List<Asset> assetList = new ArrayList<>();
        
        // Complex query joining assets, categories, statuses, assignments, and users
        String query = "SELECT a.id, a.asset_id_tag, a.asset_name, a.serial_no, " +
                       "c.name AS category_name, s.status_name, " +
                       "u.name AS assigned_to " +
                       "FROM assets a " +
                       "JOIN categories c ON a.category_id = c.id " +
                       "JOIN asset_statuses s ON a.status_id = s.id " +
                       "LEFT JOIN asset_assignments aa ON a.id = aa.asset_id AND aa.returned_date IS NULL " +
                       "LEFT JOIN users u ON aa.user_id = u.id " +
                       "ORDER BY a.created_at DESC LIMIT 10";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                Asset asset = new Asset();
                asset.setId(rs.getLong("id"));
                asset.setAssetIdTag(rs.getString("asset_id_tag"));
                asset.setAssetName(rs.getString("asset_name"));
                asset.setSerialNo(rs.getString("serial_no"));
                asset.setCategoryName(rs.getString("category_name"));
                asset.setStatusName(rs.getString("status_name"));
                
                String assignedTo = rs.getString("assigned_to");
                asset.setAssignedTo(assignedTo != null ? assignedTo : "-");
                
                assetList.add(asset);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    /**
     * Inserts a new asset into the database.
     * @return The generated ID, or -1 if failed.
     */
    public long addAsset(Asset asset) {
        String query = "INSERT INTO assets (asset_id_tag, asset_name, category_id, serial_no, purchase_date, warranty_expiry, status_id) " +
                       "VALUES (?, ?, ?, ?, ?, ?, ?)";
        long generatedId = -1;
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query, PreparedStatement.RETURN_GENERATED_KEYS)) {
            
            ps.setString(1, asset.getAssetIdTag());
            ps.setString(2, asset.getAssetName());
            ps.setLong(3, asset.getCategoryId());
            ps.setString(4, asset.getSerialNo());
            ps.setDate(5, new java.sql.Date(asset.getPurchaseDate().getTime()));
            
            if (asset.getWarrantyExpiry() != null) {
                ps.setDate(6, new java.sql.Date(asset.getWarrantyExpiry().getTime()));
            } else {
                ps.setNull(6, java.sql.Types.DATE);
            }
            ps.setInt(7, asset.getStatusId());
            
            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet rs = ps.getGeneratedKeys()) {
                    if (rs.next()) {
                        generatedId = rs.getLong(1);
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return generatedId;
    }
}
