#!/bin/bash
# recreate_all_gcp.sh
# End-to-end script to recreate the entire IoT Microservices application in Google Cloud.
# This script provisions the infrastructure, updates tags, builds images, and deploys everything to Kubernetes.

set -e

echo "================================================="
echo "🌐 Step 1: Provisioning GCP Infrastructure"
echo "================================================="
chmod +x setup_gcp_infra.sh
./setup_gcp_infra.sh

echo ""
echo "================================================="
echo "🏷️  Step 2: Updating K8s Manifest Image Tags"
echo "================================================="
# Ensure python is available to run the script
if command -v python3 &>/dev/null; then
  python3 update_manifest_tags.py
else
  python update_manifest_tags.py
fi

echo ""
echo "================================================="
echo "🏗️  Step 3: Triggering GCP Cloud Builds"
echo "================================================="
chmod +x build_and_push_to_gcp.sh
./build_and_push_to_gcp.sh

echo ""
echo "================================================="
echo "⚙️  Step 4: Applying K8s Configurations & Secrets"
echo "================================================="
# We apply the configurations first so the microservices can find their environment variables and secrets.
if [ -d "manifests-k8s/config" ]; then
  kubectl apply -R -f manifests-k8s/config/ || echo "Warning: Some config issues might have occurred, but continuing..."
fi

echo ""
echo "================================================="
echo "🚀 Step 5: Deploying Microservices to GKE"
echo "================================================="
# Apply all deployments, statefulsets, and services.
if [ -d "manifests-k8s/prod" ]; then
  kubectl apply -f manifests-k8s/prod/
fi

echo ""
echo "================================================="
echo "🎉 DEPLOYMENT INITIATED OUT TO GOOGLE CLOUD!"
echo "================================================="
echo "Note: The Cloud Builds are running asynchronously in the background."
echo "Your Kubernetes Pods will temporarily experience 'ImagePullBackOff' or 'ErrImagePull'."
echo "This is completely normal! They will automatically pull the images and start successfully once the Cloud Builds complete in a few minutes."
echo ""
echo "You can check your pod status at any time with:"
echo "👉 kubectl get pods -A"
echo ""
echo "You can monitor the Cloud Build compilation progress here:"
echo "👉 https://console.cloud.google.com/cloud-build/builds?project=iot-microservices-gcp"
