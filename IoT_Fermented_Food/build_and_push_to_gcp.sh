#!/bin/bash

# Configuration
PROJECT="iot-microservices-gcp"
REGION="europe-west1"
REPO="iot-repo"
REGISTRY="$REGION-docker.pkg.dev/$PROJECT/$REPO"

# List of microservices to build and push
SERVICES=(
  "ai-ms"
  "angular-ms"
  "auth-ms"
  "fake-arduino-iot"
  "fake-arduino-iot-pictures"
  "measure-ms"
  "microcontrollers-ms"
  "mysql-iot"
  "orchestrator-ms"
  "publisher-ms"
  "stats-ms"
)

echo "🚀 Starting concurrent Cloud Builds (Optimized) for Phase 2 image migration..."

for SERVICE in "${SERVICES[@]}"; do
  echo "📦 Submitting build for $SERVICE to Artifact Registry (relying on .gcloudignore)..."
  gcloud builds submit "./$SERVICE" --tag "$REGISTRY/$SERVICE:latest" --async --quiet
done

echo "✅ All 11 optimized build jobs have been submitted to Google Cloud Build!"
echo "Check progress here: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT"
