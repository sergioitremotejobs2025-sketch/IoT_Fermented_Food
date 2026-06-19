#!/bin/bash
#
# full_setup.sh — Start local K8s, start fake IoT, and register everything.
#
# This script ensures Docker is running, starts Minikube with the necessary
# configuration, deploys all microservices, starts 5 fake sensors and 1 image service,
# and finally registers them in the database.

set -e

# Color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting full environment setup...${NC}"

# 1. Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}🐳 Docker is not running. Attempting to start Docker Desktop...${NC}"
    open -a Docker
    echo -e "${YELLOW}⏳ Waiting for Docker to be ready...${NC}"
    until docker info > /dev/null 2>&1; do
        echo -n "."
        sleep 5
    done
    echo -e "\n${GREEN}✅ Docker is ready.${NC}"
else
    echo -e "${GREEN}✅ Docker is already running.${NC}"
fi

# 2. Start Kubernetes Cluster and Microservices
echo -e "${BLUE}📦 Initializing Kubernetes cluster and microservices...${NC}"
# We call run_k8s_local.sh but we'll try to prevent it from blocking if it's the last line.
# However, if we want the service to be available, we might need that command.
# For automation, we'll run the setup parts.
/Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/Scripts/run_k8s_local.sh

# 3. Start Fake IoT Devices locally
echo -e "${BLUE}📡 Starting 5 Fake IoT sensors...${NC}"
/Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/Scripts/start_fake_iot.sh

echo -e "${BLUE}📸 Starting 1 Fake IoT image service...${NC}"
/Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/Scripts/start_fake_iot_images.sh

# 4. Register Devices in Database
echo -e "${BLUE}📝 Registering 6 fake devices (5 sensors + 1 image) in MySQL...${NC}"
# We wait a bit more just in case MySQL took a second to initialize even after kubectl wait
sleep 5
/Users/sergioabad/Desktop/ProjectsToWorkOn/IoT/Arduino_Antiguo/Code/IoT_Microservices-master/Scripts/register_fake_iot.sh

echo -e "${GREEN}✨ Setup complete! ✨${NC}"
echo -e "${YELLOW}Summary:${NC}"
echo " - Kubernetes services running in Minikube"
echo " - 5 sensors running on ports 3000-3004"
echo " - 1 camera running on port 3005"
echo " - All devices registered for user: testuser (pass: testpassword123)"
echo ""
echo -e "${BLUE}🌐 Access the dashboard by running: ${NC}minikube service angular-ms"
