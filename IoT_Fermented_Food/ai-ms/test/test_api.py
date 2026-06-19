import pytest
import numpy as np
from main import app as flask_app
from unittest.mock import patch, MagicMock

@pytest.fixture
def client():
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client

def test_predict_invalid_input(client):
    # Missing data
    res = client.post('/predict', json={})
    assert res.status_code == 400

def test_api_key_required(client, monkeypatch):
    # Should require internal API key
    monkeypatch.setenv('INTERNAL_API_KEY', 'testkey')
    res = client.post('/predict', json={})
    assert res.status_code == 401

def test_api_key_valid(client, monkeypatch):
    monkeypatch.setenv('INTERNAL_API_KEY', 'testkey')
    res = client.post('/predict', json={}, headers={'x-internal-api-key': 'testkey'})
    # It should pass authentication and then fail for missing body (400)
    assert res.status_code == 400

@patch('main.Trainer')
def test_train_endpoint(mock_trainer_class, client):
    mock_trainer = MagicMock()
    mock_trainer.train.return_value = (True, "Training completed")
    mock_trainer_class.return_value = mock_trainer
    
    payload = {
        "username": "test_user",
        "ip": "1.1.1.1",
        "measure": "temperatures"
    }
    res = client.post('/train', json=payload)
    assert res.status_code == 200
    assert res.get_json()['message'] == "Training completed"

@patch('main.Trainer')
@patch('main.DataProcessor')
@patch('main.load_model')
@patch('os.path.exists')
def test_predict_success(mock_exists, mock_load_model, mock_processor_class, mock_trainer_class, client):
    # Mocking the pipeline
    mock_exists.return_value = True
    
    mock_processor = MagicMock()
    mock_processor.transform_input.return_value = np.zeros((1, 10, 1))
    mock_processor.inverse_transform.return_value = 25.5
    mock_processor_class.return_value = mock_processor
    
    mock_model_obj = MagicMock()
    mock_model_obj.predict.return_value = np.array([[0.5]])
    mock_load_model.return_value = mock_model_obj
    
    payload = {
        "username": "test_user",
        "ip": "1.1.1.1",
        "measure": "temperatures",
        "recent_values": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    }
    
    res = client.post('/predict', json=payload)
    assert res.status_code == 200
    assert res.get_json()['prediction'] == 25.5

def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == "healthy"

@patch('main.Trainer')
def test_train_missing_params(mock_trainer, client):
    res = client.post('/train', json={"username": "test"})
    assert res.status_code == 400

@patch('main.Trainer')
def test_train_failure(mock_trainer_class, client):
    mock_trainer = MagicMock()
    mock_trainer.train.return_value = (False, "Training failed")
    mock_trainer_class.return_value = mock_trainer
    res = client.post('/train', json={"username": "u", "ip": "i", "measure": "m"})
    assert res.status_code == 500

@patch('os.listdir')
@patch('os.path.exists')
def test_predict_not_found(mock_exists, mock_listdir, client):
    mock_exists.return_value = False
    mock_listdir.return_value = []
    res = client.post('/predict', json={"username": "u", "ip": "i", "measure": "m", "recent_values": [1]})
    assert res.status_code == 404

@patch('os.path.exists')
@patch('main.load_model')
def test_predict_exception(mock_load, mock_exists, client):
    mock_exists.return_value = True
    mock_load.side_effect = Exception("Boom")
    res = client.post('/predict', json={"username": "u", "ip": "i", "measure": "m", "recent_values": [1]})
    assert res.status_code == 500

@patch('main.app.run')
@patch('os.getenv')
def test_start_app(mock_getenv, mock_run):
    from main import start_app
    mock_getenv.return_value = "5001"
    start_app()
    assert mock_run.called
    assert mock_run.call_args[1]['port'] == 5001

@patch('os.path.exists')
def test_evaluate_missing_params(mock_exists, client):
    res = client.post('/evaluate', json={"username": "u"})
    assert res.status_code == 400

@patch('os.path.exists')
def test_evaluate_model_not_found(mock_exists, client):
    mock_exists.return_value = False
    res = client.post('/evaluate', json={"username": "u", "ip": "i", "measure": "m"})
    assert res.status_code == 404

@patch('os.path.exists')
@patch('main.Trainer')
def test_evaluate_insufficient_data(mock_trainer_class, mock_exists, client):
    mock_exists.return_value = True
    mock_trainer = MagicMock()
    mock_trainer.fetch_history.return_value = [1] * 10 # Less than 30
    mock_trainer_class.return_value = mock_trainer
    
    res = client.post('/evaluate', json={"username": "u", "ip": "i", "measure": "m"})
    assert res.status_code == 400
    assert "Insufficient data" in res.get_json()['error']

@patch('os.path.exists')
@patch('main.Trainer')
@patch('main.load_model')
@patch('main.DataProcessor')
def test_evaluate_success(mock_processor_class, mock_load, mock_trainer_class, mock_exists, client):
    mock_exists.return_value = True
    
    mock_trainer = MagicMock()
    mock_trainer.fetch_history.return_value = [1.0] * 50
    mock_trainer_class.return_value = mock_trainer
    
    mock_processor = MagicMock()
    # Mock prepare_data to return X (50, 10), y (50,), scaler
    mock_processor.prepare_data.return_value = (np.zeros((50, 10)), np.zeros(50), None)
    mock_processor.inverse_transform.side_effect = lambda x: x # Identity function
    mock_processor_class.return_value = mock_processor
    
    mock_model = MagicMock()
    mock_model.predict.return_value = np.zeros((50, 1))
    mock_load.return_value = mock_model
    
    res = client.post('/evaluate', json={"username": "u", "ip": "i", "measure": "m"})
    assert res.status_code == 200
    data = res.get_json()
    assert "mae" in data
    assert data["sample_count"] == 50

@patch('os.path.exists')
@patch('main.Trainer')
def test_evaluate_exception(mock_trainer_class, mock_exists, client):
    mock_exists.return_value = True
    mock_trainer_class.side_effect = Exception("Eval error")
    
    res = client.post('/evaluate', json={"username": "u", "ip": "i", "measure": "m"})
    assert res.status_code == 500
    assert "Eval error" in res.get_json()['error']

