import os
from flask import Flask, request, jsonify
from trainer import Trainer
from data_processor import DataProcessor
from tensorflow.keras.models import load_model
import numpy as np

from functools import wraps

app = Flask(__name__)

def require_internal_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        expected_key = os.getenv('INTERNAL_API_KEY')
        if not expected_key:
            return f(*args, **kwargs) # Skip if not set in environment (dev mode)
        
        request_key = request.headers.get('x-internal-api-key')
        if request_key != expected_key:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/train', methods=['POST'])
@require_internal_key
def train_model():
    data = request.json
    username = data.get('username')
    ip = data.get('ip')
    measure = data.get('measure')
    limit = int(data.get('limit', 1000))
    
    if not all([username, ip, measure]):
        return jsonify({"error": "Missing parameters"}), 400
        
    trainer = Trainer(username, ip, measure, limit=limit)
    success, message = trainer.train()
    
    if success:
        return jsonify({"message": message}), 200
    else:
        status_code = 400 if "Insufficient data" in message else 500
        return jsonify({"error": message}), status_code

@app.route('/predict', methods=['POST'])
@require_internal_key
def predict():
    data = request.json
    username = data.get('username')
    ip = data.get('ip')
    measure = data.get('measure')
    recent_values = data.get('recent_values') # List of last 'look_back' values
    
    if not all([username, ip, measure, recent_values]):
        return jsonify({"error": "Missing parameters"}), 400
        
    model_dir = os.getenv('MODEL_DIR', 'models')
    model_path = os.path.join(model_dir, f"{username}_{ip}_{measure}.h5")
    print(f"[ai-ms] PREDICT Request: {username} - {ip} - {measure} (path: {model_path})")
    print(f"[ai-ms] Recent values: {recent_values}")
    
    if not os.path.exists(model_path):
        existing = os.listdir(model_dir) if os.path.exists(model_dir) else []
        print(f"[ai-ms] ERROR: Model not found at {model_path}. Existing models in {model_dir}: {existing}")
        return jsonify({"error": "Modelo no encontrado: entrénalo primero"}), 404
        
    try:
        model = load_model(model_path, compile=False)

        processor = DataProcessor()
        
        # We need to re-fit the scaler optimally we'd save the scaler state too
        # For simplicity in this demo, we'll use the provided recent values to scale
        # In a real app, we'd persist the MinMaxScaler state per model.
        
        # Mocking the scaling for now with simple normalization
        # or better: we should have saved the scaler.
        
        # Let's assume the processor handles it (simplified)
        processor = DataProcessor()
        
        # FIT the scaler with these values first to avoid NotFittedError
        # In a real app we'd save/load the scaler.
        processor.scaler.fit(np.array(recent_values).reshape(-1, 1))
        
        X_input = processor.transform_input(recent_values)
        
        prediction_scaled = model.predict(X_input)
        prediction = processor.inverse_transform(prediction_scaled)
        
        return jsonify({"prediction": float(prediction)}), 200
    except Exception as e:
        print(f"[ai-ms] PREDICT ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/evaluate', methods=['POST'])
@require_internal_key
def evaluate():
    data = request.json
    username = data.get('username')
    ip = data.get('ip')
    measure = data.get('measure')
    
    if not all([username, ip, measure]):
        return jsonify({"error": "Missing parameters"}), 400
        
    model_dir = os.getenv('MODEL_DIR', 'models')
    model_path = os.path.join(model_dir, f"{username}_{ip}_{measure}.h5")
    if not os.path.exists(model_path):
        return jsonify({"error": "Model not found"}), 404
        
    try:
        trainer = Trainer(username, ip, measure, limit=100)
        history = trainer.fetch_history()
        
        if len(history) < 30:
            return jsonify({"error": "Insufficient data for evaluation"}), 400
            
        model = load_model(model_path, compile=False)

        processor = DataProcessor()
        X, y, _ = processor.prepare_data(history)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        predictions_scaled = model.predict(X)
        predictions = processor.inverse_transform(predictions_scaled)
        actuals = processor.inverse_transform(y.reshape(-1, 1))
        
        mae = np.mean(np.abs(predictions - actuals))
        
        return jsonify({
            "mae": float(mae),
            "sample_count": len(actuals)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def start_app():
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)

if __name__ == '__main__': # pragma: no cover
    start_app()
