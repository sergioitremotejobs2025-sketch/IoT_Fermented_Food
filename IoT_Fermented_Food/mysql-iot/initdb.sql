CREATE DATABASE IF NOT EXISTS iot;

CREATE TABLE IF NOT EXISTS iot.users (
  username VARCHAR(256) NOT NULL PRIMARY KEY,
  password VARCHAR(256) NOT NULL,
  refresh_token VARCHAR(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS iot.microcontrollers (
  username VARCHAR(256) NOT NULL,
  ip VARCHAR(256) NOT NULL,
  measure VARCHAR(256) NOT NULL,
  sensor VARCHAR(256) NOT NULL,
  jurisdiction VARCHAR(10) DEFAULT 'EU',
  thresholdMin DOUBLE DEFAULT 0,
  thresholdMax DOUBLE DEFAULT 0,
  gateway_id VARCHAR(256) DEFAULT NULL,
  paired_at DATETIME DEFAULT NULL,
  PRIMARY KEY (username, ip, measure),
  FOREIGN KEY (username) REFERENCES iot.users(username)
);

INSERT INTO iot.users VALUES (
  'Rocky',
  'e7f5d4066c9f8195959866aa6915027679384f97ed822a03b8b1b3ce4ecfae5b',
  ''
);

INSERT INTO iot.microcontrollers (username, ip, measure, sensor) VALUES (
  'Rocky',
  '192.168.1.50',
  'temperature',
  'Grove - Temperature'
);

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'my-secret-pw';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'my-secret-pw';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
