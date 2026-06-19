#!/bin/bash
# Scripts/install_knative.sh
# Installs Knative Serving on GKE Autopilot using Istio for networking.

set -e
export PATH=$PATH:/usr/local/bin

PROJECT="iot-microservices-gcp"
REGION="europe-west1"
CLUSTER="iot-cluster"

gcloud container clusters get-credentials "$CLUSTER" --region "$REGION" --project "$PROJECT"

echo "Installing Knative Serving CRDs..."
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-crds.yaml

echo "Installing Knative Serving Core..."
kubectl apply -f https://github.com/knative/serving/releases/download/knative-v1.13.0/serving-core.yaml

echo "Waiting for Knative Webhook to be ready..."
kubectl wait --for=condition=ready pod -l app=webhook -n knative-serving --timeout=300s

echo "Installing Knative Istio Controller..."
kubectl apply -f https://github.com/knative/net-istio/releases/download/knative-v1.13.0/net-istio.yaml

echo "Waiting for Knative Serving to be ready..."
kubectl wait --for=condition=ready pod -n knative-serving --all --timeout=300s || echo "Wait failed, but continuing..."

echo "Knative Serving installation initiated."
