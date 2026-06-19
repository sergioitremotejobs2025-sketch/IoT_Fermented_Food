from config.config import QUEUE_HUMIDITY_NAME, QUEUE_LIGHT_NAME, QUEUE_TEMPERATURE_NAME
from measures.humidity import Humidity
from measures.light import Light
from measures.temperature import Temperature
from amqp.queue import Queue
from threading import Thread
import os
from flask import Flask, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from flasgger import Swagger

app = Flask(__name__)
swagger = Swagger(app)

@app.route('/health')
def health():
    """
    Health Check Endpoint
    ---
    responses:
      200:
        description: Service status
    """
    return {"status": "ok", "service": "stats-ms"}

@app.route('/metrics')
def metrics():
    """
    Metrics Endpoint
    ---
    responses:
      200:
        description: Prometheus metrics
    """
    return Response(generate_latest(), mimetype=CONTENT_TYPE_LATEST)

controllers = [
    Humidity(QUEUE_HUMIDITY_NAME, 5),
    Light(QUEUE_LIGHT_NAME, 5),
    Temperature(QUEUE_TEMPERATURE_NAME, 5)
]

def run_metrics(): # pragma: no cover
    port = int(os.environ.get('METRICS_PORT', 3000))
    app.run(host='0.0.0.0', port=port)

def main():
    print('main')
    # Start metrics server in a separate thread
    Thread(target=run_metrics).start()
    
    for controller in controllers:
        Thread(target=Queue, args=(controller, )).start()

if __name__ == '__main__': # pragma: no cover
    main()
