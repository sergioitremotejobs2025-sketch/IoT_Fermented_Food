# TODO: Fake Fermentation Sensor Pattern Simulation (Detailed TDD Approach)

This document provides a highly granular Test-Driven Development (TDD) roadmap to implement an "Environment Simulator". This feature allows dashboard users to alter the "Fermentation Phase" (e.g., Steady, pH Crash, Temp Spike), which dynamically changes the data generation algorithms in the simulated Arduino sensors.

## 1. Fake Fermentation Simulator (`fake-arduino-iot`)
### Phase 1: Pattern Controller Tests (RED)
- 1.1.1. [x] Create `fake-arduino-iot/test/app.controller.test.js` (if it doesn't exist) using Mocha/Chai or Jest.
    - 1.1.1.1. [x] Verify test runner configuration in `package.json`.
    - 1.1.1.2. [x] Import necessary modules (e.g., `supertest`, `app`, `chai`).
    - 1.1.1.3. [x] Create the main `describe('Fake Fermentation Controller', ...)` block.
- 1.1.2. [x] Write a test suite for `POST /pattern`.
    - 1.1.2.1. [x] Create a nested `describe('POST /pattern', ...)` block.
    - 1.1.2.2. [x] Set up `beforeEach` hooks to reset the pattern state to default before each test.
- 1.1.3. [x] Test 1: Assert that sending `{ "pattern": "ph-crash" }` returns a `200 OK` and `{ "status": "success", "pattern": "ph-crash" }`.
    - 1.1.3.1. [x] Write test execution using `supertest`.
    - 1.1.3.2. [x] Run test and observe failure (RED).
- 1.1.4. [x] Test 2: Assert that after setting `ph-crash`, a call to `GET /temperature` returns a digital value corresponding to a warm range (e.g., 20°C - 25°C).
    - 1.1.4.1. [x] Write logic to set pattern, then request `GET /temperature`.
    - 1.1.4.2. [x] Assert the returned `temperature` value is within the expected boundaries.
    - 1.1.4.3. [x] Run test and observe failure (RED).
- 1.1.5. [x] Test 3: Assert that after setting `ph-crash`, a call to `GET /ph` returns a digital value corresponding to a low pH range (e.g., 3.0 - 3.5).
    - 1.1.5.1. [x] Write logic to set pattern, then request `GET /ph`.
    - 1.1.5.2. [x] Assert the returned `pH` value is within the expected boundaries.
    - 1.1.5.3. [x] Run test and observe failure (RED).
- 1.1.6. [x] Test 4: Assert that sending an unknown pattern returns `400 Bad Request`.
    - 1.1.6.1. [x] Write test execution sending `{ "pattern": "unknown_phase" }`.
    - 1.1.6.2. [x] Assert the HTTP status code is `400`.
    - 1.1.6.3. [x] Run test and observe failure (RED).

### Phase 2: Pattern Implementation (GREEN)
- 1.2.1. [x] Open `fake-arduino-iot/src/app/controller/controller.js`.
    - 1.2.1.1. [x] Locate the `Controller` class definition.
- 1.2.2. [x] Define a `PATTERNS` dictionary:
    - 1.2.2.1. [x] Map `steady` to `{ minTemp: 20, maxTemp: 30, minPh: 4.0, maxPh: 5.0 }`.
    - 1.2.2.2. [x] Map `ph-crash` to `{ minTemp: 20, maxTemp: 25, minPh: 3.0, maxPh: 3.5 }`.
    - 1.2.2.3. [x] Map `temp-spike` to `{ minTemp: 35, maxTemp: 45, minPh: 3.5, maxPh: 4.5 }`.
    - 1.2.2.4. [x] Map `stalled` to `{ minTemp: 5, maxTemp: 15, minPh: 4.5, maxPh: 5.5 }`.
- 1.2.3. [x] Add a `this.currentPattern = 'steady'` property to the `Controller` class constructor.
    - 1.2.3.1. [x] Ensure initialization occurs correctly.
- 1.2.4. [x] Implement `postPattern = (req, res) => { ... }` that updates `this.currentPattern` if the provided pattern exists in the dictionary.
    - 1.2.4.1. [x] Validate `req.body.pattern` against `Object.keys(PATTERNS)`.
    - 1.2.4.2. [x] Return `400` if invalid, update state and return `200` if valid.
- 1.2.5. [x] Modify `randomPh` and `randomTemperature` functions (or bind them to the class) so they read `min` and `max` values dynamically from `PATTERNS[this.currentPattern]`.
    - 1.2.5.1. [x] Refactor the standalone functions to be class methods if necessary to access `this.currentPattern`.
- 1.2.6. [x] Open `fake-arduino-iot/src/app/routes/routes.js` and add `router.post('/pattern', controller.postPattern)`.
    - 1.2.6.1. [x] Ensure the route is correctly mapped.
- 1.2.7. [x] Run `npm test` and ensure all tests pass.
    - 1.2.7.1. [x] Verify Tests 1-4 now pass (GREEN).

### Phase 3: Refactoring (REFACTOR)
- 1.3.1. [x] Extract the `PATTERNS` dictionary into a separate `config/patterns.js` file to keep the controller clean.
    - 1.3.1.1. [x] Create the new config file and export the dictionary.
    - 1.3.1.2. [x] Update `controller.js` to require the new config.
    - 1.3.1.3. [x] Rerun tests to ensure they still pass.
- 1.3.2. [x] Ensure `realTempToDigital` and `realPhToDigital` are accurately transforming the new boundary values without causing Math domain errors (e.g., dividing by zero).
    - 1.3.2.1. [x] Add boundary checks if necessary.
    - 1.3.2.2. [x] Document the math functions.

---

## 2. Microservices Backend (`orchestrator-ms`)
### Phase 4: Proxy Route Tests (RED)
- 2.4.1. [x] Open `orchestrator-ms/test/controllers/orchestrator.controller.test.js`.
    - 2.4.1.1. [x] Ensure testing libraries (`jest` or `mocha`, `sinon` for mocking) are ready.
- 2.4.2. [x] Write a test asserting that `POST /api/simulation/pattern` triggers an `axios.post` request to all registered fake sensor IPs with the provided payload.
    - 2.4.2.1. [x] Mock the database call or `microcontrollers-ms` response to return a list of fake IPs.
    - 2.4.2.2. [x] Spy on `axios.post` to verify it is called with the correct URLs.
    - 2.4.2.3. [x] Run test and observe failure (RED).
- 2.4.3. [x] Write a test asserting that it returns `200 OK` upon success, and `500` if the internal requests fail.
    - 2.4.3.1. [x] Mock a successful `Promise.all` and assert `200`.
    - 2.4.3.2. [x] Mock a rejected promise and assert `500`.
    - 2.4.3.3. [x] Run tests and observe failures (RED).

### Phase 5: Proxy Route Implementation (GREEN)
- 2.5.1. [x] Open `orchestrator-ms/src/app/controllers/orchestrator.controller.js`.
    - 2.5.1.1. [x] Identify where to place the new controller method.
- 2.5.2. [x] Implement `postSimulationPattern(req, res)` method.
    - 2.5.2.1. [x] Extract `pattern` from `req.body`.
- 2.5.3. [x] Fetch all microcontrollers from the `microcontrollers-ms` service (or database).
    - 2.5.3.1. [x] Use existing DAO or HTTP requests to get the active sensor list.
- 2.5.4. [x] Filter for IPs that contain `fake-arduino` (or broadcast to all).
    - 2.5.4.1. [x] Implement the `Array.filter` logic.
- 2.5.5. [x] Use `Promise.all` to send `axios.post('http://<ip>/pattern', { pattern: req.body.pattern })`.
    - 2.5.5.1. [x] Construct the promises array and await execution.
- 2.5.6. [x] Open `orchestrator-ms/src/app/routes/orchestrator.routes.js` and register the `POST /api/simulation/pattern` route using the auth middleware.
    - 2.5.6.1. [x] Require the auth middleware and map the route.
- 2.5.7. [x] Run tests and ensure they pass.
    - 2.5.7.1. [x] Verify Proxy Route tests turn GREEN.

### Phase 6: Refactoring (REFACTOR)
- 2.6.1. [x] Add robust error handling in `Promise.allSettled` so that if one fake sensor is down, it doesn't fail the request for all of them.
    - 2.6.1.1. [x] Swap `Promise.all` for `Promise.allSettled`.
    - 2.6.1.2. [x] Log failed requests but return `200` to the client if at least some succeeded.
    - 2.6.1.3. [x] Run tests to ensure nothing breaks.

---

## 3. API Service Layer (`angular-ms`)
### Phase 7: SimulationService Tests (RED)
- 3.7.1. [ ] Run `ng generate service services/simulation/simulation`.
    - 3.7.1.1. [ ] Verify the files are created.
- 3.7.2. [ ] Open `simulation.service.spec.ts`.
    - 3.7.2.1. [ ] Configure `TestBed` with `HttpClientTestingModule`.
- 3.7.3. [ ] Write a test using `HttpTestingController` to assert that calling `setEnvironmentPattern('temp-spike')` executes a POST request to `/api/simulation/pattern` with the correct body and auth headers.
    - 3.7.3.1. [ ] Implement test logic and call `flush()`.
    - 3.7.3.2. [ ] Run `ng test` and observe failure (RED).

### Phase 8: SimulationService Implementation (GREEN)
- 3.8.1. [ ] Open `simulation.service.ts`.
    - 3.8.1.1. [ ] Import `HttpClient` and `Observable`.
- 3.8.2. [ ] Inject `HttpClient`.
    - 3.8.2.1. [ ] Add to constructor.
- 3.8.3. [ ] Implement `setEnvironmentPattern(pattern: string): Observable<any>`.
    - 3.8.3.1. [ ] Construct the `this.http.post` call pointing to `/api/simulation/pattern`.
- 3.8.4. [ ] Run `ng test` to ensure the service behaves correctly.
    - 3.8.4.1. [ ] Verify tests pass (GREEN).

### Phase 9: Refactoring (REFACTOR)
- 3.9.1. [ ] Create a `models/simulation.model.ts` file containing a TypeScript Enum `EnvironmentPattern { STEADY = 'steady', PH_CRASH = 'ph-crash', TEMP_SPIKE = 'temp-spike', STALLED = 'stalled' }`.
    - 3.9.1.1. [ ] Define and export the enum.
- 3.9.2. [ ] Type the service method arguments using the Enum instead of `string`.
    - 3.9.2.1. [ ] Refactor `simulation.service.ts` to use `EnvironmentPattern`.
    - 3.9.2.2. [ ] Fix any typing errors in the test files.

---

## 4. UI/UX Design & Components (`angular-ms`)
### Phase 10: Simulator Component Tests (RED)
- 4.10.1. [ ] Run `ng generate component components/environment-simulator`.
    - 4.10.1.1. [ ] Verify files are created.
- 4.10.2. [ ] Open `environment-simulator.component.spec.ts`.
    - 4.10.2.1. [ ] Configure `TestBed` with necessary Material modules and a mocked `SimulationService`.
- 4.10.3. [ ] Write a test asserting that changing a dropdown/radio selection triggers the `SimulationService.setEnvironmentPattern` method.
    - 4.10.3.1. [ ] Simulate a UI click or value change and spy on the service method.
    - 4.10.3.2. [ ] Run test and observe failure (RED).
- 4.10.4. [ ] Write a test asserting that the UI displays a success toast message upon a successful HTTP response.
    - 4.10.4.1. [ ] Mock a successful observable return and assert `NotificationService.show` is called.
    - 4.10.4.2. [ ] Run test and observe failure (RED).

### Phase 11: Simulator Component Implementation (GREEN)
- 4.11.1. [ ] Open `environment-simulator.component.ts`.
    - 4.11.1.1. [ ] Define the component class variables.
- 4.11.2. [ ] Inject `SimulationService` and `NotificationService`.
    - 4.11.2.1. [ ] Add to constructor.
- 4.11.3. [ ] Implement a method `onPatternChange(pattern: EnvironmentPattern)` that subscribes to the service and triggers notifications.
    - 4.11.3.1. [ ] Handle both `next` and `error` blocks for toast notifications.
- 4.11.4. [ ] Open `environment-simulator.component.html`.
    - 4.11.4.1. [ ] Add the basic markup for the UI element.
- 4.11.5. [ ] Build a sleek UI using Angular Material `<mat-form-field>` and `<mat-select>` or a button group to represent the fermentation anomalies with emojis (e.g., 🌡️, 📉, 💥, 🧊).
    - 4.11.5.1. [ ] Bind `ngModel` or `(selectionChange)` to the `onPatternChange` method.
- 4.11.6. [ ] Ensure tests pass.
    - 4.11.6.1. [ ] Run `ng test` and confirm all related tests turn GREEN.

### Phase 12: Dashboard Integration & Polish (REFACTOR)
- 4.12.1. [ ] Open `dashboard.component.html`.
    - 4.12.1.1. [ ] Locate the appropriate visual placement.
- 4.12.2. [ ] Embed `<app-environment-simulator></app-environment-simulator>` in a prominent location (e.g., top-right header or as a prominent settings card).
    - 4.12.2.1. [ ] Pass any necessary `@Input()` data if needed.
- 4.12.3. [ ] Apply CSS/SCSS to ensure the component looks premium, responsive, and aligns with the project's design system.
    - 4.12.3.1. [ ] Adjust padding, margins, and typography.

---

## 5. End-to-End Validation
- 5.13.1. [ ] **E2E Test Creation**: Write a Cypress test that logs into the dashboard, navigates to the Simulator component, selects "Stalled", and verifies a success toast appears.
    - 5.13.1.1. [ ] Create `simulation.cy.ts`.
    - 5.13.1.2. [ ] Write the assertions and run via the Cypress runner.
- 5.13.2. [ ] **Manual Validation**: Run the full stack locally (`docker-compose up` or K8s local proxy). Change the pattern to "Temp Spike", wait 10 seconds, and observe the `TimeHistoryChartComponent` plotting temperatures spiking toward 40°C.
    - 5.13.2.1. [ ] Verify visually in the browser.

---

## 6. Edge Intelligence: Wasm Data Pruner (`pruner.wasm`)
### Phase 14: Pruner Logic Tests (RED)
- 6.14.1. [ ] Create `edge-wasm/test/pruner_test.go`.
    - 6.14.1.1. [ ] Set up Go testing framework.
- 6.14.2. [ ] Write tests for the Delta-Threshold Algorithm.
    - 6.14.2.1. [ ] Assert that a sensor reading difference of `< 0.2` is ignored (filtered out).
    - 6.14.2.2. [ ] Assert that a difference of `>= 0.2` is kept (passed through).
    - 6.14.2.3. [ ] Run `go test` and observe failure (RED).

### Phase 15: Pruner Implementation (GREEN)
- 6.15.1. [ ] Create `edge-wasm/src/pruner.go`.
    - 6.15.1.1. [ ] Implement the Delta-Threshold logic.
- 6.15.2. [ ] Implement Wasm bindings.
    - 6.15.2.1. [ ] Use `syscall/js` to expose the pruner function to JavaScript.
- 6.15.3. [ ] Run `go test` to ensure it passes.
    - 6.15.3.1. [ ] Verify tests turn GREEN.
- 6.15.4. [ ] Compile the module.
    - 6.15.4.1. [ ] Run `GOOS=js GOARCH=wasm go build -o pruner.wasm pruner.go`.

### Phase 16: Refactoring (REFACTOR)
- 6.16.1. [ ] Optimize memory allocation in the Wasm module to ensure it remains < 100KB.

---

## 7. Fog Layer: Fog-Brain Microservice (`fog-brain-ms`)
### Phase 17: Survival Engine Tests (RED)
- 7.17.1. [ ] Create `fog-brain-ms/test/survival.engine.test.js`.
- 7.17.2. [ ] Write tests for autonomous site survival logic.
    - 7.17.2.1. [ ] Assert that receiving Temperature `> 38°C` triggers local cooling actuators.
    - 7.17.2.2. [ ] Assert that receiving pH `> 95%` triggers local ventilation.
    - 7.17.2.3. [ ] Run tests and observe failures (RED).

### Phase 18: Survival Engine Implementation (GREEN)
- 7.18.1. [ ] Implement `SurvivalEngine` class in `fog-brain-ms/src/engine/survival.js`.
    - 7.18.1.1. [ ] Evaluate incoming sensor payloads against critical safety thresholds.
    - 7.18.1.2. [ ] Emit local actuator commands.
    - 7.18.1.3. [ ] Run tests and verify they pass (GREEN).

### Phase 19: SQLite Persistence Tests (RED)
- 7.19.1. [ ] Create `fog-brain-ms/test/sqlite.persistence.test.js`.
- 7.19.2. [ ] Write test for offline buffering.
    - 7.19.2.1. [ ] Assert that when cloud connectivity is mocked as `offline`, telemetry is successfully written to local SQLite.
    - 7.19.2.2. [ ] Run test and observe failure (RED).

### Phase 20: SQLite Persistence Implementation (GREEN)
- 7.20.1. [ ] Implement `SQLiteBuffer` in `fog-brain-ms/src/db/sqlite.js`.
    - 7.20.1.1. [ ] Create `telemetry_buffer` table with Append-Only structure.
    - 7.20.1.2. [ ] Insert telemetry when cloud connection fails.
    - 7.20.1.3. [ ] Run tests and verify they pass (GREEN).

### Phase 21: Intelligent Sync Engine Tests (RED)
- 7.21.1. [ ] Create `fog-brain-ms/test/sync.engine.test.js`.
- 7.21.2. [ ] Write tests for exactly-once delivery.
    - 7.21.2.1. [ ] Assert that buffered data is batch-uploaded when connectivity is restored.
    - 7.21.2.2. [ ] Assert that local checkpoint is updated only after successful 200 OK from cloud.
    - 7.21.2.3. [ ] Run tests and observe failures (RED).

### Phase 22: Intelligent Sync Engine Implementation (GREEN)
- 7.22.1. [ ] Implement `SyncEngine` in `fog-brain-ms/src/engine/sync.js`.
    - 7.22.1.1. [ ] Create background polling task for batch uploads.
    - 7.22.1.2. [ ] Clear or mark records as synced in SQLite upon successful upload.
    - 7.22.1.3. [ ] Run tests and verify they pass (GREEN).

---

## 8. Device Registry V2 (`microcontrollers-ms`)
### Phase 23: Pairing Protocol Tests (RED)
- 8.23.1. [ ] Open `microcontrollers-ms/test/controllers/microcontroller.controller.test.js`.
- 8.23.2. [ ] Write test for Gateway Registration.
    - 8.23.2.1. [ ] Assert that `POST /api/microcontrollers/pair` successfully registers a new gateway device.
    - 8.23.2.2. [ ] Assert discovery logic allows fetching site-specific gateways.
    - 8.23.2.3. [ ] Run tests and observe failures (RED).

### Phase 24: Pairing Protocol Implementation (GREEN)
- 8.24.1. [ ] Open `microcontrollers-ms/src/app/controllers/microcontroller.controller.js`.
    - 8.24.1.1. [ ] Implement `pairGateway` method to handle `POST /pair`.
    - 8.24.1.2. [ ] Store gateway association in database.
    - 8.24.1.3. [ ] Run tests and verify they pass (GREEN).

---

## 9. Infrastructure 4.0 & Zero-Trust Architecture
### Phase 25: mTLS & Full Service Mesh
- 9.25.1. [ ] Create Istio/Linkerd `PeerAuthentication` manifest for `STRICT` mTLS.
- 9.25.2. [ ] Create `DestinationRule` manifests for `auth-ms`, `measure-ms`, and `publisher-ms`.
- 9.25.3. [ ] Apply manifests and verify end-to-end encryption in Kubernetes.

### Phase 26: Sovereign Sharding
- 9.26.1. [ ] Configure MongoDB Zone Sharding for data sovereignty (e.g., EU vs US shards).
- 9.26.2. [ ] Implement Encryption at Rest with KMS for the database pods.

### Phase 27: Cross-Cluster Federation & Serverless
- 9.27.1. [ ] Configure GKE Multi-cluster Services (MCS) `ServiceExport` objects for global cluster routing.
- 9.27.2. [ ] Create Knative `Service` manifest for `stats-ms` to enable Scale-to-Zero and horizontal bursting.

---

## 10. End-to-End Validation (Fog & Edge)
- 10.28.1. [ ] **Fog Survival Test**: Disconnect cloud network, trigger high temperature, verify `fog-brain-ms` activates cooling loop locally.
- 10.28.2. [ ] **Sync Engine Test**: Reconnect cloud network, verify buffered SQLite telemetry syncs successfully to `measure-ms` on GKE.
