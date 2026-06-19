import pytest
from unittest.mock import MagicMock, patch
from trainer import Trainer
import numpy as np

def test_trainer_not_enough_data(mock_mongo):
    # Setup mock data in mongo (less than 20 records)
    collection = mock_mongo['temperatures']
    collection.insert_one({"username": "test_user", "ip": "1.1.1.1", "real_value": 25.0, "timestamp": 1})
    
    trainer = Trainer("test_user", "1.1.1.1", "temperatures")
    result, _ = trainer.train()
    assert result is False

@patch('trainer.create_lstm_model')
@patch('os.makedirs')
def test_trainer_success(mock_makedirs, mock_create_model, mock_mongo):
    # Setup mock data (25 records)
    collection = mock_mongo['temperatures']
    for i in range(25):
        collection.insert_one({
            "username": "test_user", 
            "ip": "1.1.1.1", 
            "real_value": float(i), 
            "timestamp": i
        })
    
    # Mock model behaviors
    mock_model = MagicMock()
    mock_create_model.return_value = mock_model
    
    trainer = Trainer("test_user", "1.1.1.1", "temperatures")
    result, _ = trainer.train()
    assert result is True
    assert mock_create_model.called
    assert mock_model.fit.called
    assert mock_model.save.called

def test_trainer_processor_returns_none(mock_mongo):
    trainer = Trainer("user", "ip", "measure")
    # Mock processor to return None
    trainer.processor.prepare_data = MagicMock(return_value=(None, None, None))
    # Fill with enough data to pass the first check
    trainer.fetch_history = MagicMock(return_value=[1.0]*30)
    
    result, _ = trainer.train()
    assert result is False

def test_fetch_history_singular_to_plural(mock_mongo):
    # Test checking 'humidity', finding nothing, falling back to 'humidities'
    # Mock the list_collection_names to return the plural collection
    mock_mongo.list_collection_names = MagicMock(return_value=['humidities'])
    plural_coll = mock_mongo['humidities']
    plural_coll.insert_one({"username": "u1", "ip": "1.1.1.1", "real_value": 42.0, "timestamp": 1})
    
    trainer = Trainer("u1", "1.1.1.1", "humidity")
    trainer.db = mock_mongo
    data = trainer.fetch_history()
    assert len(data) == 1
    assert data[0] == 42.0

def test_fetch_history_plural_not_found(mock_mongo):
    # Test fallback to plural but plural doesn't exist
    mock_mongo.list_collection_names = MagicMock(return_value=[])
    
    trainer = Trainer("u1", "1.1.1.1", "humidity")
    trainer.db = mock_mongo
    data = trainer.fetch_history()
    assert len(data) == 0

def test_fetch_history_singular_to_plural_non_y(mock_mongo):
    # Test checking 'temperature', falling back to 'temperatures'
    mock_mongo.list_collection_names = MagicMock(return_value=['temperatures'])
    plural_coll = mock_mongo['temperatures']
    plural_coll.insert_one({"username": "u1", "ip": "1.1.1.1", "real_value": 25.0, "timestamp": 1})
    
    trainer = Trainer("u1", "1.1.1.1", "temperature")
    trainer.db = mock_mongo
    data = trainer.fetch_history()
    assert len(data) == 1
    assert data[0] == 25.0

def test_fetch_history_bulk_stats(mock_mongo):
    # Test extraction from real_values array 
    coll = mock_mongo['temperatures']
    # Insert document with real_values
    coll.insert_one({"username": "u1", "ip": "1.1.1.1", "real_values": [25.0, 26.0], "timestamp": 1})
    
    trainer = Trainer("u1", "1.1.1.1", "temperatures")
    trainer.db = mock_mongo
    data = trainer.fetch_history()
    assert len(data) == 2
    # Ensure they were extracted correctly (handling the reverse logic)
    # The logic in fetch_history is:
    # values.extend(reversed(doc['real_values'])) -> values=[26.0, 25.0]
    # Then values.reverse() at the end -> values=[25.0, 26.0]
    assert data == [25.0, 26.0]
