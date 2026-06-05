package com.ams.dao;

import com.ams.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class AssignmentDAO {

    public boolean assignAsset(long assetId, long userId, long adminId, String remarks) {
        String insertQuery = "INSERT INTO asset_assignments (asset_id, user_id, assigned_by, remarks) VALUES (?, ?, ?, ?)";
        String updateAssetQuery = "UPDATE assets SET status_id = 2 WHERE id = ?"; // 2 = Assigned

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false); // Start transaction

            try (PreparedStatement psInsert = conn.prepareStatement(insertQuery);
                 PreparedStatement psUpdate = conn.prepareStatement(updateAssetQuery)) {
                
                // Insert Assignment Record
                psInsert.setLong(1, assetId);
                psInsert.setLong(2, userId);
                psInsert.setLong(3, adminId);
                psInsert.setString(4, remarks);
                psInsert.executeUpdate();

                // Update Asset Status to Assigned
                psUpdate.setLong(1, assetId);
                psUpdate.executeUpdate();

                conn.commit(); // Commit transaction
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

    public boolean returnAsset(long assignmentId, long assetId) {
        String updateAssignmentQuery = "UPDATE asset_assignments SET returned_date = CURRENT_TIMESTAMP WHERE id = ?";
        String updateAssetQuery = "UPDATE assets SET status_id = 1 WHERE id = ?"; // 1 = Available

        try (Connection conn = DBConnection.getConnection()) {
            conn.setAutoCommit(false); 

            try (PreparedStatement psAssign = conn.prepareStatement(updateAssignmentQuery);
                 PreparedStatement psAsset = conn.prepareStatement(updateAssetQuery)) {
                
                psAssign.setLong(1, assignmentId);
                psAssign.executeUpdate();

                psAsset.setLong(1, assetId);
                psAsset.executeUpdate();

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
}
