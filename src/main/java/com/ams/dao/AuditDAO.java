package com.ams.dao;

import com.ams.util.DBConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;

public class AuditDAO {
    
    /**
     * Logs an action to the audit_logs table for compliance and history tracking.
     */
    public void logAction(Long userId, String actionType, String entityType, Long entityId, String details) {
        String query = "INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, action_details) VALUES (?, ?, ?, ?, ?)";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            
            if (userId != null) {
                ps.setLong(1, userId);
            } else {
                ps.setNull(1, java.sql.Types.BIGINT);
            }
            
            ps.setString(2, actionType);
            ps.setString(3, entityType);
            ps.setLong(4, entityId);
            ps.setString(5, details);
            
            ps.executeUpdate();
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
