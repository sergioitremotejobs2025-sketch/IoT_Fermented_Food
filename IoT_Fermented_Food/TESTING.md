# 🧪 The IoT Platform TDD & Testing Guide

This document serves as the "source of truth" for the testing architecture and TDD workflows applied throughout the IoT Microservices project.

---

## 🏛 Testing Philosophy

We follow a **strict TDD approach** to ensure reliability, security, and maintainability.
1. **Isolation**: Unit tests must never depend on live databases. Use mocks for MySQL, MongoDB, and inter-service HTTP calls.
2. **Red-Green-Refactor**: No production code is written without a failing test case first.
3. **Coverage Enforcement**: No PR is accepted if coverage drops below **85%** across all metrics (Lines, Branches, Statements, Functions).

---

## 🚀 How to Run Tests

### Global Suite
You can run all tests from the root directory using the unified interface:
```bash
make test-all
# OR
npm test
```

### Service-Specific Commands

| Service | Language | Runner | Command |
| :--- | :--- | :--- | :--- |
| `orchestrator-ms` | Node.js | Jest | `npm test` |
| `measure-ms` | Node.js | Jest | `npm test` |
| `microcontrollers-ms` | Node.js | Jest | `npm test` |
| `publisher-ms` | Node.js | Jest | `npm test` |
| `stats-ms` | Python | Pytest | `pytest` |
| `ai-ms` | Python | Pytest | `export PYTHONPATH=src && pytest` |
| `auth-ms` | Go | Go Test | `go test ./... -cover` |
| `angular-ms` | TypeScript | Karma | `npm test` |

---

## 🛠 Mocking Standards

### Node.js (Jest)
- Use `jest.mock('axios')` for inter-service calls.
- Use `jest.spyOn` for granular control over module exports.
- Use `jest.isolateModules` when testing stateful components (like rate limiters).

### Python (Pytest)
- Use `unittest.mock.patch` to isolate database clients (`MongoClient`) and messaging brokers (`pika`).
- Ensure `PYTHONPATH` includes the `src` directory to maintain consistent import paths.

### Go
- Use `sqlmock` for database isolation in the DAO layer.
- Design controllers to accept interfaces for dependency injection.

---

## 🛡 Security & Resilience Testing

### Failover Validation
The `Scripts/redundancy_test.sh` script simulates pod termination to verify system availability.

### Rate Limiting
The `orchestrator-ms/test/load.spec.js` suite verifies that the API gateway correctly throttles the system at 100 requests/15min per IP.

### Dead Letter Queues (DLQ)
Verify DLQ routing by publishing malformed payloads to the sensor exchanges and checking the `.dead` suffix queues in RabbitMQ.

---

## 📊 Coverage Reporting
Coverage reports are generated automatically in each subdirectory:
- **Node**: `coverage/lcov-report/index.html`
- **Python**: Generated via `pytest-cov` in the terminal output.
- **Go**: Summary printed via `-cover` flag.
