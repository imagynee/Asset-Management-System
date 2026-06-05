-- Database: ams_db
-- Character Set: utf8mb4 (Recommended by MySQL best practices)

CREATE DATABASE IF NOT EXISTS ams_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE ams_db;

-- 1. Roles (Lookup table over ENUM for better indexing/scalability)
CREATE TABLE roles (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO roles (role_name) VALUES ('ADMIN'), ('USER');

-- 2. Asset Statuses (Lookup table over ENUM)
CREATE TABLE asset_statuses (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO asset_statuses (status_name) VALUES ('Available'), ('Assigned'), ('Maintenance'), ('Disposed');

-- 3. Categories (Computers, Laptops, Printers, etc.)
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Users (Includes employees and admins)
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id TINYINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 5. Vendors (For warranty and maintenance tracking)
CREATE TABLE vendors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Assets
CREATE TABLE assets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id_tag VARCHAR(100) NOT NULL UNIQUE, -- E.g., A1001, P2002
    asset_name VARCHAR(255) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    vendor_id BIGINT UNSIGNED,
    serial_no VARCHAR(255) UNIQUE,
    purchase_date DATE NOT NULL,
    warranty_expiry DATE,
    status_id TINYINT UNSIGNED NOT NULL DEFAULT 1, -- Defaults to 'Available'
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (status_id) REFERENCES asset_statuses(id)
);

-- 7. Asset Assignments (Tracking issue/return history)
CREATE TABLE asset_assignments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NOT NULL, -- Admin who assigned it
    assigned_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    returned_date DATETIME,
    remarks TEXT,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- 8. Maintenance Records
CREATE TABLE maintenance_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    asset_id BIGINT UNSIGNED NOT NULL,
    vendor_id BIGINT UNSIGNED,
    service_date DATE NOT NULL,
    completion_date DATE,
    cost DECIMAL(10, 2),
    remarks TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- 9. Audit Logs (For system transparency)
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED, -- Can be NULL for system actions
    action_type VARCHAR(100) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'ASSET', 'USER'
    entity_id BIGINT UNSIGNED NOT NULL,
    action_details TEXT, -- JSON snapshot of the change
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Creating common indexes to speed up lookups (MySQL best practices)
CREATE INDEX idx_assets_status ON assets(status_id);
CREATE INDEX idx_assignments_asset ON asset_assignments(asset_id);
CREATE INDEX idx_assignments_user ON asset_assignments(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
