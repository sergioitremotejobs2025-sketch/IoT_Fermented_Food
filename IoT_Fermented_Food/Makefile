# Makefile for IoT Microservices Platform
# Provides a unified interface for testing and development.

.PHONY: test-all test-node test-python test-go test-angular test-integration clean help

help:
	@echo "Available commands:"
	@echo "  make test-all         - Run all tests across all microservices and frontend"
	@echo "  make test-node        - Run tests for all Node.js microservices"
	@echo "  make test-python      - Run tests for Python services (ai-ms, stats-ms)"
	@echo "  make test-go          - Run tests for Go services (auth-ms)"
	@echo "  make test-angular     - Run Angular frontend tests"
	@echo "  make test-integration - Run cross-service integration tests"
	@echo "  make clean            - Remove coverage reports and artifacts"

test-all: test-node test-python test-go test-angular test-integration
	@echo "✅ All test suites completed successfully."

test-node:
	@echo "🚀 Testing Node.js services..."
	cd microcontrollers-ms && npm test
	cd orchestrator-ms && npm test
	cd measure-ms && npm test
	cd publisher-ms && npm test

test-python:
	@echo "🚀 Testing Python services..."
	cd stats-ms && pytest --cov=. --cov-report=term-missing
	cd ai-ms && export PYTHONPATH=src && pytest --cov=src --cov-report=term-missing

test-go:
	@echo "🚀 Testing Go services..."
	cd auth-ms/src && go test ./... -cover

test-angular:
	@echo "🚀 Testing Angular frontend..."
	cd angular-ms/iot-app && npm test -- --watch=false --browsers=ChromeHeadless

test-integration:
	@echo "🚀 Testing Integration flows..."
	cd integration-tests && npm test

clean:
	@echo "🧹 Cleaning up..."
	find . -type d -name "coverage" -exec rm -rf {} +
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	rm -rf .angular/cache
