-- Terhubung ke server PostgreSQL Anda, misalnya dengan psql
-- psql -U postgres

-- Buat database baru
DROP DATABASE IF EXISTS auth_db_cpp;
CREATE DATABASE auth_db_cpp;

-- Hubungkan ke database yang baru dibuat
\c auth_db_cpp;

-- Buat tabel users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
