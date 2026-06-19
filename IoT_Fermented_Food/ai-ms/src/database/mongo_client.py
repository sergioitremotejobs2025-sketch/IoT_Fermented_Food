import os
from pymongo import MongoClient

def get_db():
    user = os.getenv('MONGO_USERNAME', 'root')
    password = os.getenv('MONGO_PASSWORD', 'f001de9f90e1eae14f8eff7782c2f811')
    host = os.getenv('MONGO_URL', 'mongo')
    db_name = os.getenv('MONGO_DB', 'iot')
    
    client = MongoClient(f'mongodb://{user}:{password}@{host}/')
    return client[db_name]
