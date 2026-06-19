import os
import numpy as np
import tensorflow as tf
from data_processor import DataProcessor
from models.lstm_model import create_lstm_model

def generate_test_data(n_points=500):
    """Generates a predictable sine wave with noise, similar to the fake sensors."""
    time = np.linspace(0, 10 * np.pi, n_points)
    # 25 degrees baseline, +/- 5 degrees oscillation
    base = 25.0
    amplitude = 5.0
    noise = np.random.normal(0, 0.2, n_points) # 0.2 degree noise
    data = base + amplitude * np.sin(time) + noise
    return data.tolist()

def run_accuracy_test():
    print("🚀 Starting AI Accuracy Test...")
    
    # 1. Generate data
    data = generate_test_data(600)
    train_size = int(len(data) * 0.8)
    train_data = data[:train_size]
    test_data = data[train_size:]
    
    print(f"📊 Dataset: {len(data)} points total. Training on {len(train_data)}, Testing on {len(test_data)}.")

    # 2. Process Data
    processor = DataProcessor()
    X_train, y_train, _ = processor.prepare_data(train_data)
    X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

    # 3. Train Model
    print("🧠 Training LSTM model (this might take a few seconds)...")
    model = create_lstm_model((X_train.shape[1], 1))
    model.fit(X_train, y_train, epochs=20, batch_size=32, verbose=0)
    print("✅ Training complete.")

    # 4. Evaluate (Step-by-step prediction)
    print("🔮 Evaluating accuracy on unseen test data...")
    errors = []
    
    # Use the last 10 points of training as start for test evaluation
    current_window = train_data[-10:]
    
    for i in range(len(test_data)):
        actual = test_data[i]
        
        # Prepare input for prediction
        X_input = processor.transform_input(current_window)
        
        # Predict
        pred_scaled = model.predict(X_input, verbose=0)
        prediction = processor.inverse_transform(pred_scaled)
        
        # Calculate Absolute Error
        error = abs(prediction - actual)
        errors.append(error)
        
        # Move window forward using ACTUAL values (Teacher Forcing evaluation style)
        current_window.pop(0)
        current_window.append(actual)

    # 5. Summary
    mae = np.mean(errors)
    max_err = np.max(errors)
    accuracy = 100 * (1 - (mae / 25.0)) # Percentage based on average 25 degrees
    
    print("\n" + "="*40)
    print("       AI PREDICTION ACCURACY REPORT")
    print("="*40)
    print(f"Average Error (MAE): {mae:.4f} °C")
    print(f"Worst Case Error:    {max_err:.4f} °C")
    print(f"Estimated Accuracy:  {accuracy:.2f} %")
    print("="*40)
    
    if mae < 1.0:
        print("🎉 EXCELLENT: Model tracks the trend with < 1°C error.")
    elif mae < 2.0:
        print("👍 GOOD: Model captures the general movement.")
    else:
        print("⚠️ LOOSE: Model might need more training data or less noise.")

if __name__ == "__main__":
    run_accuracy_test()
