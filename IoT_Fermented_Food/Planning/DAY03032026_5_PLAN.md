# Day 5 Plan: Production Hardening & Frontend Connectivity

This plan focuses on **Day 5** of the roadmap: finalizing the connection between the Frontend and the AI-driven backend, while hardening the microservices for production-like reliability.

---

## 📋 Task List

### 1. Frontend Integration & Connectivity
Ensure the Angular dashboard correctly interacts with the new AI endpoints via the Orchestrator.
- [x] **Angular Service Validation**: Verify `AiService` (Angular) uses the correct `accessToken` and endpoints (`/ai/train`, `/ai/predict`).
- [x] **Socket.IO Real-time Buffer**: Implement/Verify the in-memory buffer in the dashboard to store the last 20 points for instant "Predict" clicks.
- [x] **Feedback UI**: Add loading states and success/error toasts for the Training process (verified existing component logic).

### 2. TDD: Production Hardening (Error States)
Apply TDD to make the services resilient to common failures.
- [x] **Test Case (Red)**: Write tests in `orchestrator-ms` for service timeouts (e.g., what happens if AI-MS takes 30 seconds to train).
- [x] **Implementation (Green)**: Implement `Axios` explicit timeouts and 504 Gateway Timeout responses in Orchestrator.
- [x] **Resource Guarding**: Add checks to prevent AI training if the database is empty or has insufficient data (< 20 points).

### 3. Mocking & Database Isolation (Refactoring)
Refactor unit tests to remove dependency on live databases, as per original Roadmap.
- [x] **DAO Mocking**: Replace real DB calls with specialized mocks (Mongoose/MySQL) in `measure-ms` and `microcontrollers-ms` (verified and improved).
- [x] **Isolated Unit Tests**: Ensure `npm test` runs 100% without requiring Docker or any external database.

### 4. Infrastructure Polish
- [ ] **RabbitMQ Recovery**: Implement a basic retry logic in `stats-ms` and `publisher-ms` for when the broker is under heavy load.
- [x] **Memory Management**: Add `PYTHONUNBUFFERED=1` (Added to Dockerfile and compose).

---

## 🛠 Commands for Today

| Task | Command |
| :--- | :--- |
| **Run Unit Tests** | `npm test` (per service) |
| **Run Integration Tests** | `npm run test:e2e` |
| **Check Logs** | `docker-compose -f docker-compose.test.yml logs -f` |

---

## ✅ Deliverables
- [x] Functional "Train" and "Predict" buttons in the Angular dashboard (Seeded with history).
- [x] 100% Isolated Unit Tests (Verified for Measure and MCU services).
- [x] Graceful error handling for timeouts (504) and empty datasets (400).
- [ ] Updated `CURRENT_COVERAGE.md`.
