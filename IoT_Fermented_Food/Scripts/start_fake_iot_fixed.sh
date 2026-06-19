#!/bin/bash

# Configuration
BASE_PORT=3100
COUNT=5
IOT_DIR="fake-arduino-iot"

echo "🚀 Starting $COUNT fake IoT devices..."

# Kill any existing fake IoT processes on these ports (optional but recommended for clean start)
for ((i=0; i<$COUNT; i++)); do
    PORT=$((BASE_PORT + i))
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
        echo "Stopping existing process on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

for ((i=0; i<$COUNT; i++)); do
    PORT=$((BASE_PORT + i))
    LOG_FILE="fake_arduino_$PORT.log"
    echo "📻 Starting fake IoT on port $PORT..."
    
    # Start the process in the background
    cd "$IOT_DIR" || exit
    PORT=$PORT node src/index.js > "../$LOG_FILE" 2>&1 &
    cd ..
    
    echo "✅ Fake IoT on port $PORT started. Log: $LOG_FILE"
done

echo "🌟 All $COUNT fake IoT devices are running."
echo "Check logs for more details (e.g., tail -f fake_arduino_3000.log)"
