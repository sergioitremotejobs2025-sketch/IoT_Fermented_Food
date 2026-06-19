import os
import pytest
from unittest.mock import patch, MagicMock
from database.mongo_client import get_db
from models.lstm_model import create_lstm_model

def test_get_db_custom_env(monkeypatch):
    monkeypatch.setenv('MONGO_USERNAME', 'test_user')
    monkeypatch.setenv('MONGO_PASSWORD', 'test_pass')
    monkeypatch.setenv('MONGO_URL', 'localhost')
    monkeypatch.setenv('MONGO_DB', 'test_db')
    
    with patch('database.mongo_client.MongoClient') as mock_client:
        db = get_db()
        # Verify connection string
        mock_client.assert_called_with('mongodb://test_user:test_pass@localhost/')
        # Verify db name
        assert db == mock_client.return_value['test_db']

@patch('models.lstm_model.Sequential')
@patch('models.lstm_model.LSTM')
@patch('models.lstm_model.Dense')
@patch('models.lstm_model.Dropout')
def test_create_lstm_model_structure(mock_dropout, mock_dense, mock_lstm, mock_sequential):
    mock_model = MagicMock()
    mock_sequential.return_value = mock_model
    
    model = create_lstm_model((10, 1))
    
    assert mock_sequential.called
    assert mock_model.compile.called
    assert model == mock_model
