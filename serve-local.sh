#!/bin/bash

echo "Starting local server that mimics Azure Static Web Apps behavior..."
echo "Hugo site will be available at: http://localhost:8080"
echo "React app will be available at: http://localhost:8080/app"
echo ""
echo "Press Ctrl+C to stop"

# Use Python's built-in HTTP server to serve the public directory
cd public && python3 -m http.server 8080
