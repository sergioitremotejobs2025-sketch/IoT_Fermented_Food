#!/bin/bash
# deploy_cilium_mesh.sh
# Automates the deployment and peering of Cilium ClusterMesh across EU and US clusters.
# NOTE: This script assumes that 'iot-cluster' (EU) and 'iot-cluster-us' (US) are already provisioned.

PROJECT="iot-microservices-gcp"
CLUSTER_EU="iot-cluster"
REGION_EU="europe-west1"

CLUSTER_US="iot-cluster-us"
REGION_US="us-central1"

set -e

echo "================================================="
echo "🐝 Deploying Cilium Service Mesh (Phase 4)"
echo "================================================="

# Validate and set the cilium binary path
if command -v cilium &> /dev/null; then
    CILIUM_BIN="cilium"
elif [ -f "./cilium" ]; then
    CILIUM_BIN="./cilium"
    chmod +x ./cilium
else
    echo "❌ Error: 'cilium' CLI could not be found in PATH or current directory."
    echo "Please download it: https://github.com/cilium/cilium-cli/releases/latest"
    exit 1
fi

echo ""
echo "🔗 [1/4] Installing Cilium on Primary Cluster (EU)..."
gcloud container clusters get-credentials "$CLUSTER_EU" --region "$REGION_EU" --project "$PROJECT"
# Add cilium repo if uninstalled
helm repo add cilium https://helm.cilium.io/ 2>/dev/null || true
helm repo update

# Install Cilium using the EU values
helm upgrade --install cilium cilium/cilium \
  --version 1.15.1 \
  --namespace kube-system \
  -f manifests-k8s/networking/cilium-values-eu.yaml

# Enable ClusterMesh on EU
$CILIUM_BIN clustermesh enable --context "gke_${PROJECT}_${REGION_EU}_${CLUSTER_EU}"

echo ""
echo "🔗 [2/4] Installing Cilium on Secondary Cluster (US)..."
gcloud container clusters get-credentials "$CLUSTER_US" --region "$REGION_US" --project "$PROJECT"

# Install Cilium using the US values
helm upgrade --install cilium cilium/cilium \
  --version 1.15.1 \
  --namespace kube-system \
  -f manifests-k8s/networking/cilium-values-us.yaml

# Enable ClusterMesh on US
$CILIUM_BIN clustermesh enable --context "gke_${PROJECT}_${REGION_US}_${CLUSTER_US}"

echo ""
echo "⏳ [3/4] Waiting for ClusterMesh Agents to become ready..."
echo "Sleeping for 60 seconds to allow LoadBalancers to provision..."
sleep 60

echo ""
echo "🌐 [4/4] Establishing Cross-Cluster Peering..."
# Connect EU to US
$CILIUM_BIN clustermesh connect \
  --context "gke_${PROJECT}_${REGION_EU}_${CLUSTER_EU}" \
  --destination-context "gke_${PROJECT}_${REGION_US}_${CLUSTER_US}"

echo ""
echo "================================================="
echo "✅ CILIUM CLUSTERMESH DEPLOYMENT COMPLETE!"
echo "================================================="
echo "Run the following command to verify the peering status:"
echo "👉 $CILIUM_BIN clustermesh status --context gke_${PROJECT}_${REGION_EU}_${CLUSTER_EU}"
echo ""
echo "Next step: Annotate your services with 'io.cilium/global-service: \"true\"' to enable global discovery."
