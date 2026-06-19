#!/bin/bash
# setup-zones.sh
# Script to configure MongoDB Zone Sharding for Sovereign Sharding

# Wait for mongos to be ready
echo "Waiting for mongos pod to be ready..."
kubectl wait --for=condition=ready pod -l app=mongos --timeout=300s

echo "🚀 Configuring Sharded Cluster via kubectl exec..."

# Define the mongo commands
MONGO_COMMANDS=$(cat <<EOF
// 1. Add Shards to the cluster
sh.addShard("shard-eurs/mongo-shard-eu-0.mongo-shard-eu.default.svc.cluster.local:27017")
sh.addShard("shard-usrs/mongo-shard-us-0.mongo-shard-us.default.svc.cluster.local:27017")

// 2. Enable Sharding for the database
sh.enableSharding("iot")

// 3. Define Zones (Tags)
sh.addShardTag("shard-eurs", "EU")
sh.addShardTag("shard-usrs", "US")

// 4. Shard the collections based on jurisdiction
sh.shardCollection("iot.humidities", { "jurisdiction": 1, "timestamp": 1 })
sh.shardCollection("iot.temperatures", { "jurisdiction": 1, "timestamp": 1 })
sh.shardCollection("iot.lights", { "jurisdiction": 1, "timestamp": 1 })
sh.shardCollection("iot.pictures", { "jurisdiction": 1, "timestamp": 1 })

// 5. Assign Tag Ranges to Zones
sh.addTagRange("iot.humidities", { "jurisdiction": "EU", "timestamp": MinKey }, { "jurisdiction": "EU", "timestamp": MaxKey }, "EU")
sh.addTagRange("iot.humidities", { "jurisdiction": "US", "timestamp": MinKey }, { "jurisdiction": "US", "timestamp": MaxKey }, "US")

sh.addTagRange("iot.temperatures", { "jurisdiction": "EU", "timestamp": MinKey }, { "jurisdiction": "EU", "timestamp": MaxKey }, "EU")
sh.addTagRange("iot.temperatures", { "jurisdiction": "US", "timestamp": MinKey }, { "jurisdiction": "US", "timestamp": MaxKey }, "US")

sh.addTagRange("iot.lights", { "jurisdiction": "EU", "timestamp": MinKey }, { "jurisdiction": "EU", "timestamp": MaxKey }, "EU")
sh.addTagRange("iot.lights", { "jurisdiction": "US", "timestamp": MinKey }, { "jurisdiction": "US", "timestamp": MaxKey }, "US")

sh.addTagRange("iot.pictures", { "jurisdiction": "EU", "timestamp": MinKey }, { "jurisdiction": "EU", "timestamp": MaxKey }, "EU")
sh.addTagRange("iot.pictures", { "jurisdiction": "US", "timestamp": MinKey }, { "jurisdiction": "US", "timestamp": MaxKey }, "US")
EOF
)

# Execute the commands in the mongos pod
kubectl exec deployment/mongos -- mongo --quiet --eval "$MONGO_COMMANDS"

echo "✅ Sovereign Sharding configured!"
