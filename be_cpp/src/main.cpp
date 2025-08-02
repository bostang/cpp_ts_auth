// File: be_cpp/src/main.cpp
// C++ Authentication Server using Crow and PostgreSQL
// This code implements a simple C++ web server using Crow and PostgreSQL for authentication.
// It includes user registration, login with JWT, and a protected dashboard route.
// The server handles CORS and JWT authentication, and uses bcrypt for password hashing.
// Make sure to adjust the database connection parameters and JWT secret as needed.

#include <iostream>
#include <crow.h>
#include <pqxx/pqxx>
#include "bcrypt.h"
#include "jwt-cpp/jwt.h"
#include <memory>
#include <optional>

// Global database connection
std::unique_ptr<pqxx::connection> conn;
std::string JWT_SECRET; // Variabel global untuk kunci rahasia JWT

// ===== Middleware CORS =====
struct CORS {
    struct context {};

    void before_handle(crow::request& req, crow::response& res, context&) {
        if (req.method == "OPTIONS"_method) {
            res.add_header("Access-Control-Allow-Origin", "*");
            res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
            res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.code = 204;
            res.end();
        }
    }

    void after_handle(crow::request&, crow::response& res, context&) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.add_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
};

// ===== Middleware JWTAuth =====
struct JWTAuth {
    struct context {
        std::optional<std::string> username;
    };

    void before_handle(crow::request& req, crow::response& res, context& ctx) {
        // Abaikan otentikasi untuk rute publik
        if (req.url == "/login" || req.url == "/register") {
            return;
        }

        auto auth_header = req.get_header_value("Authorization");
        if (auth_header.substr(0, 7) != "Bearer ") {
            res.code = 401;
            res.write("Unauthorized: Bearer token missing.");
            res.end();
            return;
        }

        auto token = auth_header.substr(7);

        try {
            auto decoded = jwt::decode(token);
            auto verifier = jwt::verify()
                .allow_algorithm(jwt::algorithm::hs256{JWT_SECRET}) // Menggunakan JWT_SECRET global
                .with_issuer("auth_server");
            verifier.verify(decoded);

            ctx.username = decoded.get_payload_claim("username").as_string();
        } catch (const std::exception& e) {
            res.code = 401;
            res.write("Unauthorized: Invalid token.");
            res.end();
        }
    }

    void after_handle(crow::request&, crow::response&, context&) {}
};

// ===== MAIN =====
int main() {
    crow::App<CORS, JWTAuth> app;

    // Baca kunci rahasia JWT dari environment variable atau gunakan nilai default
    const char* jwt_secret_env = std::getenv("JWT_SECRET_KEY");
    JWT_SECRET = jwt_secret_env ? std::string(jwt_secret_env) : "your_default_secret_key";
    std::cout << "Using JWT Secret from environment variable or default value." << std::endl;

    // Connect to database
    try {
        const char* db_url_env = std::getenv("DATABASE_URL");
        std::string db_url = db_url_env ? std::string(db_url_env) : 
            "dbname=auth_db_cpp user=postgres password=password host=localhost port=5432";
            
        conn = std::make_unique<pqxx::connection>(db_url);

        if (conn->is_open()) {
            std::cout << "Connected to DB: " << conn->dbname() << std::endl;
        } else {
            std::cerr << "Failed to connect to DB.\n";
            return 1;
        }
    } catch (const std::exception& e) {
        std::cerr << "DB Connection error: " << e.what() << std::endl;
        return 1;
    }

    // REGISTER
    CROW_ROUTE(app, "/register").methods("POST"_method)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400, "Invalid JSON.");

        std::string username, password;
        try {
            username = x["username"].s();
            password = x["password"].s();
        } catch (...) {
            return crow::response(400, "Username and password are required.");
        }

        std::string hashed = bcrypt::generateHash(password);

        try {
            pqxx::work W(*conn);
            W.exec_params("INSERT INTO users (username, password_hash) VALUES ($1, $2)", username, hashed);

            W.commit();
            return crow::response(201, "Registrasi berhasil!");
        } catch (const pqxx::sql_error& e) {
            if (std::string(e.what()).find("users_username_key") != std::string::npos)
                return crow::response(409, "Username sudah ada.");
            return crow::response(500, "Kesalahan saat registrasi.");
        } catch (...) {
            return crow::response(500, "Server error.");
        }
    });

    // LOGIN
    CROW_ROUTE(app, "/login").methods("POST"_method)([](const crow::request& req){
        auto x = crow::json::load(req.body);
        if (!x) return crow::response(400, "Invalid JSON.");

        std::string username, password;
        try {
            username = x["username"].s();
            password = x["password"].s();
        } catch (...) {
            return crow::response(400, "Username and password are required.");
        }

        try {
            pqxx::nontransaction N(*conn);
            pqxx::result R = N.exec_params("SELECT password_hash FROM users WHERE username = $1", username);

            if (R.empty()) return crow::response(401, "Username atau password salah.");

            std::string stored_hash = R[0][0].as<std::string>();

            if (!bcrypt::validatePassword(password, stored_hash))
                return crow::response(401, "Username atau password salah.");

            auto token = jwt::create()
                .set_issuer("auth_server")
                .set_type("JWS")
                .set_payload_claim("username", jwt::claim(username))
                .set_expires_at(std::chrono::system_clock::now() + std::chrono::hours{1})
                .sign(jwt::algorithm::hs256{JWT_SECRET}); // Menggunakan JWT_SECRET global

            crow::json::wvalue res;
            res["message"] = "Login berhasil!";
            res["token"] = token;
            return crow::response(200, res);
        } catch (...) {
            return crow::response(500, "Server error.");
        }
    });

    // LOGOUT (dummy stateless)
    CROW_ROUTE(app, "/logout").methods("POST"_method)([](const crow::request&){
        return crow::response(200, "Logout berhasil.");
    });

    CROW_ROUTE(app, "/dashboard").methods("GET"_method)
    ([&app](const crow::request& req, crow::response& res){
        auto& ctx = app.get_context<JWTAuth>(req);

        if (!ctx.username.has_value()) {
            res.code = 401;
            res.write("Unauthorized: token tidak valid.");
            res.end();
            return;
        }

        crow::json::wvalue res_json;
        res_json["message"] = "Selamat datang di dashboard, " + ctx.username.value();
        res.code = 200;
        res.write(res_json.dump());
        res.end();
    });


    // Start app
    app.port(18080).multithreaded().run();
    return 0;
}
// End of main.cpp
