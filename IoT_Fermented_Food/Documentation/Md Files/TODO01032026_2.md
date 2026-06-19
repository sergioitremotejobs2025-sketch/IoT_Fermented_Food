# Next Recommended Tasks for IoT Microservices

Now that the foundational CI/CD workflows are stabilized and Docker images are properly building and pushing to your own repository (`sergioitremotejobs2025`), here is a prioritized list of recommended next steps to improve the architecture, security, and developer experience of the project.

## 1. Security Enhancements
- [x] **Remove Hardcoded Secrets from Git**: The `manifests-k8s/config/secrets.yaml` file contains Base64 encoded secrets (like database passwords and internal API keys) checked directly into version control. Implement a secrets management solution like [Bitnami Sealed Secrets](https://github.com/bitnami-labs/sealed-secrets) or HashiCorp Vault.
- [x] **Rotate Default Passwords**: Generate secure, random passwords for MongoDB, MySQL, and RabbitMQ to replace the default ones (`secret`, `my-secret-pw`, etc.) in production environments.
- [x] **Update Vulnerable Dependencies**: Several legacy packages (like `glob`) triggered NPM vulnerabilities during the `angular-ms` build. We should perform an `npm audit fix` and upgrade outdated dependencies across all Node.js and Python microservices.

## 2. CI/CD & Infrastructure Automation
- [x] **Implement Continuous Deployment (CD)**: Set up [ArgoCD](https://argo-cd.readthedocs.io/) on the cluster to watch the `manifests-k8s/prod` folder. Configured the root `Application` manifest for automated syncing and self-healing.
- [x] **Automated Semantic Versioning**: Update the GitHub Actions pipelines to automatically tag Docker builds with semantic version numbers (e.g., `v1.2.0`) instead of just `latest` or timestamps, allowing for safe rollbacks.

## 3. Kubernetes Scalability & Reliability
- [x] **Add Readiness and Liveness Probes**: Ensure all microservice deployments in `manifests-k8s/prod` have `livenessProbe` and `readinessProbe` blocks configured. This informs Kubernetes exactly when a replica is fully booted and healthy enough to accept traffic.
- [x] **Horizontal Pod Autoscaling (HPA)**: Configure HPA for high-traffic microservices like `measure-ms` and `orchestrator-ms`. This will automatically scale the number of pod replicas based on CPU or memory utilization.
- [x] **Resource Limits**: Define strict `resources: requests` and `limits` in the deployment YAMLs to prevent any single microservice from consuming the entire cluster's memory and crashing the node.

## 4. Frontend & User Experience Improvements
- [x] **Design Polish**: Consider a redesign of the Angular dashboard to match modern Web App aesthetics (e.g., dynamic micro-animations, glassmorphism, or dark mode support).
- [x] **Real-time WebSocket Integration**: Implemented Socket.io relay in `orchestrator-ms` to consume RabbitMQ sensor feeds and broadcast them to the frontend. Configured Nginx WebSocket upgrades in `angular-ms`.

## 5. Testing & Developer Experience
- [x] **Expand End-to-End Cypress Tests**: Extend the base Cypress tests to simulate complex user flows, such as adding new sensors, interacting with the charts, and handling invalid API responses.
- [x] **Local Development Scripting**: Unify the scattered bash scripts (`start_fake_iot.sh`, `run_k8s_local.sh`, `rebuild_all_k8s.sh`) into a single `Makefile` for a standardized cross-platform developer experience.
