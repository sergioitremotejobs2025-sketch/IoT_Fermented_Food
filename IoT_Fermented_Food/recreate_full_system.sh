#!/bin/bash
# recreate_full_system.sh
# End-to-end recovery of the IoT Microservices application + Cloud Simulators.

set -e

echo "🚀 Restarting entire Cloud Deployment from scratch..."

# 1. Infrastructure
echo "☁️  Step 1: Provisioning Infrastructure..."
chmod +x setup_gcp_infra.sh
./setup_gcp_infra.sh

# 2. Preparation
echo "🏷️  Step 2: Syncing Image Tags..."
python3 update_manifest_tags.py || python update_manifest_tags.py

# 3. Builds
echo "🏗️  Step 3: Building and Pushing Images (Async)..."
chmod +x build_and_push_to_gcp.sh
./build_and_push_to_gcp.sh

# 4. Deployment
echo "⚙️  Step 4: Applying K8s Manifests..."
# Apply configurations. We skip the sealed-secrets file specifically if it causes errors, allowing regular secrets to work.
find manifests-k8s/config/ -type f -not -name "sealed-secrets.yaml" -exec kubectl apply -f {} \; || true
kubectl apply -f manifests-k8s/prod/

# 5. Simulation & Data
echo "📡 Step 5: Waiting for DB to be ready for simulation..."
kubectl wait pod/mysql-0 --for=condition=Ready --timeout=300s

echo "📝 Step 6: Registering Rocky with Cloud Simulators..."
CLOUD_MODE=true Scripts/register_fake_iot.sh Rocky

echo ""
echo "================================================="
echo "✅ SYSTEM FULLY DEPLOYED IN CLOUD MODE!"
echo "================================================="
echo "Access points:"
echo "Dashboard: http://$(kubectl get svc angular-ms -o jsonpath='{.status.loadBalancer.ingress[0].ip}')"
echo "Credentials: Rocky / Rocky"
echo "================================================="
