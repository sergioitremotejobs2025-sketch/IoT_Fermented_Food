# Contributing Guidelines

Welcome to the IoT Microservices project! This document outlines our conventions, architecture rules, and most notably, our enforcement of **Test-Driven Development (TDD)**.

## Test-Driven Development (TDD) workflow

Our ecosystem is strictly governed by TDD. All microservices (Node.js, Python, Golang, generic Angular components) enforce a hard cutoff line at **>85% coverage** representing Statements, Branches, Functions, and Lines. 
Code modifications bypassing this metric will automatically fail CI pipeline integrations via GitHub Actions.

### 1. Write the **Failing** Test (Red)
Before implementing any actual business logic or feature, write a test reflecting exactly what that logic is intended to solve. 
- Ask yourself: What exactly should the system do when providing expected input? What must it do if the network fails?
- Ensure the test asserts the correct outputs (e.g., throwing a valid Database Exception, catching 429 Rate Limits, formatting Date objects accurately).
- Run the test suite: verify it **fails**! If it doesn't fail, your test might be incorrectly built or testing something already implemented.

### 2. Implement the Business Logic (Green)
Write strictly the necessary code required to make your new test pass. Avoid writing expansive, over-engineered solutions.
- If you're mocking a database DAO, do not write the logic connecting the physical database until you are testing the physical database driver.
- The goal is isolated resolution.
- Run the test suite: everything should now pass successfully.

### 3. Polish and Refactor (Refactor)
After the tests pass, clean up your new code.
- Apply abstractions where needed.
- Consolidate duplicates.
- Ensure Prettier & ESlint static checks format styling correctly.
- As you refactor, existing tests ensure you don't inadvertently break the original implementation!

---

## Service-Specific Testing Guidelines

### Node.js (MEASURE, MICROCONTROLLERS, PUBLISHER, ORCHESTRATOR)
- Testing framework: **Jest** & **Supertest**.
- When writing controller logic, mock `database.js` or `axios.js`.
- Run tests locally using: `npm test -- --coverage`
- Do not bypass `jest.spyOn()` checks on database transactions. Be explicitly precise. Ensure mocked methods use `.mockRejectedValue` to observe HTTP Error 500 scenarios properly resolving back to the REST client gracefully.

### Golang (AUTH)
- Testing framework: Go's natively integrated `testing` suite alongside `sqlmock` for data-layer simulation.
- Ensure all mocked dependencies correctly `defer` transaction rollbacks when encountering payload panic.
- Run tests via `go test -coverprofile=coverage.out ./...`

### Python (STATS)
- Testing framework: **Pytest** with `pytest-cov`.
- Rely entirely on `unittest.mock` to wrap queue channel emissions when observing RabbitMQ message transformations.
- Ensure you do not block the test-runner thread with `start_consuming()` inside loop handlers. 
- Execute tests locally via: `pytest --cov=src`

### Angular (FRONTEND)
- Testing frameworks: **Jasmine** and **Karma**, combined with **Cypress** for behavioral E2E integrations.
- Utilize the `HttpTestingController` explicitly testing REST proxies against 429 and 401 response payloads natively forcing the UI payload intercepters into Logout cycles.
- Run tests locally using `npm run test --code-coverage` inside `angular-ms`.

---

## Best Practices
- **Mock Everything But The Target File**: When unit testing, test one single logical controller. Mocks should block physical connectivity bridging external components entirely to observe isolated failure cascades.
- **Run the full test suite before committing**: Our `husky` pre-commit configurations will locally enforce `eslint --fix` upon all modifications, though it relies on standard developer due diligence to ensure code coverage runs successfully.
