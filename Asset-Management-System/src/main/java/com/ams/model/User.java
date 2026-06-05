package com.ams.model;

public class User {
    private long id;
    private int roleId;
    private String name;
    private String department;
    private String designation;
    private String email;

    // Constructors
    public User() {}

    public User(long id, int roleId, String name, String department, String designation, String email) {
        this.id = id;
        this.roleId = roleId;
        this.name = name;
        this.department = department;
        this.designation = designation;
        this.email = email;
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public int getRoleId() { return roleId; }
    public void setRoleId(int roleId) { this.roleId = roleId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
