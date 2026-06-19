import pytest
from unittest.mock import patch, MagicMock
import pika

from amqp.rabbitmq import get_channel

@patch('amqp.rabbitmq.pika.BlockingConnection')
def test_get_channel_success(mock_blocking_connection):
    # Reset global channel
    import amqp.rabbitmq as rmq
    rmq.channel = None

    mock_connection = MagicMock()
    mock_channel = MagicMock()
    mock_connection.channel.return_value = mock_channel
    mock_blocking_connection.return_value = mock_connection

    # Should succeed first time
    channel = get_channel()
    assert channel is not None
    assert mock_blocking_connection.call_count == 1

@patch('amqp.rabbitmq.pika.BlockingConnection')
def test_get_channel_retries_and_fails(mock_blocking_connection):
    # Reset global channel
    import amqp.rabbitmq as rmq
    rmq.channel = None

    mock_blocking_connection.side_effect = Exception("Connection failed")

    with pytest.raises(Exception, match="Could not connect to RabbitMQ after maximum attempts"):
        get_channel()
        
    assert mock_blocking_connection.call_count == 10
