#!/bin/bash

# OvenXpress Database Backup Script
# This script creates a backup of the MongoDB database

set -e

# Configuration
BACKUP_DIR="/opt/ovenxpress/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ovenxpress_backup_${DATE}.tar.gz"
MONGODB_CONTAINER="ovenxpress-mongo"

echo "🗄️ Starting database backup..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup using mongodump
echo "📦 Creating database backup..."
docker-compose exec -T $MONGODB_CONTAINER mongodump --archive --gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

# Verify backup was created
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "✅ Backup created successfully: ${BACKUP_FILE}"
    
    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
    echo "📊 Backup size: ${BACKUP_SIZE}"
    
    # Clean up old backups (keep last 7 days)
    echo "🧹 Cleaning up old backups..."
    find $BACKUP_DIR -name "ovenxpress_backup_*.tar.gz" -mtime +7 -delete
    
    echo "✅ Backup process completed successfully!"
else
    echo "❌ Backup creation failed!"
    exit 1
fi

echo ""
echo "📋 Backup Information:"
echo "====================="
echo "📁 Backup location: ${BACKUP_DIR}/${BACKUP_FILE}"
echo "📅 Created: $(date)"
echo "💾 Size: ${BACKUP_SIZE}"
echo ""
echo "🔄 To restore from backup:"
echo "docker-compose exec -T $MONGODB_CONTAINER mongorestore --archive --gzip < ${BACKUP_DIR}/${BACKUP_FILE}"
