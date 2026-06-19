#!/bin/bash
set -e

TAG="local-$(date +%Y%m%d-%H%M%S)"

build_and_load() {
    local dir=$1
    local image_name=$2
    local dockerfile=${3:-Dockerfile}
    
    echo "🏗️  Building $image_name from $dir..."
    docker build -t "$image_name:$TAG" -f "$dir/$dockerfile" "$dir/"
    
    echo "📦 Loading $image_name:$TAG into Minikube..."
    minikube image load "$image_name:$TAG"
    
    # Check if a deployment exists for this image name
    if kubectl get deployment "$image_name" > /dev/null 2>&1; then
        echo "🔄 Updating deployment $image_name..."
        kubectl set image "deployment/$image_name" "$image_name=$image_name:$TAG"
    elif kubectl get cronjob "$image_name" > /dev/null 2>&1; then
        echo "🔄 Updating cronjob $image_name..."
        kubectl set image "cronjob/$image_name" "$image_name=$image_name:$TAG"
    else
        echo "⚠️  No deployment or cronjob found for $image_name, skipped rollout."
    fi
}

SERVICES=(
    "angular-ms"
    "orchestrator-ms" 
    "auth-ms" 
    "measure-ms" 
    "microcontrollers-ms"
    "ai-ms"
    "stats-ms"
    "publisher-ms"
    "fake-arduino-iot-pictures"
)

# 1. Build and load all services
build_and_load "angular-ms" "angular-ms" "Dockerfile.build"
build_and_load "orchestrator-ms" "orchestrator-ms"
build_and_load "auth-ms" "auth-ms"
build_and_load "measure-ms" "measure-ms"
build_and_load "microcontrollers-ms" "microcontrollers-ms"
build_and_load "ai-ms" "ai-ms"
build_and_load "stats-ms" "stats-ms"
build_and_load "publisher-ms" "publisher-ms"
build_and_load "fake-arduino-iot-pictures" "fake-arduino-iot-pictures"

echo "⏳ Waiting for rollouts..."
kubectl rollout status deployment/angular-ms
kubectl rollout status deployment/orchestrator-ms
kubectl rollout status deployment/auth-ms
kubectl rollout status deployment/measure-ms
kubectl rollout status deployment/microcontrollers-ms
kubectl rollout status deployment/ai-ms
kubectl rollout status deployment/stats-ms
kubectl rollout status deployment/fake-arduino-iot-pictures

echo "✅ All services updated to $TAG"
echo "🌐 Opening the application..."
minikube service angular-ms
