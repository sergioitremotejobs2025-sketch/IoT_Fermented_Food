import pytest
from unittest.mock import MagicMock, patch
from database.dao import Dao
from amqp.rabbitmq import get_channel
from amqp.queue import Queue
from main import app, main
import json

# Test Dao
@patch('database.dao.MongoClient')
def test_dao(mock_client):
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_client.return_value.__getitem__.return_value = mock_db
    mock_db.__getitem__.return_value = mock_collection
    
    dao = Dao('test_collection')
    
    # Test insert
    doc = {'test': 'data'}
    dao.insert_document(doc)
    mock_collection.insert_one.assert_called_with(doc)
    
    # Test update
    query = {'id': 1}
    update = {'val': 2}
    mock_collection.update_one.return_value.matched_count = 1
    count = dao.update_document(query, update)
    assert count == 1
    mock_collection.update_one.assert_called_with(query, {'$set': update})

# Test RabbitMQ/Queue
@patch('amqp.rabbitmq.pika.BlockingConnection')
def test_rabbitmq_get_channel(mock_conn):
    import amqp.rabbitmq as rabbitmq
    rabbitmq.channel = None # Reset global channel
    
    mock_channel = MagicMock()
    mock_conn.return_value.channel.return_value = mock_channel
    
    ch = get_channel()
    assert ch == mock_channel
    mock_conn.assert_called_once()
    
    # Test connection retries
    mock_channel2 = MagicMock()
    def side_effect_func(*args, **kwargs):
        side_effect_func.calls += 1
        if side_effect_func.calls <= 2:
            raise Exception("error")
        m = MagicMock()
        m.channel.return_value = mock_channel2
        return m
    side_effect_func.calls = 0
    mock_conn.side_effect = side_effect_func
    
    import amqp.rabbitmq as rabbitmq
    rabbitmq.time.sleep = MagicMock()  # prevent sleeping
    ch2 = get_channel()
    assert ch2 == mock_channel2
    # mock_conn is called 1 time in the first test + 3 times in the second
    assert mock_conn.call_count == 4

@patch('amqp.queue.get_channel')
def test_queue_processing(mock_get_channel):
    mock_channel = MagicMock()
    mock_get_channel.return_value = mock_channel
    
    mock_controller = MagicMock()
    mock_controller.queue = 'test_queue'
    mock_controller.max_items = 2
    mock_controller.calculate_stats.return_value = {'ip': '1.1.1.1', 'avg': 10}
    
    # Helper to capture the internal callback
    callback_capture = []
    def mock_consume(queue, auto_ack, on_message_callback):
        callback_capture.append(on_message_callback)
    
    mock_channel.basic_consume.side_effect = mock_consume
    
    # Instantiate Queue
    # We need to mock start_consuming to not block.
    mock_channel.start_consuming.side_effect = Exception("Stop blocking")
    
    try:
        q = Queue(mock_controller)
    except Exception as e:
        if str(e) != "Stop blocking": raise e
             
    cb = callback_capture[0]
    
    # Mock AMQP message
    mock_method = MagicMock()
    mock_props = MagicMock()
    
    # Test "stream is None" branch
    body1 = json.dumps({'ip': '1.1.1.1', 'value': 10, 'username': 'test'}).encode()
    cb(mock_channel, mock_method, mock_props, body1)
    
    # Test "stream is not None" branch and "len(stream) == controller.max_items"
    body2 = json.dumps({'ip': '1.1.1.1', 'value': 20, 'username': 'test'}).encode()
    cb(mock_channel, mock_method, mock_props, body2)
    
    mock_controller.calculate_stats.assert_called_once()
    mock_controller.dao.insert_document.assert_called_once_with({'ip': '1.1.1.1', 'avg': 10})

# Test Flask app
@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.get_json() == {"status": "ok", "service": "stats-ms"}

def test_metrics(client):
    res = client.get('/metrics')
    assert res.status_code == 200
    assert 'python_info' in res.data.decode()

# Test __main__.main
@patch('main.Thread')
@patch('main.Queue')
def test_main_startup(mock_q, mock_t):
    # Call main
    main()
    # 1 thread for metrics + 3 threads for controllers
    assert mock_t.call_count == 4
    # Check that Queue was passed as target in some thread calls
    queue_targets = [call.kwargs.get('target') for call in mock_t.call_args_list if call.kwargs.get('target') == mock_q]
    # Since we patched __main__.Queue, and main() uses Thread(target=Queue, ...), it should work.
    # Wait, the 4 calls are:
    # 1. Thread(target=run_metrics)
    # 2. Thread(target=Queue, args=(controller, )) x 3
    targets = [call.kwargs.get('target') for call in mock_t.call_args_list]
    assert mock_q in targets
