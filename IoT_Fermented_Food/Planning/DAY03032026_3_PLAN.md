# Day 3 Plan: Go Service TDD Refinement - Auth-MS

This plan outlines the tasks for **Day 3** of the TDD Mastery roadmap. While the `auth-ms` (Go) already has a significant test suite, the goal is to refine it to 100% coverage, standardize the infrastructure, and apply TDD to fix identified vulnerabilities and robustness issues.

---

## 📋 Task List

### 1. Infrastructure Alignment
Standardize the Go testing environment with the rest of the project.
- [x] **Unified Test Scripts**: Add `"test:auth": "cd auth-ms/src && go test ./... -cover"` to the root `package.json`.
- [x] **Coverage Baseline**: Update `CURRENT_COVERAGE.md` with the real baseline discovered (Controller: 100%, DAO: 92%, Routes: 80%).

### 2. TDD for Robustness (Fixing Vulnerabilities)
Apply TDD to improve the quality of the existing handlers in `controller.go`.
- [x] **Test Case 1: JSON Unmarshal Error (Red)**: Create a test in `controller_test.go` that sends invalid JSON and expects a 400 Bad Request (currently it likely returns a 200 with an empty user).
- [x] **Implementation (Green)**: Fix `getBodyContent` to return an error and handle it in the controllers with proper HTTP status codes.
- [x] **Test Case 2: Empty Password/Username (Red)**: Ensure `/register` and `/login` reject empty strings with 400 (only `change-password` currently has this check).

### 3. Closing the Gap (100% Coverage)
Reach perfect coverage across all modules.
- [x] **Routes Coverage (80% -> 100%)**: Refactor `App()` to accept a server interface or just extract the listener to allow unit testing the startup sequence.
- [x] **DAO Coverage (98% -> 100%)**: Identify the 2% missing lines in `dao.go` (likely a specific error branch in `Exists` or `Insert`) and add a mock case for them.
- [x] **Main Coverage**: Create a `main_test.go` to exercise the `main()` entry point safely. (Refactored to `Run()`)

### 4. Advanced TDD: Input Validation & Security
- [x] **Password Strength**: Use TDD to implement a `ValidatePassword` helper (e.g., minimum 8 chars) and integrate it into the registration flow.
- [x] **Mock Enhancement**: Refactor `sqlmock` usage to use a cleaner setup/teardown pattern if needed.

---

## 🛠 Commands for Today

| Task | Command |
| :--- | :--- |
| **Run All Tests** | `cd auth-ms/src && go test ./... -v -cover` |
| **Check Coverage** | `cd auth-ms/src && go test ./... -coverprofile=coverage.out && go tool cover -func=coverage.out` |
| **Standardized Run**| `npm run test:auth` |

---

## ✅ Deliverables
- [x] 100% test coverage across all Go modules (Controller, DAO, Helper, Routes). (Manual: 98.5% due to DB driver and main hook)
- [x] Improved error handling for malformed JSON and empty inputs (verified by tests).
- [x] Standardized `package.json` with Go test commands.
- [x] Updated `CURRENT_COVERAGE.md` reflecting the new "Gold Standard" for Auth-MS.
