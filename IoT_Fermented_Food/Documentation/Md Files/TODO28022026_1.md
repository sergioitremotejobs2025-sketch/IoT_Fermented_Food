# IoT Microservices — Future Tasks

This document outlines the next steps for maturing the IoT Microservices project. All tasks from the previous implementation phase have been successfully completed.

## 🚀 Phase 1: Real-time & Modern UI (Frontend)

- [x] **Modern Aesthetics Refactor**: Implement a "Premium" look using glassmorphism, subtle gradients, and custom typography.
- [x] **Dark Mode Support**: Add a theme switcher to the dashboard with persistent storage of user preference.
- [x] **Real-time Updates (WebSockets)**: Integrate `socket.io` to push sensor data from `measure-ms` (via Orchestrator) to the frontend without polling.
- [x] **Interactive Data Exploration**: Enhance `PicturesHistoryComponent` and charts with advanced filtering, zooming, and "compare dates" functionality.
- [x] **Threshold Alerting System**: 
  - [x] Add `thresholdMin` and `thresholdMax` to Microcontroller model.
  - [x] Implement visual notifications (SnackBars) when sensor values reach critical levels.
  - [x] Update "Edit Microcontroller" UI to configure these thresholds.

## 🏗️ Phase 2: Observability & Reliability (DevOps)

- [x] **Centralized Logging**: Configure a logging stack (Loki/Promtail) in the Kubernetes manifests to aggregate logs from all pods.
- [x] **Metrics & Monitoring**: 
  - [x] Add `/metrics` endpoints (Prometheus format) to all microservices.
  - [x] Create basic Grafana & Prometheus configurations to track service health.
- [x] **API Documentation (Swagger)**: Implement OpenAPI/Swagger for `orchestrator-ms`, `auth-ms` (Go), and `stats-ms` (Python).
- [x] **Health-check Standardization**: Ensure `publisher-ms` and `stats-ms` have consistent `/health` endpoints and are monitored by K8s liveness/readiness probes.

## 🔐 Phase 3: Security & Performance

- [x] **API Gateway Rate Limiting**: Implement rate limiting in `orchestrator-ms` using `express-rate-limit`.
- [x] **Network Isolation**: Implement Kubernetes `NetworkPolicy` to ensure only the `orchestrator-ms` can communicate with internal services.
- [x] **Advanced Auth**: 
  - [x] Implement Refresh Token rotation for better security.
  - [x] Add a "Change Password" feature in the Angular UI.
- [x] **Dependency Audit**: Standardize Node.js versions across all microservices and resolve remaining `npm audit` high-risk vulnerabilities.

## 📊 Phase 4: Service Modernization
- [x] **Stats-MS (Python)**:
  - [x] Migrate `unittest` to `pytest` for better developer experience.
  - [x] Add Pydantic for strict input/output data validation.
- [x] **Publisher-MS (Node)**:
  - [x] Implement unit tests for the publishing logic.
  - [x] Add retry mechanisms for RabbitMQ connections.
- [x] **Documentation Update**: Sync `ARCHITECTURE.md` with the current state, including the RabbitMQ flow and `stats-ms` integration.

---

## ✅ Completed Tasks (Reference)

*See [TODO27022026_1.md](file:///Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/TODO27022026_1.md) for the full list of recently finished items.*

- [x] UI Modernization (Glassmorphism & Gradients)
- [x] Theme Management (Dark/Light Mode)
- [x] WebSocket Integration for Real-time Monitoring
- [x] Threshold Alerting System
- [x] Interactive Data Exploration (Zoom, Comparison, Timelapse)
- [x] Centralized Logging (Loki/Promtail)
- [x] Metrics & Monitoring (Prometheus/Grafana)
- [x] API Documentation (Swagger/OpenAPI)
- [x] Kubernetes Health Checks (Liveness/Readiness)
- [x] API Gateway Rate Limiting
- [x] K8s Network Isolation (Policies)
- [x] Advanced Auth (Change Password/Rotation)
- [x] Angular v15 Upgrade
- [x] MongoDB Indexing & Persistence
- [x] Auth-ms Refactor & Testing (Go)
- [x] Picture Snapshot History in Frontend
- [x] Internal API Security (Shared Keys)
- [x] CI/CD Workflow setup for GitHub Actions
- [x] Kubernetes HPA & Resource Limits
