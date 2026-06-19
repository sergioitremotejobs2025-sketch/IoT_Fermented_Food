# GitHub Actions Fixes TODO

This document tracks the tasks required to fix the specific errors currently causing the CI/CD pipelines (GitHub Actions) to fail.

## 1. Upgrade Node.js Versions in CI
- [x] **Job: `test-node`**
  - **Issue**: Jest 30 expects `os.availableParallelism()`, which was introduced in Node 18.14.0, but the workflow uses Node 16.
  - **Fix**: Update `node-version: '16'` to `node-version: '20'` (or at least `18.14.0`) inside `.github/workflows/ci.yml` for all steps running Jest logic (`measure-ms`, `microcontrollers-ms`, `orchestrator-ms`, `publisher-ms`).

## 2. Upgrade Node.js & Fix Global `ng` in Angular CI
- [x] **Job: `test-angular`**
  - **Issue 1**: The pipeline throws `ng: command not found` because the Angular CLI is not installed globally by default in the github runner environment.
  - **Issue 2**: Node 16 is used, causing incompatibility with Cypress and Karma plugins that require Node 18+.
  - **Fix**: Update to `node-version: '20'` in `.github/workflows/ci.yml`. Change the test script from `ng test` to `npm run test` or `npx ng test --watch=false --browsers=ChromeHeadless` to securely use the local project binary.

## 3. Fix Go Version Matching in CI
- [x] **Job: `test-go`**
  - **Issue**: The action fails with `go.mod:3: invalid go version '1.23.0': must match format 1.23`. `auth-ms/src/go.mod` natively uses Go `1.23.0`, but the CI environment utilizes `go-version: '1.20'`. Furthermore, the `actions/setup-go@v4` action attempts to restore the `go.sum` file which may be missing from the tree.
  - **Fix**: Update `go-version: '1.20'` to `go-version: '1.23.0'` in `.github/workflows/ci.yml`.

## 4. Provide Missing GitHub Secrets for Docker Registry
- [x] **Job: `Build and Push Angular Image` (inside deploy.yml or similar)**
  - **Issue**: Deploy step crashes with `##[error]Username and password required` during Docker Hub login.
  - **Fix**: Set the `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets in the Repository Settings -> Secrets and variables -> Actions.
