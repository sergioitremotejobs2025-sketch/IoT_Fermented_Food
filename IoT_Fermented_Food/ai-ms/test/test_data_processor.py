import pytest
import numpy as np
from data_processor import DataProcessor

def test_prepare_data_insufficient_data():
    processor = DataProcessor(look_back=10)
    data = [1.0] * 10
    X, y, scaler = processor.prepare_data(data)
    assert X is None
    assert y is None
    assert scaler is None

def test_prepare_data_scaling():
    processor = DataProcessor(look_back=5)
    data = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0]
    X, y, scaler = processor.prepare_data(data)
    
    # Check if values in X and y are scaled between 0 and 1
    assert np.all(X >= 0) and np.all(X <= 1)
    assert y >= 0 and y <= 1

def test_prepare_data_shape():
    look_back = 5
    processor = DataProcessor(look_back=look_back)
    data = list(range(20))
    X, y, scaler = processor.prepare_data(data)
    
    # N = total - look_back = 20 - 5 = 15
    assert X.shape == (15, look_back)
    assert y.shape == (15,)

def test_transform_input_shape():
    look_back = 5
    processor = DataProcessor(look_back=look_back)
    data = [1.0] * 10 # More than enough
    processor.prepare_data(data) # To fit the scaler
    
    input_to_transform = [1.0, 2.0, 3.0, 4.0, 5.0]
    transformed = processor.transform_input(input_to_transform)
    
    # Should be (1, look_back, 1) for LSTM
    assert transformed.shape == (1, look_back, 1)

def test_inverse_transform():
    processor = DataProcessor()
    data = np.array([[10.0], [20.0]])
    processor.scaler.fit(data)
    
    # Scale a value manually
    scaled = np.array([[0.5]]) # Midpoint between 10 and 20 is 15
    result = processor.inverse_transform(scaled)
    assert result == pytest.approx(15.0)
