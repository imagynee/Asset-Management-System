package com.ams.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    // Database credentials and URL configured for MySQL locally
    private static final String URL = "jdbc:mysql://localhost:3306/ams_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
    private static final String USER = "root"; 
    private static final String PASSWORD = "root"; 

    public static Connection getConnection() {
        Connection conn = null;
        try {
            // Load the MySQL JDBC Driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            // Establish Connection
            conn = DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            System.err.println("Database Connection Failed. Check your URL, Username, and Password.");
        }
        return conn;
    }
}
