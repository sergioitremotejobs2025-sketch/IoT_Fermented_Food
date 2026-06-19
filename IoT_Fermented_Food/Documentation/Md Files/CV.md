# IoT Microservices Ecosystem — Project Resume

A robust, scalable, and highly observable IoT platform built with a polyglot microservices architecture. This project demonstrates advanced skills in full-stack development, cloud-native infrastructure, and modern DevOps practices.

## 🏗️ Architecture Overview
The system is built as a set of decoupled services communicating through an API Gateway and an asynchronous message broker.
- **Frontend**: Single Page Application (SPA) serving as a premium dashboard.
- **Gateway**: Orchestrator service managing authentication, rate limiting, and request routing.
- **Core Services**: specialized services for measurement logic, device registry, and statistical analysis.
- **Messaging**: Event-driven communication for real-time data processing.

## 🛠️ Technology Stack

### **Frontend (UI/UX)**
- **Framework**: Angular 15
- **Styling**: Angular Material, Modern CSS (Glassmorphism, Viewport animations)
- **State & Real-time**: RxJS, Socket.io
- **Charts**: Google Charts API
- **Typography**: Outfit (Headings) & Inter (Body) via Google Fonts
- **Deployment**: Nginx (Reverse Proxy & Static Hosting)

### **Backend (Microservices)**
- **Gateway**: Node.js (Express) with `express-rate-limit` & JWT
- **Event Handling**: Python (Flask) with Pika (RabbitMQ client)
- **Identity Management**: Go (Golang) / `auth-ms`
- **Business Logic**: Node.js (TypeScript/JavaScript) / `measure-ms`, `microcontrollers-ms`
- **Publishing**: Node.js RabbitMQ Publisher / `publisher-ms`

### **Infrastructure & DevOps**
- **Containerization**: Docker (Multi-stage builds)
- **Orchestration**: Kubernetes (Minikube / Production-ready manifests)
- **Ci/CD**: GitHub Actions (Matrix testing, Docker Hub automated publishing, SemVer)
- **GitOps**: ArgoCD (Automated pruning and self-healing)
- **Message Broker**: RabbitMQ (Persistent queues & exponential backoff retries)
- **Databases**: MySQL (Device metadata), MongoDB (Sensor time-series data)

### **Observability & Security**
- **PLG Stack**: Prometheus (Metrics), Loki (Logging), Grafana (Unified Visualization)
- **Security**: 
  - **Zero-Trust**: K8s NetworkPolicies for micro-segmentation.
  - **Secrets Management**: Bitnami Sealed Secrets (Asymmetric encryption).
  - **Auth**: JWT with Refresh Token rotation and secure password hashing.
  - **Traffic Control**: API Rate Limiting at the gateway layer.

### **Testing & Quality Assurance**
- **Unit Testing**: 
  - Node.js: Jest (85% coverage enforcement)
  - Python: Pytest (coverage enforcement)
  - Go: Native `go test` with `sqlmock`
- **E2E Testing**: Cypress (UI automation & premium style verification)
- **Integration**: Supertest for REST API validation
- **DevEx**: `husky` pre-commit hooks, `lint-staged`, and root `Makefile` automation

## 🚀 Key Features & Achievements
- **Premium Dashboard**: Highly interactive UI with real-time sensor updates via WebSockets and glassmorphism design.
- **Resilient Data Pipeline**: Asynchronous data extraction from IoT devices to RabbitMQ with offline queueing support.
- **Advanced Statistics**: Real-time statistical processing using Python (Numpy/Pandas/Pydantic) for sensor data analysis.
- **Cloud-Native Scalability**: Implemented Horizontal Pod Autoscalers (HPA) and resource limit enforcement in Kubernetes.
- **Strict Quality Enforcement**: Automated CI pipeline that blocks commits falling below 85% code coverage.
- **Sealed Production Secrets**: Fully encrypted secrets in Git using public-key cryptography to prevent credential leaks.
