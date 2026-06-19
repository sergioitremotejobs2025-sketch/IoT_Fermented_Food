# Day 5 Timeline: Production Hardening & Frontend Connectivity

This timeline provides a structured estimation for the tasks outlined in `DAY5_PLAN.md`. As an agentic AI, these tasks will be executed using a TDD approach (Red-Green-Refactor) to ensure 100% logic reliability.

---

## ⏳ Estimated Timeline (Total: ~2.5 Hours)

| Time Unit | Phase | Task Description | Estimation |
| :--- | :--- | :--- | :--- |
| **P1** | **Frontend Integration** | Validating Angular services, implementing the Socket.IO data buffer (last 20 points), and polishing loading/success UI states. | 45 mins |
| **P2** | **TDD Hardening** | Creating failing tests for gateway timeouts (AI-MS latency) and implementing request interceptors with explicit resource/data guards. | 45 mins |
| **P3** | **Mocking Refactor** | Refactoring `measure-ms` and `microcontrollers-ms` unit tests to use a standardized DAO mocking layer (removing DB dependencies). | 45 mins |
| **P4** | **Infrastructure Polish** | Implementing RabbitMQ retry logic and finalizing AI-MS container memory/logging configurations. | 15 mins |

---

## 🎯 Hourly Breakdown

### Hour 1: The "Proactive" Dashboard
- **00:00 - 00:20**: Verification of `AiService` and token propagation in the Angular app.
- **00:20 - 00:45**: Implementing the real-time buffer logic in the Dashboard component to ensure the "Predict" button has immediate data access.

### Hour 2: Resilience & Isolation
- **01:00 - 01:30**: TDD cycle for the Orchestrator. We will simulate an AI-MS that hangs and ensure the gateway returns a proper `504` instead of crashing.
- **01:30 - 02:00**: Refactoring the `measure-ms` DAO tests. This is a critical step for Day 5 to achieve the "Mocking & Database Isolation" goal from the original roadmap.

### Hour 0.5: Final Polish
- **02:00 - 02:30**: Implementing RabbitMQ recovery logic (handling the "Disk Full" errors seen in Day 4) and finalizing container orchestration tweaks.

---

## 📈 Success Metrics for the AI Agent
1. **Zero DB Dependency**: Unit tests must pass even if the Docker containers for MySQL/Mongo are stopped.
2. **Instant Feedback**: The UI must show a "Training..." status immediately upon request.
3. **No Zombie Requests**: Timeouts must be enforced at the gateway level.
