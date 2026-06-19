#!/bin/bash
#
# fix_env.sh — Fix all YAMLs for local testing (ImagePullPolicy) and apply changes.

set -e

DIR="/Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/manifests-k8s/prod"

echo "🛠️  Updating imagePullPolicy to IfNotPresent in all manifests..."

# Change imagePullPolicy: Always to IfNotPresent in all YAMLs
# Use sed -i '' on mac, or -i on linux
sed -i '' 's/imagePullPolicy: Always/imagePullPolicy: IfNotPresent/g' "$DIR"/*.yaml

echo "🚀 Applying updated manifests to Kubernetes..."
kubectl apply -f "$DIR"

echo "🔄 Waiting for pods to stabilize (some restarts might occur)..."
# We don't block for 10 minutes, just check status
sleep 10
kubectl get pods

echo "✅ Environment fix applied!"
