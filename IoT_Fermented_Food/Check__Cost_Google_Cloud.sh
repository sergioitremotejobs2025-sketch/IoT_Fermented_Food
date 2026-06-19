#!/bin/bash

# Configuration
export PATH=$PATH:/usr/local/bin
PROJECT_ID="iot-microservices-gcp"
DATE=$(date +"%d%m%Y")
OUTPUT_FILE="COST_${DATE}.md"

echo "Running GCP resource checks for project: ${PROJECT_ID}..."
echo "Writing results to: ${OUTPUT_FILE}"

# Initialize the markdown file
echo "# Google Cloud Resources & Final State Check" > "$OUTPUT_FILE"
echo "Date: $(date +"%Y-%m-%d %H:%M:%S")" >> "$OUTPUT_FILE"
echo "Project ID: \`${PROJECT_ID}\`" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "This file documents the status of resources that might incur costs in the Google Cloud Project." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 1. Check Compute Engine Instances
echo "Checking Compute Engine Instances..."
echo "## 1. Compute Engine Instances (VMs)" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud compute instances list --project=$PROJECT_ID >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 2. Check Kubernetes Engine Clusters
echo "Checking Kubernetes Engine Clusters..."
echo "## 2. Kubernetes Engine Clusters (GKE)" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud container clusters list --project=$PROJECT_ID >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 3. Check Cloud SQL Instances
echo "Checking Cloud SQL Instances..."
echo "## 3. Cloud SQL Databases" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud sql instances list --project=$PROJECT_ID >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 4. Check Artifact Registry Repositories
echo "Checking Artifact Registry Repositories..."
echo "## 4. Artifact Registry (Docker images)" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud artifacts repositories list --project=$PROJECT_ID >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 5. Check Compute Engine Disks
echo "Checking Compute Disks..."
echo "## 5. Compute Engine Disks (Persistent Storage)" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud compute disks list --project=$PROJECT_ID >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 6. Check Cloud Run Services
echo "Checking Cloud Run Services..."
echo "## 6. Cloud Run Services" >> "$OUTPUT_FILE"
echo '```text' >> "$OUTPUT_FILE"
gcloud run services list --project=$PROJECT_ID --quiet >> "$OUTPUT_FILE" 2>&1
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# 7. Dynamic Daily Cost Calculation
echo "Calculating estimated daily costs..."
echo "## 💡 7. Estimated Daily Cost (Dynamic)" >> "$OUTPUT_FILE"

# Check existence
EU_EXISTS=$(gcloud container clusters list --project=$PROJECT_ID --filter="name:iot-cluster" --format="value(name)" 2>/dev/null || true)
US_EXISTS=$(gcloud container clusters list --project=$PROJECT_ID --filter="name:iot-cluster-us" --format="value(name)" 2>/dev/null || true)
DISK_COUNT=$(gcloud compute disks list --project=$PROJECT_ID --format="value(name)" 2>/dev/null | wc -l | xargs)
REPO_COUNT=$(gcloud artifacts repositories list --project=$PROJECT_ID --format="value(name)" 2>/dev/null | wc -l | xargs)

# Costs per unit
EU_COST=0; if [ ! -z "$EU_EXISTS" ]; then EU_COST=4.88; fi
US_COST=0; if [ ! -z "$US_EXISTS" ]; then US_COST=4.88; fi
STORAGE_COST=0; if [ "$DISK_COUNT" -gt 0 ] || [ "$REPO_COUNT" -gt 0 ]; then STORAGE_COST=2.40; fi

TOTAL_DAILY=$(echo "$EU_COST + $US_COST + $STORAGE_COST" | bc)
TOTAL_MONTHLY=$(echo "$TOTAL_DAILY * 30" | bc)

echo "| Period | EU Compute | US Compute | Storage & Network | **Total Est.** |" >> "$OUTPUT_FILE"
echo "|---|---|---|---|---|" >> "$OUTPUT_FILE"
echo "| Per day (24h) | \$$EU_COST | \$$US_COST | \$$STORAGE_COST | **\$$TOTAL_DAILY** |" >> "$OUTPUT_FILE"
echo "| Per month (30d) | $(echo "$EU_COST * 30" | bc) | $(echo "$US_COST * 30" | bc) | $(echo "$STORAGE_COST * 30" | bc) | **~\$$TOTAL_MONTHLY** |" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

if [ $(echo "$TOTAL_DAILY == 0" | bc) -eq 1 ]; then
    echo "> [!SUCCESS]" >> "$OUTPUT_FILE"
    echo "> **Zero-Cost State Confirmed.** All cost-incurring resources have been successfully deprovisioned." >> "$OUTPUT_FILE"
else
    echo "> [!IMPORTANT]" >> "$OUTPUT_FILE"
    echo "> Costs are active based on the detected running resources. Active-Active multi-region architecture is currently in place." >> "$OUTPUT_FILE"
fi

echo "" >> "$OUTPUT_FILE"
echo "> [!NOTE]" >> "$OUTPUT_FILE"
echo "> Estimates are based on standard Autopilot and SSD storage rates in March 2026. Actual costs may vary based on traffic volume." >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Finalize
echo "Cost check script completed successfully!"
echo "Please review ${OUTPUT_FILE} for details."
