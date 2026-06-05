package com.ams.dao;

import com.ams.model.User;
import com.ams.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class UserDAO {
    
    /**
     * Authenticates a user based on email and password.
     * Note: In a production environment, password_hash should be validated using BCrypt.
     */
    public User authenticateUser(String email, String password) {
        User user = null;
        String query = "SELECT id, role_id, name, department, designation, email FROM users WHERE email = ? AND password_hash = ?";
        
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(query)) {
            
            ps.setString(1, email);
            ps.setString(2, password); 
            
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    user = new User();
                    user.setId(rs.getLong("id"));
                    user.setRoleId(rs.getInt("role_id"));
                    user.setName(rs.getString("name"));
                    user.setDepartment(rs.getString("department"));
                    user.setDesignation(rs.getString("designation"));
                    user.setEmail(rs.getString("email"));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return user;
    }
}
