import sys
from unittest.mock import MagicMock

# Mock tensorflow to avoid installation issues during tests
sys.modules['tensorflow'] = MagicMock()
sys.modules['tensorflow.keras'] = MagicMock()
sys.modules['tensorflow.keras.models'] = MagicMock()
sys.modules['tensorflow.keras.layers'] = MagicMock()

import pytest
import mongomock

@pytest.fixture
def mock_mongo():
    return mongomock.MongoClient().iot

@pytest.fixture(autouse=True)
def mock_get_db(monkeypatch, mock_mongo):
    import database.mongo_client
    import trainer
    monkeypatch.setattr(database.mongo_client, "get_db", lambda: mock_mongo)
    monkeypatch.setattr(trainer, "get_db", lambda: mock_mongo)
