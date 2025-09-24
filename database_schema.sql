-- =====================================================
-- The Children's World - Database Schema
-- MariaDB Database for Daycare Management System
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS daycare_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE daycare_db;

-- =====================================================
-- 1. CORE USER MANAGEMENT
-- =====================================================

-- User roles enumeration
CREATE TABLE user_roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (parents, educators, administrators)
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_picture VARCHAR(500),
    role_id INT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_role (role_id),
    INDEX idx_active (is_active)
);

-- =====================================================
-- 2. CHILDREN MANAGEMENT
-- =====================================================

-- Children table
CREATE TABLE children (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    birth_city VARCHAR(100),
    profile_picture VARCHAR(500),
    address TEXT,
    has_payment_alert BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (first_name, last_name),
    INDEX idx_birth_date (birth_date),
    INDEX idx_payment_alert (has_payment_alert),
    INDEX idx_active (is_active)
);

-- Parent-Child relationships (many-to-many)
CREATE TABLE parent_child_relationships (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED NOT NULL,
    child_id INT UNSIGNED NOT NULL,
    relationship_type ENUM('father', 'mother', 'guardian', 'other') NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    UNIQUE KEY unique_parent_child (parent_id, child_id),
    INDEX idx_parent (parent_id),
    INDEX idx_child (child_id),
    INDEX idx_primary (is_primary)
);

-- =====================================================
-- 3. CONTACT INFORMATION
-- =====================================================

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_child (child_id),
    INDEX idx_primary (is_primary)
);

-- Authorized persons for pickup
CREATE TABLE authorized_pickup_persons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    photo VARCHAR(500),
    id_document VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    INDEX idx_child (child_id)
);

-- =====================================================
-- 4. MEDICAL INFORMATION
-- =====================================================

-- Medical information
CREATE TABLE medical_information (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL UNIQUE,
    allergies TEXT,
    medications TEXT,
    insurance_company VARCHAR(100),
    insurance_number VARCHAR(50),
    pediatrician_name VARCHAR(100),
    pediatrician_phone VARCHAR(20),
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

-- =====================================================
-- 5. DOCUMENTS AND ATTACHMENTS
-- =====================================================

-- Document types
CREATE TABLE document_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    retention_days INT UNSIGNED DEFAULT 365,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents/attachments
CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    document_type_id INT UNSIGNED NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_type (document_type_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- 6. DAILY ATTENDANCE AND ACTIVITIES
-- =====================================================

-- Daily attendance records
CREATE TABLE daily_attendance (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    delivered_by INT UNSIGNED NULL,
    picked_up_by INT UNSIGNED NULL,
    check_out_notes TEXT,
    check_in_notes TEXT,
    created_by INT UNSIGNED NOT NULL,
    updated_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (delivered_by) REFERENCES authorized_pickup_persons(id) ON DELETE SET NULL,
    FOREIGN KEY (picked_up_by) REFERENCES authorized_pickup_persons(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_child_date (child_id, attendance_date),
    INDEX idx_child_date (child_id, attendance_date),
    INDEX idx_date (attendance_date),
    INDEX idx_created_by (created_by)
);

-- Daily activities checklist
CREATE TABLE daily_activities (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    attendance_id INT UNSIGNED NOT NULL,
    activity_type ENUM('breakfast', 'lunch', 'snack', 'nap', 'diaper_change', 'clothing_change', 'hydration', 'other') NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    time_completed TIMESTAMP NULL,
    notes TEXT,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES daily_attendance(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_attendance (attendance_id),
    INDEX idx_type (activity_type),
    INDEX idx_date (time_completed)
);

-- Daily mood and observations
CREATE TABLE daily_observations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    attendance_id INT UNSIGNED NOT NULL,
    mood ENUM('happy', 'sad', 'tired', 'energetic', 'calm', 'cranky', 'neutral') NOT NULL,
    general_observations TEXT,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES daily_attendance(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_attendance (attendance_id),
    INDEX idx_mood (mood)
);

-- Activity photos
CREATE TABLE activity_photos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    attendance_id INT UNSIGNED NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (attendance_id) REFERENCES daily_attendance(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_attendance (attendance_id),
    INDEX idx_uploaded_by (uploaded_by)
);

-- =====================================================
-- 7. MESSAGING SYSTEM
-- =====================================================

-- Message threads
CREATE TABLE message_threads (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    subject VARCHAR(255) NOT NULL,
    thread_type ENUM('general', 'incident', 'reminder', 'activity') NOT NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_type (thread_type),
    INDEX idx_created_by (created_by)
);

-- Messages
CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    thread_id INT UNSIGNED NOT NULL,
    sender_id INT UNSIGNED NOT NULL,
    message_text TEXT NOT NULL,
    attachment_filename VARCHAR(255),
    attachment_path VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_thread (thread_id),
    INDEX idx_sender (sender_id),
    INDEX idx_created_at (created_at)
);

-- Message recipients
CREATE TABLE message_recipients (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id INT UNSIGNED NOT NULL,
    recipient_id INT UNSIGNED NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_recipient (message_id, recipient_id),
    INDEX idx_message (message_id),
    INDEX idx_recipient (recipient_id)
);

-- =====================================================
-- 8. INCIDENTS AND EMERGENCIES
-- =====================================================

-- Incident types
CREATE TABLE incident_types (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    severity_level ENUM('low', 'medium', 'high', 'critical') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Incidents/Emergencies
CREATE TABLE incidents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    child_id INT UNSIGNED NOT NULL,
    incident_type_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    location VARCHAR(255),
    action_taken TEXT,
    parent_notified BOOLEAN DEFAULT FALSE,
    parent_notified_at TIMESTAMP NULL,
    reported_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
    FOREIGN KEY (incident_type_id) REFERENCES incident_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_child (child_id),
    INDEX idx_type (incident_type_id),
    INDEX idx_date (incident_date),
    INDEX idx_reported_by (reported_by)
);

-- Incident attachments
CREATE TABLE incident_attachments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    incident_id INT UNSIGNED NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('image', 'document') NOT NULL,
    uploaded_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_incident (incident_id)
);

-- =====================================================
-- 9. CALENDAR AND EVENTS
-- =====================================================

-- Calendar events
CREATE TABLE calendar_events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type ENUM('holiday', 'vacation', 'meeting', 'event', 'closure') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_all_day BOOLEAN DEFAULT TRUE,
    start_time TIME NULL,
    end_time TIME NULL,
    created_by INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_event_type (event_type),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created_by (created_by)
);

-- =====================================================
-- 10. SYSTEM CONFIGURATION
-- =====================================================

-- System parameters
CREATE TABLE system_parameters (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parameter_key VARCHAR(100) NOT NULL UNIQUE,
    parameter_value TEXT NOT NULL,
    description TEXT,
    updated_by INT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_key (parameter_key)
);

-- Audit log for critical actions
CREATE TABLE audit_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED,
    action_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action_type),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 11. INSERT INITIAL DATA
