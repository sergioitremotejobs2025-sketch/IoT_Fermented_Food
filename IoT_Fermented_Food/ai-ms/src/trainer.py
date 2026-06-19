import os


import numpy as np
from datetime import datetime
from database.mongo_client import get_db
from data_processor import DataProcessor
from models.lstm_model import create_lstm_model

class Trainer:
    def __init__(self, username, ip, measure, limit=1000):
        self.username = username
        self.ip = ip
        self.measure = measure
        self.limit = limit
        self.db = get_db()
        self.processor = DataProcessor()

    def fetch_history(self):
        # Fetch data from collection (try singular then plural)
        target_coll = self.measure
        collection = self.db[target_coll]
        print(f"[ai-ms] Checking singular collection '{target_coll}' for {self.username} @ {self.ip}")
        
        if collection.count_documents({"username": self.username, "ip": self.ip}) == 0:
            # Handle Mongoose pluralization rules
            if self.measure.endswith('y'):
                plural = self.measure[:-1] + 'ies'
            else:
                plural = self.measure + 's'

            print(f"[ai-ms] No data in singular, re-checking with plural '{plural}'")
            if plural in self.db.list_collection_names():
                target_coll = plural
                collection = self.db[target_coll]
            else:
                print(f"[ai-ms] Plural collection '{plural}' not found in {self.db.list_collection_names()}")

        print(f"[ai-ms] Using collection '{target_coll}'")
        cursor = collection.find(
            {"username": self.username, "ip": self.ip}
        ).sort("timestamp", -1).limit(self.limit)

        values = []

        for doc in cursor:
            # Check for bulk stats (non-empty list)
            if 'real_values' in doc and isinstance(doc['real_values'], list) and len(doc['real_values']) > 0:
                values.extend(reversed(doc['real_values']))
            # Check for individual points
            elif 'real_value' in doc:
                values.append(doc['real_value'])

        
        # Reverse to get chronological order
        values.reverse()
        return values

    def train(self):
        data = self.fetch_history()
        if not data or len(data) < 20:
            msg = f"Insufficient data for {self.username} - {self.ip} (got {len(data)}, need 20)"
            print(msg)
            return False, msg

        X, y, scaler = self.processor.prepare_data(data)
        if X is None:
            return False, "Data processing failed"

        # Reshape for LSTM: (samples, time_steps, features)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))

        model = create_lstm_model((X.shape[1], 1))
        model.fit(X, y, epochs=20, batch_size=32, verbose=0)
        
        # Save model
        model_dir = os.getenv('MODEL_DIR', 'models')
        model_path = os.path.join(model_dir, f"{self.username}_{self.ip}_{self.measure}.h5")
        os.makedirs(model_dir, exist_ok=True)
        model.save(model_path)
        print(f"Model saved to {model_path}")
        return True, "Training completed"
