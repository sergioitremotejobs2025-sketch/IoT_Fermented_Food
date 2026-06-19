#!/bin/bash

# Configuration
PORT=3005
PICTURES_DIR="fake-arduino-iot-pictures"
LOG_FILE="fake_arduino_pictures.log"

echo "📸 Starting fake IoT pictures service..."

# Kill any existing process on this port
PID=$(lsof -t -i:$PORT)
if [ -n "$PID" ]; then
    echo "Stopping existing process on port $PORT (PID: $PID)..."
    kill -9 $PID 2>/dev/null
fi

cd "$PICTURES_DIR" || exit
PORT=$PORT node src/server.js > "../$LOG_FILE" 2>&1 &
cd ..

echo "✅ Fake IoT pictures service started on port $PORT. Log: $LOG_FILE"
echo "Check log for more details: tail -f $LOG_FILE"
