.PHONY: start-k8s rebuild-all start-fake-iot stop-fake-iot register-fake-iot help

# Configuration variables
MEMORY ?= 4096
CPUS ?= 4
FAKE_IOT_COUNT ?= 5
DOCKER_USER ?= sergioitremotejobs2025
TAG ?= latest

help: ## Show this help
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

start-k8s: ## Start Minikube and apply all Kubernetes manifests
	@sh run_k8s_local.sh

rebuild-all: ## Rebuild all Docker images and load them into Minikube
	@sh rebuild_all_k8s.sh

start-fake-iot: ## Start local fake IoT device simulators
	@sh start_fake_iot.sh
	@sh start_fake_iot_images.sh

stop-fake-iot: ## Stop all fake IoT device simulators
	@sh stop_all_fake.sh

register-fake-iot: ## Register local fake IoT devices via the orchestrator API
	@sh register_fake_iot.sh

# Target to rebuild specifically Angular
rebuild-angular: ## Rebuild just the Angular MS frontend and restart the pod
	@sh rebuild_angular.sh

logs: ## Tail logs for all fake devices
	tail -f fake_arduino_*.log
