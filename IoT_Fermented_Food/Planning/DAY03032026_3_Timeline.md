# Day 3 Timeline: Auth-MS TDD (Go Service)

Estimated effort to refine the Go Auth service to 100% coverage and industrial-grade robustness. Total estimated duration: **~60 Minutes**.

---

### 00:00 - 00:10 | Infrastructure & Audit
*   **Action**: Standardize the environment and set the baseline.
*   **AI Task**:
    - Update root `package.json` with `test:auth`.
    - Update `CURRENT_COVERAGE.md` with correct initial metrics.
    - Run the initial test suite to ensure a clean starting point.

### 00:10 - 00:30 | TDD: Error Handling & Security
*   **Action**: Implement missing validation and robust JSON parsing.
*   **AI Task**:
    - Write failing (Red) tests for invalid JSON bodies and empty Credentials.
    - Path: `controller/controller_test.go`.
    - Fix logic in `controller.go` (Green) to handle `Unmarshal` errors and empty fields.

### 00:30 - 00:50 | Closing Coverage Gaps (100% Goal)
*   **Action**: Reach perfect line and branch coverage.
*   **AI Task**:
    - Refactor `routes.App()` and `main.main()` for testability.
    - Add tests for the static file handlers (`/docs`) and missing error branches in `DAO`.
    - Verify 100% coverage using `go tool cover`.

### 00:50 - 01:00 | Final Validation & Integration Check
*   **Action**: Consolidate and document.
*   **AI Task**:
    - Run `npm run test` (full suite) to ensure no regressions.
    - Finalize `DAY3_PLAN.md` with checkmarks.
    - Commit and push changes.

---

## 🚀 Efficiency Tips
*   **Use `httptest`**: Leverage Go's native testing library for fast, in-memory API tests.
*   **Interface Mocks**: The `dao.Repository` interface is already there; use it to mock DB failures without extra dependencies.
*   **Parallel Execution**: Go tests run very fast; run them frequently to maintain the TDD loop.
