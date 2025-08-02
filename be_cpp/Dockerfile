FROM ubuntu:latest

# Install runtime dependencies for the C++ backend
RUN apt-get update && apt-get install -y libpqxx-dev libboost-dev libssl-dev libasio-dev && rm -rf /var/lib/apt/lists/*

# Copy the built C++ executable
COPY build/server /app/server

# Expose the application port
EXPOSE 8080

# Set the working directory
WORKDIR /app

# Command to run the application
CMD ["./server"]
