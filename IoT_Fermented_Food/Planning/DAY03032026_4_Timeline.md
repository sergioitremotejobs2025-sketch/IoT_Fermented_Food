# Day 4 Timeline: Integration & E2E TDD

Estimated effort: **~2.5 Hours** (due to build times and Docker networking complexity).

---

### 00:00 - 00:30 | Environment Spin-up & Root Audit
*   **Action**: Start the `docker-compose.test.yml` and check logs.
*   **AI Task**:
    - Build images (auth, ai, measure, etc.).
    - Verify RabbitMQ/MySQL healthiness.
    - Standardize `package.json` with a root `test:e2e` script.

### 00:30 - 01:15 | TDD Phase 1: Failing E2E Tests (Red)
*   **Action**: Create the "Golden Path" test case.
*   **AI Task**:
    - Add test for `Register MCU -> Publish Data -> Get AI Forecast`.
    - Path: `integration-tests/e2e.spec.js`.
    - Ensure it fails because `ai-ms` isn't yet receiving enough data in the test DB.

### 01:15 - 02:00 | Implementation & Debugging (Green)
*   **Action**: Make the test pass.
*   **AI Task**:
    - Seed the `measure-ms` or `ai-ms` (via `orchestrator`) with enough fake history to satisfy the LSTM model requirements (min 10 items).
    - Fix any network resolution or API key mismatches in `docker-compose`.

### 02:00 - 02:30 | Refine & Refactor
*   **Action**: Abstract helpers and clean up.
*   **AI Task**:
    - Refactor login/auth into `integration-tests/utils.js`.
    - Finalize `DAY4_PLAN.md` checkmarks.
    - Commit and push.

---

## 🛠 Pro-Tips
- **Avoid Port Collisions**: Ensure local services (outside Docker) aren't using 3000, 5000, 3306, etc.
- **Docker Logs**: Use `docker-compose logs -f [service]` to debug if a test fails unexpectedly.
- **Parallel Builds**: Use `--build` but maybe cache or use pre-built images if storage allows.
