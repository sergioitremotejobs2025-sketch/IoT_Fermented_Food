#!/bin/bash
set -e

TAG="local-$(date +%Y%m%d-%H%M%S)"
IMAGE="angular-ms:${TAG}"

echo "🏗️  Building Angular image: ${IMAGE}"
echo "   (This takes ~10 minutes for ng build --prod)"
docker build --no-cache -t "$IMAGE" -f angular-ms/Dockerfile.build angular-ms/

echo "📦 Loading image into Minikube..."
minikube image load "$IMAGE"

echo "🔄 Updating deployment to use new image..."
kubectl set image deployment/angular-ms angular-ms="$IMAGE"

echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/angular-ms --timeout=180s

echo "✅ Done! Refresh http://127.0.0.1:50696"
