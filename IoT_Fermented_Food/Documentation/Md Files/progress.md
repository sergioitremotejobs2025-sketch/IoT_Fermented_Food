# Progress Report - 2026-02-28 11:47:10

## Phase 1: Test Infrastructure & Coverage Enforcement
- **Global Coverage Tooling**: Upgraded the test scripts across all four Node.js environments (`orchestrator-ms`, `measure-ms`, `microcontrollers-ms`, and `publisher-ms`) to execute `jest --coverage`. Implemented `pytest-cov` by updating the `requirements.txt` inside `stats-ms`. Updated `angular.json` testing build parameters inside `angular-ms/iot-app` to compile instrumented code coverage and link to a new `karma.conf.js` integration.
- **Enforce Coverage Thresholds**: Configured individual Jest configurations within every Node project’s `package.json` setting `branches`, `functions`, `lines`, and `statements` enforcement properties globally to **85%**. Created a `pytest.ini` config in `stats-ms` specifically binding the `--cov-fail-under=85` restriction. Authored a `karma.conf.js` file for Angular configuring Karma coverage reporters to strictly validate Istanbul traces do not drop beneath 85%.
- **CI/CD Integration**: Established an automated GitHub Actions pipeline inside `.github/workflows/ci.yml`. This orchestrates asynchronous coverage test runs via a test matrix. Configured native evaluation for Go (`auth-ms`) using a bash script injection.

## Phase 2: Microservice Unit Test Audit & Refactoring
### `orchestrator-ms`
- **Rate Limiting**: Simulated an attacker hitting the credentials login endpoint continuously ensuring the API correctly throttles and locks, correctly yielding `429 Too Many Requests`. Tested global endpoints mapping (`/health` and Prometheus `/metrics` routes).
- **Proxy/Bridge Routes (`axios` Mocks)**: Extended the `__mocks__/axios.js` interface to accept proxy simulation payload injections. Simulated `mockRejectedValue(new Error('ECONNREFUSED'))` within `measures.spec.js` asserting `POST /light` bridges safely bubble and intercept `try/catch` resolving in handled localized `400` drops instead of causing runtime crashes. Corrected a bug within `services.controller.js` wherein it lacked support to forward REST payload body requests efficiently returning `false` response status outputs.
- **JWT Middleware Logic**: Tested malformed strings inside `Authorization: Bearer <format>` inside `app.spec.js` validating custom JWT error middlewares intercepted correctly. Covered the `POST /light` verification endpoint.
- **Other**: Validated undocumented `PUT /change-password` functionalities asserting valid hashed update mechanisms. Simulated testing scopes injecting the `INTERNAL_API_KEY`.

### `measure-ms`
- **Picture Scheduler**: Refactored `picture.scheduler.spec.js` removing skipped Jest suite cases previously hanging on Jest legacy timer setups. Upgraded `jest.useFakeTimers({ legacyFakeTimers: true })` ensuring interval simulation natively handles capturing snapshots without causing unhandled node timeout.
- **Database & Catch Block Validation**: Augmented assertions extending full test coverage for the `measure.controller.js`. Handled `axios` network drops resulting in backend 500 propagation errors dynamically by injecting mocked instances routing tests securely through `Dao.prototype`.
- **Internal Auth Middleware**: Successfully unit-tested `requireInternalKey` logic by modifying environmental scopes to validate internal microservice caller blocks resolving with HTTP 401 on restricted REST paths, and seamlessly approving internally signed ones without interrupting independent endpoint test setups.

### `microcontrollers-ms`
- **MySQL DAO Resilience**: Rewrote the MySQL mock (`test/__mocks__/mysql.js`) to accurately represent connection dropping and query handling. Added `test/dao.connect.spec.js` to hit the `connect` error handling, `PROTOCOL_CONNECTION_LOST` reconnect, and other error-event branches.
- **Branch Coverage**: Added comprehensive controller branch-coverage tests (`test/microcontrollers.controller.branch.spec.js`) that mock the DAO and cache to hit every conditional, including cache hits/misses, validation failures, and various `sendStatus` branches for CRUD failures. Achieved **>85% branch coverage**.
- **DAO Unit Testing**: Created `test/dao.error.spec.js` covering error-propagation for all CRUD methods and an unknown-query branch.

### `publisher-ms`
- **RabbitMQ (AMQP) Resilience**: Achieved **94.29% branch coverage**. Added `test/queue.module.spec.js` covering connection, error/close events for both connections and channels, and publish error paths.
- **Offline Queueing**: Verified through unit tests that messages published while the AMQP channel is not ready are successfully stored in `offlinePubQueue` and re-flushed upon reconnection.
- **App/Main Logic**: Added `test/app.branch.spec.js` to cover truthy/falsy branches in the main publishing loop, ensuring successful micro-responses trigger a publish while failures are logged and skipped.

