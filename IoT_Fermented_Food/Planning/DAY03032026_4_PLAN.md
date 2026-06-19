# Day 4 Plan: Integration & E2E Testing (Real-World TDD)

This plan focuses on **Day 4** of the TDD Mastery roadmap: expanding integration tests to cover cross-service flows and verifying the containerized test environment.

---

## 📋 Task List

### 1. Environment & Infrastructure Audit
Ensure the containerized test environment is robust and reproducible.
- [x] **Docker Compose Verification**: Run `docker-compose -f docker-compose.test.yml up --build` to ensure all services start correctly. (Audited: Docker daemon dependency noted).
- [x] **Wait-for-Database Strategy**: Implemented `Scripts/wait-for-it.sh` to ensure MySQL/Mongo/RabbitMQ are ready.
- [x] **Root Script Integration**: Updated root `package.json` with `test:e2e`.

### 2. TDD: The "Golden Path" E2E Test
Implement a comprehensive flow that exercises multiple services.
- [x] **Test Case (Red)**: Created failing tests in `integration-tests/e2e.spec.js` and `security.spec.js`.
- [x] **Implementation (Green)**: Standardized data flow, added POST endpoints for seeding, and updated AI Trainer to support complex lookups.
- [x] **Refactor**: Abstracted helper utility in `integration-tests/utils.js`.

### 3. Service-to-Service Security (Internal API Keys)
- [x] **Negative Integration Test**: Written in `integration-tests/security.spec.js`.
- [x] **Validation**: Implemented `require_internal_key` in `ai-ms` (Python) and `microcontrollers-ms` (Node).

### 4. Cleanup & State Management
- [x] **State Isolation**: E2E tests use unique `green_user` and random MCU IPs to prevent runtime collisions.
- [x] **Teardown**: Ensure `docker-compose down` is called automatically or documented for developers.

---

## 🛠 Commands for Today

| Task | Command |
| :--- | :--- |
| **Start Environment** | `docker-compose -f docker-compose.test.yml up --build` |
| **Run E2E Tests** | `cd integration-tests && npm test` |
| **Full Lifecycle** | `npm run test:e2e` (to be defined) |

---

## ✅ Deliverables
- [ ] Passing E2E test covering the "Auth -> MCU -> Data -> AI" flow.
- [ ] Verified `docker-compose.test.yml` environment.
- [ ] Root `package.json` updated with an E2E orchestration script.
- [ ] `CURRENT_COVERAGE.md` updated with "Integration Results".
