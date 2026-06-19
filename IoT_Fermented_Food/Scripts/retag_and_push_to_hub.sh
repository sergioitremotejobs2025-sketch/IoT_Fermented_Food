#!/bin/bash
# 
# retag_and_push_to_hub.sh — Retag today's local images and push to Docker Hub.
#
set -e

HUB_USER="sergioitremotejobs2025"
LOCAL_TAG="local-20260304-113106"
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

echo "🚀 Starting retag and push for tag $LOCAL_TAG..."

for SERVICE in "${SERVICES[@]}"; do
    echo "🏷️  Retagging $SERVICE:$LOCAL_TAG..."
    # Retag as latest
    docker tag "$SERVICE:$LOCAL_TAG" "$HUB_USER/$SERVICE:latest"
    # Also retag with the same date tag on Hub
    docker tag "$SERVICE:$LOCAL_TAG" "$HUB_USER/$SERVICE:$LOCAL_TAG"
    
    echo "📤 Pushing $SERVICE to Docker Hub..."
    docker push "$HUB_USER/$SERVICE:latest"
    docker push "$HUB_USER/$SERVICE:$LOCAL_TAG"
done

echo "✅ All images retagged and pushed to Docker Hub!"
