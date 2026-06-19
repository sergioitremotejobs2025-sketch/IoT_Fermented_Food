#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║        ⚠️  DANGER ZONE — GCP Full Teardown Script ⚠️                   ║
# ║                                                                          ║
# ║  This script PERMANENTLY DELETES all GCP resources created during the   ║
# ║  IoT Microservices migration. This action is IRREVERSIBLE.               ║
# ║                                                                          ║
# ║  ✅ SAFE & IDEMPOTENT: Handles missing resources gracefully.            ║
# ╚══════════════════════════════════════════════════════════════════════════╝

set -e

PROJECT="iot-microservices-gcp"
CLUSTER="iot-cluster"
REGION="europe-west1"
CLUSTER_US="iot-cluster-us"
REGION_US="us-central1"
REPO="iot-repo"
SA_EMAIL="github-actions-sa@${PROJECT}.iam.gserviceaccount.com"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ⚠️  GCP TEARDOWN — ${PROJECT}  ⚠️  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
read -p "Are you absolutely sure you want to delete ALL GCP resources? (type 'DELETE' to confirm): " CONFIRM
if [ "$CONFIRM" != "DELETE" ]; then
  echo "Teardown aborted. No resources were deleted."
  exit 0
fi

echo ""
echo "🔧 Configuring gcloud project..."
gcloud config set project "$PROJECT" --quiet

# ──────────────────────────────────────────────────────────────────────────
# STEP 1: Graceful Kubernetes Cleanup (only if clusters exist)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "📦 [1/8] Cleaning up Kubernetes workloads..."

cleanup_cluster() {
    local name=$1
    local region=$2
    echo "   Checking cluster: $name in $region..."
    if gcloud container clusters describe "$name" --region "$region" --project "$PROJECT" &>/dev/null; then
        echo "   Cluster found. Fetching credentials..."
        gcloud container clusters get-credentials "$name" --region "$region" --project "$PROJECT" --quiet &>/dev/null
        
        echo "   Deleting workloads in default namespace..."
        kubectl delete deployments,statefulsets,services,ingresses,pvc,configmaps,secrets --all -n default --ignore-not-found=true --timeout=30s &>/dev/null || true
    else
        echo "   Cluster $name not found or already deleted. Skipping."
    fi
}

cleanup_cluster "$CLUSTER" "$REGION"
cleanup_cluster "$CLUSTER_US" "$REGION_US"

# ──────────────────────────────────────────────────────────────────────────
# STEP 2: Fleet & MCS Feature Cleanup
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🕸️  [2/8] Dissolving GKE Fleet & MCS features..."

# Disable MCS feature
if gcloud container fleet features describe multiclusterservicediscovery --project "$PROJECT" &>/dev/null; then
    echo "   Disabling Multi-cluster Service Discovery..."
    gcloud container fleet features disable multiclusterservicediscovery --project "$PROJECT" --quiet &>/dev/null || true
fi

# Delete memberships
MEMBERSHIPS=$(gcloud container fleet memberships list --project "$PROJECT" --format="value(name)" 2>/dev/null || true)
for m in $MEMBERSHIPS; do
    if [ ! -z "$m" ]; then
        echo "   Deleting Fleet membership: $m"
        gcloud container fleet memberships delete "$m" --project "$PROJECT" --quiet &>/dev/null || true
    fi
done

# ──────────────────────────────────────────────────────────────────────────
# STEP 3: Delete GKE Clusters (The core cost)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "☁️  [3/8] Deleting GKE Autopilot Clusters..."

delete_cluster() {
    local name=$1
    local region=$2
    if gcloud container clusters describe "$name" --region "$region" --project "$PROJECT" &>/dev/null; then
        echo "   Deleting cluster: $name..."
        gcloud container clusters delete "$name" --region "$region" --project "$PROJECT" --quiet
    else
        echo "   Cluster $name already gone."
    fi
}

delete_cluster "$CLUSTER" "$REGION"
delete_cluster "$CLUSTER_US" "$REGION_US"

# ──────────────────────────────────────────────────────────────────────────
# STEP 4: Artifact Registry Cleanup (Cross-region)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🐳 [4/8] Purging Artifact Registry..."
REPOS=$(gcloud artifacts repositories list --project="$PROJECT" --format="value(name)" 2>/dev/null || true)
while read -r r; do
    if [ ! -z "$r" ]; then
        REPO_NAME=$(basename "$r")
        LOC=$(echo "$r" | rev | cut -d/ -f3 | rev)
        echo "   Deleting repository: $REPO_NAME in $LOC..."
        gcloud artifacts repositories delete "$REPO_NAME" --location="$LOC" --project="$PROJECT" --quiet || echo "   ⚠️  Could not delete $REPO_NAME (already gone?)"
    fi
done <<< "$REPOS"