### `stats-ms` (Python)
- **98.44% Statement Coverage**: Added `test/test_coverage.py` using `pytest` and `unittest.mock` to cover DAO, Queue, and RabbitMQ modules.
- **Thread Management**: Mocked `start_consuming()` to prevent blocking in unit tests, allowing verification of message processing and stat calculation.

### `auth-ms` (Go)
- **93.4% Statement Coverage**: Implemented `sqlmock` in `dao/dao_test.go` and reached 100% controller coverage.
- **Router Refactoring**: Decoupled `mux.Router` initialization to allow unit testing of routes and health/metrics endpoints without a live server.

### `angular-ms` (Frontend)
- **>85% Code Coverage**: Configured Karma/Istanbul reporters and achieved complete thresholds across lines, functions, branches, and statements.
- **Service & Guard Resilience**: Assured tests extensively simulate backend `HttpTestingController` configurations (handling 401s and 429s) alongside comprehensive route assertions blocking unauthenticated clients.
- **Component Mocking**: Upgraded Dashboard, Dialogs, and Custom Pipes confirming responsive behavior natively.

## Phase 3: Integration & End-to-End (E2E) Testing
- **Docker Compose Test Config**: Established a `docker-compose.test.yml` architecture mapped specifically to bridge ephemeral RabbitMQ, Mongo, and MySQL database networks with backend nodes, exposing root application testing ports.
- **Supertest API Suite**: Delivered an isolated API validation suite inside `integration-tests` leveraging Supertest to validate external cross-service behavior such as credential logins and microcontrollers proxy mapping payload.
- **Cypress Frontend Simulation**: Installed `@cypress` and configured generic browser automation suites simulating dialog interaction tests natively triggering Angular Material interface clicks.

## Phase 4: Developer Experience & Maintenance
- **Pre-commit Hooks**: Installed `husky` locally enforcing automated `lint-staged` hook sequences. Whenever `git commit` is utilized, changes mapping against `*.ts` or `*.js` natively trigger explicit static type-evaluations and `eslint --fix` corrections, actively blocking broken payloads natively.
- **TDD Documentation**: Distributed structured Test-Driven Development architecture rulesets inside a globally available `CONTRIBUTING.md` instruction schema. This definitively isolates architectural decisions, enforces >85% standards across future extensions, and delineates expected strategies explicitly for NodeJS, Auth, Pytest, and Angular micro-services.

## Phase 5: CI/CD Stabilization & Security Audits
- **GitHub Actions Fixes**: Upgraded outdated CI environments across `.github/workflows/ci.yml`. Bumped `setup-node` from v16 to v20 mitigating Jest native parallelism incompatibilities. Shifted `actions/setup-go` natively to match Go 1.23 codebase requirements. Refactored the `test-angular` job routing through structured `npx ng test` hooks securing global pathing. Authenticated `build-and-push` using GitHub Repository Secrets.
- **Docker Hub Publishing**: Re-configured the `manifests-k8s` configurations natively routing Docker image Pull requests from the outdated `7rocky` namespace directly over to the authenticated `sergioitremotejobs2025` registry. Setup scripts built and pushed all 8 container images externally.
- **Bitnami Sealed Secrets**: Integrated Native Kubernetes asymmetric encryption. Removed the highly vulnerable plaintext `secrets.yaml` containing database and API key tokens directly outside of the git tree. Scrubbed `git rm` footprints. Replaced it utilizing a `kubeseal` interpreted `sealed-secrets.yaml` bound specifically to the localized Minikube deployment's private key.
- **Kubernetes Scaling**: Implemented strict Kubernetes reliability standards. Bound `readinessProbe` and `livenessProbe` TCP/HTTP checkers across `angular-ms`, `rabbitmq`, `mongo`, and `mysql` ensuring crashloop monitoring. Established strict CPU and Memory requests/limits securing against memory leak node overloads.
- **Vulnerability Auditing**: Secured legacy recursive dependencies. Executed consecutive `npm audit fix` engines across orchestrator, measure, publishers, microcontrollers, and fake-arduino-iot bridging environments updating dozens of moderate-to-high nested vulnerabilities spanning all `package-lock.json` lockfiles seamlessly.
- **Developer Local Architecture**: Condensed scattered arbitrary runtime initialization scripts like `run_k8s_local.sh`, `start_fake_iot.sh`, etc., into a highly intuitive root-level `Makefile` streamlining Developer Experiences immediately via `make start-k8s`.

