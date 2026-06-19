#!/bin/bash
# setup_gcp_infra_us.sh
# Provisions the Secondary GKE Autopilot Cluster in North America (Phase 4)
# Explicitly uses non-overlapping CIDR blocks to ensure Cilium ClusterMesh compatibility.

PROJECT="iot-microservices-gcp"
CLUSTER="iot-cluster-us"
REGION="us-central1"

# Safe RFC 1918 non-overlapping CIDRs (Avoids GCP 'default' 10.x.x.x auto-subnet collisions)
POD_CIDR="172.16.0.0/14"
SVC_CIDR="172.20.0.0/20"

set -e

echo ""
echo "================================================="
echo "🌍 Phase 4: Provisioning Global Mesh Secondary Cluster"
echo "================================================="
echo "🔧 Configuring gcloud project..."
gcloud config set project "$PROJECT"

echo "☁️  Creating GKE Autopilot Cluster: ${CLUSTER} in ${REGION}..."
echo "   (This may take several minutes...)"
echo "   Using Pod CIDR: ${POD_CIDR}"
echo "   Using Service CIDR: ${SVC_CIDR}"
echo "   Note: Autopilot clusters have Network Policies enabled by default."

# Note: We must specify explicit IP ranges to avoid route collision with the EU cluster
gcloud container clusters create-auto "$CLUSTER" \
    --region "$REGION" \
    --project "$PROJECT" \
    --cluster-ipv4-cidr="$POD_CIDR" \
    --services-ipv4-cidr="$SVC_CIDR" \
    --quiet || echo "Cluster might already exist, skipping creation..."

echo ""
echo "🔐 Fetching credentials for ${CLUSTER}..."
gcloud container clusters get-credentials "$CLUSTER" --region "$REGION" --project "$PROJECT"

echo ""
echo "✅ US Secondary Infrastructure setup complete!"
echo "   The cluster is ready for Cilium deployment."
