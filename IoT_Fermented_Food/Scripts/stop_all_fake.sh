#!/bin/bash

echo "🛑 Stopping all fake IoT services..."

for PORT in {3000..3005}; do
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
        echo "Killing process on port $PORT (PID: $PID)..."
        kill -9 $PID 2>/dev/null
    fi
done

echo "✅ All fake IoT services stopped."
