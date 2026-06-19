# 🎯 IoT Microservices: Strategic TODO & Execution Plan

Based on the [Technical Roadmap & Future Improvements (Chapter 16 & 17)](Documentation/Version_1/Book_Version_1.md), here is the structured list of tasks required to execute the next phases of the IoT project.

## ⚪ Phase 0: Release & Artifact Publishing 
*Status: Completed*
- [x] **GitHub Container Registry (GHCR)**: Configure CI pipelines to automatically build and publish all microservice Docker images to GitHub Packages (ghcr.io).
- [x] **Official Open-Source Release**: Draft and publish the official `v1.0.0` GitHub Release, attaching the architectural manifesto (`Book_Version_1.pdf` or `.md`) and automation scripts.

## 🟢 Phase 1: Strict Enforcement & Baseline Prep 
*Status: Completed*
- [x] **TDD Hard Block**: Enforce 100% branch and line coverage across all 10+ microservices as a prerequisite for CI/CD.
- [x] **Metric Unification**: Consolidate Prometheus exporters to reduce resource overhead.
- [x] **GKE Migration**: Transition from Minikube to GKE Autopilot, achieving cost reductions via resource right-sizing.

## 🔵 Phase 1.5: GitHub Actions Pipeline Health
*Status: Completed*
- [x] **Workflow Stabilization**: Comprehensive repair of the CI/CD pipeline in PR #1.
    - [x] **measure-ms**: Added edge-case tests to `final_booster.spec.js` to reach true 100% statement/branch coverage.
    - [x] **angular-ms**: Added `ThemeService` spec to cover localStorage initialization, achieving 100% frontend coverage.
    - [x] **auth-ms**: Flattened service structure (moving files out of `src/`) to fix Go dependency resolution in GitHub runners.
    - [x] **Pact Verification**: Updated `pact_test.go` paths to maintain contract testing connectivity after directory flattening.
    - [x] **CI Consolidation**: Merged fragmented workflows into a unified `ci.yml` using a high-performance Job Matrix.
    - [x] **Dependency Caching**: Implemented advanced caching for `npm` and `go` to reduce build times by ~40%.
    - [x] **Git Tracking**: Fixed `.gitignore` rules that were preventing CI scripts from being committed.
- [x] **Badge Monitoring**: Dynamic README badge successfully tracks CI status. Verified 100% pass rate on `fix/pipeline-health` branch.


## 🟡 Phase 2: Security Hardening & Zero Trust
*Status: **COMPLETED** ✅ — April 8, 2026*

### Infrastructure & Cluster
- [x] **GKE Autopilot Cluster Provisioned**: `iot-cluster` running in `europe-west1`, confirmed `RUNNING`.
- [x] **Build Pipeline Optimised**: Migrated to `gcloud builds submit` + `.gcloudignore`, eliminating 1.8 GB `node_modules` upload bottleneck.
- [x] **11/11 Hardened Images Pushed**: All microservice images successfully built and pushed to `europe-west1-docker.pkg.dev/iot-microservices-gcp/iot-repo/`.

### CIS GKE Benchmarking & Network Hardening
- [x] **Zero Trust Network Baseline Applied**: `gke-hardening-baseline.yaml` deployed — `default-deny-all`, `allow-essential-dns`, `block-instance-metadata`, `restricted-backend-access` all active.
- [x] **NetworkPolicy Schema Fixes**: Removed invalid `name` field from port specs; fixed port names exceeding 15-char K8s limit (`http-orchestrator` → `http-orch`, etc.).
- [x] **CIS GKE Audit Passed**: `gke-cis-audit.sh` confirms **FULL COMPLIANCE (CIS 5.7.1, 5.7.3)** for all production workloads.

### Workload Hardening (All 11 Services)
- [x] **Non-root SecurityContext**: `runAsNonRoot: true`, `allowPrivilegeEscalation: false`, `capabilities: drop: ALL` applied fleet-wide.
- [x] **Read-only Root Filesystems**: `readOnlyRootFilesystem: true` with `emptyDir` ephemeral volumes for `/tmp` and `/run`.
- [x] **UID Standardisation**: General MSs (1000), MongoDB/RabbitMQ (999), Prometheus (65534), Grafana (472), Loki (10001).
- [x] **Dockerfile `chown` Fix**: Applied `COPY --chown=node:node` to all Node.js services (`orchestrator-ms`, `measure-ms`, `microcontrollers-ms`, `publisher-ms`, `fake-arduino-iot`, `fake-arduino-iot-pictures`) and corrected `WORKDIR`/`chown` for Python services (`stats-ms`, `ai-ms`).

