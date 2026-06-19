# 7-Day TDD Mastery Goals

This document outlines the roadmap for strengthening Test-Driven Development (TDD) practices across the IoT Microservices project over the next 7 days.

## Core TDD Principles to Follow
1. **Red-Green-Refactor Cycle**: Never write production code without a failing test first.
2. **Small Atomic Tests**: Each test should check one specific behavior.
3. **Mocks & Isolation**: Isolate microservices from their dependencies (databases, other services) during unit testing.
4. **Behavioral Testing**: Focus on *what* the code does, not *how* it does it.
5. **Continuous Feedback**: Run tests frequently to catch regressions early.

---

## 7-Day Roadmap

### Day 1: Audit & Foundation
- **Goal**: Establish a baseline for test coverage across all microservices.
- **Tasks**:
  - Run existing test suites in `microcontrollers-ms`, `orchestrator-ms`, `measure-ms`, etc.
  - Identify "test-free" zones (e.g., `ai-ms`).
  - Standardize test commands in `package.json` across services.

### Day 2: The "Red" Phase - AI Service Bootstrapping
- **Goal**: Implement the first unit tests for `ai-ms` using a TDD approach.
- **Tasks**:
  - Set up `pytest` for `ai-ms`.
  - Write failing tests for `data_processor.py` logic.
  - Implement minimum code to make tests pass (Green).

### Day 3: Go Service (Auth-MS) Testing
- **Goal**: Introduce TDD to the Go-based `auth-ms`.
- **Tasks**:
  - Create `_test.go` files for controllers and DAOs.
  - Focus on fixing the JSON unmarshaling issues mentioned in recent logs using failing tests first.
  - Implement `stretch` or `mockery` for Go dependency injection.

### Day 4: Integration & E2E (Real-World TDD)
- **Goal**: Expand `integration-tests` to cover cross-service flows.
- **Tasks**:
  - Write a failing E2E test for the "Register Microcontroller -> Publish Measure -> AI Prediction" flow.
  - Verify containerized testing using `docker-compose.test.yml`.

### Day 5: Mocking & Database Isolation
- **Goal**: Refactor `microcontrollers-ms` and `measure-ms` tests to be truly isolated.
- **Tasks**:
  - Ensure NoSQL and SQL databases are fully mocked in unit tests.
  - Remove any dependency on "live" dev databases during the unit test phase.

### Day 6: Performance & Boundary Testing
- **Goal**: Use TDD to handle edge cases and performance boundaries.
- **Tasks**:
  - Write tests for invalid IoT payloads and network timeouts.
  - Ensure services fail gracefully and return correct error codes (400, 500).

### Day 7: Documentation & CI/CD Readiness
- **Goal**: Formalize the TDD workflow and prepare for CI.
- **Tasks**:
  - Create a `TESTING.md` guide for future development.
  - Verify that `npm test` or equivalent works in every subdirectory.
  - Final review of all 0-day bugs fixed via TDD this week.

---

## Success Metrics
- [ ] No new features added without corresponding tests.
- [ ] 100% pass rate on all existing and new tests.
- [ ] `ai-ms` has >70% test coverage.
- [ ] `auth-ms` has basic unit tests for all routes.
