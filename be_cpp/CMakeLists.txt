cmake_minimum_required(VERSION 3.10)
project(simple_auth_backend CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

add_subdirectory(lib/Crow)
add_subdirectory(lib/libpqxx)
add_subdirectory(lib/bcrypt)

add_executable(server src/main.cpp)

# Tentukan direktori include yang benar
target_include_directories(server PRIVATE lib/bcrypt/include)

# Tautkan library ke executable.
target_link_libraries(server Crow::Crow pqxx bcrypt)

set_target_properties(server PROPERTIES
    CXX_EXTENSIONS OFF
)