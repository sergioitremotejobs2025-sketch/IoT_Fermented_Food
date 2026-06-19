#!/bin/bash
# Data Migration Script: Dump Local & Restore to GKE
# Usage: ./migrate.sh [local_mysql_port] [local_mongo_port]

LOCAL_MYSQL_PORT=${1:-3306}
LOCAL_MONGO_PORT=${2:-27017}
GKE_MYSQL_POD="mysql-0"
GKE_MONGO_POD="mongo-0"

echo "🚀 Starting Data Migration..."

# 1. MySQL Migration
echo "📦 Dumping local MySQL data (iot)..."
mysqldump -h localhost -P $LOCAL_MYSQL_PORT -u root -p iot > iot_dump.sql

echo "📤 Uploading and restoring to GKE ($GKE_MYSQL_POD)..."
kubectl cp iot_dump.sql $GKE_MYSQL_POD:/tmp/iot_dump.sql
kubectl exec $GKE_MYSQL_POD -- mysql -u root -pf001de9f90e1eae14f8eff7782c2f811 iot < iot_dump.sql

# 2. MongoDB Migration
echo "📦 Dumping local MongoDB data (iot)..."
mongodump --host localhost --port $LOCAL_MONGO_PORT --db iot --out ./mongo_dump

echo "📤 Uploading and restoring to GKE ($GKE_MONGO_POD)..."
# Zip it first for easier transfer
tar -czf mongo_dump.tar.gz ./mongo_dump
kubectl cp mongo_dump.tar.gz $GKE_MONGO_POD:/tmp/mongo_dump.tar.gz
kubectl exec $GKE_MONGO_POD -- tar -xzf /tmp/mongo_dump.tar.gz -C /tmp
kubectl exec $GKE_MONGO_POD -- mongorestore -u root -p secret --authenticationDatabase admin --db iot /tmp/mongo_dump/iot

echo "✅ Migration complete!"
rm iot_dump.sql mongo_dump.tar.gz
rm -rf ./mongo_dump
