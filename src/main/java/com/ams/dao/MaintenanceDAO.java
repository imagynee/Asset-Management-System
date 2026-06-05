package com.ams.dao;

import com.ams.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class MaintenanceDAO {

    public boolean logMaintenance(long assetId, long vendorId, String serviceDate, double cost, String remarks) {
        String insertQuery = "INSERT INTO maintenance_records (asset_id, vendor_id, service_date, cost, remarks) VALUES (?, ?, ?, ?, ?)";
        String updateAssetQuery = "UPDATE assets SET status_id = 3 WHERE id = ?"; // 3 = Under Repair

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false); 

            try (PreparedStatement psInsert = conn.prepareStatement(insertQuery);
                 PreparedStatement psUpdate = conn.prepareStatement(updateAssetQuery)) {
                
                psInsert.setLong(1, assetId);
                psInsert.setLong(2, vendorId);
                psInsert.setDate(3, java.sql.Date.valueOf(serviceDate));
                psInsert.setDouble(4, cost);
                psInsert.setString(5, remarks);
                psInsert.executeUpdate();

                psUpdate.setLong(1, assetId);
                psUpdate.executeUpdate();

                conn.commit();
                return true;
            } catch (Exception e) {
                conn.rollback();
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean completeMaintenance(long recordId, long assetId) {
        String updateRecord = "UPDATE maintenance_records SET completion_date = CURRENT_DATE WHERE id = ?";
        String updateAsset = "UPDATE assets SET status_id = 1 WHERE id = ?"; // Back to available
        
        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement psRec = conn.prepareStatement(updateRecord);
                 PreparedStatement psAss = conn.prepareStatement(updateAsset)) {
                psRec.setLong(1, recordId);
                psRec.executeUpdate();
                psAss.setLong(1, assetId);
                psAss.executeUpdate();
                conn.commit();
                return true;
            } catch(Exception e) { conn.rollback(); e.printStackTrace(); }
        } catch (Exception e) { e.printStackTrace(); }
        return false;
    }
}
