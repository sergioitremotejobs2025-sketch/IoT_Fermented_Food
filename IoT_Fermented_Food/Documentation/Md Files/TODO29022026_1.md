# TDD Implementation & Code Quality Roadmap

This document outlines the systematic steps required to ensure that all microservices in the IoT project adhere strictly to a Test-Driven Development (TDD) approach, guaranteeing high test coverage, reliability, and robust code.

## 🎯 Phase 1: Test Infrastructure & Coverage Enforcement

- [x] **Global Coverage Tooling**: 
  - Install and configure coverage tools for all Node.js services (`jest --coverage`).
  - Configure `pytest-cov` for `stats-ms` (Python).
  - Configure Go's built-in coverage tool (`go test -coverprofile`) for `auth-ms`.
  - Configure Angular CLI coverage (`ng test --code-coverage`) for `angular-ms`.
- [x] **Enforce Coverage Thresholds**: Update the test scripts in all `package.json`, `go.mod`, and `pytest.ini` files to fail the build if code coverage falls below 85% (lines, statements, functions, and branches).
- [x] **CI/CD Integration**: Create a GitHub Actions workflow that automatically runs tests and checks coverage metrics on every Pull Request to the `main` branch.

## 🧪 Phase 2: Microservice Unit Test Audit & Refactoring

*The goal here is to review and write tests for edge cases, error handling, and database connection failures, not just the "happy path".*

### 1. `auth-ms` (Go)
- [x] **Repository Layer**: Mock the MySQL driver with `sqlmock` to test database connection errors and invalid queries during `Login`, `Register`, and `UpdatePassword`.
- [x] **Controller Layer**: Test token manipulation (boolean responses), missing headers, handling of invalid requests, and proper HTTP status code derivation.
- [x] **JWT Logic**: Added unit tests for token updates in database during login/refresh flows.

### 2. `orchestrator-ms` (Node.js)
- [x] **Rate Limiting**: Write tests to simulate surpassing the rate limit and verify that a HTTP 429 response is correctly returned.
- [x] **Proxy/Bridge Routes**: Fully mock `axios` interactions to test how the orchestrator handles network timeouts (`ECONNREFUSED`) or 500 errors from backend microservices.
- [x] **JWT Middleware**: Test requests with missing, malformed, and expired tokens to ensure they are consistently blocked with a 401 Unauthorized.

### 3. `measure-ms` (Node.js)
- [x] **Database Setup**: Improve MongoDB mocking or use an in-memory database like `mongodb-memory-server` to execute pure isolating tests for the Data Access Object (DAO).
- [x] **Picture Scheduler**: Refactor the timer implementation in `picture.scheduler.spec.js` (currently failing with Jest `fakeTimers` on v30) to robustly test the 10-hour interval logic without test timeouts.
- [x] **Validation**: Guarantee tests cover scenarios where Arduinos submit physically impossible sensor values (e.g., negative light, humidity over 100%).

### 4. `microcontrollers-ms` (Node.js)
- [x] **MySQL DAO**: Ensure the `mysql` mock accurately represents connection dropping. Write tests for MySQL connection retries and auto-reconnect logic.
- [x] **CRUD Operations**: Write tests covering duplicate insertions, updating non-existent microcontrollers, and standard SQL injection bypass attempts.

### 5. `publisher-ms` (Node.js)
- [x] **RabbitMQ Resilience**: Ensure all exponential backoff paths in `QueueModule` are covered.
- [x] **Offline Queueing**: Test that messages published while RabbitMQ is disconnected are successfully kept in the `offlinePubQueue` and re-flushed upon reconnection.

### 6. `stats-ms` (Python)
- [x] **Pydantic Validation**: Comprehensive tests cover `MeasureData` validation through the RabbitMQ processing loop.
- [x] **Calculations**: Tests verified for all measure controllers (Humidity, Light, Temp) including array-based stat calculations.

### 7. `angular-ms` (Frontend)
- [x] **Component Specs**: Ensure comprehensive tests exist for `ChangePasswordDialogComponent`, `DashboardComponent`, and custom pipes (`MeasureViewPipe`).
- [x] **Service Testing**: Utilize Angular's `HttpTestingController` to mock backend API responses, ensuring services handle 401 Unauthorized (triggering logout) and 429 Too Many Requests seamlessly.
- [x] **Routing Guards**: Test `AuthGuard` to verify routing access is strictly denied for unauthenticated users.

## 🔗 Phase 3: Integration & End-to-End (E2E) Testing

- [x] **Docker Compose Testing Environment**: Create a `docker-compose.test.yml` that stands up the entire microservice architecture alongside ephemeral databases.
- [x] **API Integration Tests**: Write Postman/Newman or `supertest`-based suites that execute cross-service flows (e.g., Login -> Get Token -> Send Orchestrator Request -> Microcontroller MS -> Response).
- [x] **Cypress E2E Tests**: Set up Cypress in the Angular MS to run automated browser clicks simulating user registration, login, viewing dashboards, and modifying microcontroller configurations.

## 🛠 Phase 4: Developer Experience & Maintenance

- [x] **Pre-commit Hooks**: Add `husky` and `lint-staged` to seamlessly run the test suite for any globally modified files before a `git commit` is permitted.
- [x] **TDD Documentation**: Add explicit instructions detailing how developers should create failing tests, write business logic, and refactor code inside the `README.md` or a `CONTRIBUTING.md` file.