## Phase 6: Security Hardening & UI Polish
- **Password Rotation**: Successfully rotated all high-risk default passwords for production-ready manifests. Updated `sealed-secrets.yaml` with unique 32-character hex strings for `INTERNAL_API_KEY`, `MONGO_INITDB_ROOT_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `RABBITMQ_DEFAULT_PASS`. Synchronized these changes across the cluster using `kubectl rollout restart`.
- **Advanced CI/CD Orchestration**: Upgraded `build-angular.yml` to support **Automated Semantic Versioning**. Integrated `docker/metadata-action@v5` to dynamically generate tags for `latest`, semver patterns (`v1.2.3`), and short git SHAs, ensuring reproducible builds and safer rollbacks.
- **Premium UI/UX Redesign**: Revitalized the Angular dashboard with modern aesthetics.
  - **Typography**: Shifted to a tiered typography system using **Outfit** for headings and **Inter** for body text via Google Fonts integration.
  - **Effects**: Upgraded the design system to use **16px glass-blur** and deeper, multi-layered shadows for enhanced depth.
  - **Animations**: Added a premium **animated gradient background** to the Navigation Bar and consistent viewport-aware transitions to all dashboard cards.
- **Kubernetes Metrics & Scaling**: Enabled the `metrics-server` addon in Minikube and verified the Horizontal Pod Autoscaler (**HPA**) configurations for `orchestrator-ms` and `measure-ms`, ensuring the cluster automatically scales replicas based on real-time CPU/Memory utilization.
- **E2E Test Expansion**: Extended the Cypress E2E suite in `iot.cy.ts` to cover the new premium UI elements. Added assertions for **Outfit/Inter font-family** injection, **dark mode theme switching** via computed style validation, and **glassmorphism blur** (16px) verification for empty state dashboards.
- **Real-time WebSocket Architecture**: Established a live sensor data stream from RabbitMQ to the dashboard.
  - **Relay Layer**: Integrated `amqplib` into `orchestrator-ms`. Created a `QueueManager` that subscribes to `humidities`, `lights`, and `temperatures` queues.
  - **Socket.io Broadcasting**: Data consumed from RabbitMQ is now instantly emitted to connected clients via Socket.io `measure_update` events.
  - **Gateway Upgrades**: Updated the `angular-ms` Nginx configuration to support the **HTTP 1.1 Upgrade** protocol for WebSockets at the `/socket.io/` endpoint.
  - **Infrastructure**: Updated Kubernetes manifests for `orchestrator-ms` to inject RabbitMQ credentials and connectivity parameters.
- **Continuous Deployment (ArgoCD)**: Implemented automated GitOps workflows.
  - **ArgoCD Installation**: Installed the ArgoCD controller in the `argocd` namespace using server-side apply to handle large CRDs.
  - **GitOps Application**: Configuring a root `Application` manifest that monitors the `manifests-k8s/prod` path in the repository. Enabled **Prune** and **Self-Heal** policies to ensure the cluster state matches the git source of truth automatically.
  - **UI Access**: Patched the `argocd-server` to `NodePort` for local dashboard access.

## Phase 7: AI Integration & Infrastructure Stability
- **AI Microservice (`ai-ms`) Integration**:
  - **LSTM Forecasting**: Implemented a complete AI forecasting pipeline using **TensorFlow/Keras** for univariate time-series prediction (humidity, light, temperature).
  - **Backend Stability**: Resolved critical `ModuleNotFoundError` issues by refactoring absolute package imports to relative/local imports and optimizing the `PYTHONPATH` within the Docker configuration.
  - **Persistence**: Integrated `ai-ms` with MongoDB for model tracking and historical data retrieval.
  - **Containerization**: Optimized the `Dockerfile` for faster builds and corrected the entry point to handle the virtual package structure accurately.
- **Microservice Resiliency**:
  - **Node.js Upgrades**: Bumped `measure-ms` from Node 16 to **Node 20**, resolving the `Object.hasOwn` compatibility errors and improving runtime performance.
  - **RabbitMQ Reliability**: Hardened the message broker by switching to the `management` image and adjusting Kubernetes liveness/readiness `initialDelaySeconds` to **120s**. This prevents premature pod restarts during high-load cluster initialization.
  - **Resource Management**: Performed a cluster-wide cleanup of hanging `publisher-ms` cronjobs (14+ orphaned jobs) to reclaim CPU and memory for the AI training workloads.
- **Local Developer Experience (DX)**:
  - **Smart Pull Policies**: Implemented `Scripts/fix_env.sh` to globally update all manifests to `imagePullPolicy: IfNotPresent`. This ensures that local builds loaded into Minikube are used immediately, bypassing external registry latency.
  - **Angular Frontend Polish**: Successfully integrated the `AiPredictorComponent` into the dashboard, enabling users to trigger real-time model training and see 1-step ahead forecasts directly in the UI.
  - **Automated Rebuilds**: Optimized `Scripts/rebuild_angular.sh` to handle production-grade builds and direct Minikube image injection, reducing the UI iteration cycle.

## Phase 8: Microservice Error Resolution & Cluster Stability
- **`microcontrollers-ms` Connection & Logic**:
  - Fixed `ReferenceError` by replacing undefined `handleDisconnect` with `this.connect()`.
  - Resolved `ER_ACCESS_DENIED_ERROR` by syncing MySQL root password in `initdb.sql` with `secrets.yaml` and recreating the database volume.
  - Upgraded to **Node.js 20-alpine** across all services to support modern JS features like `Object.hasOwn`.
- **`measure-ms` Compatibility**:
  - Updated `mongoose` connection logic to remove deprecated `useNewUrlParser` and `useUnifiedTopology` (unsupported in Mongoose 9+).
  - Resolved 500 errors in `PictureScheduler` by stabilizing the `microcontrollers-ms` dependency.
- **`auth-ms` (Go) Unmarshaling**:
  - Added JSON tags to `model.User` and `model.Credential` structs to correctly map incoming camelCase JSON fields (e.g., `refreshToken`) from Javascript callers.
- **`publisher-ms` Lifecycle**:
  - Refactored `publisher-ms` (CronJob) to correctly exit with `process.exit(0)` after completion, preventing resource-exhaustion from "zombie" pods.
  - Hardened `QueueModule` to ensure AMQP connections are gracefully closed and buffered messages are flushed before process exit.
- **Infrastructure & Storage**:
  - Fixed `PersistentVolumeClaim` (PVC) pending issues by changing `storageClassName` from `microk8s-hostpath` to **`standard`** (Minikube compatible).
  - Successfully registered all 6 fake IoT devices using `Scripts/register_fake_iot.sh`, enabling full E2E data flow to the dashboard.

## Phase 9: Advanced TDD & AI Golden Path (Day 4 Roadmap)
- **E2E Golden Path Completion**:
  - Implemented the full "Auth -> MCU -> Seed -> Train -> Predict" integration cycle in `integration-tests/e2e.spec.js`.
  - Created a robust seeding mechanism in `measure-ms` allowing ad-hoc measurement injection for testing.
  - Refactored `ai-ms` trainer to use a flexible plurality logic (handling both `temperature` and `temperatures` collections) for better resilience.
- **Microservice Security Standardization**:
  - Enforced `INTERNAL_API_KEY` validation across `ai-ms`, `measure-ms`, and `microcontrollers-ms`, preventing unauthenticated inter-service calls.
  - Synchronized JWT secret handling in `orchestrator-ms` with environment variables to ensure container-host consistency.
- **TDD Roadmap Progress**:
  - Achieved "Green Phase" for integration testing. Standardized error propagation from downstream services through the Orchestrator gateway.
  - Added a `test:e2e` script to the root `package.json` for automated verification.

## Phase 10: Production Hardening & Frontend Connectivity (Day 5 Roadmap)
- **Frontend AI Integration**:
  - **History-Seeded Buffering**: Implemented proactive history retrieval in `DashboardComponent` to populate the AI `recentValuesMap` with 20 points immediately on load.
  - **Fluent History API**: Enhanced `measure-ms` DAO/Model to support optional `limit` and `sort` parameters, enabling efficient "last N" record fetching.
  - **Socket.IO Sync**: Verified the real-time buffer correctly appends new measurements to the seeded historical data, maintaining a sliding window of 20 points.
- **Microservice Hardening**:
  - **Gateway Timeout Resilience**: Implemented explicit per-service timeouts in `orchestrator-ms` (10s default, 60s for AI training) with automated `504 Gateway Timeout` and `502 Bad Gateway` mapping.
  - **AI Resource Guarding**: Added server-side checks in `ai-ms` to prevent training on datasets with fewer than 20 points, returning descriptive 400 errors.
  - **Unit Test Isolation**: Achieved 100% database-independent unit testing in `measure-ms` and `microcontrollers-ms` by implementing advanced Mongoose/MySQL mocks.
  - **Coverage Expansion**: Increased `measure-ms` coverage to **95.8%** by adding missing unit tests for POST endpoints and history-limit branch logic.
- **Production Readiness**:
# Progress Report - 2026-02-28 11:47:10

## Phase 1: Test Infrastructure & Coverage Enforcement
- **Global Coverage Tooling**: Upgraded the test scripts across all four Node.js environments (`orchestrator-ms`, `measure-ms`, `microcontrollers-ms`, and `publisher-ms`) to execute `jest --coverage`. Implemented `pytest-cov` by updating the `requirements.txt` inside `stats-ms`. Updated `angular.json` testing build parameters inside `angular-ms/iot-app` to compile instrumented code coverage and link to a new `karma.conf.js` integration.
- **Enforce Coverage Thresholds**: Configured individual Jest configurations within every Node project’s `package.json` setting `branches`, `functions`, `lines`, and `statements` enforcement properties globally to **85%**. Created a `pytest.ini` config in `stats-ms` specifically binding the `--cov-fail-under=85` restriction. Authored a `karma.conf.js` file for Angular configuring Karma coverage reporters to strictly validate Istanbul traces do not drop beneath 85%.
- **CI/CD Integration**: Established an automated GitHub Actions pipeline inside `.github/workflows/ci.yml`. This orchestrates asynchronous coverage test runs via a test matrix. Configured native evaluation for Go (`auth-ms`) using a bash script injection.

## Phase 2: Microservice Unit Test Audit & Refactoring
### `orchestrator-ms`
- **Rate Limiting**: Simulated an attacker hitting the credentials login endpoint continuously ensuring the API correctly throttles and locks, correctly yielding `429 Too Many Requests`. Tested global endpoints mapping (`/health` and Prometheus `/metrics` routes).
- **Proxy/Bridge Routes (`axios` Mocks)**: Extended the `__mocks__/axios.js` interface to accept proxy simulation payload injections. Simulated `mockRejectedValue(new Error('ECONNREFUSED'))` within `measures.spec.js` asserting `POST /light` bridges safely bubble and intercept `try/catch` resolving in handled localized `400` drops instead of causing runtime crashes. Corrected a bug within `services.controller.js` wherein it lacked support to forward REST payload body requests efficiently returning `false` response status outputs.
- **JWT Middleware Logic**: Tested malformed strings inside `Authorization: Bearer <format>` inside `app.spec.js` validating custom JWT error middlewares intercepted correctly. Covered the `POST /light` verification endpoint.
- **Other**: Validated undocumented `PUT /change-password` functionalities asserting valid hashed update mechanisms. Simulated testing scopes injecting the `INTERNAL_API_KEY`.

### `measure-ms`
- **Picture Scheduler**: Refactored `picture.scheduler.spec.js` removing skipped Jest suite cases previously hanging on Jest legacy timer setups. Upgraded `jest.useFakeTimers({ legacyFakeTimers: true })` ensuring interval simulation natively handles capturing snapshots without causing unhandled node timeout.
- **Database & Catch Block Validation**: Augmented assertions extending full test coverage for the `measure.controller.js`. Handled `axios` network drops resulting in backend 500 propagation errors dynamically by injecting mocked instances routing tests securely through `Dao.prototype`.
- **Internal Auth Middleware**: Successfully unit-tested `requireInternalKey` logic by modifying environmental scopes to validate internal microservice caller blocks resolving with HTTP 401 on restricted REST paths, and seamlessly approving internally signed ones without interrupting independent endpoint test setups.

### `microcontrollers-ms`
- **MySQL DAO Resilience**: Rewrote the MySQL mock (`test/__mocks__/mysql.js`) to accurately represent connection dropping and query handling. Added `test/dao.connect.spec.js` to hit the `connect` error handling, `PROTOCOL_CONNECTION_LOST` reconnect, and other error-event branches.
- **Branch Coverage**: Added comprehensive controller branch-coverage tests (`test/microcontrollers.controller.branch.spec.js`) that mock the DAO and cache to hit every conditional, including cache hits/misses, validation failures, and various `sendStatus` branches for CRUD failures. Achieved **>85% branch coverage**.
- **DAO Unit Testing**: Created `test/dao.error.spec.js` covering error-propagation for all CRUD methods and an unknown-query branch.

### `publisher-ms`
- **RabbitMQ (AMQP) Resilience**: Achieved **94.29% branch coverage**. Added `test/queue.module.spec.js` covering connection, error/close events for both connections and channels, and publish error paths.
- **Offline Queueing**: Verified through unit tests that messages published while the AMQP channel is not ready are successfully stored in `offlinePubQueue` and re-flushed upon reconnection.
- **App/Main Logic**: Added `test/app.branch.spec.js` to cover truthy/falsy branches in the main publishing loop, ensuring successful micro-responses trigger a publish while failures are logged and skipped.

### `stats-ms` (Python)
- **98.44% Statement Coverage**: Added `test/test_coverage.py` using `pytest` and `unittest.mock` to cover DAO, Queue, and RabbitMQ modules.
- **Thread Management**: Mocked `start_consuming()` to prevent blocking in unit tests, allowing verification of message processing and stat calculation.

### `auth-ms` (Go)
- **93.4% Statement Coverage**: Implemented `sqlmock` in `dao/dao_test.go` and reached 100% controller coverage.
- **Router Refactoring**: Decoupled `mux.Router` initialization to allow unit testing of routes and health/metrics endpoints without a live server.

### `angular-ms` (Frontend)
- **>85% Code Coverage**: Configured Karma/Istanbul reporters and achieved complete thresholds across lines, functions, branches, and statements.
- **Service & Guard Resilience**: Assured tests extensively simulate backend `HttpTestingController` configurations (handling 401s and 429s) alongside comprehensive route assertions blocking unauthenticated clients.
- **Component Mocking**: Upgraded Dashboard, Dialogs, and Custom Pipes confirming responsive behavior natively.

## Phase 3: Integration & End-to-End (E2E) Testing
- **Docker Compose Test Config**: Established a `docker-compose.test.yml` architecture mapped specifically to bridge ephemeral RabbitMQ, Mongo, and MySQL database networks with backend nodes, exposing root application testing ports.
- **Supertest API Suite**: Delivered an isolated API validation suite inside `integration-tests` leveraging Supertest to validate external cross-service behavior such as credential logins and microcontrollers proxy mapping payload.
- **Cypress Frontend Simulation**: Installed `@cypress` and configured generic browser automation suites simulating dialog interaction tests natively triggering Angular Material interface clicks.

## Phase 4: Developer Experience & Maintenance
- **Pre-commit Hooks**: Installed `husky` locally enforcing automated `lint-staged` hook sequences. Whenever `git commit` is utilized, changes mapping against `*.ts` or `*.js` natively trigger explicit static type-evaluations and `eslint --fix` corrections, actively blocking broken payloads natively.
- **TDD Documentation**: Distributed structured Test-Driven Development architecture rulesets inside a globally available `CONTRIBUTING.md` instruction schema. This definitively isolates architectural decisions, enforces >85% standards across future extensions, and delineates expected strategies explicitly for NodeJS, Auth, Pytest, and Angular micro-services.

## Phase 5: CI/CD Stabilization & Security Audits
- **GitHub Actions Fixes**: Upgraded outdated CI environments across `.github/workflows/ci.yml`. Bumped `setup-node` from v16 to v20 mitigating Jest native parallelism incompatibilities. Shifted `actions/setup-go` natively to match Go 1.23 codebase requirements. Refactored the `test-angular` job routing through structured `npx ng test` hooks securing global pathing. Authenticated `build-and-push` using GitHub Repository Secrets.
- **Docker Hub Publishing**: Re-configured the `manifests-k8s` configurations natively routing Docker image Pull requests from the outdated `7rocky` namespace directly over to the authenticated `sergioitremotejobs2025` registry. Setup scripts built and pushed all 8 container images externally.
- **Bitnami Sealed Secrets**: Integrated Native Kubernetes asymmetric encryption. Removed the highly vulnerable plaintext `secrets.yaml` containing database and API key tokens directly outside of the git tree. Scrubbed `git rm` footprints. Replaced it utilizing a `kubeseal` interpreted `sealed-secrets.yaml` bound specifically to the localized Minikube deployment's private key.
- **Kubernetes Scaling**: Implemented strict Kubernetes reliability standards. Bound `readinessProbe` and `livenessProbe` TCP/HTTP checkers across `angular-ms`, `rabbitmq`, `mongo`, and `mysql` ensuring crashloop monitoring. Established strict CPU and Memory requests/limits securing against memory leak node overloads.
- **Vulnerability Auditing**: Secured legacy recursive dependencies. Executed consecutive `npm audit fix` engines across orchestrator, measure, publishers, microcontrollers, and fake-arduino-iot bridging environments updating dozens of moderate-to-high nested vulnerabilities spanning all `package-lock.json` lockfiles seamlessly.
- **Developer Local Architecture**: Condensed scattered arbitrary runtime initialization scripts like `run_k8s_local.sh`, `start_fake_iot.sh`, etc., into a highly intuitive root-level `Makefile` streamlining Developer Experiences immediately via `make start-k8s`.

## Phase 6: Security Hardening & UI Polish
- **Password Rotation**: Successfully rotated all high-risk default passwords for production-ready manifests. Updated `sealed-secrets.yaml` with unique 32-character hex strings for `INTERNAL_API_KEY`, `MONGO_INITDB_ROOT_PASSWORD`, `MYSQL_ROOT_PASSWORD`, and `RABBITMQ_DEFAULT_PASS`. Synchronized these changes across the cluster using `kubectl rollout restart`.
- **Advanced CI/CD Orchestration**: Upgraded `build-angular.yml` to support **Automated Semantic Versioning**. Integrated `docker/metadata-action@v5` to dynamically generate tags for `latest`, semver patterns (`v1.2.3`), and short git SHAs, ensuring reproducible builds and safer rollbacks.
- **Premium UI/UX Redesign**: Revitalized the Angular dashboard with modern aesthetics.
  - **Typography**: Shifted to a tiered typography system using **Outfit** for headings and **Inter** for body text via Google Fonts integration.
  - **Effects**: Upgraded the design system to use **16px glass-blur** and deeper, multi-layered shadows for enhanced depth.
  - **Animations**: Added a premium **animated gradient background** to the Navigation Bar and consistent viewport-aware transitions to all dashboard cards.
- **Kubernetes Metrics & Scaling**: Enabled the `metrics-server` addon in Minikube and verified the Horizontal Pod Autoscaler (**HPA**) configurations for `orchestrator-ms` and `measure-ms`, ensuring the cluster automatically scales replicas based on real-time CPU/Memory utilization.
- **E2E Test Expansion**: Extended the Cypress E2E suite in `iot.cy.ts` to cover the new premium UI elements. Added assertions for **Outfit/Inter font-family** injection, **dark mode theme switching** via computed style validation, and **glassmorphism blur** (16px) verification for empty state dashboards.
- **Real-time WebSocket Architecture**: Established a live sensor data stream from RabbitMQ to the dashboard.
  - **Relay Layer**: Integrated `amqplib` into `orchestrator-ms`. Created a `QueueManager` that subscribes to `humidities`, `lights`, and `temperatures` queues.
  - **Socket.io Broadcasting**: Data consumed from RabbitMQ is now instantly emitted to connected clients via Socket.io `measure_update` events.
  - **Gateway Upgrades**: Updated the `angular-ms` Nginx configuration to support the **HTTP 1.1 Upgrade** protocol for WebSockets at the `/socket.io/` endpoint.
  - **Infrastructure**: Updated Kubernetes manifests for `orchestrator-ms` to inject RabbitMQ credentials and connectivity parameters.
- **Continuous Deployment (ArgoCD)**: Implemented automated GitOps workflows.
  - **ArgoCD Installation**: Installed the ArgoCD controller in the `argocd` namespace using server-side apply to handle large CRDs.
  - **GitOps Application**: Configuring a root `Application` manifest that monitors the `manifests-k8s/prod` path in the repository. Enabled **Prune** and **Self-Heal** policies to ensure the cluster state matches the git source of truth automatically.
  - **UI Access**: Patched the `argocd-server` to `NodePort` for local dashboard access.

## Phase 7: AI Integration & Infrastructure Stability
- **AI Microservice (`ai-ms`) Integration**:
  - **LSTM Forecasting**: Implemented a complete AI forecasting pipeline using **TensorFlow/Keras** for univariate time-series prediction (humidity, light, temperature).
  - **Backend Stability**: Resolved critical `ModuleNotFoundError` issues by refactoring absolute package imports to relative/local imports and optimizing the `PYTHONPATH` within the Docker configuration.
  - **Persistence**: Integrated `ai-ms` with MongoDB for model tracking and historical data retrieval.
  - **Containerization**: Optimized the `Dockerfile` for faster builds and corrected the entry point to handle the virtual package structure accurately.
- **Microservice Resiliency**:
  - **Node.js Upgrades**: Bumped `measure-ms` from Node 16 to **Node 20**, resolving the `Object.hasOwn` compatibility errors and improving runtime performance.
  - **RabbitMQ Reliability**: Hardened the message broker by switching to the `management` image and adjusting Kubernetes liveness/readiness `initialDelaySeconds` to **120s**. This prevents premature pod restarts during high-load cluster initialization.
  - **Resource Management**: Performed a cluster-wide cleanup of hanging `publisher-ms` cronjobs (14+ orphaned jobs) to reclaim CPU and memory for the AI training workloads.
- **Local Developer Experience (DX)**:
  - **Smart Pull Policies**: Implemented `Scripts/fix_env.sh` to globally update all manifests to `imagePullPolicy: IfNotPresent`. This ensures that local builds loaded into Minikube are used immediately, bypassing external registry latency.
  - **Angular Frontend Polish**: Successfully integrated the `AiPredictorComponent` into the dashboard, enabling users to trigger real-time model training and see 1-step ahead forecasts directly in the UI.
  - **Automated Rebuilds**: Optimized `Scripts/rebuild_angular.sh` to handle production-grade builds and direct Minikube image injection, reducing the UI iteration cycle.

## Phase 8: Microservice Error Resolution & Cluster Stability
- **`microcontrollers-ms` Connection & Logic**:
  - Fixed `ReferenceError` by replacing undefined `handleDisconnect` with `this.connect()`.
  - Resolved `ER_ACCESS_DENIED_ERROR` by syncing MySQL root password in `initdb.sql` with `secrets.yaml` and recreating the database volume.
  - Upgraded to **Node.js 20-alpine** across all services to support modern JS features like `Object.hasOwn`.
- **`measure-ms` Compatibility**:
  - Updated `mongoose` connection logic to remove deprecated `useNewUrlParser` and `useUnifiedTopology` (unsupported in Mongoose 9+).
  - Resolved 500 errors in `PictureScheduler` by stabilizing the `microcontrollers-ms` dependency.
- **`auth-ms` (Go) Unmarshaling**:
  - Added JSON tags to `model.User` and `model.Credential` structs to correctly map incoming camelCase JSON fields (e.g., `refreshToken`) from Javascript callers.
- **`publisher-ms` Lifecycle**:
  - Refactored `publisher-ms` (CronJob) to correctly exit with `process.exit(0)` after completion, preventing resource-exhaustion from "zombie" pods.
  - Hardened `QueueModule` to ensure AMQP connections are gracefully closed and buffered messages are flushed before process exit.
- **Infrastructure & Storage**:
  - Fixed `PersistentVolumeClaim` (PVC) pending issues by changing `storageClassName` from `microk8s-hostpath` to **`standard`** (Minikube compatible).
  - Successfully registered all 6 fake IoT devices using `Scripts/register_fake_iot.sh`, enabling full E2E data flow to the dashboard.

## Phase 9: Advanced TDD & AI Golden Path (Day 4 Roadmap)
- **E2E Golden Path Completion**:
  - Implemented the full "Auth -> MCU -> Seed -> Train -> Predict" integration cycle in `integration-tests/e2e.spec.js`.
  - Created a robust seeding mechanism in `measure-ms` allowing ad-hoc measurement injection for testing.
  - Refactored `ai-ms` trainer to use a flexible plurality logic (handling both `temperature` and `temperatures` collections) for better resilience.
- **Microservice Security Standardization**:
  - Enforced `INTERNAL_API_KEY` validation across `ai-ms`, `measure-ms`, and `microcontrollers-ms`, preventing unauthenticated inter-service calls.
  - Synchronized JWT secret handling in `orchestrator-ms` with environment variables to ensure container-host consistency.
- **TDD Roadmap Progress**:
  - Achieved "Green Phase" for integration testing. Standardized error propagation from downstream services through the Orchestrator gateway.
  - Added a `test:e2e` script to the root `package.json` for automated verification.

## Phase 10: Production Hardening & Frontend Connectivity (Day 5 Roadmap)
- **Frontend AI Integration**:
  - **History-Seeded Buffering**: Implemented proactive history retrieval in `DashboardComponent` to populate the AI `recentValuesMap` with 20 points immediately on load.
  - **Fluent History API**: Enhanced `measure-ms` DAO/Model to support optional `limit` and `sort` parameters, enabling efficient "last N" record fetching.
  - **Socket.IO Sync**: Verified the real-time buffer correctly appends new measurements to the seeded historical data, maintaining a sliding window of 20 points.
- **Microservice Hardening**:
  - **Gateway Timeout Resilience**: Implemented explicit per-service timeouts in `orchestrator-ms` (10s default, 60s for AI training) with automated `504 Gateway Timeout` and `502 Bad Gateway` mapping.
  - **AI Resource Guarding**: Added server-side checks in `ai-ms` to prevent training on datasets with fewer than 20 points, returning descriptive 400 errors.
  - **Unit Test Isolation**: Achieved 100% database-independent unit testing in `measure-ms` and `microcontrollers-ms` by implementing advanced Mongoose/MySQL mocks.
  - **Coverage Expansion**: Increased `measure-ms` coverage to **95.8%** by adding missing unit tests for POST endpoints and history-limit branch logic.
- **Production Readiness**:
  - **Observability**: Enabled `PYTHONUNBUFFERED=1` in the `ai-ms` Dockerfile and compose manifests to ensure real-time log availability for AI training monitoring.
  - **RabbitMQ Resilience**: Added exponential backoff retry logic to `stats-ms` to ensure connection stability during cluster startup or temporary broker outages.
- **Developer Experience (DX) & CI/CD**:
  - **Repaired Pre-commit Hooks**: Resolved broken `husky` hooks by installing `eslint` dependencies and authoring a modern `eslint.config.mjs` flat configuration in the root directory.
  - **GitHub Synchronization**: Successfully pushed Day 5 progress (74+ files) covering AI integration, production hardening, and 100% database-isolated testing.

## Phase 11: Resilience, Scaling & Interactive AI (Day 6 Roadmap)
- **Messaging Resilience**:
  - **RabbitMQ DLQs**: Implemented Dead Letter Queues (DLQ) and Exchanges (DLX) across the microservices infrastructure. This ensures that malformed or unprocessable sensor data is isolated rather than blocking the main data pipelines.
  - **Stats-MS Hardening**: Updated the Python consumer to support retry logic and automatic DLQ routing for failed calculations.
- **Production-Grade Infrastructure**:
  - **Helm Chart Migration**: Successfully refactored all raw Kubernetes manifests into a centralized Helm chart (`helm/iot-platform`). This enables environment-specific configuration via `values.yaml` and simplified multi-service deployments.
  - **Horizontal Scaling (HPA)**: Configured Horizontal Pod Autoscalers for `orchestrator-ms` and `ai-ms`, with automated scaling based on CPU and memory utilization thresholds (target: 70%).
  - **Resilience Testing**: Created `redundancy_test.sh` to simulate pod disruptions and verify that the system maintains high availability and WebSocket connectivity during failovers.
- **TDD for Extreme Conditions**:
  - **Load Testing**: Executed performance benchmarks on `orchestrator-ms` using 100 concurrent requests, verifying that the gateway maintains stability under high load.
  - **Rate Limiting & Throttling**: Implemented and verified `429 Too Many Requests` behavior using `express-rate-limit`, protecting the credentials and AI prediction endpoints from abuse.
  - **Boundary Validation**: Standardized `422 Unprocessable Entity` error propagation for invalid IoT payloads, ensuring the Orchestrator correctly communicates validation failures from downstream services.
- **Frontend: Interactive AI Analytics**:
  - **Performance Monitoring**: Integrated a "Performance Badge" into the `AiPredictorComponent` that calculates and displays the **Mean Absolute Error (MAE)** of the current model in real-time.
  - **Configurable Training Window**: Added a "History Range Selector" to the dashboard, allowing users to choose the history depth (100, 500, or All records) used to train the LSTM models, providing more granular control over AI learning.
- **Code Coverage Stability**:
  - Maintained **>98% coverage** in `orchestrator-ms` while adding complex orchestration logic for AI evaluation and history management.
  - Standardized error handling tests to expect `502 Bad Gateway` and `504 Gateway Timeout` for inter-service failures, improving the accuracy of the resilience test suite.
