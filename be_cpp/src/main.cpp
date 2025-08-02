#include <iostream>
#include <crow.h>
#include <pqxx/pqxx>
#include <pqxx/except>
#include "bcrypt.h"
#include <string>

// Global connection to the database
std::unique_ptr<pqxx::connection> conn;

// CORS Middleware to allow requests from the frontend
struct CORS {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        if (req.method == "OPTIONS"_method) {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.code = 204;
            res.end();
        }
    }

    void after_handle(crow::request& req, crow::response& res, context& ctx) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
};

int main() {
    crow::App<CORS> app;

    try {
        conn = std::make_unique<pqxx::connection>("dbname=auth_db_cpp user=postgres password=password host=localhost port=5432");
        if (conn->is_open()) {
            std::cout << "Successfully connected to the database: " << conn->dbname() << std::endl;
        } else {
            std::cerr << "Failed to connect to the database." << std::endl;
            return 1;
        }
    } catch (const std::exception &e) {
        std::cerr << "Database connection error: " << e.what() << std::endl;
        return 1;
    }

    CROW_ROUTE(app, "/register").methods("POST"_method)([](const crow::request& req){
        crow::json::rvalue x = crow::json::load(req.body);
        if (!x) {
            return crow::response(400, "Invalid JSON.");
        }

        std::string username;
        std::string password;

        try {
            username = x["username"].s();
            password = x["password"].s();
        } catch (const std::runtime_error& e) {
            return crow::response(400, "Username and password are required.");
        }

        std::string hashed_password = bcrypt::generateHash(password);

        try {
            pqxx::work W(*conn);
            W.exec_params("INSERT INTO users (username, password_hash) VALUES ($1, $2)", username, hashed_password);
            W.commit();
            return crow::response(201, "Registrasi berhasil!");
        } catch (const pqxx::sql_error &e) {
            if (std::string(e.what()).find("users_username_key") != std::string::npos) {
                return crow::response(409, "Username sudah ada.");
            }
            std::cerr << "SQL error: " << e.what() << std::endl;
            return crow::response(500, "Terjadi kesalahan saat registrasi.");
        } catch (const std::exception &e) {
            std::cerr << "Error during registration: " << e.what() << std::endl;
            return crow::response(500, "Terjadi kesalahan server.");
        }
    });

    CROW_ROUTE(app, "/login").methods("POST"_method)([](const crow::request& req){
        crow::json::rvalue x = crow::json::load(req.body);
        if (!x) {
            return crow::response(400, "Invalid JSON.");
        }
        
        std::string username;
        std::string password;
        
        try {
            username = x["username"].s();
            password = x["password"].s();
        } catch (const std::runtime_error& e) {
            return crow::response(400, "Username and password are required.");
        }

        try {
            pqxx::nontransaction N(*conn);
            pqxx::result R = N.exec_params("SELECT password_hash FROM users WHERE username = $1", username);

            if (R.empty()) {
                return crow::response(401, "Username atau password salah.");
            }
            
            std::string stored_hash = R[0][0].as<std::string>();
            
            if (bcrypt::validatePassword(password, stored_hash)) {
                return crow::response(200, "Login berhasil!");
            } else {
                return crow::response(401, "Username atau password salah.");
            }
        } catch (const std::exception &e) {
            std::cerr << "Error during login: " << e.what() << std::endl;
            return crow::response(500, "Terjadi kesalahan server.");
        }
    });

    app.port(18080).multithreaded().run();
    return 0;
}