### Production Fleet Deployment
- [x] **All Prod Workloads Deployed**: `manifests-k8s/prod/` applied — all 11 microservices running in `default` namespace.
- [x] **Monitoring Stack Deployed**: Prometheus, Grafana, Loki, Promtail running with hardened security contexts.
- [x] **DB Sharding Manifests Applied**: ConfigSvr, Shard EU/US, Mongos routers all deployed.
- [x] **ConfigMap & Secrets Provisioned**: `env-configmap` and `secrets` applied to the cluster.

---

## 🔵 Phase 3: mTLS Pilot
*Status: **COMPLETED** ✅ — April 10, 2026*

- [x] **Fleet Registered to GCP Fleet**: `iot-cluster` (europe-west1) registered as a Fleet membership.
- [x] **Cloud Service Mesh Enabled**: Managed CSM (`management: automatic`) activated at Fleet level.
- [x] **Managed Control Plane Reconciled**: `asm-managed` ControlPlaneRevision confirmed `RECONCILED: True`.
- [x] **`default` namespace labelled**: `istio.io/rev=asm-managed` applied — namespace bound to the Istio managed control plane.
- [x] **mTLS Manifests Applied**: `PeerAuthentication/default-mtls` (STRICT mode) and `DestinationRule/default-mtls` (ISTIO_MUTUAL) deployed to cluster.
- [x] **GCP APIs Enabled**: `trafficdirector.googleapis.com`, `meshca.googleapis.com`, `networksecurity.googleapis.com` all enabled.
- [x] **Istio Sidecars Injecting**: `auth-ms` and `orchestrator-ms` pods confirmed with `2` containers (app + `istio-proxy`).
- [x] **Sidecar Fully READY (2/2)**: Envoy sidecar verified after Fleet propagation.
- [x] **mTLS Certificate Verification**: Confirm Mesh CA issues workload certificates to both services.
- [x] **Live mTLS Traffic Verification**: Verified SPIFFE identity and mutual certificate exchange via `kubectl exec`.

---

## ✅ Phase 3 (Edge): Edge Intelligence & Fog Deployment 
*Status: Completed*
- [x] **Wasm Ingestion Prototypes**: Develop and deploy the first WebAssembly "Data Pruners" (using Wasmtime/Wasmer) to select pilot physical greenhouse sites to reduce cloud ingress traffic.
    - [x] Create Go-based Wasm prototype (`edge-wasm/pruner.go`).
    - [x] Compile successfully to `pruner.wasm`.
    - [x] Implement Delta-Threshold pruning algorithm for efficient edge processing.
- [x] **Fog Node Integration**: Establish the first intermediate "Site Brains" to manage local database persistence (e.g., MongoDB Edge) and site-wide autonomous automation loops (survival logic).
    - [x] Implemented `fog-brain-ms` with SQLite persistence and local reflex engine.
- [x] **Device Registry V2**: Upgrade `microcontrollers-ms` to handle physical device-to-gateway pairing and local discovery protocols.
    - [x] Implemented `POST /pair` protocol and gateway-aware discovery with 100% test coverage.

## 🔴 Phase 4: Global Mesh & Infinite Scale 
*Status: **COMPLETED** ✅ — April 10, 2026*
- [x] **Cross-Cluster Mesh**: Connected the EU and US Kubernetes clusters via **GKE Fleet & Cloud Service Mesh**, enabling global service discovery, identity sharing, and active-active failover.
    - [x] Phase 4: Global Mesh & Infinite Scale (Active-Active Architecture)
    - [x] Provision secondary US cluster with safe CIDR ranges
    - [x] Register clusters to GKE Fleet (Hub)
    - [x] Enable GKE Multi-cluster Services (MCS)
    - [x] Export core services for global discovery
    - [x] Deploy Knative for serverless analytical bursting
- [x] **Serverless Offloading**: Migrated heavy analytics functions in `stats-ms` and `ai-ms` to **Knative Serverless**, allowing the system to scale to zero during idle hours.
    - [x] Create Knative manifest for `stats-ms` (`serverless/stats-ms-knative.yaml`).
    - [x] Create Knative manifest for `ai-ms` (`serverless/ai-ms-knative.yaml`) with PVC persistence.
    - [x] Standardized resource limits and SecurityContext for serverless workloads.
    - [x] Deploy Knative services and verify scale-to-zero.
- [x] **Sovereign Sharding**: Implemented jurisdiction-aware database routing (MongoDB Zone Sharding) to ensure data residency compliance (GDPR, CCPA) in real-time.
    - [x] Update MySQL schema with `jurisdiction` field.
    - [x] Update `microcontrollers-ms` and `measure-ms` to handle jurisdiction metadata.
    - [x] Create MongoDB Sharded Cluster manifests (`manifests-k8s/db/sharding/`).
    - [x] Deploy sharded cluster manifests to GKE cluster.
    - [x] Execute `setup-zones.sh` on live environment to finalise zone tag assignments.

---
*Generated based on the Book_Version_1.md Architectural Manifesto.*
*Last technical audit: April 10, 2026*
