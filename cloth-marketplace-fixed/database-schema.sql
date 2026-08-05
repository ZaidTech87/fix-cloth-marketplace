-- ============================================
-- CLOTH MARKETPLACE DATABASE SCHEMA
-- MySQL Database Setup Script
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS cloth_marketplace;
USE cloth_marketplace;

-- ============================================
-- USERS Table
-- Stores user authentication and profile information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mobile (mobile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- POSTS Table
-- Stores product posts with media
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    description TEXT,
    media_url VARCHAR(500),
    media_type VARCHAR(20),
    price DECIMAL(10, 2),
    quantity INT,
    cloth_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MESSAGES Table
-- Stores chat messages (text and voice)
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    message TEXT,
    voice_url VARCHAR(500),
    message_type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sender_receiver (sender_id, receiver_id),
    INDEX idx_created_at (created_at ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional)
-- ============================================

-- Note: Passwords are BCrypt hashed
-- Default password for all sample users: "password123"
-- BCrypt hash: $2a$10$XdLPZz8VPHaQkKvqKTF7QOxqJjvX4wGHZYVEYRJ3dKqP4g7hF4Jv6

INSERT INTO users (name, location, mobile, password) VALUES
('Rajesh Kumar', 'Mumbai, Maharashtra', '9876543210', '$2a$10$XdLPZz8VPHaQkKvqKTF7QOxqJjvX4wGHZYVEYRJ3dKqP4g7hF4Jv6'),
('Priya Sharma', 'Delhi, NCR', '9876543211', '$2a$10$XdLPZz8VPHaQkKvqKTF7QOxqJjvX4wGHZYVEYRJ3dKqP4g7hF4Jv6'),
('Arjun Patel', 'Ahmedabad, Gujarat', '9876543212', '$2a$10$XdLPZz8VPHaQkKvqKTF7QOxqJjvX4wGHZYVEYRJ3dKqP4g7hF4Jv6');

INSERT INTO posts (user_id, description, price, quantity, cloth_type) VALUES
(1, 'Premium quality cotton fabric, perfect for summer wear. Available in bulk quantities.', 299.99, 1000, 'Cotton'),
(2, 'Authentic silk material imported from Kanchipuram. Ideal for traditional wear.', 1499.99, 500, 'Silk'),
(3, 'Durable linen fabric for casual and formal clothing. Eco-friendly and sustainable.', 599.99, 750, 'Linen');

-- ============================================
-- Database Information
-- ============================================
-- Database: cloth_marketplace
-- Tables: users, posts, messages
-- Engine: InnoDB
-- Charset: utf8mb4
-- Collation: utf8mb4_unicode_ci