-- =====================================================

-- Insert user roles
INSERT INTO user_roles (name, description) VALUES
('administrator', 'System administrator with full access'),
('educator', 'Daycare educator with limited access'),
('parent', 'Parent with access to their children information');

-- Insert document types
INSERT INTO document_types (name, description, retention_days) VALUES
('birth_certificate', 'Birth certificate document', 2555), -- 7 years
('vaccination_record', 'Vaccination records', 1825), -- 5 years
('authorization_form', 'Authorization forms', 365), -- 1 year
('medical_record', 'Medical records and prescriptions', 1825), -- 5 years
('emergency_contact', 'Emergency contact information', 365), -- 1 year
('insurance_card', 'Insurance card copy', 365), -- 1 year
('other', 'Other documents', 365); -- 1 year

-- Insert incident types
INSERT INTO incident_types (name, description, severity_level) VALUES
('minor_fall', 'Minor fall or stumble', 'low'),
('scrape_cut', 'Minor scrape or cut', 'low'),
('biting', 'Child biting incident', 'medium'),
('fever', 'Child develops fever', 'medium'),
('allergic_reaction', 'Allergic reaction', 'high'),
('serious_injury', 'Serious injury requiring medical attention', 'critical'),
('unauthorized_pickup', 'Unauthorized pickup attempt', 'high'),
('behavioral_issue', 'Behavioral incident', 'low'),
('other', 'Other incidents', 'medium');

-- Insert system parameters
INSERT INTO system_parameters (parameter_key, parameter_value, description) VALUES
('attachment_retention_emergency', '180', 'Retention period for emergency attachments in days'),
('attachment_retention_activities', '90', 'Retention period for activity attachments in days'),
('timezone', 'America/Bogota', 'System timezone'),
('checkout_notes_required', 'true', 'Whether checkout notes are required'),
('parent_notification_incidents', 'true', 'Whether parents should be notified of incidents'),
('max_file_size_mb', '10', 'Maximum file size for uploads in MB'),
('allowed_file_types', 'jpg,jpeg,png,pdf', 'Allowed file types for uploads');

-- =====================================================
-- 12. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for children with their primary parents
CREATE VIEW children_with_parents AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.birth_date,
    c.birth_city,
    c.profile_picture,
    c.address,
    c.has_payment_alert,
    c.is_active,
    u.first_name as parent_first_name,
    u.last_name as parent_last_name,
    u.email as parent_email,
    u.phone as parent_phone
FROM children c
LEFT JOIN parent_child_relationships pcr ON c.id = pcr.child_id AND pcr.is_primary = TRUE
LEFT JOIN users u ON pcr.parent_id = u.id;

-- View for daily attendance summary
CREATE VIEW daily_attendance_summary AS
SELECT 
    da.id,
    da.child_id,
    c.first_name,
    c.last_name,
    da.attendance_date,
    da.check_in_time,
    da.check_out_time,
    CASE 
        WHEN da.check_out_time IS NOT NULL THEN 'completed'
        WHEN da.check_in_time IS NOT NULL THEN 'present'
        ELSE 'absent'
    END as attendance_status,
    da.check_out_notes,
    da.created_by
FROM daily_attendance da
JOIN children c ON da.child_id = c.id;

-- =====================================================
-- 13. CREATE STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to calculate child age
CREATE PROCEDURE GetChildAge(IN child_id INT)
BEGIN
    SELECT 
        id,
        first_name,
        last_name,
        birth_date,
        TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) as age_years,
        TIMESTAMPDIFF(MONTH, birth_date, CURDATE()) % 12 as age_months
    FROM children 
    WHERE id = child_id;
END //

-- Procedure to get children with payment alerts
CREATE PROCEDURE GetChildrenWithPaymentAlerts()
BEGIN
    SELECT 
        c.id,
        c.first_name,
        c.last_name,
        c.has_payment_alert,
        u.first_name as parent_first_name,
        u.last_name as parent_last_name,
        u.email as parent_email
    FROM children c
    LEFT JOIN parent_child_relationships pcr ON c.id = pcr.child_id AND pcr.is_primary = TRUE
    LEFT JOIN users u ON pcr.parent_id = u.id
    WHERE c.has_payment_alert = TRUE AND c.is_active = TRUE;
END //

DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
