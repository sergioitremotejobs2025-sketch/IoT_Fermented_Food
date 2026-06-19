import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

class DataProcessor:
    def __init__(self, look_back=10):
        self.look_back = look_back
        self.scaler = MinMaxScaler(feature_range=(0, 1))

    def prepare_data(self, data):
        """
        data: list of numerical values
        returns: (X, y, scaler)
        """
        if len(data) <= self.look_back:
            return None, None, None
            
        values = np.array(data).reshape(-1, 1)
        scaled_values = self.scaler.fit_transform(values)
        
        X, y = [], []
        for i in range(len(scaled_values) - self.look_back):
            X.append(scaled_values[i:(i + self.look_back), 0])
            y.append(scaled_values[i + self.look_back, 0])
            
        return np.array(X), np.array(y), self.scaler

    def transform_input(self, input_data):
        """
        Transforms raw input data for prediction.
        """
        recent_data = input_data[-self.look_back:] # Ensure we have exactly look_back elements
        values = np.array(recent_data).reshape(-1, 1)
        return self.scaler.transform(values).reshape(1, self.look_back, 1)


    def inverse_transform(self, prediction):
        """
        Converts scaled prediction back to original scale.
        """
        return self.scaler.inverse_transform(prediction.reshape(-1, 1))[0, 0]
