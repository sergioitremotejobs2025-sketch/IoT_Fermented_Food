from statistics import fmean
from measures.measure import Measure
from models import MeasureData, LightStats

class Light(Measure):
    def __init__(self, queue_collection, max_items):
        super().__init__(queue_collection, max_items)

    def calculate_stats(self, data):
        # Validate input data
        validated_data = [MeasureData(**d).model_dump() for d in data]

        dates = [ d.get('date') for d in validated_data ]
        digital_values = [ d.get('digital_value') for d in validated_data ]
        timestamps = [ d.get('timestamp') for d in validated_data ]

        init_date, end_date = min(dates), max(dates)
        init_timestamp, end_timestamp = min(timestamps), max(timestamps)
        time_span = end_timestamp - init_timestamp

        mean_value = fmean(digital_values)

        n_samples = len(validated_data)

        sensor = validated_data[0].get('sensor')
        username = validated_data[0].get('username')
        ip = validated_data[0].get('ip')
        measure = validated_data[0].get('measure')
        jurisdiction = validated_data[0].get('jurisdiction')

        stats = {
            'digital_values': digital_values,
            'end_date': end_date,
            'end_timestamp': end_timestamp,
            'init_date': init_date,
            'init_timestamp': init_timestamp,
            'ip': ip,
            'mean_value': round(mean_value, 1),
            'measure': measure,
            'n_samples': n_samples,
            'sensor': sensor,
            'time_span': time_span,
            'username': username,
            'jurisdiction': jurisdiction
        }

        # Validate output stats
        return LightStats(**stats).model_dump()
