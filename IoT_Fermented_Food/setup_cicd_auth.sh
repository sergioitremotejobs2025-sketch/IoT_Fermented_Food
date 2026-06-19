#!/bin/bash
# setup_cicd_auth.sh
# Re-creates the Service Account and Key for GitHub Actions CI/CD

PROJECT="iot-microservices-gcp"
SA_NAME="github-actions-sa"
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"
KEY_FILE="gcp-sa-key.json"

set -e

echo "🔧 Configuring gcloud project..."
gcloud config set project "$PROJECT"

echo "🔑 Creating Service Account: ${SA_NAME}..."
gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions Service Account" \
    --project="$PROJECT" \
    --quiet || echo "Service account might already exist, skipping creation..."

echo "🛡️  Granting Artifact Registry Admin role..."
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.admin" \
    --quiet

echo "🛡️  Granting GKE Developer role..."
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/container.developer" \
    --quiet

echo "🛡️  Granting Service Account User role (for GKE)..."
gcloud projects add-iam-policy-binding "$PROJECT" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser" \
    --quiet

echo "📦 Generating new JSON key: ${KEY_FILE}..."
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL" \
    --project="$PROJECT"

echo ""
echo "✅ CI/CD Authentication setup complete!"
echo "-------------------------------------------------"
echo "CRITICAL NEXT STEPS:"
echo "1. Open the file: ${KEY_FILE}"
echo "2. Copy its entire content."
echo "3. Go to GitHub -> Settings -> Secrets and variables -> Actions."
echo "4. Update (or create) the secret named: GCP_SA_KEY"
echo "5. Paste the content of the JSON key."
echo "6. DELETE the local file ${KEY_FILE} immediately for security."
echo "-------------------------------------------------"