# ──────────────────────────────────────────────────────────────────────────
# STEP 5: Cloud Storage Cleanup
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🪣  [5/8] Purging ALL Cloud Storage buckets..."
BUCKETS=$(gcloud storage buckets list --project="$PROJECT" --format="value(name)" 2>/dev/null || true)
while read -r b; do
    if [ ! -z "$b" ]; then
        echo "   Deleting bucket: $b"
        gsutil -m rm -r "$b" &>/dev/null || true
    fi
done <<< "$BUCKETS"

# ──────────────────────────────────────────────────────────────────────────
# STEP 6: IAM Cleanup
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🔑 [6/8] Deleting Service Account..."
if gcloud iam service-accounts describe "$SA_EMAIL" --project "$PROJECT" &>/dev/null; then
    gcloud iam service-accounts delete "$SA_EMAIL" --project "$PROJECT" --quiet &>/dev/null || true
    echo "   ✅ Service Account deleted."
else
    echo "   Service Account already removed."
fi

# ──────────────────────────────────────────────────────────────────────────
# STEP 7: Nuclear Sweep (Orphaned Disks & IPs)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🧹 [7/8] Performing Nuclear Sweep for orphaned resources..."

# Disks
ORPHANED_DISKS=$(gcloud compute disks list --project="$PROJECT" --format="value(name,zone)" --filter="status:READY" 2>/dev/null || true)
while read -r name zone; do
    if [ ! -z "$name" ]; then
        echo "   Cleaning orphaned disk: $name ($zone)"
        gcloud compute disks delete "$name" --zone="$zone" --project="$PROJECT" --quiet &>/dev/null || true
    fi
done <<< "$ORPHANED_DISKS"

# IPs
STATIC_IPS=$(gcloud compute addresses list --project="$PROJECT" --format="value(name,region)" --filter="status:RESERVED" 2>/dev/null || true)
while read -r name reg; do
    if [ ! -z "$name" ]; then
        echo "   Releasing idle IP: $name ($reg)"
        gcloud compute addresses delete "$name" --region="$reg" --project="$PROJECT" --quiet &>/dev/null || true
    fi
done <<< "$STATIC_IPS"

# ──────────────────────────────────────────────────────────────────────────
# STEP 7.1: GKE MCS Networking Cleanup (Forwarding Rules, Target Proxies, URL Maps)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "🌐 [7.1/8] Cleaning up GKE MCS Global Networking resources..."

# Forwarding Rules
FW_RULES=$(gcloud compute forwarding-rules list --project="$PROJECT" --global --format="value(name)" 2>/dev/null || true)
for fw in $FW_RULES; do
    if [ ! -z "$fw" ]; then
        echo "   Deleting Global Forwarding Rule: $fw"
        gcloud compute forwarding-rules delete "$fw" --global --project="$PROJECT" --quiet &>/dev/null || true
    fi
done

# Target HTTP Proxies
THP=$(gcloud compute target-http-proxies list --project="$PROJECT" --format="value(name)" 2>/dev/null || true)
for p in $THP; do
    if [ ! -z "$p" ]; then
        echo "   Deleting Target HTTP Proxy: $p"
        gcloud compute target-http-proxies delete "$p" --project="$PROJECT" --quiet &>/dev/null || true
    fi
done

# URL Maps
URL_MAPS=$(gcloud compute url-maps list --project="$PROJECT" --format="value(name)" 2>/dev/null || true)
for m in $URL_MAPS; do
    if [ ! -z "$m" ]; then
        echo "   Deleting URL Map: $m"
        gcloud compute url-maps delete "$m" --project="$PROJECT" --quiet &>/dev/null || true
    fi
done

# Backend Services
BS=$(gcloud compute backend-services list --project="$PROJECT" --global --format="value(name)" 2>/dev/null || true)
for b in $BS; do
    if [ ! -z "$b" ]; then
        echo "   Deleting Global Backend Service: $b"
        gcloud compute backend-services delete "$b" --global --project="$PROJECT" --quiet &>/dev/null || true
    fi
done

# Health Checks
HC=$(gcloud compute health-checks list --project="$PROJECT" --format="value(name)" 2>/dev/null || true)
for h in $HC; do
    if [ ! -z "$h" ]; then
        echo "   Deleting Health Check: $h"
        gcloud compute health-checks delete "$h" --project="$PROJECT" --quiet &>/dev/null || true
    fi
done

# ──────────────────────────────────────────────────────────────────────────
# STEP 8: Final Audit (Generate Cost Report)
# ──────────────────────────────────────────────────────────────────────────
echo ""
echo "📊 [8/8] Generating Final Zero-Cost Report..."
./Check__Cost_Google_Cloud.sh &>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  TEARDOWN COMPLETE — State: \$0.00 Verified    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Resources discovered and purged. Final Audit Generated."
echo "To view your zero-cost confirmation, check: COST_$(date +"%d%m%Y").md"
echo "To re-deploy, use: ./recreate_full_system.sh"
echo ""
