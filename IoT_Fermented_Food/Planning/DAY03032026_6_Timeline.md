# Day 6 Timeline: Infrastructure Resilience & Edge Case TDD

Estimate of time required to complete the tasks defined in `DAY6_PLAN.md`.

## ⏱ Time Estimations

| Task Category | Estimated Time | Complexity |
| :--- | :--- | :--- |
| **1. Messaging Resilience (DLQs)** | 1h 30m | Medium |
| **2. Boundary & Load Testing** | 1h 00m | Low |
| **3. Production Readiness (Helm/Scaling)**| 1h 30m | Medium |
| **4. Frontend Interactive Analytics** | 1h 00m | Low |
| **Total Estimated Time** | **5h 00m** | |

## 📅 Breakdown

### Phase 1: Messaging Resilience (90 min)
- **30 min**: Implementing DLX/DLQ configuration in RabbitMQ manifests and Orchestrator initialization logic.
- **30 min**: Writing TDD tests for message failure paths (Red phase).
- **30 min**: Implementing the retry-to-DLQ logic in `stats-ms` and `orchestrator-ms` (Green phase).

### Phase 2: Boundary & Load testing (60 min)
- **30 min**: Exhaustive unit tests for invalid IoT data payloads.
- **30 min**: Implementing request throttling/validation logic in `measure-ms` and `orchestrator-ms`.

### Phase 3: Scaling & Helm (90 min)
- **45 min**: Consolidating 30+ K8s manifests into a clean Helm chart structure.
- **45 min**: Running multi-replica scaling tests and verifying WebSocket session consistency in the dashboard.

### Phase 4: Frontend Analytics (60 min)
- **30 min**: Logic for calculating Mean Absolute Error (MAE) for recent predictions.
- **30 min**: Implementing the Error Rate chart component in the Angular dashboard.

---

## 🎯 Target Milestones
- **By Hour 2**: System is immune to "poison messages" via DLQ.
- **By Hour 4**: Cluster is ready for horizontal scaling with Helm.
- **By Hour 5**: Dashboard provides high-level prediction quality metrics.
