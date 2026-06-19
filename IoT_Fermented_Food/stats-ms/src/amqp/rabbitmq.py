import pika
import time
from config.config import RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USERNAME

import pika
import time
import os
from config.config import RABBITMQ_HOST, RABBITMQ_PASSWORD, RABBITMQ_PORT, RABBITMQ_USERNAME

def get_channel():
    attempts = 0
    max_attempts = 10
    while attempts < max_attempts:
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USERNAME, RABBITMQ_PASSWORD)
            connection = pika.BlockingConnection(
                pika.ConnectionParameters(RABBITMQ_HOST, int(RABBITMQ_PORT), '/', credentials, heartbeat=600))
            channel = connection.channel()
            print("Successfully connected to a new RabbitMQ channel")
            return channel
        except Exception as e:
            attempts += 1
            wait = min(attempts * 2, 30)
            print(f"RabbitMQ connection failed: {str(e)}. Retrying in {wait}s...")
            time.sleep(2)
    
    raise Exception("Could not connect to RabbitMQ after maximum attempts")
