#!/bin/bash

# run_lite.sh - Start IoT Microservices with Minimum Resources
# Optimized for machines with 4GB-8GB RAM.

set -e

# Ensure common paths are included for Docker on Mac/Linux
export PATH=$PATH:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin
COMPOSE_FILE="docker-compose.lite.yml"
PROJECT_NAME="iot-lite"
export PATH=$PATH:/usr/local/bin

echo "🌿 IoT Microservices - Lite Execution Mode"
echo "------------------------------------------"
echo "Goal: Run Core services with strict memory limits (~1.5GB total footprint)."
echo "Services included: MySQL, MongoDB, RabbitMQ, Auth, Measure, Microcontrollers, Publisher, Stats, Orchestrator, Angular (Frontend)."
echo "Services excluded: AI (TensorFlow) (to save RAM)."
echo ""

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check for Angular Build
DIST_PATH="angular-ms/iot-app/dist/v15-app/browser"
if [ ! -d "$DIST_PATH" ]; then
    echo "⚠️  Angular production build not found in $DIST_PATH"
    read -p "Do you want to build the Frontend natively now? (y/N): " BUILD_ANGULAR
    if [[ "$BUILD_ANGULAR" =~ ^[Yy]$ ]]; then
        echo "🏗  Building Angular natively (Low Resource Mode)..."
        cd angular-ms/iot-app
        export PATH=$PATH:/usr/local/bin
        npm install --legacy-peer-deps
        node_modules/.bin/ng build --configuration production
        cd ../..
    else
        echo "⏭  Skipping Angular build. Frontend might not load correctly."
    fi
fi

# Ask if they want to build from scratch
read -p "Do you want to rebuild Backend images? (y/N): " REBUILD

OPTS=""
if [[ "$REBUILD" =~ ^[Yy]$ ]]; then
    echo "🏗  Rebuilding images (this might take a few minutes)..."
    OPTS="--build"
fi

# Run the lite environment
echo "🚀 Starting containers in detached mode..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d $OPTS

echo ""
echo "✅ Core system is starting!"
echo "------------------------------------------"
echo "📍 Angular Dashboard: http://localhost:8080"
echo "📍 Orchestrator Gateway: http://localhost:3000"
echo "📍 MySQL (root:my-secret-pw): localhost:33066"
echo "📍 MongoDB (root:secret): localhost:37017"
echo "📍 RabbitMQ Management: http://localhost:31567 (user/password)"
echo "------------------------------------------"
echo ""
echo "Logs are available via: docker compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f"
echo "To stop the system: docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down"
echo ""

# Optional: Setup Simulation for Rocky
echo "------------------------------------------"
read -p "📊 Do you want to register and start simulated IoT devices for 'Rocky'? (y/N): " START_SIM
if [[ "$START_SIM" =~ ^[Yy]$ ]]; then
    echo "📝 Registering devices for Rocky in MySQL..."
    
    export PATH=$PATH:/usr/local/bin
    
    # helper for sql
    run_sql() {
        docker exec -i iot_mysql_lite mysql -u root -pmy-secret-pw -e "$1" > /dev/null 2>&1
    }

    run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('Rocky', 'host.docker.internal:3100', 'temperature', 'Fake Temp');"
    run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('Rocky', 'host.docker.internal:3101', 'humidity',    'Fake Humid');"
    run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('Rocky', 'host.docker.internal:3105', 'pictures',    'Fake Camera');"
    run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('Rocky', 'fake-fermentation-1:3000', 'temperature', 'Fermentation Temp 1');"
    run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('Rocky', 'fake-fermentation-2:3001', 'temperature', 'Fermentation Temp 2');"
    
    echo "📻 Starting Simulator processes in background..."
    NODE_BIN=$(which node || echo "/usr/local/bin/node")
    
    # Temperature/Humidity (same dir)
    if [ -d "fake-arduino-iot" ]; then
        cd fake-arduino-iot
        nohup PORT=3100 $NODE_BIN src/index.js > ../fake_arduino_3100.log 2>&1 &
        nohup PORT=3101 $NODE_BIN src/index.js > ../fake_arduino_3101.log 2>&1 &
        cd ..
    fi
    
    # Pictures (different dir)
    if [ -d "fake-arduino-iot-pictures" ]; then
        cd fake-arduino-iot-pictures
        nohup PORT=3105 $NODE_BIN src/server.js > ../fake_arduino_3105.log 2>&1 &
        cd ..
    fi
    
    echo "✅ Simulators started on ports 3100, 3101, 3105."
    echo "   You can view data on the dashboard at http://localhost:8080"
    echo "   Login with Rocky / Rocky"
fi

echo "------------------------------------------"
echo "💡 Note: AI and Stats services are disabled to save resources."
echo "If you need them, you can start them manually or use the standard docker-compose."
echo ""
