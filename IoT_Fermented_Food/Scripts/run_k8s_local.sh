#!/bin/bash

# Configuration
MEMORY=7168
CPUS=8

echo "🚀 Starting IoT Microservices on local Kubernetes..."

# 1. Check if Minikube is running
if ! minikube status | grep -q "host: Running"; then
    echo "📦 Starting Minikube cluster..."
    minikube start --memory=$MEMORY --cpus=$CPUS --driver=docker --ports=80:80,443:443,31600:31600
else
    echo "✅ Minikube is already running."
fi

# 2. Apply Kubernetes Manifests
echo "📄 Applying Configuration and Storage..."
# Apply ConfigMaps and Secrets
kubectl apply -f manifests-k8s/config
# Apply PVCs (recursive to catch subfolders)
kubectl apply -f manifests-k8s/config/pvc-k8s
# Apply StorageClasses
kubectl apply -f manifests-k8s/storage

echo "🚀 Applying Production Microservices..."
kubectl apply -f manifests-k8s/prod

# 3. Wait for critical infrastructure to be ready
echo "⏳ Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod/mysql-0 --timeout=300s

echo "⏳ Waiting for pods to initialize..."
kubectl wait --for=condition=ready pod -l app=angular-ms --timeout=120s

# 4. expose the application
echo "🌐 Application will be available at the NodePort (31600)."
# minikube service angular-ms --url # Uncomment if you want to see the URL without blocking, but NodePort is fixed in manifests.


