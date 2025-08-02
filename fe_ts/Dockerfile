# Use a lightweight Nginx image to serve static files
FROM nginx:alpine

# Copy the built frontend assets to the Nginx public directory
COPY dist /usr/share/nginx/html

# Expose the port
EXPOSE 80
