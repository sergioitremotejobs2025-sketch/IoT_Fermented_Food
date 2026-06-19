#!/bin/bash
# setup_gke_mcs_exports.sh - Export services for GKE Multi-cluster Services (MCS)
# This replaces the Cilium ClusterMesh global-service annotation strategy for GKE Autopilot.

set -e

PROJECT="iot-microservices-gcp"
REGION_EU="europe-west1"
CLUSTER_EU="iot-cluster"
REGION_US="us-central1"
CLUSTER_US="iot-cluster-us"

# Core microservices to be exported to the ClusterSet
SERVICES=("auth-ms" "orchestrator-ms" "measure-ms" "stats-ms" "ai-ms" "microcontrollers-ms" "angular-ms")

export_services() {
    local context=$1
    echo "================================================="
    echo "📤 Exporting services on cluster: $context"
    echo "================================================="
    
    for svc in "${SERVICES[@]}"; do
        echo "🔹 Registering ServiceExport for: $svc..."
        cat <<EOF | kubectl apply --context "$context" -f -
apiVersion: net.gke.io/v1
kind: ServiceExport
metadata:
  name: $svc
  namespace: default
EOF
    done
}

echo "🌍 Phase 4: Enabling Multi-region Service Discovery (MCS)"

# 1. Fetch credentials just in case
gcloud container clusters get-credentials "$CLUSTER_EU" --region "$REGION_EU" --project "$PROJECT"
gcloud container clusters get-credentials "$CLUSTER_US" --region "$REGION_US" --project "$PROJECT"

# 2. Export EU services
export_services "gke_${PROJECT}_${REGION_EU}_${CLUSTER_EU}"

# 3. Export US services
export_services "gke_${PROJECT}_${REGION_US}_${CLUSTER_US}"

echo ""
echo "✅ ACTIVE-ACTIVE CONFIGURATION COMPLETE!"
echo "================================================="
echo "The Fleet controller is now synchronizing the ClusterSet."
echo "Wait 2-5 minutes for the ServiceImports to propagate."
echo ""
echo "To verify discovery, run:"
echo "👉 kubectl get serviceimports --context gke_${PROJECT}_${REGION_EU}_${CLUSTER_EU}"
echo ""
echo "Note: Services are now reachable via:"
echo "👉 <service-name>.<namespace>.svc.clusterset.local"
