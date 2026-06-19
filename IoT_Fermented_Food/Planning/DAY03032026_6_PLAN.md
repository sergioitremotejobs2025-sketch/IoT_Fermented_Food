# Day 6 Plan: Infrastructure Resilience & Edge Case TDD

This plan focuses on **Day 6** of the roadmap: hardening the messaging infrastructure, ensuring scalability, and using TDD to handle complex failure modes.

---

## 📋 Task List

### 1. Messaging Resilience (RabbitMQ DLQs)
Ensure that message processing failures across microservices don't result in data loss or blocked queues.
- [x] **Test Case (Red)**: Write an integration test where a malformed measure is published to the `publisher-ms`.
- [x] **Implementation (Green)**: Configure Dead Letter Exchanges (DLX) and Dead Letter Queues (DLQ) in `orchestrator-ms` and `stats-ms`.
- [x] **Retry Logic**: Refine the retry mechanism in `stats-ms` to move messages to the DLQ after N failed attempts.

### 2. TDD: Boundary & Load Testing
Use TDD to define how the system behaves under extreme conditions.
- [x] **Test Case (Red)**: Write a test in `orchestrator-ms` that simulates 100 simultaneous "Predict" requests from different users.
- [x] **Implementation (Green)**: Implement basic request throttling or concurrency limits in the Orchestrator gateway if needed.
- [x] **Invalid Payload Guarding**: Add exhaustive tests for "boundary" values (e.g., Temperature > 1000°C or Light < 0) and ensure they are rejected with 422 Unprocessable Entity.

### 3. Production Readiness: Helm & Scaling
Finalize the Kubernetes deployment strategy for multi-replica environments.
- [x] **Helm Chart Migration**: Refactor existing Kubernetes manifests into a single `iot-platform` Helm chart with subcharts for each service.
- [x] **HPA Configuration**: Add Horizontal Pod Autoscaler (HPA) templates for `orchestrator-ms` and `ai-ms`.
- [x] **Redundancy Test**: Use a test script to verify that the system remains operational if one instance of a replicated service is terminated.

### 4. Frontend: Interactive Analytics
Extend the dashboard to provide better insights into the AI's performance.
- [x] **Trend Analysis Component**: Integrated into `AiPredictorComponent` a "Performance Badge" showing the Mean Absolute Error (Actual vs. Predicted) of the current model.
- [x] **Interactive Training**: Added a "History Range Selector" to the `AiPredictorComponent` to allow users to choose the history length for training (Last 100, 500, or All).

---

## 🛠 Commands for Today

| Task | Command |
| :--- | :--- |
| **Run E2E Resilience** | `npm run test:e2e` |
| **Verify DLQ** | `kubectl exec -it rabbitmq -- rabbitmqctl list_queues` |
| **Helm Lint** | `helm lint manifests-k8s/charts/iot-app` |

---

## ✅ Deliverables
- [x] Functional Dead Letter Queue (DLQ) pattern for all sensor data.
- [x] Graceful 422 responses for malformed IoT payloads (boundary validation).
- [x] Multi-replica readiness with Helm & HPA configurations.
- [x] Interactive AI Analytics (MAE and History Selection) in the Angular dashboard.
- [x] Updated `CURRENT_COVERAGE.md`.
