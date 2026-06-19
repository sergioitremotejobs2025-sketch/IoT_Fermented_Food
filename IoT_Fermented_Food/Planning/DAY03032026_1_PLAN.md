# Day 1 Plan: Foundation & Audit

This plan outlines the specific tasks to complete **Day 1** of the TDD Mastery roadmap. The goal is to establish a verified baseline of test coverage and standardize the testing environment.

---

## 📋 Task List

### 1. Execute & Document Existing Test Suites
Perform a full audit of the current state of tests for Node.js and Python microservices.
- [x] **Run `microcontrollers-ms` tests**: `cd microcontrollers-ms && npm test`
- [x] **Run `orchestrator-ms` tests**: `cd orchestrator-ms && npm test`
- [x] **Run `measure-ms` tests**: `cd measure-ms && npm test`
- [x] **Run `publisher-ms` tests**: `cd publisher-ms && npm test`
- [x] **Run `stats-ms` tests**: `cd stats-ms && pytest` (Verify environment)
- [x] **Run `integration-tests`**: `cd integration-tests && npm test`

### 2. Identify "Test-Free" Zones
Confirm areas where TDD needs to be introduced from scratch or where coverage is significantly low.
- [x] **Inspect `ai-ms`**: Confirm no test directory or `pytest` configuration exists.
- [x] **Inspect `auth-ms`**: Check for Go `*_test.go` files (Expected: None or very few).
- [x] **Internal logic review**: Identify critical business logic in `measure-ms` (e.g., data validation) that lacks unit tests.

### 3. Standardize Testing Infrastructure
Align the testing experience across all microservices to ensure consistency for developers and CI/CD.
- [x] **Unified `npm test` script**: Ensure every Node.js microservice uses `jest --coverage` (already present in most, verify consistency).
- [x] **Coverage Threshold Enforcement**: Verify if `jest` configuration in `package.json` correctly fails if coverage drops below 85% (as defined in current manifests).
- [x] **Environment Consistency**: 
  - Ensure `orchestrator-ms` has `INTERNAL_API_KEY` set for tests.
  - Ensure `measure-ms` has `NODE_ENV=test` set for tests.

---

## 🛠 Commands for Today

| Service | Command | Status |
| :--- | :--- | :--- |
| **microcontrollers-ms** | `npm run test` | [x] |
| **orchestrator-ms** | `npm run test` | [x] |
| **measure-ms** | `npm run test` | [x] |
| **publisher-ms** | `npm run test` | [x] |
| **integration-test** | `npm run test` | [x] |
| **stats-ms** | `pytest` | [x] |

---

## ✅ Deliverables
- [x] A summary of "Current Coverage" percentages for each core service.
- [x] A list of failing tests that need immediate attention (fixing existing bugs via TDD).
- [x] Verified standardized `package.json` scripts across the project.
