#!/bin/bash
# setup_gcp_infra.sh
# Re-creates the GKE infrastructure after a teardown

PROJECT="iot-microservices-gcp"
CLUSTER="iot-cluster"
REGION="europe-west1"
REPO="iot-repo"

set -e

echo "🔧 Configuring gcloud project..."
gcloud config set project "$PROJECT"

echo "🐳 Creating Artifact Registry repository: ${REPO}..."
gcloud artifacts repositories create "$REPO" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for IoT Microservices" \
    --quiet || echo "Repository might already exist, skipping..."

echo "☁️  Creating GKE Autopilot Cluster: ${CLUSTER}..."
echo "   (This may take several minutes...)"
echo "   Note: Autopilot clusters have Network Policies enabled by default."
gcloud container clusters create-auto "$CLUSTER" \
    --region "$REGION" \
    --project "$PROJECT" \
    --quiet || echo "Cluster might already exist, skipping creation..."

echo "🔐 Fetching credentials for ${CLUSTER}..."
gcloud container clusters get-credentials "$CLUSTER" --region "$REGION" --project "$PROJECT"

echo "✅ Infrastructure setup complete!"
