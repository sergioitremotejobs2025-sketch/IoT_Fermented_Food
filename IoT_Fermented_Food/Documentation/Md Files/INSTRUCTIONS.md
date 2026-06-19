# IoT Microservices Local Guide

This document provides instructions on how to run, use, and test the IoT Microservices project in a local environment using Minikube and Docker.

## 🚀 Quick Start (Local Kubernetes)

The project includes a startup script that handles the deployment to Minikube.

1.  **Ensure Prerequisites**:
    *   [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/) installed and running.
    *   [Docker Desktop](https://www.docker.com/products/docker-desktop) installed.
    *   [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) configured.

2.  **Run the Startup Script**:
    From the root directory, run:
    ```bash
    chmod +x run_k8s_local.sh
    ./run_k8s_local.sh
    ```
    This script will:
    *   Start Minikube (if not already running).
    *   Enable the Ingress controller.
    *   Apply all Kubernetes manifests (config, secrets, and services).
    *   Apply a hotfix for the Angular frontend.
    *   Open the application in your default browser.

3.  **Access the Application**:
    The application is typically accessible at:
    `http://127.0.0.1:50195` (check the script output for the exact port).

---

## 🛠️ Mocking IoT Devices

If you don't have a physical Arduino board, you can use the included **Fake Arduino IoT** service.

1.  **Start the Fake Service**:
    ```bash
    cd fake-arduino-iot
    npm install
    npm start
    ```
    The service will start on `http://localhost:3000`.

2.  **Connecting to the Microservices**:
    When registering a microcontroller in the web UI, use the following IP:
    *   **IP Address**: `host.docker.internal:3000`
    
    *Note: `host.docker.internal` allows pods inside the Kubernetes cluster to talk to the service running on your host machine.*

---

## 📖 How to Use the Application

### 1. Register and Login
1.  Go to the homepage and click on **Registrarse**.
2.  Create a user (e.g., `testuser` / `testpassword123`).
3.  Login with your new credentials.

### 2. Add a Microcontroller
1.  Open the menu (top-left) and navigate to **Mis Microcontroladores**.
2.  Click the **+ (Añadir nuevo microcontrolador)** button.
3.  Follow the stepper:
    *   **Magnitud**: Select `Humedad` or `Temperatura`.
    *   **IP Address**: Enter `host.docker.internal:3000`.
    *   **Sensor**: Select the corresponding "Fake" sensor (e.g., `Fake Grove - Moisture`).
4.  Click **Añadir**.

### 3. View Data
1.  Navigate to **Dashboard** or directly to **Humedad** / **Temperatura**.
2.  You should see real-time gauges and statistics receiving data from your fake service.

---

## 🔧 Troubleshooting and Known Fixes

### Database Schema Limitation
The original database schema limited IP addresses to 15 characters, which prevented using hostnames like `host.docker.internal:3000`. 

**Status**: This has been **fixed**.
*   The `microcontrollers` table in the `iot` database now supports up to 256 characters for the `ip` field.
*   The Fix is included in `mysql-iot/initdb.sql`.

### Connection Issues
If pods cannot connect to each other, ensure that the `env-configmap.yaml` has the correct hostnames for each microservice (usually the service names in Kubernetes).

### UI Visual Feedback
If the "Add" modal doesn't close automatically after clicking "Añadir", simply refresh the page or navigate away and back to **Mis Microcontroladores**. A fix has been applied to the code in `MicrocontrollersEditComponent` to automate this navigation, which will be included in the next image build.
