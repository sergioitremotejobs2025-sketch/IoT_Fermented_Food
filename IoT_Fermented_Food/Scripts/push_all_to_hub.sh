#!/bin/bash
#
# push_all_to_hub.sh — Build and push all microservices to Docker Hub.
#
# Targets: sergioitremotejobs2025/[service]:latest

set -e

HUB_USER="sergioitremotejobs2025"
SERVICES=("orchestrator-ms" "auth-ms" "measure-ms" "microcontrollers-ms" "ai-ms" "stats-ms" "publisher-ms" "fake-arduino-iot-pictures")

echo "🚀 Starting full build and push to Docker Hub..."

# 1. Build, Local Load, and Push standard microservices
for SERVICE in "${SERVICES[@]}"; do
    echo "🏗️  Building $SERVICE..."
    docker build -t "$HUB_USER/$SERVICE:latest" "$SERVICE/"
    
    echo "📦 Loading $SERVICE into Minikube..."
    minikube image load "$HUB_USER/$SERVICE:latest"
    
    echo "📤 Attempting push $SERVICE to Docker Hub..."
    docker push "$HUB_USER/$SERVICE:latest" || echo "⚠️  Failed to push $SERVICE to Hub. Still loaded in Minikube."
done

# 2. Build and push Angular (special Dockerfile)
echo "🏗️  Building angular-ms (using Dockerfile.build)..."
docker build -t "$HUB_USER/angular-ms:latest" -f angular-ms/Dockerfile.build angular-ms/
echo "📦 Loading angular-ms into Minikube..."
minikube image load "$HUB_USER/angular-ms:latest"
echo "📤 Attempting push angular-ms to Docker Hub..."
docker push "$HUB_USER/angular-ms:latest" || echo "⚠️  Failed to push angular-ms to Hub. Still loaded in Minikube."


echo "✅ All images built and pushed successfully!"

echo "🔄 Updating Kubernetes deployments to pick up new images..."
for SERVICE in "${SERVICES[@]}" "angular-ms"; do
    # Only try to rollout if the deployment exists (some might be named differently or not yet applied)
    if kubectl get deployment "$SERVICE" > /dev/null 2>&1; then
        kubectl rollout restart deployment/"$SERVICE"
    fi
done

echo "🎉 Process finished!"
