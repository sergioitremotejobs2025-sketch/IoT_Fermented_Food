# Documented Errors: GCP Migration & Infrastructure Rebuild

This document records the critical errors encountered during the Google Kubernetes Engine (GKE) infrastructure restoration and the subsequent microservices deployment.

## 1. Cloud Build Source Missing: `angular-ms` (COPY failed)

### Error Description
During the `gcloud builds submit` process for the `angular-ms` service, the build failed with the following error:
`COPY failed: file not found in build context or excluded by .dockerignore: stat iot-app/dist/iot-app/: file does not exist`

### Root Cause
1.  **Build Context Disconnect:** The original `Dockerfile` relied on a pre-built `dist/` folder residing on the local machine. Since `.gcloudignore` correctly excluded build artifacts (like `dist/`) to optimize upload speed, the folder was never sent to the cloud builder.
2.  **Path Mismatch:** The `Dockerfile` was searching for `dist/iot-app`, but the actual Angular project configuration in `angular.json` was set to output to `dist/v15-app`.

### Solution
**Implemented Multi-Stage Build:** 
The `Dockerfile` was updated to perform the entire build process inside Google Cloud Build. This ensures environment consistency and removes the dependency on local build artifacts.

```dockerfile
# Build stage
FROM node:20-alpine AS build-step
WORKDIR /app
COPY iot-app/package*.json ./
RUN npm install --legacy-peer-deps
COPY iot-app/ .
RUN npx ng build --configuration production

# Final stage
FROM nginx:1.17.8-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY default.conf /etc/nginx/conf.d/
COPY --from=build-step /app/dist/v15-app/ /usr/share/nginx/html
```

---

## 2. Kubernetes Image Pull Errors: `ErrImagePull` (Tag Mismatch)

### Error Description
Pods for `ai-ms` and `measure-ms` were stuck in `ErrImagePull` or `ImagePullBackOff` status.
`Failed to pull image ".../ai-ms:v7": rpc error: code = NotFound desc = ...: not found`

### Root Cause
The Kubernetes manifests (YAMLs) in `manifests-k8s/prod` were hardcoded to look for specific version tags (e.g., `:v7`) that were either outdated or belonged to a previous repository lifecycle. The new automated build script tagged images as `:latest`.

### Solution
**Automated Tag Alignment:**
Applied a bulk `sed` operation to all production manifests to point to the `:latest` tag, ensuring they always use the most recent successful build from the Artifact Registry.

```bash
find manifests-k8s/prod/ -name "*.yaml" -exec sed -i '' 's/:v[0-9]*/:latest/g' {} +
kubectl apply -f manifests-k8s/prod/
```

---

## 3. Large Build Context Uploads (Cloud Build Optimization)

### Issue Description
The initial attempt to build `angular-ms` was extremely slow, attempting to upload over 3GiB of data.

### Root Cause
The `.angular/` cache folder and other local temporary files were not included in the `.gcloudignore` file, causing the CLI to upload unnecessary bulk data during the build submission.

### Solution
**Enhanced Exclusion Rules:**
Updated `.gcloudignore` to exclude `.angular/`, project-specific `dist/` folders, and test coverage reports. This reduced the upload size from **3.1 GiB to a few megabytes**.

```text
.angular/
**/dist/
**/coverage/
```

---

## Final Infrastructure Status (2026-03-06)
- **GKE Cluster:** Active (Autopilot)
- **Frontend URL:** http://35.187.122.39
- **Deployment Status:** All 10 services Healthy (1/1 pods Ready).
