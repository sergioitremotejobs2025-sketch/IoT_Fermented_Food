# IoT Microservices — Architecture

## Overview

```
                                  ┌───────────────┐
                                  │   Browser     │
                                  └───────┬───────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              angular-ms (Nginx)                                 │
│  Angular 15 SPA + reverse proxy                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  /               → serve static files                                           │
│  /api/v1/*       → orchestrator-ms (Rate Limited)                               │
│  /grafana        → Grafana Dashboards                                           │
└─────────────────────────────────────────┬───────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                               orchestrator-ms                                   │
│  Node.js Gateway + JWT Auth + Rate Limiting                                      │
└──────┬───────────────┬──────────────────┬───────────────┬───────────────┬───────┘
       │               │                  │               │               │
       ▼               ▼                  ▼               ▼               ▼
┌──────────┐    ┌───────────┐    ┌─────────────────┐    ┌──────────┐    ┌──────────┐
│ auth-ms  │    │ measure-ms│    │microcontrollers-│    │ stats-ms │    │ prometheus│
│  (Go)    │    │ (Node.js) │    │     ms (Node.js)│    │ (Python) │    │ (Metrics) │
└────┬─────┘    └─────┬─────┘    └────────┬────────┘    └────┬─────┘    └──────────┘
     │                │                   │                  │
     ▼                ▼                   ▼                  ▼
┌──────────┐    ┌──────────┐    ┌──────────────────┐    ┌──────────┐
│  MySQL   │    │ MongoDB  │    │  Arduinos (Fake) │    │ RabbitMQ │
└──────────┘    └──────────┘    └──────────────────┘    └────┬─────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  publisher-ms   │
                                                    │    (Node.js)    │
                                                    └─────────────────┘
```

## Services & Infrastructure

| Service | Language/Stack | Port | Description |
|---|---|---|---|
| `angular-ms` | Angular 15 | 80 | Modern UI with Dark Mode & Real-time Charts |
| `orchestrator-ms` | Node.js | 3000 | API Gateway with `express-rate-limit` & JWT |
| `auth-ms` | Go | 5000 | User Auth with Refresh Token rotation |
| `measure-ms` | Node.js | 4000 | Sensor data & Picture scheduling |
| `microcontrollers-ms` | Node.js | 6000 | Device registry |
| `stats-ms` | Python | 80/5000 | Statistical processing (Numpy/Pandas/Pydantic) |
| `publisher-ms` | Node.js | - | Background data extraction to RabbitMQ |
| `RabbitMQ` | Message Broker | 5672 | Asynchronous task queue |
| `Prometheus` | Monitoring | 9090 | Metrics collection (Scraping) |
| `Grafana` | Visualization | 3000 | Unified dashboards for Logs & Metrics |
| `Loki` | Logging | 3100 | Centralized log aggregation |

## Key Features

### 🔐 Security (Phase 3)
- **Rate Limiting**: Implemented at the Gateway level to prevent DDoS and brute-force.
- **NetworkPolicies**: Zero-Trust network isolation restricting pod-to-pod communication.
- **Advanced Auth**: Refresh token rotation and secure "Change Password" functionality.

### 📊 Observability (Phase 2)
- **Metrics**: Detailed service metrics using Prometheus exporters.
- **Logging**: Automated log shipping via `promtail` to `Loki`.
- **Health Checks**: Standardized Liveness and Readiness probes for all pods.

### 🚀 Resilience (Phase 4)
- **Robust Publishing**: `publisher-ms` with persistent queues and exponential backoff retry.
- **Validation**: Strict schema validation in `stats-ms` using `Pydantic`.
- **Modern Tests**: Comprehensive test suites using `pytest` (Python) and `jest` (Node.js).

## Kubernetes Deployment

Run locally:
```bash
bash run_k8s_local.sh   # start minikube + apply all manifests (prod + security)
```

Apply security policies:
```bash
kubectl apply -f manifests-k8s/security/
```
