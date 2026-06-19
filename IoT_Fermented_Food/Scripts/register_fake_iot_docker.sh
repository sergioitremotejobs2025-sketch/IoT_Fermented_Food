#!/bin/bash
# register_fake_iot_docker.sh

USER="${1:-Rocky}"
DB_PASS="my-secret-pw"
CONTAINER_NAME="iot_mysql_test"

run_sql() {
  docker exec "$CONTAINER_NAME" mysql -u root -p"$DB_PASS" -e "$1"
}

echo "👤 Ensuring user '$USER' exists..."
# Password hash for 'Rocky' is already in initdb.sql, but we ensure it just in case
run_sql "INSERT IGNORE INTO iot.users (username, password, refresh_token) VALUES ('$USER', 'e7f5d4066c9f8195959866aa6915027679384f97ed822a03b8b1b3ce4ecfae5b', '');"

echo "📡 Registering microcontrollers for localhost/host.docker.internal..."

# Temperature sensors on 3100, 3102, 3104
for port in 3100 3102 3104; do
  run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('$USER', 'host.docker.internal:$port', 'temperature', 'Fake Temp $port');"
done

# Humidity sensors on 3101, 3103
for port in 3101 3103; do
  run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('$USER', 'host.docker.internal:$port', 'humidity', 'Fake Humidity $port');"
done

# Picture sensor on 3105
run_sql "INSERT IGNORE INTO iot.microcontrollers (username, ip, measure, sensor) VALUES ('$USER', 'host.docker.internal:3105', 'pictures', 'Fake Camera 3105');"

echo "✅ Registration complete for user '$USER'."
