#!/bin/bash

# OvenXpress Production Startup Script
# This script starts the production environment

set -e

echo "🚀 Starting OvenXpress Production Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

# Create necessary directories
mkdir -p logs
mkdir -p uploads

# Set proper permissions
chmod 755 logs
chmod 755 uploads

# Start services with Docker Compose
echo "🐳 Starting services with Docker Compose..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."

# Check MongoDB
if docker-compose exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not responding"
fi

# Check Backend
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

# Check Frontend
if curl -f http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 OvenXpress is now running!"
echo ""
echo "📊 Service URLs:"
echo "================="
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 MongoDB: localhost:27017"
echo ""
echo "📋 Useful Commands:"
echo "==================="
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo "Restart services: docker-compose restart"
echo "View service status: docker-compose ps"
echo ""
echo "🔧 Next Steps:"
echo "1. Configure your environment variables"
echo "2. Set up your database connection"
echo "3. Configure your domain name"
echo "4. Set up SSL certificate for HTTPS"
