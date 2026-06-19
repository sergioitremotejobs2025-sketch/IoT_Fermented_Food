import json
import pytest
from measures.humidity import Humidity
from measures.light import Light
from measures.temperature import Temperature
from amqp.queue import Queue
from unittest.mock import MagicMock, patch

def load_test_data(filename):
    with open(f'test/{filename}', 'r') as f:
        return json.load(f)

def test_humidity():
    humidity = Humidity('humidities', 60)
    assert humidity.queue == 'humidities'
    assert humidity.max_items == 60

    data = load_test_data('humidities.json')
    stats = humidity.calculate_stats(data)
    
    assert stats['measure'] == 'humidity'
    assert stats['n_samples'] == 2
    assert stats['max_value'] == 40
    assert stats['min_value'] == 20
    assert stats['mean_value'] == 30.0
    assert stats['std_deviation'] == 14.1

def test_light():
    light = Light('lights', 60)
    assert light.queue == 'lights'
    assert light.max_items == 60

    data = load_test_data('lights.json')
    stats = light.calculate_stats(data)
    
    assert stats['measure'] == 'light'
    assert stats['n_samples'] == 2
    assert stats['mean_value'] == 0.5
    assert stats['digital_values'] == [1, 0]

def test_temperature():
    temperature = Temperature('temperatures', 60)
    assert temperature.queue == 'temperatures'
    assert temperature.max_items == 60

    data = load_test_data('temperatures.json')
    stats = temperature.calculate_stats(data)
    
    assert stats['measure'] == 'temperature'
    assert stats['n_samples'] == 2
    assert stats['max_value'] == 25.4
    assert stats['min_value'] == 22.4
    assert stats['mean_value'] == 23.9
    assert stats['std_deviation'] == 2.1

@patch('amqp.queue.get_channel')
def test_queue_exception_handling(mock_get_channel):
    mock_channel = MagicMock()
    mock_get_channel.return_value = mock_channel
    
    mock_controller = MagicMock()
    mock_controller.queue = 'test_q'
    
    # Store the callback when it's registered
    callback_ref = []
    def capture_callback(*args, **kwargs):
        callback_ref.append(kwargs.get('on_message_callback'))
    mock_channel.basic_consume.side_effect = capture_callback
    
    # Instantiate Queue
    q = Queue(mock_controller)
    
    callback = callback_ref[0]
    
    # Trigger exception (invalid JSON)
    mock_method = MagicMock()
    mock_method.delivery_tag = 123
    
    # Should not raise, should call basic_nack
    callback(mock_channel, mock_method, None, b"invalid json")
    
    assert mock_channel.basic_nack.called
    assert mock_channel.basic_nack.call_args[1]['delivery_tag'] == 123
    assert mock_channel.basic_nack.call_args[1]['requeue'] == False
