#!/bin/bash
# finalize_todo.sh
# Finalizes the tasks in TODO.md after infrastructure recreation.

set -e

export PATH=$PATH:/usr/local/bin

PROJECT="iot-microservices-gcp"
REGION_EU="europe-west1"
CLUSTER_EU="iot-cluster"
REGION_US="us-central1"
CLUSTER_US="iot-cluster-us"

echo "================================================="
echo "🚜 Step 1: Registering Clusters to Fleet"
echo "================================================="
gcloud container fleet memberships register ${CLUSTER_EU}-membership \
    --gke-cluster=${REGION_EU}/${CLUSTER_EU} \
    --enable-workload-identity \
    --project=${PROJECT} || echo "Membership already exists"

gcloud container fleet memberships register ${CLUSTER_US}-membership \
    --gke-cluster=${REGION_US}/${CLUSTER_US} \
    --enable-workload-identity \
    --project=${PROJECT} || echo "Membership already exists"

echo "================================================="
echo "🕸️  Step 2: Enabling Cloud Service Mesh"
echo "================================================="
gcloud container fleet features enable servicemesh --project=${PROJECT} || echo "Feature already enabled"
gcloud container fleet mesh update \
    --management=automatic --memberships=${CLUSTER_EU}-membership --project=${PROJECT}
gcloud container fleet mesh update \
    --management=automatic --memberships=${CLUSTER_US}-membership --project=${PROJECT}

echo "================================================="
echo "🏷️  Step 3: Labelling Namespace for Istio"
echo "================================================="
gcloud container clusters get-credentials "$CLUSTER_EU" --region "$REGION_EU" --project "$PROJECT"
kubectl label namespace default istio.io/rev=asm-managed --overwrite

echo "================================================="
echo "🚀 Step 4: Deploying Microservices & mTLS"
echo "================================================="
kubectl apply -R -f manifests-k8s/config/ || true
kubectl apply -f manifests-k8s/db/sharding/
kubectl apply -f manifests-k8s/prod/
kubectl apply -f manifests-k8s/security/istio-mtls.yaml

echo "================================================="
echo "🌩️  Step 5: Deploying Knative Services"
echo "================================================="
# Knative Serving already installed via Scripts/install_knative.sh

kubectl apply -f manifests-k8s/serverless/

echo "================================================="
echo "📦 Step 6: Configuring Sovereign Sharding"
echo "================================================="
# Wait for mongos to be ready
echo "Waiting for mongos to be ready..."
kubectl wait --for=condition=ready pod -l app=mongos --timeout=300s || echo "Mongos not ready yet, skipping script execution"

# Run the setup-zones.sh script (might need to install mongo shell in a container or use kubectl exec)
# For now, we'll try to execute it via a temporary pod or directly if mongo/mongosh is available.
chmod +x manifests-k8s/db/sharding/setup-zones.sh
./manifests-k8s/db/sharding/setup-zones.sh || echo "Sharding setup failed, manual check required"

echo "================================================="
echo "✅ ALL TASKS INITIATED!"
echo "================================================="
